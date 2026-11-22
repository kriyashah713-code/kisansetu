import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Globe, LogOut, RotateCcw, ShieldCheck, User } from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { LANGUAGE_STORAGE_KEY, translateRole, translateStatus } from '../i18n';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ResilientImage } from '../components/ResilientImage';

export const SettingsPage: React.FC = () => {
  const { state, t, resetDemoWorkspace, logout } = useKisanSetu();
  const navigate = useNavigate();
  const role = state.activeRole;

  const handleSignOut = () => {
    logout();
    navigate('/', { replace: true });
  };

  const profileLocation =
    role === 'buyer'
      ? state.buyerProfile.location
      : role === 'transport'
      ? state.transportProfile.baseCity
      : role === 'admin'
      ? 'Gujarat Agritech Ops'
      : `${state.profile.village}, ${state.profile.district}, ${state.profile.state}`;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B]">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-[#546358] mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Language Selector Card */}
      <section className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#143A28]/8 text-[#143A28] flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-[#17231B]">
                {t('settings.languageCardTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[#546358] mt-0.5 max-w-xl">
                {t('settings.languageCardDesc')}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#F8F7F4] border border-[#E5E2DA] text-[#546358]">
            {t('settings.savedLanguageBadge', { key: `${LANGUAGE_STORAGE_KEY}="${state.language}"` })}
          </span>
        </div>

        <LanguageSwitcher variant="cards" />
      </section>

      {/* Active Account Profile Card */}
      <section className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#143A28]/8 text-[#143A28] flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <h2 className="font-display text-lg font-semibold text-[#17231B]">
            {t('settings.profileCardTitle')}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#F8F7F4] border border-[#E5E2DA]">
          {role === 'farmer' ? (
            <ResilientImage
              src={state.profile.avatarUrl}
              alt={state.user.name}
              className="w-14 h-14 rounded-full object-cover border border-[#D8D4CA] shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#143A28] text-white flex items-center justify-center font-semibold text-base shrink-0">
              {state.user.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            <div>
              <p className="text-xs text-[#6A786E]">{t('settings.nameLabel')}</p>
              <p className="text-sm font-semibold text-[#17231B] mt-0.5">{state.user.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#6A786E]">{t('settings.roleLabel')}</p>
              <p className="text-sm font-semibold text-[#143A28] mt-0.5">{translateRole(state.language, role)}</p>
            </div>
            <div>
              <p className="text-xs text-[#6A786E]">{t('settings.locationLabel')}</p>
              <p className="text-sm font-semibold text-[#17231B] mt-0.5">{profileLocation}</p>
            </div>
            <div>
              <p className="text-xs text-[#6A786E]">{t('settings.verificationLabel')}</p>
              <p className="text-sm font-semibold text-[#216B43] mt-0.5 inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{translateStatus(state.language, 'Verified')}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Controls */}
      <section className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C48F29]/15 text-[#8A5E0A] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-[#17231B]">
              {t('settings.workspaceCardTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#546358] mt-0.5">
              {t('settings.workspaceCardDesc')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={resetDemoWorkspace}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D8D4CA] bg-[#F8F7F4] hover:bg-[#ECEAE3] text-sm font-medium text-[#17231B] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('settings.resetBtn')}</span>
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#143A28] hover:bg-[#1B4B34] text-white text-sm font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('settings.signOutBtn')}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
