import { logger, task } from "@trigger.dev/sdk/v3";
import { classifyEmail } from "~/lib/gemini";
import { fetchGmailEmail, fetchGmailInbox, getAuthenticatedClient } from "~/lib/gmail";
import { getEmailsByAcccount, saveEmail } from "~/server/db/queries";
import { parseEmailSender } from "~/lib/utils"

// Get a single email from a user's Gmail inbox and process it
export const getEmailTask = task({
  id: "get-email",
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  queue: {
    concurrencyLimit: 1,
  },
  retry: {
    maxAttempts: 1
  },
  run: async (payload: { accountId: string, gmailId: string }, { ctx }) => {
    logger.log("Getting email for account", payload);

    try {
      // Fetch email from Gmail using the account's access token
      const { authClient, user } = await getAuthenticatedClient(payload.accountId);

      logger.log("Authenticated client", user);

      const email = await fetchGmailEmail(authClient, payload.gmailId);

      logger.log("Got email", email);

      let emailBody: string;
      if (email.payload?.mimeType == "text/plain" || email.payload?.mimeType == "text/html") {
        emailBody = email.payload?.body ? Buffer.from(email.payload?.body?.data, 'base64').toString('utf-8') : "";
      } else if (email.payload?.mimeType.startsWith("multipart/")) {
        emailBody = email.payload?.parts?.map(part => {
          if (part.mimeType == "text/plain" || part.mimeType == "text/html") {
            return Buffer.from(part.body?.data, 'base64').toString('utf-8');
          } else {
            return "";
          }
        }
        ).join("\n");
      }

      logger.log("Decoded body", emailBody);

      const summarized = await classifyEmail({
        name: user.name,
        email: user.email
      }, {
        subject: email.payload?.headers?.find(header => header.name === "Subject")?.value || "",
        body: emailBody
      });

      const sender = parseEmailSender(email.payload?.headers?.find(header => header.name === "From")?.value || "");

      const dbEmail = {
        subject: summarized.subject,
        preview: summarized.summary,
        read: false,
        starred: false,
        gmailId: email.id,
        sender: sender.name,
        from: sender.email,
        ownedById: payload.accountId,
        unsubLink: summarized.unsub_link,
        unread: email.payload?.labelIds?.includes("UNREAD"),
      };

      logger.log("Saving email", dbEmail);

      await saveEmail(dbEmail);

      return summarized;
    } catch (error) {
      logger.error("Error getting Gmail emails", { error });
      throw error;
    }
  }
});

// Get all emails from a user's Gmail inbox
export const getAllGmailEmailsTask = task({
  id: "get-all-gmail-emails",
  maxDuration: 300,
  retry: {
    maxAttempts: 1
  },
  run: async (payload: { accountId: string }, { ctx }) => {
    logger.log("Getting emails for account", { accountId: payload.accountId });

    try {
      // Fetch emails from Gmail using the account's access token
      const { authClient } = await getAuthenticatedClient(payload.accountId);

      logger.log("Authenticated client", authClient);
      const emails = await fetchGmailInbox(authClient);

      // Check which emails aren't in the DB
      // Get user's emails from the DB to check which ones we already have
      const userEmails = await getEmailsByAcccount(payload.accountId);
      const existingGmailIds = new Set(userEmails.map(email => email.gmailId));
      logger.log("Existing Gmail IDs", existingGmailIds);

      // Filter out emails that already exist in our database
      const newEmails = emails.filter(email => !existingGmailIds.has(email.id)).map(email => ({
        payload: {
          accountId: payload.accountId,
          gmailId: email.id
        }
      }));

      logger.log("Batching emails", newEmails);

      const batchHandle = await getEmailTask.batchTrigger(newEmails)
      // Enqueue tasks to fetch each individual email

      logger.log("Successfully batched tasks", { batchId: batchHandle.batchId });

      return { batchId: batchHandle.batchId };
    } catch (error) {
      logger.error("Error getting Gmail emails", { error });
      throw error;
    }
  },
});