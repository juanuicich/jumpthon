import "server-only";
import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '~/lib/supabase/server'
import { jwtDecode } from "~/lib/utils";

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
      const identities = session?.user.identities || [];
      const jwt = jwtDecode(session?.access_token);
      const identity = identities.find(i => i.identity_data.provider_id == jwt.user_metadata.provider_id);

      await supabase.from('account').update({ refresh_token: session?.provider_refresh_token, access_token: session?.provider_token }).eq('identity_id', identity?.identity_id).select();

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