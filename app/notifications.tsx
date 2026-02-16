import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { requestNotificationPermissions } from '../src/services/notifications';
import { Colors } from '../src/constants/colors';
import { Spacing, FontSize, FontWeight } from '../src/constants/layout';

export default function NotificationsScreen() {
  const [enabled, setEnabled] = useState(true);

  const handleEnable = async (value: boolean) => {
    setEnabled(value);
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Notifications', 'Autorisation non accordée. Active les notifications depuis les paramètres système.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Rappels d'habitudes</Text>
            <Text style={styles.hint}>Active ou désactive les rappels quotidiens.</Text>
          </View>
          <Switch value={enabled} onValueChange={handleEnable} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    padding: Spacing.lg,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md },
  label: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  hint: { color: Colors.textSecondary, marginTop: 4 },
});
