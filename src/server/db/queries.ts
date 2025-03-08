import "server-only";
import { eq, sql, and } from "drizzle-orm";
import { db } from "~/server/db";
import { accounts, categories, emails } from "./schema";

export async function getUserEmails() {
  const session = {};

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const userAccounts = await getUserAccounts()
  const accountIds = userAccounts.map(account => account.id);
  const userEmails = await getEmailsByAcccount(accountIds);

  return userEmails;
}

export async function getUserAccounts(userId?: string) {
  let queryById: string;
  if (!userId) {
    const session = {};

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    queryById = session.user.id;
  } else {
    queryById = userId;
  }

  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, queryById),
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
  const session = {};

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

export async function getUserCategories(userId?: string) {
  let user_id;
  if (!userId) {
    const session = {};

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    user_id = session.user.id;
  } else {
    user_id = userId;
  }

  const userCategories = await db.query.categories.findMany({
    where: eq(categories.ownedById, user_id),
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });

  return userCategories;
}

export async function saveEmail(emailData: Omit<typeof emails.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  const result = await db.insert(emails)
    .values(emailData)
    .returning();

  return result.length > 0 ? result[0] : null;
}

export async function updateAccountTokens(accountId: string, accessToken: string, refreshToken: string) {
  const result = await db.update(accounts)
    .set({ access_token: accessToken, refresh_token: refreshToken })
    .where(eq(accounts.id, accountId))
    .returning({ updatedId: accounts.id });

  return result.length > 0 ? result[0] : null;
}