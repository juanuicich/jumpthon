import { useEffect, useState } from "react";
import { createClient } from "~/lib/supabase/client";

// Custom hook to fetch user categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const supabase = createClient();

  useEffect(() => {

    function fetchCategories() {
      supabase
        .from("category")
        .select("*, email(count)")
        .order("name", { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching categories:", error);
          } else {
            console.log("Categories fetched:", data);
            setCategories(data);
          }
        });
    }

    const channel = supabase.channel("realtime categories").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "category",
    }, (payload) => {
      console.log("Category update", payload);
      fetchCategories();
    }).subscribe();

    fetchCategories();

    // Clear the channel when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    }
  }, [supabase, setCategories]);

  return categories;
}
