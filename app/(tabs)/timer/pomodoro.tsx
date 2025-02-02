import { useState, useEffect, useCallback } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "expo-router";
import { db } from "@/db/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default function PomodoroScreen() {
  const [defaultTime, setDefaultTime] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [reStartFlag, setReStartFlag] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadTimeSetting = () => {
        try {
          let result;
          result = db.select().from(settings).where(eq(settings.key, "pomodoro_time")).get();
          // 設定がない場合
          if (!result) {
            try {
              db.insert(settings)
                .values({ key: "pomodoro_time", value: "1500" }) // 25分
                .onConflictDoUpdate({
                  target: settings.key,
                  set: { value: "1500" },
                })
                .run();
              console.log("Inserted default pomodoro_time: 1500");
            } catch (error) {
              console.error("Failed to insert default pomodoro_time:", error);
            }
            result = db.select().from(settings).where(eq(settings.key, "pomodoro_time")).get();
          }
          
          const startTimestampResult = db.select().from(settings).where(eq(settings.key, "pomodoro_start_timestamp")).get();
          if (result && result.value) {
            const defaultTime = parseInt(result.value, 10);
            setDefaultTime(defaultTime);
            if (startTimestampResult && startTimestampResult.value && isRunning && !reStartFlag) {
              const elapsed = Math.floor((Date.now() - parseInt(startTimestampResult.value, 10)) / 1000);
              const remaining = Math.max(defaultTime - elapsed, 0);
              setTime(remaining);
              console.log("Remaining is : " + remaining)
            } else if (!isRunning && startTime === null) {
              setTime(defaultTime);
              console.log("Default Time is : " + defaultTime)
            } else if (!isRunning && reStartFlag) {
              setTime(time);
              console.log("Time is : " + time)
            }
          }
        } catch (error) {
          console.error("Failed to load time setting:", error);
        }
      };
      loadTimeSetting();
    }, [isRunning])
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartStop = () => {
    if (!isRunning) {
      const timestamp = Date.now();
      setStartTime(timestamp);
      setReStartFlag(true);

      try {
        db.insert(settings)
          .values({ key: "pomodoro_start_timestamp", value: String(timestamp) })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: String(timestamp) },
          })
          .run();
      } catch (error) {
        console.error("Failed to save start timestamp:", error);
      }
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setTime(defaultTime);
    setIsRunning(false);
    setStartTime(null);

    try {
      db.insert(settings)
        .values({ key: "pomodoro_start_timestamp", value: null })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: null },
        })
        .run();
    } catch (error) {
      console.error("Failed to reset start timestamp:", error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.text}>{formatTime(time)}</Text>
      <TouchableOpacity onPress={handleStartStop}>
        <Text style={styles.text}>{isRunning ? "Stop" : "Start"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleReset}>
        <Text style={styles.text}>Reset</Text>
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
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    color: "#fff",
  },
});
