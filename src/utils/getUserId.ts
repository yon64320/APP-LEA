import { useAuthStore } from '../store/authStore';

/**
 * Récupère l'ID de l'utilisateur actuellement connecté
 */
export function getUserId(): string | null {
  const user = useAuthStore.getState().user;
  return user?.id ?? null;
}
