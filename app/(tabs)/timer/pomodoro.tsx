import { useState, useEffect, useCallback } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

export default function PomodoroScreen() {
  const [time, setTime] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadTimeSetting() {
        const storedTime = await AsyncStorage.getItem("pomodoro_time");
        if (storedTime) {
          setTime(parseInt(storedTime, 10));
        }
      }
      loadTimeSetting();
    }, [])
  )

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if(isRunning){
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
  }

  const handleReset = () => {
    setTime(100);
    setIsRunning(false);
  }

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
