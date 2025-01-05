import { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function SettingScreen() {
  return (
    <GestureHandlerRootView style={styles.container}>
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
