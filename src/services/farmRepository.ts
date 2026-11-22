import {
  AdminBuyerAccount,
  AdminFarmerAccount,
  AdminVerificationRecord,
  AgriculturalGuidanceArticle,
  AssistantLogEntry,
  BuyerInquiry,
  BuyerProfile,
  BuyerRequirement,
  ChatMessage,
  Crop,
  CropListing,
  CropScan,
  Farm,
  FarmerProfile,
  FarmHistoryEvent,
  Language,
  NotificationItem,
  Order,
  TransportProviderProfile,
  TransportRequest,
  User,
  UserRole,
} from '../types/kisansetu';
import {
  ASSETS,
  DEMO_ADMIN_BUYERS,
  DEMO_ADMIN_FARMERS,
  DEMO_ADMIN_RECORDS,
  DEMO_ASSISTANT_LOGS,
  DEMO_BUYER_PROFILE,
  DEMO_BUYER_REQUIREMENTS,
  DEMO_CROPS,
  DEMO_FARM,
  DEMO_FARMER_PROFILE,
  DEMO_GUIDANCE_ARTICLES,
  DEMO_HISTORY,
  DEMO_INQUIRIES,
  DEMO_LISTINGS,
  DEMO_NOTIFICATIONS,
  DEMO_ORDERS,
  DEMO_SCANS,
  DEMO_TRANSPORT_PROFILE,
  DEMO_TRANSPORT_REQUESTS,
} from './mockData';

import {
  getSavedLanguage,
  isSupportedLanguage,
  saveLanguagePreference,
  translate,
} from '../i18n';

export interface KisanSetuState {
  hasSeenIntro: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  activeRole: UserRole;
  language: Language;
  lastInteractionId?: string;
  user: User;
  profile: FarmerProfile;
  buyerProfile: BuyerProfile;
  transportProfile: TransportProviderProfile;
  farm: Farm;
  crops: Crop[];
  scans: CropScan[];
  listings: CropListing[];
  inquiries: BuyerInquiry[];
  requirements: BuyerRequirement[];
  orders: Order[];
  transportRequests: TransportRequest[];
  notifications: NotificationItem[];
  history: FarmHistoryEvent[];
  chatMessages: ChatMessage[];
  adminRecords: AdminVerificationRecord[];
  adminFarmers: AdminFarmerAccount[];
  adminBuyers: AdminBuyerAccount[];
  guidanceArticles: AgriculturalGuidanceArticle[];
  assistantLogs: AssistantLogEntry[];
}

const STORAGE_KEY = 'kisansetu_platform_state_v2';
const AUTH_SESSION_KEY = 'kisansetu_auth_session_v1';

interface PersistedAuthSession {
  role: UserRole;
  needsOnboarding: boolean;
  user: User;
}

export function loadAuthSession(): PersistedAuthSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedAuthSession>;
    if (!parsed || !parsed.role || !parsed.user) return null;
    return {
      role: parsed.role,
      needsOnboarding: Boolean(parsed.needsOnboarding),
      user: parsed.user,
    };
  } catch {
    return null;
  }
}

export function saveAuthSession(session: PersistedAuthSession): void {
  try {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage issues in restricted browsers
  }
}

export function clearAuthSession(): void {
  try {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    const legacyKeys = [
      'user',
      'currentUser',
      'authUser',
      'isLoggedIn',
      'session',
      'demoUser',
    ];
    for (const k of legacyKeys) {
      localStorage.removeItem(k);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      delete parsed.isAuthenticated;
      delete parsed.needsOnboarding;
      delete parsed.user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // Ignore storage issues
  }
}

export function buildUserForRole(role: UserRole): User {
  switch (role) {
    case 'buyer':
      return {
        id: 'user-buyer-greenbasket',
        name: DEMO_BUYER_PROFILE.companyName,
        mobile: '+91 98251 90400',
        email: 'procurement@greenbasket-demo.in',
        role: 'buyer',
        isDemo: true,
        verified: true,
      };
    case 'transport':
      return {
        id: 'user-trans-kisan',
        name: DEMO_TRANSPORT_PROFILE.companyName,
        mobile: DEMO_TRANSPORT_PROFILE.phone,
        email: 'dispatch@kisanlogistics-demo.in',
        role: 'transport',
        isDemo: true,
        verified: true,
      };
    case 'admin':
      return {
        id: 'user-admin-ks',
        name: 'KisanSetu Admin',
        mobile: '+91 79 2658 0000',
        email: 'governance@kisansetu-demo.in',
        role: 'admin',
        isDemo: true,
        verified: true,
      };
    case 'farmer':
    default:
      return {
        id: 'user-ramesh-01',
        name: DEMO_FARMER_PROFILE.name,
        mobile: '+91 98250 41920',
        email: 'ramesh.patel@kisansetu-demo.in',
        role: 'farmer',
        isDemo: true,
        verified: true,
      };
  }
}

export function getInitialDemoState(language: Language = 'en', role: UserRole = 'farmer'): KisanSetuState {
  const firstName = DEMO_FARMER_PROFILE.name.split(' ')[0];
  return {
    hasSeenIntro: false,
    isAuthenticated: false,
    needsOnboarding: false,
    activeRole: role,
    language,
    user: buildUserForRole(role),
    profile: { ...DEMO_FARMER_PROFILE, preferredLanguage: language },
    buyerProfile: DEMO_BUYER_PROFILE,
    transportProfile: DEMO_TRANSPORT_PROFILE,
    farm: DEMO_FARM,
    crops: DEMO_CROPS,
    scans: DEMO_SCANS,
    listings: DEMO_LISTINGS,
    inquiries: DEMO_INQUIRIES,
    requirements: DEMO_BUYER_REQUIREMENTS,
    orders: DEMO_ORDERS,
    transportRequests: DEMO_TRANSPORT_REQUESTS,
    notifications: DEMO_NOTIFICATIONS,
    history: DEMO_HISTORY,
    chatMessages: [
      {
        id: 'chat-welcome-01',
        role: 'assistant',
        text: translate(language, 'assistant.welcomeMessage', { name: firstName }),
        timestamp: '08:00 AM',
        language,
        sourceLabel: 'KisanSetu Assistant',
      },
    ],
    adminRecords: DEMO_ADMIN_RECORDS,
    adminFarmers: DEMO_ADMIN_FARMERS,
    adminBuyers: DEMO_ADMIN_BUYERS,
    guidanceArticles: DEMO_GUIDANCE_ARTICLES,
    assistantLogs: DEMO_ASSISTANT_LOGS,
  };
}

export function loadPersistedState(): KisanSetuState {
  const savedLang = getSavedLanguage();
  const authSession = loadAuthSession();
  const hasSeenIntro = sessionStorage.getItem('kisansetu_intro_done') === '1';

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveLanguagePreference(savedLang);
      const fresh = getInitialDemoState(savedLang, authSession?.role || 'farmer');
      return {
        ...fresh,
        hasSeenIntro,
        isAuthenticated: Boolean(authSession),
        needsOnboarding: authSession?.needsOnboarding ?? false,
        activeRole: authSession?.role || 'farmer',
        user: authSession?.user || fresh.user,
      };
    }

    const parsed = JSON.parse(raw) as Partial<KisanSetuState>;
    const resolvedLang: Language = isSupportedLanguage(localStorage.getItem('kisansetu_language'))
      ? (localStorage.getItem('kisansetu_language') as Language)
      : isSupportedLanguage(parsed.language)
      ? parsed.language
      : savedLang;
    saveLanguagePreference(resolvedLang);

    const resolvedRole: UserRole = authSession?.role || 'farmer';
    const base = getInitialDemoState(resolvedLang, resolvedRole);

    // Strip any legacy auth fields that may exist in localStorage so unauthenticated users NEVER auto-login
    const {
      isAuthenticated: _ignoredAuth,
      needsOnboarding: _ignoredOnboarding,
      user: _ignoredUser,
      activeRole: _ignoredRole,
      ...domainData
    } = parsed;

    const merged: KisanSetuState = {
      ...base,
      ...domainData,
      language: resolvedLang,
      profile: {
        ...(domainData.profile || base.profile),
        preferredLanguage: resolvedLang,
      },
      hasSeenIntro,
      isAuthenticated: Boolean(authSession),
      needsOnboarding: authSession?.needsOnboarding ?? false,
      activeRole: resolvedRole,
      user: authSession?.user || base.user,
    };
    return merged;
  } catch {
    const fallback = getInitialDemoState(savedLang, authSession?.role || 'farmer');
    return {
      ...fallback,
      hasSeenIntro,
      isAuthenticated: Boolean(authSession),
      needsOnboarding: authSession?.needsOnboarding ?? false,
      user: authSession?.user || fallback.user,
    };
  }
}

export function savePersistedState(state: KisanSetuState): void {
  try {
    // Never persist authentication or user session flags into localStorage
    const {
      isAuthenticated,
      needsOnboarding,
      user,
      activeRole,
      ...persistableDomainState
    } = state;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistableDomainState));
    saveLanguagePreference(state.language);

    if (state.hasSeenIntro) {
      sessionStorage.setItem('kisansetu_intro_done', '1');
    }

    if (isAuthenticated) {
      saveAuthSession({
        role: activeRole,
        needsOnboarding,
        user,
      });
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    }
  } catch {
    // Ignore storage quota issues in restricted browsers
  }
}

export function createProfileFromOnboarding(input: {
  farmerName: string;
  village: string;
  district: string;
  state: string;
  landSizeAcres: number;
  soilType: string;
  irrigationType: string;
  waterAvailability: 'Abundant' | 'Moderate' | 'Limited';
  mainCrops: string[];
  experienceYears: number;
  preferredLanguage: Language;
}): Partial<KisanSetuState> {
  const cleanName = input.farmerName.trim() || 'Farmer';
  const crops: Crop[] = (input.mainCrops.length > 0 ? input.mainCrops : ['Tomato']).map((cropName, idx) => ({
    id: `crop-onb-${idx + 1}`,
    farmId: 'farm-user-01',
    name: cropName,
    variety: cropName === 'Wheat' ? 'GW-496 Lokwan' : cropName === 'Tomato' ? 'Abhinav Hybrid' : 'Regional Cultivar',
    areaAcres: Number((input.landSizeAcres / Math.max(1, input.mainCrops.length)).toFixed(1)),
    sowingDate: '2026-10-12',
    expectedHarvestDate: '2027-01-20',
    growthStage: 'Vegetative / Active Growth',
    healthScore: 85,
    status: 'Healthy',
    imageUrl: cropName.toLowerCase().includes('wheat') ? ASSETS.wheatGolden : ASSETS.tomatoHealthy,
  }));

  return {
    needsOnboarding: false,
    isAuthenticated: true,
    activeRole: 'farmer',
    language: input.preferredLanguage,
    user: {
      id: 'user-custom-01',
      name: cleanName,
      mobile: '+91 98000 11223',
      email: `${cleanName.toLowerCase().replace(/\s+/g, '.')}@kisansetu.in`,
      role: 'farmer',
      isDemo: true,
      verified: true,
    },
    profile: {
      id: 'farmer-custom-01',
      userId: 'user-custom-01',
      name: cleanName,
      avatarUrl: ASSETS.farmerPortrait,
      village: input.village || 'Borsad',
      district: input.district || 'Anand',
      state: input.state || 'Gujarat',
      experienceYears: input.experienceYears,
      preferredLanguage: input.preferredLanguage,
      verifiedFarmer: true,
      joinedDate: new Date().toISOString().slice(0, 10),
    },
    farm: {
      ...DEMO_FARM,
      id: 'farm-user-01',
      farmerId: 'farmer-custom-01',
      name: `${cleanName.split(' ')[0]}'s Farm — ${input.village || input.district}`,
      landSizeAcres: input.landSizeAcres,
      soilType: input.soilType,
      irrigationType: input.irrigationType,
      waterAvailability: input.waterAvailability,
      overallHealthScore: 85,
    },
    crops,
  };
}
