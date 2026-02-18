import { processQueue, getQueue } from './offlineQueue';
import * as habitSync from './habitSync';
import * as gamificationSync from './gamificationSync';
import * as challengeSync from './challengeSync';
import * as premiumSync from './premiumSync';
import { getUserId } from '../../utils/getUserId';
import { OfflineOperation } from './offlineQueue';

/**
 * Traite une opération de la file d'attente
 */
async function processOperation(operation: OfflineOperation): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  switch (operation.type) {
    case 'habit':
      if (operation.action === 'create' || operation.action === 'update') {
        await habitSync.upsertHabit(operation.data, userId);
      } else if (operation.action === 'delete') {
        await habitSync.deleteHabit(operation.data.id, userId);
      }
      break;

    case 'log':
      if (operation.action === 'update' || operation.action === 'create') {
        await habitSync.upsertHabitLog(operation.data.log, userId, operation.data.habitId);
      }
      break;

    case 'gamification':
      if (operation.action === 'update') {
        await gamificationSync.upsertGamification(
          userId,
          operation.data.xp,
          operation.data.level,
          operation.data.totalXP
        );
      } else if (operation.action === 'create' && operation.data.event) {
        // XP events ne sont pas stockés dans Supabase pour l'instant
        // On peut juste mettre à jour les stats globales
        const { useGamificationStore } = require('../../store/gamificationStore');
        const state = useGamificationStore.getState();
        await gamificationSync.upsertGamification(userId, state.xp, state.level, state.totalXP);
      }
      break;

    case 'badge':
      if (operation.action === 'create') {
        await gamificationSync.upsertBadge(userId, operation.data);
      }
      break;

    case 'challenge':
      if (operation.action === 'create') {
        if (operation.data.isCustom) {
          await challengeSync.upsertCustomChallenge(userId, operation.data.challenge);
        } else if (operation.data.type === 'completed') {
          await challengeSync.upsertCompletedChallenge(userId, operation.data.challengeId);
        } else {
          await challengeSync.upsertActiveChallenge(userId, operation.data);
        }
      } else if (operation.action === 'update') {
        await challengeSync.upsertActiveChallenge(userId, operation.data);
      }
      break;

    case 'premium':
      if (operation.action === 'update') {
        await premiumSync.upsertPremium(
          userId,
          operation.data.plan,
          operation.data.expiresAt,
          operation.data.streakProtectionsUsed,
          operation.data.lastProtectionReset
        );
      }
      break;
  }
}

/**
 * Traite toute la file d'attente hors ligne
 */
export async function processOfflineQueue(): Promise<void> {
  await processQueue(processOperation);
}

/**
 * Vérifie et traite la file d'attente périodiquement
 */
export function startQueueProcessor(intervalMs: number = 30000): () => void {
  let intervalId: NodeJS.Timeout | null = null;

  const checkAndProcess = async () => {
    const queue = await getQueue();
    if (queue.length > 0) {
      await processOfflineQueue();
    }
  };

  intervalId = setInterval(checkAndProcess, intervalMs);

  // Traiter immédiatement au démarrage
  checkAndProcess();

  // Retourner une fonction pour arrêter le processeur
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}
