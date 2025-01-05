import { Tabs } from "expo-router";

export default function TimerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarPosition: 'top',
        tabBarActiveTintColor: "#ffd33d",
        headerStyle: {
          backgroundColor: "#25292e",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#25292e",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Pomodoro' }} />
      <Tabs.Screen name="countdown" options={{ title: 'Setting' }} />
    </Tabs>
  );
}
