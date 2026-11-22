import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Sprout } from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { LANGUAGE_LABELS, translateCrop, translateRole, translateStatus } from '../i18n';
import { Language, UserRole } from '../types/kisansetu';
import { LanguageSwitcher } from './LanguageSwitcher';

const CROP_CHOICES = ['Tomato', 'Wheat', 'Onion', 'Potato', 'Cotton', 'Chilli', 'Groundnut', 'Maize'];

const ROLE_HOME: Record<UserRole, string> = {
  farmer: '/dashboard',
  buyer: '/buyer',
  transport: '/transport',
  admin: '/admin',
};

export const OnboardingFlow: React.FC = () => {
  const { state, t, setLanguage, completeOnboarding, finishRoleOnboarding, loginAsDemoRole } = useKisanSetu();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [farmerName, setFarmerName] = useState(state.profile.name || state.user.name || 'Ramesh Patel');
  const [village, setVillage] = useState('Borsad');
  const [district, setDistrict] = useState('Anand');
  const [stateName, setStateName] = useState('Gujarat');
  const [landSizeAcres, setLandSizeAcres] = useState('4.5');

  const [orgName, setOrgName] = useState(state.user.name || state.buyerProfile.companyName);
  const [orgLocation, setOrgLocation] = useState('Ahmedabad, Gujarat');

  const [mainCrops, setMainCrops] = useState<string[]>(['Tomato', 'Wheat']);
  const [experienceYears, setExperienceYears] = useState('12');

  const [soilType, setSoilType] = useState('Black Loamy (Goradu)');
  const [irrigationType, setIrrigationType] = useState('Drip + Canal');
  const [waterAvailability, setWaterAvailability] = useState<'Abundant' | 'Moderate' | 'Limited'>('Moderate');

  const [error, setError] = useState('');

  const handleSkipOnboarding = () => {
    loginAsDemoRole(state.activeRole);
    navigate(ROLE_HOME[state.activeRole], { replace: true });
  };

  if (state.activeRole !== 'farmer') {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#17231B] flex flex-col justify-center py-10 px-4 sm:px-8">
        <div className="max-w-xl w-full mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#143A28] text-white flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-display text-lg font-semibold text-[#143A28]">
                {t('common.brandName')}
              </span>
            </button>
            <LanguageSwitcher variant="compact" />
          </div>

          <div className="bg-white border border-[#E5E2DA] rounded-2xl p-6 sm:p-8 space-y-5">
            <div>
              <p className="text-xs font-medium text-[#216B43]">
                {translateRole(state.language, state.activeRole)}
              </p>
              <h1 className="font-display text-2xl font-semibold text-[#17231B] mt-1">
                {t('onboarding.title')}
              </h1>
              <p className="text-sm text-[#546358] mt-1">{t('onboarding.subtitle')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                  {t('auth.fullNameLabel')}
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-[#D8D4CA] text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                  {t('common.location')}
                </label>
                <input
                  type="text"
                  value={orgLocation}
                  onChange={(e) => setOrgLocation(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-[#D8D4CA] text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D4E42] mb-2">
                  {t('onboarding.step1Title')}
                </label>
                <LanguageSwitcher
                  variant="cards"
                  value={state.language}
                  onChange={(lang: Language) => setLanguage(lang)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#ECEAE3]">
              <button
                type="button"
                onClick={handleSkipOnboarding}
                className="text-xs font-medium text-[#546358] hover:text-[#17231B] cursor-pointer"
              >
                {t('intro.skipIntro')}
              </button>
              <button
                type="button"
                onClick={() => {
                  finishRoleOnboarding(orgName, orgLocation);
                  navigate(ROLE_HOME[state.activeRole], { replace: true });
                }}
                className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#143A28] hover:bg-[#1D4E37] text-white text-sm font-semibold cursor-pointer"
              >
                <span>{t('onboarding.finishSetup')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleCrop = (crop: string) => {
    setMainCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!farmerName.trim() || !village.trim() || !district.trim() || Number(landSizeAcres) <= 0) {
        setError(t('onboarding.errorRequired'));
        return;
      }
    }
    if (step === 2 && mainCrops.length === 0) {
      setError(t('common.requiredField'));
      return;
    }
    if (step < 5) {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      farmerName,
      village,
      district,
      state: stateName,
      landSizeAcres: Number(landSizeAcres) || 4.5,
      soilType,
      irrigationType,
      waterAvailability,
      mainCrops,
      experienceYears: Number(experienceYears) || 10,
      preferredLanguage: state.language,
    });
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#17231B] flex flex-col justify-between py-8 px-4 sm:px-8">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Brand & Language Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#143A28] text-white flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-display text-lg font-semibold text-[#143A28]">
              {t('common.brandName')}
            </span>
          </button>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="compact" />
            <button
              type="button"
              onClick={handleSkipOnboarding}
              className="text-xs font-medium text-[#216B43] hover:underline cursor-pointer"
            >
              {t('intro.skipIntro')}
            </button>
          </div>
        </div>

        {/* Visual Progress Indicator */}
        <nav aria-label={t('onboarding.title')} className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <ol className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((num) => {
              const done = step > num;
              const active = step === num;
              return (
                <li key={num} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-colors ${
                      done
                        ? 'bg-[#216B43] text-white'
                        : active
                        ? 'bg-[#143A28] text-white'
                        : 'bg-[#ECEAE3] text-[#546358]'
                    }`}
                  >
                    {done ? <Check className="w-4 h-4" /> : num}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="text-center text-xs text-[#546358] mt-2">
            {t('common.stepOf', { step, total: 5 })}
          </p>
        </nav>

        {/* Step Content Card */}
        <div className="bg-white border border-[#E5E2DA] rounded-2xl p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#17231B]">
                  {t('onboarding.step2Title')}
                </h1>
                <p className="text-sm text-[#546358] mt-1">{t('onboarding.subtitle')}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                    {t('onboarding.farmerName')}
                  </label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#D8D4CA] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                    {t('onboarding.village')}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#D8D4CA] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                    {t('onboarding.district')}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#D8D4CA] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                    {t('onboarding.state')}
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#D8D4CA] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                    {t('onboarding.landSize')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={landSizeAcres}
                    onChange={(e) => setLandSizeAcres(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#17231B]">
                  {t('farm.cropsListTitle', { count: mainCrops.length })}
                </h1>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CROP_CHOICES.map((crop) => {
                  const selected = mainCrops.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      className={`min-h-[44px] px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#143A28] border-[#143A28] text-white'
                          : 'bg-white border-[#D8D4CA] text-[#17231B] hover:bg-[#F3F1EC]'
                      }`}
                    >
                      {translateCrop(state.language, crop)}
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                  {t('common.acres')} ({landSizeAcres})
                </label>
                <input
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full sm:w-48 min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#17231B]">
                  {t('farm.farmProfileTitle')}
                </h1>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                    {t('onboarding.soilType')}
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#D8D4CA] text-sm bg-white"
                  >
                    <option value="Black Loamy (Goradu)">Black Loamy (Goradu)</option>
                    <option value="Medium Black Cotton Soil">Medium Black Cotton Soil</option>
                    <option value="Alluvial Sandy Loam">Alluvial Sandy Loam</option>
                    <option value="Red Laterite Soil">Red Laterite Soil</option>
                    <option value="Clay Loam">Clay Loam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                    {t('onboarding.irrigationType')}
                  </label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#D8D4CA] text-sm bg-white"
                  >
                    <option value="Drip + Canal">Drip + Canal</option>
                    <option value="Drip Irrigation Only">Drip Irrigation Only</option>
                    <option value="Borewell / Tube Well">Borewell / Tube Well</option>
                    <option value="Canal + Flood">Canal + Flood</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                    {t('farm.waterAvailability')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Abundant', 'Moderate', 'Limited'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setWaterAvailability(level)}
                        className={`min-h-[44px] rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                          waterAvailability === level
                            ? 'bg-[#143A28] border-[#143A28] text-white'
                            : 'bg-white border-[#D8D4CA] text-[#17231B]'
                        }`}
                      >
                        {translateStatus(state.language, level)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#17231B]">
                  {t('onboarding.step1Title')}
                </h1>
                <p className="text-sm text-[#546358] mt-1">{t('onboarding.step1Desc')}</p>
              </div>
              <LanguageSwitcher
                variant="cards"
                value={state.language}
                onChange={(lang: Language) => setLanguage(lang)}
              />
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 rounded-full bg-[#216B43]/12 text-[#216B43] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#143A28]">
                  {t('onboarding.title')}
                </h1>
                <p className="text-sm text-[#546358] mt-2 max-w-md mx-auto">
                  {farmerName} · {village}, {district} ({landSizeAcres} {t('common.acres')})
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left bg-[#F8F7F4] border border-[#E5E2DA] rounded-xl p-4">
                <div>
                  <p className="text-xs text-[#6A786E]">{t('common.location')}</p>
                  <p className="text-sm font-semibold mt-0.5 truncate">{village}, {district}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6A786E]">{t('farm.landSize')}</p>
                  <p className="text-sm font-semibold font-mono tabular-nums mt-0.5">
                    {landSizeAcres} {t('common.acres')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6A786E]">{t('common.crop')}</p>
                  <p className="text-sm font-semibold mt-0.5 truncate">
                    {mainCrops.map((c) => translateCrop(state.language, c)).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6A786E]">{t('common.language')}</p>
                  <p className="text-sm font-semibold mt-0.5">{LANGUAGE_LABELS[state.language]}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs font-medium text-[#B91C1C] bg-[#FEE2E2]/70 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-[#ECEAE3]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4 | 5)}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D8D4CA] text-sm font-medium hover:bg-[#F3F1EC] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('common.back')}</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#216B43] hover:bg-[#195434] text-white text-sm font-semibold cursor-pointer"
              >
                <span>{t('common.continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#143A28] hover:bg-[#1D4E37] text-white text-sm font-semibold cursor-pointer"
              >
                <span>{t('onboarding.finishSetup')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
