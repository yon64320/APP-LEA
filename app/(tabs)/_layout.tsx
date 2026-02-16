import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { FontSize, FontWeight } from '../../src/constants/layout';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // bg-white/80
          borderTopColor: 'rgba(128, 0, 0, 0.1)', // border-primary/10
          borderTopWidth: 1,
          height: 72, // pb-6 pt-2
          paddingBottom: 24,
          paddingTop: 8,
          position: 'absolute',
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9CA3AF', // text-gray-400
        tabBarLabelStyle: {
          fontSize: 10, // text-[10px]
          fontWeight: FontWeight.bold,
          letterSpacing: 1, // tracking-wider
          textTransform: 'uppercase',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "bar-chart" : "bar-chart-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Défis',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "trophy" : "trophy-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
