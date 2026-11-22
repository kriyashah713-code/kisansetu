import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Edit3,
  PackageCheck,
  ShoppingBag,
  Sprout,
  Truck,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { marketplaceService } from '../services/marketplaceService';
import { getGreeting, translateCrop, translateStatus } from '../i18n';

export const BuyerDashboardPage: React.FC = () => {
  const { state, t, updateBuyerProfile } = useKisanSetu();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState(false);
  const [companyName, setCompanyName] = useState(state.buyerProfile.companyName);
  const [location, setLocation] = useState(state.buyerProfile.location);

  const myRequirements = state.requirements.filter(
    (r) => r.buyerId === state.buyerProfile.id || r.buyerName === state.buyerProfile.companyName
  );
  const supplyMatches = marketplaceService.computeSupplyMatches(myRequirements);
  const totalAvailableMatchingKg = supplyMatches.reduce((sum, m) => sum + m.totalAvailableKg, 0);

  const activeListings = state.listings.filter(
    (l) => l.available && l.moderationStatus !== 'Rejected'
  );
  const pendingInquiries = state.inquiries.filter(
    (i) =>
      i.buyerName === state.buyerProfile.companyName &&
      (i.status === 'New' || i.status === 'Responded')
  );
  const activeOrders = state.orders.filter((o) => o.status !== 'Completed');
  const completedOrders = state.orders.filter((o) => o.status === 'Completed');
  const activeTransport = state.transportRequests.filter((tReq) => tReq.status !== 'Delivered');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBuyerProfile({ companyName, location });
    setEditingProfile(false);
  };

  return (
    <div className="space-y-6">
      {/* Buyer Hero Header */}
      <section className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#143A28] text-white flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-[#E6B85C]" />
          </div>
          <div>
            <p className="text-xs text-[#546358] flex flex-wrap items-center gap-1.5">
              <span>{translateStatus(state.language, state.buyerProfile.type)}</span>
              <span aria-hidden="true">·</span>
              <span>{state.buyerProfile.location}</span>
              {state.buyerProfile.verifiedBuyer && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-[#216B43] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('common.verifiedBadge')}
                  </span>
                </>
              )}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-1">
              {getGreeting(state.language, state.buyerProfile.companyName)}
            </h1>
            <p className="text-sm text-[#546358] mt-1">
              {t('buyer.activeReqSummary', { count: myRequirements.length })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setEditingProfile((v) => !v)}
            className="min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8D4CA] hover:bg-[#F3F1EC] text-xs font-semibold cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('buyer.editProfileBtn')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/buyer/requirements')}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#216B43] hover:bg-[#195434] text-white text-xs font-semibold cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>{t('buyer.postReqBtn')}</span>
          </button>
        </div>
      </section>

      {editingProfile && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white border border-[#216B43]/35 rounded-2xl p-5 grid sm:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
              {t('buyer.companyLabel')}
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
              {t('buyer.procLocLabel')}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="min-h-[42px] px-4 rounded-lg bg-[#143A28] text-white text-xs font-semibold cursor-pointer"
            >
              {t('buyer.saveProfileBtn')}
            </button>
            <button
              type="button"
              onClick={() => setEditingProfile(false)}
              className="min-h-[42px] px-4 rounded-lg border border-[#D8D4CA] text-xs font-semibold cursor-pointer"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* 6 Core Buyer KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/buyer/requirements')}
          className="text-left bg-white border border-[#E5E2DA] hover:border-[#216B43]/50 rounded-2xl p-5 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#546358]">
            <span>{t('buyer.kpiActiveReq')}</span>
            <ClipboardList className="w-4 h-4 text-[#216B43]" />
          </div>
          <p className="font-display text-3xl font-semibold text-[#17231B] mt-3 tabular-nums">
            {myRequirements.length}
          </p>
          <p className="text-xs text-[#546358] mt-1">
            {myRequirements[0]
              ? `${translateCrop(state.language, myRequirements[0].crop)} · ${myRequirements[0].requiredQtyKgPerWeek.toLocaleString()} ${t('common.kg')} (${t('common.gradeLabel', { grade: myRequirements[0].grade })})`
              : t('buyer.postReqBtn')}
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/buyer/requirements')}
          className="text-left bg-white border border-[#E5E2DA] hover:border-[#216B43]/50 rounded-2xl p-5 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#546358]">
            <span>{t('buyer.kpiMatchedSupply')}</span>
            <Sprout className="w-4 h-4 text-[#216B43]" />
          </div>
          <p className="font-display text-3xl font-semibold text-[#216B43] mt-3 tabular-nums">
            {totalAvailableMatchingKg.toLocaleString()} {t('common.kg')}
          </p>
          <p className="text-xs text-[#546358] mt-1">
            {t('supply.matchedFarmersCount', { count: activeListings.length })}
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/buyer/marketplace')}
          className="text-left bg-white border border-[#E5E2DA] hover:border-[#216B43]/50 rounded-2xl p-5 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#546358]">
            <span>{t('buyer.kpiPendingInquiries')}</span>
            <ShoppingBag className="w-4 h-4 text-[#B8860B]" />
          </div>
          <p className="font-display text-3xl font-semibold text-[#17231B] mt-3 tabular-nums">
            {pendingInquiries.length}
          </p>
          <p className="text-xs text-[#546358] mt-1">{t('buyer.browseSupplyBtn')}</p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="text-left bg-white border border-[#E5E2DA] hover:border-[#216B43]/50 rounded-2xl p-5 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#546358]">
            <span>{t('buyer.kpiActiveOrders')}</span>
            <PackageCheck className="w-4 h-4 text-[#143A28]" />
          </div>
          <p className="font-display text-3xl font-semibold text-[#17231B] mt-3 tabular-nums">
            {activeOrders.length}
          </p>
          <p className="text-xs text-[#546358] mt-1">
            {activeOrders[0]
              ? `#${activeOrders[0].orderNumber} · ${translateStatus(state.language, activeOrders[0].status)}`
              : t('buyer.browseSupplyBtn')}
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/transport')}
          className="text-left bg-white border border-[#E5E2DA] hover:border-[#216B43]/50 rounded-2xl p-5 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#546358]">
            <span>{t('buyer.kpiInTransit')}</span>
            <Truck className="w-4 h-4 text-[#216B43]" />
          </div>
          <p className="font-display text-3xl font-semibold text-[#17231B] mt-3 tabular-nums">
            {activeTransport.length}
          </p>
          <p className="text-xs text-[#546358] mt-1">
            {activeTransport[0]
              ? `#${activeTransport[0].orderNumber} · ${translateStatus(state.language, activeTransport[0].status)}`
              : t('transport.emptyJobs')}
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="text-left bg-white border border-[#E5E2DA] hover:border-[#216B43]/50 rounded-2xl p-5 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#546358]">
            <span>{t('buyer.kpiCompleted')}</span>
            <CheckCircle2 className="w-4 h-4 text-[#216B43]" />
          </div>
          <p className="font-display text-3xl font-semibold text-[#17231B] mt-3 tabular-nums">
            {completedOrders.length}
          </p>
          <p className="text-xs text-[#546358] mt-1">{t('orders.filterCompleted')}</p>
        </button>
      </section>

      {/* Active Requirement & Matching Preview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#17231B]">
              {t('buyer.reqOverviewTitle')}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/buyer/requirements')}
              className="text-xs font-semibold text-[#216B43] inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>{t('buyer.manageAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {supplyMatches.map(({ requirement, totalAvailableKg, matchingPercentage }) => (
              <div
                key={requirement.id}
                className="p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3] space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#17231B]">
                      {translateCrop(state.language, requirement.crop)} ·{' '}
                      {t('common.gradeLabel', { grade: requirement.grade })}
                    </p>
                    <p className="text-xs text-[#546358]">
                      {t('buyer.requiredLabel', {
                        qty: requirement.requiredQtyKgPerWeek.toLocaleString(),
                      })}{' '}
                      · {requirement.deliveryWindow}
                    </p>
                  </div>
                  <span className="text-xs font-mono tabular-nums font-bold text-[#216B43]">
                    {t('supply.fulfilledPct', { pct: matchingPercentage })} ({totalAvailableKg}{' '}
                    {t('common.kg')})
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E5E2DA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#216B43] rounded-full"
                    style={{ width: `${matchingPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#17231B]">
              {t('buyer.activeOrdersTitle')}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="text-xs font-semibold text-[#216B43] hover:underline cursor-pointer"
            >
              {t('buyer.viewOrders')}
            </button>
          </div>

          <div className="divide-y divide-[#ECEAE3]">
            {state.orders.slice(0, 3).map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#17231B]">
                    #{ord.orderNumber} · {translateCrop(state.language, ord.crop)} ({ord.quantityKg}{' '}
                    {t('common.kg')})
                  </p>
                  <p className="text-xs text-[#546358] truncate">
                    {t('buyer.fromFarmer', { farmer: ord.farmerName })} · ₹{ord.pricePerKg}
                    {t('common.perKg')}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#216B43] whitespace-nowrap">
                  {translateStatus(state.language, ord.status)}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('/buyer/marketplace')}
            className="w-full min-h-[42px] rounded-xl bg-[#143A28] hover:bg-[#1D4E37] text-white text-xs font-semibold cursor-pointer"
          >
            {t('buyer.browseSupplyBtn')}
          </button>
        </div>
      </section>
    </div>
  );
};
