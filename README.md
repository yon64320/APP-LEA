# HabitFlow

Une application mobile et web de suivi d'habitudes développée avec React Native et Expo, permettant aux utilisateurs de créer, suivre et analyser leurs habitudes quotidiennes.

## 📱 À propos de l'application

HabitFlow est une application de suivi d'habitudes qui aide les utilisateurs à :
- **Créer des habitudes personnalisées** ou choisir parmi des habitudes prédéfinies
- **Suivre leur progression quotidienne** avec des indicateurs visuels
- **Maintenir des séries (streaks)** pour rester motivés
- **Consulter l'historique** et les statistiques de leurs habitudes
- **Personnaliser leurs habitudes** avec des couleurs, icônes et objectifs

## 🎯 Fonctionnalités principales

### Dashboard (Accueil)
- Vue d'ensemble des habitudes du jour
- Indicateur de progression quotidienne
- Affichage des séries actuelles et meilleures séries
- Accès rapide pour marquer les habitudes comme complétées

### Gestion des habitudes
- **Types d'habitudes** :
  - Binaires (complété/non complété)
  - Quantitatives (avec objectif et unité)
- **Fréquences personnalisables** :
  - Quotidienne
  - Hebdomadaire
  - Personnalisée (jours spécifiques)
- **Personnalisation** :
  - Couleurs personnalisées
  - Icônes (Ionicons)
  - Notes et rappels

### Onboarding
- Sélection de catégories d'intérêt
- Choix parmi des habitudes prédéfinies par catégorie :
  - Santé (boire de l'eau, manger sainement, etc.)
  - Sport (course, musculation, yoga, etc.)
  - Productivité (méditation, lecture, etc.)
  - Développement personnel
  - Sommeil
  - Lecture

### Historique et statistiques
- Calendrier de suivi (heatmap)
- Statistiques par habitude :
  - Série actuelle
  - Meilleure série
  - Taux de complétion
  - Nombre total de complétions

## 🏗️ Structure du projet

```
App-LEA/
├── app/                          # Routes et écrans (Expo Router)
│   ├── _layout.tsx              # Layout racine de l'application
│   ├── index.tsx                # Point d'entrée (redirection)
│   ├── (tabs)/                  # Navigation par onglets
│   │   ├── _layout.tsx          # Layout des onglets
│   │   ├── index.tsx            # Dashboard principal
│   │   ├── history.tsx          # Page d'historique
│   │   └── settings.tsx         # Paramètres
│   ├── habit/                   # Gestion des habitudes
│   │   ├── [id].tsx            # Détails d'une habitude (route dynamique)
│   │   └── create.tsx           # Création d'une nouvelle habitude
│   └── onboarding/              # Processus d'onboarding
│       ├── _layout.tsx          # Layout de l'onboarding
│       ├── index.tsx            # Étape 1 : Sélection des catégories
│       ├── goals.tsx            # Étape intermédiaire
│       └── habits.tsx           # Étape 2 : Sélection des habitudes
│
├── src/                          # Code source principal
│   ├── components/               # Composants React
│   │   ├── dashboard/           # Composants du dashboard
│   │   │   ├── DailyProgress.tsx    # Barre de progression quotidienne
│   │   │   └── StreakDisplay.tsx    # Affichage des séries
│   │   ├── habit/               # Composants liés aux habitudes
│   │   │   ├── HabitCard.tsx         # Carte d'affichage d'habitude
│   │   │   └── HabitForm.tsx         # Formulaire de création/édition
│   │   ├── history/             # Composants de l'historique
│   │   │   ├── CalendarHeatmap.tsx  # Calendrier de suivi
│   │   │   └── StatsCard.tsx        # Carte de statistiques
│   │   └── ui/                  # Composants UI réutilisables
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── ColorPicker.tsx
│   │       ├── IconPicker.tsx
│   │       └── ProgressBar.tsx
│   │
│   ├── constants/               # Constantes et configurations
│   │   ├── colors.ts           # Palette de couleurs de l'app
│   │   ├── layout.ts           # Constantes de mise en page (spacing, fonts, etc.)
│   │   └── presets.ts           # Habitudes prédéfinies
│   │
│   ├── store/                   # Gestion d'état (Zustand)
│   │   ├── appStore.ts          # État global de l'app (onboarding, etc.)
│   │   └── habitStore.ts         # État des habitudes et logs
│   │
│   ├── types/                   # Définitions TypeScript
│   │   └── index.ts             # Types et interfaces
│   │
│   └── utils/                   # Fonctions utilitaires
│       ├── date.ts              # Utilitaires de manipulation de dates
│       ├── stats.ts             # Calculs de statistiques
│       └── streak.ts             # Calculs de séries
│
├── assets/                      # Ressources statiques
│   ├── icon.png                 # Icône de l'application
│   ├── adaptive-icon.png        # Icône adaptative (Android)
│   ├── splash-icon.png          # Icône de splash screen
│   └── favicon.png              # Favicon (web)
│
├── app.json                     # Configuration Expo
├── babel.config.js              # Configuration Babel
├── metro.config.js              # Configuration Metro bundler
├── package.json                 # Dépendances et scripts
└── tsconfig.json                # Configuration TypeScript
```

## 🛠️ Technologies utilisées

### Framework et outils
- **Expo SDK 54** - Framework React Native
- **React Native 0.81.5** - Framework mobile
- **Expo Router 6.0.23** - Navigation basée sur les fichiers
- **TypeScript 5.9.2** - Typage statique

### Gestion d'état
- **Zustand 4.5.5** - Gestion d'état légère et performante
- **AsyncStorage** - Persistance des données locales

### UI et animations
- **React Native Reanimated 4.1.1** - Animations performantes (mobile uniquement)
- **React Native Gesture Handler 2.28.0** - Gestion des gestes
- **Expo Haptics** - Retour haptique (mobile uniquement)
- **Ionicons** - Bibliothèque d'icônes

### Autres dépendances
- **React Native Safe Area Context** - Gestion des zones sûres
- **React Native Screens** - Optimisation des écrans
- **UUID** - Génération d'identifiants uniques

## 📦 Installation et démarrage

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI (installé globalement ou via npx)

### Installation

```bash
# Installer les dépendances
npm install --legacy-peer-deps

# Démarrer le serveur de développement
npm start

# Ou pour une plateforme spécifique :
npm run ios      # iOS
npm run android  # Android
npm run web      # Web
```

### Scripts disponibles

```bash
npm start        # Démarrer Expo
npm run ios      # Démarrer sur iOS
npm run android  # Démarrer sur Android
npm run web      # Démarrer sur le web
```

## 🎨 Architecture et patterns

### Gestion d'état
L'application utilise **Zustand** pour la gestion d'état avec persistance :
- `appStore` : État global (onboarding, catégories sélectionnées)
- `habitStore` : État des habitudes et logs avec persistance AsyncStorage

### Navigation
Utilisation d'**Expo Router** avec un système de routes basé sur les fichiers :
- Routes statiques : `/`, `/history`, `/settings`
- Routes dynamiques : `/habit/[id]` pour les détails d'habitude
- Groupes de routes : `(tabs)` pour la navigation par onglets

### Types d'habitudes
- **Binaires** : Habitudes simples (fait/pas fait)
- **Quantitatives** : Habitudes avec objectif numérique (ex: "Boire 2L d'eau")

### Fréquences
- **Quotidienne** : Tous les jours
- **Hebdomadaire** : Jours spécifiques de la semaine
- **Personnalisée** : Sélection manuelle des jours

## 🔧 Configuration spéciale

### Support Web
L'application est configurée pour fonctionner sur le web avec :
- Configuration Metro pour transformer les modules ES
- Désactivation conditionnelle de `react-native-reanimated` sur le web
- Utilisation de la version CommonJS de Zustand pour éviter les problèmes avec `import.meta`

### Configuration Babel
- Plugin `babel-plugin-transform-import-meta` pour le support web
- Plugin `react-native-reanimated/plugin` pour les animations (mobile uniquement)
- Polyfill `unstable_transformImportMeta` pour Hermes (mobile)

## 📱 Plateformes supportées

- ✅ iOS
- ✅ Android
- ✅ Web (avec certaines limitations)

## 🚀 Fonctionnalités futures possibles

- Synchronisation cloud
- Rappels et notifications push
- Graphiques et analyses avancées
- Partage de progrès
- Défis et objectifs communautaires
- Export de données

## 📝 Notes de développement

### Limitations Web
- `react-native-reanimated` n'est pas supporté sur le web (désactivé automatiquement)
- Les haptiques ne fonctionnent pas sur le web
- Certaines animations peuvent être limitées

### Persistance des données
Les données sont stockées localement via AsyncStorage :
- Habitudes : `habit-storage`
- Logs : `habit-storage`
- État de l'app : `app-storage`

## 📄 Licence

Ce projet est privé.

---

Développé avec ❤️ en utilisant React Native et Expo
