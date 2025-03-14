import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";
import { getEmailTask } from "~/trigger/get_emails";
import { CategoryFormData } from "~/components/ui/add_category_modal";
import { idempotencyKeys } from "@trigger.dev/sdk/v3"

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

    // Get the category ID from the URL params
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Delete the category from the database
    const { data, error } = await supabase
      .from('category')
      .delete()
      .eq('id', id)
      .single();
    if (error) {
      console.error("Error deleting category:", error);
      return NextResponse.json(
        { error: "Failed to delete category" },
        { status: 500 }
      );
    } else if (!data) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    } else {
      return NextResponse.json(
        "OK",
        { status: 200 }
      );
    }

  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}

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
    if (categoryData.id) {
      const { data: updatedCategory, error } = await supabase
        .from('category')
        .update({
          name: categoryData.category_name,
          description: categoryData.category_description || '',
          icon: categoryData.category_icon || null,
        })
        .eq('id', categoryData.id)
        .select()
        .single();
      if (error) {
        console.error("Error updating category:", error);
        return NextResponse.json(
          { error: "Failed to update category" },
          { status: 500 }
        );
      }
    } else {
      const { data: newCategory, error } = await supabase
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
      if (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
          { error: "Failed to create category" },
          { status: 500 }
        );
      }
    }

    // Handle recategorization if requested
    if (categoryData.recategorize) {
      // Get all emails from user
      const { data } = await supabase
        .from('email')
        .select("gmail_id,identity_id");

      if (data && data.length > 0) {
        const payload = data.map(e => ({
          payload: {
            gmailId: e.gmail_id,
            accountId: e.identity_id,
            idempotencyKey: idempotencyKeys.create(`${e.gmail_id}-${categoryData.id}`),
            idempotencyKeyTTL: "60s"
          }
        }));
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