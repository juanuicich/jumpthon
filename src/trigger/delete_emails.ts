import { chromium } from 'playwright';
import { logger, task } from "@trigger.dev/sdk/v3";
import { deleteGmailEmail, getGmailClient } from "~/lib/gmail";
import { checkUnsub } from "~/lib/gemini";
import { deleteEmails } from "~/server/db/queries";

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
        throw new Error("Failed to delete", deleted);
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
  run: async (payload: EmailTaskInput, { ctx }) => {
    try {
      // Browser configuration settings
      const browserConfiguration = {
        adblock_config: { active: false },
        captcha_config: { active: true },
        proxy_config: { active: true },
        recording: { active: true },
        timeout: 2
      };

      const { id: browserSessionId } = await createBrowserSession(browserConfiguration);
      logger.info("Browser session created", { browserSessionId });
      const browser = await chromium.connectOverCDP(
        `wss://connect.anchorbrowser.io?apiKey=${process.env.ANCHOR_BROWSER_KEY}&sessionId=${browserSessionId}`
      );
      const context = browser.contexts()[0];
      if (!context) {
        throw new Error("No context found");
      }
      const ai = context.serviceWorkers()[0];
      if (!ai) {
        throw new Error("No AI found");
      }
      const page = context.pages()[0];
      if (!page) {
        throw new Error("No page found");
      }
      await page.goto(payload.unsub_link);
      const result = await ai.evaluate(`"You must unsubscribe me from this email I received. Fill any forms necessary to make sure I am completely unsubscribed from ALL emails from this sender. Check to select the right options if necessary. DO NOT UNDER ANY CIRCUMSTANCES subscribe me to anything. DO NOT resusbcribe me to anything. If the page says I am already unsubscribed, you can stop. Confirm this by reading the text and making sure it says I am now unsubscribed.

Read the page carefully. First try to unsubscribe by clicking the form. Do not enter any email addresses. It should be prefilled already.

Have you read the page and tried clicking unsubscribe?

If that didn't work and the form requires you to enter my email address and it isn't prefilled in the form already, you can use the address: ${payload.to}

Once you confirm I am unsubscribed, you can stop. Confirm this by reading the text and making sure it says I am now unsubscribed.

If successful, respond with just OK. If there was an error, respond with a JSON object with a key error and the message."`);

      await browser.close();
      await stopBrowserSession(browserSessionId);

      logger.info("Unsub response", { result });

      const check = await checkUnsub(JSON.stringify(result));

      logger.info("Unsub check", { check });

      if (check.status === "error") {
        logger.error("Failed to unsubscribe", { check });
        throw new Error("Failed to unsubscribe");
      }

      const deleted = await deleteEmailTask.trigger(payload);
      return { browserSessionId, result, check };

    } catch (error) {
      logger.error("Error unsubscribing from email", { error }); throw error;
    }
  }
});