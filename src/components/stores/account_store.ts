import { create } from 'zustand';
import { createClient } from "~/lib/supabase/client";

interface Account {
  identity_id: string;
  name: string;
  email: string | null;
  picture_url: string | null;
}

interface AccountState {
  accounts: Account[];
  activeAccount: Account | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAccounts: () => Promise<void>;
  setActiveAccount: (account: Account | null) => void;
}

const allAccountsProfile: Account = {
  identity_id: "all",
  name: "All accounts",
  email: null,
  picture_url: null,
}


export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  activeAccount: null,
  isLoading: true,
  error: null,

  fetchAccounts: async () => {
    try {
      const supabase = createClient();
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from("account")
        .select("*");

      if (error) {
        console.error("Error fetching accounts:", error);
        set({ error: error.message, isLoading: false });
      } else {
        const allAccounts = data.length > 1 ? [allAccountsProfile, ...data] : data;
        set({
          accounts: allAccounts,
          isLoading: false,
          // Set first account as active if none is selected
          activeAccount: allAccounts.length > 0 && !get().activeAccount ? allAccounts[0] : get().activeAccount
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      set({ error: "An unexpected error occurred", isLoading: false });
    }
  },

  setActiveAccount: (account) => set({ activeAccount: account }),
}));
