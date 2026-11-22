import { CropGrade, MarketPrice } from '../types/kisansetu';
import { DEMO_MARKET_PRICES } from './mockData';

/**
 * Market Intelligence Service Layer
 * Structured to allow drop-in replacement with live eNAM / Agmarknet / APMC APIs.
 * Currently returns clearly labeled demo mandi prices.
 */
export const marketService = {
  async getMarketPrices(cropFilter?: string, gradeFilter?: CropGrade | 'ALL'): Promise<MarketPrice[]> {
    let data = [...DEMO_MARKET_PRICES];
    if (cropFilter && cropFilter !== 'ALL') {
      data = data.filter((m) => m.crop.toLowerCase() === cropFilter.toLowerCase());
    }
    if (gradeFilter && gradeFilter !== 'ALL') {
      data = data.filter((m) => m.grade === gradeFilter);
    }
    return data;
  },

  async getRecommendationForCrop(cropName: string, grade: CropGrade) {
    const matches = DEMO_MARKET_PRICES.filter(
      (m) => m.crop.toLowerCase() === cropName.toLowerCase() && m.grade === grade
    );
    const fallback = DEMO_MARKET_PRICES.filter(
      (m) => m.crop.toLowerCase() === cropName.toLowerCase()
    );
    const list = matches.length > 0 ? matches : fallback.length > 0 ? fallback : [DEMO_MARKET_PRICES[0]];
    const sorted = [...list].sort((a, b) => b.modalPricePerKg - a.modalPricePerKg);
    const minPrice = Math.min(...list.map((m) => m.minPricePerKg));
    const maxPrice = Math.max(...list.map((m) => m.maxPricePerKg));
    const topMarket = sorted[0];

    return {
      crop: cropName,
      grade,
      estimatedRange: `₹${minPrice}–₹${maxPrice}/kg`,
      topMarketName: topMarket.marketName,
      topMarketPrice: `₹${topMarket.modalPricePerKg}/kg`,
      demand: topMarket.demand,
      trend: topMarket.trend,
      nearbyMarkets: sorted,
      strategyNote: `Your crop appears suitable for Grade-${grade} market positioning. Compare nearby buyers and markets before selling.`,
      isDemoData: true,
    };
  },
};
