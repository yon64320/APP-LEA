import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';

// react-native-reanimated n'est pas bien supporté sur le web
if (Platform.OS !== 'web') {
  require('react-native-reanimated');
}
import { useAppStore } from '../src/store/appStore';
import { Colors } from '../src/constants/colors';

export default function RootLayout() {
  const hasCompletedOnboarding = useAppStore(
    (s) => s.hasCompletedOnboarding
  );
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      setIsReady(true);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      console.error('Error initializing app:', e);
    }
  }, []);

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: Colors.text }}>Error: {error.message}</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="habit/create"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="habit/[id]"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
