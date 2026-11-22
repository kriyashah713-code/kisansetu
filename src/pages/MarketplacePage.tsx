import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Info,
  MessageSquare,
  Plus,
  Send,
  ShoppingBag,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { ASSETS } from '../services/mockData';
import { marketplaceService } from '../services/marketplaceService';
import { Buyer, CropGrade } from '../types/kisansetu';
import { ResilientImage } from '../components/ResilientImage';
import { translateCrop, translateStatus } from '../i18n';

export const MarketplacePage: React.FC = () => {
  const { state, t, addCropListing, updateInquiryStatus, sendInquiryReply, pushToast } =
    useKisanSetu();
  const buyers = marketplaceService.getBuyers();

  const [tab, setTab] = useState<'listings' | 'buyers' | 'requirements' | 'inquiries'>('listings');
  const [buyerTypeFilter, setBuyerTypeFilter] = useState<string>('ALL');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [crop, setCrop] = useState('Tomato');
  const [quantityKg, setQuantityKg] = useState('350');
  const [grade, setGrade] = useState<CropGrade>('A');
  const [harvestDate, setHarvestDate] = useState('2026-12-03');
  const [expectedPrice, setExpectedPrice] = useState('32');
  const [formError, setFormError] = useState('');

  const [contactBuyer, setContactBuyer] = useState<Buyer | null>(null);
  const [outreachMsg, setOutreachMsg] = useState('');

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const qty = Number(quantityKg);
    const price = Number(expectedPrice);
    if (!crop.trim() || qty <= 0 || price <= 0 || !harvestDate) {
      setFormError(t('validation.requiredFields'));
      return;
    }

    const img = crop.toLowerCase().includes('wheat') ? ASSETS.wheatGolden : ASSETS.tomatoHealthy;
    addCropListing({
      crop,
      quantityKg: qty,
      grade,
      harvestDate,
      location: `${state.profile.village}, ${state.profile.district} (${state.profile.state})`,
      expectedPricePerKg: price,
      imageUrl: img,
      available: true,
    });
    setShowCreateForm(false);
  };

  const filteredBuyers =
    buyerTypeFilter === 'ALL' ? buyers : buyers.filter((b) => b.type === buyerTypeFilter);

  const handleSendOutreach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactBuyer || !outreachMsg.trim()) return;
    sendInquiryReply(contactBuyer.id, state.listings[0]?.id || 'list-01', outreachMsg.trim());
    setContactBuyer(null);
    setOutreachMsg('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#216B43]">{t('nav.sellCrop')}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-0.5">
            {t('marketplace.title')}
          </h1>
          <p className="text-sm text-[#546358] mt-1">{t('marketplace.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#216B43] hover:bg-[#195434] text-white text-sm font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>
            {showCreateForm ? t('marketplace.closeForm') : t('marketplace.createListingBtn')}
          </span>
        </button>
      </div>

      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E5E2DA] text-xs text-[#4A5A4F]">
        <Info className="w-4 h-4 text-[#216B43] shrink-0 mt-0.5" />
        <p>{t('marketplace.prototypeNote')}</p>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateListing}
          className="bg-white border border-[#216B43]/35 rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <h2 className="font-display text-xl font-semibold text-[#17231B]">
            {t('marketplace.formTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('marketplace.cropLabel')}
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
                {t('marketplace.quantityLabel')}
              </label>
              <input
                type="number"
                min="20"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('marketplace.gradeLabel')}
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as CropGrade)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm bg-white"
              >
                <option value="A">{t('common.gradeLabel', { grade: 'A' })}</option>
                <option value="B">{t('common.gradeLabel', { grade: 'B' })}</option>
                <option value="C">{t('common.gradeLabel', { grade: 'C' })}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('marketplace.expectedPriceLabel')}
              </label>
              <input
                type="number"
                min="1"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('marketplace.harvestDateLabel')}
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono"
              />
            </div>
          </div>

          {formError && <p className="text-xs font-medium text-[#B91C1C]">{formError}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="min-h-[42px] px-4 rounded-lg border border-[#D8D4CA] text-xs font-semibold cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="min-h-[42px] px-5 rounded-lg bg-[#143A28] text-white text-xs font-semibold cursor-pointer"
            >
              {t('marketplace.submitListingBtn')}
            </button>
          </div>
        </form>
      )}

      {/* Navigation Tabs */}
      <div className="inline-flex flex-wrap gap-1 p-1 bg-[#ECEAE3] rounded-xl">
        {(
          [
            { id: 'listings', label: t('marketplace.tabListings', { count: state.listings.length }) },
            {
              id: 'requirements',
              label: t('marketplace.tabRequirements', { count: state.requirements.length }),
            },
            { id: 'inquiries', label: t('marketplace.tabInquiries', { count: state.inquiries.length }) },
            { id: 'buyers', label: t('marketplace.tabBuyers', { count: buyers.length }) },
          ] as const
        ).map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              tab === tabItem.id
                ? 'bg-white text-[#143A28] shadow-xs'
                : 'text-[#546358] hover:text-[#17231B]'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Active Crop Listings */}
      {tab === 'listings' &&
        (state.listings.length === 0 ? (
          <div className="bg-white border border-[#E5E2DA] rounded-2xl p-8 text-center text-sm text-[#546358]">
            {t('marketplace.noListings')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {state.listings.map((lot) => (
              <div
                key={lot.id}
                className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden flex flex-col sm:flex-row"
              >
                <ResilientImage
                  src={lot.imageUrl}
                  alt={lot.crop}
                  className="w-full sm:w-44 h-44 sm:h-auto object-cover shrink-0"
                />
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-xs text-[#546358]">
                      {lot.farmerName} · {lot.location}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-[#17231B] mt-0.5">
                      {translateCrop(state.language, lot.crop)} —{' '}
                      {t('common.gradeLabel', { grade: lot.grade })}
                    </h3>
                    <p className="text-sm font-mono tabular-nums font-semibold text-[#143A28] mt-1">
                      {lot.quantityKg} {t('common.kg')} · ₹{lot.expectedPricePerKg}
                      {t('common.perKg')}
                    </p>
                    <p className="text-xs text-[#546358] mt-1 font-mono">
                      {lot.harvestDate} ·{' '}
                      {lot.available ? t('marketplace.availableTag') : t('marketplace.reservedTag')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#ECEAE3]">
                    <span className="text-xs font-medium text-[#216B43]">
                      {t('marketplace.interestedBuyers', { count: lot.inquiriesCount })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTab('inquiries')}
                      className="text-xs font-semibold text-[#143A28] hover:underline cursor-pointer"
                    >
                      {t('marketplace.viewInquiries')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* TAB 2: Open Buyer Requirements */}
      {tab === 'requirements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.requirements.map((req) => {
            const matchedKg = req.contributions.reduce((s, c) => s + c.quantityKg, 0);
            const pct = Math.min(
              100,
              Math.round((matchedKg / Math.max(1, req.requiredQtyKgPerWeek)) * 100)
            );
            return (
              <div key={req.id} className="bg-white border border-[#E5E2DA] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#216B43]">
                    {translateStatus(state.language, req.buyerType)}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#143A28]">
                    {t('supply.fulfilledPct', { pct })}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-[#17231B]">
                  {req.buyerName} — {translateCrop(state.language, req.crop)} (
                  {t('common.gradeLabel', { grade: req.grade })})
                </h3>
                <p className="text-xs text-[#546358]">
                  {t('buyer.requiredLabel', { qty: req.requiredQtyKgPerWeek.toLocaleString() })} ·{' '}
                  {req.location} · {req.deliveryWindow}
                </p>
                <p className="text-xs font-semibold text-[#143A28]">{req.indicativePriceRange}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Buyers Directory */}
      {tab === 'buyers' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'Agritech Company', 'Retailer', 'FPO', 'Processor', 'Restaurant'].map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBuyerTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    buyerTypeFilter === type
                      ? 'bg-[#143A28] text-white'
                      : 'bg-white border border-[#D8D4CA] text-[#3D4E42]'
                  }`}
                >
                  {type === 'ALL'
                    ? t('marketplace.allBuyerTypes')
                    : translateStatus(state.language, type)}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBuyers.map((buyer) => (
              <div
                key={buyer.id}
                className="bg-white border border-[#E5E2DA] rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#546358] inline-flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {translateStatus(state.language, buyer.type)}
                    </span>
                    {buyer.verifiedBuyer && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#216B43]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('common.verifiedBadge')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#17231B] mt-1">
                    {buyer.name}
                  </h3>
                  <p className="text-xs text-[#546358] mt-0.5">{buyer.location}</p>
                  <p className="text-xs text-[#3D4E42] mt-2">
                    {t('marketplace.lookingForLabel')}:{' '}
                    <strong>
                      {buyer.lookingFor.map((c) => translateCrop(state.language, c)).join(', ')}
                    </strong>{' '}
                    ({t('common.gradeLabel', { grade: buyer.preferredGrade })})
                  </p>
                  <p className="text-xs text-[#6A786E] mt-1">{buyer.ratingNote}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setContactBuyer(buyer);
                    setOutreachMsg(
                      `Namaste, I have Grade-${buyer.preferredGrade} ${buyer.lookingFor[0]} ready near ${state.profile.village}.`
                    );
                  }}
                  className="min-h-[42px] w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#F3F1EC] hover:bg-[#143A28] hover:text-white text-[#143A28] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('marketplace.sendHarvestInquiry')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Incoming Buyer Inquiries */}
      {tab === 'inquiries' && (
        <div className="space-y-4">
          {state.inquiries.length === 0 ? (
            <div className="bg-white border border-[#E5E2DA] rounded-2xl p-8 text-center">
              <ShoppingBag className="w-8 h-8 text-[#6A786E] mx-auto mb-2" />
              <p className="text-sm text-[#546358]">{t('marketplace.noInquiries')}</p>
            </div>
          ) : (
            state.inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white border border-[#E5E2DA] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#546358]">
                    <span className="font-semibold text-[#143A28]">{inq.buyerName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{translateStatus(state.language, inq.buyerType)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{inq.createdAt}</span>
                  </div>
                  <p className="text-base font-semibold text-[#17231B]">
                    {translateCrop(state.language, inq.crop)} — {inq.requestedQtyKg}{' '}
                    {t('common.kg')} @ ₹{inq.offeredPricePerKg}
                    {t('common.perKg')}
                  </p>
                  <p className="text-sm text-[#3D4E42]">{inq.message}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold mr-1 ${
                      inq.status === 'Accepted'
                        ? 'text-[#216B43]'
                        : inq.status === 'Rejected'
                        ? 'text-[#B91C1C]'
                        : 'text-[#546358]'
                    }`}
                  >
                    {t('common.status')}: {translateStatus(state.language, inq.status)}
                  </span>
                  {inq.status !== 'Accepted' && inq.status !== 'Rejected' && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateInquiryStatus(inq.id, 'Accepted')}
                        className="min-h-[40px] px-4 py-2 rounded-lg bg-[#216B43] hover:bg-[#195434] text-white text-xs font-semibold cursor-pointer"
                      >
                        {t('marketplace.acceptOfferBtn')}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateInquiryStatus(inq.id, 'Rejected')}
                        className="min-h-[40px] px-3 py-2 rounded-lg border border-[#FCA5A5] text-[#B91C1C] hover:bg-[#FEF2F2] text-xs font-semibold cursor-pointer"
                      >
                        {t('marketplace.declineOfferBtn')}
                      </button>
                    </>
                  )}
                  {inq.status === 'New' && (
                    <button
                      type="button"
                      onClick={() => {
                        updateInquiryStatus(inq.id, 'Responded');
                        pushToast({ title: t('marketplace.callbackRequested'), variant: 'info' });
                      }}
                      className="min-h-[40px] px-3 py-2 rounded-lg border border-[#D8D4CA] text-xs font-semibold cursor-pointer"
                    >
                      {t('marketplace.markResponded')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Direct Outreach Drawer/Modal */}
      {contactBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <form
            onSubmit={handleSendOutreach}
            className="bg-white border border-[#E5E2DA] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-display text-xl font-semibold text-[#17231B]">
              {t('buyer.inquiryModalTitle', { farmer: contactBuyer.name })}
            </h3>
            <p className="text-xs text-[#546358]">{contactBuyer.location}</p>
            <textarea
              rows={4}
              value={outreachMsg}
              onChange={(e) => setOutreachMsg(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#D8D4CA] text-sm"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setContactBuyer(null)}
                className="min-h-[42px] px-4 rounded-lg border border-[#D8D4CA] text-xs font-semibold cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="min-h-[42px] inline-flex items-center gap-1.5 px-5 rounded-lg bg-[#143A28] text-white text-xs font-semibold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('buyer.inquirySubmitBtn')}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
