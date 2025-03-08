import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { getEmailTask } from "~/trigger/get_emails";
import { CategoryFormData } from "~/components/ui/add_category_modal";

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

    // Parse the request body to get category data
    const categoryData: CategoryFormData = await request.json();

    // Validate required fields
    if (!categoryData.category_name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Insert the new category into the database
    const { data: newCategory, error: insertError } = await supabase
      .from('category')
      .insert({
        name: categoryData.category_name,
        description: categoryData.category_description || '',
        icon: categoryData.category_icon || null,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating category:", insertError);
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500 }
      );
    }

    // Handle recategorization if requested
    if (categoryData.recategorize && newCategory) {
      // Get all emails from user
      const { data } = await supabase
        .from('email')
        .select("gmail_id,identity_id");

      if (data && data.length > 0) {
        const payload = data.map(e => ({ payload: { gmailId: e.gmail_id, accountId: e.identity_id } }));
        //batch all reprocessing tasks
        const result = await getEmailTask.batchTrigger(payload);
      }
    }

    return NextResponse.json(
      "OK",
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error adding category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add category" },
      { status: 500 }
    );
  }
}