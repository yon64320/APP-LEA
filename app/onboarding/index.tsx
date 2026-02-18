import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';
import Svg, { Path } from 'react-native-svg';

// Composant pour le symbole infini (∞) - Material Symbols all_inclusive
const InfinityIcon = ({ size = 64, color = Colors.primary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M18.6 6.62c-.1-.1-.21-.18-.32-.24-.11-.06-.23-.1-.35-.12-.12-.02-.25-.02-.38 0-.13.02-.25.06-.35.12-.11.06-.21.14-.32.24L12 10.66 7.17 6.62c-.1-.1-.21-.18-.32-.24-.11-.06-.23-.1-.35-.12-.12-.02-.25-.02-.38 0-.13.02-.25.06-.35.12-.11.06-.21.14-.32.24-.1.1-.18.21-.24.32-.06.11-.1.23-.12.35-.02.12-.02.25 0 .38.02.13.06.25.12.35.06.11.14.21.24.32L10.34 12l-3.83 3.84c-.1.1-.18.21-.24.32-.06.11-.1.23-.12.35-.02.12-.02.25 0 .38.02.13.06.25.12.35.06.11.14.21.24.32.1.1.21.18.32.24.11.06.23.1.35.12.12.02.25.02.38 0 .13-.02.25-.06.35-.12.11-.06.21-.14.32-.24L12 13.34l4.83 4.04c.1.1.21.18.32.24.11.06.23.1.35.12.12.02.25.02.38 0 .13-.02.25-.06.35-.12.11-.06.21-.14.32-.24.1-.1.18-.21.24-.32.06-.11.1-.23.12-.35.02-.12.02-.25 0-.38-.02-.13-.06-.25-.12-.35-.06-.11-.14-.21-.24-.32L13.66 12l3.83-3.84c.1-.1.18-.21.24-.32.06-.11.1-.23.12-.35.02-.12.02-.25 0-.38-.02-.13-.06-.25-.12-.35-.06-.11-.14-.21-.24-.32z"
      fill={color}
    />
  </Svg>
);

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Spacer */}
        <View style={styles.topSpacer} />

        {/* Center Identity Section */}
        <View style={styles.content}>
          {/* Minimalist Logo - bg-primary/5 */}
          <View style={styles.iconContainer}>
            <InfinityIcon size={56} color={Colors.primary} />
            {/* Subtle decorative border */}
            <View style={styles.iconBorder} />
          </View>

          {/* App Name */}
          <Text style={styles.title}>HabitFlow</Text>

          {/* Tagline */}
          <Text style={styles.subtitle}>
            Construis la discipline.{'\n'}Chaque jour compte.
          </Text>
        </View>

        {/* Bottom Action Area */}
        <View style={styles.bottom}>
          {/* Primary Action */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/onboarding/goals')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>COMMENCER</Text>
          </TouchableOpacity>

          {/* Secondary Action (Ghost) */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginText}>SE CONNECTER</Text>
          </TouchableOpacity>

          {/* Optional: Version or legal subtle text */}
          <View style={styles.indicator}>
            <View style={styles.indicatorLine} />
          </View>
        </View>
      </SafeAreaView>

      {/* Decorative background elements */}
      <View style={styles.decorativeBg}>
        <View style={[styles.blurCircle, styles.blurCircle1]} />
        <View style={[styles.blurCircle, styles.blurCircle2]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  topSpacer: {
    height: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 12, // rounded-xl
    backgroundColor: 'rgba(128, 0, 0, 0.05)', // bg-primary/5
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBorder: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)', // border-primary/10
  },
  title: {
    color: Colors.primary,
    fontSize: 36, // text-4xl
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5, // tracking-tight
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(128, 0, 0, 0.7)', // text-primary/70
    fontSize: FontSize.base, // text-base
    fontWeight: FontWeight.normal,
    textAlign: 'center',
    lineHeight: 24, // leading-relaxed
    maxWidth: 280,
  },
  bottom: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    gap: Spacing.md,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 56, // h-14
    backgroundColor: Colors.primary,
    borderRadius: 8, // rounded-lg
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm, // text-sm
    fontWeight: FontWeight.bold,
    letterSpacing: 2, // tracking-widest
    textTransform: 'uppercase',
  },
  loginLink: {
    width: '100%',
    height: 56, // h-14
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  loginText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  indicator: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  indicatorLine: {
    width: 96, // w-24
    height: 4, // h-1
    borderRadius: 9999, // rounded-full
    backgroundColor: 'rgba(128, 0, 0, 0.1)', // bg-primary/10
  },
  decorativeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
  },
  blurCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(128, 0, 0, 0.05)', // bg-primary/5
  },
  blurCircle1: {
    width: 256, // w-64
    height: 256, // h-64
    top: -96, // -top-24
    left: -96, // -left-24
    opacity: 0.5, // blur-3xl effect
  },
  blurCircle2: {
    width: 320, // w-80
    height: 320, // h-80
    bottom: 192, // bottom-48
    right: -96, // -right-24
    opacity: 0.5,
  },
});
