import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
  Sprout,
  Truck,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { Language, UserRole } from '../types/kisansetu';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const SignupPage: React.FC = () => {
  const { state, t, setLanguage, startOnboardingSignup } = useKisanSetu();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRoleParam = searchParams.get('role');
  const initialRole: UserRole =
    initialRoleParam === 'buyer' || initialRoleParam === 'transport' || initialRoleParam === 'admin'
      ? initialRoleParam
      : 'farmer';

  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(state.language);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    setLanguage(lang);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg(t('auth.errorEmptyName'));
      return;
    }

    if (!identifier.trim()) {
      setErrorMsg(t('auth.errorEmptyCredential'));
      return;
    }

    if (password.trim().length < 4) {
      setErrorMsg(t('auth.passwordPlaceholder'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t('auth.passwordMismatch'));
      return;
    }

    startOnboardingSignup(fullName.trim(), selectedRole, selectedLanguage, identifier.trim());
    navigate('/onboarding', { replace: true });
  };

  const roleCards: Array<{
    role: UserRole;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { role: 'farmer', title: t('auth.roleFarmerTitle'), icon: Sprout },
    { role: 'buyer', title: t('auth.roleBuyerTitle'), icon: Building2 },
    { role: 'transport', title: t('auth.roleTransportTitle'), icon: Truck },
    { role: 'admin', title: t('auth.roleAdminTitle'), icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#17231B] flex flex-col">
      {/* Standalone Auth Top Bar */}
      <header className="border-b border-[#E5E2DA] bg-[#F8F7F4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-[#143A28] text-white flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </span>
            <span className="font-display text-lg font-semibold text-[#143A28]">
              {t('common.brandName')}
            </span>
          </button>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">
              <LanguageSwitcher variant="compact" value={selectedLanguage} onChange={handleLanguageChange} />
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#143A28] hover:bg-[#ECEAE3] transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('auth.backToLanding')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Signup Form (Starts Immediately at Top) */}
      <main className="flex-1 flex flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 sm:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-lg space-y-5"
        >
          <div className="sm:hidden flex justify-end">
            <LanguageSwitcher variant="compact" value={selectedLanguage} onChange={handleLanguageChange} />
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B]">
              {t('auth.signupTitle')}
            </h1>
            <p className="text-sm text-[#546358] leading-relaxed">
              {t('auth.signupSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-[#E5E2DA] rounded-2xl p-6 space-y-4">
            {/* Role selection */}
            <div>
              <p className="text-xs font-semibold text-[#3D4E42] mb-2">{t('auth.chooseRole')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {roleCards.map((item) => {
                  const Icon = item.icon;
                  const active = selectedRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setSelectedRole(item.role)}
                      className={`py-2 px-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                        active
                          ? 'bg-[#143A28] border-[#143A28] text-white'
                          : 'bg-[#F8F7F4] border-[#D8D4CA] text-[#3D4E42] hover:border-[#216B43]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate max-w-full">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="signup-name" className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                {t('auth.fullNameLabel')}
              </label>
              <input
                id="signup-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('auth.fullNamePlaceholder')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-white border border-[#D8D4CA] text-sm focus:outline-none focus:border-[#216B43]"
              />
            </div>

            <div>
              <label htmlFor="signup-identifier" className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                {t('auth.phoneOrEmailLabel')}
              </label>
              <input
                id="signup-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('auth.phoneOrEmailPlaceholder')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-white border border-[#D8D4CA] text-sm focus:outline-none focus:border-[#216B43]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="signup-password" className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                  {t('auth.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full min-h-[44px] px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-[#D8D4CA] text-sm focus:outline-none focus:border-[#216B43]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-[#546358] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm" className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                  {t('auth.confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    className="w-full min-h-[44px] px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-[#D8D4CA] text-sm focus:outline-none focus:border-[#216B43]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-[#546358] cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#3D4E42] mb-2">{t('common.selectLanguage')}</p>
              <LanguageSwitcher variant="cards" value={selectedLanguage} onChange={handleLanguageChange} />
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-medium text-[#B91C1C] bg-[#FEE2E2]/70 px-3 py-2 rounded-lg">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#143A28] hover:bg-[#1E5038] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {t('auth.createAccountBtn')}
            </button>
          </form>

          <p className="text-center text-sm text-[#546358]">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-semibold text-[#143A28] hover:underline">
              {t('auth.loginLink')}
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};
