import { pushAllLocalData, pullUserData } from './index';
import { getUserId } from '../../utils/getUserId';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MIGRATION_FLAG_KEY = 'has_migrated_to_cloud';

/**
 * Vérifie si l'utilisateur a des données locales à migrer
 */
export async function hasLocalData(): Promise<boolean> {
  try {
    const habitStorage = await AsyncStorage.getItem('habit-storage');
    if (!habitStorage) return false;
    
    const parsed = JSON.parse(habitStorage);
    return parsed?.state?.habits?.length > 0 || parsed?.state?.logs?.length > 0;
  } catch {
    return false;
  }
}

/**
 * Vérifie si la migration a déjà été effectuée
 */
export async function hasMigrated(): Promise<boolean> {
  try {
    const flag = await AsyncStorage.getItem(MIGRATION_FLAG_KEY);
    return flag === 'true';
  } catch {
    return false;
  }
}

/**
 * Marque la migration comme effectuée
 */
export async function markAsMigrated(): Promise<void> {
  await AsyncStorage.setItem(MIGRATION_FLAG_KEY, 'true');
}

/**
 * Migre les données locales vers Supabase
 * Stratégie: Push local → Pull cloud (pour résoudre les conflits)
 */
export async function migrateLocalDataToCloud(): Promise<void> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const migrated = await hasMigrated();
  if (migrated) {
    // Migration déjà effectuée, juste charger les données cloud
    await pullUserData(userId);
    return;
  }

  const hasLocal = await hasLocalData();
  if (!hasLocal) {
    // Pas de données locales, juste charger depuis le cloud
    await pullUserData(userId);
    await markAsMigrated();
    return;
  }

  // Migrer: push local → pull cloud (le cloud gagne en cas de conflit)
  try {
    await pushAllLocalData(userId);
    // Attendre un peu pour que Supabase traite les données
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Recharger depuis le cloud (résout les conflits)
    await pullUserData(userId);
    await markAsMigrated();
  } catch (error) {
    console.error('Migration error:', error);
    // En cas d'erreur, on charge quand même depuis le cloud
    await pullUserData(userId);
    await markAsMigrated();
  }
}
