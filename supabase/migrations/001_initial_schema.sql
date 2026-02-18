-- =============================================================
-- HabitFlow — Schéma initial Supabase
-- Exécuter dans : Supabase Dashboard > SQL Editor > New query
-- =============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLES
-- =============================================================

-- Profils utilisateurs (étend auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name   TEXT NOT NULL DEFAULT 'Utilisateur',
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habitudes
CREATE TABLE IF NOT EXISTS habits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('binary', 'quantitative')),
  target      NUMERIC,
  unit        TEXT,
  color       TEXT NOT NULL DEFAULT '#800000',
  icon        TEXT NOT NULL DEFAULT 'checkmark',
  category    TEXT,
  frequency   JSONB NOT NULL DEFAULT '{"type":"daily","days":[0,1,2,3,4,5,6]}',
  reminder    JSONB,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

-- Logs de completion des habitudes
CREATE TABLE IF NOT EXISTS habit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id    UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  value       NUMERIC NOT NULL DEFAULT 0,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (habit_id, date)
);

-- Gamification : XP et niveau
CREATE TABLE IF NOT EXISTS user_gamification (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp          INTEGER NOT NULL DEFAULT 0,
  level       INTEGER NOT NULL DEFAULT 1,
  total_xp    INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Badges débloqués
CREATE TABLE IF NOT EXISTS user_badges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id      TEXT NOT NULL,
  unlocked_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

-- Historique XP
CREATE TABLE IF NOT EXISTS xp_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Défis actifs
CREATE TABLE IF NOT EXISTS active_challenges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id    TEXT NOT NULL,
  habit_id        UUID REFERENCES habits(id) ON DELETE SET NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  completed_days  INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

-- Défis complétés (historique)
CREATE TABLE IF NOT EXISTS completed_challenges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id    TEXT NOT NULL,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

-- Défis personnalisés créés par l'utilisateur
CREATE TABLE IF NOT EXISTS custom_challenges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  icon          TEXT NOT NULL DEFAULT 'trophy',
  color         TEXT NOT NULL DEFAULT '#800000',
  duration      INTEGER NOT NULL DEFAULT 30,
  habit_config  JSONB NOT NULL DEFAULT '{}',
  category      TEXT NOT NULL DEFAULT 'health',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plan premium
CREATE TABLE IF NOT EXISTS user_premium (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                      TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'monthly', 'yearly')),
  expires_at                TIMESTAMPTZ,
  streak_protections_used   INTEGER NOT NULL DEFAULT 0,
  last_protection_reset     TIMESTAMPTZ,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- Chaque utilisateur ne voit que ses propres données
-- =============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_premium ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "users_own_habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_gamification" ON user_gamification FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_badges" ON user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_xp_history" ON xp_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_active_challenges" ON active_challenges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_completed_challenges" ON completed_challenges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_custom_challenges" ON custom_challenges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_premium" ON user_premium FOR ALL USING (auth.uid() = user_id);

-- =============================================================
-- TRIGGER : Créer profil automatiquement à l'inscription
-- =============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer le profil avec le nom fourni à l'inscription
  INSERT INTO profiles (id, user_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', 'Utilisateur')
  );

  -- Initialiser la gamification
  INSERT INTO user_gamification (user_id) VALUES (NEW.id);

  -- Initialiser le plan premium (gratuit par défaut)
  INSERT INTO user_premium (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger existant s'il y en a un, puis le recréer
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- INDEX pour les performances
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_active_challenges_user_id ON active_challenges(user_id);
