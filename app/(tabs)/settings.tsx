import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';
import { useHabitStore } from '../../src/store/habitStore';
import { Colors } from '../../src/constants/colors';
import {
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
} from '../../src/constants/layout';

interface SettingItemProps {
  icon: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
}

function SettingItem({
  icon,
  iconColor,
  label,
  subtitle,
  onPress,
  destructive,
}: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={iconColor}
        />
      </View>
      <View style={styles.settingInfo}>
        <Text
          style={[
            styles.settingLabel,
            destructive && { color: Colors.error },
          ]}
        >
          {label}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const habits = useHabitStore((s) => s.habits);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);

  const handleResetOnboarding = () => {
    Alert.alert(
      'Relancer l\'onboarding',
      'Cela te ramènera à l\'écran de bienvenue. Tes habitudes seront conservées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: resetOnboarding,
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Supprimer toutes les données',
      'Cette action supprimera toutes tes habitudes et ton historique. Elle est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: () => {
            // Delete all habits one by one
            const deleteHabit = useHabitStore.getState().deleteHabit;
            const allHabits = useHabitStore.getState().habits;
            allHabits.forEach((h) => deleteHabit(h.id));
            resetOnboarding();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Réglages</Text>

        {/* App section */}
        <Text style={styles.sectionTitle}>Application</Text>
        <View style={styles.section}>
          <SettingItem
            icon="list"
            iconColor={Colors.accent}
            label="Mes habitudes"
            subtitle={`${habits.length} habitude${habits.length > 1 ? 's' : ''}`}
            onPress={() => {}}
          />
          <SettingItem
            icon="refresh"
            iconColor={Colors.warning}
            label="Relancer l'onboarding"
            subtitle="Revenir à l'écran de bienvenue"
            onPress={handleResetOnboarding}
          />
        </View>

        {/* About section */}
        <Text style={styles.sectionTitle}>À propos</Text>
        <View style={styles.section}>
          <SettingItem
            icon="information-circle"
            iconColor={Colors.primary}
            label="Version"
            subtitle="1.0.0"
            onPress={() => {}}
          />
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionTitle}>Zone dangereuse</Text>
        <View style={styles.section}>
          <SettingItem
            icon="trash"
            iconColor={Colors.error}
            label="Supprimer toutes les données"
            subtitle="Action irréversible"
            onPress={handleDeleteAllData}
            destructive
          />
        </View>

        {/* Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandName}>HabitFlow</Text>
          <Text style={styles.brandTagline}>
            Construis la discipline. Chaque jour compte.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  settingSubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  branding: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  brandName: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  brandTagline: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
});
