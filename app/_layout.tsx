import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';

// react-native-reanimated n'est pas bien supporté sur le web
if (Platform.OS !== 'web') {
  require('react-native-reanimated');
}
import { useAppStore } from '../src/store/appStore';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/constants/colors';
import { subscribeToRealtime, unsubscribeFromRealtime } from '../src/services/sync/realtime';
import { startQueueProcessor } from '../src/services/sync/queueProcessor';

export default function RootLayout() {
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const { session, loading, initialize } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        await initialize();
        setIsReady(true);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'));
        console.error('Error initializing app:', e);
        setIsReady(true);
      }
    };
    setup();
  }, []);

  // Initialiser les abonnements temps réel et le processeur de file d'attente
  useEffect(() => {
    if (!isReady || loading || !session) return;

    const userId = session.user.id;
    
    // Abonnements temps réel
    subscribeToRealtime(userId);

    // Processeur de file d'attente hors ligne (vérifie toutes les 30 secondes)
    const stopProcessor = startQueueProcessor(30000);

    return () => {
      unsubscribeFromRealtime();
      stopProcessor();
    };
  }, [isReady, loading, session]);

  // Redirection initiale au démarrage de l'app
  useEffect(() => {
    if (!isReady || loading) return;

    const { isSupabaseConfigured } = require('../src/lib/supabase');

    if (!isSupabaseConfigured()) {
      router.replace(hasCompletedOnboarding ? '/(tabs)' : '/onboarding');
      return;
    }

    if (!session) {
      router.replace('/auth/login');
    } else if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, loading]);

  // Gérer les changements de session après le chargement initial
  useEffect(() => {
    if (!isReady || loading) return;

    const { isSupabaseConfigured } = require('../src/lib/supabase');
    if (!isSupabaseConfigured()) return;

    // Si la session change et devient null, rediriger vers login
    if (!session) {
      router.replace('/auth/login');
    }
  }, [session, isReady, loading]);

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: Colors.text }}>Error: {error.message}</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (!isReady || loading) {
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
        <Stack.Screen name="auth" options={{ headerShown: false, animation: 'fade' }} />
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
        <Stack.Screen
          name="challenge/[id]"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="history/day"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="premium"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
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
    backgroundColor: Colors.backgroundOnboarding,
  },
});
