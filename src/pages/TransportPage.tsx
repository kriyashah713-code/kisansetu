import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  PackageCheck,
  Plus,
  Truck,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { marketplaceService } from '../services/marketplaceService';
import { TransportRequest, TransportStatus, TransportVehicleType } from '../types/kisansetu';
import { translateCrop, translateStatus, translateVehicle } from '../i18n';

const VEHICLE_OPTIONS: TransportVehicleType[] = [
  'Pickup Van',
  'Mini Truck',
  '14ft Eicher',
  'Reefer Van',
];

function getProgressPercent(status: TransportStatus): number {
  switch (status) {
    case 'Requested':
      return 8;
    case 'Driver Assigned':
      return 24;
    case 'Pickup Scheduled':
      return 38;
    case 'Pickup Completed':
      return 52;
    case 'In Transit':
      return 74;
    case 'Delivered':
      return 100;
  }
}

export const TransportPage: React.FC = () => {
  const { state, t, requestTransportForOrder } = useKisanSetu();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const prefillOrderId = searchParams.get('orderId') || '';

  const [tab, setTab] = useState<'ALL' | 'REQUESTED' | 'ACTIVE' | 'DELIVERED'>('ALL');
  const [selectedId, setSelectedId] = useState<string>(state.transportRequests[0]?.id || '');
  const [showForm, setShowForm] = useState<boolean>(Boolean(prefillOrderId));

  const [orderId, setOrderId] = useState<string>(prefillOrderId);
  const [pickupLocation, setPickupLocation] = useState('Borsad, Anand (GJ)');
  const [destination, setDestination] = useState('Ahmedabad Packhouse, Gujarat');
  const [crop, setCrop] = useState('Tomato');
  const [quantityKg, setQuantityKg] = useState('500');
  const [preferredPickupDate, setPreferredPickupDate] = useState('2026-11-25');
  const [vehicleType, setVehicleType] = useState<TransportVehicleType>('Mini Truck');
  const [specialHandling, setSpecialHandling] = useState(
    'Ventilated plastic crates, morning pickup preferred'
  );
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!prefillOrderId) return;
    const ord = state.orders.find((o) => o.id === prefillOrderId);
    if (ord) {
      setOrderId(ord.id);
      setPickupLocation(ord.farmerLocation);
      setDestination(ord.buyerLocation);
      setCrop(ord.crop);
      setQuantityKg(String(ord.quantityKg));
      setShowForm(true);
    }
  }, [prefillOrderId, state.orders]);

  const handleOrderSelect = (nextOrderId: string) => {
    setOrderId(nextOrderId);
    const ord = state.orders.find((o) => o.id === nextOrderId);
    if (ord) {
      setPickupLocation(ord.farmerLocation);
      setDestination(ord.buyerLocation);
      setCrop(ord.crop);
      setQuantityKg(String(ord.quantityKg));
    }
  };

  const liveEstimate = marketplaceService.estimateDemoTransport(
    pickupLocation,
    destination,
    Math.max(50, Number(quantityKg) || 100),
    vehicleType
  );

  const handleSubmitTransport = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const qty = Number(quantityKg);
    if (
      !pickupLocation.trim() ||
      !destination.trim() ||
      !crop.trim() ||
      qty <= 0 ||
      !preferredPickupDate
    ) {
      setFormError(t('validation.requiredFields'));
      return;
    }

    const created = requestTransportForOrder({
      orderId: orderId || undefined,
      crop: crop.trim(),
      quantityKg: qty,
      pickupLocation: pickupLocation.trim(),
      destination: destination.trim(),
      preferredPickupDate,
      vehicleType,
      specialHandling: specialHandling.trim(),
    });
    setSelectedId(created.id);
    setShowForm(false);
    if (prefillOrderId) {
      setSearchParams({});
    }
  };

  const filteredRequests = state.transportRequests.filter((tr) => {
    if (tab === 'REQUESTED') return tr.status === 'Requested';
    if (tab === 'ACTIVE') {
      return ['Driver Assigned', 'Pickup Scheduled', 'Pickup Completed', 'In Transit'].includes(
        tr.status
      );
    }
    if (tab === 'DELIVERED') return tr.status === 'Delivered';
    return true;
  });

  const activeRequest: TransportRequest | null =
    state.transportRequests.find((tReq) => tReq.id === selectedId) || filteredRequests[0] || null;

  const progressPct = activeRequest ? getProgressPercent(activeRequest.status) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#216B43]">{t('transport.eyebrow')}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-0.5">
            {t('transport.title')}
          </h1>
          <p className="text-sm text-[#546358] mt-1">{t('transport.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          {state.activeRole === 'transport' && (
            <button
              type="button"
              onClick={() => navigate('/transport/provider')}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8D4CA] bg-white hover:bg-[#F3F1EC] text-xs font-semibold text-[#143A28] cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>{t('transport.openDispatchBtn')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#216B43] hover:bg-[#195434] text-white text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? t('transport.closeFormBtn') : t('transport.requestNewBtn')}</span>
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E5E2DA] text-xs text-[#4A5A4F]">
        <Info className="w-4 h-4 text-[#216B43] shrink-0 mt-0.5" />
        <p>{t('transport.disclaimer')}</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358]">{t('transport.kpiAwaiting')}</p>
          <p className="font-display text-2xl font-semibold text-[#B8860B] mt-1 tabular-nums">
            {state.transportRequests.filter((tr) => tr.status === 'Requested').length}
          </p>
        </div>
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358]">{t('transport.kpiTransit')}</p>
          <p className="font-display text-2xl font-semibold text-[#216B43] mt-1 tabular-nums">
            {
              state.transportRequests.filter((tr) =>
                ['Driver Assigned', 'Pickup Scheduled', 'Pickup Completed', 'In Transit'].includes(
                  tr.status
                )
              ).length
            }
          </p>
        </div>
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358]">{t('transport.kpiDelivered')}</p>
          <p className="font-display text-2xl font-semibold text-[#17231B] mt-1 tabular-nums">
            {state.transportRequests.filter((tr) => tr.status === 'Delivered').length}
          </p>
        </div>
        <div className="bg-white border border-[#E5E2DA] rounded-xl p-4">
          <p className="text-xs text-[#546358]">{t('transport.kpiPartner')}</p>
          <p className="text-sm font-semibold text-[#143A28] mt-1.5">
            {state.transportProfile.companyName}
          </p>
          <p className="text-[11px] text-[#5E6D63] font-mono">
            {translateVehicle(state.language, state.transportProfile.vehicleType)}
          </p>
        </div>
      </div>

      {/* Request Transport Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitTransport}
          className="bg-white border border-[#216B43]/40 rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold text-[#17231B]">
              {t('transport.formTitle')}
            </h2>
            <span className="text-xs font-semibold text-[#B8860B]">
              {t('transport.protoEstimateBadge', {
                km: liveEstimate.estimatedDistanceKm,
                range: liveEstimate.estimatedCostRange,
              })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('transport.selectOrderLabel')}
              </label>
              <select
                value={orderId}
                onChange={(e) => handleOrderSelect(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm bg-white"
              >
                <option value="">{t('transport.customDispatchOpt')}</option>
                {state.orders
                  .filter((o) => o.status !== 'Completed')
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.orderNumber} — {o.quantityKg} {t('common.kg')}{' '}
                      {translateCrop(state.language, o.crop)} ({o.buyerName})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('transport.pickupLabel')}
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('transport.destLabel')}
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('transport.cropLabel')}
              </label>
              <input
                type="text"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('transport.qtyLabel')}
              </label>
              <input
                type="number"
                min="25"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('transport.dateLabel')}
              </label>
              <input
                type="date"
                value={preferredPickupDate}
                onChange={(e) => setPreferredPickupDate(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('transport.vehicleLabel')}
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as TransportVehicleType)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm bg-white"
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {translateVehicle(state.language, v)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('transport.handlingLabel')}
              </label>
              <input
                type="text"
                value={specialHandling}
                onChange={(e) => setSpecialHandling(e.target.value)}
                placeholder={t('transport.handlingPlaceholder')}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
              />
            </div>
          </div>

          {formError && <p className="text-xs font-medium text-[#B91C1C]">{formError}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#ECEAE3]">
            <p className="text-xs text-[#546358]">
              <strong>{translateVehicle(state.language, vehicleType)}</strong>:{' '}
              <span className="font-mono font-semibold text-[#143A28]">
                {t('transport.estimatedDistance', { km: liveEstimate.estimatedDistanceKm })} ·{' '}
                {t('transport.estimatedCost', { range: liveEstimate.estimatedCostRange })}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="min-h-[42px] px-4 rounded-lg border border-[#D8D4CA] text-xs font-semibold cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 rounded-lg bg-[#143A28] hover:bg-[#1E5138] text-white text-xs font-semibold cursor-pointer"
              >
                {t('transport.submitBtn')}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="inline-flex flex-wrap gap-1 p-1 bg-[#ECEAE3] rounded-xl">
        {(
          [
            { id: 'ALL', label: `${t('common.all')} (${state.transportRequests.length})` },
            {
              id: 'REQUESTED',
              label: t('transport.availQueue', {
                count: state.transportRequests.filter((tr) => tr.status === 'Requested').length,
              }),
            },
            {
              id: 'ACTIVE',
              label: t('transport.activeQueue', {
                count: state.transportRequests.filter((tr) =>
                  ['Driver Assigned', 'Pickup Scheduled', 'Pickup Completed', 'In Transit'].includes(
                    tr.status
                  )
                ).length,
              }),
            },
            {
              id: 'DELIVERED',
              label: t('transport.completedQueue', {
                count: state.transportRequests.filter((tr) => tr.status === 'Delivered').length,
              }),
            },
          ] as const
        ).map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              tab === tabItem.id ? 'bg-white text-[#143A28] shadow-xs' : 'text-[#546358]'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="bg-white border border-[#E5E2DA] rounded-2xl p-8 text-center text-sm text-[#546358]">
              {t('transport.emptyJobs')}
            </div>
          ) : (
            filteredRequests.map((tr) => {
              const isSelected = activeRequest?.id === tr.id;
              return (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => setSelectedId(tr.id)}
                  className={`w-full text-left bg-white rounded-2xl p-4 border transition-colors cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-[#216B43] ring-1 ring-[#216B43]/30'
                      : 'border-[#E5E2DA] hover:border-[#216B43]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-[#143A28]">
                      #{tr.orderNumber} · {translateVehicle(state.language, tr.vehicleType)}
                    </span>
                    <span className="text-xs font-semibold text-[#216B43]">
                      {translateStatus(state.language, tr.status)}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-[#17231B]">
                    {translateCrop(state.language, tr.crop)} — {tr.quantityKg} {t('common.kg')}
                  </p>
                  <p className="text-xs text-[#546358]">
                    {tr.pickupLocation} → {tr.destination}
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[#3D4E42] pt-1 border-t border-[#ECEAE3]">
                    <span>{tr.estimatedDistanceKm} km</span>
                    <span>{tr.estimatedCostRange}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7">
          {!activeRequest ? (
            <div className="bg-white border border-[#E5E2DA] rounded-2xl p-10 text-center">
              <Truck className="w-10 h-10 text-[#6A786E] mx-auto mb-2" />
              <p className="text-sm text-[#546358]">{t('transport.selectTransportPrompt')}</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ECEAE3] pb-4">
                <div>
                  <p className="text-xs font-mono text-[#546358]">
                    #{activeRequest.orderNumber} · {activeRequest.preferredPickupDate}
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-[#17231B] mt-0.5">
                    {translateCrop(state.language, activeRequest.crop)} ({activeRequest.quantityKg}{' '}
                    {t('common.kg')}) — {translateVehicle(state.language, activeRequest.vehicleType)}
                  </h2>
                  <p className="text-xs text-[#546358] mt-1">
                    {t('common.farmer')}: <strong>{activeRequest.farmerName}</strong> →{' '}
                    {t('common.buyer')}: <strong>{activeRequest.buyerName}</strong>
                  </p>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <p className="text-xs text-[#5E6D63]">
                    {t('transport.estimatedCost', { range: activeRequest.estimatedCostRange })}
                  </p>
                  <p className="text-lg font-bold text-[#143A28]">
                    {activeRequest.estimatedCostRange}
                  </p>
                  <p className="text-xs text-[#546358]">
                    {t('transport.estimatedDistance', { km: activeRequest.estimatedDistanceKm })}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#F4F6F2] border border-[#DCE3D7] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#143A28] inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#216B43]" />
                    {t('transport.routeProgressLabel', { pct: progressPct })}
                  </span>
                  <span className="text-[11px] text-[#546358]">
                    {t('transport.notLiveGpsTag')}
                  </span>
                </div>

                <svg
                  viewBox="0 0 600 120"
                  className="w-full h-auto"
                  role="img"
                  aria-label={t('transport.routeProgressLabel', { pct: progressPct })}
                >
                  <line x1="20" y1="30" x2="580" y2="30" stroke="#E5E9E0" strokeWidth="1" />
                  <line x1="20" y1="90" x2="580" y2="90" stroke="#E5E9E0" strokeWidth="1" />
                  <path
                    d="M 55 62 C 180 28, 410 92, 545 62"
                    fill="none"
                    stroke="#D4DBD0"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="55"
                    y1="62"
                    x2={55 + (490 * progressPct) / 100}
                    y2="62"
                    stroke="#216B43"
                    strokeWidth="4"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                  />
                  <circle cx="55" cy="62" r="9" fill="#143A28" />
                  <text
                    x="55"
                    y="92"
                    textAnchor="middle"
                    className="fill-[#17231B] text-[10px] font-semibold"
                  >
                    {t('transport.originLabel')}
                  </text>

                  <g transform={`translate(${55 + (490 * progressPct) / 100}, 62)`}>
                    <circle r="13" fill="#C48F29" fillOpacity="0.22" />
                    <circle r="7" fill="#C48F29" stroke="#FFFFFF" strokeWidth="2" />
                    <text
                      x="0"
                      y="-18"
                      textAnchor="middle"
                      className="fill-[#143A28] text-[10px] font-mono font-bold"
                    >
                      {translateStatus(state.language, activeRequest.status)}
                    </text>
                  </g>

                  <circle
                    cx="545"
                    cy="62"
                    r="9"
                    fill={activeRequest.status === 'Delivered' ? '#216B43' : '#FFFFFF'}
                    stroke="#216B43"
                    strokeWidth="3"
                  />
                  <text
                    x="545"
                    y="92"
                    textAnchor="middle"
                    className="fill-[#17231B] text-[10px] font-semibold"
                  >
                    {t('transport.destLabelShort')}
                  </text>
                </svg>

                <div className="grid sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-[#E2E7DE]">
                  <div>
                    <p className="text-[#5E6D63]">{t('transport.originLabel')}</p>
                    <p className="font-semibold text-[#17231B]">{activeRequest.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-[#5E6D63]">{t('transport.currentCheckpoint')}</p>
                    <p className="font-semibold text-[#216B43]">
                      {activeRequest.currentSimulatedLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#5E6D63]">{t('transport.destLabelShort')}</p>
                    <p className="font-semibold text-[#17231B]">{activeRequest.destination}</p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3] space-y-1">
                  <p className="font-semibold text-[#143A28]">
                    {t('transport.assignedPartnerLabel')}
                  </p>
                  <p className="text-[#17231B]">
                    {activeRequest.providerName || t('transport.awaitingPartner')}
                  </p>
                  {activeRequest.driverName && (
                    <p className="text-[#546358] font-mono">
                      {t('transport.assignedDriver', {
                        provider: activeRequest.providerName || '',
                        driver: `${activeRequest.driverName} · ${activeRequest.driverPhone || ''}`,
                      })}
                    </p>
                  )}
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3] space-y-1">
                  <p className="font-semibold text-[#143A28]">
                    {t('transport.handlingNotesLabel')}
                  </p>
                  <p className="text-[#3D4E42]">{activeRequest.specialHandling}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-[#546358]">
                  {t('transport.timelineTitle')}
                </p>
                <div className="space-y-2.5">
                  {activeRequest.timeline.map((step) => (
                    <div key={step.step} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {step.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#216B43] shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-[#9AA59D] shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            step.completed ? 'font-semibold text-[#17231B]' : 'text-[#6A786E]'
                          }`}
                        >
                          {translateStatus(state.language, step.step)}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#546358]">{step.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#ECEAE3] flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D8D4CA] hover:bg-[#F3F1EC] text-xs font-semibold text-[#17231B] cursor-pointer"
                >
                  <PackageCheck className="w-3.5 h-3.5 text-[#216B43]" />
                  <span>
                    {t('transport.viewLinkedOrder', { num: activeRequest.orderNumber })}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
