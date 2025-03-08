import { useEffect, useState } from "react";
import { createClient } from "~/lib/supabase/client";

// Custom hook to fetch emails with optional filters
export function useEmails(filters?: { starred?: boolean; read?: boolean; categoryId?: string }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    function fetchEmails() {
      supabase
        .from("email")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching emails:", error);
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
  }, [supabase, setEmails, setIsLoading]);

  return { emails, isLoading, error };
}