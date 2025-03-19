import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// settings テーブル
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value"),
});
// pomodoro_logs テーブル
export const pomodoro_logs = sqliteTable("pomodoro_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(),
  count: integer("count").notNull().default(0),
});
