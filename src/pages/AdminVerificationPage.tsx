import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  Camera,
  CheckCircle2,
  Download,
  Eye,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { ADMIN_PLATFORM_METRICS } from '../services/mockData';
import { marketplaceService } from '../services/marketplaceService';
import { SvgTrendChart } from '../components/SvgTrendChart';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import {
  AdminFarmerAccount,
  AgriculturalGuidanceArticle,
  GuidanceCategory,
} from '../types/kisansetu';
import { translateCrop, translateStatus, translateVehicle } from '../i18n';

type AdminTab =
  | 'overview'
  | 'farmers'
  | 'buyers'
  | 'listings'
  | 'requirements'
  | 'orders'
  | 'transport'
  | 'scans'
  | 'ai-logs'
  | 'guidance'
  | 'reports'
  | 'settings';

const GUIDANCE_CATEGORIES: GuidanceCategory[] = [
  'Crop disease',
  'Pest',
  'Prevention',
  'Treatment',
  'Fertilizer guidance',
  'Irrigation',
  'Harvesting',
];

export const AdminVerificationPage: React.FC = () => {
  const {
    state,
    t,
    updateAdminFarmerStatus,
    updateAdminBuyerStatus,
    moderateListing,
    updateScanReviewStatus,
    saveGuidanceArticle,
    deleteGuidanceArticle,
    resetDemoWorkspace,
    pushToast,
  } = useKisanSetu();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const adminTabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'overview', label: t('admin.tabOverview') },
    { id: 'farmers', label: t('admin.tabFarmers') },
    { id: 'buyers', label: t('admin.tabBuyers') },
    { id: 'listings', label: t('admin.tabListings') },
    { id: 'requirements', label: t('admin.tabRequirements') },
    { id: 'orders', label: t('admin.tabOrders') },
    { id: 'transport', label: t('admin.tabTransport') },
    { id: 'scans', label: t('admin.tabAiScans') },
    { id: 'ai-logs', label: t('admin.tabAssistantLogs') },
    { id: 'guidance', label: t('admin.tabGuidance') },
    { id: 'reports', label: t('admin.tabReports') },
    { id: 'settings', label: t('admin.tabSettings') },
  ];

  const tabParam = (searchParams.get('tab') as AdminTab) || 'overview';
  const activeTab: AdminTab = adminTabs.some((tab) => tab.id === tabParam) ? tabParam : 'overview';

  const setActiveTab = (tab: AdminTab) => {
    if (tab === 'overview') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const [chartMetric, setChartMetric] = useState<'farmers' | 'listings' | 'orders' | 'transport'>(
    'orders'
  );

  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerStatusFilter, setFarmerStatusFilter] = useState<
    'ALL' | 'Verified' | 'Pending' | 'Suspended'
  >('ALL');
  const [inspectFarmer, setInspectFarmer] = useState<AdminFarmerAccount | null>(null);

  const [editingArticle, setEditingArticle] = useState<Partial<AgriculturalGuidanceArticle> | null>(
    null
  );
  const [gTitle, setGTitle] = useState('');
  const [gCategory, setGCategory] = useState<GuidanceCategory>('Crop disease');
  const [gCrop, setGCrop] = useState('Tomato');
  const [gSummary, setGSummary] = useState('');
  const [gStepsText, setGStepsText] = useState('');
  const [gCaution, setGCaution] = useState('');
  const [gAuthority, setGAuthority] = useState('KVK Anand Agronomy Reference');

  const [requireFarmerKyc, setRequireFarmerKyc] = useState(true);
  const [requireSafetyBanner, setRequireSafetyBanner] = useState(true);
  const [autoFlagLowConfidence, setAutoFlagLowConfidence] = useState(true);

  const openGuidanceEditor = (article?: AgriculturalGuidanceArticle) => {
    if (article) {
      setEditingArticle(article);
      setGTitle(article.title);
      setGCategory(article.category);
      setGCrop(article.crop);
      setGSummary(article.summary);
      setGStepsText(article.verifiedSteps.join('\n'));
      setGCaution(article.cautionNote);
      setGAuthority(article.sourceAuthority);
    } else {
      setEditingArticle({});
      setGTitle('');
      setGCategory('Crop disease');
      setGCrop('Tomato');
      setGSummary('');
      setGStepsText('');
      setGCaution(t('cropScan.safetyBanner'));
      setGAuthority('KVK / State Agricultural University Reference');
    }
  };

  const handleSaveGuidance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gTitle.trim() || !gSummary.trim()) return;
    saveGuidanceArticle({
      id: editingArticle?.id,
      title: gTitle.trim(),
      category: gCategory,
      crop: gCrop.trim() || 'General',
      summary: gSummary.trim(),
      verifiedSteps: gStepsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      cautionNote: gCaution.trim(),
      sourceAuthority: gAuthority.trim(),
    });
    setEditingArticle(null);
  };

  const handleExportDemoReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      note: 'KisanSetu Prototype Platform Snapshot',
      metrics: ADMIN_PLATFORM_METRICS,
      liveWorkspaceCounts: {
        farmers: state.adminFarmers.length,
        buyers: state.adminBuyers.length,
        listings: state.listings.length,
        requirements: state.requirements.length,
        orders: state.orders.length,
        transportRequests: state.transportRequests.length,
        scans: state.scans.length,
        guidanceArticles: state.guidanceArticles.length,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kisansetu-platform-report.json';
    a.click();
    URL.revokeObjectURL(url);
    pushToast({ title: t('admin.reportToast'), variant: 'success' });
  };

  const filteredFarmers = state.adminFarmers.filter((f) => {
    const matchesStatus = farmerStatusFilter === 'ALL' || f.status === farmerStatusFilter;
    const q = farmerSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.village.toLowerCase().includes(q) ||
      f.district.toLowerCase().includes(q) ||
      f.crops.some((c) => c.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  const requirementMatches = marketplaceService.computeSupplyMatches(state.requirements);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#216B43]">{t('nav.adminConsole')}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-0.5">
            {t('admin.title')}
          </h1>
          <p className="text-sm text-[#546358] mt-1">{t('admin.subtitle')}</p>
        </div>
      </div>

      {/* Horizontal Sub-Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E5E2DA]">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'bg-[#143A28] text-white'
                : 'bg-white border border-[#E5E2DA] text-[#3D4E42] hover:bg-[#F3F1EC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
            {[
              {
                label: t('admin.kpiFarmers'),
                val: ADMIN_PLATFORM_METRICS.totalFarmers.toLocaleString(),
                icon: Users,
                color: 'text-[#143A28]',
              },
              {
                label: t('admin.kpiVerifiedFarmers'),
                val: ADMIN_PLATFORM_METRICS.verifiedFarmers.toLocaleString(),
                icon: CheckCircle2,
                color: 'text-[#216B43]',
              },
              {
                label: t('admin.kpiBuyers'),
                val: ADMIN_PLATFORM_METRICS.buyers.toLocaleString(),
                icon: Building2,
                color: 'text-[#143A28]',
              },
              {
                label: t('admin.kpiListings'),
                val: String(ADMIN_PLATFORM_METRICS.activeCropListings),
                icon: ShoppingBag,
                color: 'text-[#216B43]',
              },
              {
                label: t('admin.kpiOrders'),
                val: String(ADMIN_PLATFORM_METRICS.activeOrders),
                icon: PackageCheck,
                color: 'text-[#B8860B]',
              },
              {
                label: t('admin.kpiTransport'),
                val: String(ADMIN_PLATFORM_METRICS.transportDeliveries),
                icon: Truck,
                color: 'text-[#143A28]',
              },
              {
                label: t('admin.kpiScans'),
                val: ADMIN_PLATFORM_METRICS.aiCropScans.toLocaleString(),
                icon: Camera,
                color: 'text-[#216B43]',
              },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white border border-[#E5E2DA] rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs text-[#546358] gap-1">
                    <span className="truncate">{kpi.label}</span>
                    <Icon className="w-3.5 h-3.5 text-[#5E6D63] shrink-0" />
                  </div>
                  <p className={`font-display text-2xl font-semibold mt-1.5 tabular-nums ${kpi.color}`}>
                    {kpi.val}
                  </p>
                  <p className="text-[11px] text-[#6A786E] mt-0.5">{t('admin.benchmarkTag')}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-[#17231B]">
                    {t('admin.growthChartTitle')}
                  </h2>
                  <p className="text-xs text-[#546358]">{t('admin.chartSubtitle')}</p>
                </div>
                <div className="inline-flex p-1 bg-[#ECEAE3] rounded-lg">
                  {(
                    [
                      { id: 'orders', label: t('admin.tabOrders') },
                      { id: 'listings', label: t('admin.tabListings') },
                      { id: 'transport', label: t('admin.tabTransport') },
                      { id: 'farmers', label: t('admin.tabFarmers') },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setChartMetric(m.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        chartMetric === m.id
                          ? 'bg-white text-[#143A28] shadow-xs'
                          : 'text-[#546358]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <SvgTrendChart
                data={ADMIN_PLATFORM_METRICS.monthlyGrowthSeries.map((pt) => ({
                  label: pt.label,
                  value: pt[chartMetric],
                }))}
                accentColor={chartMetric === 'transport' ? '#C48F29' : '#216B43'}
                height={190}
              />
            </div>

            <div className="lg:col-span-4 bg-white border border-[#E5E2DA] rounded-2xl p-5 space-y-4">
              <h2 className="font-display text-lg font-semibold text-[#17231B]">
                {t('admin.liveQueuesTitle')}
              </h2>
              <div className="space-y-3 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('farmers')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8F7F4] hover:bg-[#ECEAE3] cursor-pointer text-left"
                >
                  <span className="text-[#3D4E42]">{t('admin.queuePendingFarmers')}</span>
                  <span className="font-mono font-bold text-[#B8860B]">
                    {state.adminFarmers.filter((f) => f.status === 'Pending').length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('buyers')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8F7F4] hover:bg-[#ECEAE3] cursor-pointer text-left"
                >
                  <span className="text-[#3D4E42]">{t('admin.queuePendingBuyers')}</span>
                  <span className="font-mono font-bold text-[#B8860B]">
                    {state.adminBuyers.filter((b) => b.status === 'Pending').length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('listings')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8F7F4] hover:bg-[#ECEAE3] cursor-pointer text-left"
                >
                  <span className="text-[#3D4E42]">{t('admin.queuePendingListings')}</span>
                  <span className="font-mono font-bold text-[#143A28]">
                    {state.listings.filter((l) => l.moderationStatus === 'Pending').length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('scans')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8F7F4] hover:bg-[#ECEAE3] cursor-pointer text-left"
                >
                  <span className="text-[#3D4E42]">{t('admin.queueFlaggedScans')}</span>
                  <span className="font-mono font-bold text-[#B91C1C]">
                    {state.scans.filter((s) => s.disease.detected).length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FARMERS */}
      {activeTab === 'farmers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#6A786E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={farmerSearch}
                onChange={(e) => setFarmerSearch(e.target.value)}
                placeholder={t('admin.searchFarmerPlaceholder')}
                className="w-full min-h-[42px] pl-10 pr-4 rounded-xl border border-[#D8D4CA] bg-white text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(['ALL', 'Verified', 'Pending', 'Suspended'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFarmerStatusFilter(st)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                    farmerStatusFilter === st
                      ? 'bg-[#143A28] text-white'
                      : 'bg-white border border-[#D8D4CA] text-[#3D4E42]'
                  }`}
                >
                  {st === 'ALL' ? t('common.all') : translateStatus(state.language, st)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F4] border-b border-[#ECEAE3] text-xs font-semibold text-[#546358]">
                    <th className="py-3 px-5">{t('admin.colFarmerVillage')}</th>
                    <th className="py-3 px-4">{t('admin.colLandSoil')}</th>
                    <th className="py-3 px-4">{t('admin.colCrops')}</th>
                    <th className="py-3 px-4">{t('common.status')}</th>
                    <th className="py-3 px-5 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEAE3] text-sm">
                  {filteredFarmers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-[#546358]">
                        {t('admin.noRecords')}
                      </td>
                    </tr>
                  ) : (
                    filteredFarmers.map((f) => (
                      <tr key={f.id} className="hover:bg-[#F8F7F4]">
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-[#17231B]">{f.name}</p>
                          <p className="text-xs text-[#546358]">
                            {f.village}, {f.district} ({f.state}) ·{' '}
                            <span className="font-mono">{f.phone}</span>
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#3D4E42]">
                          <p className="font-mono font-semibold">
                            {f.landSizeAcres} {t('common.acres')}
                          </p>
                          <p className="text-[#5E6D63]">{f.soilType}</p>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-[#143A28]">
                          {f.crops.map((c) => translateCrop(state.language, c)).join(', ')}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold">
                          <span
                            className={
                              f.status === 'Verified'
                                ? 'text-[#216B43]'
                                : f.status === 'Pending'
                                ? 'text-[#B8860B]'
                                : 'text-[#B91C1C]'
                            }
                          >
                            {translateStatus(state.language, f.status)}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectFarmer(f)}
                              className="px-2.5 py-1.5 rounded-lg border border-[#D8D4CA] text-xs font-semibold hover:bg-[#ECEAE3] cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> {t('admin.detailsBtn')}
                            </button>
                            {f.status !== 'Verified' && (
                              <button
                                type="button"
                                onClick={() => updateAdminFarmerStatus(f.id, 'Verified')}
                                className="px-2.5 py-1.5 rounded-lg bg-[#216B43] text-white text-xs font-semibold cursor-pointer"
                              >
                                {t('admin.verifyBtn')}
                              </button>
                            )}
                            {f.status !== 'Suspended' ? (
                              <button
                                type="button"
                                onClick={() => updateAdminFarmerStatus(f.id, 'Suspended')}
                                className="px-2.5 py-1.5 rounded-lg border border-[#FCA5A5] text-[#B91C1C] text-xs font-semibold cursor-pointer"
                              >
                                {t('admin.suspendBtn')}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => updateAdminFarmerStatus(f.id, 'Verified')}
                                className="px-2.5 py-1.5 rounded-lg bg-[#143A28] text-white text-xs font-semibold cursor-pointer"
                              >
                                {t('admin.restoreBtn')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. BUYERS */}
      {activeTab === 'buyers' && (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECEAE3] text-xs font-semibold text-[#546358]">
                  <th className="py-3 px-5">{t('admin.colCompany')}</th>
                  <th className="py-3 px-4">{t('admin.colTypeLoc')}</th>
                  <th className="py-3 px-4">{t('admin.colReqOrders')}</th>
                  <th className="py-3 px-4">{t('common.status')}</th>
                  <th className="py-3 px-5 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE3] text-sm">
                {state.adminBuyers.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F8F7F4]">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-[#17231B]">{b.companyName}</p>
                      <p className="text-xs text-[#5E6D63] font-mono">{b.joinedDate}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#3D4E42]">
                      <p className="font-semibold">{translateStatus(state.language, b.type)}</p>
                      <p>{b.location}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-[#143A28]">
                      {b.activeRequirementsCount} · {b.ordersCount}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold">
                      <span
                        className={
                          b.status === 'Verified'
                            ? 'text-[#216B43]'
                            : b.status === 'Pending'
                            ? 'text-[#B8860B]'
                            : 'text-[#B91C1C]'
                        }
                      >
                        {translateStatus(state.language, b.status)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex gap-1.5">
                        {b.status !== 'Verified' && (
                          <button
                            type="button"
                            onClick={() => updateAdminBuyerStatus(b.id, 'Verified')}
                            className="px-3 py-1.5 rounded-lg bg-[#216B43] text-white text-xs font-semibold cursor-pointer"
                          >
                            {t('admin.verifyBtn')}
                          </button>
                        )}
                        {b.status !== 'Suspended' ? (
                          <button
                            type="button"
                            onClick={() => updateAdminBuyerStatus(b.id, 'Suspended')}
                            className="px-3 py-1.5 rounded-lg border border-[#FCA5A5] text-[#B91C1C] text-xs font-semibold cursor-pointer"
                          >
                            {t('admin.suspendBtn')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateAdminBuyerStatus(b.id, 'Verified')}
                            className="px-3 py-1.5 rounded-lg bg-[#143A28] text-white text-xs font-semibold cursor-pointer"
                          >
                            {t('admin.restoreBtn')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CROP LISTINGS */}
      {activeTab === 'listings' && (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECEAE3] text-xs font-semibold text-[#546358]">
                  <th className="py-3 px-5">{t('common.farmer')}</th>
                  <th className="py-3 px-4">{t('admin.colCropQuality')}</th>
                  <th className="py-3 px-4">{t('admin.colQtyPrice')}</th>
                  <th className="py-3 px-4">{t('common.location')}</th>
                  <th className="py-3 px-4">{t('admin.colModeration')}</th>
                  <th className="py-3 px-5 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE3] text-sm">
                {state.listings.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F8F7F4]">
                    <td className="py-3.5 px-5 font-semibold text-[#17231B]">{l.farmerName}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-[#143A28]">
                        {translateCrop(state.language, l.crop)}
                      </span>{' '}
                      · {t('common.gradeLabel', { grade: l.grade })}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono tabular-nums">
                      {l.quantityKg} {t('common.kg')} @ ₹{l.expectedPricePerKg}
                      {t('common.perKg')}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#546358]">{l.location}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold">
                      <span
                        className={
                          l.moderationStatus === 'Approved'
                            ? 'text-[#216B43]'
                            : l.moderationStatus === 'Rejected'
                            ? 'text-[#B91C1C]'
                            : 'text-[#B8860B]'
                        }
                      >
                        {translateStatus(state.language, l.moderationStatus || 'Approved')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => moderateListing(l.id, 'Approved')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#216B43] text-white text-xs font-semibold cursor-pointer"
                        >
                          {t('admin.approveListingBtn')}
                        </button>
                        <button
                          type="button"
                          onClick={() => moderateListing(l.id, 'Flagged')}
                          className="px-2.5 py-1.5 rounded-lg border border-[#D8D4CA] text-xs font-semibold cursor-pointer"
                        >
                          {t('admin.flagScanBtn')}
                        </button>
                        <button
                          type="button"
                          onClick={() => moderateListing(l.id, 'Rejected')}
                          className="px-2.5 py-1.5 rounded-lg border border-[#FCA5A5] text-[#B91C1C] text-xs font-semibold cursor-pointer"
                        >
                          {t('admin.rejectListingBtn')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. BUYER REQUIREMENTS */}
      {activeTab === 'requirements' && (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECEAE3] text-xs font-semibold text-[#546358]">
                  <th className="py-3 px-5">{t('admin.colBuyer')}</th>
                  <th className="py-3 px-4">{t('admin.colRequirement')}</th>
                  <th className="py-3 px-4">{t('admin.colDeliveryLoc')}</th>
                  <th className="py-3 px-4">{t('admin.colSupplyMatch')}</th>
                  <th className="py-3 px-4">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE3] text-sm">
                {requirementMatches.map((m) => (
                  <tr key={m.requirement.id} className="hover:bg-[#F8F7F4]">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-[#17231B]">{m.requirement.buyerName}</p>
                      <p className="text-xs text-[#546358]">
                        {translateStatus(state.language, m.requirement.buyerType)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <p className="font-semibold text-[#143A28]">
                        {m.requirement.requiredQtyKgPerWeek.toLocaleString()} {t('common.kg')}{' '}
                        {translateCrop(state.language, m.requirement.crop)} (
                        {t('common.gradeLabel', { grade: m.requirement.grade })})
                      </p>
                      <p className="text-[#546358]">{m.requirement.indicativePriceRange}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#3D4E42]">
                      <p>{m.requirement.location}</p>
                      <p className="text-[#5E6D63]">{m.requirement.deliveryWindow}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono font-bold text-[#216B43]">
                      {m.matchingPercentage}% ({m.totalAvailableKg} {t('common.kg')})
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#216B43]">
                      {translateStatus(state.language, m.requirement.status || 'Active')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-4 py-2 rounded-lg bg-[#143A28] text-white text-xs font-semibold cursor-pointer"
            >
              {t('admin.openOrderTracker')}
            </button>
          </div>
          <div className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F4] border-b border-[#ECEAE3] text-xs font-semibold text-[#546358]">
                    <th className="py-3 px-5">{t('admin.colOrderNum')}</th>
                    <th className="py-3 px-4">{t('admin.colRoute')}</th>
                    <th className="py-3 px-4">{t('admin.colCropQty')}</th>
                    <th className="py-3 px-4">{t('admin.colEstValue')}</th>
                    <th className="py-3 px-4">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEAE3] text-sm">
                  {state.orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#F8F7F4]">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#143A28]">
                        #{o.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#3D4E42]">
                        {o.farmerName} → {o.buyerName}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        {o.quantityKg} {t('common.kg')} {translateCrop(state.language, o.crop)} (
                        {t('common.gradeLabel', { grade: o.grade })})
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono tabular-nums">
                        ₹{o.totalEstimatedValueInr.toLocaleString()} (@ ₹{o.pricePerKg}
                        {t('common.perKg')})
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#216B43]">
                        {translateStatus(state.language, o.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. TRANSPORT */}
      {activeTab === 'transport' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/transport')}
              className="px-4 py-2 rounded-lg bg-[#143A28] text-white text-xs font-semibold cursor-pointer"
            >
              {t('admin.openTransportTracker')}
            </button>
          </div>
          <div className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F4] border-b border-[#ECEAE3] text-xs font-semibold text-[#546358]">
                    <th className="py-3 px-5">{t('admin.colOrderNum')}</th>
                    <th className="py-3 px-4">{t('admin.colRoute')}</th>
                    <th className="py-3 px-4">{t('admin.colVehicleFreight')}</th>
                    <th className="py-3 px-4">{t('admin.colSimLocation')}</th>
                    <th className="py-3 px-4">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEAE3] text-sm">
                  {state.transportRequests.map((tr) => (
                    <tr key={tr.id} className="hover:bg-[#F8F7F4]">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#143A28]">
                        #{tr.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#3D4E42]">
                        {tr.pickupLocation} → {tr.destination}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        {translateVehicle(state.language, tr.vehicleType)} ·{' '}
                        {tr.estimatedCostRange}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#546358]">
                        {tr.currentSimulatedLocation}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#216B43]">
                        {translateStatus(state.language, tr.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. CROP SCANS */}
      {activeTab === 'scans' && (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECEAE3] text-xs font-semibold text-[#546358]">
                  <th className="py-3 px-5">{t('admin.colFarmerCrop')}</th>
                  <th className="py-3 px-4">{t('admin.colIssue')}</th>
                  <th className="py-3 px-4">{t('admin.colConfSeverity')}</th>
                  <th className="py-3 px-4">{t('admin.colScanDate')}</th>
                  <th className="py-3 px-4">{t('admin.colReviewStatus')}</th>
                  <th className="py-3 px-5 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE3] text-sm">
                {state.scans.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8F7F4]">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-[#17231B]">
                        {s.farmerName || state.profile.name}
                      </p>
                      <p className="text-xs text-[#546358]">
                        {translateCrop(state.language, s.cropName)} ·{' '}
                        {t('common.gradeLabel', { grade: s.quality.suggestedGrade })} (
                        {s.quality.qualityScore}/100)
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#17231B]">
                      {s.disease.possibleDisease}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      {s.disease.confidence}% ·{' '}
                      {translateStatus(state.language, s.disease.severity)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-[#546358]">{s.scannedAt}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold">
                      <span
                        className={
                          s.reviewStatus === 'Verified'
                            ? 'text-[#216B43]'
                            : s.reviewStatus === 'Flagged for Review'
                            ? 'text-[#B91C1C]'
                            : 'text-[#546358]'
                        }
                      >
                        {translateStatus(state.language, s.reviewStatus || 'Normal')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateScanReviewStatus(s.id, 'Verified')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#216B43] text-white text-xs font-semibold cursor-pointer"
                        >
                          {t('admin.markReviewedBtn')}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateScanReviewStatus(s.id, 'Flagged for Review')}
                          className="px-2.5 py-1.5 rounded-lg border border-[#FCA5A5] text-[#B91C1C] text-xs font-semibold cursor-pointer"
                        >
                          {t('admin.flagScanBtn')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. AI ASSISTANT LOGS */}
      {activeTab === 'ai-logs' && (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7F4] border-b border-[#ECEAE3] text-xs font-semibold text-[#546358]">
                  <th className="py-3 px-5">{t('admin.colFarmerLang')}</th>
                  <th className="py-3 px-4">{t('admin.colQuery')}</th>
                  <th className="py-3 px-4">{t('admin.colRespPreview')}</th>
                  <th className="py-3 px-4">{t('admin.colSourceTime')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE3] text-sm">
                {state.assistantLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8F7F4]">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-[#17231B]">{log.farmerName}</p>
                      <p className="text-xs font-mono uppercase text-[#216B43]">{log.language}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#17231B] max-w-xs">{log.query}</td>
                    <td className="py-3.5 px-4 text-xs text-[#3D4E42] max-w-md">
                      {log.responsePreview}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#546358]">
                      <p className="font-medium">{log.source}</p>
                      <p className="font-mono text-[11px]">{log.timestamp}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. AGRICULTURAL GUIDANCE CRUD */}
      {activeTab === 'guidance' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#F8F7F4] border border-[#E5E2DA]">
            <p className="text-xs text-[#3D4E42] leading-relaxed">{t('admin.guidanceSafetyNote')}</p>
            <button
              type="button"
              onClick={() => openGuidanceEditor()}
              className="min-h-[42px] shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#216B43] hover:bg-[#195434] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('admin.addGuidanceTitle')}</span>
            </button>
          </div>

          {editingArticle && (
            <form
              onSubmit={handleSaveGuidance}
              className="bg-white border border-[#216B43]/40 rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <h3 className="font-display text-xl font-semibold text-[#17231B]">
                {editingArticle.id ? t('admin.editEntryTitle') : t('admin.newEntryTitle')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                    {t('admin.guidanceTitleLabel')}
                  </label>
                  <input
                    type="text"
                    value={gTitle}
                    onChange={(e) => setGTitle(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                    {t('admin.guidanceCategoryLabel')}
                  </label>
                  <select
                    value={gCategory}
                    onChange={(e) => setGCategory(e.target.value as GuidanceCategory)}
                    className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm bg-white"
                  >
                    {GUIDANCE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {translateStatus(state.language, cat)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                    {t('admin.guidanceCropLabel')}
                  </label>
                  <input
                    type="text"
                    value={gCrop}
                    onChange={(e) => setGCrop(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                    {t('admin.authorityLabel')}
                  </label>
                  <input
                    type="text"
                    value={gAuthority}
                    onChange={(e) => setGAuthority(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                  {t('admin.guidanceSummaryLabel')}
                </label>
                <textarea
                  rows={2}
                  value={gSummary}
                  onChange={(e) => setGSummary(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[#D8D4CA] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                  {t('admin.guidanceStepsLabel')}
                </label>
                <textarea
                  rows={3}
                  value={gStepsText}
                  onChange={(e) => setGStepsText(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[#D8D4CA] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                  {t('admin.guidanceCautionLabel')}
                </label>
                <input
                  type="text"
                  value={gCaution}
                  onChange={(e) => setGCaution(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="min-h-[40px] px-4 rounded-lg border border-[#D8D4CA] text-xs font-semibold cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-5 rounded-lg bg-[#143A28] text-white text-xs font-semibold cursor-pointer"
                >
                  {t('admin.guidancePublishBtn')}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.guidanceArticles.map((art) => (
              <div
                key={art.id}
                className="bg-white border border-[#E5E2DA] rounded-2xl p-5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#216B43]">
                      {translateStatus(state.language, art.category)} ·{' '}
                      {translateCrop(state.language, art.crop)}
                    </span>
                    <span className="font-mono text-[#5E6D63]">{art.updatedAt}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#17231B]">{art.title}</h3>
                  <p className="text-xs text-[#3D4E42]">{art.summary}</p>
                  <ul className="space-y-1 text-xs text-[#3D4E42] pt-1">
                    {art.verifiedSteps.map((st, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#216B43] shrink-0 mt-0.5" />
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-[#92620A] bg-[#FBF6EA] rounded-lg p-2.5 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                    {art.cautionNote}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#ECEAE3] text-xs">
                  <span className="text-[#5E6D63] truncate max-w-[60%]">{art.sourceAuthority}</span>
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      onClick={() => openGuidanceEditor(art)}
                      className="font-semibold text-[#143A28] hover:underline cursor-pointer"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGuidanceArticle(art.id)}
                      className="font-semibold text-[#B91C1C] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#17231B]">
                {t('admin.reportsTitle')}
              </h2>
              <p className="text-xs text-[#546358] mt-0.5">{t('admin.reportsSubtitle')}</p>
            </div>
            <button
              type="button"
              onClick={handleExportDemoReport}
              className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#216B43] text-white text-xs font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('admin.downloadJsonBtn')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
              <p className="text-xs text-[#546358]">{t('admin.liveGmvLabel')}</p>
              <p className="font-display text-2xl font-semibold text-[#143A28] mt-1 tabular-nums">
                ₹
                {state.orders
                  .reduce((sum, o) => sum + o.totalEstimatedValueInr, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
              <p className="text-xs text-[#546358]">{t('admin.verifiedCovLabel')}</p>
              <p className="font-display text-2xl font-semibold text-[#216B43] mt-1 tabular-nums">
                {Math.round(
                  (ADMIN_PLATFORM_METRICS.verifiedFarmers / ADMIN_PLATFORM_METRICS.totalFarmers) *
                    100
                )}
                %
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
              <p className="text-xs text-[#546358]">{t('admin.transportRatioLabel')}</p>
              <p className="font-display text-2xl font-semibold text-[#17231B] mt-1 tabular-nums">
                {state.transportRequests.filter((tr) => tr.status === 'Delivered').length} /{' '}
                {state.transportRequests.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 12. SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#17231B] mb-2">
              {t('settings.languageCardTitle')}
            </h2>
            <p className="text-xs text-[#546358] mb-3">{t('settings.languageCardDesc')}</p>
            <LanguageSwitcher variant="cards" />
          </div>

          <div className="pt-4 border-t border-[#ECEAE3] space-y-4">
            <h3 className="font-display text-lg font-semibold text-[#17231B]">
              {t('admin.settingsTitle')}
            </h3>
            {[
              {
                label: t('admin.policyKyc'),
                value: requireFarmerKyc,
                toggle: () => setRequireFarmerKyc((v) => !v),
              },
              {
                label: t('admin.policySafety'),
                value: requireSafetyBanner,
                toggle: () => setRequireSafetyBanner((v) => !v),
              },
              {
                label: t('admin.policyAutoFlag'),
                value: autoFlagLowConfidence,
                toggle: () => setAutoFlagLowConfidence((v) => !v),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]"
              >
                <span className="text-sm font-medium text-[#17231B]">{row.label}</span>
                <button
                  type="button"
                  onClick={row.toggle}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shrink-0 ${
                    row.value ? 'bg-[#216B43] text-white' : 'bg-[#D8D4CA] text-[#3D4E42]'
                  }`}
                >
                  {row.value ? t('admin.enabledTag') : t('admin.disabledTag')}
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#ECEAE3] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#546358]">{t('admin.resetDesc')}</span>
            <button
              type="button"
              onClick={resetDemoWorkspace}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D8D4CA] hover:bg-[#F3F1EC] text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('common.resetDemo')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Farmer Details Modal */}
      {inspectFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="bg-white border border-[#E5E2DA] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#216B43]">{t('admin.auditEyebrow')}</p>
                <h3 className="font-display text-2xl font-semibold text-[#17231B]">
                  {inspectFarmer.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectFarmer(null)}
                aria-label={t('common.close')}
                className="p-1.5 rounded-lg hover:bg-[#F3F1EC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-[#3D4E42]">
              <p>
                <strong>{t('common.location')}:</strong> {inspectFarmer.village},{' '}
                {inspectFarmer.district}, {inspectFarmer.state}
              </p>
              <p>
                <strong>{t('auth.phoneOrEmailLabel')}:</strong>{' '}
                <span className="font-mono">{inspectFarmer.phone}</span>
              </p>
              <p>
                <strong>{t('admin.colLandSoil')}:</strong> {inspectFarmer.landSizeAcres}{' '}
                {t('common.acres')} · {inspectFarmer.soilType}
              </p>
              <p>
                <strong>{t('admin.colCrops')}:</strong>{' '}
                {inspectFarmer.crops.map((c) => translateCrop(state.language, c)).join(', ')}
              </p>
              <p>
                <strong>{t('common.status')}:</strong>{' '}
                {translateStatus(state.language, inspectFarmer.status)} ({inspectFarmer.joinedDate})
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#ECEAE3]">
              <button
                type="button"
                onClick={() => setInspectFarmer(null)}
                className="px-4 py-2 rounded-lg border border-[#D8D4CA] text-xs font-semibold cursor-pointer"
              >
                {t('common.close')}
              </button>
              <button
                type="button"
                onClick={() => {
                  updateAdminFarmerStatus(inspectFarmer.id, 'Verified');
                  setInspectFarmer(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#216B43] text-white text-xs font-semibold cursor-pointer"
              >
                {t('admin.verifyBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
