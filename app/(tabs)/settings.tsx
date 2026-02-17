import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChallengeStore } from '../../src/store/challengeStore';
import { ChallengeCard } from '../../src/components/challenges/ChallengeCard';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight } from '../../src/constants/layout';
import { useKeyboardToolbar } from '../../src/hooks/useKeyboardToolbar';
import { KeyboardToolbar } from '../../src/components/ui/KeyboardToolbar';

export default function ChallengesScreen() {
  const activeChallenges = useChallengeStore((s) => s.activeChallenges);
  const getActiveChallenge = useChallengeStore((s) => s.getActiveChallenge);
  const isChallengeCompleted = useChallengeStore((s) => s.isChallengeCompleted);
  const getAllChallenges = useChallengeStore((s) => s.getAllChallenges);
  const addCustomChallenge = useChallengeStore((s) => s.addCustomChallenge);
  const { isKeyboardVisible } = useKeyboardToolbar();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');

  const allChallenges = getAllChallenges();

  const availableChallenges = useMemo(() => {
    return allChallenges.filter((c) => !getActiveChallenge(c.id) && !isChallengeCompleted(c.id));
  }, [allChallenges, activeChallenges]);

  const activeChallengesList = useMemo(() => {
    return activeChallenges
      .filter((ac) => ac.status === 'active')
      .map((ac) => {
        const challenge = allChallenges.find((c) => c.id === ac.challengeId);
        return challenge ? { challenge, activeChallenge: ac } : null;
      })
      .filter((item): item is { challenge: typeof allChallenges[0]; activeChallenge: typeof activeChallenges[0] } => item !== null);
  }, [activeChallenges, allChallenges]);

  const completedChallenges = useMemo(() => {
    return allChallenges.filter((c) => isChallengeCompleted(c.id));
  }, [allChallenges, activeChallenges]);

  const handleCreateCustomChallenge = () => {
    if (!name.trim()) return;

    const challengeId = addCustomChallenge({
      name: name.trim(),
      description: description.trim() || 'Défi personnalisé',
      duration: Number(duration) || 30,
      icon: 'rocket',
      color: Colors.primary,
      category: 'personal_development',
      habitConfig: {
        name: name.trim(),
        type: 'binary',
        target: null,
        unit: null,
      },
    });

    setShowModal(false);
    setName('');
    setDescription('');
    setDuration('30');
    router.push(`/challenge/${challengeId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Défis</Text>
            <Text style={styles.subtitle}>Relevez des défis pour rester motivé</Text>
          </View>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowModal(true)}>
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Créer</Text>
          </TouchableOpacity>
        </View>

        {activeChallengesList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>En cours</Text>
            {activeChallengesList.map(({ challenge, activeChallenge }) => (
              <ChallengeCard key={challenge.id} challenge={challenge} activeChallenge={activeChallenge} onPress={() => router.push(`/challenge/${challenge.id}`)} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Défis disponibles ({availableChallenges.length})</Text>
          {availableChallenges.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="trophy-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Tous les défis ont été complétés !</Text>
            </View>
          ) : (
            availableChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} onPress={() => router.push(`/challenge/${challenge.id}`)} />
            ))
          )}
        </View>

        {completedChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Complétés ({completedChallenges.length})</Text>
            {completedChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} onPress={() => router.push(`/challenge/${challenge.id}`)} />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Créer un défi</Text>
            <TextInput style={styles.input} placeholder="Nom du défi" placeholderTextColor="#999" value={name} onChangeText={setName} />
            <TextInput style={[styles.input, styles.inputMultiline]} placeholder="Détails du défi" placeholderTextColor="#999" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
            <TextInput style={styles.input} placeholder="Durée en jours" placeholderTextColor="#999" keyboardType="numeric" value={duration} onChangeText={setDuration} returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateCustomChallenge}>
                <Text style={styles.saveText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
          <KeyboardToolbar visible={isKeyboardVisible} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  header: { marginBottom: Spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary },
  createButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 999 },
  createButtonText: { color: '#FFFFFF', fontWeight: FontWeight.semibold },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.md },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.md },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md, textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: Spacing.lg },
  modalCard: { backgroundColor: '#FFF', borderRadius: 14, padding: Spacing.lg, gap: Spacing.md },
  modalTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  input: { height: 48, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: Spacing.md, color: Colors.text },
  inputMultiline: { minHeight: 90, textAlignVertical: 'top', paddingTop: Spacing.sm },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
  cancelBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  cancelText: { color: Colors.textSecondary },
  saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 8 },
  saveText: { color: '#FFF', fontWeight: FontWeight.semibold },
});
