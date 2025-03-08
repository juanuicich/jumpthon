import type { Database as DB } from "~/lib/database.types";

declare global {
  type Database = DB;
  type Category = DB["public"]["Tables"]["category"]["Row"];
  type Email = DB["public"]["Tables"]["email"]["Row"];
  type Account = DB["public"]["Tables"]["account"]["Row"];
}
