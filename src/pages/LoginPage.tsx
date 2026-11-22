import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { translateRole } from '../i18n';
import { UserRole } from '../types/kisansetu';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const ROLE_HOME: Record<UserRole, string> = {
  farmer: '/dashboard',
  buyer: '/buyer',
  transport: '/transport',
  admin: '/admin',
};

export const LoginPage: React.FC = () => {
  const { state, t, loginAsDemoRole, loginWithCredentials, pushToast } = useKisanSetu();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const routeAfterLogin = (role: UserRole) => {
    navigate(ROLE_HOME[role], { replace: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg(t('auth.errorEmptyCredential'));
      return;
    }

    if (password.trim().length < 4) {
      setErrorMsg(t('auth.passwordPlaceholder'));
      return;
    }

    loginWithCredentials(identifier.trim(), selectedRole);
    routeAfterLogin(selectedRole);
  };

  const handleGoogleLogin = () => {
    const demoEmail = 'kriyashah013@gmail.com';
    loginWithCredentials(demoEmail, selectedRole);
    pushToast({
      title: t('auth.googleDemoNotice', { email: demoEmail }),
      variant: 'info',
    });
    routeAfterLogin(selectedRole);
  };

  const handleDemoRole = (role: UserRole) => {
    loginAsDemoRole(role);
    routeAfterLogin(role);
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
              <LanguageSwitcher variant="compact" />
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

      {/* Main Centered Login Experience (Starts Immediately at Top) */}
      <main className="flex-1 flex flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md space-y-5"
        >
          <div className="sm:hidden flex justify-end">
            <LanguageSwitcher variant="compact" />
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B]">
              {t('auth.welcomeBack')}
            </h1>
            <p className="text-sm text-[#546358] leading-relaxed">
              {t('auth.welcomeSubtitle')}
            </p>
          </div>

          <div className="bg-white border border-[#E5E2DA] rounded-2xl p-6 space-y-5">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-identifier" className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                  {t('auth.phoneOrEmailLabel')}
                </label>
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('auth.phoneOrEmailPlaceholder')}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-white border border-[#D8D4CA] text-sm focus:outline-none focus:border-[#216B43]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="text-xs font-semibold text-[#3D4E42]">
                    {t('auth.passwordLabel')}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-[#216B43] hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full min-h-[44px] px-3.5 py-2.5 pr-11 rounded-lg bg-white border border-[#D8D4CA] text-sm focus:outline-none focus:border-[#216B43]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#546358] hover:text-[#17231B] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
                {t('auth.loginBtn')} ({translateRole(state.language, selectedRole)})
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#E5E2DA]" />
              <span className="px-3 bg-white text-xs text-[#6A786E]">{t('auth.orDivider')}</span>
            </div>

            {/* Continue with Google & Continue as Demo Farmer */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg border border-[#D8D4CA] bg-white hover:bg-[#F8F7F4] text-[#17231B] text-sm font-medium inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <span className="w-4 h-4 rounded-full bg-[#143A28] text-white text-[10px] font-bold flex items-center justify-center">
                  G
                </span>
                <span>{t('auth.continueWithGoogle')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoRole('farmer')}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#ECEAE3] hover:bg-[#E2DFD5] text-[#143A28] text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('auth.continueDemoFarmer')}
              </button>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['buyer', 'transport', 'admin'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDemoRole(role)}
                    className="py-1.5 px-2 rounded-md border border-[#E5E2DA] bg-[#F8F7F4] hover:border-[#216B43] text-[11px] font-medium text-[#3D4E42] cursor-pointer truncate"
                  >
                    {translateRole(state.language, role)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-[#546358]">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="font-semibold text-[#143A28] hover:underline">
              {t('auth.createAccountLink')}
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};
