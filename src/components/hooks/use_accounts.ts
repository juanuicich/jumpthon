import { useEffect, useState } from "react";
import { createClient } from "~/lib/supabase/client";

// Custom hook to fetch user accounts
export function useAccounts(): [Account[], Account | null, (account: Account | null) => void] {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  const supabase = createClient();

  useEffect(() => {
    function fetchAccounts() {
      supabase
        .from("account")
        .select("identity_id,email,name,picture_url")
        .order("name", { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching accounts", error);
          } else {
            console.log("Accounts fetched", data);
            setAccounts(data as Account[]);
          }
        });
    }

    const channel = supabase.channel("realtime accounts").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "account",
    }, (payload) => {
      console.log("Account update", payload);
      fetchAccounts();
    }).subscribe();

    fetchAccounts();

    // Clear the channel when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    }
  }, [supabase, setAccounts]);

  return [accounts, activeAccount, setActiveAccount];
}
