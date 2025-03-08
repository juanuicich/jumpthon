import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { getAllGmailEmailsTask } from "~/trigger/get_emails";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user's identity ID - this should be the provider ID from Google OAuth
    const identities = user.identities || [];
    if (identities.length === 0) {
      return NextResponse.json(
        { error: "No linked accounts found" },
        { status: 400 }
      );
    }

    // Find the Google identity
    interface Identity {
      provider: string;
      identity_id: string;
    }

    interface TaskPayload {
      payload: {
        accountId: string;
      }
    }

    const googleIdentities: TaskPayload[] = identities
      .filter((i: Identity) => i.provider === 'google')
      .map((i: Identity): TaskPayload => ({ payload: { accountId: i.identity_id } }));
    if (!googleIdentities) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 }
      );
    }

    // Trigger the tasks with the identity ID
    const result = await getAllGmailEmailsTask.batchTrigger(googleIdentities);

    return NextResponse.json({
      status: "success",
      message: "Email fetching triggered",
      result
    });
  } catch (error: any) {
    console.error("Error triggering email fetch:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger email fetch" },
      { status: 500 }
    );
  }
}