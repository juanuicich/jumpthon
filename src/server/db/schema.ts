import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `jumpthon_${name}`);

function randomColor(): string {
  const colors = ['amber', 'blue', 'cyan', 'emerald', 'fuchsia', 'gray', 'green', 'indigo', 'lime', 'neutral', 'orange', 'pink', 'purple', 'red', 'rose', 'sky', 'slate', 'stone', 'teal', 'violet', 'yellow', 'zinc'];
  return colors[Math.floor(Math.random() * colors.length)];
}


export const emails = createTable(
  "email",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    sender: varchar("sender", { length: 255 }),
    from: varchar("from", { length: 2047 }),
    subject: varchar("subject", { length: 255 }),
    preview: varchar("preview", { length: 4095 }),
    read: boolean("read").default(false),
    starred: boolean("starred").default(false),
    unsubLink: varchar("unsub_link", { length: 8191 }),
    gmailId: varchar("gmail_id", { length: 1023 }),
    categories: jsonb("categories"),
    ownedById: uuid("owned_by_id")
      .notNull()
      .references(() => accounts.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (email) => ([
    index("email_owned_by_idx").on(email.ownedById),
    index("email_created_at_idx").on(email.createdAt),
    index("email_categories_idx").on(email.categories),
  ])
);
export const categories = createTable(
  "category",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }),
    icon: varchar("icon", { length: 255 }),
    description: text("description"),
    color: varchar("color", { length: 63 }).default(() => randomColor()),
    ownedById: uuid("owned_by_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (category) => ([
    index("category_owned_by_idx").on(category.ownedById),
    index("category_name_idx").on(category.name),
  ])
);

export const users = createTable(
  "user",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("email_verified", {
      mode: "date",
      withTimezone: true,
    }).default(sql`CURRENT_TIMESTAMP`),
    image: varchar("image", { length: 255 }),
  }
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    id: uuid("id").default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ([
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    unique("account_id").on(account.id),
    index("account_user_id_idx").on(account.userId),
  ])
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ([
    index("session_user_id_idx").on(session.userId),
  ])
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ([
    primaryKey({ columns: [vt.identifier, vt.token] }),
  ])
);
