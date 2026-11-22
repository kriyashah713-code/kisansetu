import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  MapPin,
  PackageCheck,
  Search,
  Send,
  X,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { CropGrade, CropListing } from '../types/kisansetu';
import { ResilientImage } from '../components/ResilientImage';
import { translateCrop } from '../i18n';

export const BuyerMarketplacePage: React.FC = () => {
  const { state, t, sendBuyerInquiryToFarmer, createOrderFromListing } = useKisanSetu();
  const navigate = useNavigate();

  const [cropFilter, setCropFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState<CropGrade | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLot, setSelectedLot] = useState<CropListing | null>(null);
  const [orderQty, setOrderQty] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [inquiryNote, setInquiryNote] = useState('');

  const visibleListings = state.listings.filter((lot) => {
    if (!lot.available || lot.moderationStatus === 'Rejected') return false;
    if (cropFilter !== 'ALL' && lot.crop.toLowerCase() !== cropFilter.toLowerCase()) return false;
    if (gradeFilter !== 'ALL' && lot.grade !== gradeFilter) return false;
    if (
      searchQuery.trim() &&
      !`${lot.farmerName} ${lot.crop} ${lot.location}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const openLotModal = (lot: CropListing) => {
    setSelectedLot(lot);
    setOrderQty(String(lot.quantityKg));
    setOfferPrice(String(lot.expectedPricePerKg));
    setInquiryNote(
      `${lot.quantityKg} kg Grade-${lot.grade} ${lot.crop} · ${lot.location}`
    );
  };

  const handleSendInquiry = () => {
    if (!selectedLot) return;
    sendBuyerInquiryToFarmer({
      listingId: selectedLot.id,
      farmerId: selectedLot.farmerId,
      farmerName: selectedLot.farmerName,
      crop: selectedLot.crop,
      grade: selectedLot.grade,
      offeredPricePerKg: Number(offerPrice) || selectedLot.expectedPricePerKg,
      requestedQtyKg: Number(orderQty) || selectedLot.quantityKg,
      message: inquiryNote,
    });
    setSelectedLot(null);
  };

  const handleCreateOrder = () => {
    if (!selectedLot) return;
    createOrderFromListing(
      selectedLot,
      Number(orderQty) || selectedLot.quantityKg,
      Number(offerPrice) || selectedLot.expectedPricePerKg
    );
    setSelectedLot(null);
    navigate('/orders');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#216B43]">{t('nav.browseSupply')}</p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-0.5">
          {t('buyer.browseTitle')}
        </h1>
        <p className="text-sm text-[#546358] mt-1">{t('buyer.browseSubtitle')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E5E2DA] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#6A786E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('buyer.filterLocation')}
            className="w-full min-h-[40px] pl-9 pr-3 rounded-lg border border-[#D8D4CA] text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Tomato', 'Wheat', 'Onion'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCropFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                cropFilter === c
                  ? 'bg-[#143A28] text-white'
                  : 'bg-[#F3F1EC] text-[#3D4E42] hover:bg-[#E7E4DC]'
              }`}
            >
              {c === 'ALL' ? t('market.allCrops') : translateCrop(state.language, c)}
            </button>
          ))}

          <div className="inline-flex items-center p-0.5 bg-[#ECEAE3] rounded-lg ml-1">
            {(['ALL', 'A', 'B'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGradeFilter(g)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  gradeFilter === g ? 'bg-white text-[#143A28]' : 'text-[#546358]'
                }`}
              >
                {g === 'ALL' ? t('buyer.anyGrade') : t('common.gradeLabel', { grade: g })}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {visibleListings.length === 0 ? (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl p-10 text-center text-sm text-[#546358]">
          {t('buyer.noSupplyFound')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleListings.map((lot) => (
            <div
              key={lot.id}
              className="bg-white border border-[#E5E2DA] rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <ResilientImage
                  src={lot.imageUrl}
                  alt={lot.crop}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#546358]">
                    <span className="inline-flex items-center gap-1 font-medium text-[#216B43]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('common.verifiedBadge')}
                    </span>
                    <span className="font-mono">{lot.harvestDate}</span>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-[#17231B]">
                    {translateCrop(state.language, lot.crop)} —{' '}
                    {t('common.gradeLabel', { grade: lot.grade })}
                  </h2>
                  <p className="text-xs text-[#3D4E42] font-medium">
                    {lot.farmerName} ·{' '}
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" /> {lot.location}
                    </span>
                  </p>
                  <p className="text-base font-mono tabular-nums font-bold text-[#143A28] pt-1">
                    {lot.quantityKg} {t('common.kg')} · ₹{lot.expectedPricePerKg}
                    {t('common.perKg')}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() => openLotModal(lot)}
                  className="w-full min-h-[42px] rounded-xl bg-[#143A28] hover:bg-[#1D4E37] text-white text-xs font-semibold cursor-pointer"
                >
                  {t('buyer.inspectOrderBtn')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lot Detail & Inquiry / Direct Order Modal */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="bg-white border border-[#E5E2DA] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#216B43] font-semibold">
                  {t('buyer.lotDetailsEyebrow')}
                </p>
                <h3 className="font-display text-xl font-semibold text-[#17231B]">
                  {translateCrop(state.language, selectedLot.crop)} (
                  {t('common.gradeLabel', { grade: selectedLot.grade })}) —{' '}
                  {selectedLot.farmerName}
                </h3>
                <p className="text-xs text-[#546358] mt-0.5">
                  {selectedLot.location} · {selectedLot.quantityKg} {t('common.kg')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLot(null)}
                aria-label={t('common.close')}
                className="p-2 text-[#546358] hover:bg-[#F3F1EC] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                  {t('buyer.inquiryQtyLabel')}
                </label>
                <input
                  type="number"
                  min="25"
                  max={selectedLot.quantityKg}
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                  {t('buyer.inquiryPriceLabel')}
                </label>
                <input
                  type="number"
                  min="5"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('buyer.inquiryMsgLabel')}
              </label>
              <textarea
                rows={3}
                value={inquiryNote}
                onChange={(e) => setInquiryNote(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#D8D4CA] text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSendInquiry}
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 rounded-xl border border-[#143A28] text-[#143A28] hover:bg-[#F3F1EC] text-xs font-semibold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('buyer.sendInquiryBtn')}</span>
              </button>
              <button
                type="button"
                onClick={handleCreateOrder}
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 rounded-xl bg-[#216B43] hover:bg-[#195434] text-white text-xs font-semibold cursor-pointer"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{t('buyer.orderConfirmBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
