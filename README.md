# Sigmabuilder

<div align="center">

<img src="./assets/white-icon.svg" alt="SigmaBuilder Logo" width="250"/>

**API RESTful y Backend para la plataforma SigmaBuilder**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Knex.js](https://img.shields.io/badge/Knex.js-D26B21?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-003545?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Supabase S3](https://img.shields.io/badge/Supabase%20S3-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

</div>

<br/>

<div align="center">

[Despliegue en Producción](#produccion) • [Stack Tecnológico](#stack) • [Instalación y Entorno Local](#instalacion) • [Testing Automático](#testing) • [Documentación Adicional](#documentacion) • [Arquitectura del Proyecto](#arquitectura) • [Contribuciones y Flujo de Trabajo](#contribuciones) • [Licencia](#licencia)

</div>

---

## 🚀 Descripción

El servidor de **SigmaBuilder** proporciona toda la lógica de negocio, gestión de usuarios, manejo de sitios y proyectos, y sistema de autenticación para la plataforma. Está diseñado siguiendo los principios REST, con un sistema robusto de validación de datos, manejo de errores centralizado y autenticación basada en JWT.

<a name="produccion"></a>
## 🌍 Despliegue en Producción

El proyecto está preparado para desplegarse fácilmente en cualquier entorno de producción.
- **Docker:** Se puede utilizar Docker y `docker-compose.yml` para orquestar los contenedores de Node.js y la base de datos PostgreSQL.
- **Variables de Entorno:** En producción, se debe cambiar `NODE_ENV=production` y asegurarse de configurar correctamente las credenciales de base de datos y de servicios de terceros (Supabase S3 y Resend).

<a name="stack"></a>
## 🛠 Stack Tecnológico

El backend está construido con las siguientes tecnologías principales:

- **Entorno de ejecución:** Node.js
- **Framework web:** Express.js (v5)
- **Base de datos:** PostgreSQL
- **Query Builder:** Knex.js
- **Autenticación:** JSON Web Tokens (JWT) & bcryptjs
- **Almacenamiento (Supabase S3):** Para la subida de archivos e imágenes estamos utilizando **Supabase Storage**. Aunque usamos el SDK oficial de AWS (`@aws-sdk/client-s3`), Supabase provee una API 100% compatible con S3. Esto nos permite aprovechar toda la potencia y el ecosistema de herramientas de AWS, pero centralizando el almacenamiento en la infraestructura de Supabase.
- **Envío de correos:** Resend
- **Seguridad:** Helmet, CORS, Express Rate Limit

<a name="instalacion"></a>
## ⚙️ Instalación y Entorno Local

1. **Clonar el repositorio y acceder a la carpeta del servidor:**
   ```bash
   git clone https://github.com/SigmaBuilder/Server.git
   cd Server
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Crea un archivo `.env` en la raíz (tienes `.env.example` como referencia o usa este esquema):
   ```env
   PORT=3000
   NODE_ENV=development

   # Base de datos local
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   DB_NAME=sigmabuilder

   # Autenticación
   JWT_SECRET=tu_secreto_super_seguro
   JWT_EXPIRES_IN=24h

   # Supabase Storage (Compatible con S3)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=tu_supabase_access_key
   AWS_SECRET_ACCESS_KEY=tu_supabase_secret_key
   AWS_S3_BUCKET_NAME=tu_bucket_de_supabase

   # Resend (Emails)
   RESEND_API_KEY=tu_api_key
   ```

4. **Inicializar Base de Datos:**
   ```bash
   psql -U tu_usuario -d sigmabuilder -f db/01_schema.sql
   ```

5. **Arrancar Servidor:**
   ```bash
   npm run dev
   ```

<a name="testing"></a>
## 🧪 Testing Automático

Contamos con un entorno completo de pruebas y CI/CD integrado con GitHub Actions:

- **`npm run test:unit`**: Lanza la suite de pruebas unitarias usando **Jest**.
- **`npm run newman`**: Lanza la suite de integración de la API usando **Newman** (que ejecuta nuestra colección de Postman localmente).
- **GitHub Actions:** Al abrir una Pull Request a `main` o `dev`, se levanta una base de datos temporal, se usa el archivo `.env.test` (que hace mocks de envíos de email de Resend y previene cobros innecesarios), y se pasan todas las pruebas automáticamente.

<a name="documentacion"></a>
## 📄 Documentación Adicional

- En la raíz del proyecto encontrarás el archivo `SigmaBuilder_API.postman_collection.json`. Puedes importarlo directamente a tu cliente Postman para ver todos los endpoints documentados (rutas, cuerpos, cabeceras) y ejecutar llamadas reales contra tu servidor local.
- Todas las respuestas de la API siguen un formato estandarizado para éxito o errores (definido en `utils/response.js`).

<a name="arquitectura"></a>
## 📂 Arquitectura del Proyecto

El código fuente sigue un patrón modular en `src`:

```text
Server/
├── db/                     # Scripts de DB (schema y seeds)
├── src/
│   ├── api/
│   │   └── v1/              # Versión 1 de la API REST
│   │       ├── auth/        # Registro, Login y Recuperación de Contraseña
│   │       ├── invitations/ # Gestión de invitaciones a proyectos
│   │       ├── projects/    # CRUD de Proyectos
│   │       │   ├── members/ # Gestión de miembros y colaboradores del proyecto
│   │       │   ├── roles/   # Roles y permisos asignados por proyecto
│   │       │   ├── sites/   # Sitios creados en el contexto de un proyecto
│   │       │   └── media/   # Rutas para archivos multimedia asociados al proyecto
│   │       ├── sites/       # CRUD de Sitios Web e integraciones
│   │       │   ├── pages/   # Gestión de páginas dentro de cada sitio
│   │       │   └── modules/ # Módulos dinámicos (Blog, Portfolio, etc.)
│   │       │       ├── blog/
│   │       │       │   ├── posts/      # CRUD de posts del blog
│   │       │       │   └── categories/ # Categorías del blog
│   │       │       ├── portfolio/
│   │       │       │   ├── sections/   # Secciones de un portafolio
│   │       │       │   ├── stack/      # Tecnologías/skills usadas
│   │       │       │   └── items/      # Elementos/proyectos del portafolio
│   │       │       └── pages/          # Páginas específicas del módulo
│   │       ├── public/     # API Pública (sin autenticación para renderizar sitios)
│   │       │   └── modules/
│   │       │       ├── blog/      # Obtención pública de posts y categorías
│   │       │       └── portfolio/ # Obtención pública de secciones, stack e items
│   │       └── index.js    # Enrutador principal de v1
|   |
│   ├── config/             # Configuración central (env, base de datos, cliente Supabase S3)
│   ├── constants/          # Constantes estáticas (HTTP status, roles)
│   ├── middlewares/        # Middlewares (autenticación JWT, control de errores)
│   ├── services/           # Lógica pesada (AWS SDK conectando a Supabase S3, Resend)
│   ├── templates/          # Plantillas HTML (Handlebars) para correos
│   ├── utils/              # Helpers y funciones compartidas
│   └── app.js              # Inicialización de Express
├── test/                   # Archivos Jest
├── .github/workflows/      # CI/CD pipelines
└── .env.test               # Entorno específico de pruebas automatizadas
```

<a name="contribuciones"></a>
## 🤝 Contribuciones y Flujo de Trabajo

Para mantener el código estable y organizado:
1. **Ramas (Branches):** Trabaja siempre en ramas descriptivas a partir de `dev` (ej. `feat/nueva-funcion`, `fix/correccion-bug`).
2. **Pull Requests (PR):** Cuando acabes, abre un PR hacia `dev` o `main`.
3. **Integración Continua:** Espera a que los tests del GitHub Actions (Jest + Newman) pasen exitosamente con el check verde antes de solicitar revisiones o realizar merges.
4. **Merge:** Asegúrate de no romper compatibilidad en endpoints existentes si es posible.

<a name="licencia"></a>
## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---

**Autores:** Rubén Morales & Diego Puértolas