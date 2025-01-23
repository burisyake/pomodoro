import { useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import { db } from "@/db/db";
import { settings } from "@/db/schema";

export default function SettingScreen() {
  const [inputTime, setInputTime] = useState("1500");

  const saveTime = () => {
    const parsedTime = parseInt(inputTime, 10);
    if (!isNaN(parsedTime) && parsedTime > 0) {
      try {
        db.insert(settings).values({
          key: "pomodoro_time",
          value: String(parsedTime),
        }).onConflictDoUpdate({
          target: settings.key,
          set: { value: String(parsedTime) },
        }).run();
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
      <Text style={styles.text}>Set Timer</Text>
      <TextInput
        keyboardType="numeric"
        value={inputTime}
        onChangeText={setInputTime}
        style={styles.text}
      />
      <TouchableOpacity onPress={saveTime}>
        <Text style={styles.text}>Save</Text>
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
  text: {
    fontSize: 24,
    color: "#fff",
  },
});
