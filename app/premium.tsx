import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePremiumStore } from '../src/store/premiumStore';
import { Colors } from '../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../src/constants/layout';

const FEATURES = [
  {
    icon: 'infinite',
    title: 'Habitudes illimitées',
    description: 'Crée autant d\'habitudes que tu veux',
  },
  {
    icon: 'shield-checkmark',
    title: 'Protection de série',
    description: '1 protection par semaine pour sauver ta série',
  },
  {
    icon: 'stats-chart',
    title: 'Statistiques avancées',
    description: 'Graphiques détaillés et analyses approfondies',
  },
  {
    icon: 'cloud-upload',
    title: 'Synchronisation cloud',
    description: 'Sauvegarde et synchronise sur tous tes appareils',
  },
  {
    icon: 'color-palette',
    title: 'Personnalisation',
    description: 'Thèmes et couleurs personnalisés',
  },
  {
    icon: 'star',
    title: 'Support prioritaire',
    description: 'Accès en priorité au support client',
  },
];

export default function PremiumScreen() {
  const isPremium = usePremiumStore((s) => s.isPremium());
  const setPlan = usePremiumStore((s) => s.setPlan);

  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    // In a real app, this would integrate with payment processing
    // For now, we'll just set the plan
    setPlan(plan);
    Alert.alert('Abonnement activé', 'Merci pour votre abonnement Premium !');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="star" size={48} color={Colors.streakGold} />
          </View>
          <Text style={styles.heroTitle}>Passe à Premium</Text>
          <Text style={styles.heroSubtitle}>
            Débloque toutes les fonctionnalités et maximise ta discipline
          </Text>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingSection}>
          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              !isPremium && styles.pricingCardHighlighted,
            ]}
            onPress={() => handleSubscribe('monthly')}
            disabled={isPremium}
          >
            <Text style={styles.pricingLabel}>Mensuel</Text>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingPrice}>4,99€</Text>
              <Text style={styles.pricingPeriod}>/mois</Text>
            </View>
            {isPremium && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Actuel</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Yearly Plan */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              !isPremium && styles.pricingCardHighlighted,
            ]}
            onPress={() => handleSubscribe('yearly')}
            disabled={isPremium}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Le plus populaire</Text>
            </View>
            <Text style={styles.pricingLabel}>Annuel</Text>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingPrice}>39€</Text>
              <Text style={styles.pricingPeriod}>/an</Text>
            </View>
            <Text style={styles.pricingSavings}>Économise 20%</Text>
            {isPremium && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Actuel</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Fonctionnalités Premium</Text>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: Colors.primary + '20' },
                ]}
              >
                <Ionicons
                  name={feature.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        {!isPremium && (
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => handleSubscribe('yearly')}
            >
              <Text style={styles.ctaButtonText}>Commencer Premium</Text>
            </TouchableOpacity>
            <Text style={styles.ctaSubtext}>
              Annule à tout moment. Aucun engagement.
            </Text>
          </View>
        )}

        {isPremium && (
          <View style={styles.premiumActiveCard}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
            <Text style={styles.premiumActiveText}>
              Vous êtes déjà Premium !
            </Text>
            <Text style={styles.premiumActiveSubtext}>
              Profitez de toutes les fonctionnalités
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.streakGold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  pricingSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    position: 'relative',
  },
  pricingCardHighlighted: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  popularBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  pricingLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  pricingPrice: {
    fontSize: 36,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  pricingPeriod: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  pricingSavings: {
    fontSize: FontSize.sm,
    color: Colors.success,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.xs,
  },
  currentBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  currentBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.success,
  },
  featuresSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  ctaSection: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  ctaSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  premiumActiveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success + '40',
    marginTop: Spacing.lg,
  },
  premiumActiveText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.success,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  premiumActiveSubtext: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
