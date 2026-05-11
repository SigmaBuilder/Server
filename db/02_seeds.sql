-- =============================================================================
-- SigmaBuilder — 02_seeds.sql
-- PostgreSQL 17
--
-- Parametrización inicial: Permisos y Proyecto Demo
-- =============================================================================

DO $$
DECLARE
  v_user_id UUID;
  v_project_id UUID;
BEGIN
    RAISE NOTICE 'Iniciando la parametrización de la base de datos...';

    -- Parametrización de permisos globales.
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

    INSERT INTO users (email, password_hash, first_name, last_name)
    VALUES ('demo@sigmabuilder.local', '$2a$10$INVALIDHASHONLYFORTESTINGDOESNOTWORK', 'Demo', 'User')
    RETURNING id INTO v_user_id;

    INSERT INTO projects (name, description, created_by)
    VALUES ('Proyecto Demo (SigmaBuilder)', 'Proyecto inicial para demostrar la automatización de roles y permisos mediante Triggers.', v_user_id)
    RETURNING id INTO v_project_id;

    RAISE NOTICE 'Parametrización completada con éxito. Proyecto % creado por %', v_project_id, v_user_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error crítico durante los inserts iniciales. Se ha ejecutado ROLLBACK. Detalle: %', SQLERRM;
END $$;