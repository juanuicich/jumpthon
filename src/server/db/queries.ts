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

  const userAccounts = await getUserAccounts()
  const accountIds = userAccounts.map(account => account.id);
  const userEmails = await getEmailsByAcccount(accountIds);

  return userEmails;
}

export async function getUserAccounts() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, session.user.id),
    orderBy: (accounts, { asc }) => [asc(accounts.provider)],
  });

  return userAccounts;
}

export async function getEmailsByAcccount(accountIds: string[]) {
  const userEmails = await db.query.emails.findMany({
    where: accountIds.length === 1
      ? eq(emails.ownedById, accountIds[0])
      : sql`${emails.ownedById} IN ${accountIds}`,
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
    where: eq(accounts.id, id),
    with: {
      user: true,
    }
  });

  return account;
}

export async function saveEmail(emailData: Omit<typeof emails.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  const result = await db.insert(emails)
    .values(emailData)
    .returning();

  return result.length > 0 ? result[0] : null;
}

export async function updateAccountAccessToken(accountId: string, accessToken: string) {
  const result = await db.update(accounts)
    .set({ access_token: accessToken })
    .where(eq(accounts.id, accountId))
    .returning({ updatedId: accounts.id });

  return result.length > 0 ? result[0] : null;
}