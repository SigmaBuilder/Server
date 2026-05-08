-- =============================================================================
-- SigmaBuilder — init.sql
-- PostgreSQL 17
--
-- Este script se ejecuta automáticamente al inicializar el contenedor Docker.
-- Orden: extensiones → tipos → tablas → funciones → índices → seeds
-- =============================================================================

-- ─── Extensiones ─────────────────────────────────────────────────────────────
-- Usamos pgcrypto para generar IDs aleatorios (UUIDs).
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- ─── Tablas ──────────────────────────────────────────────────────────────────
-- users
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  avatar_url    TEXT,
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- password_reset_tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT         NOT NULL UNIQUE,
  is_used     BOOLEAN      NOT NULL DEFAULT false,
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- projects
CREATE TABLE IF NOT EXISTS projects (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  api_key     UUID         NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  description TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- sites
CREATE TABLE IF NOT EXISTS sites (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  slug          VARCHAR(255) UNIQUE,
  template_type VARCHAR(50)  NOT NULL,  
  features      JSONB        NOT NULL DEFAULT '{}'::jsonb,
  content       JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- portfolio
CREATE TABLE IF NOT EXISTS portfolio_items (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     UUID         NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  image_url   TEXT,
  live_url    TEXT,
  repository_url  TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- portfolio_stack
CREATE TABLE IF NOT EXISTS portfolio_stack (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     UUID        NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL, 
  icon_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- blog_categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     UUID         NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL, 
  slug        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (site_id, slug)
);

-- blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id      UUID         NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  author_id    UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category_id  UUID         REFERENCES blog_categories(id) ON DELETE SET NULL,
  title        VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) NOT NULL,
  content      TEXT         NOT NULL, 
  is_published BOOLEAN      NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(site_id, slug)
);

-- roles
CREATE TABLE IF NOT EXISTS roles (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- permissions
CREATE TABLE IF NOT EXISTS permissions (
  id     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL UNIQUE -- Formato: recurso:acción
);

-- role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id)       ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- project_members
CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  role_id    UUID        REFERENCES roles(id)             ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- project_invitations
CREATE TABLE IF NOT EXISTS project_invitations (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  inviter_id  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email       VARCHAR(255) NOT NULL,
  role_id     UUID         NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  token       VARCHAR(255) NOT NULL UNIQUE,
  status      VARCHAR(50)  NOT NULL DEFAULT 'pending',
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT        NOT NULL UNIQUE,
  family       UUID        NOT NULL,
  is_revoked   BOOLEAN     NOT NULL DEFAULT false,
  user_agent   TEXT,
  ip_address   INET,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ
);

-- ─── Índices ──────────────────────────────────────────────────────────────────
-- Se crean índices para mejorar el rendimiento de las consultas.

-- refresh_tokens: búsqueda por hash (login/logout) y por user (revocar familia)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash  ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id     ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family      ON refresh_tokens(family);

-- project_members: lookup por usuario o por proyecto
CREATE INDEX IF NOT EXISTS idx_project_members_user_id    ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);

-- sites: lookup por slug
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);

-- sites: lookup por project_id
CREATE INDEX IF NOT EXISTS idx_sites_project_id ON sites(project_id);

-- portfolio_items: lookup por sitio
CREATE INDEX IF NOT EXISTS idx_portfolio_items_site_id ON portfolio_items(site_id);

-- portfolio_stack: lookup por sitio
CREATE INDEX IF NOT EXISTS idx_portfolio_stack_site_id ON portfolio_stack(site_id);

-- blog_categories: lookup por sitio
CREATE INDEX IF NOT EXISTS idx_blog_categories_site_id ON blog_categories(site_id);

-- blog_posts: lookup por sitio
CREATE INDEX IF NOT EXISTS idx_blog_posts_site_id ON blog_posts(site_id);

-- project_invitations: lookup por email
CREATE INDEX IF NOT EXISTS idx_project_invitations_email  ON project_invitations(email);

-- password_reset_tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_is_used ON password_reset_tokens(is_used);

-- ─── Funciones ─────────────────────────────────────────────────────────────
-- Se crean funciones para mejorar el rendimiento de las consultas.

-- Devuelve todos los permisos (action) de un usuario en un proyecto.
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID, p_project_id UUID)
RETURNS TABLE(action VARCHAR) AS $$
  SELECT  perm.action
  FROM    project_members proj_member
  JOIN    role_permissions role_perm ON role_perm.role_id  = proj_member.role_id
  JOIN    permissions      perm      ON perm.id            = role_perm.permission_id
  WHERE   proj_member.user_id    = p_user_id
  AND     proj_member.project_id = p_project_id;
$$ LANGUAGE sql STABLE;

-- Actualiza updated_at automáticamente en la tabla users
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente

-- users
CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- sites
CREATE OR REPLACE TRIGGER trg_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- portfolio_items
CREATE OR REPLACE TRIGGER trg_portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- blog_posts
CREATE OR REPLACE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER trg_portfolio_stack_updated_at
  BEFORE UPDATE ON portfolio_stack
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER trg_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- project_invitations
CREATE OR REPLACE TRIGGER trg_project_invitations_updated_at
  BEFORE UPDATE ON project_invitations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Seeds ──────────────────────────────────────────────────────────────────
-- permissions 
INSERT INTO permissions (action) VALUES
  ('project:read'),
  ('project:update'),
  ('project:delete'),
  ('members:read'),
  ('members:invite'),
  ('members:update'),
  ('members:remove'),
  ('roles:read'),
  ('roles:manage')
ON CONFLICT (action) DO NOTHING;

-- roles
INSERT INTO roles (name, description) VALUES
  ('owner',  'Full control over the project, including deletion and role management'),
  ('admin',  'Can manage members and project settings, but cannot delete the project'),
  ('member', 'Read-only access to project resources')
ON CONFLICT (name) DO NOTHING;

-- roles_permissions 
-- owner
INSERT INTO role_permissions (role_id, permission_id)
SELECT role.id, perm.id
FROM   roles role, permissions perm
WHERE  role.name = 'owner'
ON CONFLICT DO NOTHING;

-- admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT role.id, perm.id
FROM   roles role
JOIN   permissions perm ON perm.action IN (
  'project:read',
  'project:update',
  'members:read',
  'members:invite',
  'members:update',
  'members:remove',
  'roles:read'
)
WHERE  role.name = 'admin'
ON CONFLICT DO NOTHING;

-- member
INSERT INTO role_permissions (role_id, permission_id)
SELECT role.id, perm.id
FROM   roles role
JOIN   permissions perm ON perm.action IN (
  'project:read',
  'members:read',
  'roles:read'
)
WHERE  role.name = 'member'
ON CONFLICT DO NOTHING;