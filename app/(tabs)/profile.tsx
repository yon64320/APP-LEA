import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGamificationStore, BADGE_DEFINITIONS } from '../../src/store/gamificationStore';
import { usePremiumStore } from '../../src/store/premiumStore';
import { useAppStore } from '../../src/store/appStore';
import { useHabitStore } from '../../src/store/habitStore';
import { useAuthStore } from '../../src/store/authStore';
import { XPBar } from '../../src/components/gamification/XPBar';
import { BadgeCard } from '../../src/components/gamification/BadgeCard';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';

interface SettingItemProps {
  icon: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

function SettingItem({
  icon,
  iconColor,
  label,
  subtitle,
  onPress,
  showArrow = true,
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
        <Text style={styles.settingLabel}>{label}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const level = useGamificationStore((s) => s.level);
  const totalXP = useGamificationStore((s) => s.totalXP);
  const unlockedBadges = useGamificationStore((s) => s.unlockedBadges);
  const isPremium = usePremiumStore((s) => s.isPremium());
  const habits = useHabitStore((s) => s.habits);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const userName = useAppStore((s) => s.userName);
  const setUserName = useAppStore((s) => s.setUserName);

  const signOut = useAuthStore((s) => s.signOut);
  const userEmail = useAuthStore((s) => s.user?.email ?? '');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [draftName, setDraftName] = useState(userName);

  const allBadges = BADGE_DEFINITIONS.map((def) => {
    const unlocked = unlockedBadges.find((b) => b.id === def.id);
    return unlocked || { ...def, unlockedAt: undefined };
  });

  const getBadgeRequirementLabel = (badgeId: string) => {
    const badgeDef = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
    if (!badgeDef) return 'Condition inconnue';

    const { requirement } = badgeDef;
    if (requirement.type === 'streak') {
      return `Atteindre une série de ${requirement.value} jours consécutifs.`;
    }
    if (requirement.type === 'total_completions') {
      return `Compléter ${requirement.value} habitudes au total.`;
    }
    return `Maintenir un taux de réussite mensuel de ${Math.round(requirement.value * 100)}%.`;
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Supprimer toutes les données',
      'Cette action supprimera toutes tes habitudes, historique et progression. Elle est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: () => {
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
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => {
                setDraftName(userName);
                setShowEditProfile(true);
              }}
            >
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          {userEmail ? <Text style={styles.userEmail}>{userEmail}</Text> : null}
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={16} color={Colors.streakGold} />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {/* XP Bar */}
        <View style={styles.xpSection}>
          <XPBar />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Niveau</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unlockedBadges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgesGrid}>
            {allBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                size="medium"
                onPress={() => {
                  Alert.alert(
                    badge.name,
                    `${badge.description}\n\nCondition : ${getBadgeRequirementLabel(badge.id)}\n\nÉtat : ${badge.unlockedAt ? 'Badge obtenu 🎉' : 'Badge verrouillé'}`
                  );
                }}
              />
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <View style={styles.settingsCard}>
            {!isPremium && (
              <SettingItem
                icon="star"
                iconColor={Colors.streakGold}
                label="Passer à Premium"
                subtitle="Débloquer toutes les fonctionnalités"
                onPress={() => router.push('/premium')}
              />
            )}
            <SettingItem
              icon="notifications"
              iconColor={Colors.accent}
              label="Notifications"
              subtitle="Gérer les rappels"
              onPress={() => router.push('/notifications')}
            />
            <SettingItem
              icon="list"
              iconColor={Colors.primary}
              label="Mes habitudes"
              subtitle={`${habits.length} habitude${habits.length > 1 ? 's' : ''}`}
              onPress={() => router.push('/habits')}
            />
            <SettingItem
              icon="refresh"
              iconColor={Colors.warning}
              label="Relancer l'onboarding"
              subtitle="Revenir à l'écran de bienvenue"
              onPress={() => {
                Alert.alert(
                  'Relancer l\'onboarding',
                  'Cela te ramènera à l\'écran de bienvenue. Tes habitudes seront conservées.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Confirmer', onPress: resetOnboarding },
                  ]
                );
              }}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="download"
              iconColor={Colors.accent}
              label="Exporter mes données"
              onPress={() => {
                Alert.alert('Export', 'Fonctionnalité à venir');
              }}
            />
            <SettingItem
              icon="trash"
              iconColor={Colors.error}
              label="Réinitialiser l'application"
              subtitle="Action irréversible"
              onPress={handleDeleteAllData}
            />
          </View>
        </View>

        {/* Compte Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="log-out"
              iconColor={Colors.error}
              label="Se déconnecter"
              subtitle={userEmail}
              showArrow={false}
              onPress={() => {
                Alert.alert(
                  'Se déconnecter',
                  'Tu seras redirigé vers l\'écran de connexion. Tes données sont sauvegardées dans le cloud.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Se déconnecter',
                      style: 'destructive',
                      onPress: async () => {
                        await signOut();
                        router.replace('/auth/login');
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="information-circle" size={20} color={Colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingSubtitle}>1.0.0 (Build 42)</Text>
              </View>
            </View>
            <SettingItem
              icon="chatbubble-ellipses"
              iconColor={Colors.primary}
              label="Envoyer un avis"
              onPress={() => {
                // TODO: Open feedback
                Alert.alert('Avis', 'Fonctionnalité à venir');
              }}
            />
          </View>
        </View>

        {/* Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandName}>HabitFlow</Text>
          <Text style={styles.brandTagline}>
            Construis la discipline. Chaque jour compte.
          </Text>
          <Text style={styles.copyright}>HABITFLOW © 2024</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showEditProfile}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalCard}>
            <Text style={styles.editModalTitle}>Modifier le profil</Text>
            <TextInput
              style={styles.editNameInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Votre prénom"
              placeholderTextColor={Colors.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                if (draftName.trim()) {
                  setUserName(draftName.trim());
                  setShowEditProfile(false);
                }
              }}
            />
            <View style={styles.editModalActions}>
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalCancel]}
                onPress={() => setShowEditProfile(false)}
              >
                <Text style={styles.editModalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalSave]}
                onPress={() => {
                  if (!draftName.trim()) return;
                  setUserName(draftName.trim());
                  setShowEditProfile(false);
                }}
              >
                <Text style={styles.editModalSaveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    borderWidth: 2,
    borderColor: Colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.streakGold + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  premiumText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.streakGold,
  },
  xpSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-around',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 0, 0, 0.05)',
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
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  editModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    gap: Spacing.md,
  },
  editModalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  editNameInput: {
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  editModalButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  editModalCancel: {
    backgroundColor: Colors.surfaceLight,
  },
  editModalSave: {
    backgroundColor: Colors.primary,
  },
  editModalCancelText: {
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  editModalSaveText: {
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
  },
  branding: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  brandName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  brandTagline: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  copyright: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
