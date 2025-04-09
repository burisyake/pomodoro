import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { db } from '@/db/db'; // db.tsからインポート
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { pomodoro_logs } from '@/db/schema';
import { and, gte, lte } from "drizzle-orm";
import { useFocusEffect } from 'expo-router';

export default function DashBoardScreen() {
  const [todayPomodoro, setTodayPomodoro] = useState<number>(99); // 今日のPomodoro数
  const [yesterdayPomodoro, setYesterdayPomodoro] = useState<number>(99); // 昨日のPomodoro数
  const [theDayBeforeYesterdayPomodoro, setTheDayBeforeYesterdayCountPomodoro] = useState<number>(99); // 一昨日のPomodoro数
  const [weekPomodoro, setWeekPomodoro] = useState<number>(99); // 今週のPomodoro数
  const [weekAveragePomodoro, setWeekAveragePomodoro] = useState<number>(99); // 今週の平均Pomodoro数
  const [weekMaxPomodoro, setWeekMaxPomodoro] = useState<number>(99); // 今週の最高Pomodoro数
  const [monthPomodoro, setMonthPomodoro] = useState<number>(99); // 今月のPomodoro数
  const [monthAveragePomodoro, setMonthAveragePomodoro] = useState<number>(99); // 今月の平均Pomodoro数
  const [monthMaxPomodoro, setMonthMaxPomodoro] = useState<number>(99); // 今月の最高Pomodoro数
  const [yearPomodoro, setYearPomodoro] = useState<number>(99); // 今年のPomodoro数
  const [yearAveragePomodoro, setYearAveragePomodoro] = useState<number>(99); // 今年の平均Pomodoro数
  const [yearMaxPomodoro, setYearMaxPomodoro] = useState<number>(99); // 今年の最高Pomodoro数
  const [totalPomodoro, setTotalPomodoro] = useState<number>(99); // 累計Pomodoro数
  const [totalAveragePomodoro, setTotalAveragePomodoro] = useState<number>(99); // 過去の平均Pomodoro数
  const [totalMaxPomodoro, setTotalMaxPomodoro] = useState<number>(99); // 過去の最高Pomodoro数
  // 今日
  const _today = new Date();
  const today = new Date().toLocaleDateString('en-CA');
  const dayOfWeek = _today.getDay(); // 今日の曜日
  // 昨日
  const _yesterday = new Date();
  _yesterday.setDate(_yesterday.getDate() - 1);
  const yesterday = _yesterday.toLocaleDateString('en-CA');
  // 一昨日
  const _theDayBeforeYesterday = new Date();
  _theDayBeforeYesterday.setDate(_theDayBeforeYesterday.getDate() - 2);
  const theDayBeforeYesterday = _theDayBeforeYesterday.toLocaleDateString('en-CA');
  // 今週月曜日
  const _firstDayOfThisWeek = new Date(_today);
  _firstDayOfThisWeek.setDate(_today.getDate() - dayOfWeek + 1);
  const firstDayOfThisWeek = _firstDayOfThisWeek.getFullYear() + '-' + (_firstDayOfThisWeek.getMonth() + 1).toString().padStart(2, '0') + '-' + _firstDayOfThisWeek.getDate().toString().padStart(2, '0');

  // 今月1日
  const _firstDayOfThisMonth = new Date(_today.getFullYear(), _today.getMonth(), 1);
  const firstDayOfThisMonth = _firstDayOfThisMonth.getFullYear() + '-' + (_firstDayOfThisMonth.getMonth() + 1).toString().padStart(2, '0') + '-' + _firstDayOfThisMonth.getDate().toString().padStart(2, '0');

  // 今年1日
  const _firstDayOfThisYear = new Date(_today.getFullYear(), 0, 1);
  const firstDayOfThisYear = _firstDayOfThisYear.getFullYear() + '-' + (_firstDayOfThisYear.getMonth() + 1).toString().padStart(2, '0') + '-' + _firstDayOfThisYear.getDate().toString().padStart(2, '0');

  // 累計Pomodoro数を取得する
  const fetchPomodoroCount = () => {
    const result = db
      .select()
      .from(pomodoro_logs)
      .all();

    if (result) {
      // 今日
      const todayCount = result.filter(item => item.date === today).reduce((sum, item) => sum + Number(item.count), 0);
      setTodayPomodoro(todayCount);
      // 昨日
      const yesterdayCount = result.filter(item => item.date === yesterday).reduce((sum, item) => sum + Number(item.count), 0);
      setYesterdayPomodoro(yesterdayCount);
      // 一昨日
      const theDayBeforeYesterdayCount = result.filter(item => item.date === theDayBeforeYesterday).reduce((sum, item) => sum + Number(item.count), 0);
      setTheDayBeforeYesterdayCountPomodoro(theDayBeforeYesterdayCount);
      // 今週
      const weekCount = result.filter(item => item.date >= firstDayOfThisWeek).reduce((sum, item) => sum + Number(item.count), 0);
      setWeekPomodoro(weekCount);
      // 今週の平均
      setWeekAveragePomodoro(Math.round((weekCount / 7) * 10) / 10);
      // 今週の最高
      const weekMaxCount = result.filter(item => item.date >= firstDayOfThisWeek).reduce((max, item) => Math.max(max, Number(item.count)), 0);
      setWeekMaxPomodoro(weekMaxCount);
      // 今月
      const monthCount = result.filter(item => item.date >= firstDayOfThisMonth).reduce((sum, item) => sum + Number(item.count), 0);
      setMonthPomodoro(monthCount);
      // 今月の平均
      setMonthAveragePomodoro(Math.round((monthCount / 30) * 10) / 10);
      // 今月の最高
      const monthMaxCount = result.filter(item => item.date >= firstDayOfThisMonth).reduce((max, item) => Math.max(max, Number(item.count)), 0);
      setMonthMaxPomodoro(monthMaxCount);
      // 今年
      const yearCount = result.filter(item => item.date >= firstDayOfThisYear).reduce((sum, item) => sum + Number(item.count), 0);
      setYearPomodoro(yearCount);
      // 今年の平均
      setYearAveragePomodoro(Math.round((yearCount / 365) * 10) / 10);
      // 今年の最高
      const yearMaxCount = result.filter(item => item.date >= firstDayOfThisYear).reduce((max, item) => Math.max(max, Number(item.count)), 0);
      setYearMaxPomodoro(yearMaxCount);
      // 累計
      const totalCount = result.reduce((sum, item) => sum + Number(item.count), 0);
      setTotalPomodoro(totalCount);
      // 過去の平均
      const firstPomodoroDate: Date = new Date(result.reduce((oldest, item) => {
        return new Date(item.date) < new Date(oldest.date) ? item : oldest; // 一番最初のPomodoroの完了日を取得
      }, result[0]).date);
      const totalMilliTime = new Date().getTime() - firstPomodoroDate.getTime(); // 何日前かを計算(ミリ秒単位)
      const totalDays = Math.floor(totalMilliTime / (1000 * 60 * 60 * 24)); // 単位をミリ秒から日に変換
      setTotalAveragePomodoro(Math.round((yearCount / totalDays) * 10) / 10);
      // 過去の最高
      const totalMaxCount = result.reduce((max, item) => Math.max(max, Number(item.count)), 0);
      setTotalMaxPomodoro(totalMaxCount);
    }
  };

  // 画面フォーカス時に最新のデータを取得
  useFocusEffect(
    useCallback(() => {
      fetchPomodoroCount();
    }, [fetchPomodoroCount])
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>今日</Text>
          <Text style={styles.statValue}>{todayPomodoro}回</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>昨日</Text>
          <Text style={styles.statValue}>{yesterdayPomodoro}回</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>一昨日</Text>
          <Text style={styles.statValue}>{theDayBeforeYesterdayPomodoro}回</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>今週</Text>
          <Text style={styles.statValue}>{weekPomodoro}回</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>今週の平均</Text>
          <Text style={styles.statValue}>{weekAveragePomodoro}回</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>今週の最高</Text>
          <Text style={styles.statValue}>{weekMaxPomodoro}回</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>今月</Text>
          <Text style={styles.statValue}>{monthPomodoro}回</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>今月の平均</Text>
          <Text style={styles.statValue}>{monthAveragePomodoro}回</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>今月の最高</Text>
          <Text style={styles.statValue}>{monthMaxPomodoro}回</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>今年</Text>
          <Text style={styles.statValue}>{yearPomodoro}回</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>今年の平均</Text>
          <Text style={styles.statValue}>{yearAveragePomodoro}回</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>今年の最高</Text>
          <Text style={styles.statValue}>{yearMaxPomodoro}回</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>累計</Text>
          <Text style={styles.statValue}>{totalPomodoro}回</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>過去の平均</Text>
          <Text style={styles.statValue}>{totalAveragePomodoro}回</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>過去の最高</Text>
          <Text style={styles.statValue}>{totalMaxPomodoro}回</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#3a3a3a',
    padding: 20,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
  },
  statLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
