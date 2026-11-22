export type Language = 'en' | 'hi' | 'gu';

export type UserRole = 'farmer' | 'buyer' | 'transport' | 'admin';

export type CropGrade = 'A' | 'B' | 'C';

export type SeverityLevel = 'None' | 'Low' | 'Medium' | 'High';

export type OrderStatus =
  | 'Order Created'
  | 'Transport Requested'
  | 'Pickup Scheduled'
  | 'Pickup Completed'
  | 'In Transit'
  | 'Delivered'
  | 'Completed';

export type TransportVehicleType = 'Pickup Van' | 'Mini Truck' | '14ft Eicher' | 'Reefer Van';

export type TransportStatus =
  | 'Requested'
  | 'Driver Assigned'
  | 'Pickup Scheduled'
  | 'Pickup Completed'
  | 'In Transit'
  | 'Delivered';

export type ListingModerationStatus = 'Approved' | 'Pending' | 'Rejected' | 'Flagged';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: UserRole;
  isDemo: boolean;
  verified: boolean;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  village: string;
  district: string;
  state: string;
  experienceYears: number;
  preferredLanguage: Language;
  verifiedFarmer: boolean;
  joinedDate: string;
}

export interface BuyerProfile {
  id: string;
  companyName: string;
  contactName: string;
  type: Buyer['type'];
  location: string;
  verifiedBuyer: boolean;
  activeSince: string;
}

export interface TransportProviderProfile {
  id: string;
  companyName: string;
  driverName: string;
  vehicleType: TransportVehicleType;
  vehicleNumber: string;
  baseCity: string;
  phone: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  landSizeAcres: number;
  soilType: string;
  irrigationType: string;
  waterAvailability: 'Abundant' | 'Moderate' | 'Limited';
  overallHealthScore: number;
  healthTrendDelta: number;
  healthHistory: Array<{ week: string; score: number }>;
}

export interface Crop {
  id: string;
  farmId: string;
  name: string;
  variety: string;
  areaAcres: number;
  sowingDate: string;
  expectedHarvestDate: string;
  growthStage: string;
  healthScore: number;
  status: 'Healthy' | 'Watch' | 'Action Needed';
  imageUrl: string;
}

export interface VisualCharacteristics {
  color: string;
  apparentMaturity: string;
  visibleDamage: string;
  spots: string;
  sizeAppearance: string;
  freshnessIndicator: string;
}

export interface QualityAssessment {
  qualityScore: number;
  suggestedGrade: CropGrade;
  visibleIssuesSummary: string;
  characteristics: VisualCharacteristics;
}

export interface TreatmentGuidance {
  approachSummary: string;
  activeIngredientCategory: string;
  safetyPrecautions: string;
  preHarvestCaution: string;
  expertConfirmationNote: string;
}

export interface DiseaseDetection {
  detected: boolean;
  possibleDisease: string;
  confidence: number;
  severity: SeverityLevel;
  symptomsObserved: string[];
  immediateActions: string[];
  preventiveMeasures: string[];
  treatmentGuidance: TreatmentGuidance;
}

export interface CropScan {
  id: string;
  farmId: string;
  farmerName?: string;
  cropName: string;
  varietyGuess: string;
  growthStage: string;
  healthScore: number;
  imageUrl: string;
  scannedAt: string;
  sourceLabel: string;
  isDemoAnalysis: boolean;
  reviewStatus?: 'Normal' | 'Flagged for Review' | 'Verified';
  quality: QualityAssessment;
  disease: DiseaseDetection;
  marketInsightNote: string;
}

export interface VerifiedGuidanceDetail {
  verificationSourceNote: string;
  culturalAndMechanicalSteps: string[];
  biologicalOptions: string[];
  chemicalClassToDiscussWithExpert: string;
  workerAndCropSafety: string[];
  recommendedLocalAuthority: string;
  sourceType: 'ai_synthesized' | 'demo_extension_library';
}

export interface MarketPrice {
  id: string;
  crop: string;
  grade: CropGrade;
  marketId: string;
  marketName: string;
  location: string;
  distanceKm: number;
  minPricePerKg: number;
  maxPricePerKg: number;
  modalPricePerKg: number;
  demand: 'High' | 'Moderate' | 'Low';
  trend: 'Rising' | 'Stable' | 'Softening';
  changePct7d: number;
  updatedAt: string;
  isDemoData: boolean;
  history14d: Array<{ day: string; price: number }>;
}

export interface Market {
  id: string;
  name: string;
  district: string;
  state: string;
  type: 'APMC Mandi' | 'Organized Packhouse' | 'Direct Procurement Hub';
}

export interface Buyer {
  id: string;
  name: string;
  type: 'Retailer' | 'Restaurant' | 'Food Business' | 'Processor' | 'FPO' | 'Agritech Company';
  location: string;
  verifiedBuyer: boolean;
  lookingFor: string[];
  preferredGrade: CropGrade;
  ratingNote: string;
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  quantityKg: number;
  grade: CropGrade;
  harvestDate: string;
  location: string;
  expectedPricePerKg: number;
  imageUrl: string;
  available: boolean;
  moderationStatus?: ListingModerationStatus;
  createdAt: string;
  inquiriesCount: number;
}

export interface BuyerInquiry {
  id: string;
  listingId?: string;
  requirementId?: string;
  farmerId?: string;
  farmerName?: string;
  buyerId: string;
  buyerName: string;
  buyerType: Buyer['type'];
  crop: string;
  grade: CropGrade;
  offeredPricePerKg: number;
  requestedQtyKg: number;
  message: string;
  createdAt: string;
  status: 'New' | 'Responded' | 'Accepted' | 'Rejected';
}

export interface SupplyContribution {
  farmerId: string;
  farmerLabel: string;
  village: string;
  quantityKg: number;
  grade: CropGrade;
  harvestWindow: string;
  verifiedFarmer: boolean;
  pricePerKg?: number;
}

export interface BuyerRequirement {
  id: string;
  buyerId?: string;
  buyerName: string;
  buyerType: Buyer['type'];
  crop: string;
  grade: CropGrade;
  requiredQtyKgPerWeek: number;
  location: string;
  deliveryWindow: string;
  requiredDeliveryDate?: string;
  maxPricePerKg?: number;
  additionalNotes?: string;
  indicativePriceRange: string;
  status?: 'Active' | 'Fulfilled';
  createdAt?: string;
  contributions: SupplyContribution[];
}

export interface SupplyMatch {
  requirement: BuyerRequirement;
  totalAvailableKg: number;
  matchingPercentage: number;
  gapKg: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  listingId?: string;
  requirementId?: string;
  inquiryId?: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  buyerId: string;
  buyerName: string;
  buyerLocation: string;
  crop: string;
  grade: CropGrade;
  quantityKg: number;
  pricePerKg: number;
  totalEstimatedValueInr: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  transportRequestId?: string;
}

export interface TransportTimelineStep {
  step: string;
  timestamp: string;
  completed: boolean;
}

export interface TransportRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  requestedByRole: UserRole;
  farmerName: string;
  buyerName: string;
  crop: string;
  quantityKg: number;
  pickupLocation: string;
  destination: string;
  preferredPickupDate: string;
  vehicleType: TransportVehicleType;
  specialHandling: string;
  estimatedDistanceKm: number;
  estimatedCostRange: string;
  providerName?: string;
  driverName?: string;
  driverPhone?: string;
  currentSimulatedLocation: string;
  status: TransportStatus;
  createdAt: string;
  isDemoEstimate: boolean;
  timeline: TransportTimelineStep[];
}

export interface WeatherForecastDay {
  day: string;
  condition: string;
  tempHighC: number;
  tempLowC: number;
  rainProbability: number;
  humidityPct: number;
}

export interface WeatherAlert {
  id: string;
  title: string;
  advisory: string;
  severity: 'Info' | 'Caution' | 'Warning';
  validUntil: string;
}

export interface WeatherData {
  location: string;
  currentTempC: number;
  condition: string;
  humidityPct: number;
  windKmh: number;
  rainProbabilityToday: number;
  isDemoData: boolean;
  forecast: WeatherForecastDay[];
  alerts: WeatherAlert[];
}

export interface NotificationItem {
  id: string;
  type: 'scan' | 'disease' | 'weather' | 'market' | 'buyer' | 'harvest' | 'order' | 'transport';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionRoute: string;
  targetRole?: UserRole | 'all';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language: Language;
  sourceLabel?: string;
  toolsUsed?: string[];
}

export interface FarmHistoryEvent {
  id: string;
  crop: string;
  stageType:
    | 'planted'
    | 'scanned'
    | 'disease'
    | 'treatment'
    | 'improved'
    | 'harvest'
    | 'listed'
    | 'inquiry'
    | 'order'
    | 'transport';
  title: string;
  detail: string;
  date: string;
  verifiedTag?: string;
}

export interface CropDecisionComparison {
  crop: string;
  investmentBand: string;
  waterRequirement: string;
  marketDemand: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  potentialOutlook: string;
  harvestCycleDays: string;
  suitabilityScore: number;
  whyRecommended: string;
}

export interface CropDecisionResult {
  summaryAdvice: string;
  topRecommendationCrop: string;
  comparisons: CropDecisionComparison[];
  sourceLabel: string;
  isDemoResult: boolean;
}

export interface AdminVerificationRecord {
  id: string;
  entityName: string;
  entityType: 'Farmer' | 'Buyer' | 'Guidance' | 'Listing' | 'Scan';
  locationOrScope: string;
  status: 'Verified' | 'Pending Review' | 'Flagged';
  updatedAt: string;
  notes: string;
}

export interface AdminFarmerAccount {
  id: string;
  name: string;
  village: string;
  district: string;
  state: string;
  phone: string;
  landSizeAcres: number;
  crops: string[];
  soilType: string;
  status: 'Verified' | 'Pending' | 'Suspended';
  joinedDate: string;
}

export interface AdminBuyerAccount {
  id: string;
  companyName: string;
  type: Buyer['type'];
  location: string;
  activeRequirementsCount: number;
  ordersCount: number;
  status: 'Verified' | 'Pending' | 'Suspended';
  joinedDate: string;
}

export type GuidanceCategory =
  | 'Crop disease'
  | 'Pest'
  | 'Prevention'
  | 'Treatment'
  | 'Fertilizer guidance'
  | 'Irrigation'
  | 'Harvesting';

export interface AgriculturalGuidanceArticle {
  id: string;
  title: string;
  category: GuidanceCategory;
  crop: string;
  summary: string;
  verifiedSteps: string[];
  cautionNote: string;
  sourceAuthority: string;
  updatedAt: string;
}

export interface AssistantLogEntry {
  id: string;
  farmerName: string;
  language: Language;
  query: string;
  responsePreview: string;
  source: string;
  timestamp: string;
}
