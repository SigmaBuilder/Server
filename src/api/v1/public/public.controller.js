'use strict';

/**
 * Obtiene la información general del sitio.
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

module.exports = {
  getPublicSiteInfo,
};
