import React, { useState } from 'react';
import { Compass, Info, Loader2, Sparkles } from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { aiService } from '../services/aiService';
import { CropDecisionResult } from '../types/kisansetu';
import { translateCrop, translateStatus } from '../i18n';

export const CropDecisionPage: React.FC = () => {
  const { state, t, pushToast } = useKisanSetu();

  const [location, setLocation] = useState(
    `${state.profile.village}, ${state.profile.district}, ${state.profile.state}`
  );
  const [landSizeAcres, setLandSizeAcres] = useState(String(state.farm.landSizeAcres));
  const [soilType, setSoilType] = useState(state.farm.soilType);
  const [waterAvailability, setWaterAvailability] = useState<string>(state.farm.waterAvailability);
  const [season, setSeason] = useState('Rabi (Winter)');
  const [budgetInr, setBudgetInr] = useState('45000');
  const [preferredType, setPreferredType] = useState('Vegetables + Cash Crop');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropDecisionResult | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rec = await aiService.recommendCrops({
        location,
        landSizeAcres: Number(landSizeAcres) || 2,
        soilType,
        waterAvailability,
        season,
        budgetInr: Number(budgetInr) || 35000,
        preferredType,
        language: state.language,
      });
      setResult(rec);
      pushToast({
        title: t('decision.recommendedTitle'),
        description: rec.sourceLabel,
        variant: 'success',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#216B43]">{t('nav.cropDecision')}</p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-0.5">
          {t('decision.title')}
        </h1>
        <p className="text-sm text-[#546358] mt-1 max-w-2xl">{t('decision.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-4 bg-white border border-[#E5E2DA] rounded-2xl p-5 space-y-4"
        >
          <h2 className="font-display text-lg font-semibold text-[#17231B]">
            {t('decision.formTitle')}
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
              {t('decision.locationLabel')}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-[#D8D4CA] text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('decision.landSizeLabel')}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={landSizeAcres}
                onChange={(e) => setLandSizeAcres(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('decision.budgetLabel')}
              </label>
              <input
                type="number"
                step="1000"
                min="5000"
                value={budgetInr}
                onChange={(e) => setBudgetInr(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
              {t('decision.soilTypeLabel')}
            </label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-[#D8D4CA] text-sm bg-white"
            >
              <option value="Black Loamy (Goradu)">{t('decision.soilBlack')}</option>
              <option value="Medium Black Cotton Soil">{t('decision.soilCotton')}</option>
              <option value="Alluvial Sandy Loam">{t('decision.soilAlluvial')}</option>
              <option value="Red Laterite Soil">{t('decision.soilRed')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('decision.waterLabel')}
              </label>
              <select
                value={waterAvailability}
                onChange={(e) => setWaterAvailability(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-[#D8D4CA] text-sm bg-white"
              >
                <option value="Abundant">{translateStatus(state.language, 'Abundant')}</option>
                <option value="Moderate">{translateStatus(state.language, 'Moderate')}</option>
                <option value="Limited">{translateStatus(state.language, 'Limited')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('decision.seasonLabel')}
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-[#D8D4CA] text-sm bg-white"
              >
                <option value="Rabi (Winter)">{t('decision.seasonRabi')}</option>
                <option value="Kharif (Monsoon)">{t('decision.seasonKharif')}</option>
                <option value="Zaid (Summer)">{t('decision.seasonZaid')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
              {t('decision.prefTypeLabel')}
            </label>
            <select
              value={preferredType}
              onChange={(e) => setPreferredType(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-[#D8D4CA] text-sm bg-white"
            >
              <option value="Vegetables + Cash Crop">{t('decision.prefVegCash')}</option>
              <option value="Short-Cycle Horticulture">{t('decision.prefHort')}</option>
              <option value="Cereals & Pulses (Low Risk)">{t('decision.prefCereals')}</option>
              <option value="Balanced Mixed Cropping">{t('decision.prefMixed')}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#216B43] hover:bg-[#195434] disabled:opacity-60 text-white text-sm font-semibold cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? t('decision.runningBtn') : t('decision.runBtn')}</span>
          </button>
        </form>

        <section className="lg:col-span-8 space-y-5">
          {!result ? (
            <div className="bg-white border border-[#E5E2DA] rounded-2xl p-10 text-center space-y-3">
              <Compass className="w-10 h-10 text-[#216B43] mx-auto" />
              <h2 className="font-display text-xl font-semibold text-[#17231B]">
                {t('decision.emptyTitle')}
              </h2>
              <p className="text-sm text-[#546358] max-w-md mx-auto">{t('decision.emptyDesc')}</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-[#143A28] text-white rounded-2xl p-5 sm:p-6 space-y-2">
                <p className="text-xs text-[#E6B85C] font-medium">
                  {result.sourceLabel} ·{' '}
                  {t('decision.topFitLabel', {
                    crop: translateCrop(state.language, result.topRecommendationCrop),
                  })}
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-semibold">
                  {t('decision.recommendedTitle')}
                </h2>
                <p className="text-sm text-[#D4E0D7] leading-relaxed">{result.summaryAdvice}</p>
              </div>

              <div className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#ECEAE3] bg-[#F8F7F4] text-xs font-semibold text-[#546358]">
                        <th className="py-3 px-4">{t('common.crop')}</th>
                        <th className="py-3 px-4">{t('decision.colInvestment')}</th>
                        <th className="py-3 px-4">{t('decision.colWater')}</th>
                        <th className="py-3 px-4">{t('decision.colDemand')}</th>
                        <th className="py-3 px-4">{t('decision.colRisk')}</th>
                        <th className="py-3 px-4">{t('decision.colPotential')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECEAE3] text-sm">
                      {result.comparisons.map((row) => (
                        <tr key={row.crop} className="hover:bg-[#F8F7F4]">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[#17231B]">
                              {translateCrop(state.language, row.crop)}
                            </p>
                            <p className="text-[11px] font-mono text-[#6A786E]">
                              {row.harvestCycleDays}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs tabular-nums">
                            {row.investmentBand}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#3D4E42]">
                            {translateStatus(state.language, row.waterRequirement)}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-[#17231B]">
                            {translateStatus(state.language, row.marketDemand)}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold">
                            <span
                              className={
                                row.riskLevel === 'High'
                                  ? 'text-[#B91C1C]'
                                  : row.riskLevel === 'Medium'
                                  ? 'text-[#B8860B]'
                                  : 'text-[#216B43]'
                              }
                            >
                              {translateStatus(state.language, row.riskLevel)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#143A28] font-medium">
                            {row.potentialOutlook}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-[#E5E2DA] rounded-2xl p-5 space-y-3">
                <h3 className="font-display text-lg font-semibold text-[#17231B]">
                  {t('decision.reasoningTitle')}
                </h3>
                <div className="divide-y divide-[#ECEAE3]">
                  {result.comparisons.map((item) => (
                    <div key={item.crop} className="py-3 first:pt-1 last:pb-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#143A28]">
                          {translateCrop(state.language, item.crop)}
                        </p>
                        <span className="text-xs font-mono tabular-nums text-[#546358]">
                          {t('decision.suitabilityScore', { score: item.suitabilityScore })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#3D4E42] mt-1 leading-relaxed">
                        {item.whyRecommended}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-[#5E6D63]">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{t('decision.disclaimer')}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
