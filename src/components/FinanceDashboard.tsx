import React from 'react';
import { Wallet } from 'lucide-react';
import { SimulationParameters } from '../types';

interface FinanceDashboardProps {
  language: 'ru' | 'en';
  currentParams: SimulationParameters;
  setCurrentParams: React.Dispatch<React.SetStateAction<SimulationParameters>>;
  currency: 'KZT' | 'USD';
  currentKpis: any;
  ancillaryPosList: any[];
  onOpenImport?: (dept: 'frontoffice' | 'spa' | 'fb' | 'finance' | 'salesmarketing' | 'hr' | 'engineering') => void;
}

export default function FinanceDashboard({
  language,
  currentParams,
  setCurrentParams,
  currency,
  currentKpis,
  ancillaryPosList,
  onOpenImport,
}: FinanceDashboardProps) {
  const formatKZT = (val: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(val) + ' ₸';
  const formatUSD = (val: number) => '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);
  const formatVal = (val: number) => currency === 'USD' ? formatUSD(val) : formatKZT(val);

  // Re-calculate the expenses exactly as is done in the backend algorithm in data.ts
  const baseOcc = currentParams.baseOccupancy !== undefined ? currentParams.baseOccupancy : 76;
  const stdOccupancy = baseOcc === 0 ? Math.max(0, Math.min(100, currentParams.occupancyShift)) : Math.max(10, Math.min(100, baseOcc + currentParams.occupancyShift));
  const villasOccupancy = baseOcc === 0 ? Math.max(0, Math.min(100, currentParams.occupancyShift * 0.8)) : Math.max(5, Math.min(100, 60 + currentParams.occupancyShift * 0.8));
  const stdOccupied = Math.round(500 * (stdOccupancy / 100));
  const villasOccupied = Math.round(15 * (villasOccupancy / 100));
  
  const baseVariableCostPerRoom = 26000;
  const variableCostPerRoom = baseVariableCostPerRoom * (1 - currentParams.costControlSaving / 100);
  const totalVariableCost = (stdOccupied + villasOccupied * 2.5) * variableCostPerRoom;

  const baseFixedCost = 24000000;
  const fixedCost = baseFixedCost * (1 - (currentParams.costControlSaving * 0.5) / 100);

  const f_b_rev = ancillaryPosList.find(p => p.id === 'f_b')?.currentRevenue || 0;
  const spa_rev = ancillaryPosList.find(p => p.id === 'spa')?.currentRevenue || 0;
  const cabanas_rev = ancillaryPosList.find(p => p.id === 'cabanas')?.currentRevenue || 0;
  const theme_rev = ancillaryPosList.find(p => p.id === 'themepark')?.currentRevenue || 0;

  const fbCost = f_b_rev * 0.38 * (1 - currentParams.costControlSaving / 100);
  const spaCost = spa_rev * 0.30 * (1 - currentParams.costControlSaving / 100);
  const cabanasCost = cabanas_rev * 0.10;
  const themeparkCost = theme_rev * 0.15;
  const totalAncillaryCosts = fbCost + spaCost + cabanasCost + themeparkCost;

  const totalCostOfSales = Math.round(totalVariableCost + fixedCost + totalAncillaryCosts);
  const totalRev = currentKpis.totalRevenue;
  const calculatedGop = currentKpis.gop;

  return (
    <div className="space-y-6">
      <div className="border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-text-primary uppercase tracking-wide">
                {language === 'ru' ? 'Управление Финансами и Расходами (OPEX Control)' : 'Financial & Operational Expense Control'}
              </h4>
              <p className="text-xs text-brand-text-secondary mt-0.5 font-sans">
                {language === 'ru' 
                  ? 'Контролируйте уровень издержек (GOP Cost Control) и анализируйте структуру расходов.' 
                  : 'Apply expense optimization percentage (GOP Cost Control) to calculate operating profit (EBITDA/GOP).'}
              </p>
            </div>
          </div>
          {onOpenImport && (
            <div className="flex flex-wrap gap-2.5 shrink-0 self-start sm:self-center">
              <button
                onClick={() => onOpenImport('finance')}
                className="px-3.5 py-2 bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-400 hover:to-brand-gold text-neutral-950 font-extrabold text-[11px] rounded-lg transition-all duration-200 shadow-md hover:shadow-[0_0_16px_rgba(245,158,11,0.55)] hover:brightness-105 flex items-center justify-center gap-1.5 cursor-pointer border border-amber-600/30 hover:border-amber-300 active:scale-95 font-mono uppercase tracking-wider"
              >
                <span>📥 {language === 'ru' ? 'Импорт отчета Финансы & OPEX' : 'Import Finance & OPEX Report'}</span>
              </button>
              <button
                onClick={() => onOpenImport('hr')}
                className="px-3.5 py-2 bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-400 hover:to-brand-gold text-neutral-950 font-extrabold text-[11px] rounded-lg transition-all duration-200 shadow-md hover:shadow-[0_0_16px_rgba(245,158,11,0.55)] hover:brightness-105 flex items-center justify-center gap-1.5 cursor-pointer border border-amber-600/30 hover:border-amber-300 active:scale-95 font-mono uppercase tracking-wider"
              >
                <span>💼 {language === 'ru' ? 'Импорт отчета HR & КАДРЫ' : 'Import HR & Payroll Report'}</span>
              </button>
              <button
                onClick={() => onOpenImport('engineering')}
                className="px-3.5 py-2 bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-400 hover:to-brand-gold text-neutral-950 font-extrabold text-[11px] rounded-lg transition-all duration-200 shadow-md hover:shadow-[0_0_16px_rgba(245,158,11,0.55)] hover:brightness-105 flex items-center justify-center gap-1.5 cursor-pointer border border-amber-600/30 hover:border-amber-300 active:scale-95 font-mono uppercase tracking-wider"
              >
                <span>🔧 {language === 'ru' ? 'Импорт отчета Инженерия' : 'Import Engineering Report'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Cost Saving slider */}
        <div className="mt-6 border-t border-brand-border/40 pt-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-brand-text-primary font-bold">
              {language === 'ru' ? 'Оптимизация операционных расходов (GOP Cost Control)' : 'GOP Cost Control Saving'}
            </span>
            <span className="text-xs text-brand-text-muted font-mono">
              {language === 'ru' ? 'Экономия издержек:' : 'Operating savings:'} <strong className="text-brand-text-primary">{currentParams.costControlSaving}%</strong>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="-5"
              max="15"
              value={currentParams.costControlSaving}
              onChange={(e) => setCurrentParams({ ...currentParams, costControlSaving: parseInt(e.target.value) || 0 })}
              className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
            />
            <div className="flex items-center space-x-1 shrink-0">
              <input
                type="number"
                value={currentParams.costControlSaving}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCurrentParams({ ...currentParams, costControlSaving: isNaN(val) ? 0 : val });
                }}
                className="w-16 bg-brand-input-bg border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-0.5 px-1 font-mono font-bold focus:outline-none"
              />
              <span className="text-brand-text-muted text-xs font-mono">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Cost Structure Breakdown Card */}
      <div className="border border-brand-border rounded-xl p-5 bg-brand-card-bg shadow-lg">
        <h5 className="font-bold text-brand-text-primary text-sm mb-4 border-b border-brand-border/40 pb-2">
          📊 {language === 'ru' ? 'Анализ структуры затрат и рентабельности' : 'Operational Cost Structure & Margins'}
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Detailed Costs Columns */}
          <div className="space-y-4">
            <h6 className="text-xs font-bold uppercase tracking-wider text-brand-gold font-mono">
              {language === 'ru' ? 'Операционные расходы отеля (Daily OPEX)' : 'Daily Cost breakdown'}
            </h6>

            {/* Variable rooms cost */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-sans text-brand-text-secondary">
                <span>{language === 'ru' ? 'Переменные расходы номеров (Rooms Variable)' : 'Rooms Variable Cost'}</span>
                <span className="font-mono text-brand-text-primary font-bold">{formatVal(Math.round(totalVariableCost))}</span>
              </div>
              <div className="w-full bg-brand-input-bg h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-gold h-full rounded-full" 
                  style={{ width: `${Math.max(5, Math.min(100, (totalVariableCost / (totalCostOfSales || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Fixed cost */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-sans text-brand-text-secondary">
                <span>{language === 'ru' ? 'Постоянные расходы отеля (Fixed overheads)' : 'Fixed costs & overheads'}</span>
                <span className="font-mono text-brand-text-primary font-bold">{formatVal(Math.round(fixedCost))}</span>
              </div>
              <div className="w-full bg-brand-input-bg h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-neutral-600 h-full rounded-full" 
                  style={{ width: `${Math.max(5, Math.min(100, (fixedCost / (totalCostOfSales || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Ancillary cost */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-sans text-brand-text-secondary">
                <span>{language === 'ru' ? 'Себестоимость доп. точек (Ancillary cost of sales)' : 'Ancillary Cost of Sales'}</span>
                <span className="font-mono text-brand-text-primary font-bold">{formatVal(Math.round(totalAncillaryCosts))}</span>
              </div>
              <div className="w-full bg-brand-input-bg h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-600 h-full rounded-full" 
                  style={{ width: `${Math.max(5, Math.min(100, (totalAncillaryCosts / (totalCostOfSales || 1)) * 100))}%` }}
                />
              </div>
            </div>

            <div className="border-t border-brand-border/40 pt-3 flex justify-between text-xs font-mono font-bold text-[#1C1814]">
              <span>{language === 'ru' ? 'ВСЕГО СУТОЧНЫХ РАСХОДОВ:' : 'TOTAL DAILY EXPENSES:'}</span>
              <span>{formatVal(totalCostOfSales)}</span>
            </div>
          </div>

          {/* Financial summary margins */}
          <div className="bg-brand-input-bg/40 p-5 rounded-xl border border-brand-border/40 flex flex-col justify-between">
            <div>
              <h6 className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono mb-4">
                {language === 'ru' ? 'Финансовый итог (EBITDA / GOP)' : 'Profitability Overview'}
              </h6>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-brand-text-secondary">{language === 'ru' ? 'Общая выручка:' : 'Total revenue:'}</span>
                  <span className="font-mono text-sm font-bold text-[#1C1814]">
                    {formatVal(totalRev)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-brand-text-secondary">{language === 'ru' ? 'Операционные расходы:' : 'Total expenses:'}</span>
                  <span className="font-mono text-sm font-bold text-rose-500">
                    -{formatVal(totalCostOfSales)}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-brand-border/40 pt-3">
                  <span className="text-xs text-brand-text-primary font-bold">{language === 'ru' ? 'Операционная прибыль (GOP):' : 'Gross Operating Profit (GOP):'}</span>
                  <span className="font-mono text-base font-black text-emerald-600">
                    {formatVal(calculatedGop)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-brand-border/40 pt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-text-muted font-mono">{language === 'ru' ? 'Эффективность (GOP %):' : 'GOP Margin %:'}</span>
                <span className="font-mono text-[#1C1814] font-bold">{currentKpis.gopMargin.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-brand-input-bg h-1.5 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${currentKpis.gopMargin}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
