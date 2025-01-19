import { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync("pomodoro.db");

export default function SettingScreen() {
  const [inputTime, setInputTime] = useState("1500");

  useEffect(() => {
    async function createTable() {
      try {
        await db.execAsync(
          "CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE, value TEXT);"
        );
      } catch (error) {
        console.error("Table creation failed:", error);
      }
    }
    createTable();
  }, []);

  const saveTime = async () => {
    const parsedTime = parseInt(inputTime, 10);
    if (!isNaN(parsedTime) && parsedTime > 0) {
      try {
        await db.runAsync(
          "INSERT INTO settings (key, value) VALUES ('pomodoro_time', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;",
          [String(parsedTime)]
        );
        alert("Time setting saved!");
      } catch (error) {
        console.error("Failed to save time:", error);
        alert("Failed to save time.");
      }
    } else {
      alert("Please enter a valid number.");
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text>Set Timer</Text>
      <TextInput
        keyboardType="numeric"
        value={inputTime}
        onChangeText={setInputTime}
      />
      <TouchableOpacity onPress={saveTime}>
        <Text>Save</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
});
