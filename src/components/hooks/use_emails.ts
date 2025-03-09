import { useEffect, useState } from "react";
import { createClient } from "~/lib/supabase/client";

interface EmailHookFilters {
  starred?: boolean,
  read?: boolean,
  category?: Category | null,
  account?: Account | null
}
// Custom hook to fetch emails with optional filters
export function useEmails(initialFilters?: EmailHookFilters) {
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EmailHookFilters | null>(initialFilters || null);
  const supabase = createClient();

  useEffect(() => {
    function fetchEmails() {
      const categoryId = filters?.category?.id || null;
      const accountId = filters?.account?.identity_id || null;
      console.log("Fetching emails with filters:", filters);
      let query = supabase.from("email").select("id,sender,subject,preview,created_at,category_id,identity_id,gmail_id").order("created_at", { ascending: false });

      if (categoryId !== null) {
        query = query.eq("category_id", categoryId);
      }

      if (accountId !== null && accountId !== "all") {
        query = query.eq("identity_id", accountId);
      }

      query.then(({ data, error }) => {
        if (error) {
          console.error("Error fetching emails:", error);
          setError(error.message);
        } else {
          console.log("Emails fetched:", data);
          setEmails(data);
          setIsLoading(false);
        }
      });
    }

    const channel = supabase.channel("realtime emails").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "email",
    }, (payload) => {
      console.log(payload);
      fetchEmails();
    }).subscribe();

    fetchEmails();

    // Clear the channel when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    }
  }, [supabase, setEmails, setIsLoading, filters]);

  return { emails, setFilters, isLoading, error };
}