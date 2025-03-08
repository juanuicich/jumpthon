import "server-only";

import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getAccountById(accountId: string) {
  const supabase = getClient();
  const { data: account, error } = await supabase
    .from('account')
    .select('*')
    .eq('identity_id', accountId)
    .single() as { data: Account | null, error: any };

  if (error || !account) {
    console.error('Error querying account schema:', { error, account });
    return;
  }

  return account;
}

export async function getEmailsByAcccount(accountIds: string[]) {
  const supabase = getClient();

  const { data: emails, error } = await supabase
    .from('email')
    .select('*')
    .in('identity_id', accountIds)
    .order('created_at', { ascending: false }) as { data: Email[] | null, error: any };

  if (error || !emails) {
    console.error('Error querying emails schema:', { error, emails });
    return;
  }

  return emails;
}

export async function getUserCategories(userId: string) {
  const supabase = getClient();

  const { data: categories, error } = await supabase
    .from('category')
    .select('*')
    .eq('user_id', userId) as { data: Category[] | null, error: any };

  if (error || !categories) {
    console.error('Error querying categories schema:', { error, categories });
    return;
  }

  return categories;
}

export async function insertEmails(emails: Email[]) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('email')
    .insert(emails);

  if (error) {
    console.error('Error inserting emails:', error);
    return;
  }

  return data;
}