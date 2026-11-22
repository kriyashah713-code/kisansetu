import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Sprout } from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const ForgotPasswordPage: React.FC = () => {
  const { t, pushToast } = useKisanSetu();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg(t('auth.errorEmptyCredential'));
      return;
    }

    setSubmitted(true);
    pushToast({
      title: t('auth.resetSentTitle'),
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#17231B] flex flex-col justify-between p-6 sm:p-10">
      <div className="max-w-lg w-full mx-auto flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2.5 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-lg bg-[#143A28] text-white flex items-center justify-center">
            <Sprout className="w-4 h-4" />
          </span>
          <span className="font-display text-lg font-semibold text-[#143A28]">
            {t('common.brandName')}
          </span>
        </button>
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="max-w-md w-full mx-auto my-10">
        <div className="mb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#143A28] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('auth.backToLogin')}</span>
          </Link>
        </div>

        <div className="bg-white border border-[#E5E2DA] rounded-2xl p-6 sm:p-8 space-y-5">
          {!submitted ? (
            <>
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#17231B]">
                  {t('auth.forgotTitle')}
                </h1>
                <p className="text-sm text-[#546358] mt-1.5 leading-relaxed">
                  {t('auth.forgotSubtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-identifier" className="block text-xs font-semibold text-[#3D4E42] mb-1.5">
                    {t('auth.phoneOrEmailLabel')}
                  </label>
                  <input
                    id="forgot-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t('auth.phoneOrEmailPlaceholder')}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-white border border-[#D8D4CA] text-sm focus:outline-none focus:border-[#216B43]"
                  />
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
                  {t('auth.sendResetBtn')}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-[#216B43]/12 text-[#216B43] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h1 className="font-display text-xl font-semibold text-[#17231B]">
                {t('auth.resetSentTitle')}
              </h1>
              <p className="text-sm text-[#546358] leading-relaxed">
                {t('auth.resetSentDesc')}
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#143A28] hover:bg-[#1E5038] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('auth.backToLogin')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg w-full mx-auto text-center">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs text-[#546358] hover:text-[#143A28] hover:underline cursor-pointer"
        >
          ← {t('auth.backToLanding')}
        </button>
      </div>
    </div>
  );
};
