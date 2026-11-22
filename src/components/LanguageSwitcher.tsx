import React from 'react';
import { Globe } from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { Language } from '../types/kisansetu';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'pill' | 'dark' | 'cards';
  value?: Language;
  onChange?: (lang: Language) => void;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'pill',
  value,
  onChange,
  className = '',
}) => {
  const { language, setLanguage, t } = useKisanSetu();
  const activeLang = value ?? language;
  const handleSelect = onChange ?? setLanguage;

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`} role="group" aria-label={t('common.selectLanguage')}>
        {SUPPORTED_LANGUAGES.map((opt) => {
          const active = activeLang === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => handleSelect(opt.code)}
              aria-pressed={active}
              className={`min-h-[54px] px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                active
                  ? 'bg-[#143A28] border-[#143A28] text-white'
                  : 'bg-white border-[#D8D4CA] text-[#17231B] hover:bg-[#F3F1EC]'
              }`}
            >
              <p className="text-sm font-semibold">{opt.nativeName}</p>
              <p className={`text-xs mt-0.5 ${active ? 'text-[#C7D6CB]' : 'text-[#5E6D63]'}`}>
                {opt.englishName}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'dark') {
    return (
      <div
        className={`inline-flex items-center p-1 bg-white/10 border border-white/15 rounded-lg backdrop-blur-sm ${className}`}
        role="group"
        aria-label={t('common.selectLanguage')}
      >
        {SUPPORTED_LANGUAGES.map((opt) => {
          const active = activeLang === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => handleSelect(opt.code)}
              aria-pressed={active}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-white text-[#143A28] shadow-xs'
                  : 'text-[#D4E0D7] hover:text-white'
              }`}
            >
              {opt.nativeName}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 bg-[#ECEAE3] rounded-lg ${className}`}
      role="group"
      aria-label={t('common.selectLanguage')}
    >
      {variant === 'pill' && (
        <Globe className="w-3.5 h-3.5 text-[#546358] ml-2 mr-1 hidden md:block shrink-0" aria-hidden="true" />
      )}
      {SUPPORTED_LANGUAGES.map((opt) => {
        const active = activeLang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => handleSelect(opt.code)}
            aria-pressed={active}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              active
                ? 'bg-white text-[#143A28] shadow-xs'
                : 'text-[#546358] hover:text-[#17231B]'
            }`}
          >
            {opt.nativeName}
          </button>
        );
      })}
    </div>
  );
};
