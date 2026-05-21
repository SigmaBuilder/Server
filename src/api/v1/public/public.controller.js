'use strict';

const pagesService = require('../sites/modules/pages/pages.service');
const AppError = require('../../../utils/AppError');
const HTTP_STATUS = require('../../../constants/httpStatus');
const publicDocs = require('./public.docs');

/**
 * Obtiene la informacin general del sitio.
 */
const getPublicSiteInfo = (req, res, next) => {
  try {
    const { id, name, slug, template_type, features, content } = req.site;
    
    res.json({
      site: { id, name, slug, template_type, features, content }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene la página pública (home o por slug).
 */
const getPublicPage = async (req, res, next) => {
  try {
    const siteId = req.site.id;
    const { pageSlug } = req.params;
    
    let page;
    if (!pageSlug) {
      page = await pagesService.getHomePage(siteId);
    } else {
      page = await pagesService.getPageBySlug(siteId, pageSlug);
    }

    if (!page) {
      throw new AppError('Page not found', HTTP_STATUS.NOT_FOUND);
    }

    // Opcional: Verificar estado 'published' si manejas estados
    if (page.status !== 'published' && page.status !== 'active') {
        // En algunos builders, la home siempre est, o todo est 'draft' inicialmente.
        // Adaptaremos si requiere published. Por ahora dejamos pasar todo o restringimos si sabemos que 'published' se usa.
        // El esquema de creacin usa 'draft' por defecto. Vamos a permitir renderizar pginas para no romper si no han hecho "publish".
    }

    const { id, name, slug, template_type, features, content } = req.site;

    res.json({
      success: true,
      data: {
        page,
        site: { id, name, slug, template_type, features, content }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene la documentación de las rutas públicas activas para el sitio.
 */
const getSiteDocs = (req, res, next) => {
  try {
    const isSimple = req.query.simple === 'true';
    const features = req.site.features || { modules: {} };
    const activeModules = features.modules || {};
    
    const docs = {};
    
    // Core siempre está activo
    docs.core = processModuleDocs(publicDocs.core, isSimple);
    
    // Agregar módulos activos
    if (activeModules.blog && publicDocs.blog) {
      docs.blog = processModuleDocs(publicDocs.blog, isSimple);
    }
    if (activeModules.portfolio && publicDocs.portfolio) {
      docs.portfolio = processModuleDocs(publicDocs.portfolio, isSimple);
    }
    
    res.json({ success: true, data: docs });
  } catch (error) {
    next(error);
  }
};

const processModuleDocs = (moduleData, isSimple) => {
  if (!isSimple) return moduleData;
  return moduleData.endpoints.map(ep => ({
    name: ep.name,
    path: ep.path,
    method: ep.method
  }));
};

module.exports = {
  getPublicSiteInfo,
  getPublicPage,
  getSiteDocs,
};