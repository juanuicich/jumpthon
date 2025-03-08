import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../env.js";
import * as schema from "../server/db/schema.ts";
import { users, categories } from "../server/db/schema.ts";
// Ensure script can run outside of Next.js server context
// import "dotenv"; // Load environment variables directly

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

async function seedCategories() {
  const allUsers = await db.select(users).all();

  const categoryData = [
    { name: "Meetings", icon: "calendar", description: "Meeting invitations, schedule changes, and calendar events" },
    { name: "Clients", icon: "users", description: "Client communications, inquiries, and project discussions" },
    { name: "Invoices", icon: "receipt", description: "Billing, invoices, payment confirmations and financial documents" },
    { name: "Projects", icon: "briefcase", description: "Project updates, tasks, deadlines and deliverables" },
    { name: "Reports", icon: "chart-column", description: "Analytics, business reports, statistics and metrics" },
    { name: "Admin", icon: "clipboard-check", description: "Office administration, HR notices, internal policies" },
  ];

  for (const user of allUsers) {
    for (const category of categoryData) {
      await db.insert(categories).values({
        ...category,
        ownedById: user.id,
      });
    }
  }

  console.log("Categories seeded successfully.");
}

seedCategories()
  .catch((error) => {
    console.error("Error seeding categories:", error);
  });
