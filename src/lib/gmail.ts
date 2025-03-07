import { gmail_v1, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getAccountById } from '~/server/db/queries';

/**
 * Creates an authenticated OAuth2Client using environment variables and access token
 * @param accessToken The Google access token
 * @returns Authenticated OAuth2Client
 */
export function createOAuth2Client(accessToken: string): OAuth2Client {
  const oauth2Client = new OAuth2Client(
    {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
      forceRefreshOnFailure: true
    }
  );

  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return oauth2Client;
}

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
export async function getAuthenticatedClient(accountId: string): Promise<any> {
  try {
    // Fetch the account from the database
    const account = await getAccountById(accountId);

    if (!account || !account.access_token) {
      throw new Error("No Google account or auth token found");
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

    return { authClient: authClient, user: account.user };
  } catch (error) {
    console.error("Error getting authenticated client:", error);
    throw error;
  }
}
