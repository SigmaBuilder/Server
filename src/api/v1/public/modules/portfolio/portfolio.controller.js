'use strict';

const portfolioService = require('./portfolio.service');

/**
 * Obtiene el portfolio del sitio.
 */
const getPublicPortfolio = async (req, res, next) => {
  try {
    const { id: siteId } = req.site;
    const portfolioData = await portfolioService.getPortfolioData(siteId);
    
    res.json({
      portfolio: portfolioData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicPortfolio,
};
