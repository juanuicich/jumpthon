import "server-only";
import { NextResponse } from 'next/server'
import { createClient } from '~/lib/supabase/server'
import { schedules } from "@trigger.dev/sdk/v3";
import { getAllGmailEmailsCron } from "~/trigger/get_emails";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // save access token to DB
      const { data, error } = await supabase.auth.getSession();
      const { session } = data;
      if (session?.access_token) {
        // get the Google identity for the new tokens
        const options = {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          redirectUri: process.env.GOOGLE_REDIRECT_URI,
          forceRefreshOnFailure: true
        };
        const auth = new OAuth2Client(options);

        auth.setCredentials({
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token,
        });
        const gmail = google.gmail({ version: 'v1', auth, errorRedactor: false });
        const profile = await gmail.users.getProfile({ userId: 'me' });
        if (!profile.data.emailAddress) {
          return NextResponse.json({ error: 'Authentication failed' }, { status: 403 })
        }

        console.log({ session, profile: profile.data });
        const { data, error } = await supabase.from('account').update({ refresh_token: session?.provider_refresh_token, access_token: session?.provider_token }).eq('email', profile.data.emailAddress).select().single();

        if (!data?.identity_id) {
          return NextResponse.json({ error: 'Authentication failed' }, { status: 403 })
        }

        // schedule cron job to fetch emails
        await schedules.create({
          task: getAllGmailEmailsCron.id,
          cron: "0 */1 * * *", // Run every hour
          externalId: data?.identity_id,
          deduplicationKey: `${data?.identity_id}-email-fetch`
        });
      } else {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 403 })
      }
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}/inbox`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}/inbox`)
      } else {
        return NextResponse.redirect(`${origin}${next}/inbox`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}