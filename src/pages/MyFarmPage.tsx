import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  Droplets,
  Layers,
  MapPin,
  ShoppingBag,
  Sprout,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { translateCrop, translateGrowthStage, translateStatus } from '../i18n';
import { ASSETS } from '../services/mockData';
import { ResilientImage } from '../components/ResilientImage';
import { SvgTrendChart } from '../components/SvgTrendChart';

export const MyFarmPage: React.FC = () => {
  const { state, t } = useKisanSetu();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Visual Farm Overview Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-[#143A28] text-white border border-[#0E2A1D]">
        <ResilientImage
          src={ASSETS.farmlandHero}
          alt={state.farm.name}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E2419]/95 via-[#143A28]/80 to-[#143A28]/55" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <ResilientImage
              src={state.profile.avatarUrl}
              alt={state.profile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/25 shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#D4E0D7]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E6B85C]" />
                  {state.profile.village}, {state.profile.district}, {state.profile.state}
                </span>
                {state.profile.verifiedFarmer && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[#A7F3D0] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('dashboard.verifiedFarmerPill')}
                    </span>
                  </>
                )}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold mt-1">
                {state.farm.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#C7D6CB] mt-1">
                {state.profile.name} · {state.farm.landSizeAcres} {t('common.acres')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/scanner')}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C48F29] hover:bg-[#B07E20] text-[#101D15] text-sm font-semibold cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{t('dashboard.scanCropBtn')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/12 hover:bg-white/20 text-white text-sm font-medium cursor-pointer"
            >
              <span>{t('nav.farmHistory')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Farm Specifications Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358]">{t('farm.landSize')}</p>
          <p className="font-display text-2xl font-semibold text-[#17231B] mt-1 tabular-nums">
            {state.farm.landSizeAcres} {t('common.acres')}
          </p>
        </div>
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#4A3728]" /> {t('farm.soilType')}
          </p>
          <p className="text-sm sm:text-base font-semibold text-[#17231B] mt-1.5">
            {state.farm.soilType}
          </p>
        </div>
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358] flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-[#2563EB]" /> {t('farm.irrigationType')}
          </p>
          <p className="text-sm sm:text-base font-semibold text-[#17231B] mt-1.5">
            {state.farm.irrigationType} ({translateStatus(state.language, state.farm.waterAvailability)})
          </p>
        </div>
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358] flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5 text-[#216B43]" /> {t('dashboard.kpiFarmHealth')}
          </p>
          <p className="font-display text-2xl font-semibold text-[#216B43] mt-1 tabular-nums">
            {state.farm.overallHealthScore}%
          </p>
        </div>
      </section>

      {/* Active Crops */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-[#17231B]">
            {t('farm.cropsListTitle', { count: state.crops.length })}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {state.crops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden flex flex-col sm:flex-row"
            >
              <ResilientImage
                src={crop.imageUrl}
                alt={crop.name}
                className="w-full sm:w-44 h-44 sm:h-auto object-cover shrink-0"
              />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-xs text-[#546358]">
                    {crop.variety} ·{' '}
                    <span className="font-mono tabular-nums">
                      {crop.areaAcres} {t('common.acres')}
                    </span>
                  </p>
                  <h3 className="font-display text-xl font-semibold text-[#17231B] mt-0.5">
                    {translateCrop(state.language, crop.name)}
                  </h3>
                  <p className="text-xs text-[#3D4E42] mt-1">
                    {t('farm.growthStageLabel')}:{' '}
                    <span className="font-medium">{translateGrowthStage(state.language, crop.growthStage)}</span>
                  </p>
                  <p className="text-xs text-[#546358] font-mono tabular-nums mt-0.5">
                    {t('dashboard.sowingLabel')}: {crop.sowingDate} · {t('dashboard.harvestLabel')}:{' '}
                    {crop.expectedHarvestDate}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#546358]">{t('dashboard.healthScoreLabel')}</span>
                    <span className="font-mono tabular-nums font-semibold text-[#143A28]">
                      {crop.healthScore}% · {translateStatus(state.language, crop.status)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#ECEAE3] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        crop.healthScore >= 85 ? 'bg-[#216B43]' : 'bg-[#B8860B]'
                      }`}
                      style={{ width: `${crop.healthScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/scanner')}
                    className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#216B43] hover:bg-[#195434] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t('dashboard.scanCropBtn')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/marketplace')}
                    className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D4CA] hover:bg-[#F3F1EC] text-xs font-semibold text-[#17231B] cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('nav.sellCrop')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Health Trend + Recent Scans */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-[#17231B]">
            {t('farm.healthTrendTitle')}
          </h2>
          <p className="text-xs text-[#546358] mt-0.5 mb-4">{t('farm.subtitle')}</p>
          <SvgTrendChart
            data={state.farm.healthHistory.map((h) => ({ label: h.week, value: h.score }))}
            unitSuffix="%"
            height={190}
          />
        </div>

        <div className="lg:col-span-6 bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#17231B]">
              {t('cropScan.recentScansTitle')}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/scanner')}
              className="text-xs font-semibold text-[#216B43] hover:underline cursor-pointer"
            >
              {t('dashboard.scanCropBtn')}
            </button>
          </div>

          <div className="divide-y divide-[#ECEAE3]">
            {state.scans.slice(0, 3).map((scan) => (
              <div key={scan.id} className="py-3 flex items-center gap-3.5">
                <ResilientImage
                  src={scan.imageUrl}
                  alt={scan.cropName}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#E5E2DA]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#17231B]">
                    {translateCrop(state.language, scan.cropName)} ·{' '}
                    {t('common.gradeLabel', { grade: scan.quality.suggestedGrade })}
                  </p>
                  <p className="text-xs text-[#546358] truncate mt-0.5">
                    {scan.disease.detected
                      ? scan.disease.possibleDisease
                      : translateStatus(state.language, 'Healthy')}
                  </p>
                  <p className="text-[11px] font-mono text-[#6A786E] mt-0.5">
                    {scan.scannedAt} · {t('cropScan.resultHealthScoreLabel')}: {scan.healthScore}/100
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
