import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { ASSETS } from '../services/mockData';
import { LanguageSwitcher } from './LanguageSwitcher';

interface OpeningExperienceProps {
  onComplete: () => void;
}

export const OpeningExperience: React.FC<OpeningExperienceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const { t } = useKisanSetu();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 900);
    const t2 = setTimeout(() => setPhase(3), 2100);
    const t3 = setTimeout(() => setPhase(4), 3100);
    const t4 = setTimeout(() => onComplete(), 4900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#101D15] text-[#F8F7F4] flex flex-col justify-between">
      {/* Real farmland backdrop emerging gradually */}
      <motion.div
        initial={{ opacity: 0.08, scale: 1.08 }}
        animate={{
          opacity: phase >= 3 ? 0.42 : phase === 2 ? 0.22 : 0.1,
          scale: phase >= 3 ? 1 : 1.04,
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <img
          src={ASSETS.farmlandHero}
          alt="Sunlit Indian farmland at dawn"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E1B13]/85 via-[#13281C]/65 to-[#0B160F]/95" />
      </motion.div>

      {/* Subtle digital precision agriculture grid network */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 3 ? 0.45 : 0 }}
        transition={{ duration: 0.9 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(196, 143, 41, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(196, 143, 41, 0.14) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Subtle golden morning particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: '16%', top: '28%', delay: 0.2 },
          { left: '34%', top: '62%', delay: 0.6 },
          { left: '68%', top: '24%', delay: 0.4 },
          { left: '82%', top: '58%', delay: 0.8 },
          { left: '52%', top: '76%', delay: 1.1 },
        ].map((dot, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: [0, 0.55, 0], y: [-6, -26, -40] }}
            transition={{
              duration: 3.4,
              delay: dot.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ left: dot.left, top: dot.top }}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#D9A74A]/70"
          />
        ))}
      </div>

      {/* Top minimal bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-12 md:py-5">
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs tracking-[0.16em] uppercase text-[#C9D5CC] font-medium">
            {t('intro.badgeAi')}
          </span>
          <LanguageSwitcher variant="dark" />
        </div>
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#F8F7F4] bg-white/10 hover:bg-white/18 border border-white/20 rounded-lg backdrop-blur-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>{t('intro.skipIntro')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Stage: Seed -> Sprout -> Digital Field -> Brand Reveal */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto">
        <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
          {/* Horizon soil line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.65 }}
            transition={{ duration: 0.7 }}
            className="absolute bottom-6 w-28 h-[1.5px] bg-gradient-to-r from-transparent via-[#C48F29] to-transparent"
          />

          {/* Tiny seed -> growing sprout SVG */}
          <svg viewBox="0 0 120 120" className="w-28 h-28 overflow-visible" aria-hidden="true">
            {/* Seed */}
            <motion.ellipse
              cx="60"
              cy="90"
              rx="4.5"
              ry="6.5"
              fill="#C48F29"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: phase >= 2 ? 0.9 : 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />

            {/* Main stem growing upwards */}
            <motion.path
              d="M60 88 C60 72, 60 56, 60 36"
              fill="none"
              stroke="#6EE7A8"
              strokeWidth="2.8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: phase >= 2 ? 1 : 0, opacity: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Left leaf */}
            <motion.path
              d="M60 64 C46 62, 34 52, 36 40 C47 41, 56 50, 60 64 Z"
              fill="#3B9B64"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: phase >= 2 ? 1 : 0, opacity: phase >= 2 ? 0.95 : 0 }}
              transition={{ duration: 0.65, delay: 0.35 }}
              style={{ transformOrigin: '60px 64px' }}
            />

            {/* Right leaf */}
            <motion.path
              d="M60 54 C74 51, 86 41, 84 29 C73 30, 64 40, 60 54 Z"
              fill="#6EE7A8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: phase >= 2 ? 1 : 0, opacity: phase >= 2 ? 0.95 : 0 }}
              transition={{ duration: 0.65, delay: 0.5 }}
              style={{ transformOrigin: '60px 54px' }}
            />

            {/* Network nodes connecting plant to intelligence grid */}
            {phase >= 3 && (
              <>
                <motion.circle
                  cx="36"
                  cy="40"
                  r="3"
                  fill="#E8B954"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.35 }}
                />
                <motion.circle
                  cx="84"
                  cy="29"
                  r="3"
                  fill="#E8B954"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                />
                <motion.line
                  x1="36"
                  y1="40"
                  x2="84"
                  y2="29"
                  stroke="#E8B954"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.65 }}
                  transition={{ duration: 0.5 }}
                />
              </>
            )}
          </svg>
        </div>

        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-[0.06em] text-[#F8F7F4]">
                KISANSETU
              </h1>
              <p className="text-base md:text-xl text-[#D4E0D7] max-w-xl mx-auto leading-relaxed font-normal">
                “{t('common.tagline')}”
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8"
          >
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#216B43] hover:bg-[#298051] text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg"
            >
              <span>{t('intro.enterApp')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Bottom subtle progression bar */}
      <div className="relative z-10 px-6 py-6 md:px-12 flex items-center justify-between gap-4 text-xs text-[#9EB0A3]">
        <span className="truncate">{t('dashboard.journeySteps')}</span>
        <div className="w-28 h-1 bg-white/15 rounded-full overflow-hidden shrink-0">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 4.8, ease: 'linear' }}
            style={{ transformOrigin: 'left' }}
            className="h-full bg-[#C48F29]"
          />
        </div>
      </div>
    </div>
  );
};
