import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { db } from "@/db/db";
import { pomodoro_logs } from "@/db/schema";
import { and, gt, lt } from "drizzle-orm";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, subMonths, addMonths } from "date-fns";
import { ja } from "date-fns/locale";

export default function LogScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logData, setLogData] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchLogData();
  }, [currentMonth]);

  const fetchLogData = () => {
    const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const logs = db.select().from(pomodoro_logs).where(and(gt(pomodoro_logs.date, startDate), lt(pomodoro_logs.date, endDate))).all();
    const data: Record<string, number> = logs.reduce((acc, log) => {
      acc[log.date] = log.count;
      return acc;
    }, {} as Record<string, number>);
    setLogData(data);
  };

  const changeMonth = (direction: string) => {
    setCurrentMonth((prev) =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end }).map((date) => {
      return {
        date: format(date, "yyyy-MM-dd"),
        display: format(date, "d", { locale: ja }),
        count: logData[format(date, "yyyy-MM-dd")] || 0,
      };
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth("prev")}>
          <Text style={styles.navButton}>＜</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{format(currentMonth, "yyyy年 M月", { locale: ja })}</Text>
        <TouchableOpacity onPress={() => changeMonth("next")}>
          <Text style={styles.navButton}>＞</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={generateCalendarDays()}
        keyExtractor={(item) => item.date}
        numColumns={7}
        renderItem={({ item }) => (
          <View style={styles.dayContainer}>
            <Text style={styles.dateText}>{item.display}</Text>
            {item.count > 0 && <Text style={styles.countText}>{item.count}</Text>}
          </View>
        )}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    fontSize: 24,
    color: "#fff",
  },
  monthText: {
    fontSize: 20,
    color: "#fff",
  },
  dayContainer: {
    width: "14.2%",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  dateText: {
    fontSize: 18,
    color: "#fff",
  },
  countText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6347",
  },
});
