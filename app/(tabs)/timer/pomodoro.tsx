import { useState, useEffect, useCallback } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "expo-router";
import { db } from "@/db/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default function PomodoroScreen() {
  const [time, setTime] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadTimeSetting = () => {
        try {
          const result = db.select().from(settings).where(eq(settings.key, "pomodoro_time")).get();
          if (result) {
            setTime(parseInt(result.value, 10));
          }
        } catch (error) {
          console.error("Failed to load time setting:", error);
        }
      };
      loadTimeSetting();
    }, [])
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setTime(100);
    setIsRunning(false);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text>{formatTime(time)}</Text>
      <TouchableOpacity onPress={handleStartStop}>
        <Text>{isRunning ? "Stop" : "Start"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleReset}>
        <Text>Reset</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
});
