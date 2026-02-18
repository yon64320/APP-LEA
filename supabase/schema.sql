-- ============================================
-- SCHEMA SUPABASE POUR HABITFLOW
-- ============================================
-- Exécutez ce script dans le SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query

-- ============================================
-- 1. TABLE PROFILES (Extension de auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', 'Utilisateur')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. TABLE HABITS
-- ============================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('binary', 'quantitative')),
  target NUMERIC,
  unit TEXT,
  frequency JSONB NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT,
  reminder JSONB,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABLE HABIT_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

-- ============================================
-- 4. TABLE USER_GAMIFICATION
-- ============================================
CREATE TABLE IF NOT EXISTS user_gamification (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TABLE USER_BADGES
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- 6. TABLE ACTIVE_CHALLENGES (Challenges actifs)
-- ============================================
CREATE TABLE IF NOT EXISTS active_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'failed')),
  completed_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- ============================================
-- 7. TABLE COMPLETED_CHALLENGES
-- ============================================
CREATE TABLE IF NOT EXISTS completed_challenges (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_id)
);

-- ============================================
-- 8. TABLE CUSTOM_CHALLENGES
-- ============================================
CREATE TABLE IF NOT EXISTS custom_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  duration INTEGER NOT NULL,
  habit_config JSONB NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. TABLE XP_HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. TABLE USER_PREMIUM
-- ============================================
CREATE TABLE IF NOT EXISTS user_premium (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'monthly', 'yearly')) DEFAULT 'free',
  expires_at TIMESTAMPTZ,
  streak_protections_used INTEGER NOT NULL DEFAULT 0,
  last_protection_reset TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. INDEXES POUR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_created ON habits(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_logs_user_habit_date ON habit_logs(user_id, habit_id, date);
CREATE INDEX IF NOT EXISTS idx_logs_user_date ON habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_logs_user_habit ON habit_logs(user_id, habit_id);

CREATE INDEX IF NOT EXISTS idx_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user_badge ON user_badges(user_id, badge_id);

CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON active_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_user_status ON active_challenges(user_id, status);
CREATE INDEX IF NOT EXISTS idx_challenges_user_challenge ON active_challenges(user_id, challenge_id);

CREATE INDEX IF NOT EXISTS idx_custom_challenges_user_id ON custom_challenges(user_id);

CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_user_date ON xp_history(user_id, date DESC);

-- ============================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_premium ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITIQUES RLS POUR PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- POLITIQUES RLS POUR HABITS
-- ============================================
DROP POLICY IF EXISTS "Users can view own habits" ON habits;
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own habits" ON habits;
CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habits" ON habits;
CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS POUR HABIT_LOGS
-- ============================================
DROP POLICY IF EXISTS "Users can view own logs" ON habit_logs;
CREATE POLICY "Users can view own logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own logs" ON habit_logs;
CREATE POLICY "Users can insert own logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own logs" ON habit_logs;
CREATE POLICY "Users can update own logs"
  ON habit_logs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own logs" ON habit_logs;
CREATE POLICY "Users can delete own logs"
  ON habit_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS POUR USER_GAMIFICATION
-- ============================================
DROP POLICY IF EXISTS "Users can view own gamification" ON user_gamification;
CREATE POLICY "Users can view own gamification"
  ON user_gamification FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own gamification" ON user_gamification;
CREATE POLICY "Users can insert own gamification"
  ON user_gamification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own gamification" ON user_gamification;
CREATE POLICY "Users can update own gamification"
  ON user_gamification FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS POUR USER_BADGES
-- ============================================
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;
CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS POUR ACTIVE_CHALLENGES
-- ============================================
DROP POLICY IF EXISTS "Users can view own active challenges" ON active_challenges;
CREATE POLICY "Users can view own active challenges"
  ON active_challenges FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own active challenges" ON active_challenges;
CREATE POLICY "Users can insert own active challenges"
  ON active_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own active challenges" ON active_challenges;
CREATE POLICY "Users can update own active challenges"
  ON active_challenges FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own active challenges" ON active_challenges;
CREATE POLICY "Users can delete own active challenges"
  ON active_challenges FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS POUR COMPLETED_CHALLENGES
-- ============================================
DROP POLICY IF EXISTS "Users can view own completed challenges" ON completed_challenges;
CREATE POLICY "Users can view own completed challenges"
  ON completed_challenges FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own completed challenges" ON completed_challenges;
CREATE POLICY "Users can insert own completed challenges"
  ON completed_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS POUR CUSTOM_CHALLENGES
-- ============================================
DROP POLICY IF EXISTS "Users can view own custom challenges" ON custom_challenges;
CREATE POLICY "Users can view own custom challenges"
  ON custom_challenges FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own custom challenges" ON custom_challenges;
CREATE POLICY "Users can insert own custom challenges"
  ON custom_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own custom challenges" ON custom_challenges;
CREATE POLICY "Users can update own custom challenges"
  ON custom_challenges FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own custom challenges" ON custom_challenges;
CREATE POLICY "Users can delete own custom challenges"
  ON custom_challenges FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS POUR XP_HISTORY
-- ============================================
DROP POLICY IF EXISTS "Users can view own xp history" ON xp_history;
CREATE POLICY "Users can view own xp history"
  ON xp_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own xp history" ON xp_history;
CREATE POLICY "Users can insert own xp history"
  ON xp_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS POUR USER_PREMIUM
-- ============================================
DROP POLICY IF EXISTS "Users can view own premium" ON user_premium;
CREATE POLICY "Users can view own premium"
  ON user_premium FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own premium" ON user_premium;
CREATE POLICY "Users can insert own premium"
  ON user_premium FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own premium" ON user_premium;
CREATE POLICY "Users can update own premium"
  ON user_premium FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 13. FUNCTIONS UTILITAIRES
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_habit_logs_updated_at ON habit_logs;
CREATE TRIGGER update_habit_logs_updated_at
  BEFORE UPDATE ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_active_challenges_updated_at ON active_challenges;
CREATE TRIGGER update_active_challenges_updated_at
  BEFORE UPDATE ON active_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_challenges_updated_at ON custom_challenges;
CREATE TRIGGER update_custom_challenges_updated_at
  BEFORE UPDATE ON custom_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN DU SCHEMA
-- ============================================
