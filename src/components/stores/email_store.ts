import debounce from "lodash.debounce";
import { create } from 'zustand';
import { createClient } from "~/lib/supabase/client";

interface EmailState {
  emails: EmailSummary[];
  selectedEmails: string[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category?: Category | null;
    account?: Account | null;
    read?: boolean;
    starred?: boolean;
  };

  // Actions
  setFilters: (filters: Partial<EmailState['filters']>) => void;
  fetchEmails: () => Promise<void>;
  fetchEmailsDirect: () => Promise<void>;
  toggleEmailSelection: (id: string) => void;
  selectAllEmails: () => void;
  clearSelectedEmails: () => void;
}

export const useEmailStore = create<EmailState>((set, get) => ({
  emails: [],
  selectedEmails: [],
  isLoading: true,
  error: null,
  filters: {},

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().fetchEmails();
  },

  fetchEmailsDirect: async () => {
    try {
      const supabase = createClient();
      const { filters } = get();
      console.log("Fetching emails", { filters });

      set({ isLoading: true, error: null });

      const categoryId = filters.category?.id || null;
      const accountId = filters.account?.identity_id || null;

      let query = supabase
        .from("email")
        .select("id,sender,subject,preview,created_at,category_id,identity_id,gmail_id")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (categoryId !== null) {
        query = query.eq("category_id", categoryId);
      }

      if (accountId !== null && accountId !== "all") {
        query = query.eq("identity_id", accountId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching emails:", error);
        set({ error: error.message, isLoading: false });
      } else {
        set({ emails: data, isLoading: false });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      set({ error: "An unexpected error occurred", isLoading: false });
    }
    console.log("Finished fetching emails");
  },

  fetchEmails: async () => {
    return new Promise<void>((resolve) => {
      const debouncedFetch = debounce(() => {
        get().fetchEmailsDirect().then(resolve);
      }, 50);
      debouncedFetch();
    });
  },

  toggleEmailSelection: (id) => set((state) => ({
    selectedEmails: state.selectedEmails.includes(id)
      ? state.selectedEmails.filter(emailId => emailId !== id)
      : [...state.selectedEmails, id]
  })),

  selectAllEmails: () => set((state) => ({
    selectedEmails: state.emails.map(email => email.id)
  })),

  clearSelectedEmails: () => set({ selectedEmails: [] }),
}));

