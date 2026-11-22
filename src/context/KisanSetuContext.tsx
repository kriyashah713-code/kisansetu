import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AdminBuyerAccount,
  AdminFarmerAccount,
  AgriculturalGuidanceArticle,
  AssistantLogEntry,
  BuyerInquiry,
  BuyerProfile,
  BuyerRequirement,
  CropGrade,
  CropListing,
  CropScan,
  FarmHistoryEvent,
  Language,
  ListingModerationStatus,
  NotificationItem,
  Order,
  TransportRequest,
  TransportStatus,
  TransportVehicleType,
  UserRole,
} from '../types/kisansetu';
import {
  buildUserForRole,
  clearAuthSession,
  createProfileFromOnboarding,
  getInitialDemoState,
  KisanSetuState,
  loadPersistedState,
  saveAuthSession,
  savePersistedState,
} from '../services/farmRepository';
import { marketplaceService } from '../services/marketplaceService';
import {
  LANGUAGE_LABELS,
  saveLanguagePreference,
  translate,
  translateCrop,
  translateRole,
  translateStatus,
  TranslationKey,
} from '../i18n';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'info' | 'warning' | 'error';
}

interface KisanSetuContextValue {
  state: KisanSetuState;
  language: Language;
  t: (key: TranslationKey | string, vars?: Record<string, string | number>) => string;
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  completeIntro: () => void;
  replayIntro: () => void;
  setLanguage: (lang: Language) => void;
  loginAsDemoFarmer: () => void;
  loginAsDemoRole: (role: UserRole) => void;
  loginWithCredentials: (identifier: string, role?: UserRole) => void;
  startOnboardingSignup: (nameOrEmail: string, role?: UserRole, preferredLang?: Language, identifier?: string) => void;
  completeOnboarding: (input: Parameters<typeof createProfileFromOnboarding>[0]) => void;
  finishRoleOnboarding: (orgOrName: string, location: string) => void;
  logout: () => void;
  addCropScan: (scan: CropScan) => void;
  addCropListing: (
    listing: Omit<CropListing, 'id' | 'farmerId' | 'farmerName' | 'createdAt' | 'inquiriesCount'>
  ) => CropListing;
  addBuyerRequirement: (input: {
    crop: string;
    quantityKg: number;
    minGrade: CropGrade;
    preferredLocation: string;
    maxPricePerKg: number;
    requiredDeliveryDate: string;
    additionalNotes: string;
  }) => BuyerRequirement;
  sendBuyerInquiryToFarmer: (input: {
    listingId: string;
    requirementId?: string;
    farmerId: string;
    farmerName: string;
    crop: string;
    grade: CropGrade;
    offeredPricePerKg: number;
    requestedQtyKg: number;
    message: string;
  }) => void;
  updateInquiryStatus: (inquiryId: string, status: BuyerInquiry['status']) => Order | null;
  sendInquiryReply: (buyerId: string, listingId: string, message: string) => void;
  createOrderFromListing: (listing: CropListing, quantityKg: number, pricePerKg: number) => Order;
  requestTransportForOrder: (input: {
    orderId?: string;
    crop: string;
    quantityKg: number;
    pickupLocation: string;
    destination: string;
    preferredPickupDate: string;
    vehicleType: TransportVehicleType;
    specialHandling: string;
  }) => TransportRequest;
  advanceTransportStage: (transportId: string, nextStatus: TransportStatus) => void;
  markOrderCompleted: (orderId: string) => void;
  commitSupplyContribution: (requirementId: string, quantityKg: number) => void;
  addHistoryEvent: (event: Omit<FarmHistoryEvent, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addChatMessages: (
    messages: KisanSetuState['chatMessages'],
    interactionId?: string,
    logEntry?: Omit<AssistantLogEntry, 'id' | 'timestamp'>
  ) => void;
  clearChatMessages: () => void;
  updateBuyerProfile: (patch: Partial<BuyerProfile>) => void;
  toggleAdminVerification: (recordId: string) => void;
  updateAdminFarmerStatus: (farmerId: string, status: AdminFarmerAccount['status']) => void;
  updateAdminBuyerStatus: (buyerId: string, status: AdminBuyerAccount['status']) => void;
  moderateListing: (listingId: string, status: ListingModerationStatus) => void;
  updateScanReviewStatus: (scanId: string, status: NonNullable<CropScan['reviewStatus']>) => void;
  saveGuidanceArticle: (article: Omit<AgriculturalGuidanceArticle, 'id' | 'updatedAt'> & { id?: string }) => void;
  deleteGuidanceArticle: (id: string) => void;
  resetDemoWorkspace: () => void;
}

const KisanSetuContext = createContext<KisanSetuContextValue | null>(null);

export const KisanSetuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<KisanSetuState>(() => loadPersistedState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  const pushToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const t = (key: TranslationKey | string, vars?: Record<string, string | number>) =>
    translate(state.language, key, vars);

  const completeIntro = () => setState((prev) => ({ ...prev, hasSeenIntro: true }));

  const replayIntro = () => {
    sessionStorage.removeItem('kisansetu_intro_done');
    setState((prev) => ({ ...prev, hasSeenIntro: false }));
  };

  const setLanguage = (lang: Language) => {
    saveLanguagePreference(lang);
    setState((prev) => {
      const updatedMessages =
        prev.chatMessages.length === 1 && prev.chatMessages[0].id === 'chat-welcome-01'
          ? [
              {
                ...prev.chatMessages[0],
                language: lang,
                text: translate(lang, 'assistant.welcomeMessage', {
                  name: prev.profile.name.split(' ')[0],
                }),
              },
            ]
          : prev.chatMessages;

      return {
        ...prev,
        language: lang,
        profile: { ...prev.profile, preferredLanguage: lang },
        chatMessages: updatedMessages,
      };
    });
    pushToast({
      title: translate(lang, 'toasts.languageChanged', { lang: LANGUAGE_LABELS[lang] }),
      variant: 'info',
    });
  };

  const loginAsDemoRole = (role: UserRole) => {
    const nextUser = buildUserForRole(role);
    saveAuthSession({ role, needsOnboarding: false, user: nextUser });
    setState((prev) => ({
      ...prev,
      hasSeenIntro: true,
      isAuthenticated: true,
      needsOnboarding: false,
      activeRole: role,
      user: nextUser,
    }));

    pushToast({
      title: t('toasts.signedIn', { role: translateRole(state.language, role) }),
      variant: 'success',
    });
  };

  const loginAsDemoFarmer = () => loginAsDemoRole('farmer');

  const loginWithCredentials = (identifier: string, role: UserRole = 'farmer') => {
    const baseUser = buildUserForRole(role);
    const nextUser = {
      ...baseUser,
      email: identifier.includes('@') ? identifier : baseUser.email,
      mobile: !identifier.includes('@') ? identifier : baseUser.mobile,
    };
    saveAuthSession({ role, needsOnboarding: false, user: nextUser });
    setState((prev) => ({
      ...prev,
      hasSeenIntro: true,
      isAuthenticated: true,
      needsOnboarding: false,
      activeRole: role,
      user: nextUser,
    }));
    pushToast({
      title: t('toasts.signedIn', { role: translateRole(state.language, role) }),
      variant: 'success',
    });
  };

  const startOnboardingSignup = (
    nameOrEmail: string,
    role: UserRole = 'farmer',
    preferredLang?: Language,
    identifier?: string
  ) => {
    const lang = preferredLang || state.language;
    saveLanguagePreference(lang);
    const baseUser = buildUserForRole(role);
    const displayName = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail.trim() || baseUser.name;
    const nextUser = {
      ...baseUser,
      name: displayName,
      email: identifier?.includes('@') ? identifier : baseUser.email,
      mobile: identifier && !identifier.includes('@') ? identifier : baseUser.mobile,
    };
    saveAuthSession({ role, needsOnboarding: true, user: nextUser });
    setState((prev) => ({
      ...prev,
      hasSeenIntro: true,
      isAuthenticated: true,
      needsOnboarding: true,
      activeRole: role,
      language: lang,
      user: nextUser,
      profile: {
        ...prev.profile,
        name: role === 'farmer' ? displayName : prev.profile.name,
        preferredLanguage: lang,
      },
      buyerProfile: {
        ...prev.buyerProfile,
        companyName: role === 'buyer' ? displayName : prev.buyerProfile.companyName,
      },
      transportProfile: {
        ...prev.transportProfile,
        companyName: role === 'transport' ? displayName : prev.transportProfile.companyName,
      },
    }));
  };

  const completeOnboarding = (input: Parameters<typeof createProfileFromOnboarding>[0]) => {
    const patch = createProfileFromOnboarding(input);
    saveLanguagePreference(input.preferredLanguage);
    if (patch.user) {
      saveAuthSession({ role: 'farmer', needsOnboarding: false, user: patch.user });
    }
    setState((prev) => ({
      ...prev,
      ...patch,
      hasSeenIntro: true,
      isAuthenticated: true,
      needsOnboarding: false,
      activeRole: 'farmer',
    }));
    pushToast({
      title: translate(input.preferredLanguage, 'toasts.farmSaved'),
      description: `${input.landSizeAcres} ${translate(input.preferredLanguage, 'common.acres')} · ${input.village || input.district}`,
      variant: 'success',
    });
  };

  const finishRoleOnboarding = (orgOrName: string, location: string) => {
    setState((prev) => ({
      ...prev,
      hasSeenIntro: true,
      isAuthenticated: true,
      needsOnboarding: false,
      user: {
        ...prev.user,
        name: orgOrName.trim() || prev.user.name,
      },
      buyerProfile:
        prev.activeRole === 'buyer'
          ? {
              ...prev.buyerProfile,
              companyName: orgOrName.trim() || prev.buyerProfile.companyName,
              location: location.trim() || prev.buyerProfile.location,
            }
          : prev.buyerProfile,
      transportProfile:
        prev.activeRole === 'transport'
          ? {
              ...prev.transportProfile,
              companyName: orgOrName.trim() || prev.transportProfile.companyName,
              baseCity: location.trim() || prev.transportProfile.baseCity,
            }
          : prev.transportProfile,
    }));
    pushToast({
      title: t('toasts.signedIn', { role: translateRole(state.language, state.activeRole) }),
      variant: 'success',
    });
  };

  const logout = () => {
    clearAuthSession();
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      needsOnboarding: false,
    }));
  };

  const addCropScan = (scan: CropScan) => {
    const enrichedScan: CropScan = {
      ...scan,
      farmerName: scan.farmerName || state.profile.name,
      reviewStatus: scan.reviewStatus || 'Normal',
    };
    const newNotif: NotificationItem = {
      id: `notif-scan-${Date.now()}`,
      type: scan.disease.detected ? 'disease' : 'scan',
      title: scan.disease.detected
        ? `Screening Alert: ${scan.disease.possibleDisease}`
        : `Crop Scan Completed: ${scan.cropName} (Grade ${scan.quality.suggestedGrade})`,
      body: scan.disease.detected
        ? `${scan.cropName} showed ${scan.disease.severity.toLowerCase()} symptoms (${scan.disease.confidence}% screening confidence).`
        : `Visual quality score ${scan.quality.qualityScore}/100. Ready for market comparison.`,
      timestamp: 'Just now',
      read: false,
      actionRoute: '/scanner',
      targetRole: 'farmer',
    };

    const newHist: FarmHistoryEvent = {
      id: `hist-scan-${Date.now()}`,
      crop: scan.cropName,
      stageType: scan.disease.detected ? 'disease' : 'scanned',
      title: `${scan.cropName} AI Scan (${scan.quality.qualityScore}/100 · Grade ${scan.quality.suggestedGrade})`,
      detail: scan.disease.detected
        ? `${scan.disease.possibleDisease} flagged (${scan.disease.severity} severity).`
        : 'Canopy and visible quality screened cleanly.',
      date: 'Today',
    };

    setState((prev) => ({
      ...prev,
      scans: [enrichedScan, ...prev.scans],
      notifications: [newNotif, ...prev.notifications],
      history: [newHist, ...prev.history],
    }));
  };

  const addCropListing = (
    input: Omit<CropListing, 'id' | 'farmerId' | 'farmerName' | 'createdAt' | 'inquiriesCount'>
  ) => {
    const newListing: CropListing = {
      ...input,
      id: `list-${Date.now()}`,
      farmerId: state.profile.id,
      farmerName: state.profile.name,
      moderationStatus: 'Approved',
      createdAt: 'Just now',
      inquiriesCount: 0,
    };

    const newHist: FarmHistoryEvent = {
      id: `hist-list-${Date.now()}`,
      crop: input.crop,
      stageType: 'listed',
      title: `Listed ${input.quantityKg} kg Grade-${input.grade} ${input.crop}`,
      detail: `Expected price ₹${input.expectedPricePerKg}/kg · Harvest date ${input.harvestDate}.`,
      date: 'Today',
    };

    setState((prev) => ({
      ...prev,
      listings: [newListing, ...prev.listings],
      history: [newHist, ...prev.history],
    }));

    pushToast({
      title: t('toasts.listingPublished', {
        qty: input.quantityKg,
        crop: translateCrop(state.language, input.crop),
      }),
      variant: 'success',
    });

    return newListing;
  };

  const addBuyerRequirement: KisanSetuContextValue['addBuyerRequirement'] = (input) => {
    const autoContribs = marketplaceService.buildAutoContributionsForRequirement(
      {
        crop: input.crop,
        grade: input.minGrade,
        requiredQtyKgPerWeek: input.quantityKg,
        maxPricePerKg: input.maxPricePerKg,
      },
      state.listings
    );

    const newReq: BuyerRequirement = {
      id: `req-${Date.now()}`,
      buyerId: state.buyerProfile.id,
      buyerName: state.buyerProfile.companyName,
      buyerType: state.buyerProfile.type,
      crop: input.crop,
      grade: input.minGrade,
      requiredQtyKgPerWeek: input.quantityKg,
      location: input.preferredLocation,
      deliveryWindow: `Required by ${input.requiredDeliveryDate}`,
      requiredDeliveryDate: input.requiredDeliveryDate,
      maxPricePerKg: input.maxPricePerKg,
      additionalNotes: input.additionalNotes,
      indicativePriceRange: `Up to ₹${input.maxPricePerKg}/kg (Buyer Cap)`,
      status: 'Active',
      createdAt: 'Just now',
      contributions: autoContribs,
    };

    const matchedKg = autoContribs.reduce((s, c) => s + c.quantityKg, 0);

    setState((prev) => ({
      ...prev,
      requirements: [newReq, ...prev.requirements],
      notifications: [
        {
          id: `notif-req-${Date.now()}`,
          type: 'buyer',
          title: `New Buyer Requirement: ${input.quantityKg} kg Grade-${input.minGrade} ${input.crop}`,
          body: `${state.buyerProfile.companyName} needs supply in ${input.preferredLocation}.`,
          timestamp: 'Just now',
          read: false,
          actionRoute: '/marketplace',
          targetRole: 'farmer',
        },
        ...prev.notifications,
      ],
    }));

    pushToast({
      title: t('toasts.requirementPublished', {
        qty: input.quantityKg,
        crop: translateCrop(state.language, input.crop),
      }),
      description: `${t('buyer.matchingSupplyLabel', { qty: matchedKg })}`,
      variant: 'success',
    });

    return newReq;
  };

  const sendBuyerInquiryToFarmer: KisanSetuContextValue['sendBuyerInquiryToFarmer'] = (input) => {
    const newInq: BuyerInquiry = {
      id: `inq-${Date.now()}`,
      listingId: input.listingId,
      requirementId: input.requirementId,
      farmerId: input.farmerId,
      farmerName: input.farmerName,
      buyerId: state.buyerProfile.id,
      buyerName: state.buyerProfile.companyName,
      buyerType: state.buyerProfile.type,
      crop: input.crop,
      grade: input.grade,
      offeredPricePerKg: input.offeredPricePerKg,
      requestedQtyKg: input.requestedQtyKg,
      message: input.message,
      createdAt: 'Just now',
      status: 'New',
    };

    setState((prev) => ({
      ...prev,
      inquiries: [newInq, ...prev.inquiries],
      listings: prev.listings.map((l) =>
        l.id === input.listingId ? { ...l, inquiriesCount: l.inquiriesCount + 1 } : l
      ),
      notifications: [
        {
          id: `notif-inq-${Date.now()}`,
          type: 'buyer',
          title: `New Purchase Inquiry from ${state.buyerProfile.companyName}`,
          body: `${input.requestedQtyKg} kg ${input.crop} (Grade ${input.grade}) @ ₹${input.offeredPricePerKg}/kg.`,
          timestamp: 'Just now',
          read: false,
          actionRoute: '/marketplace',
          targetRole: 'farmer',
        },
        ...prev.notifications,
      ],
    }));

    pushToast({
      title: t('toasts.inquirySent', { farmer: input.farmerName }),
      description: `${input.requestedQtyKg} ${t('common.kg')} ${translateCrop(state.language, input.crop)} @ ₹${input.offeredPricePerKg}${t('common.perKg')}`,
      variant: 'success',
    });
  };

  const updateInquiryStatus = (inquiryId: string, status: BuyerInquiry['status']): Order | null => {
    const target = state.inquiries.find((i) => i.id === inquiryId);
    if (!target) return null;

    let createdOrder: Order | null = null;
    if (status === 'Accepted') {
      const orderNum = `KS${Math.floor(1027 + Math.random() * 8900)}`;
      const listing = state.listings.find((l) => l.id === target.listingId);
      createdOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: orderNum,
        listingId: target.listingId,
        requirementId: target.requirementId,
        inquiryId: target.id,
        farmerId: target.farmerId || listing?.farmerId || state.profile.id,
        farmerName: target.farmerName || listing?.farmerName || state.profile.name,
        farmerLocation: listing?.location || `${state.profile.village}, ${state.profile.district}`,
        buyerId: target.buyerId,
        buyerName: target.buyerName,
        buyerLocation: state.buyerProfile.location,
        crop: target.crop,
        grade: target.grade || 'A',
        quantityKg: target.requestedQtyKg,
        pricePerKg: target.offeredPricePerKg,
        totalEstimatedValueInr: target.requestedQtyKg * target.offeredPricePerKg,
        status: 'Order Created',
        createdAt: 'Just now',
        updatedAt: 'Just now',
      };
    }

    setState((prev) => ({
      ...prev,
      inquiries: prev.inquiries.map((inq) => (inq.id === inquiryId ? { ...inq, status } : inq)),
      orders: createdOrder ? [createdOrder, ...prev.orders] : prev.orders,
      history: createdOrder
        ? [
            {
              id: `hist-ord-${Date.now()}`,
              crop: createdOrder.crop,
              stageType: 'order',
              title: `Order #${createdOrder.orderNumber} Created (${createdOrder.quantityKg} kg ${createdOrder.crop})`,
              detail: `Accepted offer from ${createdOrder.buyerName} at ₹${createdOrder.pricePerKg}/kg.`,
              date: 'Today',
              verifiedTag: 'Verified Buyer',
            },
            ...prev.history,
          ]
        : prev.history,
      notifications: createdOrder
        ? [
            {
              id: `notif-ord-${Date.now()}`,
              type: 'order',
              title: `Order #${createdOrder.orderNumber} Created`,
              body: `${createdOrder.farmerName} accepted ${createdOrder.quantityKg} kg ${createdOrder.crop}. Ready to request transport.`,
              timestamp: 'Just now',
              read: false,
              actionRoute: '/orders',
              targetRole: 'all',
            },
            ...prev.notifications,
          ]
        : prev.notifications,
    }));

    pushToast({
      title: createdOrder
        ? t('toasts.inquiryAccepted', { orderNum: createdOrder.orderNumber })
        : t('toasts.inquiryDeclined'),
      variant: createdOrder ? 'success' : 'info',
    });

    return createdOrder;
  };

  const createOrderFromListing = (
    listing: CropListing,
    quantityKg: number,
    pricePerKg: number
  ): Order => {
    const orderNum = `KS${Math.floor(1027 + Math.random() * 8900)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      listingId: listing.id,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      farmerLocation: listing.location,
      buyerId: state.buyerProfile.id,
      buyerName: state.buyerProfile.companyName,
      buyerLocation: state.buyerProfile.location,
      crop: listing.crop,
      grade: listing.grade,
      quantityKg,
      pricePerKg,
      totalEstimatedValueInr: quantityKg * pricePerKg,
      status: 'Order Created',
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };

    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      notifications: [
        {
          id: `notif-ord-dir-${Date.now()}`,
          type: 'order',
          title: `New Order #${orderNum} from ${state.buyerProfile.companyName}`,
          body: `${quantityKg} kg Grade-${listing.grade} ${listing.crop} @ ₹${pricePerKg}/kg.`,
          timestamp: 'Just now',
          read: false,
          actionRoute: '/orders',
          targetRole: 'all',
        },
        ...prev.notifications,
      ],
    }));

    pushToast({
      title: t('toasts.orderCreated', { orderNum }),
      description: `${quantityKg} ${t('common.kg')} ${translateCrop(state.language, listing.crop)} · ${listing.farmerName}`,
      variant: 'success',
    });

    return newOrder;
  };

  const sendInquiryReply = (buyerId: string, listingId: string, message: string) => {
    const targetListing = state.listings.find((l) => l.id === listingId);
    const newNotif: NotificationItem = {
      id: `notif-reply-${Date.now()}`,
      type: 'buyer',
      title: 'Direct Offer Sent to Buyer',
      body: `Sent message regarding ${targetListing?.crop || 'crop'} lot: "${message.slice(0, 60)}"`,
      timestamp: 'Just now',
      read: false,
      actionRoute: '/marketplace',
      targetRole: 'farmer',
    };

    setState((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
      history: [
        {
          id: `hist-inq-${Date.now()}`,
          crop: targetListing?.crop || 'Crop',
          stageType: 'inquiry',
          title: `Direct Outreach Sent to Buyer #${buyerId.slice(-2)}`,
          detail: message,
          date: 'Today',
          verifiedTag: 'Verified Buyer',
        },
        ...prev.history,
      ],
    }));
    pushToast({
      title: t('toasts.replySent'),
      variant: 'success',
    });
  };

  const requestTransportForOrder: KisanSetuContextValue['requestTransportForOrder'] = (input) => {
    const linkedOrder = state.orders.find((o) => o.id === input.orderId);
    const estimate = marketplaceService.estimateDemoTransport(
      input.pickupLocation,
      input.destination,
      input.quantityKg,
      input.vehicleType
    );

    const orderNum = linkedOrder?.orderNumber || `KS${Math.floor(1030 + Math.random() * 8900)}`;
    const newReq: TransportRequest = {
      id: `tr-${Date.now()}`,
      orderId: linkedOrder?.id || `ord-ad-${Date.now()}`,
      orderNumber: orderNum,
      requestedByRole: state.activeRole,
      farmerName: linkedOrder?.farmerName || state.profile.name,
      buyerName: linkedOrder?.buyerName || state.buyerProfile.companyName,
      crop: input.crop,
      quantityKg: input.quantityKg,
      pickupLocation: input.pickupLocation,
      destination: input.destination,
      preferredPickupDate: input.preferredPickupDate,
      vehicleType: input.vehicleType,
      specialHandling: input.specialHandling || 'Standard farm produce handling',
      estimatedDistanceKm: estimate.estimatedDistanceKm,
      estimatedCostRange: estimate.estimatedCostRange,
      currentSimulatedLocation: `${input.pickupLocation} (Awaiting Provider)`,
      status: 'Requested',
      createdAt: 'Just now',
      isDemoEstimate: true,
      timeline: [
        { step: 'Transport Requested', timestamp: 'Just now', completed: true },
        { step: 'Driver Assigned', timestamp: 'Pending', completed: false },
        { step: 'Pickup Completed', timestamp: 'Pending', completed: false },
        { step: 'In Transit', timestamp: 'Pending', completed: false },
        { step: 'Delivered', timestamp: 'Pending', completed: false },
      ],
    };

    setState((prev) => ({
      ...prev,
      transportRequests: [newReq, ...prev.transportRequests],
      orders: linkedOrder
        ? prev.orders.map((o) =>
            o.id === linkedOrder.id
              ? { ...o, status: 'Transport Requested', transportRequestId: newReq.id, updatedAt: 'Just now' }
              : o
          )
        : prev.orders,
      history: [
        {
          id: `hist-tr-${Date.now()}`,
          crop: input.crop,
          stageType: 'transport',
          title: `Transport Requested for #${orderNum} (${input.vehicleType})`,
          detail: `${input.pickupLocation} → ${input.destination} · Est. ${estimate.estimatedDistanceKm} km (${estimate.estimatedCostRange} prototype estimate).`,
          date: 'Today',
        },
        ...prev.history,
      ],
      notifications: [
        {
          id: `notif-tr-${Date.now()}`,
          type: 'transport',
          title: `Transport Requested: Order #${orderNum}`,
          body: `${input.quantityKg} kg ${input.crop} · ${input.pickupLocation} → ${input.destination}`,
          timestamp: 'Just now',
          read: false,
          actionRoute: '/transport/provider',
          targetRole: 'transport',
        },
        ...prev.notifications,
      ],
    }));

    pushToast({
      title: t('toasts.transportRequested', { orderNum }),
      description: `${estimate.estimatedDistanceKm} km · ${estimate.estimatedCostRange}`,
      variant: 'success',
    });

    return newReq;
  };

  const advanceTransportStage = (transportId: string, nextStatus: TransportStatus) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setState((prev) => {
      const target = prev.transportRequests.find((t) => t.id === transportId);
      if (!target) return prev;

      const simulatedLoc =
        nextStatus === 'Driver Assigned'
          ? `Assigned: ${prev.transportProfile.companyName} (${prev.transportProfile.vehicleNumber})`
          : nextStatus === 'Pickup Scheduled'
          ? `En route to pickup: ${target.pickupLocation}`
          : nextStatus === 'Pickup Completed'
          ? `Loaded at ${target.pickupLocation}`
          : nextStatus === 'In Transit'
          ? `Highway Transit Corridor (~55% to ${target.destination}) [Simulated]`
          : `Delivered at ${target.destination}`;

      const updatedTimeline = target.timeline.map((step) => {
        if (nextStatus === 'Driver Assigned' && step.step === 'Driver Assigned') {
          return { ...step, completed: true, timestamp: `Today, ${nowTime}` };
        }
        if (nextStatus === 'Pickup Scheduled' && (step.step === 'Driver Assigned' || step.step === 'Pickup Scheduled')) {
          return { ...step, completed: true, timestamp: step.completed ? step.timestamp : `Today, ${nowTime}` };
        }
        if (
          nextStatus === 'Pickup Completed' &&
          ['Transport Requested', 'Driver Assigned', 'Pickup Scheduled', 'Pickup Completed'].includes(step.step)
        ) {
          return { ...step, completed: true, timestamp: step.completed ? step.timestamp : `Today, ${nowTime}` };
        }
        if (
          nextStatus === 'In Transit' &&
          ['Transport Requested', 'Driver Assigned', 'Pickup Scheduled', 'Pickup Completed', 'In Transit'].includes(step.step)
        ) {
          return { ...step, completed: true, timestamp: step.completed ? step.timestamp : `Today, ${nowTime}` };
        }
        if (nextStatus === 'Delivered') {
          return { ...step, completed: true, timestamp: step.completed ? step.timestamp : `Today, ${nowTime}` };
        }
        return step;
      });

      const orderStatusMap: Record<TransportStatus, Order['status']> = {
        Requested: 'Transport Requested',
        'Driver Assigned': 'Pickup Scheduled',
        'Pickup Scheduled': 'Pickup Scheduled',
        'Pickup Completed': 'Pickup Completed',
        'In Transit': 'In Transit',
        Delivered: 'Delivered',
      };

      const nextOrderStatus = orderStatusMap[nextStatus];

      return {
        ...prev,
        transportRequests: prev.transportRequests.map((tr) =>
          tr.id === transportId
            ? {
                ...tr,
                status: nextStatus,
                providerName: prev.transportProfile.companyName,
                driverName: prev.transportProfile.driverName,
                driverPhone: prev.transportProfile.phone,
                currentSimulatedLocation: simulatedLoc,
                timeline: updatedTimeline,
              }
            : tr
        ),
        orders: prev.orders.map((ord) =>
          ord.id === target.orderId || ord.orderNumber === target.orderNumber
            ? { ...ord, status: nextOrderStatus, updatedAt: `Today, ${nowTime}` }
            : ord
        ),
        notifications: [
          {
            id: `notif-tr-upd-${Date.now()}`,
            type: 'transport',
            title: `Order #${target.orderNumber}: ${nextStatus}`,
            body: simulatedLoc,
            timestamp: 'Just now',
            read: false,
            actionRoute: '/transport',
            targetRole: 'all',
          },
          ...prev.notifications,
        ],
      };
    });

    pushToast({
      title: t('toasts.transportUpdated', {
        id: transportId.replace('tr-', ''),
        status: translateStatus(state.language, nextStatus),
      }),
      variant: 'success',
    });
  };

  const markOrderCompleted = (orderId: string) => {
    const target = state.orders.find((o) => o.id === orderId);
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'Completed', updatedAt: 'Just now' } : o
      ),
    }));
    pushToast({
      title: t('toasts.orderUpdated', {
        orderNum: target?.orderNumber || orderId,
        status: translateStatus(state.language, 'Completed'),
      }),
      variant: 'success',
    });
  };

  const commitSupplyContribution = (requirementId: string, quantityKg: number) => {
    setState((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req) => {
        if (req.id !== requirementId) return req;
        const exists = req.contributions.some((c) => c.farmerId === prev.profile.id);
        const nextContribs = exists
          ? req.contributions.map((c) =>
              c.farmerId === prev.profile.id ? { ...c, quantityKg: c.quantityKg + quantityKg } : c
            )
          : [
              ...req.contributions,
              {
                farmerId: prev.profile.id,
                farmerLabel: `${prev.profile.name} (Your Farm)`,
                village: prev.profile.village,
                quantityKg,
                grade: req.grade,
                harvestWindow: 'Ready This Week',
                verifiedFarmer: prev.profile.verifiedFarmer,
              },
            ];
        return { ...req, contributions: nextContribs };
      }),
    }));
    pushToast({
      title: t('toasts.supplyCommitted'),
      description: `${quantityKg} ${t('common.kg')}`,
      variant: 'success',
    });
  };

  const addHistoryEvent = (event: Omit<FarmHistoryEvent, 'id'>) => {
    setState((prev) => ({
      ...prev,
      history: [{ ...event, id: `hist-${Date.now()}` }, ...prev.history],
    }));
    pushToast({
      title: t('toasts.historyAdded'),
      description: event.title,
      variant: 'success',
    });
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const addChatMessages = (
    messages: KisanSetuState['chatMessages'],
    interactionId?: string,
    logEntry?: Omit<AssistantLogEntry, 'id' | 'timestamp'>
  ) => {
    setState((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, ...messages],
      lastInteractionId: interactionId ?? prev.lastInteractionId,
      assistantLogs: logEntry
        ? [
            {
              ...logEntry,
              id: `alog-${Date.now()}`,
              timestamp: 'Just now',
            },
            ...prev.assistantLogs,
          ]
        : prev.assistantLogs,
    }));
  };

  const clearChatMessages = () => {
    setState((prev) => ({
      ...prev,
      lastInteractionId: undefined,
      chatMessages: [
        {
          id: `chat-reset-${Date.now()}`,
          role: 'assistant',
          text: translate(prev.language, 'assistant.clearedMessage', {
            lang: LANGUAGE_LABELS[prev.language],
          }),
          timestamp: 'Just now',
          language: prev.language,
          sourceLabel: 'KisanSetu Assistant',
        },
      ],
    }));
    pushToast({ title: t('assistant.clearChat'), variant: 'info' });
  };

  const updateBuyerProfile = (patch: Partial<BuyerProfile>) => {
    setState((prev) => ({
      ...prev,
      buyerProfile: { ...prev.buyerProfile, ...patch },
    }));
    pushToast({ title: t('toasts.buyerProfileUpdated'), variant: 'success' });
  };

  const toggleAdminVerification = (recordId: string) => {
    setState((prev) => ({
      ...prev,
      adminRecords: prev.adminRecords.map((r) => {
        if (r.id !== recordId) return r;
        const nextStatus = r.status === 'Verified' ? 'Pending Review' : 'Verified';
        return { ...r, status: nextStatus, updatedAt: 'Updated just now' };
      }),
    }));
    pushToast({ title: t('toasts.verificationUpdated'), variant: 'info' });
  };

  const updateAdminFarmerStatus = (farmerId: string, status: AdminFarmerAccount['status']) => {
    const target = state.adminFarmers.find((f) => f.id === farmerId);
    setState((prev) => ({
      ...prev,
      adminFarmers: prev.adminFarmers.map((f) => (f.id === farmerId ? { ...f, status } : f)),
    }));
    pushToast({
      title:
        status === 'Verified'
          ? t('toasts.accountVerified', { name: target?.name || farmerId })
          : t('toasts.accountSuspended', { name: target?.name || farmerId }),
      variant: 'info',
    });
  };

  const updateAdminBuyerStatus = (buyerId: string, status: AdminBuyerAccount['status']) => {
    const target = state.adminBuyers.find((b) => b.id === buyerId);
    setState((prev) => ({
      ...prev,
      adminBuyers: prev.adminBuyers.map((b) => (b.id === buyerId ? { ...b, status } : b)),
    }));
    pushToast({
      title:
        status === 'Verified'
          ? t('toasts.accountVerified', { name: target?.companyName || buyerId })
          : t('toasts.accountSuspended', { name: target?.companyName || buyerId }),
      variant: 'info',
    });
  };

  const moderateListing = (listingId: string, status: ListingModerationStatus) => {
    setState((prev) => ({
      ...prev,
      listings: prev.listings.map((l) =>
        l.id === listingId ? { ...l, moderationStatus: status, available: status === 'Approved' } : l
      ),
    }));
    pushToast({
      title: t('toasts.listingModerated', { status: translateStatus(state.language, status) }),
      variant: 'info',
    });
  };

  const updateScanReviewStatus = (
    scanId: string,
    status: NonNullable<CropScan['reviewStatus']>
  ) => {
    setState((prev) => ({
      ...prev,
      scans: prev.scans.map((s) => (s.id === scanId ? { ...s, reviewStatus: status } : s)),
    }));
    pushToast({
      title: status === 'Flagged for Review' ? t('toasts.scanFlagged') : translateStatus(state.language, status),
      variant: 'info',
    });
  };

  const saveGuidanceArticle: KisanSetuContextValue['saveGuidanceArticle'] = (article) => {
    setState((prev) => {
      if (article.id) {
        return {
          ...prev,
          guidanceArticles: prev.guidanceArticles.map((g) =>
            g.id === article.id ? { ...g, ...article, id: article.id!, updatedAt: 'Updated today' } : g
          ),
        };
      }
      const created: AgriculturalGuidanceArticle = {
        ...article,
        id: `guid-${Date.now()}`,
        updatedAt: 'Added today',
      };
      return {
        ...prev,
        guidanceArticles: [created, ...prev.guidanceArticles],
      };
    });
    pushToast({ title: t('toasts.guidanceAdded'), variant: 'success' });
  };

  const deleteGuidanceArticle = (id: string) => {
    setState((prev) => ({
      ...prev,
      guidanceArticles: prev.guidanceArticles.filter((g) => g.id !== id),
    }));
    pushToast({ title: t('common.delete'), variant: 'info' });
  };

  const resetDemoWorkspace = () => {
    setState((prev) => {
      const fresh = getInitialDemoState(prev.language, prev.activeRole);
      return {
        ...fresh,
        hasSeenIntro: true,
        isAuthenticated: prev.isAuthenticated,
        needsOnboarding: false,
        user: prev.user,
      };
    });
    pushToast({
      title: t('toasts.demoReset'),
      variant: 'info',
    });
  };

  return (
    <KisanSetuContext.Provider
      value={{
        state,
        language: state.language,
        t,
        toasts,
        pushToast,
        dismissToast,
        completeIntro,
        replayIntro,
        setLanguage,
        loginAsDemoFarmer,
        loginAsDemoRole,
        loginWithCredentials,
        startOnboardingSignup,
        completeOnboarding,
        finishRoleOnboarding,
        logout,
        addCropScan,
        addCropListing,
        addBuyerRequirement,
        sendBuyerInquiryToFarmer,
        updateInquiryStatus,
        sendInquiryReply,
        createOrderFromListing,
        requestTransportForOrder,
        advanceTransportStage,
        markOrderCompleted,
        commitSupplyContribution,
        addHistoryEvent,
        markNotificationRead,
        markAllNotificationsRead,
        addChatMessages,
        clearChatMessages,
        updateBuyerProfile,
        toggleAdminVerification,
        updateAdminFarmerStatus,
        updateAdminBuyerStatus,
        moderateListing,
        updateScanReviewStatus,
        saveGuidanceArticle,
        deleteGuidanceArticle,
        resetDemoWorkspace,
      }}
    >
      {children}
    </KisanSetuContext.Provider>
  );
};

export function useKisanSetu() {
  const ctx = useContext(KisanSetuContext);
  if (!ctx) throw new Error('useKisanSetu must be used inside KisanSetuProvider');
  return ctx;
}

export function useTranslation() {
  const { state, language, setLanguage, t } = useKisanSetu();
  return { state, language, setLanguage, t };
}
