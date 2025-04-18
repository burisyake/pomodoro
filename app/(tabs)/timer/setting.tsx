import { useState } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import { db } from "@/db/db";
import { settings } from "@/db/schema";

export default function SettingScreen() {
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [restMinutes, setRestMinutes] = useState(5);
  const [restSeconds, setRestSeconds] = useState(0);

  const saveTime = () => {
    const pomodoroTotalSeconds = pomodoroMinutes * 60 + pomodoroSeconds;
    const restTotalSeconds = restMinutes * 60 + restSeconds;

    if (pomodoroTotalSeconds > 0 && restTotalSeconds > 0) {
      try {
        db.insert(settings)
          .values({
            key: "pomodoro_time",
            value: String(pomodoroTotalSeconds),
          })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: String(pomodoroTotalSeconds) },
          })
          .run();
        db.insert(settings)
          .values({
            key: "rest_time",
            value: String(restTotalSeconds),
          })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: String(restTotalSeconds) },
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
      value: String(index),
    }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Set Timer</Text>

      <View style={styles.rowContainer}>
        <Text style={styles.label}>Pomodoro</Text>
        <View style={styles.pickerGroup}>
          <Picker
            selectedValue={String(pomodoroMinutes)}
            onValueChange={(itemValue) => setPomodoroMinutes(parseInt(itemValue, 10))}
            mode="dropdown"
            style={[styles.input]}
            itemStyle={styles.itemStyle}
          >
            {generatePickerItems(61).map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
          <Text style={styles.colon}>:</Text>
          <Picker
            selectedValue={String(pomodoroSeconds)}
            onValueChange={(itemValue) => setPomodoroSeconds(parseInt(itemValue, 10))}
            mode="dropdown"
            style={[styles.input]}
            itemStyle={styles.itemStyle}
          >
            {generatePickerItems(60).map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.rowContainer}>
        <Text style={styles.label}>Rest</Text>
        <View style={styles.pickerGroup}>
          <Picker
            selectedValue={String(restMinutes)}
            onValueChange={(itemValue) => setRestMinutes(parseInt(itemValue, 10))}
            mode="dropdown"
            style={[styles.input]}
            itemStyle={styles.itemStyle}
          >
            {generatePickerItems(26).map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
          <Text style={styles.colon}>:</Text>
          <Picker
            selectedValue={String(restSeconds)}
            onValueChange={(itemValue) => setRestSeconds(parseInt(itemValue, 10))}
            mode="dropdown"
            style={[styles.input]}
            itemStyle={styles.itemStyle}
          >
            {generatePickerItems(60).map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
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
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  label: {
    fontSize: 24,
    color: "#fff",
    flex: 1,
    alignItems: "center",
  },
  pickerGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 2,
  },
  colon: {
    fontSize: 24,
    color: "#fff",
    marginHorizontal: 8,
  },
  input: {
    fontSize: 24,
    color: "#fff",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderColor: "#fff",
    textAlign: "center",
    width: 100,
    height: 120,
  },
  itemStyle: {
    fontSize: 24,
    height: 120,
    color: "#fff",
  },
  button: {
    backgroundColor: "#696969",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 32,
    alignSelf: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
});