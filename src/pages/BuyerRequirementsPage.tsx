import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  MapPin,
  Plus,
  Send,
  Sprout,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { marketplaceService } from '../services/marketplaceService';
import { CropGrade } from '../types/kisansetu';
import { translateCrop } from '../i18n';

export const BuyerRequirementsPage: React.FC = () => {
  const { state, t, addBuyerRequirement, sendBuyerInquiryToFarmer } = useKisanSetu();

  const [showForm, setShowForm] = useState(true);
  const [crop, setCrop] = useState('Tomato');
  const [quantityKg, setQuantityKg] = useState('1000');
  const [minGrade, setMinGrade] = useState<CropGrade>('A');
  const [preferredLocation, setPreferredLocation] = useState('Ahmedabad, Gujarat');
  const [maxPricePerKg, setMaxPricePerKg] = useState('34');
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState('2026-11-28');
  const [additionalNotes, setAdditionalNotes] = useState(
    'Sorted ventilated crates, firm turning-red maturity, minimal surface blemishes.'
  );
  const [formError, setFormError] = useState('');
  const [justPublishedId, setJustPublishedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const qty = Number(quantityKg);
    const maxP = Number(maxPricePerKg);
    if (
      !crop.trim() ||
      qty <= 0 ||
      maxP <= 0 ||
      !preferredLocation.trim() ||
      !requiredDeliveryDate
    ) {
      setFormError(t('validation.requiredFields'));
      return;
    }

    const created = addBuyerRequirement({
      crop,
      quantityKg: qty,
      minGrade,
      preferredLocation,
      maxPricePerKg: maxP,
      requiredDeliveryDate,
      additionalNotes,
    });
    setJustPublishedId(created.id);
    setShowForm(false);
  };

  const matches = marketplaceService.computeSupplyMatches(state.requirements);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#216B43]">{t('nav.requirements')}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-0.5">
            {t('buyer.reqPageTitle')}
          </h1>
          <p className="text-sm text-[#546358] mt-1">{t('buyer.reqPageSubtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#216B43] hover:bg-[#195434] text-white text-xs font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? t('buyer.postReqBtnHide') : t('buyer.postReqBtn')}</span>
        </button>
      </div>

      {justPublishedId && (
        <div className="p-4 rounded-xl bg-[#216B43]/10 border border-[#216B43]/30 flex items-center gap-3 text-sm text-[#143A28]">
          <CheckCircle2 className="w-5 h-5 text-[#216B43] shrink-0" />
          <p className="font-semibold">{t('buyer.successBanner')}</p>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#143A28]" />
            <h2 className="font-display text-xl font-semibold text-[#17231B]">
              {t('buyer.formTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('buyer.fieldCrop')}
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm bg-white"
              >
                {(['Tomato', 'Wheat', 'Onion', 'Potato'] as const).map((c) => (
                  <option key={c} value={c}>
                    {translateCrop(state.language, c)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('buyer.fieldQty')}
              </label>
              <input
                type="number"
                min="50"
                step="50"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('buyer.fieldGrade')}
              </label>
              <select
                value={minGrade}
                onChange={(e) => setMinGrade(e.target.value as CropGrade)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm bg-white"
              >
                <option value="A">{t('common.gradeLabel', { grade: 'A' })}</option>
                <option value="B">{t('common.gradeLabel', { grade: 'B' })}</option>
                <option value="C">{t('common.gradeLabel', { grade: 'C' })}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('buyer.fieldLocation')}
              </label>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('buyer.fieldMaxPrice')}
              </label>
              <input
                type="number"
                min="5"
                value={maxPricePerKg}
                onChange={(e) => setMaxPricePerKg(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('buyer.fieldDeliveryDate')}
              </label>
              <input
                type="date"
                value={requiredDeliveryDate}
                onChange={(e) => setRequiredDeliveryDate(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
              {t('buyer.fieldNotes')}
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#D8D4CA] text-sm"
            />
          </div>

          {formError && <p className="text-xs font-medium text-[#B91C1C]">{formError}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#143A28] hover:bg-[#1D4E37] text-white text-sm font-semibold cursor-pointer"
            >
              {t('buyer.submitReqBtn')}
            </button>
          </div>
        </form>
      )}

      <section className="space-y-5">
        {matches.map(({ requirement, totalAvailableKg, matchingPercentage, gapKg }) => {
          const matchedLots = marketplaceService.findMatchingFarmerLots(
            requirement,
            state.listings
          );
          return (
            <div
              key={requirement.id}
              className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-5"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#ECEAE3] pb-4">
                <div>
                  <p className="text-xs text-[#546358]">
                    {requirement.buyerName} · {requirement.deliveryWindow}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#17231B] mt-0.5">
                    {requirement.requiredQtyKgPerWeek.toLocaleString()} {t('common.kg')}{' '}
                    {t('common.gradeLabel', { grade: requirement.grade })}{' '}
                    {translateCrop(state.language, requirement.crop)}
                  </h2>
                  <p className="text-xs text-[#546358] mt-1 inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#216B43]" />
                    <span>{requirement.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{requirement.indicativePriceRange}</span>
                  </p>
                  {requirement.additionalNotes && (
                    <p className="text-xs text-[#3D4E42] mt-1.5">{requirement.additionalNotes}</p>
                  )}
                </div>

                <div className="flex items-center gap-5 shrink-0 font-mono tabular-nums">
                  <div>
                    <p className="text-[11px] text-[#5E6D63]">{t('buyer.kpiMatchedSupply')}</p>
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
                    {t('buyer.matchFactorsLabel')}
                  </span>
                  <span className="font-mono text-[#546358]">
                    {gapKg === 0
                      ? t('supply.fullyMatchedLabel')
                      : t('buyer.shortfallNote', { qty: gapKg })}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#ECEAE3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#216B43] rounded-full transition-all"
                    style={{ width: `${matchingPercentage}%` }}
                  />
                </div>
              </div>

              {matchedLots.length === 0 ? (
                <p className="text-xs text-[#5E6D63] py-2">{t('buyer.noMatchedLots')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {matchedLots.map(({ listing, matchScore, factors }) => (
                    <div
                      key={listing.id}
                      className="p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3] flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#143A28] inline-flex items-center gap-1">
                            <Sprout className="w-3.5 h-3.5 text-[#216B43]" />
                            {listing.farmerName}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-[#216B43]">
                            {t('buyer.matchScoreTag', { score: matchScore })}
                          </span>
                        </div>
                        <p className="text-sm font-mono tabular-nums font-bold text-[#17231B] mt-1.5">
                          {listing.quantityKg} {t('common.kg')} ·{' '}
                          {t('common.gradeLabel', { grade: listing.grade })}
                        </p>
                        <p className="text-[11px] text-[#546358] mt-1">{factors.locationMatch}</p>
                        <p className="text-[11px] text-[#546358]">{factors.dateMatch}</p>
                        <p className="text-[11px] text-[#143A28] font-medium mt-0.5">
                          {factors.priceFit}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          sendBuyerInquiryToFarmer({
                            listingId: listing.id,
                            requirementId: requirement.id,
                            farmerId: listing.farmerId,
                            farmerName: listing.farmerName,
                            crop: listing.crop,
                            grade: listing.grade,
                            offeredPricePerKg: Math.min(
                              requirement.maxPricePerKg || listing.expectedPricePerKg,
                              listing.expectedPricePerKg
                            ),
                            requestedQtyKg: Math.min(
                              listing.quantityKg,
                              requirement.requiredQtyKgPerWeek
                            ),
                            message: `Requirement: ${requirement.requiredQtyKgPerWeek} kg Grade-${requirement.grade} ${requirement.crop} (${requirement.location}).`,
                          })
                        }
                        className="min-h-[38px] w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#143A28] hover:bg-[#1D4E37] text-white text-xs font-semibold cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('buyer.inquirySubmitBtn')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};
