import React from 'react';
import { Utensils } from 'lucide-react';
import { SimulationParameters } from '../types';

interface FbDashboardProps {
  language: 'ru' | 'en';
  currentParams: SimulationParameters;
  setCurrentParams: React.Dispatch<React.SetStateAction<SimulationParameters>>;
  currency: 'KZT' | 'USD';
  ancillaryPosList: any[];
  baselineAncillaryList: any[];
  onOpenImport?: (dept: 'frontoffice' | 'spa' | 'fb' | 'finance' | 'salesmarketing' | 'hr' | 'engineering') => void;
}

export default function FbDashboard({
  language,
  currentParams,
  setCurrentParams,
  currency,
  ancillaryPosList,
  baselineAncillaryList,
  onOpenImport,
}: FbDashboardProps) {
  const formatKZT = (val: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(val) + ' ₸';
  const formatUSD = (val: number) => '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);
  const formatVal = (val: number) => currency === 'USD' ? formatUSD(val) : formatKZT(val);

  return (
    <div className="space-y-6">
      <div className="border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20">
              <Utensils className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-text-primary uppercase tracking-wide">
                {language === 'ru' ? 'Управление Ресторанами и Барами (Food & Beverage)' : 'Food & Beverage Operations Hub'}
              </h4>
              <p className="text-xs text-brand-text-secondary mt-0.5 font-sans">
                {language === 'ru' 
                  ? 'Моделируйте доп. продажи элитного алкоголя, платные меню A la Carte ресторанов и банкеты MICE.' 
                  : 'Simulate premium beverage upsells, specialized A la Carte dinners, and corporate MICE group banquets.'}
              </p>
            </div>
          </div>
          {onOpenImport && (
            <button
              onClick={() => onOpenImport('fb')}
              className="px-4 py-2 bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-500 hover:to-brand-gold text-neutral-950 font-extrabold text-xs rounded-lg transition-all shadow-md hover:shadow-brand-gold/10 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center shrink-0 border border-amber-600/20 active:scale-95"
            >
              <span>📥 {language === 'ru' ? 'Импорт отчета F&B' : 'Import F&B Report'}</span>
            </button>
          )}
        </div>

        {/* F&B slider */}
        <div className="mt-6 border-t border-brand-border/40 pt-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-brand-text-primary font-bold">
              {language === 'ru' ? 'Фактор доп. продаж питания (F&B Upsell Factor)' : 'F&B Upsell Factor'}
            </span>
            <span className="text-xs text-brand-text-muted font-mono">
              {language === 'ru' ? 'Фактор прироста:' : 'Growth factor:'} <strong className="text-brand-text-primary">{currentParams.fbUpsellFactor}%</strong>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="-30"
              max="50"
              value={currentParams.fbUpsellFactor}
              onChange={(e) => setCurrentParams({ ...currentParams, fbUpsellFactor: parseInt(e.target.value) || 0 })}
              className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
            />
            <div className="flex items-center space-x-1 shrink-0">
              <input
                type="number"
                value={currentParams.fbUpsellFactor}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCurrentParams({ ...currentParams, fbUpsellFactor: isNaN(val) ? 0 : val });
                }}
                className="w-16 bg-brand-input-bg border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-0.5 px-1 font-mono font-bold focus:outline-none"
              />
              <span className="text-brand-text-muted text-xs font-mono">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* F&B POS details */}
      {(() => {
        const pos = ancillaryPosList.find(p => p.id === 'f_b');
        const basePos = baselineAncillaryList.find(p => p.id === 'f_b');
        if (!pos) return null;
        return (
          <div className="border border-brand-border rounded-xl p-5 bg-brand-card-bg shadow-lg">
            <h5 className="font-bold text-brand-text-primary text-sm flex justify-between items-center mb-3">
              <span>🍽️ {language === 'ru' ? 'Ресторанная статистика и выручка' : 'F&B Outlet Statistics & Revenue'}</span>
              <span className="font-mono text-xs text-emerald-500 font-extrabold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {language === 'ru' ? 'АКТИВНО' : 'ACTIVE'}
              </span>
            </h5>
            <p className="text-xs text-brand-text-secondary mb-5 leading-relaxed">
              {pos.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-brand-border/40 pt-4">
              <div>
                <div className="text-[10px] text-brand-text-muted uppercase tracking-wider font-mono">{language === 'ru' ? 'Суточная выручка' : 'Daily Revenue'}</div>
                <div className="text-lg font-mono font-extrabold text-brand-text-primary mt-1">
                  {formatVal(pos.currentRevenue)}
                </div>
                <div className="text-xs text-brand-text-muted font-mono mt-0.5">
                  {language === 'ru' ? 'Базовая: ' : 'Baseline: '}
                  {formatVal(basePos?.baselineRevenue || 0)}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-brand-text-muted uppercase tracking-wider font-mono">{language === 'ru' ? 'Количество транзакций (чеки)' : 'Transactions (Covers)'}</div>
                <div className="text-lg font-mono font-extrabold text-[#1C1814] mt-1">
                  {pos.visitorCount} {language === 'ru' ? 'чеков/сут.' : 'covers/day'}
                </div>
                <div className="text-xs text-brand-text-muted font-sans mt-0.5">
                  {language === 'ru' ? 'Ориентировочный трафик проживающих' : 'In-house guests dining traffic'}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-brand-text-muted uppercase tracking-wider font-mono">{language === 'ru' ? 'Средний чек' : 'Average Cover Spend'}</div>
                <div className="text-lg font-mono font-extrabold text-brand-text-primary mt-1">
                  {formatVal(pos.averageSpend)}
                </div>
                <div className="text-xs text-brand-text-muted font-mono mt-0.5">
                  {language === 'ru' ? 'Прирост среднего чека: ' : 'Spend increment: '}
                  <strong className="text-brand-text-primary">+{currentParams.fbUpsellFactor}%</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-brand-input-bg/40 p-4 rounded-lg border border-brand-border/40">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-text-secondary font-bold font-sans">
                  {language === 'ru' ? 'Вклад ресторанов в TRevPAR:' : 'Restaurant contribution to TRevPAR:'}
                </span>
                <span className="font-mono text-brand-text-primary font-black">
                  {formatVal(Math.round(pos.currentRevenue / 515))}
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
