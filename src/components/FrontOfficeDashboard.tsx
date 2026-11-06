import React from 'react';
import { Key } from 'lucide-react';
import { SimulationParameters } from '../types';
import SegmentationBlock from './SegmentationBlock';

interface FrontOfficeDashboardProps {
  language: 'ru' | 'en';
  currentParams: SimulationParameters;
  setCurrentParams: React.Dispatch<React.SetStateAction<SimulationParameters>>;
  currency: 'KZT' | 'USD';
  segments: any[];
  channels: any[];
  setActiveHelpTopic: (topic: string | null) => void;
  onOpenImport?: (dept: 'frontoffice' | 'spa' | 'fb' | 'finance' | 'salesmarketing' | 'hr' | 'engineering') => void;
}

export default function FrontOfficeDashboard({
  language,
  currentParams,
  setCurrentParams,
  currency,
  segments,
  channels,
  setActiveHelpTopic,
  onOpenImport,
}: FrontOfficeDashboardProps) {
  const baseOcc = currentParams.baseOccupancy !== undefined ? currentParams.baseOccupancy : 76;
  const baseAdr = currentParams.baseAdr !== undefined ? currentParams.baseAdr : 145000;

  return (
    <div className="space-y-6">
      <div className="border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-text-primary uppercase tracking-wide">
                {language === 'ru' ? 'Управление номерным фондом (Front Office)' : 'Rooms Management Dashboard'}
              </h4>
              <p className="text-xs text-brand-text-secondary mt-0.5 font-sans">
                {language === 'ru' 
                  ? 'Регулируйте загрузку номеров и тарифную политику. Изменения мгновенно повлияют на RevPAR, общую выручку и индексы Compset.' 
                  : 'Control room inventory, occupancy shift, and baseline ADR. Changes directly recompute RevPAR and regional market indices.'}
              </p>
            </div>
          </div>
          {onOpenImport && (
            <button
              onClick={() => onOpenImport('frontoffice')}
              className="px-4 py-2 bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-500 hover:to-brand-gold text-neutral-950 font-extrabold text-xs rounded-lg transition-all shadow-md hover:shadow-brand-gold/10 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center shrink-0 border border-amber-600/20 active:scale-95"
            >
              <span>📥 {language === 'ru' ? 'Импорт отчета Front Office' : 'Import Front Office Report'}</span>
            </button>
          )}
        </div>

        {/* Rooms-specific sliders */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-brand-border/40 pt-4">
          {/* Occupancy Shift Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-brand-text-primary font-bold">
                {language === 'ru' ? 'Сдвиг загрузки отеля' : 'Hotel Occupancy Shift'}
              </span>
              <span className="text-xs text-brand-text-muted font-mono">
                {language === 'ru' ? 'Итоговая загрузка:' : 'Final occupancy:'} <strong className="text-brand-text-primary">{baseOcc + currentParams.occupancyShift}%</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min={-baseOcc + 10}
                max={100 - baseOcc}
                value={currentParams.occupancyShift}
                onChange={(e) => setCurrentParams({ ...currentParams, occupancyShift: parseInt(e.target.value) || 0 })}
                className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
              />
              <div className="flex items-center space-x-1 shrink-0">
                <input
                  type="number"
                  value={currentParams.occupancyShift}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentParams({ ...currentParams, occupancyShift: isNaN(val) ? 0 : val });
                  }}
                  className="w-16 bg-brand-input-bg border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-0.5 px-1 font-mono font-bold focus:outline-none"
                />
                <span className="text-brand-text-muted text-xs font-mono">%</span>
              </div>
            </div>
          </div>

          {/* ADR Shift Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-brand-text-primary font-bold">
                {language === 'ru' ? 'Сдвиг тарифа ADR' : 'ADR Shift'}
              </span>
              <span className="text-xs text-brand-text-muted font-mono">
                {language === 'ru' ? 'Итоговый ADR:' : 'Final ADR:'} <strong className="text-brand-text-primary">{new Intl.NumberFormat(language === 'en' ? 'en-US' : 'ru-RU').format(Math.round(baseAdr * (1 + currentParams.adrShift / 100)))} {currency === 'USD' ? '$' : '₸'}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="-35"
                max="50"
                value={currentParams.adrShift}
                onChange={(e) => setCurrentParams({ ...currentParams, adrShift: parseInt(e.target.value) || 0 })}
                className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
              />
              <div className="flex items-center space-x-1 shrink-0">
                <input
                  type="number"
                  value={currentParams.adrShift}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentParams({ ...currentParams, adrShift: isNaN(val) ? 0 : val });
                  }}
                  className="w-16 bg-brand-input-bg border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-0.5 px-1 font-mono font-bold focus:outline-none"
                />
                <span className="text-brand-text-muted text-xs font-mono">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segmentation & Channels Block */}
      <SegmentationBlock 
        segments={segments}
        channels={channels}
        currency={currency}
        onClickHelp={setActiveHelpTopic}
      />
    </div>
  );
}
