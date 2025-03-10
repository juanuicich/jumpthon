import { logger, schedules, task } from "@trigger.dev/sdk/v3";
import { fetchAndProcessEmail, fetchEmailsByAcccount } from "~/lib/email";

// Get a single email from a user's Gmail inbox and process it
export const getEmailTask = task({
  id: "get-email",
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  queue: {
    concurrencyLimit: 20,
  },
  retry: {
    maxAttempts: 1
  },
  machine: "small-2x",
  run: async (payload: { accountId: string, gmailId: string }, { ctx }) => {

    try {
      await fetchAndProcessEmail(payload.accountId, payload.gmailId);
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
  machine: "medium-1x",
  run: async (payload: { accountId: string }, { ctx }) => {
    logger.log("Getting emails for account", { accountId: payload.accountId });

    try {
      // Fetch emails from Gmail using the account's access token
      const newEmails = await fetchEmailsByAcccount(payload.accountId);

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

// Get all emails from a user's Gmail inbox
export const getAllGmailEmailsCron = schedules.task({
  id: "scheduled-get-all-gmail-emails",
  maxDuration: 120,
  retry: {
    maxAttempts: 1
  },
  // cron: "0 */1 * * *", // Run every hour
  run: async (payload: { type: "DECLARATIVE" | "IMPERATIVE"; timestamp: Date; timezone: string; scheduleId: string; upcoming: Date[]; lastTimestamp?: Date; externalId?: string }, { ctx }) => {

    const accountId = payload.externalId;
    if (!accountId) {
      throw new Error("Account ID is required");
    }

    logger.log("Getting emails for account", { accountId: accountId });

    try {
      // Fetch emails from Gmail using the account's access token
      const newEmails = await fetchEmailsByAcccount(accountId);

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

