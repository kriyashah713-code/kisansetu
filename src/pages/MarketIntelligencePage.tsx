import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Info, MapPin, ShoppingBag, TrendingUp } from 'lucide-react';
import { marketService } from '../services/marketService';
import { CropGrade, MarketPrice } from '../types/kisansetu';
import { SvgTrendChart } from '../components/SvgTrendChart';
import { useKisanSetu } from '../context/KisanSetuContext';
import { translateCrop, translateDay, translateStatus } from '../i18n';

export const MarketIntelligencePage: React.FC = () => {
  const { state, t } = useKisanSetu();
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState<'Tomato' | 'Wheat' | 'Onion'>('Tomato');
  const [selectedGrade, setSelectedGrade] = useState<CropGrade | 'ALL'>('ALL');
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [focusedMarket, setFocusedMarket] = useState<MarketPrice | null>(null);

  useEffect(() => {
    marketService.getMarketPrices(selectedCrop, selectedGrade).then((data) => {
      setPrices(data);
      setFocusedMarket(data[0] || null);
    });
  }, [selectedCrop, selectedGrade]);

  const minRange = prices.length ? Math.min(...prices.map((p) => p.minPricePerKg)) : 0;
  const maxRange = prices.length ? Math.max(...prices.map((p) => p.maxPricePerKg)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#216B43]">{t('nav.marketPulse')}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-0.5">
            {t('market.title')}
          </h1>
          <p className="text-sm text-[#546358] mt-1">{t('market.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#143A28] hover:bg-[#1D4E37] text-white text-xs font-semibold cursor-pointer self-start md:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('market.compareAction')}</span>
        </button>
      </div>

      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FEF9EC] border border-[#E8D5A3] text-xs text-[#4A3728]">
        <Info className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
        <p>{t('market.demoNotice')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#E5E2DA] rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#546358] mr-1">{t('market.filterCrop')}:</span>
          {(['Tomato', 'Wheat', 'Onion'] as const).map((crop) => (
            <button
              key={crop}
              type="button"
              onClick={() => setSelectedCrop(crop)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCrop === crop
                  ? 'bg-[#143A28] text-white'
                  : 'bg-[#F3F1EC] text-[#3D4E42] hover:bg-[#E7E4DC]'
              }`}
            >
              {translateCrop(state.language, crop)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#ECEAE3] rounded-lg">
          {(['ALL', 'A', 'B'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGrade(g)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                selectedGrade === g
                  ? 'bg-white text-[#143A28] shadow-xs'
                  : 'text-[#546358] hover:text-[#17231B]'
              }`}
            >
              {g === 'ALL' ? t('market.allGrades') : t('common.gradeLabel', { grade: g })}
            </button>
          ))}
        </div>
      </div>

      {/* Summary + Interactive Trend Chart */}
      {prices.length === 0 ? (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl p-8 text-center text-sm text-[#546358]">
          {t('market.noResults')}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <p className="text-xs text-[#546358]">
                {translateCrop(state.language, selectedCrop)} ·{' '}
                {selectedGrade === 'ALL'
                  ? t('market.allGrades')
                  : t('common.gradeLabel', { grade: selectedGrade })}{' '}
                · {t('market.demoEstimateTag')}
              </p>
              <h2 className="font-display text-3xl font-semibold text-[#17231B] mt-1 tabular-nums">
                ₹{minRange}–₹{maxRange}
                {t('common.perKg')}
              </h2>
              <p className="text-xs text-[#216B43] font-medium mt-1 inline-flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {t('market.demandPulseCard')}:{' '}
                {focusedMarket ? translateStatus(state.language, focusedMarket.demand) : ''} ·{' '}
                {focusedMarket ? translateStatus(state.language, focusedMarket.trend) : ''}
              </p>
            </div>

            <div className="border-t border-[#ECEAE3] pt-4 space-y-2.5">
              <p className="text-xs font-semibold text-[#546358]">{t('market.strategyLabel')}</p>
              <p className="text-sm text-[#3D4E42] leading-relaxed">{t('market.strategyNote')}</p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#17231B]">
                  {t('market.priceTrendTitle')} — {focusedMarket?.marketName}
                </h2>
                <p className="text-xs text-[#546358]">{focusedMarket?.updatedAt}</p>
              </div>
              <span className="text-xs font-mono tabular-nums font-semibold text-[#216B43]">
                +{focusedMarket?.changePct7d}% ({t('market.tableChange7d')})
              </span>
            </div>

            <SvgTrendChart
              data={(focusedMarket?.history14d || []).map((h) => ({
                label: translateDay(state.language, h.day),
                value: h.price,
              }))}
              unitPrefix="₹"
              unitSuffix={t('common.perKg')}
              height={190}
            />
          </div>
        </div>
      )}

      {/* Nearby Markets Comparison Table */}
      {prices.length > 0 && (
        <section className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#ECEAE3] flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-[#17231B]">
              {t('market.nearbyTableTitle')}
            </h2>
            <span className="text-xs text-[#546358]">{t('market.clickToInspect')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECEAE3] bg-[#F8F7F4] text-xs font-semibold text-[#546358]">
                  <th className="py-3 px-5">{t('market.tableMarket')}</th>
                  <th className="py-3 px-4">{t('market.tableGrade')}</th>
                  <th className="py-3 px-4 text-right">{t('market.tableDistance')}</th>
                  <th className="py-3 px-4 text-right">{t('market.tableMinMax')}</th>
                  <th className="py-3 px-4 text-right">{t('market.tableModal')}</th>
                  <th className="py-3 px-4">{t('market.demandPulseCard')}</th>
                  <th className="py-3 px-5">{t('market.tableDemand')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE3] text-sm">
                {prices.map((item) => {
                  const isFocused = focusedMarket?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setFocusedMarket(item)}
                      className={`cursor-pointer transition-colors ${
                        isFocused ? 'bg-[#216B43]/6' : 'hover:bg-[#F8F7F4]'
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-[#17231B]">{item.marketName}</p>
                        <p className="text-xs text-[#5E6D63] inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.location}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold">
                        {t('common.gradeLabel', { grade: item.grade })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs text-[#546358]">
                        {item.distanceKm} km
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        ₹{item.minPricePerKg}–₹{item.maxPricePerKg}
                        {t('common.perKg')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-[#143A28]">
                        ₹{item.modalPricePerKg}
                        {t('common.perKg')}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#17231B]">
                        {translateStatus(state.language, item.demand)}
                      </td>
                      <td className="py-3.5 px-5 text-xs font-semibold text-[#216B43]">
                        <span className="inline-flex items-center gap-1">
                          {translateStatus(state.language, item.trend)}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
