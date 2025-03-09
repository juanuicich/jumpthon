import { createClient } from "~/lib/supabase/client";
import { useEmailStore } from './email_store';
import { useCategoryStore } from './category_store';
import { useAccountStore } from './account_store';

export function initializeStores() {
  const supabase = createClient();

  // Initialize email subscriptions
  // const emailChannel = supabase.channel("realtime emails")
  //   .on("postgres_changes", {
  //     event: "*",
  //     schema: "public",
  //     table: "email",
  //   }, () => {
  //     useEmailStore.getState().fetchEmails();
  //   })
  //   .subscribe();

  // // Initialize category subscriptions
  // const categoryChannel = supabase.channel("realtime categories")
  //   .on("postgres_changes", {
  //     event: "*",
  //     schema: "public",
  //     table: "category",
  //   }, () => {
  //     useCategoryStore.getState().fetchCategories();
  //   })
  //   .subscribe();

  // // Initialize account subscriptions
  // const accountChannel = supabase.channel("realtime accounts")
  //   .on("postgres_changes", {
  //     event: "*",
  //     schema: "public",
  //     table: "identity",
  //   }, () => {
  //     useAccountStore.getState().fetchAccounts();
  //   })
  //   .subscribe();

  // Fetch initial data
  useEmailStore.getState().fetchEmails();
  useCategoryStore.getState().fetchCategories();
  useAccountStore.getState().fetchAccounts();

  // Return cleanup function
  return () => {
    // supabase.removeChannel(emailChannel);
    // supabase.removeChannel(categoryChannel);
    // supabase.removeChannel(accountChannel);
  };
}
