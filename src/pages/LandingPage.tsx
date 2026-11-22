import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Building2,
  Camera,
  Check,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ResilientImage } from '../components/ResilientImage';
import { ASSETS } from '../services/mockData';
import { UserRole } from '../types/kisansetu';

const ROLE_HOME: Record<UserRole, string> = {
  farmer: '/dashboard',
  buyer: '/buyer',
  transport: '/transport',
  admin: '/admin',
};

export const LandingPage: React.FC = () => {
  const { state, t, replayIntro } = useKisanSetu();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scanSample, setScanSample] = useState<'tomato' | 'wheat'>('tomato');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleHomeClick = () => {
    setMobileMenuOpen(false);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrimaryCta = () => {
    if (state.isAuthenticated) {
      navigate(state.needsOnboarding ? '/onboarding' : ROLE_HOME[state.activeRole]);
      return;
    }
    navigate('/signup');
  };

  const navItems = [
    { label: t('landing.navHowItWorks'), target: 'how-it-works' },
    { label: t('landing.navFeatures'), target: 'features' },
    { label: t('landing.navForFarmers'), target: 'for-farmers' },
    { label: t('landing.navForBuyers'), target: 'for-buyers' },
    { label: t('landing.navAbout'), target: 'about' },
  ];

  const howSteps = [
    { num: '01', title: t('landing.how1Title'), desc: t('landing.how1Desc') },
    { num: '02', title: t('landing.how2Title'), desc: t('landing.how2Desc') },
    { num: '03', title: t('landing.how3Title'), desc: t('landing.how3Desc') },
    { num: '04', title: t('landing.how4Title'), desc: t('landing.how4Desc') },
    { num: '05', title: t('landing.how5Title'), desc: t('landing.how5Desc') },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#17231B]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-[#E5E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={handleHomeClick}
            className="inline-flex items-center gap-2.5 text-left cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-[#143A28] text-white flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-[#143A28]">
              {t('common.brandName')}
            </span>
          </button>

          {/* Zone 2: Informational navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#445448]">
            <button
              type="button"
              onClick={handleHomeClick}
              className="hover:text-[#143A28] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t('landing.navHome')}
            </button>
            {navItems.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => scrollToSection(item.target)}
                className="hover:text-[#143A28] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Language selector + Login / Get Started page navigation */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <LanguageSwitcher variant="compact" />
            {state.isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate(state.needsOnboarding ? '/onboarding' : ROLE_HOME[state.activeRole])}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#143A28] hover:bg-[#1E5038] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{t('landing.goToDashboard')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#143A28] hover:bg-[#ECEAE3] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {t('landing.navLogin')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#143A28] hover:bg-[#1E5038] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{t('landing.navGetStarted')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <LanguageSwitcher variant="compact" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="p-2.5 rounded-lg border border-[#D8D4CA] bg-white text-[#17231B] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E2DA] bg-[#F8F7F4] px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleHomeClick}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#17231B] hover:bg-[#ECEAE3] cursor-pointer"
              >
                {t('landing.navHome')}
              </button>
              {navItems.map((item) => (
                <button
                  key={item.target}
                  type="button"
                  onClick={() => scrollToSection(item.target)}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#17231B] hover:bg-[#ECEAE3] cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-2 border-t border-[#E5E2DA] grid grid-cols-2 gap-2.5">
              {state.isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(state.needsOnboarding ? '/onboarding' : ROLE_HOME[state.activeRole]);
                  }}
                  className="col-span-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#143A28] text-white text-sm font-semibold cursor-pointer"
                >
                  {t('landing.goToDashboard')}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="min-h-[44px] px-4 py-2.5 rounded-lg border border-[#D8D4CA] bg-white text-[#143A28] text-sm font-semibold cursor-pointer"
                  >
                    {t('landing.navLogin')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/signup');
                    }}
                    className="min-h-[44px] px-4 py-2.5 rounded-lg bg-[#143A28] text-white text-sm font-semibold cursor-pointer"
                  >
                    {t('landing.navGetStarted')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* 1. Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-14 lg:pb-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-center space-y-6"
            >
              <p className="text-xs font-semibold tracking-[0.08em] uppercase text-[#216B43]">
                {t('landing.heroEyebrow')}
              </p>

              <h1 className="font-display text-[clamp(2.25rem,4vw,3.6rem)] font-semibold leading-[1.1] tracking-tight text-[#14261B] text-balance">
                {t('landing.heroHeadline')}
              </h1>

              <p className="text-base sm:text-lg text-[#445448] leading-relaxed max-w-xl">
                {t('landing.heroSubhead')}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handlePrimaryCta}
                  className="min-h-[46px] inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#143A28] hover:bg-[#1E5038] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>{state.isAuthenticated ? t('landing.goToDashboard') : t('landing.ctaPrimary')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {!state.isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="min-h-[46px] inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#D4CFC3] bg-white hover:bg-[#F2EFE8] text-[#17231B] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>{t('landing.ctaSecondary')}</span>
                  </button>
                )}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#546358]">
                <span>{t('auth.pill1')}</span>
                <span aria-hidden="true">·</span>
                <span>{t('auth.pill2')}</span>
                <span aria-hidden="true">·</span>
                <span>English · हिन्दी · ગુજરાતી</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-[#E5E2DA] min-h-[320px] lg:min-h-[440px]"
            >
              <ResilientImage
                src={ASSETS.farmlandHero}
                alt="Dawn over irrigated vegetable farmland in Gujarat"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-[#F8F7F4]">
                <p className="text-xs text-[#E6B85C] font-medium">
                  {t('common.brandName')} · Anand & Ahmedabad Corridor
                </p>
                <p className="font-display text-xl sm:text-2xl font-medium mt-1 max-w-md">
                  {t('auth.heroTitle')}
                </p>
              </div>
            </motion.div>
          </div>

          {/* 5-Stage Pipeline Strip */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-b border-[#E5E2DA] py-4">
            {[
              t('landing.journeyBar1'),
              t('landing.journeyBar2'),
              t('landing.journeyBar3'),
              t('landing.journeyBar4'),
              t('landing.journeyBar5'),
            ].map((stage, idx) => (
              <div key={idx} className="text-xs sm:text-sm font-medium text-[#2A3B2F] flex items-center gap-2">
                <span className="font-mono tabular-nums text-[#216B43] font-semibold">
                  {stage.split('.')[0]}.
                </span>
                <span className="truncate">{stage.split('.').slice(1).join('.').trim()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Interactive Product Previews (#features) */}
        <section id="features" className="py-16 bg-white border-t border-b border-[#E5E2DA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] text-balance">
                {t('landing.previewSectionTitle')}
              </h2>
              <p className="text-sm sm:text-base text-[#546358] leading-relaxed">
                {t('landing.previewSectionSubtitle')}
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              {/* Crop Scan Preview */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-6 bg-[#F8F7F4] border border-[#E5E2DA] rounded-2xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#216B43]">{t('landing.cropScanLabel')}</p>
                    <h3 className="font-display text-xl font-semibold text-[#17231B] mt-0.5">
                      {t('landing.cropScanTitle')}
                    </h3>
                  </div>
                  <div className="inline-flex p-1 bg-[#ECEAE3] rounded-lg gap-1">
                    <button
                      type="button"
                      onClick={() => setScanSample('tomato')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                        scanSample === 'tomato' ? 'bg-white text-[#17231B] shadow-sm' : 'text-[#546358]'
                      }`}
                    >
                      {t('landing.cropScanSampleToggleA')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanSample('wheat')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                        scanSample === 'wheat' ? 'bg-white text-[#17231B] shadow-sm' : 'text-[#546358]'
                      }`}
                    >
                      {t('landing.cropScanSampleToggleB')}
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-[#E5E2DA]">
                    <ResilientImage
                      src={scanSample === 'tomato' ? ASSETS.landingCropScan : ASSETS.wheatGolden}
                      alt={scanSample === 'tomato' ? 'Farmer scanning tomato foliage' : 'Healthy golden wheat earheads'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="sm:col-span-7 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border border-[#E5E2DA] rounded-xl p-3">
                        <p className="text-xs text-[#546358]">{t('landing.cropScanHealth')}</p>
                        <p className="font-mono tabular-nums text-2xl font-semibold text-[#143A28] mt-0.5">
                          {scanSample === 'tomato' ? '82/100' : '91/100'}
                        </p>
                      </div>
                      <div className="bg-white border border-[#E5E2DA] rounded-xl p-3">
                        <p className="text-xs text-[#546358]">{t('landing.cropScanGrade')}</p>
                        <p className="font-mono tabular-nums text-2xl font-semibold text-[#216B43] mt-0.5">
                          {t('common.gradeLabel', { grade: 'A' })}
                        </p>
                      </div>
                    </div>
                    <div className="pt-1 border-t border-[#E5E2DA]">
                      <p className="text-sm font-semibold text-[#17231B]">
                        {scanSample === 'tomato' ? t('landing.cropScanIssue') : t('landing.cropScanClean')}
                      </p>
                      <p className="text-xs text-[#546358] mt-1">
                        {scanSample === 'tomato'
                          ? t('landing.cropScanSeverityMed')
                          : t('landing.cropScanSeverityNone')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI Farm Assistant Preview */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: 0.06 }}
                className="lg:col-span-6 bg-[#143A28] text-[#F8F7F4] rounded-2xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#E6B85C]">{t('landing.assistantLabel')}</p>
                    <h3 className="font-display text-xl font-semibold mt-0.5">
                      {t('landing.assistantTitle')}
                    </h3>
                  </div>
                  <MessageSquare className="w-5 h-5 text-[#E6B85C] shrink-0" />
                </div>

                <div className="space-y-3">
                  <div className="bg-white/10 rounded-xl p-3.5 text-sm text-[#F8F7F4]">
                    {t('landing.assistantSampleQ')}
                  </div>
                  <div className="bg-[#0F2C1E] border border-white/15 rounded-xl p-4 text-sm text-[#DCE7DF] leading-relaxed">
                    {t('landing.assistantSampleA')}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/15 text-xs text-[#C7D6CB]">
                  <span>English · हिन्दी · ગુજરાતી</span>
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#E6B85C] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    <span>{t('landing.navGetStarted')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* Market Intelligence Preview */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="lg:col-span-12 bg-[#F8F7F4] border border-[#E5E2DA] rounded-2xl p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#216B43]">{t('landing.marketLabel')}</p>
                    <h3 className="font-display text-xl font-semibold text-[#17231B] mt-0.5">
                      {t('landing.marketTitle')}
                    </h3>
                  </div>
                  <span className="text-xs text-[#546358]">{t('common.demoIndicative')}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E2DA] text-xs font-semibold text-[#546358]">
                        <th className="py-2.5 pr-4">{t('landing.marketCropCol')}</th>
                        <th className="py-2.5 px-4">{t('landing.marketPriceCol')}</th>
                        <th className="py-2.5 pl-4 text-right">{t('landing.marketDemandCol')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECEAE3] text-sm">
                      <tr>
                        <td className="py-3 pr-4 font-medium text-[#17231B]">{t('landing.marketRow1Place')}</td>
                        <td className="py-3 px-4 font-mono tabular-nums text-[#143A28] font-semibold">
                          {t('landing.marketRow1Price')}
                        </td>
                        <td className="py-3 pl-4 text-right text-[#216B43] font-medium">
                          {t('landing.marketRow1Demand')}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-medium text-[#17231B]">{t('landing.marketRow2Place')}</td>
                        <td className="py-3 px-4 font-mono tabular-nums text-[#143A28] font-semibold">
                          {t('landing.marketRow2Price')}
                        </td>
                        <td className="py-3 pl-4 text-right text-[#546358] font-medium">
                          {t('landing.marketRow2Demand')}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-medium text-[#17231B]">{t('landing.marketRow3Place')}</td>
                        <td className="py-3 px-4 font-mono tabular-nums text-[#143A28] font-semibold">
                          {t('landing.marketRow3Price')}
                        </td>
                        <td className="py-3 pl-4 text-right text-[#216B43] font-medium">
                          {t('landing.marketRow3Demand')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Farmer -> Buyer -> Transport Ecosystem & Supply Matching */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#E5E2DA] min-h-[280px]">
              <ResilientImage
                src={ASSETS.landingMarketDispatch}
                alt="Grade-A tomato crates loaded into pickup vehicle at collection hub"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.06em] uppercase text-[#216B43]">
                  {t('landing.ecosystemEyebrow')}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-1 text-balance">
                  {t('landing.ecosystemTitle')}
                </h2>
                <p className="text-sm sm:text-base text-[#546358] mt-2 leading-relaxed">
                  {t('landing.ecosystemSubtitle')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Sprout, title: t('landing.ecoStep1Title'), desc: t('landing.ecoStep1Desc') },
                  { icon: TrendingUp, title: t('landing.ecoStep2Title'), desc: t('landing.ecoStep2Desc') },
                  { icon: Building2, title: t('landing.ecoStep3Title'), desc: t('landing.ecoStep3Desc') },
                  { icon: Truck, title: t('landing.ecoStep4Title'), desc: t('landing.ecoStep4Desc') },
                ].map((node, idx) => {
                  const Icon = node.icon;
                  return (
                    <div key={idx} className="bg-white border border-[#E5E2DA] rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#143A28]/8 text-[#143A28] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-semibold text-[#17231B]">{node.title}</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-[#546358] leading-relaxed">{node.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 4. How KisanSetu Works (#how-it-works) */}
        <section id="how-it-works" className="py-16 bg-white border-t border-b border-[#E5E2DA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B]">
                {t('landing.howTitle')}
              </h2>
              <p className="text-sm sm:text-base text-[#546358]">{t('landing.howSubtitle')}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {howSteps.map((step) => (
                <div key={step.num} className="pt-4 border-t-2 border-[#143A28]/20 space-y-2">
                  <p className="font-mono tabular-nums text-xs font-semibold text-[#216B43]">
                    {step.num}.
                  </p>
                  <h3 className="text-base font-semibold text-[#17231B]">{step.title}</h3>
                  <p className="text-sm text-[#546358] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Benefits For Farmers & For Buyers (#for-farmers, #for-buyers) */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* For Farmers */}
            <div
              id="for-farmers"
              className="bg-white border border-[#E5E2DA] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#216B43]">
                  {t('landing.farmersEyebrow')}
                </p>
                <h2 className="font-display text-2xl font-semibold text-[#17231B] text-balance">
                  {t('landing.farmersTitle')}
                </h2>
                <ul className="space-y-3 pt-2">
                  {[
                    t('landing.farmersPoint1'),
                    t('landing.farmersPoint2'),
                    t('landing.farmersPoint3'),
                    t('landing.farmersPoint4'),
                  ].map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#3D4E42] leading-relaxed">
                      <Check className="w-4 h-4 text-[#216B43] mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/signup?role=farmer')}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143A28] hover:bg-[#1E5038] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  <span>{t('landing.farmersCta')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* For Buyers */}
            <div
              id="for-buyers"
              className="bg-white border border-[#E5E2DA] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#9A6E18]">
                  {t('landing.buyersEyebrow')}
                </p>
                <h2 className="font-display text-2xl font-semibold text-[#17231B] text-balance">
                  {t('landing.buyersTitle')}
                </h2>
                <ul className="space-y-3 pt-2">
                  {[
                    t('landing.buyersPoint1'),
                    t('landing.buyersPoint2'),
                    t('landing.buyersPoint3'),
                    t('landing.buyersPoint4'),
                  ].map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#3D4E42] leading-relaxed">
                      <Check className="w-4 h-4 text-[#9A6E18] mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/signup?role=buyer')}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#143A28] text-[#143A28] hover:bg-[#143A28] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  <span>{t('landing.buyersCta')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Trust & Safety Section (#about) */}
        <section id="about" className="py-16 bg-white border-t border-[#E5E2DA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#216B43]">
                {t('landing.trustEyebrow')}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B]">
                {t('landing.trustTitle')}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: t('landing.trustCard1Title'),
                  desc: t('landing.trustCard1Desc'),
                },
                {
                  icon: Camera,
                  title: t('landing.trustCard2Title'),
                  desc: t('landing.trustCard2Desc'),
                },
                {
                  icon: Sprout,
                  title: t('landing.trustCard3Title'),
                  desc: t('landing.trustCard3Desc'),
                },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="bg-[#F8F7F4] border border-[#E5E2DA] rounded-2xl p-6 space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#143A28] text-white flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-[#17231B]">{card.title}</h3>
                    <p className="text-sm text-[#546358] leading-relaxed">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. Final CTA Banner (No Login Form Below Landing Page) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="bg-[#143A28] text-[#F8F7F4] rounded-2xl px-6 py-10 sm:px-12 sm:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-balance">
                {t('landing.finalCtaTitle')}
              </h2>
              <p className="text-sm sm:text-base text-[#D4E0D7]">{t('landing.finalCtaSubtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    state.isAuthenticated
                      ? state.needsOnboarding
                        ? '/onboarding'
                        : ROLE_HOME[state.activeRole]
                      : '/signup'
                  )
                }
                className="min-h-[46px] inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C48F29] hover:bg-[#D59D31] text-[#101D15] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>
                  {state.isAuthenticated ? t('landing.goToDashboard') : t('landing.finalCtaPrimary')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {!state.isAuthenticated && (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="min-h-[46px] inline-flex items-center px-5 py-3 rounded-xl border border-white/25 hover:bg-white/10 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>{t('landing.finalCtaSecondary')}</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E5E2DA] bg-[#F3F1EC] text-[#445448]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-[#E5E2DA]">
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#143A28] text-white flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </span>
                <span className="font-display text-lg font-semibold text-[#143A28]">
                  {t('common.brandName')}
                </span>
              </div>
              <p className="text-sm text-[#546358] max-w-sm leading-relaxed">
                {t('landing.footerTagline')}
              </p>
              <div className="pt-1">
                <LanguageSwitcher variant="compact" />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#17231B]">
                {t('landing.footerLinksTitle')}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <button
                  type="button"
                  onClick={handleHomeClick}
                  className="text-left hover:text-[#143A28] cursor-pointer"
                >
                  {t('landing.navHome')}
                </button>
                {navItems.map((item) => (
                  <button
                    key={item.target}
                    type="button"
                    onClick={() => scrollToSection(item.target)}
                    className="text-left hover:text-[#143A28] cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#17231B]">
                {t('landing.footerAccessTitle')}
              </p>
              <div className="flex flex-col items-start gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="hover:text-[#143A28] font-medium cursor-pointer"
                >
                  {t('landing.navLogin')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="hover:text-[#143A28] font-medium cursor-pointer"
                >
                  {t('landing.navGetStarted')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    replayIntro();
                    navigate('/');
                  }}
                  className="hover:text-[#143A28] text-xs text-[#546358] cursor-pointer"
                >
                  {t('landing.footerReplayIntro')}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#546358]">
            <span>{t('landing.footerCopyright')}</span>
            <span>English · हिन्दी · ગુજરાતી</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
