-- =============================================================================
-- SigmaBuilder — 03_queries.sql
--
-- Catálogo de consultas DML utilizando un flujo lógico completo de aplicación.
-- =============================================================================

-- ─── 1: AUTENTICACIÓN Y GESTIÓN DE USUARIOS ────────────────────────────
-- 1.1 Registrar un nuevo usuario.
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('test@sigmabuilder.com', '$2b$10$EixVAnZ6Y/K5N5QfK.7X3u.v5W1.V/J.m.m.m.m.m.m.m', 'Test', 'User')
RETURNING id, email, first_name, created_at;

-- 1.2 Iniciar sesión.
SELECT id, email, password_hash, is_active 
FROM users 
WHERE email = 'test@sigmabuilder.com' AND is_active = true;

-- 1.3 Generar un token de refresco tras un inicio de sesión exitoso.
INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at, user_agent, ip_address)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'hash_del_refresh_token_aqui',
  gen_random_uuid(),                      
  now() + INTERVAL '7 days',
  'Mozilla/5.0 ... Chrome/120.0.0.0',
  '192.168.1.45'::INET
);


-- ─── 2: GESTIÓN DE ESPACIOS DE TRABAJO (PROYECTOS) ─────────────────────
INSERT INTO projects (name, description, created_by)
VALUES (
  'Mi portfolio Profesional', 
  'Espacio de trabajo para centralizar mis sitios de marca personal, blogs y recursos multimedia.',
  '11111111-1111-1111-1111-111111111111' 
)
RETURNING id, name, api_key, created_at;

SELECT p.id, p.name, p.description, r.name AS mi_rol, p.created_at
FROM projects p
JOIN project_members pm ON pm.project_id = p.id
JOIN roles r ON pm.role_id = r.id
WHERE pm.user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY p.created_at DESC;


-- ─── 3: CONTROL DE ACCESO (AUTORIZACIÓN RBAC) ──────────────────────────
-- 3.1 Comprobar permisos del usuario en un proyecto específico.
SELECT action 
FROM get_user_permissions(
  '11111111-1111-1111-1111-111111111111', -- ID del Usuario
  '22222222-2222-2222-2222-222222222222'  -- ID del Proyecto
);

-- 3.2 Crear una invitación para unir a un colaborador al proyecto con el rol de 'Admin'.
INSERT INTO project_invitations (project_id, inviter_id, email, role_id, token, expires_at)
VALUES (
  '22222222-2222-2222-2222-222222222222', -- ID del Proyecto
  '11111111-1111-1111-1111-111111111111', -- ID del que invita (Diego)
  'companero@clase.com',
  '33333333-3333-3333-3333-333333333333', -- ID del Rol 'Admin' obtenido previamente
  'token_seguro_aleatorio_url_string',
  now() + INTERVAL '48 hours'
);


-- ───  4: SISTEMA DE ARCHIVOS MULTIMEDIA (MEDIA STORAGE) ─────────────────
-- 4.1 Crear una carpeta raíz para almacenar imágenes del CMS.
INSERT INTO media_folders (project_id, parent_id, name, is_system)
VALUES ('22222222-2222-2222-2222-222222222222', NULL, 'Assets del Sitio', false)
RETURNING id;

-- 4.2 Crear una subcarpeta dentro de la carpeta anterior.
INSERT INTO media_folders (project_id, parent_id, name, is_system)
VALUES (
  '22222222-2222-2222-2222-222222222222', 
  '44444444-4444-4444-4444-444444444444', -- ID de la carpeta padre 'Assets del Sitio'
  'Imágenes del Blog', 
  false
);

-- 4.3 Registrar la subida de un archivo (Asset) asignándolo a la subcarpeta del Blog
INSERT INTO media_assets (project_id, folder_id, file_name, file_url, file_key, mime_type, size_bytes)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '55555555-5555-5555-5555-555555555555', -- ID de la carpeta 'Imágenes del Blog'
  'banner-tecnologias.png',
  'https://bucket.sigmabuilder.com/media/banner-tecnologias.png',
  'media/banner-tecnologias.png',
  'image/png',
  204850 -- Tamaño en bytes
);


-- ───  5: CONSTRUCTOR DE SITIOS Y PÁGINAS (CMS CORE) ─────────────────────
-- 5.1 Crear un Sitio Web dentro del proyecto.
INSERT INTO sites (project_id, slug, name, template_type, status)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'diego-dev-portfolio',
  'Mi Sitio Web de Desarrollo',
  'portfolio_astro_template',
  'draft'
) RETURNING id;

-- 5.2 Agregar la página principal (Home) al Sitio Web recien creado
INSERT INTO pages (site_id, slug, title, html, css, js, status, is_home)
VALUES (
  '66666666-6666-6666-6666-666666666666', -- ID del Sitio creado
  '/',
  'Inicio | Diego Puértolas',
  '<main><h1>Bienvenido a mi sitio</h1><p>Desarrollador Full-Stack</p></main>',
  'main { max-width: 800px; margin: 0 auto; } h1 { color: #333; }',
  'console.log("Sitio cargado con éxito");',
  'draft',
  true -- Marcada como página de inicio principal
);

-- 5.3 Agregar una segunda página (/sobre-mi) al mismo Sitio Web
INSERT INTO pages (site_id, slug, title, html, css, status, is_home)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '/sobre-mi',
  'Sobre Mí | Trayectoria',
  '<section><h2>Mi Historia</h2><p>Estudiante de desarrollo web...</p></section>',
  'h2 { border-left: 4px solid blue; padding-left: 10px; }',
  'draft',
  false
);


-- ───  6: MÓDULO DINÁMICO DE PORTFOLIO ────────────────────────────────
-- 6.1 Crear una sección personalizada para organizar los trabajos del portfolio.
INSERT INTO portfolio_sections (site_id, title, content, sort_order)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'Proyectos Destacados de Backend',
  '{"layout": "grid", "show_repository": true}'::jsonb,
  1
);

-- 6.2 Insertar un proyecto real dentro del portfolio del sitio.
INSERT INTO portfolio_items (site_id, title, description, image_url, live_url, repository_url, sort_order)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'API REST de Películas con Spring Boot',
  'Desarrollo completo de una API RESTful robusta utilizando Java, Spring Boot, JPA y PostgreSQL, documentada íntegramente con Swagger.',
  'https://bucket.sigmabuilder.com/media/movies-api.png',
  'https://movies-api.sigmabuilder.com',
  'https://github.com/dpuertolas/movies-api-springboot',
  1
);

-- 6.3 Registrar tecnologías en la nube utilizadas en este sitio (Stack)
INSERT INTO portfolio_stack (site_id, name, icon_url)
VALUES ('66666666-6666-6666-6666-666666666666', 'PostgreSQL', 'https://icons.dev/postgres.svg');


-- ───  7: MÓDULO COMPARTIDO DE BLOG ──────────────────────────────────────
-- 7.1 Crear una categoría para agrupar las publicaciones de informática.
INSERT INTO blog_categories (site_id, name, slug)
VALUES ('66666666-6666-6666-6666-666666666666', 'Bases de Datos', 'bases-de-datos');

-- 7.2 Publicar un artículo técnico en el blog del sitio
INSERT INTO blog_posts (site_id, author_id, category_id, title, slug, excerpt, cover_image, content, status)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111', -- ID del Autor (Diego)
  '77777777-7777-7777-7777-777777777777', -- ID de la categoría 'Bases de Datos'
  'Diseño de Arquitecturas Multi-Tenant en Postgres',
  'diseno-arquitecturas-multitenant-postgres',
  'Una guía práctica de cómo estructurar proyectos SaaS aislando los datos de forma segura mediante esquemas relacionales eficientes.',
  'https://bucket.sigmabuilder.com/media/banner-tecnologias.png', -- Reutilizando el asset subido previamente
  'Aquí va el contenido extenso escrito en Markdown o HTML con toda la explicación técnica...',
  'draft'
);


-- ───  8: OPERACIONES DE LECTURA Y ACTUALIZACIÓN DINÁMICA (CRUD) ─────────
-- 8.1 Lectura completa de un Sitio: Obtener sitio con todas sus páginas asociadas (Panel de Administración)
SELECT s.id AS site_id, s.name AS site_name, s.slug AS site_slug, s.status AS site_status,
       p.id AS page_id, p.title AS page_title, p.slug AS page_slug, p.is_home
FROM sites s
LEFT JOIN pages p ON p.site_id = s.id
WHERE s.id = '66666666-6666-6666-6666-666666666666'
ORDER BY p.is_home DESC, p.created_at ASC;

-- 8.2 Modificar la configuración interna de un Sitio Web.
UPDATE sites
SET 
  status = 'published', 
  features = jsonb_set(features, '{modules, blog}', 'true'::jsonb),
  updated_at = now()
WHERE id = '66666666-6666-6666-6666-666666666666';

-- 8.3 Publicar oficialmente un post del blog cambiando su estado.
UPDATE blog_posts
SET 
  status = 'published',
  updated_at = now()
WHERE id = '88888888-8888-8888-8888-888888888888';

-- 8.4 Eliminar un ítem del portfolio.
DELETE FROM portfolio_items
WHERE id = '99999999-9999-9999-9999-999999999999';


-- ─── 9: MANTENIMIENTO Y LIMPIEZA AUTOMÁTICA DEL SISTEMA ────────────────
TRUNCATE TABLE password_reset_tokens;