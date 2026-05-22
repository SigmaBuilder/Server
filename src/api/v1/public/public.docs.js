"use strict";

const publicDocs = {
  core: {
    name: "Core",
    description: "Endpoints principales y características generales del sitio.",
    endpoints: [
      {
        name: "Obtener Sitio",
        path: "/api/v1/public/sites/{slug}",
        method: "GET",
        description:
          "Obtiene la información general del sitio, su plantilla, sus características activas y su contenido.",
        parameters: [],
        returns: {
          site: {
            id: "uuid",
            name: "Mi Sitio",
            slug: "mi-sitio",
            template_type: "standard",
            features: {
              modules: { blog: true, portfolio: true },
            },
            content: {
              favicon_url: "https://ejemplo.com/favicon.ico",
            },
          },
        },
      },
      {
        name: "Renderizar Página (Home)",
        path: "/api/v1/public/sites/{slug}/render",
        method: "GET",
        description:
          "Obtiene la página principal (home) del sitio junto con la información del sitio, lista para ser renderizada.",
        parameters: [],
        returns: {
          success: true,
          data: {
            page: {
              id: "uuid",
              site_id: "uuid",
              slug: "home",
              title: "Inicio",
              html: "<div>...</div>",
              css: ".class { ... }",
              js: "console.log('hello');",
              status: "draft",
              is_home: true,
              created_at: "2025-01-01T00:00:00.000Z",
              updated_at: "2025-01-01T00:00:00.000Z",
            },
            site: {
              id: "uuid",
              name: "Mi Sitio",
              slug: "mi-sitio",
              template_type: "standard",
              features: {
                modules: { blog: true, portfolio: true },
              },
              content: {
                favicon_url: "https://ejemplo.com/favicon.ico",
              },
            },
          },
        },
      },
      {
        name: "Renderizar Página por Slug",
        path: "/api/v1/public/sites/{slug}/render/{pageSlug}",
        method: "GET",
        description:
          "Obtiene el HTML, CSS y JS de una página específica usando su slug, junto con la información del sitio.",
        parameters: [
          {
            name: "pageSlug",
            type: "path",
            description: "El slug de la página a renderizar.",
          },
        ],
        returns: {
          success: true,
          data: {
            page: {
              id: "uuid",
              site_id: "uuid",
              slug: "about",
              title: "Sobre Nosotros",
              html: "<div>...</div>",
              css: ".class { ... }",
              js: "console.log('hello');",
              status: "published",
              is_home: false,
              created_at: "2025-01-01T00:00:00.000Z",
              updated_at: "2025-01-01T00:00:00.000Z",
            },
            site: {
              id: "uuid",
              name: "Mi Sitio",
              slug: "mi-sitio",
              template_type: "standard",
              features: {
                modules: { blog: true, portfolio: true },
              },
              content: {
                favicon_url: "https://ejemplo.com/favicon.ico",
              },
            },
          },
        },
      },
      {
        name: "Documentación del Sitio",
        path: "/api/v1/public/sites/{slug}/docs",
        method: "GET",
        description:
          "Obtiene la documentación de las rutas públicas activas para el sitio. Incluye solo los módulos habilitados.",
        parameters: [
          {
            name: "simple",
            type: "query",
            description:
              'Si es "true", devuelve solo name, path y method de cada endpoint.',
          },
        ],
        returns: {
          success: true,
          data: {
            core: { name: "Core", description: "...", endpoints: ["..."] },
            blog: { name: "Blog", description: "...", endpoints: ["..."] },
            portfolio: {
              name: "Portfolio",
              description: "...",
              endpoints: ["..."],
            },
          },
        },
      },
    ],
  },
  blog: {
    name: 'Blog',
    description: 'Endpoints del módulo de Blog para consultar categorías y publicaciones. IMPORTANTE: El campo "content" de los posts devuelve un objeto JSON generado por el editor TipTap (basado en ProseMirror), NO un string HTML. Ej: {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"hola"}]}]}. Debes crear funciones para renderizar este JSON a HTML en el frontend.',
    endpoints: [
      {
        name: "Listar Categorías",
        path: "/api/v1/public/sites/{slug}/modules/blog/categories",
        method: "GET",
        description:
          "Obtiene la lista de categorías del blog ordenadas por nombre.",
        parameters: [],
        returns: {
          categories: [
            {
              id: "uuid",
              site_id: "uuid",
              name: "Tecnología",
              slug: "tecnologia",
              created_at: "2025-01-01T00:00:00.000Z",
              updated_at: "2025-01-01T00:00:00.000Z",
            },
          ],
        },
      },
      {
        name: "Listar Posts",
        path: "/api/v1/public/sites/{slug}/modules/blog/posts",
        method: "GET",
        description:
          "Obtiene una lista paginada de posts publicados, ordenados del más reciente al más antiguo.",
        parameters: [
          {
            name: "limit",
            type: "query",
            description: "Cantidad de resultados por página (por defecto 10).",
          },
          {
            name: "offset",
            type: "query",
            description: "Número de registros a saltar (por defecto 0).",
          },
        ],
        returns: {
          posts: [
            {
              id: "uuid",
              site_id: "uuid",
              author_id: "uuid",
              category_id: "uuid | null",
              title: "Mi Primer Post",
              slug: "mi-primer-post",
              excerpt: "Un breve resumen...",
              cover_image: "https://ejemplo.com/imagen.jpg",
              content: {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Contenido del post en formato TipTap JSON..." }]
                  }
                ]
              },
              status: "published",
              created_at: "2025-01-01T00:00:00.000Z",
              updated_at: "2025-01-01T00:00:00.000Z",
            },
          ],
          total: 1,
        },
      },
      {
        name: "Obtener Post por Slug",
        path: "/api/v1/public/sites/{slug}/modules/blog/posts/{postSlug}",
        method: "GET",
        description:
          "Obtiene los detalles de un post publicado específico usando su slug.",
        parameters: [
          {
            name: "postSlug",
            type: "path",
            description: "El slug del post a buscar.",
          },
        ],
        returns: {
          post: {
            id: "uuid",
            site_id: "uuid",
            author_id: "uuid",
            category_id: "uuid | null",
            title: "Mi Primer Post",
            slug: "mi-primer-post",
            excerpt: "Un breve resumen...",
            cover_image: "https://ejemplo.com/imagen.jpg",
            content: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Contenido del post en formato TipTap JSON (ProseMirror)..." }]
                }
              ]
            },
            status: "published",
            created_at: "2025-01-01T00:00:00.000Z",
            updated_at: "2025-01-01T00:00:00.000Z",
          },
        },
      },
    ],
  },
  portfolio: {
    name: "Portfolio",
    description:
      "Endpoint del módulo de Portfolio. Devuelve todos los datos del portfolio (secciones, proyectos y stack tecnológico) en una sola llamada.",
    endpoints: [
      {
        name: "Obtener Portfolio Completo",
        path: "/api/v1/public/sites/{slug}/modules/portfolio/items",
        method: "GET",
        description:
          "Obtiene todos los datos del portfolio: secciones, proyectos e items del stack tecnológico.",
        parameters: [],
        returns: {
          portfolio: {
            sections: [
              {
                id: "uuid",
                site_id: "uuid",
                title: "Sobre Mí",
                content: {},
                sort_order: 0,
                created_at: "2025-01-01T00:00:00.000Z",
                updated_at: "2025-01-01T00:00:00.000Z",
              },
            ],
            items: [
              {
                id: "uuid",
                site_id: "uuid",
                title: "E-commerce",
                description: "Tienda online creada con Node.",
                image_url: "https://ejemplo.com/ecommerce.png",
                live_url: "https://miapp.com",
                repository_url: "https://github.com/miapp",
                sort_order: 0,
                created_at: "2025-01-01T00:00:00.000Z",
                updated_at: "2025-01-01T00:00:00.000Z",
              },
            ],
            stack: [
              {
                id: "uuid",
                site_id: "uuid",
                name: "React",
                icon_url: "https://ejemplo.com/react.png",
                created_at: "2025-01-01T00:00:00.000Z",
                updated_at: "2025-01-01T00:00:00.000Z",
              },
            ],
          },
        },
      },
    ],
  },
};

module.exports = publicDocs;
