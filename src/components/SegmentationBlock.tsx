/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SegmentData, ChannelData } from '../types';
import { formatKZT, formatUSD } from '../data';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from 'recharts';
import { Users, Shield, Percent, TrendingUp, HelpCircle, ShieldAlert, Sliders, RefreshCw, AlertCircle } from 'lucide-react';
import { HelpTrigger } from './InteractiveHelp';
import SmartManualInput from './SmartManualInput';
import { useLanguage } from '../LanguageContext';

interface SegmentationBlockProps {
  segments: SegmentData[];
  channels: ChannelData[];
  currency: 'KZT' | 'USD';
  onClickHelp: (key: string) => void;
}

export default function SegmentationBlock({ segments, channels, currency, onClickHelp }: SegmentationBlockProps) {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [overbookingSafety, setOverbookingSafety] = useState<number>(6); // Default 6% overbooking buffer
  const [isSimulatingWash, setIsSimulatingWash] = useState<boolean>(false);

  const formatVal = (value: number) => {
    return currency === 'KZT' ? formatKZT(value) : formatUSD(value);
  };

  // Pre-calculate net revenue and total commission paid
  const channelsWithMetrics = channels.map(ch => {
    // Commissions and simple marketing costs (e.g. 2% on top of commission for OTA, etc)
    const extraMarketingPercent = ch.id === 'ota' ? 3 : ch.id === 'tour' ? 1 : 0;
    const totalDeductionPercent = ch.commission + extraMarketingPercent;
    
    const commissionPaid = Math.round(ch.revenue * (ch.commission / 100));
    const marketingCost = Math.round(ch.revenue * (extraMarketingPercent / 100));
    const netRevenue = ch.revenue - commissionPaid - marketingCost;
    
    return {
      ...ch,
      commissionPaid,
      marketingCost,
      totalCostOfAcquisition: commissionPaid + marketingCost,
      netRevenue
    };
  });

  const totalRoomsRev = segments.reduce((acc, s) => acc + s.revenue, 0);
  const totalCostOfAcquisition = channelsWithMetrics.reduce((acc, c) => acc + c.totalCostOfAcquisition, 0);
  const totalNetRoomsRev = totalRoomsRev - totalCostOfAcquisition;
  const avgAcquisitionPercent = totalRoomsRev > 0 ? (totalCostOfAcquisition / totalRoomsRev) * 100 : 0;

  // Recharts chart data for Cost of Acquisition
  const costChartData = channelsWithMetrics.map(ch => {
    let displayName = ch.name.split(' (')[0];
    if (isEn) {
      if (ch.id === 'direct') displayName = "Direct Website";
      else if (ch.id === 'ota') displayName = "OTAs";
      else if (ch.id === 'tour') displayName = "Tour Operators";
      else if (ch.id === 'corporate') displayName = "Corporate Contracts";
    }
    return {
      name: displayName,
      [isEn ? 'Gross Revenue' : 'Гросс доход']: ch.revenue,
      [isEn ? 'Net Revenue' : 'Чистый доход (Net)']: ch.netRevenue,
      [isEn ? 'Acquisition Cost' : 'Стоимость привлечения']: ch.totalCostOfAcquisition
    };
  });

  // Render tooltip for Segment Pie
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      let displayName = data.name;
      if (isEn) {
        if (data.id === 'fit') displayName = "FIT (Individual Travelers)";
        else if (data.id === 'groups') displayName = "Leisure Groups";
        else if (data.id === 'mice') displayName = "Corporate / MICE";
        else if (data.id === 'packages') displayName = "Package Tours";
      }
      return (
        <div className="bg-brand-card-bg border border-brand-border p-3 rounded-lg shadow-2xl font-mono text-xs">
          <p className="font-bold text-brand-gold mb-1">{displayName}</p>
          <p className="text-white">{isEn ? "Share" : "Доля"}: <span className="font-bold">{data.share}%</span></p>
          {data.adr && <p className="text-[#D1C9BC]">{isEn ? "ADR" : "Тариф (ADR)"}: <span className="font-bold text-[#F5F2EB]">{formatVal(data.adr)}</span></p>}
          <p className="text-[#D1C9BC]">{isEn ? "Revenue" : "Доход"}: <span className="font-bold text-emerald-400">{formatVal(data.revenue)}</span></p>
        </div>
      );
    }
    return null;
  };

  // Channel Mix pie data
  const channelMixPieData = channels.map(ch => {
    let displayName = ch.name.split(' (')[0];
    if (isEn) {
      if (ch.id === 'direct') displayName = "Direct";
      else if (ch.id === 'ota') displayName = "OTAs";
      else if (ch.id === 'tour') displayName = "Tour Operators";
      else if (ch.id === 'corporate') displayName = "Corporate Contracts";
    }
    return {
      name: displayName,
      value: ch.share,
      color: ch.color,
      id: ch.id
    };
  });

  // Handle wash factor recalibration simulation
  const triggerWashRecalibration = () => {
    setIsSimulatingWash(true);
    setTimeout(() => {
      setIsSimulatingWash(false);
    }, 1000);
  };

  return (
    <div id="segmentation-container" className="flex flex-col space-y-6">
      
      {/* SECTION 1: GUEST SEGMENTS & CHANNEL MIX (Top row grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Guest Segmentation Card */}
        <div id="guest-segments-box" className="border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
                    <Users className="h-4 w-4 mr-1.5 text-brand-gold" />
                    {isEn ? "Guest Segmentation & Profiling" : "Сегментация гостей и профилирование"}
                  </h3>
                  <HelpTrigger topicKey="channel_mix" onClickHelp={onClickHelp} />
                </div>
                <p className="text-xs text-[#9C8F7E] font-mono mt-0.5">Guest Profile & Spending Patterns</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-brand-border bg-brand-input-bg text-[#9C8F7E]">
                {isEn ? `Total rooms: ${segments.reduce((acc, s) => acc + s.roomNights, 0)} sold` : `Всего номеров: ${segments.reduce((acc, s) => acc + s.roomNights, 0)} прод.`}
              </span>
            </div>

            <p className="text-xs text-[#D1C9BC] leading-relaxed mb-4 font-sans">
              {isEn 
                ? "Guest profile of Rixos Water World Aktau. Family leisure is the core of resort business, generating maximum check size, while MICE groups supply the baseline occupancy on weekdays."
                : "Структура гостей Rixos Water World Aktau. Семейный отдых является ядром бизнеса курорта, генерируя максимальный чек, в то время как корпоративные группы (MICE) обеспечивают базовую загрузку в будние дни."}
            </p>

            {/* Visualization (Donut and list) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center font-sans">
              {/* Donut Chart */}
              <div className="sm:col-span-5 h-44 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={segments}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="share"
                    >
                      {segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center font-mono">
                  <span className="text-[9px] text-[#9C8F7E]">{isEn ? "Room Rev" : "Доход Room"}</span>
                  <span className="text-xs font-bold text-white">{formatVal(totalRoomsRev)}</span>
                </div>
              </div>

              {/* Structured Segment Details */}
              <div className="sm:col-span-7 space-y-2">
                {segments.map((seg) => {
                  let segName = seg.name.split(' (')[0];
                  if (isEn) {
                    if (seg.id === 'fit') segName = "Individual FIT";
                    else if (seg.id === 'groups') segName = "Leisure Groups";
                    else if (seg.id === 'mice') segName = "Corporate / MICE";
                    else if (seg.id === 'packages') segName = "Package Tour";
                  }
                  return (
                    <div key={seg.id} className="bg-brand-input-bg/40 border border-brand-border/40 rounded-lg p-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                          <span className="text-xs font-medium text-[#F5F2EB] truncate max-w-[150px]">
                            {segName}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white">
                          {seg.share}%
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-brand-card-bg h-1 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: seg.color, width: `${seg.share}%` }} />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-[#9C8F7E] font-mono">
                        <span>{seg.roomNights} {isEn ? "nights" : "ночей"} • ADR: {formatVal(seg.adr)}</span>
                        <span className="text-emerald-400 font-bold">{formatVal(seg.revenue)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-border/40 flex justify-between items-center text-[10px] font-mono text-[#9C8F7E]">
            <span>{isEn ? "Average Room Rate:" : "Ср. чек по номерам:"} <strong>{formatVal(totalRoomsRev / (segments.reduce((acc, s) => acc + s.roomNights, 0) || 1))}</strong></span>
            <span className="text-brand-gold font-bold">VIP Guest Profile</span>
          </div>
        </div>

        {/* Channel Mix Card */}
        <div id="channel-mix-box" className="border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
                    <Shield className="h-4 w-4 mr-1.5 text-brand-gold" />
                    {isEn ? "Channel Mix Diagram" : "Диаграмма Channel Mix"}
                  </h3>
                  <HelpTrigger topicKey="channel_mix" onClickHelp={onClickHelp} />
                </div>
                <p className="text-xs text-[#9C8F7E] font-mono mt-0.5">Booking Channel Distribution Share</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-brand-border bg-brand-input-bg text-[#9C8F7E]">
                {isEn ? "High Season" : "Активный сезон"}
              </span>
            </div>

            <p className="text-xs text-[#D1C9BC] leading-relaxed mb-4 font-sans">
              {isEn 
                ? "Optimization of distribution channels. Elevating Direct bookings cuts down OTA commission payouts, boosting GOPPAR."
                : "Оптимизация долей каналов дистрибуции. Увеличение прямых броней (Direct) снижает отток денежных средств на комиссии ОТА, максимизируя чистый показатель GOPPAR."}
            </p>

            {/* Visualization (Donut and list) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center font-sans">
              {/* Donut Chart */}
              <div className="sm:col-span-5 h-44 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={channelMixPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {channelMixPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-brand-card-bg border border-brand-border p-2.5 rounded shadow-2xl font-mono text-[11px]">
                              <p className="font-bold text-brand-gold">{payload[0].payload.name}</p>
                              <p className="text-white">{isEn ? "Share" : "Доля"}: {payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center font-mono">
                  <span className="text-[9px] text-[#9C8F7E]">{isEn ? "Direct" : "Прямые"}</span>
                  <span className="text-xs font-bold text-brand-gold">
                    {channels.find(c => c.id === 'direct')?.share}%
                  </span>
                </div>
              </div>

              {/* Channel list */}
              <div className="sm:col-span-7 space-y-2">
                {channelsWithMetrics.map((ch) => {
                  let chName = ch.name.split(' (')[0];
                  if (isEn) {
                    if (ch.id === 'direct') chName = "Direct Website";
                    else if (ch.id === 'ota') chName = "OTAs";
                    else if (ch.id === 'tour') chName = "Tour Operators";
                    else if (ch.id === 'corporate') chName = "Corporate Contracts";
                  }
                  return (
                    <div key={ch.id} className="bg-brand-input-bg/40 border border-brand-border/40 rounded-lg p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: ch.color }} />
                          <span className="text-xs font-medium text-[#F5F2EB] truncate">
                            {chName}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white">
                          {ch.share}%
                        </span>
                      </div>
                      {/* Linear bar */}
                      <div className="w-full bg-brand-card-bg h-1 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: ch.color, width: `${ch.share}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-brand-border/40 flex justify-between items-center text-[10px] font-mono text-[#9C8F7E]">
            <span>{isEn ? `Channels Connected: ${channels.length}` : `Каналов подключено: ${channels.length}`}</span>
            <span className="text-emerald-400 font-bold">OTA Insight Sync</span>
          </div>
        </div>

      </div>

      {/* SECTION 2: COST OF ACQUISITION & WASH FACTOR (Bottom row grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cost of Acquisition Chart Card */}
        <div id="cost-of-acquisition-box" className="lg:col-span-7 border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
                    <Percent className="h-4 w-4 mr-1.5 text-brand-gold" />
                    {isEn ? "Cost of Acquisition Analysis" : "Стоимость привлечения (Cost of Acquisition)"}
                  </h3>
                  <HelpTrigger topicKey="cost_of_acquisition" onClickHelp={onClickHelp} />
                </div>
                <p className="text-xs text-[#9C8F7E] font-mono mt-0.5">Gross vs Net Channel Profitability Analysis</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/5 text-rose-400 flex items-center">
                {isEn ? "Acquisition Cost" : "Acquisition Cost"}: {avgAcquisitionPercent.toFixed(1)}%
              </span>
            </div>

            <p className="text-xs text-[#D1C9BC] leading-relaxed mb-4 font-sans">
              {isEn
                ? "Analysis of genuine net revenue per channel factoring in OTA commission fees (up to 18% for Booking.com) and marketing expenditures."
                : "Анализ реального чистого дохода по каналам с учетом комиссионных вычетов (до 18% у Booking.com) и сопутствующих маркетинговых расходов."}
            </p>

            <div className="h-52 my-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#25211B" />
                  <XAxis dataKey="name" stroke="#9C8F7E" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9C8F7E" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121110', borderColor: '#2B2723', borderRadius: '8px' }}
                    labelStyle={{ color: '#C5A880', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '11px' }}
                    itemStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                  <Bar dataKey={isEn ? "Gross Revenue" : "Гросс доход"} fill="#453E35" radius={[2, 2, 0, 0]} />
                  <Bar dataKey={isEn ? "Net Revenue" : "Чистый доход (Net)"} fill="#C5A880" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-border/40 flex justify-between items-center text-[10px] font-mono">
            <div className="text-[#9C8F7E]">
              {isEn ? "Total Acquisition Costs:" : "Всего издержек дистрибуции:"} <strong className="text-rose-400">{formatVal(totalCostOfAcquisition)}</strong>
            </div>
            <div className="text-emerald-400 font-bold">
              {isEn ? "Net Room Revenue:" : "Реальный Net Room Rev:"} {formatVal(totalNetRoomsRev)}
            </div>
          </div>
        </div>

        {/* Wash Factor Widget Card */}
        <div id="wash-factor-box" className="lg:col-span-5 border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
                    <ShieldAlert className="h-4 w-4 mr-1.5 text-brand-gold" />
                    {isEn ? "Cancellation Analysis (Wash Factor)" : "Анализ отмен (Wash Factor)"}
                  </h3>
                  <HelpTrigger topicKey="wash_factor" onClickHelp={onClickHelp} />
                </div>
                <p className="text-xs text-[#9C8F7E] font-mono mt-0.5">Cancellation & No-Show Pattern Risk</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-brand-gold/30 bg-brand-gold/5 text-brand-gold">
                {isEn ? "Historic" : "Historics"}: 6.4%
              </span>
            </div>

            <p className="text-xs text-[#D1C9BC] leading-relaxed mb-4 font-sans">
              {isEn
                ? "Every booked room carries a cancellation risk (Wash Factor). RMS recommends overbooking to secure full occupancy during high-demand dates."
                : "Каждый забронированный номер имеет риск отмены до заезда (Wash Factor). RMS рекомендует овербукинг для полной загрузки в высокий сезон."}
            </p>

            <div className="space-y-4 bg-[#171513] border border-[#2B2723] rounded-xl p-4 font-sans">
              {/* Wash Stats Grid */}
              <div className="grid grid-cols-2 gap-3 font-mono text-center">
                <div className="bg-[#121110] border border-[#2B2723]/60 p-2.5 rounded-lg">
                  <span className="text-[9px] text-[#9C8F7E] block uppercase">{isEn ? "Avg Lead Time" : "Ср. Срок отмены"}</span>
                  <span className="text-sm font-bold text-[#F5F2EB]">{isEn ? "12 days" : "12 дней"}</span>
                </div>
                <div className="bg-[#121110] border border-[#2B2723]/60 p-2.5 rounded-lg">
                  <span className="text-[9px] text-[#9C8F7E] block uppercase">{isEn ? "No-Show Risk" : "Риск No-Show"}</span>
                  <span className="text-sm font-bold text-[#F5F2EB]">1.8%</span>
                </div>
              </div>

              {/* Overbooking safety buffer slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#9C8F7E]">{isEn ? "Overbooking Buffer:" : "Буфер овербукинга:"}</span>
                  <span className="text-brand-gold font-bold">{overbookingSafety}% ({Math.round(overbookingSafety * 5.1)} {isEn ? "rooms" : "номеров"})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={overbookingSafety}
                  onChange={(e) => setOverbookingSafety(parseInt(e.target.value) || 0)}
                  className="w-full accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-1.5"
                />
                <p className="text-[10px] text-[#9C8F7E] leading-normal font-sans">
                  {isEn 
                    ? `A safety buffer of ${overbookingSafety}% compensates for the 6.4% predicted Wash Factor, pushing actual hotel occupancy to 100%.`
                    : `Буфер ${overbookingSafety}% компенсирует прогнозируемый Wash Factor в 6.4%, доводя фактическое заполнение отеля до 100%.`}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={triggerWashRecalibration}
                disabled={isSimulatingWash}
                className="w-full bg-[#1C1A18] hover:bg-[#2B2723] disabled:bg-[#121110] border border-[#2B2723] hover:border-brand-gold/30 text-brand-gold hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSimulatingWash ? 'animate-spin' : ''}`} />
                <span>{isSimulatingWash ? (isEn ? 'Analyzing patterns...' : 'Анализ паттернов...') : (isEn ? 'Recalculate Wash Factor' : 'Пересчитать Wash Factor')}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-border/40 flex items-start gap-2 text-[10px] text-brand-gold leading-relaxed">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-brand-gold" />
            <span>
              {isEn 
                ? "AI Recommendation: An overbooking buffer up to 8% is effective on summer weekends; on weekdays, maintain a 3-4% limit."
                : "Рекомендация ИИ: Безопасный буфер овербукинга до 8% эффективен на летние уикенды, в будни держите лимит 3-4%."}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
