import "server-only";
import { eq, sql, and } from "drizzle-orm";
import { db } from "~/server/db";
import { accounts, emails } from "./schema";
import { auth } from "~/server/auth";

export async function getUserEmails() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const userEmails = await getEmailsByAcccount(session.user.id);

  return userEmails;
}

export async function getEmailsByAcccount(accountId: string) {
  const userEmails = await db.query.emails.findMany({
    where: eq(emails.ownedById, accountId),
    orderBy: (emails, { desc }) => [desc(emails.createdAt)],
  });

  return userEmails;
}

export async function getUserEmailsWithFilters({
  starred,
  read,
  categoryId
}: {
  starred?: boolean;
  read?: boolean;
  categoryId?: string;
} = {}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const conditions = [eq(emails.ownedById, session.user.id)];

  if (starred !== undefined) {
    conditions.push(eq(emails.starred, starred));
  }
  if (read !== undefined) {
    conditions.push(eq(emails.read, read));
  }
  if (categoryId) {
    conditions.push(sql`${emails.categories} @> ${{ [categoryId]: true }}::jsonb`);
  }

  let query = db.select().from(emails).where(and(...conditions));

  return query.orderBy(emails.createdAt);
}

export async function getAccountById(id: string) {
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, id)
  });

  return account;
}