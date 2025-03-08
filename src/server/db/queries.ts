import "server-only";

import { createClient } from "@supabase/supabase-js";

function getClient() {
  const supabaseUrl = process.env.SUPABASE_URL as string;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseKey);
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

export async function getUserCategories(userId: string): Promise<Category[]> {
  const supabase = getClient();

  const { data: categories, error } = await supabase
    .from('category')
    .select('*')
    .eq('user_id', userId) as { data: Category[] | null, error: any };

  if (error || !categories) {
    console.error('Error querying categories schema:', { error, categories });
    return [];
  }

  return categories || [];
}

export async function upsertEmails(emails: Partial<Email>[]) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('email')
    .upsert(emails, { onConflict: "gmail_id,identity_id" });

  if (error) {
    console.error('Error inserting emails:', error);
    return;
  }

  return data;
}