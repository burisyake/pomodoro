import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import { settings } from "./schema";

// SQLite データベースを開く
const sqlite = SQLite.openDatabaseSync("pomodoro.db");

// Drizzle ORM インスタンス
export const db = drizzle(sqlite);

// テーブルを削除
db.run(`DROP TABLE IF EXISTS settings;`);

// テーブルの初期化
db.run(
  `CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NULL
  );`
);
