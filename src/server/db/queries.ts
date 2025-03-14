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

export async function deleteEmails(emailIds: string[]) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('email')
    .delete()
    .in('id', emailIds);

  if (error) {
    console.error('Error deleting emails', error);
    return;
  }

  return data;
}

export async function resetDeletedEmails() {
  const supabase = getClient();
  // Calculate timestamp for 10 minutes ago in UTC
  const tenMinutesAgo = new Date();
  tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

  const { data, error } = await supabase
    .from('email')
    .update({ deleted_at: null })
    .lt('deleted_at', tenMinutesAgo.toISOString());

  return { data, error };
}

export async function resetDeletedEmail(id: string) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('email')
    .update({ deleted_at: null })
    .eq('id', id);;

  return { data, error };
}

export async function getEmailBotLog(id: string) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('email')
    .select('bot_log')
    .eq('id', id)
    .limit(1)
    .single();

  return { data, error };
}

export async function updateEmailBotLog(id: string, bot_log: any) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('email')
    .update({ bot_log: bot_log })
    .eq('id', id);

  return { data, error };
}