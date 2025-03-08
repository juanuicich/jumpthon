import { logger, task } from "@trigger.dev/sdk/v3";
import { classifyEmail } from "~/lib/gemini";
import { fetchGmailEmail, fetchGmailInbox, getAuthenticatedClient } from "~/lib/gmail";
import { parseEmailSender } from "~/lib/utils"
import { OAuth2Client } from "google-auth-library";
import { getAccountById, getEmailsByAcccount, getUserCategories, insertEmails } from "~/server/db/queries";

// Get a single email from a user's Gmail inbox and process it
export const getEmailTask = task({
  id: "get-email",
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  queue: {
    concurrencyLimit: 10,
  },
  retry: {
    maxAttempts: 1
  },
  run: async (payload: { accountId: string, gmailId: string }, { ctx }) => {
    logger.log("Getting email for account", payload);

    try {
      // Fetch email from Gmail using the account's access token
      const { authClient, user } = await getGmailClient(payload.accountId);

      logger.log("Authenticated client", user);

      const email = await fetchGmailEmail(authClient, payload.gmailId);
      const categories = await getUserCategories(user.id);

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
      }, categories);

      logger.log("LLM response", summarized);

      const categoryIds = categories.filter(category => summarized.categories.includes(category.name)).map(category => category.id);
      const sender = parseEmailSender(email.payload?.headers?.find(header => header.name === "From")?.value || "");

      const dbEmail: Email = {
        subject: summarized.subject,
        preview: summarized.summary,
        read: false,
        starred: false,
        gmail_id: email.id,
        sender: sender.name,
        from: sender.email,
        identity_id: payload.accountId,
        user_id: user.id,
        created_at: new Date(parseInt(email.internalDate)),
        unsub_link: summarized.unsub_link != null ? summarized.unsub_link : "",
        read: !email.payload?.labelIds?.includes("UNREAD"),
        category_id: categoryIds[0] || null,
        to: email.payload?.headers?.find(header => header.name === "Delivered-To")?.value || "",
        content: emailBody,
      };

      logger.log("Saving email", dbEmail);

      await insertEmails([dbEmail]);

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
      const { authClient } = await getGmailClient(payload.accountId);

      logger.log("Authenticated client", authClient);
      const emails = await fetchGmailInbox(authClient);

      if (emails.length == 0) {
        return { message: "No emails found" };
      }

      // Check which emails aren't in the DB
      // Get user's emails from the DB to check which ones we already have
      const userEmails = await getEmailsByAcccount([payload.accountId]) || [];
      logger.log("User emails", userEmails);

      const existingGmailIds = new Set(userEmails.map(email => email.gmail_id));
      logger.log("Existing Gmail IDs", existingGmailIds);

      // Filter out emails that already exist in our database
      const newEmails = emails.filter(email => !existingGmailIds.has(email.id)).map(email => ({
        payload: {
          accountId: payload.accountId,
          gmailId: email.id
        }
      }));

      if (newEmails.length > 0) {
        // Enqueue tasks to fetch each individual email
        logger.log("Batching emails", newEmails);
        const batchHandle = await getEmailTask.batchTrigger(newEmails)
        logger.log("Successfully batched tasks", { batchId: batchHandle.batchId });
        return { batchId: batchHandle.batchId };
      }

      return { message: "No new emails found" };
    } catch (error) {
      logger.error("Error getting Gmail emails", { error });
      throw error;
    }
  },
});

async function getGmailClient(accountId: string) {
  const account = await getAccountById(accountId);

  if (!account) {
    throw new Error("Account not found");
  }

  const authClient = new OAuth2Client(
    {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
      forceRefreshOnFailure: true
    }
  );

  authClient.setCredentials({
    access_token: account.access_token,
  });

  const user = {
    id: account.user_id,
    email: account.email,
    name: account.name
  }

  return { authClient, user };

}
