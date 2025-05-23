import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import { settings } from "./schema";

// SQLite データベースを開く
const sqlite = SQLite.openDatabaseSync("pomodoro.db");

// Drizzle ORM インスタンス
export const db = drizzle(sqlite);

// テーブルの初期化
db.run(
  `CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NULL
  );`
);

db.run(
  `CREATE TABLE IF NOT EXISTS pomodoro_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    count TEXT NOT NULL
  );`
);