import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Plus,
  ShoppingBag,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { FarmHistoryEvent } from '../types/kisansetu';
import { translateCrop, translateDay, translateStatus } from '../i18n';

export const FarmHistoryPage: React.FC = () => {
  const { state, t, addHistoryEvent } = useKisanSetu();
  const [cropFilter, setCropFilter] = useState<string>('ALL');
  const [showLogForm, setShowLogForm] = useState(false);

  const [newCrop, setNewCrop] = useState('Tomato');
  const [newStage, setNewStage] = useState<FarmHistoryEvent['stageType']>('treatment');
  const [newTitle, setNewTitle] = useState('');
  const [newDetail, setNewDetail] = useState('');

  const filtered =
    cropFilter === 'ALL'
      ? state.history
      : state.history.filter((h) => h.crop.toLowerCase() === cropFilter.toLowerCase());

  const getStageIcon = (stage: FarmHistoryEvent['stageType']) => {
    switch (stage) {
      case 'planted':
      case 'harvest':
        return <Sprout className="w-4 h-4 text-[#216B43]" />;
      case 'scanned':
      case 'disease':
        return <Camera className="w-4 h-4 text-[#B8860B]" />;
      case 'treatment':
        return <ClipboardCheck className="w-4 h-4 text-[#143A28]" />;
      case 'improved':
        return <TrendingUp className="w-4 h-4 text-[#216B43]" />;
      case 'listed':
      case 'inquiry':
      case 'order':
      case 'transport':
        return <ShoppingBag className="w-4 h-4 text-[#143A28]" />;
    }
  };

  const handleLogActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDetail.trim()) return;
    addHistoryEvent({
      crop: newCrop,
      stageType: newStage,
      title: newTitle.trim(),
      detail: newDetail.trim(),
      date: 'Today',
    });
    setNewTitle('');
    setNewDetail('');
    setShowLogForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#216B43]">{t('history.eyebrow')}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-0.5">
            {t('history.title')}
          </h1>
          <p className="text-sm text-[#546358] mt-1">{t('history.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogForm((v) => !v)}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#143A28] hover:bg-[#1D4E37] text-white text-xs font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showLogForm ? t('common.cancel') : t('history.logBtn')}</span>
        </button>
      </div>

      {showLogForm && (
        <form
          onSubmit={handleLogActivity}
          className="bg-white border border-[#216B43]/35 rounded-2xl p-5 space-y-4"
        >
          <h2 className="font-display text-lg font-semibold text-[#17231B]">
            {t('history.formTitle')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('common.crop')}
              </label>
              <select
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm bg-white"
              >
                {(['Tomato', 'Wheat', 'Onion'] as const).map((c) => (
                  <option key={c} value={c}>
                    {translateCrop(state.language, c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('history.stageLabel')}
              </label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value as FarmHistoryEvent['stageType'])}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm bg-white"
              >
                <option value="treatment">{t('history.stageTreatment')}</option>
                <option value="improved">{t('history.stageImproved')}</option>
                <option value="harvest">{t('history.stageHarvest')}</option>
                <option value="planted">{t('history.stagePlanted')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
                {t('history.activityTitleLabel')}
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('history.activityPlaceholder')}
                className="w-full min-h-[42px] px-3 rounded-lg border border-[#D8D4CA] text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3D4E42] mb-1">
              {t('common.notes')}
            </label>
            <textarea
              rows={2}
              value={newDetail}
              onChange={(e) => setNewDetail(e.target.value)}
              placeholder={t('history.notesPlaceholder')}
              className="w-full p-3 rounded-lg border border-[#D8D4CA] text-sm"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[42px] px-5 rounded-lg bg-[#216B43] text-white text-xs font-semibold cursor-pointer"
            >
              {t('history.saveBtn')}
            </button>
          </div>
        </form>
      )}

      {/* Crop Filter */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'Tomato', 'Wheat'].map((crop) => (
          <button
            key={crop}
            type="button"
            onClick={() => setCropFilter(crop)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              cropFilter === crop
                ? 'bg-[#143A28] text-white'
                : 'bg-white border border-[#D8D4CA] text-[#3D4E42]'
            }`}
          >
            {crop === 'ALL' ? t('history.filterAll') : translateCrop(state.language, crop)}
          </button>
        ))}
      </div>

      {/* Vertical Timeline */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl p-8 text-center text-sm text-[#546358]">
          {t('history.empty')}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-7">
          <ol className="relative border-l border-[#D8D4CA] ml-4 space-y-6">
            {filtered.map((item) => (
              <li key={item.id} className="pl-7 relative">
                <span className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-[#F8F7F4] border border-[#D8D4CA] flex items-center justify-center">
                  {getStageIcon(item.stageType)}
                </span>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#546358]">
                  <span className="font-mono">{translateDay(state.language, item.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[#143A28]">
                    {translateCrop(state.language, item.crop)}
                  </span>
                  {item.verifiedTag && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-[#216B43] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {translateStatus(state.language, item.verifiedTag)}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-base font-semibold text-[#17231B] mt-1">{item.title}</h3>
                <p className="text-sm text-[#3D4E42] mt-1 leading-relaxed">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
