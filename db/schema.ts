import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// settings テーブル
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value"),
});
