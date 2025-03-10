import { logger, schedules, task } from "@trigger.dev/sdk/v3";
import { deleteGmailEmail, getGmailClient } from "~/lib/gmail";
import { checkUnsub } from "~/lib/gemini";
import { deleteEmails, getEmailBotLog, resetDeletedEmail, resetDeletedEmails, updateEmailBotLog } from "~/server/db/queries";
import { log } from "console";

export interface EmailTaskInput {
  id: string,
  identity_id: string,
  gmail_id: string,
  unsub_link: string,
  to: string
}

// Delete an email from Gmail
export const deleteEmailTask = task({
  id: "delete-email",
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  queue: {
    concurrencyLimit: 20,
  },
  retry: {
    maxAttempts: 1
  },
  run: async (payload: EmailTaskInput, { ctx }) => {

    try {
      // Fetch email from Gmail using the account's access token
      const { authClient, user } = await getGmailClient(payload.identity_id);

      if (!user.id) {
        throw new Error("User ID is required");
      }

      const deleted = await deleteGmailEmail(authClient, payload.gmail_id);
      logger.info("Email deleted", { deleted });

      if (deleted) {
        deleteEmails([payload.id]);
        return deleted;
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      logger.error("Error getting Gmail emails", { error });
      throw error;
    }
  }
});

interface BrowserConfiguration {
  adblock_config: { active: boolean },
  captcha_config: { active: boolean },
  proxy_config: { active: boolean },
  recording: { active: boolean },
  timeout: number
}
async function createBrowserSession(browserConfiguration: BrowserConfiguration) {
  const response = await fetch("https://api.anchorbrowser.io/api/sessions", {
    method: "POST",
    headers: {
      "anchor-api-key": `${process.env.ANCHOR_BROWSER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(browserConfiguration),
  });

  const json = await response.json();
  return json;
}

async function stopBrowserSession(sessionId: string) {
  await fetch(`https://api.anchorbrowser.io/api/sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      "anchor-api-key": `${process.env.ANCHOR_BROWSER_KEY}`,
    },
  });
}

async function getSessionRecordings(sessionId: string) {
  const response = await fetch(`https://api.anchorbrowser.io/api/sessions/${sessionId}/recording`, {
    method: "GET",
    headers: {
      "anchor-api-key": `${process.env.ANCHOR_BROWSER_KEY}`,
    },
  });
  return await response.json();
}


// This task only unsubscribes the user from the email, then queues the deleteEmailTask
export const unsubDeleteEmailTask = task({
  id: "unsub-email",
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  queue: {
    concurrencyLimit: 1,
  },
  retry: {
    maxAttempts: 2,
  },
  onFailure: async (payload: EmailTaskInput, error, { ctx }) => {
    await resetDeletedEmail(payload.id);
  },
  run: async (payload: EmailTaskInput, { ctx }) => {
    try {

      if (payload.unsub_link) {
        // Browser configuration settings
        const browserConfiguration = {
          adblock_config: { active: false },
          captcha_config: { active: true },
          proxy_config: { active: true },
          recording: { active: true },
          headless: false,
          timeout: 1
        };

        const { id: browserSessionId } = await createBrowserSession(browserConfiguration);
        logger.info("Browser session created", { browserSessionId });

        const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: payload.unsub_link, task: `"You must unsubscribe me from this email I received. Fill any forms necessary to make sure I am completely unsubscribed from ALL emails from this sender. Check to select the right options if necessary. DO NOT UNDER ANY CIRCUMSTANCES subscribe me to anything. DO NOT resusbcribe me to anything. DO NOT search for other pages, you have been given the correct link. If the page says I am already unsubscribed, you can stop. Confirm this by reading the text and making sure it says I am now unsubscribed. If the page returns an error, inform the user and stop.

            Read the page carefully. First try to unsubscribe by clicking the form. Do not enter any email addresses. It should be prefilled already.

            Have you read the page and tried clicking unsubscribe?

            If that didn't work and the form requires you to enter my email address and it isn't prefilled in the form already, you can use the address: ${payload.to}

            Once you confirm I am unsubscribed, you can stop. Confirm this by reading the text and making sure it says I am now unsubscribed.

            If as a final result I am unsubscribed, respond with just OK. If there was an error, respond with a JSON object with a key error and the message."`})
        }

        const result = await fetch(`https://connect.anchorbrowser.io/tools/perform-web-task?apiKey=${process.env.ANCHOR_BROWSER_KEY}&sessionId=${browserSessionId}`, options);
        const json = await result.json();
        logger.info("Unsub response", { json });

        await stopBrowserSession(browserSessionId);

        const check = await checkUnsub(JSON.stringify(json));

        logger.info("Unsub check", { check });

        if (check.status === "error") {
          logger.error("Failed to unsubscribe", { check });

          const recordings = await getSessionRecordings(browserSessionId);
          logger.info("Session recordings", { recordings });
          const { data, error } = await getEmailBotLog(payload.id);
          logger.info("Bot log", { data });
          if (data) {
            json.videos = recordings?.data?.videos || [];
            const unsub_log = data.bot_log?.unsub_log || [];
            const new_log = {
              ...data.bot_log || {},
              unsub_log: [...unsub_log, json]
            };
            // Update the bot log with the new unsub_log
            logger.info("Updating bot log", { new_log });
            await updateEmailBotLog(payload.id, new_log);
          }

          throw new Error("Failed to unsubscribe");
        }
        await deleteEmailTask.trigger(payload);

        return { browserSessionId, result, check };

      } else {

        await deleteEmailTask.trigger(payload);
      }

    } catch (error) {
      logger.error("Error unsubscribing from email", { error }); throw error;
    }
  },
});

// Recurring task to reset deleted_at field for emails after 10 minutes
export const resetDeletedEmailsTask = schedules.task({
  id: "reset-deleted-emails",
  cron: "*/5 * * * *", // Run every 5 minutes
  description: "Reset deleted_at field for emails that have been in deleted state for more than 10 minutes",
  maxDuration: 60,
  retry: {
    maxAttempts: 1
  },
  run: async (payload, { ctx }) => {
    const { data, error } = await resetDeletedEmails();

    if (error) {
      logger.error("Error resetting deleted emails", { error });
      throw error;
    }
    return { data };
  }
});