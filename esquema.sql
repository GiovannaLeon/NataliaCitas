-- NataliaCitas - esquema base de base de datos
-- Motor objetivo: PostgreSQL 15+
-- Este archivo define la estructura principal del backend para la plataforma:
-- autenticacion, perfiles, fotos, matches, favoritos, conversaciones,
-- mensajes, suscripciones, auditoria basica y datos semilla.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE user_role_enum AS ENUM ('member', 'moderator', 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
    CREATE TYPE user_status_enum AS ENUM ('pending_verification', 'active', 'suspended', 'blocked', 'deleted');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'looking_for_enum') THEN
    CREATE TYPE looking_for_enum AS ENUM (
      'Hombre busca mujeres',
      'Mujer busca hombres',
      'Hombre busca hombres',
      'Mujer busca mujeres'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_goal_enum') THEN
    CREATE TYPE relationship_goal_enum AS ENUM (
      'Algo a corto plazo',
      'Conexion discreta recurrente',
      'Conocer y ver que pasa',
      'Solo conversacion privada'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'photo_visibility_enum') THEN
    CREATE TYPE photo_visibility_enum AS ENUM ('private', 'members_only', 'public');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status_enum') THEN
    CREATE TYPE match_status_enum AS ENUM ('suggested', 'liked', 'matched', 'dismissed', 'blocked');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_status_enum') THEN
    CREATE TYPE conversation_status_enum AS ENUM ('active', 'archived', 'blocked', 'deleted');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sender_type_enum') THEN
    CREATE TYPE sender_type_enum AS ENUM ('user', 'system');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type_enum') THEN
    CREATE TYPE message_type_enum AS ENUM ('text', 'image', 'system_notice');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status_enum') THEN
    CREATE TYPE subscription_status_enum AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'expired');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status_enum') THEN
    CREATE TYPE report_status_enum AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  username CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'member',
  status user_status_enum NOT NULL DEFAULT 'pending_verification',
  email_verified_at TIMESTAMPTZ,
  accepted_terms_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT users_username_length CHECK (char_length(username) BETWEEN 4 AND 40)
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(80),
  birth_date DATE,
  age SMALLINT GENERATED ALWAYS AS (
    CASE
      WHEN birth_date IS NULL THEN NULL
      ELSE EXTRACT(YEAR FROM age(CURRENT_DATE, birth_date))::SMALLINT
    END
  ) STORED,
  country VARCHAR(80) NOT NULL DEFAULT 'Peru',
  city VARCHAR(80) NOT NULL DEFAULT 'Lima',
  district VARCHAR(80),
  postal_code VARCHAR(20),
  occupation VARCHAR(120),
  headline VARCHAR(140),
  greeting VARCHAR(80),
  about_me TEXT,
  discretion_style TEXT,
  looking_for looking_for_enum NOT NULL DEFAULT 'Mujer busca hombres',
  relationship_goal relationship_goal_enum NOT NULL DEFAULT 'Algo a corto plazo',
  height_label VARCHAR(20),
  weight_label VARCHAR(20),
  response_time_label VARCHAR(120),
  last_seen_label VARCHAR(120),
  is_profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
  profile_completion_percent SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profile_completion_percent_range CHECK (profile_completion_percent BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  original_filename TEXT,
  mime_type VARCHAR(100),
  file_size_bytes INTEGER,
  width_px INTEGER,
  height_px INTEGER,
  blurhash VARCHAR(255),
  visibility photo_visibility_enum NOT NULL DEFAULT 'members_only',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profile_photos_unique_sort UNIQUE (user_id, sort_order)
);

CREATE UNIQUE INDEX IF NOT EXISTS profile_photos_one_primary_idx
  ON profile_photos(user_id)
  WHERE is_primary = TRUE;

CREATE TABLE IF NOT EXISTS profile_interests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest_label VARCHAR(80) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_ideal_plans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_label VARCHAR(120) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_boundaries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  boundary_label VARCHAR(160) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_prompts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, favorite_user_id),
  CONSTRAINT favorites_not_self CHECK (user_id <> favorite_user_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status match_status_enum NOT NULL DEFAULT 'suggested',
  matched_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT matches_not_self CHECK (user_a_id <> user_b_id),
  CONSTRAINT matches_pair_order CHECK (user_a_id::TEXT < user_b_id::TEXT)
);

CREATE UNIQUE INDEX IF NOT EXISTS matches_pair_unique_idx
  ON matches(user_a_id, user_b_id);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID UNIQUE REFERENCES matches(id) ON DELETE SET NULL,
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status conversation_status_enum NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  is_muted BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_type sender_type_enum NOT NULL DEFAULT 'user',
  message_type message_type_enum NOT NULL DEFAULT 'text',
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  purpose VARCHAR(40) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'PEN',
  includes_chat_priority BOOLEAN NOT NULL DEFAULT FALSE,
  includes_private_gallery BOOLEAN NOT NULL DEFAULT FALSE,
  includes_week_trial BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  status subscription_status_enum NOT NULL DEFAULT 'trial',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
  external_provider VARCHAR(40),
  external_reference VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  provider VARCHAR(40) NOT NULL,
  provider_payment_id VARCHAR(120),
  amount NUMERIC(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'PEN',
  payment_status VARCHAR(40) NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status_enum NOT NULL DEFAULT 'open',
  reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profile_reports_not_self CHECK (reporter_user_id <> reported_user_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_name VARCHAR(80) NOT NULL,
  entity_id TEXT NOT NULL,
  action_name VARCHAR(80) NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_lookup ON user_profiles(looking_for, city, district);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_interests_user_interest
  ON profile_interests(user_id, lower(interest_label));
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sent_at ON messages(conversation_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status, matched_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_reports_status ON profile_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id, expires_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_user_profiles_set_updated_at ON user_profiles;
CREATE TRIGGER trg_user_profiles_set_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_matches_set_updated_at ON matches;
CREATE TRIGGER trg_matches_set_updated_at
BEFORE UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_conversations_set_updated_at ON conversations;
CREATE TRIGGER trg_conversations_set_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_user_subscriptions_set_updated_at ON user_subscriptions;
CREATE TRIGGER trg_user_subscriptions_set_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- Datos semilla para planes
INSERT INTO plans (code, name, description, price_monthly, currency, includes_chat_priority, includes_private_gallery, includes_week_trial)
VALUES
  ('free', 'Plan Free', 'Acceso base a exploracion, favoritos y chat limitado.', 0, 'PEN', FALSE, FALSE, FALSE),
  ('trial_week', 'Semana de prueba', 'Activa beneficios premium por siete dias.', 19.90, 'PEN', TRUE, TRUE, TRUE),
  ('premium', 'Premium discreto', 'Chat prioritario, galeria privada y soporte preferente.', 79.90, 'PEN', TRUE, TRUE, FALSE)
ON CONFLICT (code) DO NOTHING;

-- Datos semilla de usuarios demo inspirados en el front actual
WITH seed_users AS (
  INSERT INTO users (email, username, password_hash, status, accepted_terms_at, accepted_marketing, email_verified_at, last_login_at)
  VALUES
    ('valeria@nataliacitas.demo', 'valeria', crypt('ValeriaDemo#2026', gen_salt('bf', 10)), 'active', NOW(), TRUE, NOW(), NOW()),
    ('camila@nataliacitas.demo', 'camila', crypt('CamilaDemo#2026', gen_salt('bf', 10)), 'active', NOW(), FALSE, NOW(), NOW()),
    ('luciana@nataliacitas.demo', 'luciana', crypt('LucianaDemo#2026', gen_salt('bf', 10)), 'active', NOW(), FALSE, NOW(), NOW()),
    ('renata@nataliacitas.demo', 'renata', crypt('RenataDemo#2026', gen_salt('bf', 10)), 'active', NOW(), FALSE, NOW(), NOW()),
    ('sebastian@nataliacitas.demo', 'sebastian', crypt('SebastianDemo#2026', gen_salt('bf', 10)), 'active', NOW(), TRUE, NOW(), NOW()),
    ('mateo@nataliacitas.demo', 'mateo', crypt('MateoDemo#2026', gen_salt('bf', 10)), 'active', NOW(), FALSE, NOW(), NOW()),
    ('adrian@nataliacitas.demo', 'adrian', crypt('AdrianDemo#2026', gen_salt('bf', 10)), 'active', NOW(), FALSE, NOW(), NOW()),
    ('thiago@nataliacitas.demo', 'thiago', crypt('ThiagoDemo#2026', gen_salt('bf', 10)), 'active', NOW(), FALSE, NOW(), NOW()),
    ('giovanna@nataliacitas.demo', 'Giovanna', crypt('GiovannaDemo#2026', gen_salt('bf', 10)), 'active', NOW(), TRUE, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
  RETURNING id, username
)
SELECT 1;

INSERT INTO user_profiles (
  user_id,
  display_name,
  birth_date,
  country,
  city,
  district,
  postal_code,
  occupation,
  headline,
  greeting,
  about_me,
  discretion_style,
  looking_for,
  relationship_goal,
  height_label,
  weight_label,
  response_time_label,
  last_seen_label,
  is_profile_complete,
  profile_completion_percent
)
SELECT
  u.id,
  CASE u.username
    WHEN 'valeria' THEN 'Valeria'
    WHEN 'camila' THEN 'Camila'
    WHEN 'luciana' THEN 'Luciana'
    WHEN 'renata' THEN 'Renata'
    WHEN 'sebastian' THEN 'Sebastian'
    WHEN 'mateo' THEN 'Mateo'
    WHEN 'adrian' THEN 'Adrian'
    WHEN 'thiago' THEN 'Thiago'
    ELSE 'Giovanna'
  END,
  CASE u.username
    WHEN 'valeria' THEN DATE '1996-04-18'
    WHEN 'camila' THEN DATE '1993-09-02'
    WHEN 'luciana' THEN DATE '1998-11-23'
    WHEN 'renata' THEN DATE '1995-01-29'
    WHEN 'sebastian' THEN DATE '1994-06-12'
    WHEN 'mateo' THEN DATE '1991-07-08'
    WHEN 'adrian' THEN DATE '1997-12-15'
    WHEN 'thiago' THEN DATE '1992-03-10'
    ELSE DATE '1996-02-10'
  END,
  'Peru',
  'Lima',
  CASE u.username
    WHEN 'valeria' THEN 'Miraflores'
    WHEN 'camila' THEN 'San Isidro'
    WHEN 'luciana' THEN 'Barranco'
    WHEN 'renata' THEN 'La Molina'
    WHEN 'sebastian' THEN 'Miraflores'
    WHEN 'mateo' THEN 'San Isidro'
    WHEN 'adrian' THEN 'Barranco'
    WHEN 'thiago' THEN 'La Molina'
    ELSE 'Miraflores'
  END,
  '15074',
  CASE u.username
    WHEN 'valeria' THEN 'Direccion creativa freelance'
    WHEN 'camila' THEN 'Consultoria financiera'
    WHEN 'luciana' THEN 'Fotografia y contenido editorial'
    WHEN 'renata' THEN 'Arquitectura interior'
    WHEN 'sebastian' THEN 'Estrategia comercial'
    WHEN 'mateo' THEN 'Abogacia corporativa'
    WHEN 'adrian' THEN 'Produccion audiovisual'
    WHEN 'thiago' THEN 'Tecnologia y producto digital'
    ELSE 'Product manager'
  END,
  CASE u.username
    WHEN 'valeria' THEN 'Sutil, elegante y directa cuando siente quimica.'
    WHEN 'camila' THEN 'Refinada, clara y con gusto por la tension bien llevada.'
    WHEN 'luciana' THEN 'Intensa, curiosa y con energia dificil de ignorar.'
    WHEN 'renata' THEN 'Serena al inicio, muy intensa cuando se siente segura.'
    WHEN 'sebastian' THEN 'Seguro, reservado y con una calma que engancha.'
    WHEN 'mateo' THEN 'Sobrio, interesante y con gusto por los buenos detalles.'
    WHEN 'adrian' THEN 'Magnetico, curioso y con energia muy presente.'
    WHEN 'thiago' THEN 'Paciente, elegante y muy atento a las senales.'
    ELSE 'Lista para probar la experiencia completa de NataliaCitas.'
  END,
  CASE u.username
    WHEN 'Giovanna' THEN 'Hola, quiero conocer perfiles con quimica real y buena conversacion.'
    ELSE 'Prefiero hablar primero por chat y moverme solo si fluye.'
  END,
  CASE u.username
    WHEN 'Giovanna' THEN 'Perfil de prueba creado para validar registro, favoritos, chat y edicion de perfil desde el frontend Angular.'
    ELSE 'Perfil demo cargado desde esquema.sql para que backend pueda probar exploracion, perfil, match y chat.'
  END,
  CASE u.username
    WHEN 'Giovanna' THEN 'Reservada, directa y cuidadosa con mis limites.'
    ELSE 'Cuida mucho la privacidad y solo avanza si siente confianza.'
  END,
  CASE u.username
    WHEN 'valeria' THEN 'Mujer busca hombres'::looking_for_enum
    WHEN 'camila' THEN 'Mujer busca hombres'::looking_for_enum
    WHEN 'luciana' THEN 'Mujer busca hombres'::looking_for_enum
    WHEN 'renata' THEN 'Mujer busca hombres'::looking_for_enum
    WHEN 'sebastian' THEN 'Hombre busca mujeres'::looking_for_enum
    WHEN 'mateo' THEN 'Hombre busca mujeres'::looking_for_enum
    WHEN 'adrian' THEN 'Hombre busca mujeres'::looking_for_enum
    WHEN 'thiago' THEN 'Hombre busca mujeres'::looking_for_enum
    ELSE 'Mujer busca hombres'::looking_for_enum
  END,
  CASE u.username
    WHEN 'Giovanna' THEN 'Conocer y ver que pasa'::relationship_goal_enum
    ELSE 'Algo a corto plazo'::relationship_goal_enum
  END,
  CASE u.username
    WHEN 'valeria' THEN '1.67 m'
    WHEN 'camila' THEN '1.70 m'
    WHEN 'luciana' THEN '1.64 m'
    WHEN 'renata' THEN '1.68 m'
    WHEN 'sebastian' THEN '1.82 m'
    WHEN 'mateo' THEN '1.80 m'
    WHEN 'adrian' THEN '1.78 m'
    WHEN 'thiago' THEN '1.84 m'
    ELSE '1,65m'
  END,
  CASE u.username
    WHEN 'Giovanna' THEN '55kg'
    ELSE 'Dato privado'
  END,
  CASE u.username
    WHEN 'valeria' THEN 'Responde en menos de 15 minutos por la noche.'
    WHEN 'camila' THEN 'Muy activa de 7 p.m. a 11 p.m.'
    WHEN 'luciana' THEN 'Mas activa los fines de semana.'
    WHEN 'renata' THEN 'Responde mejor por las tardes.'
    WHEN 'sebastian' THEN 'Responde rapido por las noches.'
    WHEN 'mateo' THEN 'Activa las notificaciones privadas por la noche.'
    WHEN 'adrian' THEN 'Mas activo entre jueves y domingo.'
    WHEN 'thiago' THEN 'Mas activo por las tardes y madrugadas.'
    ELSE 'Responde rapido por la noche.'
  END,
  CASE u.username
    WHEN 'valeria' THEN 'Activa hoy, 21:12'
    WHEN 'camila' THEN 'En linea hace 3 minutos'
    WHEN 'luciana' THEN 'Nueva hoy'
    WHEN 'renata' THEN 'Activa hace 20 minutos'
    WHEN 'sebastian' THEN 'En linea ahora'
    WHEN 'mateo' THEN 'Activo hace 6 minutos'
    WHEN 'adrian' THEN 'Nueva coincidencia de hoy'
    WHEN 'thiago' THEN 'Activo hace 18 minutos'
    ELSE 'Activa hoy'
  END,
  TRUE,
  CASE WHEN u.username = 'Giovanna' THEN 86 ELSE 100 END
FROM users u
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO profile_photos (user_id, storage_key, original_filename, mime_type, visibility, is_primary, sort_order)
SELECT u.id, 'seed/' || lower(u.username) || '/principal.jpg', lower(u.username) || '.jpg', 'image/jpeg', 'members_only', TRUE, 1
FROM users u
ON CONFLICT DO NOTHING;

INSERT INTO profile_interests (user_id, interest_label, sort_order)
SELECT u.id, x.interest_label, x.sort_order
FROM users u
JOIN LATERAL (
  VALUES
    ('Cocteles tranquilos', 1),
    ('Humor inteligente', 2),
    ('Viajes breves', 3)
) AS x(interest_label, sort_order) ON u.username IN ('valeria', 'camila', 'Giovanna')
ON CONFLICT (user_id, lower(interest_label)) DO NOTHING;

INSERT INTO profile_interests (user_id, interest_label, sort_order)
SELECT u.id, x.interest_label, x.sort_order
FROM users u
JOIN LATERAL (
  VALUES
    ('Arte', 1),
    ('Cafes silenciosos', 2),
    ('Escapadas urbanas', 3)
) AS x(interest_label, sort_order) ON u.username IN ('luciana', 'renata', 'adrian', 'thiago')
ON CONFLICT (user_id, lower(interest_label)) DO NOTHING;

INSERT INTO profile_interests (user_id, interest_label, sort_order)
SELECT u.id, x.interest_label, x.sort_order
FROM users u
JOIN LATERAL (
  VALUES
    ('Whisky', 1),
    ('Hoteles urbanos', 2),
    ('Cocina de autor', 3)
) AS x(interest_label, sort_order) ON u.username IN ('sebastian', 'mateo')
ON CONFLICT (user_id, lower(interest_label)) DO NOTHING;

INSERT INTO profile_ideal_plans (user_id, plan_label, sort_order)
SELECT u.id, x.plan_label, x.sort_order
FROM users u
JOIN LATERAL (
  VALUES
    ('Romper el hielo por chat', 1),
    ('Elegir un lugar sobrio', 2),
    ('Mantener discrecion', 3)
) AS x(plan_label, sort_order) ON u.username IN ('valeria', 'camila', 'luciana', 'renata', 'Giovanna')
ON CONFLICT DO NOTHING;

INSERT INTO profile_ideal_plans (user_id, plan_label, sort_order)
SELECT u.id, x.plan_label, x.sort_order
FROM users u
JOIN LATERAL (
  VALUES
    ('Conectar por chat', 1),
    ('Crear complicidad', 2),
    ('Definir una cita con total reserva', 3)
) AS x(plan_label, sort_order) ON u.username IN ('sebastian', 'mateo', 'adrian', 'thiago')
ON CONFLICT DO NOTHING;

INSERT INTO profile_boundaries (user_id, boundary_label, sort_order)
SELECT u.id, x.boundary_label, x.sort_order
FROM users u
JOIN LATERAL (
  VALUES
    ('No comparte datos personales al inicio', 1),
    ('No acepta presion', 2),
    ('No tolera groserias', 3)
) AS x(boundary_label, sort_order) ON u.username IN ('valeria', 'camila', 'luciana', 'renata', 'Giovanna')
ON CONFLICT DO NOTHING;

INSERT INTO profile_boundaries (user_id, boundary_label, sort_order)
SELECT u.id, x.boundary_label, x.sort_order
FROM users u
JOIN LATERAL (
  VALUES
    ('No comparte numeros de inmediato', 1),
    ('No tolera mentiras', 2),
    ('No entra en dinamicas invasivas', 3)
) AS x(boundary_label, sort_order) ON u.username IN ('sebastian', 'mateo', 'adrian', 'thiago')
ON CONFLICT DO NOTHING;

INSERT INTO profile_prompts (user_id, question, answer, sort_order)
SELECT u.id, x.question, x.answer, x.sort_order
FROM users u
JOIN LATERAL (
  VALUES
    ('La mejor primera impresion para mi es...', 'una persona segura, breve y con intencion.', 1),
    ('Si conectamos, lo primero que notaras es...', 'que se escuchar y responder con picardia.', 2)
) AS x(question, answer, sort_order) ON u.username = 'valeria'
ON CONFLICT DO NOTHING;

INSERT INTO profile_prompts (user_id, question, answer, sort_order)
SELECT u.id, x.question, x.answer, x.sort_order
FROM users u
JOIN LATERAL (
  VALUES
    ('Lo que me hace responder al instante es...', 'una mezcla de misterio y claridad.', 1),
    ('Mi punto debil es...', 'la inteligencia emocional bien usada.', 2)
) AS x(question, answer, sort_order) ON u.username = 'sebastian'
ON CONFLICT DO NOTHING;

-- Favoritos demo
INSERT INTO favorites (user_id, favorite_user_id)
SELECT me.id, target.id
FROM users me
JOIN users target ON target.username IN ('valeria', 'camila', 'luciana')
WHERE me.username = 'Giovanna'
ON CONFLICT DO NOTHING;

-- Matches demo
INSERT INTO matches (id, user_a_id, user_b_id, status, matched_at, last_interaction_at)
SELECT
  gen_random_uuid(),
  LEAST(me.id, target.id),
  GREATEST(me.id, target.id),
  'matched',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '5 minutes'
FROM users me
JOIN users target ON target.username IN ('valeria', 'camila')
WHERE me.username = 'Giovanna'
ON CONFLICT DO NOTHING;

-- Conversaciones demo vinculadas a los matches
INSERT INTO conversations (id, match_id, created_by_user_id, status)
SELECT gen_random_uuid(), m.id, me.id, 'active'
FROM matches m
JOIN users me ON me.username = 'Giovanna'
JOIN users other_user ON other_user.id IN (m.user_a_id, m.user_b_id) AND other_user.id <> me.id
LEFT JOIN conversations c ON c.match_id = m.id
WHERE c.id IS NULL;

INSERT INTO conversation_participants (conversation_id, user_id, joined_at, last_read_at)
SELECT c.id, participant.user_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 minutes'
FROM conversations c
JOIN LATERAL (
  SELECT m.user_a_id AS user_id FROM matches m WHERE m.id = c.match_id
  UNION
  SELECT m.user_b_id AS user_id FROM matches m WHERE m.id = c.match_id
) AS participant ON TRUE
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_user_id, sender_type, message_type, body, sent_at, read_at)
SELECT c.id, sender.id, 'user', 'text', msg.body, msg.sent_at, NOW() - INTERVAL '2 minutes'
FROM conversations c
JOIN matches m ON m.id = c.match_id
JOIN users giovanna ON giovanna.username = 'Giovanna'
JOIN users sender ON sender.username = msg.sender_username
JOIN LATERAL (
  VALUES
    ('Giovanna', 'Hola, me gusto tu perfil y tu estilo discreto.', NOW() - INTERVAL '35 minutes'),
    ('valeria', 'Gracias. Tambien me gusto que fueras directa desde el inicio.', NOW() - INTERVAL '30 minutes'),
    ('Giovanna', 'Si conectamos, prefiero conversar con calma antes de salir.', NOW() - INTERVAL '18 minutes'),
    ('valeria', 'Ese ritmo me parece ideal. La discrecion siempre va primero.', NOW() - INTERVAL '12 minutes')
) AS msg(sender_username, body, sent_at) ON EXISTS (
  SELECT 1
  FROM users other_user
  WHERE other_user.id IN (m.user_a_id, m.user_b_id)
    AND other_user.id <> giovanna.id
    AND lower(other_user.username) = 'valeria'
)
WHERE giovanna.id IN (m.user_a_id, m.user_b_id)
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_user_id, sender_type, message_type, body, sent_at, read_at)
SELECT c.id, sender.id, 'user', 'text', msg.body, msg.sent_at, NOW() - INTERVAL '1 minutes'
FROM conversations c
JOIN matches m ON m.id = c.match_id
JOIN users giovanna ON giovanna.username = 'Giovanna'
JOIN users sender ON sender.username = msg.sender_username
JOIN LATERAL (
  VALUES
    ('camila', 'Prefiero mensajes concretos. Que tipo de conexion buscas?', NOW() - INTERVAL '28 minutes'),
    ('Giovanna', 'Algo reservado, claro y sin drama.', NOW() - INTERVAL '17 minutes'),
    ('camila', 'Perfecto. Entonces ya vamos entendiendo el tono.', NOW() - INTERVAL '8 minutes')
) AS msg(sender_username, body, sent_at) ON EXISTS (
  SELECT 1
  FROM users other_user
  WHERE other_user.id IN (m.user_a_id, m.user_b_id)
    AND other_user.id <> giovanna.id
    AND lower(other_user.username) = 'camila'
)
WHERE giovanna.id IN (m.user_a_id, m.user_b_id)
ON CONFLICT DO NOTHING;

-- Suscripcion demo para Giovanna
INSERT INTO user_subscriptions (user_id, plan_id, status, starts_at, ends_at, auto_renew, external_provider, external_reference)
SELECT u.id, p.id, 'trial', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', FALSE, 'manual-seed', 'TRIAL-GIOVANNA-001'
FROM users u
JOIN plans p ON p.code = 'trial_week'
WHERE u.username = 'Giovanna'
ON CONFLICT DO NOTHING;

INSERT INTO audit_log (actor_user_id, entity_name, entity_id, action_name, payload)
SELECT u.id, 'users', u.id::TEXT, 'seed_user_created', jsonb_build_object('username', u.username, 'source', 'esquema.sql')
FROM users u
ON CONFLICT DO NOTHING;

COMMIT;

-- Consultas utiles para el equipo backend
-- 1. Perfiles visibles:
-- SELECT u.id, u.username, p.city, p.district, p.headline, p.looking_for
-- FROM users u
-- JOIN user_profiles p ON p.user_id = u.id
-- WHERE u.status = 'active';
--
-- 2. Conversaciones de un usuario:
-- SELECT c.id, other_user.username, m.body, m.sent_at
-- FROM conversations c
-- JOIN conversation_participants cp ON cp.conversation_id = c.id
-- JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id <> cp.user_id
-- JOIN users other_user ON other_user.id = cp2.user_id
-- LEFT JOIN LATERAL (
--   SELECT body, sent_at
--   FROM messages msg
--   WHERE msg.conversation_id = c.id
--   ORDER BY sent_at DESC
--   LIMIT 1
-- ) m ON TRUE
-- WHERE cp.user_id = (SELECT id FROM users WHERE username = 'Giovanna');
--
-- 3. Favoritos de un usuario:
-- SELECT fav.created_at, u.username, p.headline
-- FROM favorites fav
-- JOIN users u ON u.id = fav.favorite_user_id
-- JOIN user_profiles p ON p.user_id = u.id
-- WHERE fav.user_id = (SELECT id FROM users WHERE username = 'Giovanna');
