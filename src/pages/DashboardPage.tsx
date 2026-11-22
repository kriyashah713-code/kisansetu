import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Camera,
  CheckCircle2,
  ClipboardList,
  CloudRain,
  Compass,
  Droplets,
  MessageSquare,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Sprout,
  Sun,
  TrendingUp,
  Truck,
  Wind,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import {
  getGreeting,
  translateCrop,
  translateDay,
  translateStatus,
  translateWeatherCondition,
} from '../i18n';
import { marketService } from '../services/marketService';
import { weatherService } from '../services/weatherService';
import { MarketPrice, WeatherData } from '../types/kisansetu';
import { ResilientImage } from '../components/ResilientImage';
import { SvgTrendChart } from '../components/SvgTrendChart';

export const DashboardPage: React.FC = () => {
  const { state, t } = useKisanSetu();
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [topMarket, setTopMarket] = useState<MarketPrice | null>(null);

  useEffect(() => {
    weatherService
      .getFarmWeather(`${state.profile.village}, ${state.profile.district} (${state.profile.state})`)
      .then(setWeather);
    marketService.getMarketPrices('Tomato', 'A').then((list) => {
      if (list.length > 0) setTopMarket(list[0]);
    });
  }, [state.profile.village, state.profile.district, state.profile.state]);

  const firstName = state.profile.name.split(' ')[0];
  const latestScan = state.scans[0];
  const myListings = state.listings.filter((l) => l.farmerId === state.profile.id);
  const activeOrders = state.orders.filter((o) => o.status !== 'Completed');
  const activeTransport = state.transportRequests.filter((tr) => tr.status !== 'Delivered');
  const unreadAlerts = state.notifications.filter(
    (n) => !n.read && (!n.targetRole || n.targetRole === 'all' || n.targetRole === 'farmer')
  );

  return (
    <div className="space-y-6">
      {/* Hero Personalized Greeting + Primary Focal Action */}
      <section className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <ResilientImage
            src={state.profile.avatarUrl}
            alt={state.profile.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-[#D8D4CA] shrink-0"
          />
          <div>
            <p className="text-xs text-[#546358] flex flex-wrap items-center gap-1.5">
              <span>{state.farm.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {state.farm.landSizeAcres} {t('common.acres')}
              </span>
              {state.profile.verifiedFarmer && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-[#216B43] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('dashboard.verifiedFarmerPill')}
                  </span>
                </>
              )}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-1 text-balance">
              {getGreeting(state.language, firstName)}
            </h1>
            <p className="text-sm text-[#546358] mt-1">{t('dashboard.journeySteps')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/scanner')}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#216B43] hover:bg-[#195434] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            <span>{t('dashboard.scanCropBtn')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/assistant')}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F3F1EC] hover:bg-[#E7E4DC] text-[#143A28] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('dashboard.quickAssistant')}</span>
          </button>
        </div>
      </section>

      {/* 8 Connected Farmer Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Crop Health */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate('/farm')}
          className="text-left bg-white border border-[#E5E2DA] rounded-2xl p-5 hover:border-[#216B43]/50 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">{t('dashboard.kpiFarmHealth')}</span>
            <Sprout className="w-4 h-4 text-[#216B43]" />
          </div>
          <div className="mt-3">
            <p className="font-display text-3xl font-semibold text-[#143A28] tabular-nums">
              {state.farm.overallHealthScore}%{' '}
              <span className="text-base font-sans font-medium text-[#216B43]">
                {translateStatus(state.language, 'Healthy')}
              </span>
            </p>
            <p className="text-xs text-[#546358] mt-1 font-mono tabular-nums">
              {state.crops.map((c) => `${translateCrop(state.language, c.name)} ${c.healthScore}%`).join(' · ')}
            </p>
          </div>
        </motion.button>

        {/* 2. My Crop Listings */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate('/marketplace')}
          className="text-left bg-white border border-[#E5E2DA] rounded-2xl p-5 hover:border-[#216B43]/50 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">{t('nav.sellCrop')}</span>
            <ShoppingBag className="w-4 h-4 text-[#B8860B]" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl font-semibold text-[#17231B] tabular-nums">
              {myListings.length} · {translateStatus(state.language, 'Active')}
            </p>
            <p className="text-xs text-[#546358] mt-1">
              {myListings[0]
                ? `${myListings[0].quantityKg} ${t('common.kg')} ${t('common.gradeLabel', { grade: myListings[0].grade })} ${translateCrop(state.language, myListings[0].crop)}`
                : t('dashboard.quickSell')}
            </p>
          </div>
        </motion.button>

        {/* 3. Buyer Requests */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate('/marketplace')}
          className="text-left bg-white border border-[#E5E2DA] rounded-2xl p-5 hover:border-[#216B43]/50 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">{t('dashboard.kpiOpenInquiries')}</span>
            <ClipboardList className="w-4 h-4 text-[#216B43]" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl font-semibold text-[#17231B] tabular-nums">
              {state.inquiries.filter((i) => i.status === 'New').length} · {translateStatus(state.language, 'New')}
            </p>
            <p className="text-xs text-[#216B43] font-medium mt-1">
              {state.requirements.length} · {t('dashboard.buyerMatchesTitle')}
            </p>
          </div>
        </motion.button>

        {/* 4. Active Orders */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate('/orders')}
          className="text-left bg-white border border-[#E5E2DA] rounded-2xl p-5 hover:border-[#216B43]/50 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">{t('dashboard.recentOrdersTitle')}</span>
            <PackageCheck className="w-4 h-4 text-[#143A28]" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl font-semibold text-[#17231B] tabular-nums">
              {activeOrders.length} · {translateStatus(state.language, 'Active')}
            </p>
            <p className="text-xs text-[#546358] mt-1">
              {activeOrders[0]
                ? `#${activeOrders[0].orderNumber} · ${translateStatus(state.language, activeOrders[0].status)}`
                : t('orders.empty')}
            </p>
          </div>
        </motion.button>

        {/* 5. Transport */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate('/transport')}
          className="text-left bg-white border border-[#E5E2DA] rounded-2xl p-5 hover:border-[#216B43]/50 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">{t('nav.transport')}</span>
            <Truck className="w-4 h-4 text-[#216B43]" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl font-semibold text-[#17231B] tabular-nums">
              {activeTransport.length} · {translateStatus(state.language, 'Active')}
            </p>
            <p className="text-xs text-[#546358] mt-1">
              {activeTransport[0]
                ? `#${activeTransport[0].orderNumber} · ${translateStatus(state.language, activeTransport[0].status)}`
                : t('nav.liveTracking')}
            </p>
          </div>
        </motion.button>

        {/* 6. Market Opportunities */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate('/market')}
          className="text-left bg-white border border-[#E5E2DA] rounded-2xl p-5 hover:border-[#216B43]/50 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">{t('dashboard.kpiBestPrice')}</span>
            <TrendingUp className="w-4 h-4 text-[#216B43]" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl font-semibold text-[#17231B] tabular-nums">
              ₹{topMarket ? `${topMarket.minPricePerKg}–₹${topMarket.maxPricePerKg}` : '26–32'}{t('common.perKg')}
            </p>
            <p className="text-xs text-[#546358] mt-1">
              {translateCrop(state.language, 'Tomato')} {t('common.gradeLabel', { grade: 'A' })} ·{' '}
              {translateStatus(state.language, topMarket?.trend || 'Rising')} ({t('common.demoDataset')})
            </p>
          </div>
        </motion.button>

        {/* 7. AI Insights */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate('/scanner')}
          className="text-left bg-white border border-[#E5E2DA] rounded-2xl p-5 hover:border-[#216B43]/50 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">{t('cropScan.marketPositionTitle')}</span>
            <Sparkles className="w-4 h-4 text-[#B8860B]" />
          </div>
          <div className="mt-3">
            <p className="text-base font-semibold text-[#17231B] leading-snug">
              {t('common.gradeLabel', { grade: latestScan?.quality.suggestedGrade || 'A' })}
            </p>
            <p className="text-xs text-[#546358] mt-1 line-clamp-2">
              {latestScan?.marketInsightNote}
            </p>
          </div>
        </motion.button>

        {/* 8. Notifications */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          onClick={() => navigate(unreadAlerts[0]?.actionRoute || '/orders')}
          className="text-left bg-white border border-[#E5E2DA] rounded-2xl p-5 hover:border-[#216B43]/50 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">{t('header.notifications')}</span>
            <Bell className="w-4 h-4 text-[#B8860B]" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl font-semibold text-[#17231B] tabular-nums">
              {t('header.unreadCount', { count: unreadAlerts.length })}
            </p>
            <p className="text-xs text-[#546358] truncate mt-1">
              {unreadAlerts[0]?.title || t('notifications.empty')}
            </p>
          </div>
        </motion.button>
      </section>

      {/* Two-Column Intelligence Split: Weather & Alerts + Latest Scan & Health Trend */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#546358]">{t('dashboard.weatherTitle')}</p>
              <h2 className="font-display text-xl font-semibold text-[#17231B] mt-0.5">
                {weather
                  ? `${weather.currentTempC}°C · ${translateWeatherCondition(state.language, weather.condition)}`
                  : t('common.loading')}
              </h2>
              <p className="text-xs text-[#6A786E] mt-0.5">
                {weather?.location} · {t('common.demoDataset')}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#3D4E42] font-mono tabular-nums">
              <span className="inline-flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-[#2563EB]" />
                {weather?.humidityPct ?? 62}% {t('dashboard.humidity')}
              </span>
              <span className="inline-flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-[#546358]" />
                {weather?.windKmh ?? 11} km/h
              </span>
            </div>
          </div>

          {weather && (
            <div className="grid grid-cols-5 gap-2 border-y border-[#ECEAE3] py-4">
              {weather.forecast.map((d) => (
                <div key={d.day} className="text-center space-y-1">
                  <p className="text-xs font-semibold text-[#3D4E42]">
                    {translateDay(state.language, d.day)}
                  </p>
                  <div className="flex justify-center">
                    {d.rainProbability >= 50 ? (
                      <CloudRain className="w-4 h-4 text-[#2563EB]" />
                    ) : (
                      <Sun className="w-4 h-4 text-[#C48F29]" />
                    )}
                  </div>
                  <p className="text-xs font-mono tabular-nums text-[#17231B]">
                    {d.tempHighC}° / {d.tempLowC}°
                  </p>
                  <p className="text-[11px] font-mono tabular-nums text-[#5E6D63]">
                    {d.rainProbability}%
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2.5">
            {weather?.alerts.map((al) => (
              <div
                key={al.id}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FEF9EC] border border-[#E8D5A3]"
              >
                <AlertTriangle className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#4A3728]">{al.title}</p>
                  <p className="text-xs text-[#5E4A3A] mt-0.5 leading-relaxed">{al.advisory}</p>
                </div>
              </div>
            ))}

            {unreadAlerts.slice(0, 1).map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => navigate(alert.actionRoute)}
                className="w-full text-left flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E5E2DA] hover:bg-[#F1EFE9] transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#17231B] truncate">{alert.title}</p>
                  <p className="text-xs text-[#546358] truncate mt-0.5">{alert.body}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#216B43] shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#546358]">{t('cropScan.recentScansTitle')}</p>
              <button
                type="button"
                onClick={() => navigate('/scanner')}
                className="text-xs font-semibold text-[#216B43] hover:underline cursor-pointer"
              >
                {t('nav.cropScanner')}
              </button>
            </div>

            {latestScan && (
              <div className="mt-3 flex items-start gap-3.5">
                <ResilientImage
                  src={latestScan.imageUrl}
                  alt={latestScan.cropName}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#E5E2DA]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#17231B]">
                    {translateCrop(state.language, latestScan.cropName)} ·{' '}
                    {t('common.gradeLabel', { grade: latestScan.quality.suggestedGrade })}
                  </p>
                  <p className="text-xs text-[#546358] mt-0.5 font-mono tabular-nums">
                    {t('cropScan.resultHealthScoreLabel')}: {latestScan.healthScore}/100 ·{' '}
                    {t('cropScan.qualityScoreLabel')}: {latestScan.quality.qualityScore}/100
                  </p>
                  <p className="text-xs text-[#4A3728] mt-1.5 leading-relaxed">
                    {latestScan.disease.detected
                      ? `${latestScan.disease.possibleDisease} (${translateStatus(state.language, latestScan.disease.severity)})`
                      : translateStatus(state.language, 'Healthy')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#ECEAE3] pt-4">
            <p className="text-xs font-semibold text-[#546358] mb-2">{t('farm.healthTrendTitle')}</p>
            <SvgTrendChart
              data={state.farm.healthHistory.map((h) => ({ label: h.week, value: h.score }))}
              unitSuffix="%"
              height={145}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => navigate('/decision')}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#D8D4CA] hover:bg-[#F3F1EC] text-xs font-semibold text-[#17231B] cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#216B43]" />
              <span className="truncate">{t('dashboard.quickDecision')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/supply')}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#D8D4CA] hover:bg-[#F3F1EC] text-xs font-semibold text-[#17231B] cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#B8860B]" />
              <span className="truncate">{t('nav.supplyMatch')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
