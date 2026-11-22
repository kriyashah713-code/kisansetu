import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  MapPin,
  PackageCheck,
  Truck,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { Order, OrderStatus } from '../types/kisansetu';
import { translateCrop, translateStatus } from '../i18n';

const ORDER_PIPELINE: OrderStatus[] = [
  'Order Created',
  'Transport Requested',
  'Pickup Scheduled',
  'Pickup Completed',
  'In Transit',
  'Delivered',
  'Completed',
];

export const OrdersPage: React.FC = () => {
  const { state, t, markOrderCompleted } = useKisanSetu();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(state.orders[0] || null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const visibleOrders = state.orders.filter((ord) => {
    if (statusFilter === 'ACTIVE') return ord.status !== 'Completed';
    if (statusFilter === 'COMPLETED') return ord.status === 'Completed';
    return true;
  });

  const activeOrder =
    (selectedOrder && state.orders.find((o) => o.id === selectedOrder.id)) ||
    visibleOrders[0] ||
    null;

  const activeStepIdx = activeOrder ? ORDER_PIPELINE.indexOf(activeOrder.status) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#216B43]">{t('orders.eyebrow')}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-0.5">
            {t('orders.title')}
          </h1>
          <p className="text-sm text-[#546358] mt-1">{t('orders.subtitle')}</p>
        </div>

        <div className="inline-flex items-center p-1 bg-[#ECEAE3] rounded-xl self-start sm:self-auto">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                statusFilter === f ? 'bg-white text-[#143A28] shadow-xs' : 'text-[#546358]'
              }`}
            >
              {f === 'ALL'
                ? t('orders.filterAll')
                : f === 'ACTIVE'
                ? t('orders.filterActive')
                : t('orders.filterCompleted')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3">
          {visibleOrders.length === 0 ? (
            <div className="bg-white border border-[#E5E2DA] rounded-2xl p-8 text-center text-sm text-[#546358]">
              {t('orders.empty')}
            </div>
          ) : (
            visibleOrders.map((ord) => {
              const isSelected = activeOrder?.id === ord.id;
              return (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setSelectedOrder(ord)}
                  className={`w-full text-left bg-white rounded-2xl p-4 border transition-colors cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-[#216B43] ring-1 ring-[#216B43]/30'
                      : 'border-[#E5E2DA] hover:border-[#216B43]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#143A28]">
                      {t('orders.orderNumber', { num: ord.orderNumber })}
                    </span>
                    <span className="text-xs font-semibold text-[#216B43]">
                      {translateStatus(state.language, ord.status)}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-[#17231B]">
                    {translateCrop(state.language, ord.crop)} (
                    {t('common.gradeLabel', { grade: ord.grade })}) — {ord.quantityKg}{' '}
                    {t('common.kg')}
                  </p>
                  <p className="text-xs text-[#546358]">
                    {ord.farmerName} → {ord.buyerName}
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[#3D4E42] pt-1 border-t border-[#ECEAE3]">
                    <span>
                      ₹{ord.pricePerKg}
                      {t('common.perKg')}
                    </span>
                    <span>
                      {t('orders.totalValue', {
                        amount: ord.totalEstimatedValueInr.toLocaleString(),
                      })}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7">
          {!activeOrder ? (
            <div className="bg-white border border-[#E5E2DA] rounded-2xl p-10 text-center">
              <PackageCheck className="w-10 h-10 text-[#6A786E] mx-auto mb-2" />
              <p className="text-sm text-[#546358]">{t('orders.selectPrompt')}</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ECEAE3] pb-4">
                <div>
                  <p className="text-xs font-mono text-[#546358]">
                    {t('orders.orderNumber', { num: activeOrder.orderNumber })} ·{' '}
                    {activeOrder.updatedAt}
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-[#17231B] mt-0.5">
                    {activeOrder.quantityKg} {t('common.kg')}{' '}
                    {translateCrop(state.language, activeOrder.crop)} (
                    {t('common.gradeLabel', { grade: activeOrder.grade })})
                  </h2>
                  <p className="text-xs text-[#546358] mt-1">
                    {t('common.farmer')}: <strong>{activeOrder.farmerName}</strong> →{' '}
                    {t('common.buyer')}: <strong>{activeOrder.buyerName}</strong>
                  </p>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <p className="text-xs text-[#5E6D63]">{t('orders.agreedValue')}</p>
                  <p className="text-xl font-bold text-[#143A28]">
                    ₹{activeOrder.totalEstimatedValueInr.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#546358]">
                    ₹{activeOrder.pricePerKg}
                    {t('common.perKg')}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-[#546358]">
                  {t('orders.lifecycleTitle')}
                </p>
                <div className="space-y-2">
                  {ORDER_PIPELINE.map((stage, idx) => {
                    const reached = idx <= activeStepIdx;
                    const current = idx === activeStepIdx;
                    return (
                      <div key={stage} className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                            reached ? 'bg-[#216B43] text-white' : 'bg-[#ECEAE3] text-[#6A786E]'
                          }`}
                        >
                          {reached ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              current
                                ? 'font-bold text-[#143A28]'
                                : reached
                                ? 'font-medium text-[#17231B]'
                                : 'text-[#6A786E]'
                            }`}
                          >
                            {translateStatus(state.language, stage)}
                          </span>
                          {current && (
                            <span className="text-[11px] font-semibold text-[#216B43]">
                              {t('orders.currentStage')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3] text-xs">
                <div>
                  <p className="text-[#5E6D63] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#216B43]" /> {t('orders.pickupOrigin')}
                  </p>
                  <p className="font-semibold text-[#17231B] mt-1">
                    {activeOrder.farmerLocation}
                  </p>
                </div>
                <div>
                  <p className="text-[#5E6D63] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B8860B]" /> {t('orders.buyerDest')}
                  </p>
                  <p className="font-semibold text-[#17231B] mt-1">{activeOrder.buyerLocation}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#ECEAE3]">
                {activeOrder.status === 'Order Created' && (
                  <button
                    type="button"
                    onClick={() => navigate(`/transport?orderId=${activeOrder.id}`)}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#216B43] hover:bg-[#195434] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>
                      {t('orders.requestTransportBtn', { num: activeOrder.orderNumber })}
                    </span>
                  </button>
                )}

                {activeOrder.status !== 'Order Created' && (
                  <button
                    type="button"
                    onClick={() => navigate('/transport')}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8D4CA] hover:bg-[#F3F1EC] text-xs font-semibold text-[#17231B] cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-[#216B43]" />
                    <span>{t('orders.viewTransportBtn')}</span>
                  </button>
                )}

                {activeOrder.status === 'Delivered' && state.activeRole === 'buyer' && (
                  <button
                    type="button"
                    onClick={() => markOrderCompleted(activeOrder.id)}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143A28] hover:bg-[#1D4E37] text-white text-xs font-semibold cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('orders.markCompletedBtn')}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
