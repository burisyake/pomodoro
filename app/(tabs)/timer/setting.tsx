import { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingScreen() {
  const [inputTime, setInputTime] = useState("1500");

  const saveTime = async () => {
    const parsedTime = parseInt(inputTime, 10);
    await AsyncStorage.setItem("pomodoro_time", String(parsedTime));
    alert("Time setting saved!");
  }

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
