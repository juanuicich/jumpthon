import "server-only";
import { gmail_v1, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getAccountById } from '~/server/db/queries';


/**
 * Fetches a list of messages from the Gmail inbox
 * @param accessToken Google access token
 * @param refreshToken Google refresh token
 * @param maxResults Maximum number of emails to return
 * @returns List of Gmail messages
 */
export async function fetchGmailInbox(
  auth: OAuth2Client,
  maxResults: number = 100
): Promise<gmail_v1.Schema$Message[]> {
  const gmail = google.gmail({ version: 'v1', auth, errorRedactor: false });

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'in:inbox'
    });

    return response.data.messages || [];
  } catch (error) {
    console.error('Error fetching Gmail list:', error);
    throw error;
  }
}

/**
 * Fetches a single email from Gmail by ID
* @param auth Authenticated OAuth2Client
* @param messageId ID of the message to fetch
* @returns Complete Gmail message data
*/
export async function fetchGmailEmail(
  auth: OAuth2Client,
  messageId: string
): Promise<gmail_v1.Schema$Message> {
  const gmail = google.gmail({ version: 'v1', auth, errorRedactor: false });

  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching Gmail message ${messageId}:`, error);
    throw error;
  }
}

/**
 * Gets an authenticated OAuth2Client for a Google account
 * Refreshes the token if it's about to expire (within 10 minutes)
 * @param accountId The account ID in the database
 * @returns An authenticated OAuth2Client
 */
export async function getGmailClient(accountId: string) {
  const account = await getAccountById(accountId);

  if (!account) {
    throw new Error("Account not found");
  }

  const options = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    forceRefreshOnFailure: true
  };

  console.log('Account', { account });
  console.log('ClientOptions', { options });

  const authClient = new OAuth2Client(options);

  authClient.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  const user = {
    id: account.user_id,
    email: account.email,
    name: account.name
  }

  return { authClient, user };

}
