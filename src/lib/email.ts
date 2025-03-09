import { classifyEmail } from "~/lib/gemini";
import { archiveGmailEmail, fetchGmailEmail, fetchGmailInbox, getGmailClient } from "~/lib/gmail";
import { getEmailsByAcccount, getUserCategories, upsertEmails } from "~/server/db/queries";
import { parseEmailSender } from "~/lib/utils"

export async function fetchAndProcessEmail(accountId: string, gmailId: string) {
  // Fetch email from Gmail using the account's access token
  const { authClient, user } = await getGmailClient(accountId);
  const email = await fetchGmailEmail(authClient, gmailId);

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
    identity_id: accountId,
    user_id: user.id,
    created_at: email.internalDate ? new Date(parseInt(email.internalDate)).toISOString() : "",
    unsub_link: summarized.unsub_link != null ? summarized.unsub_link : "",
    read: !email.labelIds?.includes("UNREAD"),
    category_id: categoryId,
    to: email.payload?.headers?.find(header => header.name === "Delivered-To")?.value || "",
    content: emailBody,
  };

  await Promise.all([
    upsertEmails([dbEmail]),
    archiveGmailEmail(authClient, gmailId)
  ]);

  return summarized;
}

export async function fetchEmailsByAcccount(accountId: string) {
  const { authClient } = await getGmailClient(accountId);
  const emails = await fetchGmailInbox(authClient);

  if (emails.length == 0) {
    return [];
  }

  // Check which emails aren't in the DB
  // Get user's emails from the DB to check which ones we already have
  const userEmails = await getEmailsByAcccount([accountId]) || [];

  const existingGmailIds = new Set(userEmails.map(email => email.gmail_id));

  // Filter out emails that already exist in our database
  const newEmails = emails.filter(email => email.id && !existingGmailIds.has(email.id)).map(email => ({
    payload: {
      accountId: accountId,
      gmailId: email.id || ""
    }
  }));

  return newEmails;
}