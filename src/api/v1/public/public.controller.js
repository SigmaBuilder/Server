'use strict';

const pagesService = require('../sites/modules/pages/pages.service');
const AppError = require('../../../utils/AppError');
const HTTP_STATUS = require('../../../constants/httpStatus');

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

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicSiteInfo,
  getPublicPage,
};