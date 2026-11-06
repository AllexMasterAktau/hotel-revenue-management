import React from 'react';
import { Target, TrendingUp, Users, DollarSign, Percent, BarChart3, PieChart, Sparkles } from 'lucide-react';
import { SimulationParameters } from '../types';

interface SalesMarketingDashboardProps {
  language: 'ru' | 'en';
  currentParams: SimulationParameters;
  setCurrentParams: React.Dispatch<React.SetStateAction<SimulationParameters>>;
  currency: 'KZT' | 'USD';
  onOpenImport?: (dept: 'frontoffice' | 'spa' | 'fb' | 'finance' | 'salesmarketing' | 'hr' | 'engineering') => void;
}

export default function SalesMarketingDashboard({
  language,
  currentParams,
  setCurrentParams,
  currency,
  onOpenImport,
}: SalesMarketingDashboardProps) {
  const isEn = language === 'en';
  const formatMoney = (val: number) => {
    const formatted = currency === 'USD' 
      ? `$${(val / 500).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      : `${val.toLocaleString('ru-RU')} ₸`;
    return formatted;
  };

  const channelCommissionRate = currentParams.channelCommissionRate ?? 12.5;

  return (
    <div className="space-y-6">
      {/* Department Header Card */}
      <div className="border border-[#E5DEC9] rounded-xl p-5 bg-[#FCFAF4] shadow-md text-[#2B2723]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-amber-800" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#2B2723] uppercase tracking-wide flex items-center gap-2 font-display">
                <span>🎯 {isEn ? 'Sales & Marketing Intelligence Dashboard' : 'Маркетинг и Продажи (Sales & Marketing)'}</span>
              </h4>
              <p className="text-xs text-[#5C5246] mt-0.5 font-sans leading-relaxed">
                {isEn 
                  ? 'Optimize customer acquisition cost (CAC), OTA channel distribution commissions, MICE corporate group contracts, and digital campaign ROAS.' 
                  : 'Управление стоимостью привлечения (CAC), комиссиями OTA каналов, корпоративными контрактами MICE и рентабельностью рекламных кампаний (ROAS).'}
              </p>
            </div>
          </div>
          {onOpenImport && (
            <button
              onClick={() => onOpenImport('salesmarketing')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-neutral-950 font-extrabold text-xs rounded-lg transition-all shadow-md hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center shrink-0 border border-amber-400/30 active:scale-95"
            >
              <span>📥 {isEn ? 'Import Sales & Marketing Report' : 'Импорт отчета Sales & Marketing'}</span>
            </button>
          )}
        </div>

        {/* Marketing KPI Metrics - 4 Light Cream Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-[#F5F0E6] border border-[#E2D9C5] shadow-sm transition-all hover:border-amber-400">
            <div className="flex items-center justify-between text-[#6E6252] text-[10px] font-mono uppercase tracking-wider font-semibold">
              <span>{isEn ? 'Avg Acquisition Cost (CAC)' : 'Ср. стоимость привлечения (CAC)'}</span>
              <DollarSign className="h-3.5 w-3.5 text-amber-800" />
            </div>
            <div className="text-xl font-extrabold font-mono text-[#2B2723] mt-1">
              {formatMoney(18500)}
            </div>
            <span className="text-[10px] font-mono font-extrabold text-emerald-950 bg-emerald-200/90 border border-emerald-400/60 px-2 py-0.5 rounded mt-1.5 inline-block">
              ↓ -8.4% {isEn ? 'vs prev. month' : 'к пред. месяцу'}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#F5F0E6] border border-[#E2D9C5] shadow-sm transition-all hover:border-amber-400">
            <div className="flex items-center justify-between text-[#6E6252] text-[10px] font-mono uppercase tracking-wider font-semibold">
              <span>{isEn ? 'OTA Commission Rate' : 'Ср. комиссия OTA каналов'}</span>
              <Percent className="h-3.5 w-3.5 text-amber-800" />
            </div>
            <div className="text-xl font-extrabold font-mono text-amber-900 mt-1">
              {channelCommissionRate.toFixed(1)}%
            </div>
            <span className="text-[10px] text-[#5C5246] mt-1.5 block font-mono font-medium">
              {isEn ? 'Direct bookings: 42%' : 'Прямые брони: 42%'}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#F5F0E6] border border-[#E2D9C5] shadow-sm transition-all hover:border-amber-400">
            <div className="flex items-center justify-between text-[#6E6252] text-[10px] font-mono uppercase tracking-wider font-semibold">
              <span>{isEn ? 'MICE Group Share' : 'Доля MICE & Корпоратов'}</span>
              <Users className="h-3.5 w-3.5 text-blue-800" />
            </div>
            <div className="text-xl font-extrabold font-mono text-[#2B2723] mt-1">
              24.5%
            </div>
            <span className="text-[10px] font-mono font-extrabold text-blue-950 bg-blue-200/90 border border-blue-400/60 px-2 py-0.5 rounded mt-1.5 inline-block">
              +3.2% {isEn ? 'vs target' : 'к цели'}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#F5F0E6] border border-[#E2D9C5] shadow-sm transition-all hover:border-amber-400">
            <div className="flex items-center justify-between text-[#6E6252] text-[10px] font-mono uppercase tracking-wider font-semibold">
              <span>{isEn ? 'Marketing ROAS' : 'Окупаемость рекламы (ROAS)'}</span>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-800" />
            </div>
            <div className="text-xl font-extrabold font-mono text-emerald-900 mt-1">
              580%
            </div>
            <span className="text-[10px] font-mono font-extrabold text-emerald-950 bg-emerald-200/90 border border-emerald-400/60 px-2 py-0.5 rounded mt-1.5 inline-block">
              5.8x {isEn ? 'revenue per ad $' : 'выручки на 1$ рекламы'}
            </span>
          </div>
        </div>
      </div>

      {/* Distribution & Campaign Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Mix Optimization */}
        <div className="border border-[#E5DEC9] rounded-xl p-5 bg-[#FCFAF4] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
            <h5 className="text-xs font-bold text-[#8B6B23] uppercase tracking-wider flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[#8B6B23]" />
              <span>{isEn ? 'Sales Channel Mix & Commission Control' : 'Микс каналов продаж и контроль комиссий'}</span>
            </h5>
            <span className="text-[10px] font-mono font-bold text-[#6E6252] bg-[#EFE8DA] px-2 py-0.5 rounded border border-[#D8CFB8]">
              {isEn ? 'Channel Yield' : 'Доходность каналов'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-[#2B2723] font-semibold">{isEn ? 'OTA Commission Rate (%)' : 'Средняя ставка комиссий OTA (%)'}</span>
                <span className="text-amber-800 font-extrabold">{channelCommissionRate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="8"
                max="25"
                step="0.5"
                value={channelCommissionRate}
                onChange={(e) => setCurrentParams(prev => ({
                  ...prev,
                  channelCommissionRate: parseFloat(e.target.value)
                }))}
                className="w-full accent-amber-600 h-2 bg-[#EFE8DA] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6E6252] font-mono mt-1 font-medium">
                <span>8.0% ({isEn ? 'Direct Focus' : 'Фокус на прямые продажи'})</span>
                <span>25.0% ({isEn ? 'High OTA Dependency' : 'Высокая зависимость от OTA'})</span>
              </div>
            </div>

            <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E2D9C5] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#2B2723] font-bold">🌐 {isEn ? 'Direct Brand Web Engine' : 'Прямые продажи (Официальный сайт)'}</span>
                <span className="text-emerald-950 font-extrabold bg-emerald-200/90 px-2 py-0.5 rounded border border-emerald-400/60">
                  42.0% {isEn ? 'share' : 'доля'}
                </span>
              </div>
              <div className="w-full bg-[#E2D9C5] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '42%' }}></div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="text-[#2B2723] font-bold">🏢 {isEn ? 'OTA Intermediaries (Booking, Agoda)' : 'OTA посредники (Booking, Agoda)'}</span>
                <span className="text-amber-950 font-extrabold bg-amber-200/90 px-2 py-0.5 rounded border border-amber-400/60">
                  38.0% {isEn ? 'share' : 'доля'}
                </span>
              </div>
              <div className="w-full bg-[#E2D9C5] h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '38%' }}></div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="text-[#2B2723] font-bold">👔 {isEn ? 'Corporate & MICE Direct Contracts' : 'Корпоративные контракты и MICE'}</span>
                <span className="text-blue-950 font-extrabold bg-blue-200/90 px-2 py-0.5 rounded border border-blue-400/60">
                  20.0% {isEn ? 'share' : 'доля'}
                </span>
              </div>
              <div className="w-full bg-[#E2D9C5] h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Marketing Campaign Performance */}
        <div className="border border-[#E5DEC9] rounded-xl p-5 bg-[#FCFAF4] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
            <h5 className="text-xs font-bold text-[#8B6B23] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#8B6B23]" />
              <span>{isEn ? 'Campaign Performance & MICE Pipeline' : 'Рекламные кампании и пайплайн MICE'}</span>
            </h5>
            <span className="text-[10px] font-mono font-bold text-[#6E6252] bg-[#EFE8DA] px-2 py-0.5 rounded border border-[#D8CFB8]">
              {isEn ? 'Active Campaigns' : 'Активные кампании'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E2D9C5] shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#2B2723]">
                  🏖️ {isEn ? 'Summer Beach Resort Promo (GCC/CIS)' : 'Летняя акция Beach Resort (GCC/СНГ)'}
                </div>
                <div className="text-[10px] text-[#5C5246] font-mono mt-0.5 font-medium">ROAS: 640% • CAC: {formatMoney(14200)}</div>
              </div>
              <span className="text-[10px] font-mono font-extrabold text-emerald-950 bg-emerald-200/90 border border-emerald-400/60 px-2.5 py-0.5 rounded shadow-sm">
                {isEn ? 'ACTIVE' : 'АКТИВНА'}
              </span>
            </div>

            <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E2D9C5] shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#2B2723]">
                  👔 {isEn ? 'Autumn Corporate MICE & Banquet Fair' : 'Осенний MICE & Ярмарка банкетов'}
                </div>
                <div className="text-[10px] text-[#5C5246] font-mono mt-0.5 font-medium">ROAS: 520% • CAC: {formatMoney(22000)}</div>
              </div>
              <span className="text-[10px] font-mono font-extrabold text-emerald-950 bg-emerald-200/90 border border-emerald-400/60 px-2.5 py-0.5 rounded shadow-sm">
                {isEn ? 'ACTIVE' : 'АКТИВНА'}
              </span>
            </div>

            <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E2D9C5] shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#2B2723]">
                  🧖‍♀️ {isEn ? 'Anjana SPA Day-Pass Wellness Campaign' : 'Промо Wellness & SPA Day-Pass'}
                </div>
                <div className="text-[10px] text-[#5C5246] font-mono mt-0.5 font-medium">ROAS: 480% • CAC: {formatMoney(9500)}</div>
              </div>
              <span className="text-[10px] font-mono font-extrabold text-amber-950 bg-amber-200/90 border border-amber-400/60 px-2.5 py-0.5 rounded shadow-sm">
                {isEn ? 'OPTIMIZING' : 'ОПТИМИЗАЦИЯ'}
              </span>
            </div>

            <div className="pt-2 text-[11px] text-[#5C5246] font-sans flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-800 shrink-0" />
              <span>
                {isEn 
                  ? 'Importing the Sales & Marketing BI Excel report automatically updates channel CAC and optimizes commission leakages.'
                  : 'Загрузка BI Excel отчета Sales & Marketing автоматически обновляет стоимость привлечения CAC и оптимизирует структуры комиссий.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
