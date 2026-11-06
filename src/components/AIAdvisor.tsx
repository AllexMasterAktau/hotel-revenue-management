/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { HotelKPIs, CompetitorData, SegmentData, ChannelData, AncillaryPOS, SimulationParameters, AIAdviceResponse } from '../types';
import { calculateMarketIndices } from '../data';
import { BrainCircuit, Loader2, Play, Sparkles, AlertCircle, CheckCircle, Flame, ShieldAlert, Send, MessageSquare, FileText } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface AIAdvisorProps {
  currentKpis: HotelKPIs;
  competitors: CompetitorData[];
  segments: SegmentData[];
  channels: ChannelData[];
  ancillaryPosList: AncillaryPOS[];
  currentParams: SimulationParameters;
}

export default function AIAdvisor({
  currentKpis,
  competitors,
  segments,
  channels,
  ancillaryPosList,
  currentParams
}: AIAdvisorProps) {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adviceData, setAdviceData] = useState<AIAdviceResponse | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Sub-tabs configuration
  const [activeSubTab, setActiveSubTab] = useState<'report' | 'chat'>('report');

  const welcomeMessageRu = 'Приветствую вас, господин Генеральный Менеджер! Я — ваш интеллектуальный ИИ-советник. Я в режиме реального времени отслеживаю все показатели симулятора. Готов ответить на любые ваши вопросы по управлению тарифами (ADR), максимизации TRevPAR/GOPPAR или продвижению дополнительных услуг. Какую задачу мы разберем сегодня?';
  const welcomeMessageEn = 'Greetings, Mr. General Manager! I am your AI executive advisor. I track all simulator metrics in real time and am ready to assist you with rate optimization (ADR), TRevPAR/GOPPAR maximization, or secondary sales strategies. What challenge shall we tackle today?';

  // Interactive chat message threads
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    {
      role: 'model',
      content: welcomeMessageRu
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync first message if it hasn't been changed
  useEffect(() => {
    if (chatMessages.length === 1) {
      setChatMessages([
        {
          role: 'model',
          content: isEn ? welcomeMessageEn : welcomeMessageRu
        }
      ]);
    }
  }, [language]);

  // Auto scroll chat to the bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSubTab]);

  const loadingTextsRu = [
    'Инициализация аналитического ядра AI Core...',
    'Анализ TRevPAR и корреляции с сегментами гостей...',
    'Сравнение индексов MPI, ARI, RGI с конкурентами...',
    'Вычисление маржинальности GOPPAR по точкам продаж POS...',
    'Формулирование стратегических инициатив для Генерального Менеджера...'
  ];

  const loadingTextsEn = [
    'Initializing AI Core analytics engine...',
    'Analyzing TRevPAR and guest segment correlation...',
    'Comparing MPI, ARI, RGI indices with competitors...',
    'Calculating GOPPAR margins across points of sale...',
    'Formulating strategic actions for the General Manager...'
  ];

  const loadingTexts = isEn ? loadingTextsEn : loadingTextsRu;

  // Cycle loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingTexts.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading, loadingTexts.length]);

  const requestAIAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const compsetIndices = calculateMarketIndices(currentKpis, competitors);

      const response = await fetch('/api/ai/advise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kpis: currentKpis,
          compset: compsetIndices,
          segments,
          channels,
          ancillary: ancillaryPosList,
          params: currentParams,
          language
        })
      });

      if (!response.ok) {
        throw new Error(isEn ? `Server error: ${response.statusText}` : `Ошибка сервера: ${response.statusText}`);
      }

      const data: AIAdviceResponse = await response.json();
      setAdviceData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isEn ? 'An unexpected error occurred while requesting AI assistance.' : 'Произошла непредвиденная ошибка при запросе к ИИ-ассистенту.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    const updatedMessages = [...chatMessages, { role: 'user' as const, content: userText }];
    setChatMessages(updatedMessages);

    try {
      const compsetIndices = calculateMarketIndices(currentKpis, competitors);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages,
          kpis: currentKpis,
          compset: compsetIndices,
          segments,
          channels,
          ancillary: ancillaryPosList,
          params: currentParams,
          language
        })
      });

      if (!response.ok) {
        throw new Error(isEn ? `Server error: ${response.statusText}` : `Ошибка сервера: ${response.statusText}`);
      }

      const data = await response.json();
      setChatMessages([...updatedMessages, { role: 'model' as const, content: data.response }]);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || (isEn ? 'Failed to send message to the AI Advisor.' : 'Не удалось отправить сообщение к ИИ-советнику.'));
    } finally {
      setChatLoading(false);
    }
  };

  // Safe lightweight markdown parser for premium custom rendering
  const parseBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-brand-gold font-bold">{part}</strong> : part);
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const cleanLine = line.trim();
      
      if (cleanLine.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-brand-gold mt-4 mb-2 uppercase tracking-wider font-mono border-b border-brand-border/40 pb-1 flex items-center">
            <Sparkles className="h-4 w-4 mr-1.5 text-brand-gold shrink-0" />
            {cleanLine.substring(4)}
          </h4>
        );
      }
      if (cleanLine.startsWith('#### ')) {
        return (
          <h5 key={idx} className="text-xs font-bold text-[#F5F2EB] mt-3 mb-1.5 uppercase font-mono">
            {cleanLine.substring(5)}
          </h5>
        );
      }
      if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        const bulletText = cleanLine.substring(2);
        return (
          <li key={idx} className="text-xs text-[#D1C9BC] ml-5 list-disc mb-1 leading-relaxed">
            {parseBold(bulletText)}
          </li>
        );
      }
      if (cleanLine === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-[#D1C9BC] leading-relaxed mb-2.5">
          {parseBold(cleanLine)}
        </p>
      );
    });
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium':
        return 'text-brand-gold bg-brand-gold/10 border-brand-gold/20';
      default:
        return 'text-[#D1C9BC] bg-[#F5F2EB]/5 border-[#F5F2EB]/10';
    }
  };

  return (
    <div id="ai-advisor-container" className="border border-brand-border rounded-xl p-5 bg-brand-card-bg/85 backdrop-blur-md shadow-2xl relative overflow-hidden">
      
      {/* Absolute premium aesthetic lines */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full filter blur-3xl -z-10" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <div>
          <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
            <BrainCircuit className="h-5 w-5 mr-2 text-brand-gold" />
            {isEn ? "AI Advisor to the General Manager" : "ИИ-советник Генерального менеджера (AI Executive Advisor)"}
          </h3>
          <p className="text-xs text-[#9C8F7E] font-mono mt-0.5">Generative Revenue Management Strategic Reports</p>
        </div>

        {activeSubTab === 'report' && !loading && (
          <button
            onClick={requestAIAdvice}
            className="w-full sm:w-auto bg-brand-gold hover:bg-brand-gold-hover text-brand-dark-bg px-5 py-2 rounded-lg text-xs font-bold font-sans flex items-center justify-center space-x-1.5 shadow-lg shadow-brand-gold/10 transition-all hover:scale-[1.03] cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-brand-dark-bg text-brand-dark-bg" />
            <span>{isEn ? "Generate AI Report" : "Сформировать отчет ИИ"}</span>
          </button>
        )}
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-brand-border/40 mb-5 gap-6 text-xs font-semibold font-mono uppercase tracking-wider">
        <button
          onClick={() => setActiveSubTab('report')}
          className={`pb-2.5 transition-all relative cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'report' ? 'text-brand-gold border-b-2 border-brand-gold font-bold' : 'text-[#9C8F7E] hover:text-[#F5F2EB]'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>{isEn ? "Strategic Report" : "Стратегический отчет"}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`pb-2.5 transition-all relative cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'chat' ? 'text-brand-gold border-b-2 border-brand-gold font-bold' : 'text-[#9C8F7E] hover:text-[#F5F2EB]'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{isEn ? "Interactive Chat" : "Интерактивный чат"}</span>
          <span className="bg-emerald-500 text-brand-dark-bg text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-normal ml-1">Live</span>
        </button>
      </div>

      {/* RENDER TAB 1: STRATEGIC REPORT */}
      {activeSubTab === 'report' && (
        <>
          {/* Initial state */}
          {!loading && !adviceData && !error && (
            <div className="text-center py-8 border border-dashed border-brand-border/40 rounded-xl bg-brand-input-bg/20">
              <BrainCircuit className="h-10 w-10 text-brand-gold/40 mx-auto mb-3" />
              <h4 className="text-xs font-bold text-[#F5F2EB] font-mono uppercase tracking-wide">
                {isEn ? "Ready for Metric Analysis" : "Готов к анализу показателей"}
              </h4>
              <p className="text-xs text-[#9C8F7E] max-w-md mx-auto mt-1 leading-relaxed">
                {isEn 
                  ? "Click the button above to run the generative AI model. It will analyze your revenue structure (TRevPAR/GOPPAR), occupancy shifts, channel commissions, and competitor positioning to output an expert plan of action."
                  : "Нажмите кнопку выше, чтобы запустить генеративную модель ИИ. Она обработает текущую структуру доходов (TRevPAR/GOPPAR), сдвиг загрузки, комиссии каналов и положение конкурентов, выдав экспертный план действий."}
              </p>
            </div>
          )}

          {/* Loading state with shimmer & staggered messages */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Loader2 className="h-10 w-10 text-brand-gold animate-spin" />
                <div className="absolute inset-0 bg-brand-gold/20 blur-xl rounded-full" />
              </div>
              <div className="text-center">
                <p className="text-xs font-mono text-white tracking-wide animate-pulse h-5">
                  {loadingTexts[loadingStep]}
                </p>
                <p className="text-[10px] text-[#9C8F7E] font-mono mt-1">
                  {isEn ? "Processing Rixos Aktau RMS Big Data..." : "Обработка больших данных RMS Rixos Aktau..."}
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="border border-rose-500/20 bg-rose-500/5 rounded-xl p-4 flex items-start space-x-3 text-xs leading-relaxed text-rose-300">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white font-mono uppercase mb-0.5">{isEn ? "Gemini API Integration Error" : "Ошибка интеграции Gemini API"}</p>
                <p>{error}</p>
                <button
                  onClick={requestAIAdvice}
                  className="mt-2.5 text-[10px] font-mono font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2 py-1 rounded text-white transition-colors"
                >
                  {isEn ? "Try Again" : "Попробовать снова"}
                </button>
              </div>
            </div>
          )}

          {/* Strategic Report Display */}
          {adviceData && !loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              
              {/* Main advice text (Parsed Markdown) */}
              <div className="lg:col-span-7 bg-brand-input-bg/40 border border-brand-border rounded-xl p-5 max-h-[500px] overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  {renderMarkdown(adviceData.advice)}
                </div>
              </div>

              {/* Strategic Action Items list */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-xs font-bold font-mono tracking-wider text-brand-gold uppercase flex items-center">
                  <Flame className="h-4 w-4 mr-1 text-brand-gold" />
                  {isEn ? "Tactical Action Plan (RoadMap)" : "План первоочередных действий (Tactical RoadMap)"}
                </h4>
                
                <div className="space-y-3">
                  {adviceData.strategicActions?.map((act, index) => (
                    <div
                      key={index}
                      className="bg-brand-input-bg/60 border border-brand-border/40 rounded-xl p-4 relative overflow-hidden group hover:bg-brand-input-bg transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-xs font-bold text-[#F5F2EB] font-sans tracking-tight group-hover:text-brand-gold transition-colors">
                          {act.title}
                        </span>
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full shrink-0 ${getPriorityStyle(act.priority)}`}>
                          {act.priority}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#D1C9BC] leading-relaxed mb-3">
                        {act.description}
                      </p>

                      <div className="flex justify-between items-center text-[10px] font-mono text-[#9C8F7E] border-t border-brand-border/40 pt-2.5">
                        <span>{isEn ? "Linked Metric:" : "Связанная метрика:"}</span>
                        <span className="text-emerald-400 font-bold border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded">
                          {act.impactMetric}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border border-brand-border rounded-lg p-3 bg-brand-input-bg/20 flex items-center space-x-2 text-[10px] text-[#9C8F7E] font-mono">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{isEn ? "Recommendations are optimized for Rixos Water World GOPPAR profitability." : "Рекомендации оптимизированы под маржинальность GOPPAR Rixos Water World."}</span>
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* RENDER TAB 2: INTERACTIVE CHAT */}
      {activeSubTab === 'chat' && (
        <div className="flex flex-col h-[500px] bg-brand-input-bg/20 border border-brand-border rounded-xl p-4 overflow-hidden relative">
          
          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 custom-scrollbar">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                {/* Bubble Header */}
                <span className="text-[10px] font-mono text-[#9C8F7E] mb-1">
                  {msg.role === 'user' 
                    ? (isEn ? 'General Manager' : 'Генеральный менеджер') 
                    : (isEn ? 'AI Advisor' : 'ИИ-советник AI')}
                </span>
                
                {/* Bubble content */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-gold/15 border border-brand-gold/30 text-[#F5F2EB] rounded-tr-none font-sans'
                      : 'bg-brand-input-bg/80 border border-brand-border/40 text-[#D1C9BC] rounded-tl-none shadow-md font-sans'
                  }`}
                >
                  <div className="space-y-1">
                    {renderMarkdown(msg.content)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading message */}
            {chatLoading && (
              <div className="flex flex-col max-w-[85%] mr-auto items-start animate-pulse">
                <span className="text-[10px] font-mono text-[#9C8F7E] mb-1">
                  {isEn ? "AI Advisor is typing..." : "ИИ-советник печатает..."}
                </span>
                <div className="bg-brand-input-bg/40 border border-brand-border/30 rounded-2xl rounded-tl-none p-3.5 flex items-center space-x-2 text-xs text-[#9C8F7E]">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-gold" />
                  <span>{isEn ? "Formulating answer based on metrics..." : "Формулирование ответа на основе метрик..."}</span>
                </div>
              </div>
            )}

            {/* Local Chat Error */}
            {chatError && (
              <div className="border border-rose-500/20 bg-rose-500/5 rounded-xl p-3 flex items-start space-x-2 text-xs leading-relaxed text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white font-mono uppercase text-[10px] mb-0.5">{isEn ? "Chat Error" : "Ошибка чата"}</p>
                  <p className="text-[11px]">{chatError}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic input form */}
          <form onSubmit={handleSendMessage} className="flex gap-2.5 border-t border-brand-border/30 pt-3 mt-auto">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isEn ? "Ask AI about rates, TRevPAR, channels, or ancillary revenues..." : "Спросите ИИ о тарифах, TRevPAR, каналах продаж или доп. доходах..."}
              disabled={chatLoading}
              className="flex-1 bg-brand-input-bg/95 border border-brand-border hover:border-brand-gold/30 focus:border-brand-gold rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-gold/30 placeholder-[#6D6356] font-sans transition-all"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="bg-brand-gold hover:bg-brand-gold-hover disabled:bg-brand-input-bg/60 disabled:text-[#9C8F7E]/40 text-brand-dark-bg p-2.5 rounded-lg text-xs font-bold font-sans flex items-center justify-center shrink-0 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
