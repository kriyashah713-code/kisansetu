import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Compass,
  MapPin,
  Phone,
  Truck,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { TransportRequest, TransportStatus } from '../types/kisansetu';
import { translateCrop, translateStatus, translateVehicle } from '../i18n';

export const TransportProviderPage: React.FC = () => {
  const { state, t, advanceTransportStage } = useKisanSetu();
  const navigate = useNavigate();
  const [queueFilter, setQueueFilter] = useState<'ALL' | 'AVAILABLE' | 'ACTIVE' | 'COMPLETED'>(
    'ALL'
  );

  const available = state.transportRequests.filter((tr) => tr.status === 'Requested');
  const activeTrips = state.transportRequests.filter((tr) =>
    ['Driver Assigned', 'Pickup Scheduled', 'Pickup Completed', 'In Transit'].includes(tr.status)
  );
  const completedTrips = state.transportRequests.filter((tr) => tr.status === 'Delivered');

  const visibleTrips = state.transportRequests.filter((tr) => {
    if (queueFilter === 'AVAILABLE') return tr.status === 'Requested';
    if (queueFilter === 'ACTIVE') {
      return ['Driver Assigned', 'Pickup Scheduled', 'Pickup Completed', 'In Transit'].includes(
        tr.status
      );
    }
    if (queueFilter === 'COMPLETED') return tr.status === 'Delivered';
    return true;
  });

  const getNextAction = (
    tr: TransportRequest
  ): { label: string; nextStatus: TransportStatus } | null => {
    switch (tr.status) {
      case 'Requested':
        return { label: t('transport.acceptJobBtn'), nextStatus: 'Driver Assigned' };
      case 'Driver Assigned':
        return { label: t('transport.advancePickupBtn'), nextStatus: 'Pickup Scheduled' };
      case 'Pickup Scheduled':
        return { label: t('transport.advancePickupDoneBtn'), nextStatus: 'Pickup Completed' };
      case 'Pickup Completed':
        return { label: t('transport.advanceTransitBtn'), nextStatus: 'In Transit' };
      case 'In Transit':
        return { label: t('transport.advanceDeliverBtn'), nextStatus: 'Delivered' };
      case 'Delivered':
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#143A28] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#E6B85C]">{t('transport.providerTitle')}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold mt-1">
            {state.transportProfile.companyName}
          </h1>
          <p className="text-sm text-[#D4E0D7] mt-1">
            {state.transportProfile.driverName} ·{' '}
            {translateVehicle(state.language, state.transportProfile.vehicleType)} (
            <span className="font-mono">{state.transportProfile.vehicleNumber}</span>) ·{' '}
            {state.transportProfile.baseCity}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="px-4 py-2.5 rounded-xl bg-white/10 text-xs">
            <p className="text-[#B8CABD]">{t('transport.dispatchContact')}</p>
            <p className="font-mono font-semibold text-white inline-flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-[#E6B85C]" />
              {state.transportProfile.phone}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/transport')}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C48F29] hover:bg-[#D49D34] text-[#101D15] text-xs font-semibold cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{t('transport.routeViewBtn')}</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358]">{t('transport.kpiAwaiting')}</p>
          <p className="font-display text-2xl font-semibold text-[#B8860B] mt-1 tabular-nums">
            {available.length}
          </p>
        </div>
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358]">{t('transport.kpiTransit')}</p>
          <p className="font-display text-2xl font-semibold text-[#216B43] mt-1 tabular-nums">
            {activeTrips.length}
          </p>
        </div>
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358]">{t('transport.kpiDelivered')}</p>
          <p className="font-display text-2xl font-semibold text-[#17231B] mt-1 tabular-nums">
            {completedTrips.length}
          </p>
        </div>
      </div>

      <div className="inline-flex flex-wrap gap-1 p-1 bg-[#ECEAE3] rounded-xl">
        {(
          [
            {
              id: 'ALL',
              label: t('transport.allDispatches', { count: state.transportRequests.length }),
            },
            { id: 'AVAILABLE', label: t('transport.availQueue', { count: available.length }) },
            { id: 'ACTIVE', label: t('transport.activeQueue', { count: activeTrips.length }) },
            {
              id: 'COMPLETED',
              label: t('transport.completedQueue', { count: completedTrips.length }),
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setQueueFilter(tab.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
              queueFilter === tab.id ? 'bg-white text-[#143A28] shadow-xs' : 'text-[#546358]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleTrips.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-[#E5E2DA] rounded-2xl p-8 text-center text-sm text-[#546358]">
            {t('transport.emptyJobs')}
          </div>
        ) : (
          visibleTrips.map((tr) => {
            const action = getNextAction(tr);
            return (
              <div
                key={tr.id}
                className="bg-white border border-[#E5E2DA] rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-[#143A28]">
                      #{tr.orderNumber} · {translateVehicle(state.language, tr.vehicleType)}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        tr.status === 'Delivered'
                          ? 'text-[#216B43]'
                          : tr.status === 'Requested'
                          ? 'text-[#B8860B]'
                          : 'text-[#143A28]'
                      }`}
                    >
                      {translateStatus(state.language, tr.status)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#17231B]">
                      {tr.quantityKg} {t('common.kg')} {translateCrop(state.language, tr.crop)}
                    </h3>
                    <p className="text-xs text-[#546358] mt-0.5">
                      {tr.farmerName} → {tr.buyerName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3] text-xs">
                    <div>
                      <p className="text-[#5E6D63] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#216B43]" /> {t('transport.originLabel')}
                      </p>
                      <p className="font-semibold text-[#17231B] mt-0.5">{tr.pickupLocation}</p>
                    </div>
                    <div>
                      <p className="text-[#5E6D63] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#B8860B]" />{' '}
                        {t('transport.destLabelShort')}
                      </p>
                      <p className="font-semibold text-[#17231B] mt-0.5">{tr.destination}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#3D4E42]">
                    <span>
                      {t('transport.dateLabel')}:{' '}
                      <strong className="font-mono">{tr.preferredPickupDate}</strong>
                    </span>
                    <span className="font-mono font-semibold text-[#143A28]">
                      {tr.estimatedDistanceKm} km · {tr.estimatedCostRange}
                    </span>
                  </div>

                  <p className="text-xs text-[#546358]">
                    <strong>{t('transport.handlingNotesLabel')}:</strong> {tr.specialHandling}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#ECEAE3] flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#5E6D63] truncate">
                    {tr.currentSimulatedLocation}
                  </span>

                  {action ? (
                    <button
                      type="button"
                      onClick={() => advanceTransportStage(tr.id, action.nextStatus)}
                      className="min-h-[42px] shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#216B43] hover:bg-[#195434] text-white text-xs font-semibold cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{action.label}</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#216B43] shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{translateStatus(state.language, 'Delivered')}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
