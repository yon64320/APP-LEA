import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SupportedStorage } from '@supabase/supabase-js';

// SecureStore a une limite de 2048 bytes par entrée.
// Le token JWT Supabase dépasse souvent cette limite.
// Solution : découper la valeur en chunks et les stocker séparément.
const CHUNK_SIZE = 1800;

async function setChunked(key: string, value: string): Promise<void> {
  const chunks = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }
  await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
  }
}

async function getChunked(key: string): Promise<string | null> {
  const countStr = await SecureStore.getItemAsync(`${key}_chunks`);
  if (!countStr) return null;
  const count = parseInt(countStr, 10);
  let result = '';
  for (let i = 0; i < count; i++) {
    const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
    if (chunk === null) return null;
    result += chunk;
  }
  return result;
}

async function removeChunked(key: string): Promise<void> {
  const countStr = await SecureStore.getItemAsync(`${key}_chunks`);
  if (countStr) {
    const count = parseInt(countStr, 10);
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
    }
  }
  await SecureStore.deleteItemAsync(`${key}_chunks`);
}

const ExpoSecureStoreAdapter: SupportedStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return getChunked(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    await setChunked(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    await removeChunked(key);
  },
};

export default ExpoSecureStoreAdapter;
