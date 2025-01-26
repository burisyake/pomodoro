import { useState } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RNPickerSelect from "react-native-picker-select";
import { db } from "@/db/db";
import { settings } from "@/db/schema";

export default function SettingScreen() {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [selectedSeconds, setSelectedSeconds] = useState(0);

  const saveTime = () => {
    const totalSeconds = selectedMinutes * 60 + selectedSeconds;

    if (totalSeconds > 0) {
      try {
        db.insert(settings)
          .values({
            key: "pomodoro_time",
            value: String(totalSeconds),
          })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: String(totalSeconds) },
          })
          .run();
        alert("Time setting saved!");
      } catch (error) {
        console.error("Failed to save time:", error);
        alert("Failed to save time.");
      }
    } else {
      alert("Please select a valid time.");
    }
  };

  // 分と秒の選択肢を生成
  const generatePickerItems = (range: number) =>
    Array.from({ length: range }, (_, index) => ({
      label: String(index),
      value: index,
    }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.text}>Set Timer</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.text}>Pomodoro</Text>
        {/* 分のピッカー */}
        <RNPickerSelect
          onValueChange={(value) => setSelectedMinutes(value)}
          items={generatePickerItems(61)}
          value={selectedMinutes}
          placeholder={{}}
          style={{
            inputIOS: styles.input,
            inputAndroid: styles.input,
          }}
        />
        <Text style={styles.colon}>:</Text>
        {/* 秒のピッカー */}
        <RNPickerSelect
          onValueChange={(value) => setSelectedSeconds(value)}
          items={generatePickerItems(60)}
          value={selectedSeconds}
          placeholder={{}}
          style={{
            inputIOS: styles.input,
            inputAndroid: styles.input,
          }}
        />
      </View>

      <TouchableOpacity onPress={saveTime} style={styles.button}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  text: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 16,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  colon: {
    fontSize: 24,
    color: "#fff",
    marginHorizontal: 8,
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
  input: {
    fontSize: 24,
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#fff",
    textAlign: "center",
    width: 100,
  }
});
