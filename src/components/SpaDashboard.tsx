import React from 'react';
import { Sparkles } from 'lucide-react';
import { SimulationParameters } from '../types';

interface SpaDashboardProps {
  language: 'ru' | 'en';
  currentParams: SimulationParameters;
  setCurrentParams: React.Dispatch<React.SetStateAction<SimulationParameters>>;
  currency: 'KZT' | 'USD';
  ancillaryPosList: any[];
  baselineAncillaryList: any[];
  onOpenImport?: (dept: 'frontoffice' | 'spa' | 'fb' | 'finance' | 'salesmarketing' | 'hr' | 'engineering') => void;
}

export default function SpaDashboard({
  language,
  currentParams,
  setCurrentParams,
  currency,
  ancillaryPosList,
  baselineAncillaryList,
  onOpenImport,
}: SpaDashboardProps) {
  const formatKZT = (val: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(val) + ' ₸';
  const formatUSD = (val: number) => '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);
  const formatVal = (val: number) => currency === 'USD' ? formatUSD(val) : formatKZT(val);

  return (
    <div className="space-y-6">
      <div className="border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-text-primary uppercase tracking-wide">
                {language === 'ru' ? 'Управление Anjana SPA & Wellness' : 'Anjana SPA & Wellness Dashboard'}
              </h4>
              <p className="text-xs text-brand-text-secondary mt-0.5 font-sans">
                {language === 'ru' 
                  ? 'Моделируйте стоимость премиальных спа-ритуалов и заполняемость эксклюзивных пляжных кабан.' 
                  : 'Simulate spa ritual package premiums and private coastline beach cabanas occupancy.'}
              </p>
            </div>
          </div>
          {onOpenImport && (
            <button
              onClick={() => onOpenImport('spa')}
              className="px-4 py-2 bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-500 hover:to-brand-gold text-neutral-950 font-extrabold text-xs rounded-lg transition-all shadow-md hover:shadow-brand-gold/10 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center shrink-0 border border-amber-600/20 active:scale-95"
            >
              <span>📥 {language === 'ru' ? 'Импорт отчета Anjana SPA' : 'Import Anjana SPA Report'}</span>
            </button>
          )}
        </div>

        {/* SPA-specific sliders */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-brand-border/40 pt-4">
          {/* Spa Premium Factor Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-brand-text-primary font-bold">
                {language === 'ru' ? 'Премиум-заказы в SPA (Anjana)' : 'Spa Premium Factor (Anjana)'}
              </span>
              <span className="text-xs text-brand-text-muted font-mono">
                {language === 'ru' ? 'Фактор:' : 'Factor:'} <strong className="text-brand-text-primary">{currentParams.spaPremiumFactor}%</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="-30"
                max="50"
                value={currentParams.spaPremiumFactor}
                onChange={(e) => setCurrentParams({ ...currentParams, spaPremiumFactor: parseInt(e.target.value) || 0 })}
                className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
              />
              <div className="flex items-center space-x-1 shrink-0">
                <input
                  type="number"
                  value={currentParams.spaPremiumFactor}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentParams({ ...currentParams, spaPremiumFactor: isNaN(val) ? 0 : val });
                  }}
                  className="w-16 bg-brand-input-bg border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-0.5 px-1 font-mono font-bold focus:outline-none"
                />
                <span className="text-brand-text-muted text-xs font-mono">%</span>
              </div>
            </div>
          </div>

          {/* Cabana Occupancy Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-brand-text-primary font-bold">
                {language === 'ru' ? 'Загрузка VIP Cabanas' : 'VIP Cabana Occupancy'}
              </span>
              <span className="text-xs text-brand-text-muted font-mono">
                {language === 'ru' ? 'Занято:' : 'Occupied:'} <strong className="text-brand-text-primary">{currentParams.cabanaOccupancy}% ({Math.round(40 * (currentParams.cabanaOccupancy / 100))} кабан)</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="100"
                value={currentParams.cabanaOccupancy}
                onChange={(e) => setCurrentParams({ ...currentParams, cabanaOccupancy: parseInt(e.target.value) || 0 })}
                className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
              />
              <div className="flex items-center space-x-1 shrink-0">
                <input
                  type="number"
                  value={currentParams.cabanaOccupancy}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentParams({ ...currentParams, cabanaOccupancy: isNaN(val) ? 0 : val });
                  }}
                  className="w-16 bg-brand-input-bg border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-0.5 px-1 font-mono font-bold focus:outline-none"
                />
                <span className="text-brand-text-muted text-xs font-mono">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SPA details cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(() => {
          const pos = ancillaryPosList.find(p => p.id === 'spa');
          const basePos = baselineAncillaryList.find(p => p.id === 'spa');
          if (!pos) return null;
          return (
            <div className="border border-brand-border rounded-xl p-5 bg-brand-card-bg shadow-lg">
              <h5 className="font-bold text-brand-text-primary text-sm flex justify-between items-center">
                <span>🧖‍♀️ {language === 'ru' ? 'Услуги и Спа-процедуры' : 'Spa Treatments & Procedures'}</span>
                <span className="font-mono text-xs text-brand-gold font-extrabold uppercase bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/20">
                  Anjana Spa
                </span>
              </h5>
              <p className="text-xs text-brand-text-secondary mt-2 leading-relaxed">
                {pos.description}
              </p>
              <div className="mt-5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-text-muted">{language === 'ru' ? 'Продажи за сутки:' : 'Daily Sales:'}</span>
                  <div className="font-mono text-right">
                    <div className="text-brand-text-primary font-bold">
                      {formatVal(pos.currentRevenue)}
                    </div>
                    <div className="text-[10px] text-brand-text-muted">
                      {language === 'ru' ? 'База: ' : 'Base: '}
                      {formatVal(basePos?.baselineRevenue || 0)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-brand-text-muted mb-1 font-mono">
                    <span>{language === 'ru' ? 'Прирост к базе' : 'Growth vs Baseline'}</span>
                    <span className={pos.currentRevenue >= (basePos?.baselineRevenue || 0) ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                      {pos.currentRevenue >= (basePos?.baselineRevenue || 0) ? '+' : ''}
                      {Math.round(((pos.currentRevenue - (basePos?.baselineRevenue || 0)) / (basePos?.baselineRevenue || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-brand-input-bg h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-gold h-full rounded-full transition-all"
                      style={{ width: `${Math.max(10, Math.min(100, (pos.currentRevenue / (basePos?.baselineRevenue || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {(() => {
          const pos = ancillaryPosList.find(p => p.id === 'cabanas');
          const basePos = baselineAncillaryList.find(p => p.id === 'cabanas');
          if (!pos) return null;
          return (
            <div className="border border-brand-border rounded-xl p-5 bg-brand-card-bg shadow-lg">
              <h5 className="font-bold text-brand-text-primary text-sm flex justify-between items-center">
                <span>⛺ {language === 'ru' ? 'VIP Морские Кабаны' : 'VIP Beach Cabanas'}</span>
                <span className="font-mono text-xs text-brand-gold font-extrabold uppercase bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/20">
                  Beach Club
                </span>
              </h5>
              <p className="text-xs text-brand-text-secondary mt-2 leading-relaxed">
                {pos.description}
              </p>
              <div className="mt-5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-text-muted">{language === 'ru' ? 'Выручка за сутки:' : 'Daily Revenue:'}</span>
                  <div className="font-mono text-right">
                    <div className="text-brand-text-primary font-bold">
                      {formatVal(pos.currentRevenue)}
                    </div>
                    <div className="text-[10px] text-brand-text-muted">
                      {language === 'ru' ? 'Задействовано кабан: ' : 'Active Cabanas: '}
                      <strong className="text-brand-text-primary">{Math.round(40 * (currentParams.cabanaOccupancy / 100))} / 40</strong>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-brand-text-muted mb-1 font-mono">
                    <span>{language === 'ru' ? 'Эффективность аренды' : 'Rental Efficiency'}</span>
                    <span className="text-brand-text-primary font-bold">{currentParams.cabanaOccupancy}%</span>
                  </div>
                  <div className="w-full bg-brand-input-bg h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-gold h-full rounded-full transition-all"
                      style={{ width: `${currentParams.cabanaOccupancy}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
