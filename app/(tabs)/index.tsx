import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Index() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if(isRunning){
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
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
    setTime(0);
    setIsRunning(false);
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text>{time}</Text>
      <TouchableOpacity onPress={handleStartStop}>
        <Text>{isRunning ? "Stop" : "Start"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleReset}>
        <Text>Reset</Text>
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
