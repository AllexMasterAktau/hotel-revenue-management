/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AncillaryPOS, SimulationParameters } from '../types';
import { formatKZT, formatUSD } from '../data';
import { Utensils, Sparkles, Tent, Ticket, Ship, TrendingUp, TrendingDown, HelpCircle, X, Info, RotateCcw } from 'lucide-react';
import SmartManualInput from './SmartManualInput';
import { useLanguage } from '../LanguageContext';

const ANCILLARY_HELP_DATA_RU = {
  f_b: {
    title: '🍽️ Рестораны A la Carte и Бары',
    description: 'Этот модуль отражает дополнительные продажи в ресторанах высокой кухни и барах (Lalezar, Mermaid), а также платные апгрейды алкогольных пакетов до уровня ультра-премиум.',
    impact: 'Регулируется параметром "Доп. продажи F&B" (от -30% до +50%). Прямо масштабирует средний чек и итоговую выручку этого POS-терминала.',
    recommendation: 'Во время пикового сезона или проведения крупных праздников и банкетов повышайте этот показатель на +15%... +35%.'
  },
  spa: {
    title: '✨ Anjana Spa и VIP Процедуры',
    description: 'Модуль спа-комплекса Anjana Spa. Охватывает продажи традиционных хаммам-ритуалов, индивидуального массажа и специализированных велнес-программ.',
    impact: 'Регулируется параметром "Премиум-заказы в SPA" (от -30% до +50%). Увеличивает выручку спа-департамента и вносит существенный вклад в показатель TRevPAR.',
    recommendation: 'Для моделирования осенне-зимнего периода повышайте этот параметр до +15%... +25%, так как гости проводят больше времени внутри спа-комплекса.'
  },
  cabanas: {
    title: '⛺ Частные морские кабаны и пляжные павильоны',
    description: 'Аренда 40 роскошных индивидуальных пляжных кабан и павильонов на пирсе с эксклюзивным обслуживанием личного батлера, премиальными корзинами с фруктами и шампанским.',
    impact: 'Регулируется параметром "Загрузка VIP Cabanas" (от 0% до 100%). Отражает долю занятых шатров в день.',
    recommendation: 'В жаркий летний период стремитесь к загрузке 80-100%. Зимой и в штормовую погоду ставьте 0%.'
  },
  themepark: {
    title: '🎠 Билеты в аквапарк и тематический парк',
    description: 'Продажа дневных абонементов (Day Pass) в аквапарк и экстремальные аттракционы для внешних гостей, не проживающих в отеле.',
    impact: 'Регулируется ценой входного билета (0 - 25 000 ₸) и количеством проданных билетов в день (0 - 2 000 человек). Обеспечивает колоссальный приток не-номерной выручки.',
    recommendation: 'Устанавливайте высокую цену (15 000 - 20 000 ₸) в выходные дни высокого сезона, чтобы избежать переполнения инфраструктуры аквапарка.'
  }
};

const ANCILLARY_HELP_DATA_EN = {
  f_b: {
    title: '🍽️ A la Carte Restaurants & Bars',
    description: 'This module tracks additional sales in fine dining restaurants and bars (Lalezar, Mermaid), as well as paid upgrades to ultra-premium beverage packages.',
    impact: 'Controlled by the "F&B Upsell Factor" parameter (-30% to +50%). Directly scales the average check and final revenues of this POS outlet.',
    recommendation: 'During peak seasons or major corporate banquets, raise this metric by +15%... +35%.'
  },
  spa: {
    title: '✨ Anjana Spa & VIP Treatments',
    description: 'Anjana Spa wellness facility module. Covers sales of traditional Turkish bath rituals, custom therapeutic massages, and premium body care sessions.',
    impact: 'Driven by the "Spa Premium Factor" parameter (-30% to +50%). Enhances Spa department receipts and significantly builds up TRevPAR.',
    recommendation: 'To simulate autumn-winter periods, lift this slider to +15%... +25% as guests naturally stay indoors and schedule indoor spa experiences.'
  },
  cabanas: {
    title: '⛺ Private Sea Cabanas & Beach Pavilions',
    description: 'Rental of 40 luxurious private beach cabanas and pier bungalows with personalized butler service, premium fruit baskets, and champagne amenities.',
    impact: 'Controlled by the "Cabana Occupancy" factor (0% to 100%). Represents the percentage of rented cabanas per day.',
    recommendation: 'During the hot beach season, target 80-100% occupancy. In cold or stormy conditions, dial down to 0%.'
  },
  themepark: {
    title: '🎠 Waterpark Day Pass & Theme Park',
    description: 'Day pass ticket sales to waterpark and adrenaline amusement rides for visitors who are not registered in-house guests.',
    impact: 'Adjusted by ticket pricing (0 - 25,000 KZT) and volume of daily entries sold (0 - 2,000 visitors). Drives huge non-room retail profits.',
    recommendation: 'Impose higher tariffs (15,000 - 20,000 KZT) on peak weekends to throttle crowdedness on the resort water assets.'
  }
};

interface AncillaryRevenueProps {
  ancillaryPosList: AncillaryPOS[];
  baselinePosList: AncillaryPOS[];
  currency: 'KZT' | 'USD';
  currentParams: SimulationParameters;
  onParamsChange: (newParams: SimulationParameters) => void;
}

export default function AncillaryRevenue({ 
  ancillaryPosList, 
  baselinePosList, 
  currency, 
  currentParams, 
  onParamsChange 
}: AncillaryRevenueProps) {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const helpData = isEn ? ANCILLARY_HELP_DATA_EN : ANCILLARY_HELP_DATA_RU;

  const [activeHelp, setActiveHelp] = useState<string | null>(null);

  const formatVal = (value: number) => {
    return currency === 'KZT' ? formatKZT(value) : formatUSD(value);
  };

  const getPOSIcon = (id: string) => {
    switch (id) {
      case 'f_b':
        return <Utensils className="h-5 w-5 text-brand-gold" />;
      case 'spa':
        return <Sparkles className="h-5 w-5 text-brand-gold" />;
      case 'cabanas':
        return <Tent className="h-5 w-5 text-brand-gold" />;
      case 'themepark':
        return <Ticket className="h-5 w-5 text-brand-gold" />;
      default:
        return <Ship className="h-5 w-5 text-brand-gold" />;
    }
  };

  const getPOSStyle = (id: string) => {
    switch (id) {
      case 'f_b':
        return 'from-brand-gold/10 to-transparent border-brand-border';
      case 'spa':
        return 'from-brand-gold/10 to-transparent border-brand-border';
      case 'cabanas':
        return 'from-brand-gold/10 to-transparent border-brand-border';
      case 'themepark':
        return 'from-brand-gold/10 to-transparent border-brand-border';
      default:
        return 'from-brand-gold/10 to-transparent border-brand-border';
    }
  };

  const totalCurrent = ancillaryPosList.reduce((acc, p) => acc + p.currentRevenue, 0);
  const totalBaseline = baselinePosList.reduce((acc, p) => acc + p.currentRevenue, 0);
  const changePercent = totalBaseline > 0 ? ((totalCurrent - totalBaseline) / totalBaseline) * 100 : 0;

  return (
    <div id="ancillary-revenue-panel" className="border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
              <Utensils className="h-4 w-4 mr-1.5 text-brand-gold" />
              {isEn ? "Ancillary Revenue POS Module" : "Модуль дополнительных доходов (Ancillary Revenue POS)"}
            </h3>
            <button
              onClick={() => {
                onParamsChange({
                  ...currentParams,
                  fbUpsellFactor: 0,
                  spaPremiumFactor: 0,
                  cabanaOccupancy: 0,
                  themeParkExternalPrice: 0,
                  themeParkTicketsCount: 0
                });
              }}
              className="text-[10px] font-mono font-bold flex items-center space-x-1 text-[#D1C9BC] hover:text-white bg-brand-input-bg border border-brand-border hover:border-brand-gold px-2.5 py-0.5 rounded transition-all cursor-pointer"
              title={isEn ? "Reset all ancillary revenues to 0" : "Сбросить все параметры дополнительных доходов на 0"}
            >
              <RotateCcw className="h-2.5 w-2.5 text-brand-gold" />
              <span>{isEn ? "Reset input parameters" : "Сброс параметров ввода"}</span>
            </button>
          </div>
          <p className="text-xs text-[#9C8F7E] font-mono mt-0.5">Points of Sale Forecasting & Spend Capture</p>
        </div>
        <div className="bg-brand-input-bg/80 px-4 py-2 rounded-lg border border-brand-border flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-[#9C8F7E] block font-mono">{isEn ? "Total Ancillary Revenue" : "Суммарный доп. доход"}</span>
            <span className="text-sm font-bold text-[#F5F2EB] font-mono">{formatVal(totalCurrent)}</span>
          </div>
          <div className="border-l border-brand-border h-8" />
          <span className={`text-xs font-mono font-bold flex items-center ${changePercent >= 0.05 ? 'text-emerald-400' : changePercent <= -0.05 ? 'text-rose-400' : 'text-[#9C8F7E]'}`}>
            {changePercent >= 0.05 ? '+' : ''}{Math.abs(changePercent) < 0.05 ? '0.0' : changePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      <p className="text-xs text-[#D1C9BC] mb-6 leading-relaxed font-sans">
        {isEn 
          ? "The Rixos Water World Aktau resort operates on an All-Inclusive concept, however, additional revenue is generated from paid outlets (A la Carte restaurants, Anjana spa programs, Cabana rentals, and external visitors)."
          : "Курортный комплекс Rixos Water World Aktau работает по концепции «Все включено», однако дополнительная доля выручки генерируется за счет платных точек (A la Carte рестораны, спа-программы Anjana, аренда Cabanas и внешние посетители)."}
      </p>

      <div className="flex flex-col space-y-5 font-sans">
        {ancillaryPosList.map((pos) => {
          const baseline = baselinePosList.find(b => b.id === pos.id) || pos;
          const posChangePercent = baseline.currentRevenue > 0 
            ? ((pos.currentRevenue - baseline.currentRevenue) / baseline.currentRevenue) * 100 
            : 0;

          // Localized POS Name and Description
          let posName = pos.name;
          let posDesc = pos.description;
          if (isEn) {
            if (pos.id === 'f_b') {
              posName = "A la Carte Restaurants & Bars";
              posDesc = "Fine dining outlets and VIP drinks upgrades";
            } else if (pos.id === 'spa') {
              posName = "Anjana Spa & VIP Treatments";
              posDesc = "Hammam, massage rituals and wellness treatments";
            } else if (pos.id === 'cabanas') {
              posName = "Private Beach Cabanas";
              posDesc = "VIP cabana day rentals with butler service";
            } else if (pos.id === 'themepark') {
              posName = "Water World & Theme Park Day Passes";
              posDesc = "Day pass tickets for external (non-resident) guests";
            }
          }

          return (
            <div
              key={pos.id}
              id={`pos-card-${pos.id}`}
              className="border-b border-brand-border/40 pb-5 last:border-b-0 last:pb-0"
            >
              {/* Header Info with Metadata & Badges */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-brand-input-bg text-brand-gold shrink-0 border border-brand-border/40">
                    {getPOSIcon(pos.id)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-sm font-extrabold text-[#F5F2EB] leading-tight font-sans">
                        {posName}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setActiveHelp(pos.id)}
                        className="text-[#9C8F7E] hover:text-brand-gold focus:outline-none transition-colors"
                        title={isEn ? "Show explanation" : "Показать пояснение"}
                      >
                        <HelpCircle className="h-3.5 w-3.5 cursor-pointer shrink-0" />
                      </button>
                    </div>
                    <p className="text-xs text-[#9C8F7E] leading-normal font-sans mt-0.5">
                      {posDesc}
                    </p>
                  </div>
                </div>

                {/* Key KPIs & Performance badge */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs bg-brand-input-bg/30 px-3 py-1.5 rounded-lg border border-brand-border/30 self-stretch md:self-auto justify-between md:justify-start">
                  <div>
                    <span className="text-[#9C8F7E] text-[10px] uppercase block leading-none">{isEn ? "Traffic" : "Трафик"}</span>
                    <span className="text-[#F5F2EB] font-bold">{pos.visitorCount.toLocaleString()} {isEn ? "pax" : "чел."}</span>
                  </div>
                  <div className="border-l border-brand-border/40 h-5" />
                  <div>
                    <span className="text-[#9C8F7E] text-[10px] uppercase block leading-none">{isEn ? "Avg Spend" : "Ср. Чек"}</span>
                    <span className="text-[#F5F2EB] font-bold">{formatVal(pos.averageSpend)}</span>
                  </div>
                  <div className="border-l border-brand-border/40 h-5" />
                  <div>
                    <span className="text-[#9C8F7E] text-[10px] uppercase block leading-none">{isEn ? "Revenue" : "Выручка"}</span>
                    <span className="text-[#F5F2EB] font-bold">{formatVal(pos.currentRevenue)}</span>
                  </div>
                  {true && (
                    <>
                      <div className="border-l border-brand-border/40 h-5" />
                      <span className={`font-bold px-1.5 py-0.5 rounded ${
                        posChangePercent >= 0.05 
                          ? 'text-emerald-400 bg-emerald-500/5' 
                          : posChangePercent <= -0.05 
                            ? 'text-rose-400 bg-rose-500/5' 
                            : 'text-[#9C8F7E] bg-brand-input-bg/40'
                      }`}>
                        {posChangePercent >= 0.05 ? '+' : ''}{Math.abs(posChangePercent) < 0.05 ? '0' : posChangePercent.toFixed(0)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Slider & Input Row(s) */}
              {pos.id === 'f_b' && (
                <div className="flex items-center space-x-4 pl-0 md:pl-[52px]">
                  <span className="text-xs text-[#9C8F7E] font-mono shrink-0 w-28 sm:w-36 truncate">{isEn ? "Ancillary F&B upsell (%):" : "Доп. продажи (%):"}</span>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    value={currentParams.fbUpsellFactor}
                    onChange={(e) => {
                      onParamsChange({
                        ...currentParams,
                        fbUpsellFactor: parseInt(e.target.value) || 0
                      });
                    }}
                    className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                  />
                  <div className="flex items-center space-x-1 shrink-0">
                    <SmartManualInput
                      value={currentParams.fbUpsellFactor}
                      onChange={(val) => {
                        onParamsChange({
                          ...currentParams,
                          fbUpsellFactor: val
                        });
                      }}
                      min={-30}
                      max={50}
                      className={`w-20 bg-brand-input-bg/80 border border-brand-border hover:border-brand-gold/40 text-center rounded-lg text-xs py-1 font-mono font-bold ${
                        currentParams.fbUpsellFactor >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      } focus:outline-none focus:border-brand-gold shadow-inner`}
                    />
                    <span className="text-[#9C8F7E] text-xs font-mono">%</span>
                  </div>
                </div>
              )}

              {pos.id === 'spa' && (
                <div className="flex items-center space-x-4 pl-0 md:pl-[52px]">
                  <span className="text-xs text-[#9C8F7E] font-mono shrink-0 w-28 sm:w-36 truncate">{isEn ? "Spa Premium orders (%):" : "Премиум-заказы (%):"}</span>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    value={currentParams.spaPremiumFactor}
                    onChange={(e) => {
                      onParamsChange({
                        ...currentParams,
                        spaPremiumFactor: parseInt(e.target.value) || 0
                      });
                    }}
                    className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                  />
                  <div className="flex items-center space-x-1 shrink-0">
                    <SmartManualInput
                      value={currentParams.spaPremiumFactor}
                      onChange={(val) => {
                        onParamsChange({
                          ...currentParams,
                          spaPremiumFactor: val
                        });
                      }}
                      min={-30}
                      max={50}
                      className={`w-20 bg-brand-input-bg/80 border border-brand-border hover:border-brand-gold/40 text-center rounded-lg text-xs py-1 font-mono font-bold ${
                        currentParams.spaPremiumFactor >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      } focus:outline-none focus:border-brand-gold shadow-inner`}
                    />
                    <span className="text-[#9C8F7E] text-xs font-mono">%</span>
                  </div>
                </div>
              )}

              {pos.id === 'cabanas' && (
                <div className="flex items-center space-x-4 pl-0 md:pl-[52px]">
                  <span className="text-xs text-[#9C8F7E] font-mono shrink-0 w-28 sm:w-36 truncate">{isEn ? "Cabanas Occupancy (%):" : "Загрузка Cabanas (%):"}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={currentParams.cabanaOccupancy}
                    onChange={(e) => {
                      onParamsChange({
                        ...currentParams,
                        cabanaOccupancy: parseInt(e.target.value) || 0
                      });
                    }}
                    className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                  />
                  <div className="flex items-center space-x-1 shrink-0">
                    <SmartManualInput
                      value={currentParams.cabanaOccupancy}
                      onChange={(val) => {
                        onParamsChange({
                          ...currentParams,
                          cabanaOccupancy: val
                        });
                      }}
                      min={0}
                      max={100}
                      className="w-20 bg-brand-input-bg/80 border border-brand-border hover:border-brand-gold/40 text-center rounded-lg text-xs py-1 font-mono font-bold text-brand-gold focus:outline-none focus:border-brand-gold shadow-inner"
                    />
                    <span className="text-[#9C8F7E] text-xs font-mono">%</span>
                  </div>
                </div>
              )}

              {pos.id === 'themepark' && (
                <div className="space-y-3 pl-0 md:pl-[52px]">
                  {/* Parameter 1: Ticket Price */}
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-[#9C8F7E] font-mono shrink-0 w-28 sm:w-36 truncate">{isEn ? `Ticket Price (${currency === 'USD' ? '$' : '₸'}):` : "Цена билета (₸):"}</span>
                    <input
                      type="range"
                      min="0"
                      max="25000"
                      step="500"
                      value={currentParams.themeParkExternalPrice}
                      onChange={(e) => {
                        onParamsChange({
                          ...currentParams,
                          themeParkExternalPrice: parseInt(e.target.value) || 0
                        });
                      }}
                      className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                    />
                    <div className="flex items-center space-x-1 shrink-0">
                      <SmartManualInput
                        value={currentParams.themeParkExternalPrice}
                        onChange={(val) => {
                          onParamsChange({
                            ...currentParams,
                            themeParkExternalPrice: val
                          });
                        }}
                        min={0}
                        max={25000}
                        className="w-20 bg-brand-input-bg/80 border border-brand-border hover:border-brand-gold/40 text-center rounded-lg text-xs py-1 font-mono font-bold text-emerald-400 focus:outline-none focus:border-brand-gold shadow-inner"
                      />
                      <span className="text-[#9C8F7E] text-xs font-mono">{currency === 'USD' ? '$' : '₸'}</span>
                    </div>
                  </div>

                  {/* Parameter 2: Guest Count */}
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-[#9C8F7E] font-mono shrink-0 w-28 sm:w-36 truncate">{isEn ? "External Traffic:" : "Трафик внешних гостей:"}</span>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="25"
                      value={currentParams.themeParkTicketsCount}
                      onChange={(e) => {
                        onParamsChange({
                          ...currentParams,
                          themeParkTicketsCount: parseInt(e.target.value) || 0
                        });
                      }}
                      className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                    />
                    <div className="flex items-center space-x-1 shrink-0">
                      <SmartManualInput
                        value={currentParams.themeParkTicketsCount}
                        onChange={(val) => {
                          onParamsChange({
                            ...currentParams,
                            themeParkTicketsCount: val
                          });
                        }}
                        min={0}
                        max={2000}
                        className="w-20 bg-brand-input-bg/80 border border-brand-border hover:border-brand-gold/40 text-center rounded-lg text-xs py-1 font-mono font-bold text-brand-gold focus:outline-none focus:border-brand-gold shadow-inner"
                      />
                      <span className="text-[#9C8F7E] text-xs font-mono">{isEn ? 'pax' : 'чел.'}</span>
                    </div>
                  </div>
                </div>
              )}

              {pos.id !== 'f_b' && pos.id !== 'spa' && pos.id !== 'cabanas' && pos.id !== 'themepark' && (
                <div className="flex items-center pl-0 md:pl-[52px] text-xs text-[#9C8F7E]/70 italic font-mono">
                  <span>{isEn ? "Calculated automatically based on hotel occupancy and baseline parameters." : "Расчитывается автоматически на основе уровня загрузки отеля и базовых параметров."}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation Popup Modal */}
      {activeHelp && helpData[activeHelp] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#FCFAF2] border border-[#E4DFD5] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[#2B2723]">
            <button
              onClick={() => setActiveHelp(null)}
              className="absolute top-4 right-4 text-[#8A8170] hover:text-[#2B2723] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start space-x-3 mt-1">
              <div className="p-2 bg-brand-gold/10 rounded-lg text-brand-gold shrink-0 mt-0.5">
                <Info className="h-5 w-5 text-[#8A7355]" />
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#2B2723] font-sans leading-snug">
                  {helpData[activeHelp].title}
                </h3>
                
                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-[10px] font-bold font-mono tracking-wider text-[#8A7355] uppercase">
                      {isEn ? "Description:" : "Описание:"}
                    </h4>
                    <p className="text-xs text-[#403B35] leading-relaxed font-sans mt-1">
                      {helpData[activeHelp].description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold font-mono tracking-wider text-emerald-700 uppercase">
                      {isEn ? "Revenue Impact:" : "Влияние на доход:"}
                    </h4>
                    <p className="text-xs text-[#403B35] leading-relaxed font-sans mt-1">
                      {helpData[activeHelp].impact}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold font-mono tracking-wider text-[#8A7355] uppercase">
                      {isEn ? "RMS Recommendation:" : "Рекомендация RMS:"}
                    </h4>
                    <p className="text-xs text-[#403B35] leading-relaxed font-sans mt-1">
                      {helpData[activeHelp].recommendation}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setActiveHelp(null)}
                    className="bg-brand-dark-bg hover:bg-brand-dark-bg/95 text-[#FCFAF2] font-bold text-xs py-2 px-5 rounded-lg transition-colors shadow-lg cursor-pointer font-sans"
                  >
                    {isEn ? "Understood" : "Понятно"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
