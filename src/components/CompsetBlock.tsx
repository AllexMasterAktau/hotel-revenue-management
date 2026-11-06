/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CompetitorData, HotelKPIs } from '../types';
import { calculateMarketIndices, formatKZT, formatUSD } from '../data';
import { ShieldAlert, Compass, Star, TrendingUp, HelpCircle, Activity, Target } from 'lucide-react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { HelpTrigger } from './InteractiveHelp';
import { useLanguage } from '../LanguageContext';

interface CompsetBlockProps {
  currentKpis: HotelKPIs;
  competitors: CompetitorData[];
  currency: 'KZT' | 'USD';
  onClickHelp: (key: string) => void;
}

export default function CompsetBlock({ currentKpis, competitors, currency, onClickHelp }: CompsetBlockProps) {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const formatVal = (value: number) => {
    return currency === 'KZT' ? formatKZT(value) : formatUSD(value);
  };

  // Sync current subject KPIs into the competitor list
  const syncedCompetitors = competitors.map(comp => {
    if (comp.isSubject) {
      return {
        ...comp,
        adr: currentKpis.adr,
        occupancy: currentKpis.occupancy,
        revpar: currentKpis.revpar
      };
    }
    return comp;
  });

  const marketIndices = calculateMarketIndices(currentKpis, syncedCompetitors);

  // Helper to score an index
  const getIndexStatus = (val: number) => {
    if (val > 115) return { label: isEn ? 'Market Leader (Dominance)' : 'Лидер рынка (Доминирование)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (val >= 95) return { label: isEn ? 'Parity (Market Fit)' : 'Паритет (Соответствие рынку)', color: 'text-brand-gold bg-brand-gold/10 border-brand-gold/20' };
    return { label: isEn ? 'Lagging (Audit Needed)' : 'Отставание (Требуется аудит)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  // Data for Competitor Rate Radar (compares current open rates / ADR of all comps)
  const rateRadarData = syncedCompetitors.map(c => {
    let name = c.isSubject ? 'Our Hotel' : c.name.split(' (')[0].substring(0, 15);
    if (isEn && !c.isSubject) {
      if (c.id === 'rixos') name = 'Our Hotel';
      else if (c.id === 'holiday_inn') name = 'Holiday Inn';
      else if (c.id === 'caspian') name = 'Caspian Riviera';
      else if (c.id === 'renaissance') name = 'Renaissance';
      else if (c.id === 'grand_tara') name = 'Grand Hotel Tara';
    }
    return {
      subject: name,
      'ADR Rate': Math.round(currency === 'KZT' ? c.adr : c.adr / 450),
      fullMark: Math.round(currency === 'KZT' ? 180000 : 400)
    };
  });

  const indexCards = [
    {
      id: 'mpi',
      name: 'MPI (Market Penetration Index)',
      title: isEn ? 'MPI (Market Penetration Index)' : 'Индекс проникновения',
      value: marketIndices.mpi,
      description: isEn 
        ? 'Occupancy market share. MPI > 100% means we occupy more rooms than competitors on average.'
        : 'Доля рынка по загрузке. MPI > 100% означает, что у нас занято больше номеров, чем в среднем у конкурентов.',
      target: isEn ? 'Target: > 100%' : 'Цель: > 100%'
    },
    {
      id: 'ari',
      name: 'ARI (Average Rate Index)',
      title: isEn ? 'ARI (Average Rate Index)' : 'Индекс тарифа',
      value: marketIndices.ari,
      description: isEn
        ? 'Our ADR position relative to the market. ARI > 100% confirms the luxury brand premium surcharge.'
        : 'Позиция нашего ADR относительно рынка. ARI > 100% подтверждает премиальную наценку нашего бренда.',
      target: isEn ? 'Target: > 120%' : 'Цель: > 120%'
    },
    {
      id: 'rgi',
      name: 'RGI (Revenue Generation Index)',
      title: isEn ? 'RGI (Revenue Generation Index)' : 'Индекс генерации доходов',
      value: marketIndices.rgi,
      description: isEn
        ? 'Our share of market revenue (RevPAR). Core financial KPI of pricing policy efficacy.'
        : 'Наша доля выручки (RevPAR) на рынке. Главный финансовый KPI эффективности ценовой политики.',
      target: isEn ? 'Target: > 110%' : 'Цель: > 110%'
    }
  ];

  // Data for Commercial Indices Chart
  const indicesChartData = [
    {
      name: isEn ? 'MPI (Occupancy)' : 'MPI (Загрузка)',
      [isEn ? 'Value (%)' : 'Значение (%)']: Math.round(marketIndices.mpi),
      [isEn ? 'Market Standard' : 'Норматив рынка']: 100,
    },
    {
      name: isEn ? 'ARI (Rate)' : 'ARI (Тариф)',
      [isEn ? 'Value (%)' : 'Значение (%)']: Math.round(marketIndices.ari),
      [isEn ? 'Market Standard' : 'Норматив рынка']: 100,
    },
    {
      name: isEn ? 'RGI (Revenue)' : 'RGI (Выручка)',
      [isEn ? 'Value (%)' : 'Значение (%)']: Math.round(marketIndices.rgi),
      [isEn ? 'Market Standard' : 'Норматив рынка']: 100,
    }
  ];

  const revparChartData = syncedCompetitors.map(c => {
    let name = c.isSubject ? 'Rixos WW' : c.name.split(' (')[0].substring(0, 15);
    if (isEn && !c.isSubject) {
      if (c.id === 'rixos') name = 'Rixos WW';
      else if (c.id === 'holiday_inn') name = 'Holiday Inn';
      else if (c.id === 'caspian') name = 'Caspian Riviera';
      else if (c.id === 'renaissance') name = 'Renaissance';
      else if (c.id === 'grand_tara') name = 'Grand Hotel Tara';
    }
    return {
      name: name,
      'RevPAR (₸)': c.revpar,
      isSubject: c.isSubject
    };
  });

  return (
    <div id="compset-container" className="flex flex-col space-y-6 font-sans">
      
      {/* ROW 1: Competitor Table & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Competitor analysis list */}
        <div id="compset-table-box" className="lg:col-span-8 border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
                    <Compass className="h-4 w-4 mr-1.5 text-brand-gold" />
                    {isEn ? "Competitor Monitoring (Aktau Compset)" : "Мониторинг конкурентов (Compset Актау)"}
                  </h3>
                  <HelpTrigger topicKey="compset_radar" onClickHelp={onClickHelp} />
                </div>
                <p className="text-xs text-[#9C8F7E] font-mono mt-0.5">Competitor Pricing & Occupancy Indexing</p>
              </div>
              <span className="text-[10px] text-brand-gold font-mono border border-brand-gold/30 bg-brand-gold/5 px-2 py-0.5 rounded flex items-center">
                <Star className="h-3 w-3 mr-1 fill-brand-gold text-brand-gold" />
                {isEn ? "Rixos Rank: 1 of 5" : "Ранг Rixos: 1 из 5"}
              </span>
            </div>

            <p className="text-xs text-[#D1C9BC] mb-4 leading-relaxed font-sans">
              {isEn 
                ? "Positioning of Rixos Water World Aktau relative to four key competitor hotels in the Mangystau region. Market indices are dynamically calculated based on current pricing models."
                : "Позиционирование Rixos Water World Aktau относительно четырех ключевых отелей конкурентной группы в Мангистауской области. Индексы рассчитываются динамически на основе текущего моделирования тарифов."}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/40 text-[10px] font-mono text-[#9C8F7E] uppercase font-bold">
                    <th className="py-2.5">{isEn ? "Hotel" : "Отель"}</th>
                    <th className="py-2.5 text-right">{isEn ? "Occupancy" : "Загрузка"}</th>
                    <th className="py-2.5 text-right">ADR</th>
                    <th className="py-2.5 text-right">RevPAR</th>
                    <th className="py-2.5 text-right hidden sm:table-cell">{isEn ? "Rating" : "Рейтинг"}</th>
                    <th className="py-2.5 text-right hidden sm:table-cell">{isEn ? "Distance" : "Расстояние"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20 text-xs font-mono">
                  {syncedCompetitors.map((comp) => {
                    let hotelName = comp.name;
                    if (isEn) {
                      if (comp.id === 'rixos') hotelName = "Rixos Water World Aktau (You)";
                      else if (comp.id === 'holiday_inn') hotelName = "Holiday Inn Aktau";
                      else if (comp.id === 'caspian') hotelName = "Caspian Riviera";
                      else if (comp.id === 'renaissance') hotelName = "Renaissance Aktau";
                      else if (comp.id === 'grand_tara') hotelName = "Grand Hotel Tara";
                    }
                    return (
                      <tr 
                        key={comp.id} 
                        id={`compset-row-${comp.id}`}
                        className={`transition-colors hover:bg-brand-input-bg/40 ${
                          comp.isSubject 
                            ? 'bg-brand-gold/5 font-semibold text-white border-y border-brand-gold/20' 
                            : 'text-[#D1C9BC]'
                        }`}
                      >
                        <td className="py-3 flex items-center space-x-2">
                          {comp.isSubject && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />}
                          <span className={comp.isSubject ? 'text-brand-gold font-sans' : 'font-sans'}>{hotelName}</span>
                        </td>
                        <td className="py-3 text-right">{comp.occupancy.toFixed(0)}%</td>
                        <td className="py-3 text-right">{formatVal(comp.adr).replace('₸', '').trim()}</td>
                        <td className="py-3 text-right text-emerald-400 font-bold">{formatVal(comp.revpar)}</td>
                        <td className="py-3 text-right hidden sm:table-cell">
                          <span className="inline-flex items-center text-brand-gold">
                            {comp.rating}
                            <Star className="h-2.5 w-2.5 ml-0.5 fill-brand-gold text-brand-gold" />
                          </span>
                        </td>
                        <td className="py-3 text-right text-[#9C8F7E]/60 text-[10px] hidden sm:table-cell">
                          {isEn ? comp.distance.replace('км', 'km') : comp.distance}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RevPAR Comparison chart */}
          <div className="h-28 mt-4 pt-3 border-t border-brand-border/40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revparChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#25211B" />
                <XAxis dataKey="name" stroke="#9C8F7E" fontSize={9} tickLine={false} />
                <YAxis stroke="#9C8F7E" fontSize={9} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-brand-card-bg border border-brand-border p-2 rounded shadow-2xl font-mono text-[10px]">
                          <p className="font-bold text-brand-gold">{payload[0].payload.name}</p>
                          <p className="text-white">RevPAR: {formatVal(payload[0].value)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="RevPAR (₸)">
                  {revparChartData.map((entry, index) => {
                    const fill = entry.isSubject ? '#C5A880' : '#453E35';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competitor Rate Radar Widget (Radar Chart) */}
        <div id="compset-radar-box" className="lg:col-span-4 border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
                  <Activity className="h-4 w-4 mr-1.5 text-brand-gold" />
                  {isEn ? "Rate Radar" : "Радар тарифов (Rate Radar)"}
                </h3>
                <HelpTrigger topicKey="compset_radar" onClickHelp={onClickHelp} />
              </div>
            </div>
            
            <p className="text-xs text-[#D1C9BC] leading-relaxed mb-4 font-sans">
              {isEn 
                ? "Real-time comparison of public retail rates (BAR). The radar visually frames Rixos pricing positions relative to Mangystau's 5-star inventory."
                : "Сравнение открытых розничных цен (BAR) в реальном времени. Радар наглядно позиционирует тариф Rixos относительно остальной выборки пятизвездочных отелей региона."}
            </p>

            {/* Radar Visual Area */}
            <div className="h-56 flex items-center justify-center font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={rateRadarData}>
                  <PolarGrid stroke="#2B2723" />
                  <PolarAngleAxis dataKey="subject" stroke="#9C8F7E" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#9C8F7E" fontSize={8} />
                  <Radar name={isEn ? "ADR Rate" : "ADR Тариф"} dataKey="ADR Rate" stroke="#C5A880" fill="#C5A880" fillOpacity={0.25} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121110', borderColor: '#2B2723', borderRadius: '6px' }}
                    labelStyle={{ color: '#C5A880', fontWeight: 'bold', fontSize: '10px' }}
                    itemStyle={{ fontSize: '10px', color: '#FFF' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-border/40 flex justify-between items-center text-[10px] font-mono text-[#9C8F7E]">
            <span>{isEn ? `Metric: ${currency} rate` : `Показатели: ${currency} тариф`}</span>
            <span className="text-brand-gold font-bold">Rixos Premium Price</span>
          </div>
        </div>

      </div>

      {/* ROW 2: Commercial Indices Dynamics & Detailed Scoreboards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Commercial Indices Graph (Dynamics) */}
        <div id="commercial-indices-chart-box" className="lg:col-span-7 border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
                  <Target className="h-4 w-4 mr-1.5 text-brand-gold" />
                  {isEn ? "Commercial Indices Dynamics" : "График Commercial Indices"}
                </h3>
                <HelpTrigger topicKey="market_indices" onClickHelp={onClickHelp} />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-brand-gold/30 bg-brand-gold/5 text-brand-gold">
                {isEn ? "Parity = 100%" : "Паритет = 100%"}
              </span>
            </div>

            <p className="text-xs text-[#D1C9BC] leading-relaxed mb-4 font-sans">
              {isEn
                ? "Comparative dynamics of market penetration indexes. Pinpoint whether volume (occupancy) or rate drives our market lead."
                : "Сравнительная динамика индексов проникновения рынка. Позволяет мгновенно определить, за счет какого фактора (загрузки или цены) отель опережает рынок."}
            </p>

            {/* Recharts Bar Chart of Indices */}
            <div className="h-52 my-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={indicesChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#25211B" />
                  <XAxis dataKey="name" stroke="#9C8F7E" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9C8F7E" fontSize={10} domain={[0, 150]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121110', borderColor: '#2B2723', borderRadius: '8px' }}
                    labelStyle={{ color: '#C5A880', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '11px' }}
                    itemStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                  <ReferenceLine y={100} stroke="#453E35" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: isEn ? 'Market Parity' : 'Рыночный паритет', fill: '#9C8F7E', fontSize: 9, position: 'top' }} />
                  <Bar dataKey={isEn ? "Value (%)" : "Значение (%)"} fill="#C5A880" radius={[2, 2, 0, 0]}>
                    {indicesChartData.map((entry, index) => {
                      const value = Number(entry[isEn ? 'Value (%)' : 'Значение (%)']);
                      const fill = value >= 115 ? '#C5A880' : value >= 100 ? '#8E8273' : '#453E35';
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-border/40 flex justify-between items-center text-[10px] font-mono text-[#9C8F7E]">
            <span>{isEn ? "Calculated by STR Global standards" : "Расчет по формулам STR Global стандартов"}</span>
            <span className="text-[#F5F2EB] font-bold">RGI Index: {marketIndices.rgi.toFixed(1)}%</span>
          </div>
        </div>

        {/* Detailed Indices Scoreboards */}
        <div id="compset-indices-box" className="lg:col-span-5 flex flex-col space-y-4">
          {indexCards.map((idx) => {
            const status = getIndexStatus(idx.value);

            return (
              <div 
                key={idx.id} 
                id={`index-box-${idx.id}`}
                className="border border-brand-border rounded-xl p-4.5 bg-brand-card-bg/80 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group hover:bg-brand-input-bg/60 transition-all duration-300"
              >
                {/* Background index gauge */}
                <div className="absolute right-3 bottom-0 text-7xl font-mono font-black select-none text-[#9C8F7E]/10 group-hover:text-[#9C8F7E]/15 transition-colors">
                  {idx.value.toFixed(0)}
                </div>

                <div className="z-10">
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wide font-sans">
                      {idx.title}
                    </h4>
                    <span className="text-[10px] text-[#9C8F7E] font-mono">
                      {idx.target}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-mono font-extrabold text-white">
                      {idx.value.toFixed(1)}%
                    </span>
                    <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#D1C9BC] font-sans leading-relaxed mt-2 pr-12">
                    {idx.description}
                  </p>
                </div>

                {/* Graphical linear indicator */}
                <div className="w-full bg-brand-input-bg h-1 rounded-full overflow-hidden mt-3 z-10">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx.value >= 115 ? 'bg-emerald-400' : idx.value >= 95 ? 'bg-brand-gold' : 'bg-rose-400'
                    }`}
                    style={{ width: `${Math.min(100, (idx.value / 150) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
