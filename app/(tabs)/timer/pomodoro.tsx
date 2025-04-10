import { useState, useEffect, useCallback } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "expo-router";
import { db } from "@/db/db";
import { settings, pomodoro_logs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";

export default function PomodoroScreen() {
  const [defaultPomodoroTime, setDefaultPomodoroTime] = useState(1500); // 25分
  const [pomodoroTime, setPomodoroTime] = useState(1500);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [reStartPomodoroFlag, setReStartPomodoroFlag] = useState(false);
  const [pomodoroStartTime, setPomodoroStartTime] = useState<number | null>(null);

  // 休憩用の状態
  const [restTime, setRestTime] = useState(300); // 5分
  const [isRestRunning, setIsRestRunning] = useState(false);
  const [restStartTime, setRestStartTime] = useState<number | null>(null); // 休憩開始時のタイムスタンプ

  useFocusEffect(
    useCallback(() => {
      const loadTimeSetting = () => {
        try {
          let resultPomodoro = db.select().from(settings).where(eq(settings.key, "pomodoro_time")).get();
          const pomodoroStartTimestampResult = db.select().from(settings).where(eq(settings.key, "pomodoro_start_timestamp")).get();
          if (resultPomodoro && resultPomodoro.value) {
            const defaultPomodoroTime = parseInt(resultPomodoro.value, 10);
            setDefaultPomodoroTime(defaultPomodoroTime);
            if (pomodoroStartTimestampResult && pomodoroStartTimestampResult.value && isPomodoroRunning && !reStartPomodoroFlag) {
              const elapsed = Math.floor((Date.now() - parseInt(pomodoroStartTimestampResult.value, 10)) / 1000);
              const remaining = Math.max(defaultPomodoroTime - elapsed, 0);
              setPomodoroTime(remaining);
            } else if (!isPomodoroRunning && pomodoroStartTime === null) {
              setPomodoroTime(defaultPomodoroTime);
            } else if (!isPomodoroRunning && reStartPomodoroFlag) {
              setPomodoroTime(pomodoroTime);
            }
          }
          let resultRest = db.select().from(settings).where(eq(settings.key, "rest_time")).get();
          if (resultRest && resultRest.value) {
            setRestTime(parseInt(resultRest.value, 10));
          }

          // 休憩が開始されていた場合、残り時間を計算する
          let restStartTimestampResult = db.select().from(settings).where(eq(settings.key, "rest_start_timestamp")).get();
          if (restStartTimestampResult && restStartTimestampResult.value) {
            const restStart = parseInt(restStartTimestampResult.value, 10);
            const elapsedRestTime = Math.floor((Date.now() - restStart) / 1000);
            const remainingRestTime = Math.max(restTime - elapsedRestTime, 0);

            if (isRestRunning && remainingRestTime > 0) {
              setRestTime(remainingRestTime);
              setIsRestRunning(true);
            } else {
              resetToInitialState();
            }
          }
        } catch (error) {
          console.error("Failed to load time setting:", error);
        }
      };
      loadTimeSetting();
    }, [isPomodoroRunning, isRestRunning])
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);
    } else if (pomodoroTime === 0 && !isRestRunning) {
      // Pomodoro終了、休憩開始
      startRest();
      // Logに完了日時を記録
      logPomodoroCompletion();
    }

    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroTime]);

  useEffect(() => {
    let restInterval: NodeJS.Timeout | undefined;

    if (isRestRunning && restTime > 0) {
      restInterval = setInterval(() => {
        setRestTime((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);
    } else if (restTime === 0) {
      // 休憩が終わったら初期状態に戻す
      resetToInitialState();
    }

    return () => clearInterval(restInterval);
  }, [isRestRunning, restTime]);

  const startRest = () => {
    let resultRest = db.select().from(settings).where(eq(settings.key, "rest_time")).get();
    if (resultRest && resultRest.value) {
      const defaultRestTime = parseInt(resultRest.value, 10);
      setRestTime(defaultRestTime);
    }

    setIsPomodoroRunning(false);
    setIsRestRunning(true);
    const timestamp = Date.now();
    setRestStartTime(timestamp);

    try {
      db.insert(settings)
        .values({ key: "rest_start_timestamp", value: String(timestamp) })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: String(timestamp) },
        })
        .run();
    } catch (error) {
      console.error("Failed to save rest start timestamp:", error);
    }
  };

  const handleStartStopPomodoro = () => {
    if (isRestRunning) {
      setIsRestRunning((prev) => !prev);
    } else {
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
    }
  };

  const handleResetPomodoro = () => {
    resetToInitialState();
  };

  const handleSkipRest = () => {
    resetToInitialState();
  };

  const resetToInitialState = () => {
    setPomodoroTime(defaultPomodoroTime);
    setIsPomodoroRunning(false);
    setPomodoroStartTime(null);
    setIsRestRunning(false);
    setRestStartTime(null);
    try {
      db.insert(settings)
        .values({ key: "pomodoro_start_timestamp", value: null })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: null },
        })
        .run();

      db.insert(settings)
        .values({ key: "rest_start_timestamp", value: null })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: null },
        })
        .run();
    } catch (error) {
      console.error("Failed to reset timestamp:", error);
    }
  };

  const logPomodoroCompletion = () => {
    const today = format(new Date(), "yyyy-MM-dd");
  
    try {
      // 既存のログを取得
      const existingLog = db
        .select()
        .from(pomodoro_logs)
        .where(eq(pomodoro_logs.date, today))
        .get();
  
      if (existingLog) {
        // 既にログがある場合は count を +1
        db.update(pomodoro_logs)
          .set({ count: Number(existingLog.count) + 1 })
          .where(eq(pomodoro_logs.date, today))
          .run();
      } else {
        // まだログがない場合は新規作成
        db.insert(pomodoro_logs)
          .values({ date: today, count: 1 })
          .run();
      }
    } catch (error) {
      console.error("Failed to log Pomodoro completion:", error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>{isRestRunning ? "Rest time" : "Pomodoro Timer"}</Text>
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{isRestRunning ? formatTime(restTime) : formatTime(pomodoroTime)}</Text>
      </View>
      {isRestRunning ? (
        <TouchableOpacity onPress={handleSkipRest} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip rest time</Text>
        </TouchableOpacity>
      ) :
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleStartStopPomodoro} style={styles.button}>
            <Text style={styles.buttonText}>{isPomodoroRunning ? "Stop" : "Start"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResetPomodoro} style={styles.button}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>}
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
  skipButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  skipButtonText: {
    fontSize: 18,
    color: "#fff",
  },
});
