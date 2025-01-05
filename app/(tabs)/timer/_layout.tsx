import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TimerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarPosition: 'top',
        tabBarActiveTintColor: "#ffd33d",
        headerShown: false,
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
      <Tabs.Screen 
        name="pomodoro"
        options={{
          title: 'Pomodoro',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
                name={focused ? "hourglass" : "hourglass-outline"}
                color={color}
                size={24}
              />
          ),
        }}
      />
      <Tabs.Screen 
        name="setting"
        options={{
          title: 'Setting',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
                name={focused ? "settings" : "settings-outline"}
                color={color}
                size={24}
              />
          ),
        }}
      />
    </Tabs>
  );
}
