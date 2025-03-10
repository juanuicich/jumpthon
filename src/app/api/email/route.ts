import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { deleteEmailTask, unsubDeleteEmailTask } from "~/trigger/delete_emails";
import type { EmailTaskInput } from "~/trigger/delete_emails";

export async function DELETE(request: NextRequest) {
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

    if (!request.body) {
      return NextResponse.json(
        { error: "Bad request" },
        { status: 400 }
      );
    }

    // Get the email IDs from the request body
    const { emailIds, unsub } = await request.json();

    // Get all emails from Supabase, this means the user has permission to delete them
    const { data: emails } = await supabase
      .from('email')
      .select('id, identity_id, gmail_id, unsub_link, to')
      .in('id', emailIds);

    const emailList = emails?.map(e => ({ payload: e as EmailTaskInput })) || [];

    let result
    if (unsub) {
      result = await unsubDeleteEmailTask.batchTrigger(emailList);
      await supabase
        .from('email')
        .update({ deleted_at: new Date() })
        .in('id', emailIds);
    } else {
      result = await deleteEmailTask.batchTrigger(emailList);
      //delete all emails immediately
      await supabase
        .from('email')
        .delete()
        .in('id', emailIds);
    }

    return NextResponse.json({
      status: "success",
      message: "Email delete triggered",
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