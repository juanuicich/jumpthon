import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '~/lib/supabase/server'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const supabase = await createClient();
  supabase.auth.signOut();

  // return the user to the home page
  return NextResponse.redirect(`${origin}/`)
}