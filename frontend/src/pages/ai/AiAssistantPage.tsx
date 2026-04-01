import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  CalendarClock,
  Users,
  FileText,
  TrendingUp,
  Send,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface AiFeature {
  titleKey: string;
  descriptionNl: string;
  descriptionEn: string;
  descriptionRu: string;
  icon: React.ReactNode;
  badge: 'beta' | 'coming_soon';
  interactive?: boolean;
}

const FEATURES: AiFeature[] = [
  {
    titleKey: 'ai.smart_scheduling',
    descriptionNl: 'AI analyseert je boekingspatronen en stelt optimale planning voor',
    descriptionEn: 'AI analyzes your booking patterns and suggests optimal scheduling',
    descriptionRu: 'AI анализирует ваши шаблоны бронирования и предлагает оптимальное планирование',
    icon: <CalendarClock className="h-6 w-6" />,
    badge: 'beta',
    interactive: true,
  },
  {
    titleKey: 'ai.client_insights',
    descriptionNl: 'Krijg AI-gestuurde inzichten over klantvoorkeuren en bezoekpatronen',
    descriptionEn: 'Get AI-powered insights about client preferences and visit patterns',
    descriptionRu: 'Получайте AI-аналитику о предпочтениях клиентов и паттернах визитов',
    icon: <Users className="h-6 w-6" />,
    badge: 'coming_soon',
  },
  {
    titleKey: 'ai.auto_notes',
    descriptionNl: 'AI helpt professionele consultatienotities schrijven',
    descriptionEn: 'AI helps write professional consultation notes',
    descriptionRu: 'AI помогает писать профессиональные заметки о консультации',
    icon: <FileText className="h-6 w-6" />,
    badge: 'coming_soon',
  },
  {
    titleKey: 'ai.revenue_forecast',
    descriptionNl: 'Voorspel de omzet van volgende maand op basis van boekingstrends',
    descriptionEn: 'Predict next month\'s revenue based on booking trends',
    descriptionRu: 'Прогнозируйте доход за следующий месяц на основе трендов бронирования',
    icon: <TrendingUp className="h-6 w-6" />,
    badge: 'coming_soon',
  },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  'busiest': 'Based on your booking data, **Saturday** is your busiest day with an average of 12 appointments. Tuesday and Thursday are your second busiest days with 8-9 appointments each. Consider adding an extra employee on Saturdays to reduce wait times.',
  'gaps': 'I found 3 scheduling gaps this week:\n\n- **Tuesday 11:00-12:30** - 1.5 hour gap between appointments\n- **Wednesday 14:00-15:00** - 1 hour gap\n- **Friday 09:00-10:00** - Morning slot open\n\nThese gaps could fit 2-3 additional short treatments like a quick trim or blowout.',
  'optimal': 'Based on the last 3 months of data, here are my suggestions:\n\n1. **Extend Friday hours** to 20:00 - you have 6 unbooked requests for Friday evenings\n2. **Add lunch breaks** at 12:30 instead of 13:00 - most clients prefer 13:00-14:00 slots\n3. **Block 30min buffers** before color treatments - they frequently run over by 15-20 minutes',
};

function getDescriptionForLocale(feature: AiFeature, lang: string): string {
  switch (lang) {
    case 'nl': return feature.descriptionNl;
    case 'ru': return feature.descriptionRu;
    default: return feature.descriptionEn;
  }
}

export function AiAssistantPage() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { label: "What's my busiest day?", key: 'busiest' },
    { label: 'Show gaps this week', key: 'gaps' },
    { label: 'Suggest optimal hours', key: 'optimal' },
  ];

  const handleSend = (text: string, responseKey?: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = MOCK_RESPONSES[responseKey ?? ''] ??
        'I\'m still learning about your salon! Once you have more booking data, I\'ll be able to give you personalized scheduling insights. Try asking about your busiest days or scheduling gaps.';

      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickAction = (label: string, key: string) => {
    handleSend(label, key);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-7 w-7 text-primary-600" />
        <h1 className="text-2xl font-bold text-slate-900">{t('ai.title')}</h1>
      </div>

      {/* Feature cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map((feature) => (
          <Card key={feature.titleKey}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                {feature.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    {t(feature.titleKey)}
                  </h3>
                  <Badge variant={feature.badge === 'beta' ? 'confirmed' : 'coming_soon'}>
                    {feature.badge === 'beta' ? t('ai.beta') : t('ai.coming_soon')}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">
                  {getDescriptionForLocale(feature, i18n.language)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Interactive chat section */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-slate-900">{t('ai.smart_scheduling')}</h3>
            <Badge variant="confirmed">{t('ai.beta')}</Badge>
          </div>

          {/* Chat messages */}
          <div className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-3 rounded-lg bg-slate-50 p-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-[160px] text-sm text-slate-400">
                {t('ai.ask_placeholder')}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick action chips */}
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.key}
                onClick={() => handleQuickAction(action.label, action.key)}
                disabled={isTyping}
                className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder={t('ai.ask_placeholder')}
              disabled={isTyping}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className="flex items-center justify-center rounded-lg bg-primary-600 px-3 py-2 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
