# Guide d'installation Supabase pour HabitFlow

Ce guide vous explique comment configurer Supabase pour synchroniser les données de HabitFlow.

## Étape 1 : Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - **Name** : HabitFlow (ou votre choix)
   - **Database Password** : Choisissez un mot de passe fort
   - **Region** : Choisissez la région la plus proche
5. Cliquez sur "Create new project" et attendez la création (2-3 minutes)

## Étape 2 : Récupérer les clés API

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez les valeurs suivantes :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (clé publique anonyme)

## Étape 3 : Configurer les variables d'environnement

1. Créez un fichier `.env` à la racine du projet (si ce n'est pas déjà fait)
2. Ajoutez les variables suivantes :

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-ici
```

3. **Important** : Ajoutez `.env` à votre `.gitignore` pour ne pas commiter vos clés

## Étape 4 : Exécuter le schéma SQL

1. Dans Supabase, allez dans **SQL Editor** (dans le menu de gauche)
2. Cliquez sur **New Query**
3. Ouvrez le fichier `supabase/schema.sql` dans votre éditeur
4. Copiez tout le contenu du fichier
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter / Cmd+Enter)

Le schéma va créer :
- Les tables (profiles, habits, habit_logs, user_gamification, user_badges, active_challenges, completed_challenges, custom_challenges, user_premium)
- Les index pour les performances
- Les politiques RLS (Row Level Security) pour la sécurité
- Les triggers pour la mise à jour automatique

## Étape 5 : Vérifier la configuration

1. Dans Supabase, allez dans **Table Editor**
2. Vous devriez voir toutes les tables créées
3. Vérifiez que les politiques RLS sont activées (icône de cadenas à côté de chaque table)

## Étape 6 : Tester l'application

1. Redémarrez votre serveur Expo : `npm start` ou `expo start`
2. Dans l'application :
   - Cliquez sur "SE CONNECTER"
   - Créez un compte avec un email et mot de passe
   - Ou connectez-vous si vous avez déjà un compte
3. Les données devraient se synchroniser automatiquement

## Fonctionnalités implémentées

### ✅ Authentification
- Inscription avec email/mot de passe
- Connexion
- Déconnexion
- Gestion de session persistante

### ✅ Synchronisation
- **Habitudes** : Création, modification, suppression synchronisées
- **Logs** : Chaque complétion d'habitude est synchronisée
- **Gamification** : XP, niveau, badges synchronisés
- **Challenges** : Défis actifs et complétés synchronisés
- **Premium** : Statut premium synchronisé
- **Profil** : Nom d'utilisateur synchronisé

### ✅ Temps réel
- Synchronisation automatique quand les données changent sur un autre appareil
- Abonnements Supabase Realtime activés

### ✅ Hors ligne
- File d'attente pour les opérations hors ligne
- Synchronisation automatique quand la connexion revient
- Vérification toutes les 30 secondes

### ✅ Migration
- Migration automatique des données locales vers Supabase lors de la première connexion
- Gestion des conflits (données cloud prioritaires)

## Dépannage

### Erreur "Invalid API key"
- Vérifiez que les variables d'environnement sont correctement définies
- Redémarrez le serveur Expo après avoir modifié `.env`

### Erreur "relation does not exist"
- Vérifiez que le schéma SQL a bien été exécuté dans Supabase
- Vérifiez que toutes les tables sont créées dans **Table Editor**

### Erreur "new row violates row-level security policy"
- Vérifiez que les politiques RLS sont bien créées
- Vérifiez que l'utilisateur est bien authentifié

### Les données ne se synchronisent pas
- Vérifiez votre connexion internet
- Vérifiez les logs dans la console (erreurs Supabase)
- Vérifiez que les abonnements temps réel sont activés dans Supabase (Settings > API > Realtime)

## Structure des tables

- **profiles** : Informations utilisateur (username)
- **habits** : Habitudes créées par l'utilisateur
- **habit_logs** : Logs de complétion quotidienne
- **user_gamification** : XP, niveau, total XP
- **user_badges** : Badges débloqués
- **active_challenges** : Défis actuellement en cours
- **completed_challenges** : Défis complétés
- **custom_challenges** : Défis personnalisés créés par l'utilisateur
- **user_premium** : Statut premium (plan, expiration, protections)

## Sécurité

- Toutes les tables ont RLS (Row Level Security) activé
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les clés API sont stockées de manière sécurisée (expo-secure-store)

## Prochaines étapes (optionnel)

- Ajouter la table `xp_history` si vous voulez stocker l'historique XP dans Supabase
- Implémenter la synchronisation bidirectionnelle avec résolution de conflits avancée
- Ajouter des webhooks Supabase pour des notifications serveur
- Implémenter la synchronisation partielle (seulement les données récentes)
