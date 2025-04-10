import { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { db } from "@/db/db";
import { pomodoro_logs } from "@/db/schema";
import { and, gt, lt } from "drizzle-orm";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, subMonths, addMonths, startOfWeek } from "date-fns";
import { ja } from "date-fns/locale";
import { useFocusEffect } from "expo-router";

export default function LogScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logData, setLogData] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchLogData();
  }, [currentMonth]);

  const fetchLogData = useCallback(() => {
    const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const logs = db.select().from(pomodoro_logs).where(and(gt(pomodoro_logs.date, startDate), lt(pomodoro_logs.date, endDate))).all();
    const data: Record<string, number> = logs.reduce((acc, log) => {
      acc[log.date] = log.count;
      return acc;
    }, {} as Record<string, number>);
    setLogData(data);
  }, [currentMonth]);

  // 画面フォーカス時に最新のデータを取得
  useFocusEffect(
    useCallback(() => {
      fetchLogData();
    }, [fetchLogData])
  );

  const changeMonth = (direction: string) => {
    setCurrentMonth((prev) =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // 月初の日付の曜日を取得（0=日曜日, 1=月曜日, ..., 6=土曜日）
    const firstDayOfMonth = start.getDay(); // 月の最初の日が何曜日か
    console.log('firstDayOfMonth', firstDayOfMonth);

    // 月初の日付の曜日に合わせて前に空白の日を追加
    // 月曜日が0、日曜日が6になるように調整
    const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    console.log('paddingDays', paddingDays);

    // カレンダーの日付を作成
    const temp = [...Array(paddingDays).fill(null), ...days].map((date) => {
      return date ? {
        date: format(date, "yyyy-MM-dd"),
        display: format(date, "d", { locale: ja }),
        count: logData[format(date, "yyyy-MM-dd")] || 0,
      } : null;
    });
    console.log(temp);
    return temp;
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

      {/* 曜日の表示 */}
      <View style={styles.weekRow}>
        {["月", "火", "水", "木", "金", "土", "日"].map((day, index) => {
          const isSaturday = index === 5; // 土曜日
          const isSunday = index === 6; // 日曜日
          return (
            <View key={index} style={styles.dayOfWeek}>
              <Text style={[styles.weekDayText, isSaturday && styles.saturday, isSunday && styles.sunday]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>

      {/* カレンダーの日付表示 */}
      <FlatList
        data={generateCalendarDays()}
        keyExtractor={(item) => item ? item.date : ''}
        numColumns={7}
        renderItem={({ item }) => {
          if (item === null) {
            return <View style={styles.dayContainer} />;
          }
          return(
            <View style={styles.dayContainer}>
              <Text style={styles.dateText}>{item.display}</Text>
              {item.count > 0 && <Text style={styles.countText}>{item.count}</Text>}
              {item.count === 0 && <Text style={styles.countText}></Text>}
            </View>
          );
        }}
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
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayOfWeek: {
    width: "14.2%",
    alignItems: "center",
  },
  weekDayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  saturday: {
    color: 'deepskyblue',
  },
  sunday: {
    color: 'salmon',
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
