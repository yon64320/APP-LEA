import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_QUEUE_KEY = 'offline_sync_queue';

export interface OfflineOperation {
  id: string;
  type: 'habit' | 'log' | 'gamification' | 'badge' | 'challenge' | 'premium';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

/**
 * Vérifie si l'appareil est en ligne
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

/**
 * Ajoute une opération à la file d'attente hors ligne
 */
export async function queueOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp'>): Promise<void> {
  const queue = await getQueue();
  const newOperation: OfflineOperation = {
    ...operation,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  queue.push(newOperation);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Récupère la file d'attente
 */
export async function getQueue(): Promise<OfflineOperation[]> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Traite la file d'attente quand l'appareil est en ligne
 */
export async function processQueue(
  processFn: (operation: OfflineOperation) => Promise<void>
): Promise<void> {
  const online = await isOnline();
  if (!online) return;

  const queue = await getQueue();
  if (queue.length === 0) return;

  const processed: string[] = [];
  const errors: OfflineOperation[] = [];

  for (const operation of queue) {
    try {
      await processFn(operation);
      processed.push(operation.id);
    } catch (error) {
      console.error('Error processing offline operation:', error);
      errors.push(operation);
    }
  }

  // Retirer les opérations traitées avec succès
  const remainingQueue = queue.filter((op) => !processed.includes(op.id));
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
}

/**
 * Vide la file d'attente
 */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}
