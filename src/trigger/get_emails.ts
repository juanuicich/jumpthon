import { logger, task } from "@trigger.dev/sdk/v3";
import { batch } from "googleapis/build/src/apis/batch";
import { createOAuth2Client, fetchGmailEmail, fetchGmailInbox } from "~/lib/gmail";
import { getAccountById, getEmailsByAcccount } from "~/server/db/queries";

// Get a single email from a user's Gmail inbox and process it
export const getEmailTask = task({
  id: "get-email",
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: { accountId: string, gmailId: string }, { ctx }) => {
    logger.log("Getting email for account", payload);

    try {
      // Get the account from DB using the account ID
      const account = await getAccountById(payload.accountId);

      // Fetch email from Gmail using the account's access token
      const auth = createOAuth2Client(account.access_token, account.refresh_token);
      const email = await fetchGmailEmail(auth, payload.gmailId);

      return email;
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
  run: async (payload: { accountId: string }, { ctx }) => {
    logger.log("Getting emails for account", { accountId: payload.accountId });

    try {
      // Get the account from DB using the account ID
      const account = await getAccountById(payload.accountId);

      if (!account) {
        throw new Error(`Account with ID ${payload.accountId} not found`);
      }

      if (!account.access_token) {
        throw new Error(`No access token found for account ${payload.accountId}`);
      }

      // Fetch emails from Gmail using the account's access token
      const auth = createOAuth2Client(account.access_token, account.refresh_token);
      const emails = await fetchGmailInbox(auth);

      // Check which emails aren't in the DB
      // Get user's emails from the DB to check which ones we already have
      const userEmails = await getEmailsByAcccount(account.id);
      const existingGmailIds = new Set(userEmails.map(email => email.gmailId));

      // Filter out emails that already exist in our database
      const newEmails = emails.filter(email => !existingGmailIds.has(email.id)).map(email => ({
        accountId: account.id,
        gmailId: email.id
      }));

      logger.log("Found new emails", { count: newEmails.length });

      const batchHandle = await getEmailTask.batchTrigger(newEmails);
      // Enqueue tasks to fetch each individual email

      logger.log("Successfully batched tasks", { batchId: batchHandle.batchId });

      return { batchId: batchHandle.batchId };
    } catch (error) {
      logger.error("Error getting Gmail emails", { error });
      throw error;
    }
  },
});