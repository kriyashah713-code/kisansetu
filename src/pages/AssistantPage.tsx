import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, Send, Sprout, Trash2, Wrench } from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { aiService, KisanSetuAssistantToolsSnapshot } from '../services/aiService';
import { LANGUAGE_LABELS } from '../i18n';
import { marketService } from '../services/marketService';
import { weatherService } from '../services/weatherService';
import { ChatMessage, MarketPrice, WeatherData } from '../types/kisansetu';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const AssistantPage: React.FC = () => {
  const { state, t, addChatMessages, clearChatMessages, pushToast } = useKisanSetu();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [marketSnapshot, setMarketSnapshot] = useState<MarketPrice[]>([]);
  const [weatherSnapshot, setWeatherSnapshot] = useState<WeatherData | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = [
    t('assistant.q1'),
    t('assistant.q2'),
    t('assistant.q3'),
    t('assistant.q4'),
    t('assistant.q5'),
  ];

  useEffect(() => {
    marketService.getMarketPrices().then(setMarketSnapshot);
    weatherService
      .getFarmWeather(`${state.profile.village}, ${state.profile.district}`)
      .then(setWeatherSnapshot);
  }, [state.profile.village, state.profile.district]);

  const buildToolsSnapshot = (): KisanSetuAssistantToolsSnapshot => ({
    getFarmerProfile: () => state.profile,
    getFarmData: () => state.farm,
    getCropData: () => state.crops,
    getLatestCropScan: () => state.scans[0] || null,
    getMarketData: () => marketSnapshot,
    getBuyerRequirements: () => state.requirements,
    getWeatherData: () =>
      weatherSnapshot || {
        location: `${state.profile.village}, ${state.profile.district}`,
        currentTempC: 29,
        condition: 'Partly Cloudy',
        humidityPct: 62,
        windKmh: 11,
        rainProbabilityToday: 20,
        isDemoData: true,
        forecast: [],
        alerts: [],
      },
  });

  const sendMessage = async (textToSend?: string) => {
    const clean = (textToSend ?? input).trim();
    if (!clean || sending) return;

    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      text: clean,
      timestamp: nowLabel,
      language: state.language,
    };

    if (!textToSend) setInput('');
    setSending(true);

    try {
      const { reply, sourceLabel, interactionId, toolsUsed } =
        await aiService.chatWithInteractionsApi(
          clean,
          state.language,
          buildToolsSnapshot(),
          state.lastInteractionId
        );

      const aiMsg: ChatMessage = {
        id: `msg-a-${Date.now() + 1}`,
        role: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: state.language,
        sourceLabel,
        toolsUsed,
      };

      addChatMessages([userMsg, aiMsg], interactionId, {
        farmerName: state.profile.name,
        language: state.language,
        query: clean,
        responsePreview: reply.slice(0, 140),
        source: sourceLabel,
      });

      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    } finally {
      setSending(false);
    }
  };

  const handleVoiceToggle = () => {
    const SpeechRec =
      (
        window as unknown as {
          SpeechRecognition?: new () => unknown;
          webkitSpeechRecognition?: new () => unknown;
        }
      ).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRec) {
      setListening(true);
      setTimeout(() => {
        setListening(false);
        setInput(t('assistant.q2'));
        pushToast({
          title: t('assistant.voiceUnavailableTitle'),
          description: t('assistant.voiceUnavailableDesc'),
          variant: 'info',
        });
      }, 800);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition: any = new (SpeechRec as any)();
      recognition.lang =
        state.language === 'gu' ? 'gu-IN' : state.language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onerror = () => {
        setListening(false);
        pushToast({
          title: t('assistant.micUnavailableTitle'),
          description: t('assistant.micUnavailableDesc'),
          variant: 'warning',
        });
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) setInput(transcript);
      };
      recognition.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] lg:h-[calc(100vh-8rem)] space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E5E2DA] rounded-2xl p-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-[#17231B]">
            {t('assistant.title')}
          </h1>
          <p className="text-xs text-[#546358]">
            {t('assistant.subtitle')} ·{' '}
            <span className="font-semibold text-[#216B43]">
              {t('assistant.languageActiveBadge', { lang: LANGUAGE_LABELS[state.language] })}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={clearChatMessages}
            className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D4CA] hover:bg-[#F3F1EC] text-xs font-medium text-[#3D4E42] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('assistant.clearChat')}</span>
          </button>

          <LanguageSwitcher variant="compact" />
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-[#546358]">
          {t('assistant.suggestedTitle')} · {t('assistant.voiceHint')}
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((qText) => (
            <button
              key={qText}
              type="button"
              onClick={() => sendMessage(qText)}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white border border-[#DEDAD0] hover:border-[#216B43] text-xs font-medium text-[#17231B] transition-colors cursor-pointer text-left"
            >
              {qText}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 bg-white border border-[#E5E2DA] rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4">
        {state.chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[88%] sm:max-w-xl rounded-2xl px-4 py-3 ${
                  isUser
                    ? 'bg-[#143A28] text-white'
                    : 'bg-[#F8F7F4] border border-[#E5E2DA] text-[#17231B]'
                }`}
              >
                {!isUser && (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#216B43] mb-1">
                    <span className="inline-flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5" />
                      {msg.sourceLabel || t('nav.aiAssistant')}
                    </span>
                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[#546358] font-mono font-normal">
                        <Wrench className="w-3 h-3" />
                        {msg.toolsUsed.join(', ')}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                <p
                  className={`text-[10px] font-mono mt-1.5 ${
                    isUser ? 'text-[#B8CABD]' : 'text-[#6A786E]'
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 bg-[#F8F7F4] border border-[#E5E2DA] inline-flex items-center gap-2 text-xs text-[#546358]">
              <Loader2 className="w-4 h-4 animate-spin text-[#216B43]" />
              <span>{t('assistant.thinking')}</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-2 bg-white border border-[#E5E2DA] rounded-2xl p-2"
      >
        <button
          type="button"
          onClick={handleVoiceToggle}
          aria-label={t('assistant.voiceHint')}
          className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            listening
              ? 'bg-[#B91C1C] text-white'
              : 'bg-[#F3F1EC] hover:bg-[#E7E4DC] text-[#143A28]'
          }`}
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('assistant.placeholder')}
          className="flex-1 min-h-[44px] px-3 text-sm bg-transparent focus:outline-none"
        />

        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="min-h-[44px] px-4 rounded-xl bg-[#216B43] hover:bg-[#195434] disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{t('assistant.sendBtn')}</span>
        </button>
      </form>
    </div>
  );
};
