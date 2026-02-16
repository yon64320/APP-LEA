import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/appStore';

export default function Index() {
    const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);

    // Redirige vers l'onboarding si pas terminé, sinon vers l'app principale (tabs)
    return <Redirect href={!hasCompletedOnboarding ? "/onboarding" : "/(tabs)"} />;
}
