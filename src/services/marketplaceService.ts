import {
  Buyer,
  BuyerRequirement,
  CropListing,
  SupplyContribution,
  SupplyMatch,
  TransportVehicleType,
} from '../types/kisansetu';
import { DEMO_BUYERS, DEMO_BUYER_REQUIREMENTS } from './mockData';

export interface FarmerMatchDetail {
  listing: CropListing;
  matchScore: number;
  factors: {
    cropMatch: boolean;
    gradeMatch: boolean;
    locationMatch: string;
    dateMatch: string;
    priceFit: string;
  };
}

/**
 * Marketplace, Matching Engine & Transport Cost Estimator Service Layer
 */
export const marketplaceService = {
  getBuyers(): Buyer[] {
    return DEMO_BUYERS;
  },

  computeSupplyMatches(requirements: BuyerRequirement[]): SupplyMatch[] {
    return requirements.map((req) => {
      const totalAvailableKg = req.contributions.reduce((sum, c) => sum + c.quantityKg, 0);
      const matchingPercentage = Math.min(
        100,
        Math.round((totalAvailableKg / Math.max(1, req.requiredQtyKgPerWeek)) * 100)
      );
      const gapKg = Math.max(0, req.requiredQtyKgPerWeek - totalAvailableKg);
      return {
        requirement: req,
        totalAvailableKg,
        matchingPercentage,
        gapKg,
      };
    });
  },

  /**
   * Automatically calculates matching farmer supply from active approved listings
   * based on crop, grade, location, availability date, and price.
   */
  findMatchingFarmerLots(
    requirement: BuyerRequirement,
    listings: CropListing[]
  ): FarmerMatchDetail[] {
    return listings
      .filter(
        (l) =>
          l.available &&
          l.moderationStatus !== 'Rejected' &&
          l.crop.toLowerCase() === requirement.crop.toLowerCase()
      )
      .map((listing) => {
        const gradeMatch =
          listing.grade === requirement.grade ||
          (requirement.grade === 'B' && listing.grade === 'A');
        const maxPrice = requirement.maxPricePerKg || 999;
        const priceWithinCap = listing.expectedPricePerKg <= maxPrice;

        let score = 50;
        if (gradeMatch) score += 25;
        if (priceWithinCap) score += 15;
        if (listing.location.toLowerCase().includes('gujarat') || listing.location.toLowerCase().includes('gj')) {
          score += 10;
        }

        return {
          listing,
          matchScore: Math.min(100, score),
          factors: {
            cropMatch: true,
            gradeMatch,
            locationMatch: listing.location,
            dateMatch: `Ready ${listing.harvestDate}`,
            priceFit: priceWithinCap
              ? `₹${listing.expectedPricePerKg}/kg (within ₹${maxPrice}/kg cap)`
              : `₹${listing.expectedPricePerKg}/kg (above ₹${maxPrice}/kg cap)`,
          },
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  },

  buildAutoContributionsForRequirement(
    requirement: Pick<BuyerRequirement, 'crop' | 'grade' | 'requiredQtyKgPerWeek' | 'maxPricePerKg'>,
    listings: CropListing[]
  ): SupplyContribution[] {
    const matched = listings.filter(
      (l) =>
        l.available &&
        l.moderationStatus !== 'Rejected' &&
        l.crop.toLowerCase() === requirement.crop.toLowerCase() &&
        (l.grade === requirement.grade || (requirement.grade === 'B' && l.grade === 'A'))
    );

    const contributions: SupplyContribution[] = [];
    let accumulated = 0;
    for (const lot of matched) {
      if (accumulated >= requirement.requiredQtyKgPerWeek) break;
      const take = Math.min(lot.quantityKg, requirement.requiredQtyKgPerWeek - accumulated);
      contributions.push({
        farmerId: lot.farmerId,
        farmerLabel: lot.farmerName,
        village: lot.location.split(',')[0],
        quantityKg: take,
        grade: lot.grade,
        harvestWindow: `Ready ${lot.harvestDate}`,
        verifiedFarmer: true,
        pricePerKg: lot.expectedPricePerKg,
      });
      accumulated += take;
    }
    return contributions;
  },

  estimateDemoTransport(
    pickupLocation: string,
    destination: string,
    quantityKg: number,
    vehicleType: TransportVehicleType
  ): { estimatedDistanceKm: number; estimatedCostRange: string } {
    const p = pickupLocation.toLowerCase();
    const d = destination.toLowerCase();
    let distance = 115;
    if ((p.includes('surat') && d.includes('ahmedabad')) || (p.includes('ahmedabad') && d.includes('surat'))) {
      distance = 264;
    } else if (p.includes('borsad') && d.includes('ahmedabad')) {
      distance = 182;
    } else if (p.includes('umreth') || p.includes('petlad') || p.includes('nadiad')) {
      distance = 92;
    } else if (p.includes('vadodara')) {
      distance = 112;
    }

    const perKmRate =
      vehicleType === 'Pickup Van'
        ? 22
        : vehicleType === 'Mini Truck'
        ? 28
        : vehicleType === '14ft Eicher'
        ? 38
        : 45;

    const baseFee = 450 + Math.round(quantityKg * 0.45);
    const midCost = Math.round((distance * perKmRate + baseFee) / 100) * 100;
    const minCost = Math.max(1200, midCost - 400);
    const maxCost = midCost + 400;

    return {
      estimatedDistanceKm: distance,
      estimatedCostRange: `₹${minCost.toLocaleString()}–₹${maxCost.toLocaleString()}`,
    };
  },

  getDefaultRequirements(): BuyerRequirement[] {
    return DEMO_BUYER_REQUIREMENTS;
  },
};
