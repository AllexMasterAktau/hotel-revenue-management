/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sun, Plane, Calendar, HelpCircle, Thermometer, Compass, CloudRain, AlertCircle } from 'lucide-react';
import { HelpTrigger } from './InteractiveHelp';
import { SimulationParameters } from '../types';
import { useLanguage } from '../LanguageContext';

interface OverviewExtensionsProps {
  currentParams: SimulationParameters;
  onClickHelp: (key: string) => void;
}

export default function OverviewExtensions({ currentParams, onClickHelp }: OverviewExtensionsProps) {
  const { language } = useLanguage();

  // Dynamic names based on current language
  const currentOTBKey = language === 'ru' ? 'Текущий OTB (2026)' : 'Current OTB (2026)';
  const lastYearKey = language === 'ru' ? 'Прошлый год (2025)' : 'Last Year (2025)';
  const budgetKey = language === 'ru' ? 'Бюджет' : 'Budget';

  // Generate OTB (On-The-Books) data dynamically scaled by occupancy Shift for realism
  const basePaceData = [
    { name: language === 'ru' ? '+30 дней' : '+30 days', [currentOTBKey]: 385, [lastYearKey]: 350, [budgetKey]: 370 },
    { name: language === 'ru' ? '+45 дней' : '+45 days', [currentOTBKey]: 310, [lastYearKey]: 290, [budgetKey]: 315 },
    { name: language === 'ru' ? '+60 дней' : '+60 days', [currentOTBKey]: 245, [lastYearKey]: 240, [budgetKey]: 260 },
    { name: language === 'ru' ? '+75 дней' : '+75 days', [currentOTBKey]: 180, [lastYearKey]: 195, [budgetKey]: 200 },
    { name: language === 'ru' ? '+90 дней' : '+90 days', [currentOTBKey]: 115, [lastYearKey]: 120, [budgetKey]: 130 }
  ];

  // Apply shifts for interactive feel
  const shiftMultiplier = 1 + (currentParams.occupancyShift / 100);
  const paceData = basePaceData.map(d => ({
    ...d,
    [currentOTBKey]: Math.min(515, Math.max(0, Math.round((d[currentOTBKey] as number) * shiftMultiplier)))
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* Pace Report (OTB) Line Chart */}
      <div id="pace-report-box" className="lg:col-span-8 border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase">
                  Pace Report (On-The-Books)
                </h3>
                <HelpTrigger topicKey="pace_report" onClickHelp={onClickHelp} />
              </div>
              <p className="text-xs text-[#9C8F7E] font-mono mt-0.5">
                {language === 'ru' ? 'Ретроспективное сравнение темпов набора броней' : 'Retrospective booking pace comparison'}
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
              {language === 'ru' ? 'Темп: +8.4% к прошлому году' : 'Pace: +8.4% vs Last Year'}
            </span>
          </div>

          <p className="text-xs text-[#D1C9BC] mb-4 leading-relaxed font-sans">
            {language === 'ru' 
              ? 'Динамический анализ кривой OTB (забронированные ночи на будущие периоды) в сравнении с фактическим результатом аналогичного периода прошлого года и утвержденным годовым бюджетом отеля.'
              : 'Dynamic analysis of the OTB curve (booked room nights for future periods) compared with actual results from the same period last year and the hotel budget.'}
          </p>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paceData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#25211B" />
                <XAxis dataKey="name" stroke="#9C8F7E" fontSize={10} tickLine={false} />
                <YAxis stroke="#9C8F7E" fontSize={10} domain={[0, 515]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121110', borderColor: '#2B2723', borderRadius: '8px' }}
                  labelStyle={{ color: '#C5A880', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ fontSize: '11px', fontFamily: 'sans-serif', padding: '1px 0' }}
                />
                <Legend verticalAlign="top" height={32} iconSize={8} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey={currentOTBKey} stroke="#C5A880" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey={lastYearKey} stroke="#453E35" strokeWidth={1.5} strokeDasharray="4 4" />
                <Line type="monotone" dataKey={budgetKey} stroke="#8E8273" strokeWidth={1.5} strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-brand-border/40 flex justify-between items-center text-[9px] font-mono text-[#9C8F7E]">
          <span>{language === 'ru' ? 'Лимит емкости: 515 номеров' : 'Capacity limit: 515 rooms'}</span>
          <span>{language === 'ru' ? 'Обновлено: сегодня, 08:00 (GMT+5)' : 'Updated: today, 08:00 (GMT+5)'}</span>
        </div>
      </div>

      {/* Macro Context Widget */}
      <div id="macro-context-box" className="lg:col-span-4 border border-[#E5DED0] rounded-xl p-5 bg-[#FAF7F2] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-extrabold tracking-wider text-[#2A1E17] uppercase">
                  {language === 'ru' ? 'Внешние факторы (Macro)' : 'External Factors (Macro)'}
                </h3>
                <HelpTrigger topicKey="macro_context" onClickHelp={onClickHelp} />
              </div>
              <p className="text-xs text-[#6E5A47] font-mono mt-0.5">Regional context matrix</p>
            </div>
            <span className="text-[10px] text-[#1B5E20] bg-[#E8F5E9] border border-[#A5D6A7] font-mono flex items-center px-2 py-0.5 rounded-full font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-1 animate-pulse" />
              {language === 'ru' ? 'Спрос: Высокий' : 'Demand: High'}
            </span>
          </div>

          <p className="text-xs text-[#3D2C1E] mb-4 leading-relaxed font-sans font-medium">
            {language === 'ru'
              ? 'Учет рыночной конъюнктуры региона для превентивной адаптации тарифов и ресурсов курорта.'
              : 'Monitoring regional market conditions for preemptive tariff and resource adjustment.'}
          </p>

          <div className="space-y-3.5 font-sans">
            {/* 1. Weather */}
            <div className="bg-[#F5F0E6] border border-[#E0D5C1] rounded-lg p-3 flex items-center justify-between shadow-xs hover:border-[#8C6D3B] transition-colors">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#EADCC6] rounded-md text-[#3D2C1E]">
                  <Sun className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#2A1E17]">
                    {language === 'ru' ? 'Погода' : 'Weather'}
                  </h4>
                  <p className="text-[10px] text-[#5C4C3E] font-semibold mt-0.5">
                    {language === 'ru' ? 'Ясно, штиль • Темп. воды: +23.2°C' : 'Sunny, calm • Sea Temp: +23.2°C'}
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-black text-[#6B4C1B]">+34.5°C</span>
              </div>
            </div>

            {/* 2. Flight Radar */}
            <div className="bg-[#F5F0E6] border border-[#E0D5C1] rounded-lg p-3 flex items-center justify-between shadow-xs hover:border-[#8C6D3B] transition-colors">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#EADCC6] rounded-md text-[#3D2C1E]">
                  <Plane className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#2A1E17]">
                    {language === 'ru' ? 'Рейсы в Аэропорт' : 'Airport Flights'}
                  </h4>
                  <p className="text-[10px] text-[#5C4C3E] font-semibold mt-0.5">
                    {language === 'ru' ? 'Все рейсы вовремя (Алматы, Стамбул)' : 'All flights on-time (Almaty, Istanbul)'}
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-black text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#A5D6A7]">NORMAL</span>
              </div>
            </div>

            {/* 3. Holiday indicator */}
            <div className="bg-[#F5F0E6] border border-[#E0D5C1] rounded-lg p-3 flex items-center justify-between shadow-xs hover:border-[#8C6D3B] transition-colors">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#EADCC6] rounded-md text-[#3D2C1E]">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#2A1E17]">
                    {language === 'ru' ? 'Ближайшие праздники' : 'Upcoming Holidays'}
                  </h4>
                  <p className="text-[10px] text-[#5C4C3E] font-semibold mt-0.5">
                    {language === 'ru' ? 'День Конституции РК (длинные вых.)' : 'RK Constitution Day (long weekend)'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono font-black bg-[#8C6D3B]/15 border border-[#8C6D3B]/40 text-[#3D2608] px-2 py-0.5 rounded">
                  {language === 'ru' ? '+18% Спрос' : '+18% Demand'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Advisory footnote */}
        <div className="mt-4 pt-3 border-t border-[#E0D5C1] flex items-start space-x-2 text-[11px] text-[#2A1E17] bg-[#F5F0E6] p-3 rounded-lg border border-[#E5DBC7] leading-relaxed font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#8C6D3B]" />
          <span>
            {language === 'ru' 
              ? 'Высокая температура воздуха и приближение праздников стимулируют местный туризм. Рекомендуется удерживать высокие BAR-тарифы на ближайшие выходные.'
              : 'High temperature and upcoming holidays stimulate local tourism. It is recommended to maintain high BAR rates for the upcoming weekend.'}
          </span>
        </div>
      </div>

    </div>
  );
}
