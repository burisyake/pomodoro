import { useState, useEffect, useCallback } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "expo-router";
import { db } from "@/db/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default function PomodoroScreen() {
  const [defaultPomodoroTime, setDefaultPomodoroTime] = useState(0);
  const [pomodoroTime, setPomodoroTime] = useState(0);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [reStartPomodoroFlag, setReStartPomodoroFlag] = useState(false);
  const [pomodoroStartTime, setPomodoroStartTime] = useState<number | null>(null);

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
          
          const pomodoroStartTimestampResult = db.select().from(settings).where(eq(settings.key, "pomodoro_start_timestamp")).get();
          if (result && result.value) {
            const defaultPomodoroTime = parseInt(result.value, 10);
            setDefaultPomodoroTime(defaultPomodoroTime);
            if (pomodoroStartTimestampResult && pomodoroStartTimestampResult.value && isPomodoroRunning && !reStartPomodoroFlag) {
              const elapsed = Math.floor((Date.now() - parseInt(pomodoroStartTimestampResult.value, 10)) / 1000);
              const remaining = Math.max(defaultPomodoroTime - elapsed, 0);
              setPomodoroTime(remaining);
              console.log("Remaining is : " + remaining)
            } else if (!isPomodoroRunning && pomodoroStartTime === null) {
              setPomodoroTime(defaultPomodoroTime);
              console.log("Default Time is : " + defaultPomodoroTime)
            } else if (!isPomodoroRunning && reStartPomodoroFlag) {
              setPomodoroTime(pomodoroTime);
              console.log("Time is : " + pomodoroTime)
            }
          }
        } catch (error) {
          console.error("Failed to load time setting:", error);
        }
      };
      loadTimeSetting();
    }, [isPomodoroRunning])
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPomodoroRunning) {
      interval = setInterval(() => {
        setPomodoroTime((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning]);

  const handleStartStopPomodoro = () => {
    if (!isPomodoroRunning) {
      const timestamp = Date.now();
      setPomodoroStartTime(timestamp);
      setReStartPomodoroFlag(true);

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
    setIsPomodoroRunning((prev) => !prev);
  };

  const handleResetPomodoro = () => {
    setPomodoroTime(defaultPomodoroTime);
    setIsPomodoroRunning(false);
    setPomodoroStartTime(null);

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
      <Text style={styles.title}>Pomodoro Timer</Text>
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(pomodoroTime)}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleStartStopPomodoro} style={styles.button}>
          <Text style={styles.buttonText}>{isPomodoroRunning ? "Stop" : "Start"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResetPomodoro} style={styles.button}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  timerContainer: {
    backgroundColor: "#3a3a3a",
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 24,
    width: 180,
  },
  timer: {
    fontSize: 48,
    color: "#fff",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
  },
  button: {
    backgroundColor: "#696969",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
});
