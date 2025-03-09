import { logger, task } from "@trigger.dev/sdk/v3";
import { classifyEmail } from "~/lib/gemini";
import { fetchGmailEmail, fetchGmailInbox, getGmailClient } from "~/lib/gmail";
import { parseEmailSender } from "~/lib/utils"
import { getEmailsByAcccount, getUserCategories, upsertEmails } from "~/server/db/queries";

// Get a single email from a user's Gmail inbox and process it
export const getEmailTask = task({
  id: "get-email",
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  queue: {
    concurrencyLimit: 2,
  },
  retry: {
    maxAttempts: 1
  },
  machine: "small-2x",
  run: async (payload: { accountId: string, gmailId: string }, { ctx }) => {

    try {
      // Fetch email from Gmail using the account's access token
      const { authClient, user } = await getGmailClient(payload.accountId);


      const email = await fetchGmailEmail(authClient, payload.gmailId);

      if (!user.id) {
        throw new Error("User ID is required");
      }

      const categories = await getUserCategories(user.id);

      let emailBody = ""; // Default to empty string
      if (email.payload?.mimeType == "text/plain" || email.payload?.mimeType == "text/html") {
        emailBody = email.payload?.body?.data ? Buffer.from(email.payload.body.data, 'base64').toString('utf-8') : "";
      } else if (email.payload && email.payload.mimeType && email.payload.mimeType.startsWith("multipart/")) {
        emailBody = email.payload?.parts?.map(part => {
          if (part.mimeType == "text/plain" || part.mimeType == "text/html") {
            return part.body?.data ? Buffer.from(part.body.data, 'base64').toString('utf-8') : "";
          } else {
            return "";
          }
        }).join("\n") || "";
      }

      const summarized = await classifyEmail({
        name: user.name || "",
        email: user.email || ""
      }, {
        subject: email.payload?.headers?.find(header => header.name === "Subject")?.value || "",
        body: emailBody
      }, categories);;

      const categoryId = categories.find(category => category.name == summarized.category)?.id || null;
      const sender = parseEmailSender(email.payload?.headers?.find(header => header.name === "From")?.value || "");

      const dbEmail: Omit<Email, "updated_at" | "id"> = {
        subject: summarized.subject,
        preview: summarized.summary,
        starred: false,
        gmail_id: email.id || null,
        sender: sender.name,
        from: sender.email,
        identity_id: payload.accountId,
        user_id: user.id,
        created_at: email.internalDate ? new Date(parseInt(email.internalDate)).toISOString() : "",
        unsub_link: summarized.unsub_link != null ? summarized.unsub_link : "",
        read: !email.labelIds?.includes("UNREAD"),
        category_id: categoryId,
        to: email.payload?.headers?.find(header => header.name === "Delivered-To")?.value || "",
        content: emailBody,
      };

      await upsertEmails([dbEmail]);

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

      logger.log("Authenticated client", { authClient });
      const emails = await fetchGmailInbox(authClient);

      if (emails.length == 0) {
        return { message: "No emails found" };
      }

      // Check which emails aren't in the DB
      // Get user's emails from the DB to check which ones we already have
      const userEmails = await getEmailsByAcccount([payload.accountId]) || [];

      const existingGmailIds = new Set(userEmails.map(email => email.gmail_id));

      // Filter out emails that already exist in our database
      const newEmails = emails.filter(email => email.id && !existingGmailIds.has(email.id)).map(email => ({
        payload: {
          accountId: payload.accountId,
          gmailId: email.id || ""
        }
      }));

      if (newEmails.length > 0) {
        // Enqueue tasks to fetch each individual email
        logger.log("Batching emails", { newEmails });
        const batchHandle = await getEmailTask.batchTrigger(newEmails)
        return { batchId: batchHandle.batchId };
      }

      return { message: "No new emails found" };
    } catch (error) {
      logger.error("Error getting Gmail emails", { error });
      throw error;
    }
  },
});

