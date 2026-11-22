import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  MapPin,
  Plus,
  Sprout,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { marketplaceService } from '../services/marketplaceService';
import { translateCrop, translateStatus } from '../i18n';

export const SupplyIntelligencePage: React.FC = () => {
  const { state, t, commitSupplyContribution } = useKisanSetu();
  const matches = marketplaceService.computeSupplyMatches(state.requirements);
  const [commitQty, setCommitQty] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <section className="bg-[#143A28] text-white rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[#E6B85C] font-semibold">
            {t('supply.bannerEyebrow')}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-balance">
            {t('supply.bannerTitle')}
          </h1>
          <p className="text-sm text-[#D4E0D7] leading-relaxed">{t('supply.bannerDesc')}</p>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-xl p-4 shrink-0 text-xs space-y-2">
          <p className="font-semibold text-[#E6B85C]">{t('supply.flowTitle')}</p>
          <div className="flex flex-wrap items-center gap-2 text-[#F8F7F4] font-medium">
            <span>{t('supply.flow1')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E6B85C]" />
            <span>{t('supply.flow2')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E6B85C]" />
            <span>{t('supply.flow3')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E6B85C]" />
            <span>{t('supply.flow4')}</span>
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#17231B]">
              {t('supply.corridorTitle')}
            </h2>
            <p className="text-xs text-[#546358]">{t('supply.corridorSubtitle')}</p>
          </div>
          <span className="text-xs font-mono text-[#216B43] font-semibold">
            {t('supply.corridorStats')}
          </span>
        </div>

        <div className="relative rounded-xl bg-[#F8F7F4] border border-[#ECEAE3] p-4 overflow-x-auto">
          <svg
            viewBox="0 0 760 190"
            className="w-full min-w-[540px] h-auto"
            role="img"
            aria-label={t('supply.corridorTitle')}
          >
            <path
              d="M 150 42 C 260 42, 310 95, 410 95"
              fill="none"
              stroke="#216B43"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <path
              d="M 150 95 L 410 95"
              fill="none"
              stroke="#216B43"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <path
              d="M 150 148 C 260 148, 310 95, 410 95"
              fill="none"
              stroke="#B8860B"
              strokeWidth="2.5"
            />
            <path d="M 480 95 L 600 95" fill="none" stroke="#143A28" strokeWidth="3" />

            {[
              { y: 42, label: 'Umreth · Farmer A', qty: `300 ${t('common.kg')} ${t('common.gradeLabel', { grade: 'A' })}` },
              { y: 95, label: 'Petlad · Farmer B', qty: `250 ${t('common.kg')} ${t('common.gradeLabel', { grade: 'A' })}` },
              { y: 148, label: `Borsad · ${state.profile.name.split(' ')[0]}`, qty: `450 ${t('common.kg')} ${t('common.gradeLabel', { grade: 'A' })}` },
            ].map((node, i) => (
              <g key={i}>
                <rect x="14" y={node.y - 20} width="220" height="40" rx="10" fill="#FFFFFF" stroke="#D8D4CA" />
                <circle cx="32" cy={node.y} r="5" fill={i === 2 ? '#B8860B' : '#216B43'} />
                <text x="45" y={node.y - 3} className="fill-[#17231B] text-[11px] font-semibold">
                  {node.label}
                </text>
                <text x="45" y={node.y + 11} className="fill-[#546358] text-[10px] font-mono">
                  {node.qty}
                </text>
              </g>
            ))}

            <rect x="370" y="65" width="130" height="60" rx="12" fill="#143A28" />
            <text x="435" y="90" textAnchor="middle" className="fill-white text-[11px] font-semibold">
              {t('supply.flow3')}
            </text>
            <text x="435" y="107" textAnchor="middle" className="fill-[#E6B85C] text-[11px] font-mono">
              1,000 {t('common.kg')}
            </text>

            <rect x="570" y="65" width="176" height="60" rx="12" fill="#FFFFFF" stroke="#216B43" strokeWidth="1.5" />
            <text x="658" y="90" textAnchor="middle" className="fill-[#143A28] text-[11px] font-semibold">
              {t('supply.flow4')}
            </text>
            <text x="658" y="107" textAnchor="middle" className="fill-[#216B43] text-[10px] font-mono">
              {t('supply.fulfilledPct', { pct: 100 })}
            </text>
          </svg>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-xl font-semibold text-[#17231B]">
          {t('supply.activeDemandsTitle')}
        </h2>
        {matches.map(({ requirement, totalAvailableKg, matchingPercentage, gapKg }) => {
          const inputVal = commitQty[requirement.id] ?? '150';
          return (
            <div
              key={requirement.id}
              className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-5"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#ECEAE3] pb-4">
                <div>
                  <p className="text-xs text-[#546358]">
                    {translateStatus(state.language, requirement.buyerType)} ·{' '}
                    {requirement.deliveryWindow}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#17231B] mt-0.5">
                    {requirement.buyerName}
                  </h2>
                  <p className="text-xs text-[#546358] mt-1 inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#216B43]" />
                    {requirement.location} · {requirement.indicativePriceRange}
                  </p>
                </div>

                <div className="flex items-center gap-5 shrink-0 font-mono tabular-nums">
                  <div>
                    <p className="text-[11px] text-[#5E6D63]">{t('supply.requiredPerWeek')}</p>
                    <p className="text-lg font-bold text-[#17231B]">
                      {requirement.requiredQtyKgPerWeek.toLocaleString()} {t('common.kg')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#5E6D63]">{t('supply.availableSupply')}</p>
                    <p className="text-lg font-bold text-[#216B43]">
                      {totalAvailableKg.toLocaleString()} {t('common.kg')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#5E6D63]">{t('supply.matchLabel')}</p>
                    <p className="text-lg font-bold text-[#143A28]">{matchingPercentage}%</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#3D4E42]">
                    {t('supply.poolReadiness', {
                      crop: translateCrop(state.language, requirement.crop),
                      grade: requirement.grade,
                    })}
                  </span>
                  <span className="font-mono tabular-nums text-[#546358]">
                    {gapKg === 0
                      ? t('supply.fullyMatchedLabel')
                      : t('supply.shortfallLabel', { qty: gapKg })}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#ECEAE3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#216B43] rounded-full transition-all duration-300"
                    style={{ width: `${matchingPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {requirement.contributions.map((c) => (
                  <div
                    key={c.farmerId}
                    className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3] flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[#17231B]">{c.farmerLabel}</p>
                        <p className="text-[11px] text-[#546358] mt-0.5">
                          {c.village} · {c.harvestWindow}
                        </p>
                      </div>
                      {c.verifiedFarmer && (
                        <CheckCircle2 className="w-4 h-4 text-[#216B43] shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-mono tabular-nums font-bold text-[#143A28] mt-2">
                      {c.quantityKg} {t('common.kg')} · {t('common.gradeLabel', { grade: c.grade })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#ECEAE3]">
                <p className="text-xs text-[#546358] inline-flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#216B43]" />
                  <span>{t('supply.commitPrompt')}</span>
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="25"
                    step="25"
                    value={inputVal}
                    onChange={(e) =>
                      setCommitQty((prev) => ({ ...prev, [requirement.id]: e.target.value }))
                    }
                    aria-label={t('marketplace.quantityLabel')}
                    className="w-24 min-h-[40px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      commitSupplyContribution(
                        requirement.id,
                        Math.max(25, Number(inputVal) || 100)
                      )
                    }
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#143A28] hover:bg-[#1D4E37] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('supply.contributeBtn', { qty: inputVal })}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="flex items-center gap-2 text-xs text-[#5E6D63]">
        <Sprout className="w-4 h-4 text-[#216B43]" />
        <span>{t('supply.footnote')}</span>
      </div>
    </div>
  );
};
