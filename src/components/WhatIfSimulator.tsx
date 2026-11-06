/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimulationParameters } from '../types';
import { DEFAULT_SIMULATION_PARAMS, BASELINE_OCCUPANCY, BASELINE_ADR } from '../data';
import { Sliders, RotateCcw, Calendar, HelpCircle, X, Info, Settings } from 'lucide-react';
import SmartManualInput from './SmartManualInput';
import { useLanguage } from '../LanguageContext';

// Descriptions and impact metrics for each parameter (Russian)
const PARAMETER_EXPLANATIONS_RU = {
  occupancyShift: {
    title: '📈 Сдвиг загрузки отеля (Occupancy Shift)',
    description: 'Регулирует процент заполняемости номерного фонда отеля Rixos Water World Aktau относительно базового уровня (76%). Позволяет моделировать пиковые периоды, праздничные дни, летний наплыв туристов (до 95-100%) или падение спроса в зимнее межсезонье (30%).',
    impact: 'Прямо влияет на доходы от продажи комнат (Rooms Revenue), а также пропорционально масштабирует трафик и базовую выручку всех остальных точек (рестораны, SPA, пляж) за счет увеличения количества проживающих гостей.',
    recommendation: 'Для летнего сезона устанавливайте сдвиг от +10% до +20% (итоговая загрузка 86%-96%). Для зимы — отрицательный сдвиг до -46% (итоговая загрузка ~30%).'
  },
  adrShift: {
    title: '💵 Сдвиг среднего тарифа ADR (ADR Shift)',
    description: 'Изменяет среднюю стоимость проданного номера в сутки (Average Daily Rate). Отражает гибкость ценовой политики отеля (RMS) при изменениях рыночной конъюнктуры, введении сезонных наценок или акций со скидками.',
    impact: 'Рост ADR на 1% напрямую увеличивает маржинальность и показатели RevPAR / TRevPAR без увеличения операционных расходов на уборку и комплектацию комнат (в отличие от изменения загрузки).',
    recommendation: 'В периоды высокого спроса поднимайте тариф на +15%... +30% для максимизации RevPAR. В периоды спада снижайте до -15%... -35% для привлечения чувствительных к цене сегментов.'
  },
  costControlSaving: {
    title: '🛡️ Оптимизация операционных расходов (GOP Cost Control)',
    description: 'Процент оптимизации и сокращения операционных затрат отеля (Departmental & Undistributed Expenses). Отражает эффективность менеджмента в управлении постоянными расходами, персоналом, коммунальными услугами и логистикой.',
    impact: 'Каждый процент экономии напрямую увеличивает валовую операционную прибыль (GOP) и показатель GOPPAR. Позволяет удерживать высокую рентабельность даже при вынужденном снижении тарифов.',
    recommendation: 'Используйте значения в районе +5%... +12% для моделирования антикризисного управления или оптимизации расходов в низкий зимний сезон.'
  },
  fbUpsellFactor: {
    title: '🍽️ Доп. продажи в ресторанах (F&B Upsell)',
    description: 'Процент прироста выручки ресторанов и баров сверх стандартного тарифа "Все включено". Сюда входят продажи элитного импортного алкоголя, ужины в специализированных A la Carte ресторанах с высокой кухней, проведение частных банкетов и праздников.',
    impact: 'Позволяет увеличить средний чек проживающего гостя на услуги питания, повышая общий TRevPAR без необходимости пересмотра стоимости проживания.',
    recommendation: 'Повышайте фактор до +20%... +40% во время проведения крупных корпоративных мероприятий (MICE) или летних фестивалей.'
  },
  spaPremiumFactor: {
    title: '✨ Премиум-заказы в SPA (Spa Premium)',
    description: 'Коэффициент спроса на премиальные платные оздоровительные процедуры, эксклюзивные массажи, косметологические ритуалы и уходовые программы в знаменитом комплексе Anjana Spa, не входящие в стандартную путевку.',
    impact: 'Увеличивает выручку спа-департамента, конвертируя поток отдыхающих гостей в чистую маржинальную прибыль.',
    recommendation: 'Стимулируйте продажи в холодные месяцы (сдвиг +10%... +20%), когда пляжный отдых недоступен и гости больше времени проводят внутри спа-комплекса.'
  },
  cabanaOccupancy: {
    title: '⛺ Загрузка VIP Cabanas (Cabana Occupancy)',
    description: 'Процент бронирования роскошных индивидуальных пляжных кабан (шатров) на берегу Каспийского моря. Всего в распоряжении отеля находится 40 премиальных кабан с индивидуальным VIP-обслуживанием.',
    impact: 'Обеспечивает отель стабильным высокомаржинальным ежедневным доходом. 100% загрузка означает полную аренду всех 40 шатров по максимальной цене.',
    recommendation: 'В разгар летнего сезона загрузка кабан должна стремиться к 85-100%. Осенью и весной она падает до 20-40%, а зимой стремится к нулю.'
  },
  themeParkExternalPrice: {
    title: '🎠 Цена билета в аквапарк Water World (Ticket Price)',
    description: 'Тариф за разовое посещение тематического парка развлечений и аквапарка Water World для внешних гостей (туристов и жителей Актау, не проживающих в номерах отеля Rixos).',
    impact: 'Позволяет регулировать баланс между максимизацией выручки от въездного туризма и избыточной нагрузкой на инфраструктуру отеля.',
    recommendation: 'В высокий летний сезон рекомендуется устанавливать цены ближе к верхнему порогу (15 000 - 20 000 KZT) для контроля очередей. В межсезонье снижайте тариф до 5 000 - 8 000 KZT для привлечения местных жителей.'
  },
  themeParkTicketsCount: {
    title: '👥 Внешний поток гостей в аквапарк (External Visitors)',
    description: 'Количество проданных входных билетов в день внешним посетителям в обход проживающих гостей.',
    impact: 'Генерирует взрывной прирост выручки POS Themepark, но создает очереди и увеличивает нагрузку на персонал.',
    recommendation: 'Моделируйте летние выходные с трафиком 1 000 - 1 800 человек в день, а будние дни и осень — с трафиком 100 - 400 человек.'
  }
};

// Descriptions and impact metrics for each parameter (English)
const PARAMETER_EXPLANATIONS_EN = {
  occupancyShift: {
    title: '📈 Hotel Occupancy Shift',
    description: 'Adjusts the occupancy percentage of Rixos Water World Aktau relative to the baseline level (76%). Allows modeling peak periods, holidays, summer tourist influx (up to 95-100%), or off-season winter drops (30%).',
    impact: 'Directly impacts Room Revenue, and proportionally scales traffic and base revenues of all other departments (restaurants, SPA, beach) due to the changed number of in-house guests.',
    recommendation: 'For high summer season, set shift between +10% and +20% (final occupancy 86%-96%). For winter, use negative shifts up to -46% (final occupancy ~30%).'
  },
  adrShift: {
    title: '💵 Average Daily Rate (ADR) Shift',
    description: 'Modifies the average daily rate (ADR) of rooms sold. Reflects the agility of the hotel\'s pricing policy (RMS) under changing market conditions, seasonal markups, or discount promotions.',
    impact: 'Every 1% growth in ADR directly enhances GOP and RevPAR / TRevPAR indices without incurring additional departmental operating costs (unlike an occupancy increase).',
    recommendation: 'In peak seasons, lift rates by +15%... +30% to maximize RevPAR. During off-peak periods, decrease by -15%... -35% to capture price-sensitive segments.'
  },
  costControlSaving: {
    title: '🛡️ Gross Operating Profit Cost Control',
    description: 'Percentage of optimization and reduction of hotel operating costs (Departmental & Undistributed Expenses). Reflects the management\'s efficiency in controlling fixed overheads, labor, utilities, and logistics.',
    impact: 'Every percent saved directly boosts the Gross Operating Profit (GOP) and GOPPAR metric, sustaining high profitability even under forced rate declines.',
    recommendation: 'Target values around +5%... +12% to simulate crisis management or off-season cost-containment initiatives.'
  },
  fbUpsellFactor: {
    title: '🍽️ Food & Beverage (F&B) Upsell Factor',
    description: 'Percentage growth of restaurant and bar revenues beyond the standard All-Inclusive packages. Includes sales of premium imported alcohol, specialized A la Carte dinners, private banquets, and celebrations.',
    impact: 'Increases the average guest spend on dining services, elevating total TRevPAR without having to modify room tariff rates.',
    recommendation: 'Raise this factor up to +20%... +40% during major corporate events (MICE) or summer beach festivals.'
  },
  spaPremiumFactor: {
    title: '✨ Spa Premium Factor',
    description: 'Demand coefficient for premium paid wellness procedures, exclusive massages, cosmetic rituals, and care programs at the famous Anjana Spa, which are not included in standard vouchers.',
    impact: 'Amplifies Spa department revenue by converting the flow of relaxing guests into high-margin pure profit.',
    recommendation: 'Drive sales during cooler months (shifts of +10%... +20%) when beach leisure is restricted and guests spend more leisure time inside the spa facility.'
  },
  cabanaOccupancy: {
    title: '⛺ VIP Cabana Occupancy',
    description: 'Booking percentage of the luxury private beach cabanas on the Caspian Sea shore. The hotel offers 40 premium individual beach cabanas with VIP service.',
    impact: 'Provides a highly stable, high-margin daily income stream. 100% occupancy represents complete rental of all 40 cabanas at standard rates.',
    recommendation: 'During peak summer, cabana occupancy should approach 85-100%. In autumn/spring, it declines to 20-40%, and approaches zero in winter.'
  },
  themeParkExternalPrice: {
    title: '🎠 Water World Waterpark Ticket Price',
    description: 'Price for a single visit to the thematic amusement and water park Water World for non-resident guests (outside tourists and Aktau residents not staying in Rixos).',
    impact: 'Helps balance maximizing inbound tourism revenue with preventing overcrowding of the resort facilities.',
    recommendation: 'In the high summer season, set prices near the upper bound (15,000 - 20,000 KZT) to control queues. In off-peak seasons, lower the rate to 5,000 - 8,000 KZT to invite locals.'
  },
  themeParkTicketsCount: {
    title: '👥 External Visitors to Waterpark',
    description: 'The volume of daily admission tickets sold to external visitors (non-residents).',
    impact: 'Generates dramatic revenue growth for the Themepark POS, but causes queues and raises stress on resort staff.',
    recommendation: 'Model summer weekends with a traffic flow of 1,000 - 1,800 visitors per day, and weekdays or autumn seasons with 100 - 400 visitors.'
  }
};

interface WhatIfSimulatorProps {
  currentParams: SimulationParameters;
  onParamsChange: (newParams: SimulationParameters) => void;
  currency: 'KZT' | 'USD';
}

export default function WhatIfSimulator({ currentParams, onParamsChange, currency }: WhatIfSimulatorProps) {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const explanations = isEn ? PARAMETER_EXPLANATIONS_EN : PARAMETER_EXPLANATIONS_RU;

  const [activeHelp, setActiveHelp] = useState<keyof typeof PARAMETER_EXPLANATIONS_RU | null>(null);
  const [showBaselineEdit, setShowBaselineEdit] = useState<boolean>(false);

  const baseOcc = currentParams.baseOccupancy ?? BASELINE_OCCUPANCY;
  const baseAdrVal = currentParams.baseAdr ?? BASELINE_ADR;

  const updateParam = (key: keyof SimulationParameters, val: number) => {
    onParamsChange({
      ...currentParams,
      [key]: val
    });
  };

  const renderManualInput = (
    paramKey: keyof SimulationParameters,
    min: number,
    max: number,
    textColorClass: string = 'text-emerald-400',
    unit: string = '%'
  ) => {
    return (
      <div className="flex items-center space-x-1 shrink-0">
        <SmartManualInput
          value={currentParams[paramKey]}
          onChange={(val) => updateParam(paramKey, val)}
          min={min}
          max={max}
          className={`w-20 bg-brand-input-bg/80 border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-0.5 px-1 font-mono font-bold ${textColorClass} focus:outline-none focus:border-brand-gold shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        <span className="text-[#9C8F7E] text-xs font-mono">{unit}</span>
      </div>
    );
  };

  return (
    <div id="whatif-simulator-container" className="w-full">
      
      {/* Dynamic Sliders Box */}
      <div id="sliders-panel-box" className="w-full border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div>
              <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
                <Sliders className="h-4 w-4 mr-1.5 text-brand-gold" />
                {isEn ? "Scenario Modeling Parameters" : "Параметры сценарного моделирования"}
              </h3>
              <p className="text-xs text-[#9C8F7E] font-mono mt-0.5">What-If Decision Simulator Engine</p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowBaselineEdit(!showBaselineEdit)}
                className={`text-xs font-mono font-bold flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all border cursor-pointer ${
                  showBaselineEdit
                    ? 'text-brand-gold bg-brand-gold/10 border-brand-gold shadow-lg shadow-brand-gold/5'
                    : 'text-[#D1C9BC] hover:text-white bg-brand-input-bg border-brand-border hover:border-brand-gold'
                }`}
                title={isEn ? "Configure model baseline values" : "Настроить базовые значения модели"}
              >
                <Settings className={`h-3 w-3 ${showBaselineEdit ? 'rotate-45' : ''} transition-transform duration-300`} />
                <span>{isEn ? "Base Setup" : "Настройка базы"}</span>
              </button>
              <button
                onClick={() => {
                  onParamsChange(DEFAULT_SIMULATION_PARAMS);
                }}
                className="text-xs font-mono font-bold flex items-center space-x-1 text-[#D1C9BC] hover:text-white bg-brand-input-bg border border-brand-border hover:border-brand-gold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 text-brand-gold" />
                <span>{isEn ? "Baseline Plan" : "Базовый план"}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-[#D1C9BC] leading-relaxed mb-6 font-sans">
            {isEn 
              ? "Use sliders or enter values manually to simulate occupancy, ADR, ancillary services, and cost controls. All changes instantly recalculate TRevPAR, GOPPAR, and Compset indices."
              : "Используйте ползунки или вводите числовые значения вручную для моделирования показателей загрузки, тарифа ADR, объема дополнительных услуг и оптимизации затрат. Все изменения мгновенно пересчитывают TRevPAR, GOPPAR и индексы Compset."}
          </p>

          {/* Baseline Configuration Panel */}
          {showBaselineEdit && (
            <div className="mb-6 p-4 rounded-xl border border-brand-border/80 bg-brand-dark-bg/60 shadow-inner animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 border-b border-brand-border/40 pb-2 gap-2">
                <h4 className="text-[11px] font-bold font-mono tracking-wider text-brand-gold uppercase flex items-center gap-1.5">
                  <Settings className="h-3 w-3 text-brand-gold" />
                  {isEn ? "Baseline Plan Parameters (Manual Entry)" : "Параметры базового плана (Ввод вручную)"}
                </h4>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onParamsChange({
                        ...currentParams,
                        baseOccupancy: 0,
                        baseAdr: 0,
                        baseFbRevenue: 0,
                        baseSpaRevenue: 0
                      });
                    }}
                    className="text-[10px] font-mono text-red-400 hover:text-red-300 underline transition-colors cursor-pointer"
                  >
                    {isEn ? "Zero out baseline parameters" : "Обнулить базовые параметры"}
                  </button>
                  <span className="text-[#9C8F7E] text-[10px]">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      onParamsChange({
                        ...currentParams,
                        baseOccupancy: 76,
                        baseAdr: 145000,
                        baseFbRevenue: 18500000,
                        baseSpaRevenue: 6800000
                      });
                    }}
                    className="text-[10px] font-mono text-[#9C8F7E] hover:text-white underline transition-colors cursor-pointer"
                  >
                    {isEn ? "Reset to default" : "Сбросить к исходным"}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-[#9C8F7E] leading-relaxed mb-4 font-sans">
                {isEn 
                  ? "Adjust the baseline parameters of the resort for a summer day. Simulation shifts will be calculated relative to these values."
                  : "Корректируйте исходные (базовые) параметры курорта для летнего дня. Сдвиги моделирования будут рассчитываться относительно этих значений."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Base Occupancy */}
                <div>
                  <label className="block text-[11px] font-sans text-[#D1C9BC] font-medium mb-1">
                    {isEn ? "Baseline Occupancy" : "Базовая загрузка"}
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <SmartManualInput
                      value={currentParams.baseOccupancy ?? 76}
                      onChange={(val) => updateParam('baseOccupancy', val)}
                      min={0}
                      max={100}
                      className="w-full bg-brand-input-bg/80 border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-1.5 px-2 font-mono font-bold text-brand-gold focus:outline-none focus:border-brand-gold shadow-inner"
                    />
                    <span className="text-[11px] text-[#9C8F7E] font-mono">%</span>
                  </div>
                </div>

                {/* Base ADR */}
                <div>
                  <label className="block text-[11px] font-sans text-[#D1C9BC] font-medium mb-1">
                    {isEn ? "Baseline Room ADR" : "Базовый ADR номера"}
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <SmartManualInput
                      value={currentParams.baseAdr ?? 145000}
                      onChange={(val) => updateParam('baseAdr', val)}
                      min={0}
                      max={1000000}
                      className="w-full bg-brand-input-bg/80 border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-1.5 px-2 font-mono font-bold text-brand-gold focus:outline-none focus:border-brand-gold shadow-inner"
                    />
                    <span className="text-[11px] text-[#9C8F7E] font-mono">₸</span>
                  </div>
                </div>

                {/* Base F&B Revenue */}
                <div>
                  <label className="block text-[11px] font-sans text-[#D1C9BC] font-medium mb-1">
                    {isEn ? "Baseline F&B Revenue" : "Баз. выручка F&B"}
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <SmartManualInput
                      value={currentParams.baseFbRevenue ?? 18500000}
                      onChange={(val) => updateParam('baseFbRevenue', val)}
                      min={0}
                      max={200000000}
                      className="w-full bg-brand-input-bg/80 border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-1.5 px-2 font-mono font-bold text-brand-gold focus:outline-none focus:border-brand-gold shadow-inner"
                    />
                    <span className="text-[11px] text-[#9C8F7E] font-mono">₸</span>
                  </div>
                </div>

                {/* Base Spa Revenue */}
                <div>
                  <label className="block text-[11px] font-sans text-[#D1C9BC] font-medium mb-1">
                    {isEn ? "Baseline Spa Revenue" : "Баз. выручка Spa"}
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <SmartManualInput
                      value={currentParams.baseSpaRevenue ?? 6800000}
                      onChange={(val) => updateParam('baseSpaRevenue', val)}
                      min={0}
                      max={100000000}
                      className="w-full bg-brand-input-bg/80 border border-brand-border hover:border-brand-gold/40 text-center rounded text-xs py-1.5 px-2 font-mono font-bold text-brand-gold focus:outline-none focus:border-brand-gold shadow-inner"
                    />
                    <span className="text-[11px] text-[#9C8F7E] font-mono">₸</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-4 font-sans">
            
            {/* 1. Сдвиг загрузки отеля */}
            <div className="border-b border-brand-border/40 pb-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#F5F2EB] flex items-center font-bold">
                  {isEn ? "Hotel Occupancy Shift" : "Сдвиг загрузки отеля"}
                  <button
                    type="button"
                    onClick={() => setActiveHelp('occupancyShift')}
                    className="ml-1.5 text-[#9C8F7E] hover:text-brand-gold focus:outline-none transition-colors"
                    title={isEn ? "Show explanation" : "Показать пояснение"}
                  >
                    <HelpCircle className="h-3.5 w-3.5 cursor-pointer" />
                  </button>
                </span>
                <span className="text-xs text-[#9C8F7E] font-mono flex items-center gap-1.5">
                  {isEn ? "Final occupancy:" : "Итоговая загрузка:"} <strong className="text-[#F5F2EB]">{baseOcc + currentParams.occupancyShift}%</strong>
                  {currentParams.occupancyShift !== 0 && (
                    <button
                      type="button"
                      onClick={() => updateParam('occupancyShift', 0)}
                      className="text-brand-gold hover:text-white underline cursor-pointer text-[10px] uppercase tracking-wider font-mono bg-brand-gold/10 px-1.5 py-0.5 rounded border border-brand-gold/20 hover:border-brand-gold/40 transition-all"
                    >
                      {isEn ? "Reset" : "Обнулить"}
                    </button>
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min={-baseOcc + 10}
                  max={100 - baseOcc}
                  value={currentParams.occupancyShift}
                  onChange={(e) => updateParam('occupancyShift', parseInt(e.target.value))}
                  className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                />
                {renderManualInput(
                  'occupancyShift',
                  -baseOcc + 10,
                  100 - baseOcc,
                  currentParams.occupancyShift >= 0 ? 'text-emerald-400' : 'text-rose-400',
                  '%'
                )}
              </div>
            </div>

            {/* 2. Сдвиг тарифа ADR */}
            <div className="border-b border-brand-border/40 pb-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#F5F2EB] flex items-center font-bold">
                  {isEn ? "ADR Shift" : "Сдвиг тарифа ADR"}
                  <button
                    type="button"
                    onClick={() => setActiveHelp('adrShift')}
                    className="ml-1.5 text-[#9C8F7E] hover:text-brand-gold focus:outline-none transition-colors"
                    title={isEn ? "Show explanation" : "Показать пояснение"}
                  >
                    <HelpCircle className="h-3.5 w-3.5 cursor-pointer" />
                  </button>
                </span>
                <span className="text-xs text-[#9C8F7E] font-mono flex items-center gap-1.5">
                  {isEn ? "Final ADR:" : "Итоговый ADR:"} <strong className="text-[#F5F2EB]">{new Intl.NumberFormat(isEn ? 'en-US' : 'ru-RU').format(Math.round(baseAdrVal * (1 + currentParams.adrShift / 100)))} {currency === 'USD' ? '$' : '₸'}</strong>
                  {currentParams.adrShift !== 0 && (
                    <button
                      type="button"
                      onClick={() => updateParam('adrShift', 0)}
                      className="text-brand-gold hover:text-white underline cursor-pointer text-[10px] uppercase tracking-wider font-mono bg-brand-gold/10 px-1.5 py-0.5 rounded border border-brand-gold/20 hover:border-brand-gold/40 transition-all"
                    >
                      {isEn ? "Reset" : "Обнулить"}
                    </button>
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="-35"
                  max="50"
                  value={currentParams.adrShift}
                  onChange={(e) => updateParam('adrShift', parseInt(e.target.value))}
                  className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                />
                {renderManualInput(
                  'adrShift',
                  -35,
                  50,
                  currentParams.adrShift >= 0 ? 'text-emerald-400' : 'text-rose-400',
                  '%'
                )}
              </div>
            </div>

            {/* 3. Снижение издержек (GOP) */}
            <div className="border-b border-brand-border/40 pb-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#F5F2EB] flex items-center font-bold">
                  {isEn ? "GOP Cost Control" : "Снижение издержек (GOP)"}
                  <button
                    type="button"
                    onClick={() => setActiveHelp('costControlSaving')}
                    className="ml-1.5 text-[#9C8F7E] hover:text-brand-gold focus:outline-none transition-colors"
                    title={isEn ? "Show explanation" : "Показать пояснение"}
                  >
                    <HelpCircle className="h-3.5 w-3.5 cursor-pointer" />
                  </button>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="-5"
                  max="15"
                  value={currentParams.costControlSaving}
                  onChange={(e) => updateParam('costControlSaving', parseInt(e.target.value))}
                  className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                />
                {renderManualInput(
                  'costControlSaving',
                  -5,
                  15,
                  currentParams.costControlSaving >= 0 ? 'text-emerald-400' : 'text-rose-400',
                  '%'
                )}
              </div>
            </div>

            {/* 4. Доп. продажи в ресторанах */}
            <div className="border-b border-brand-border/40 pb-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#F5F2EB] flex items-center font-bold">
                  {isEn ? "F&B Upsell Factor" : "Доп. продажи в ресторанах (F&B)"}
                  <button
                    type="button"
                    onClick={() => setActiveHelp('fbUpsellFactor')}
                    className="ml-1.5 text-[#9C8F7E] hover:text-brand-gold focus:outline-none transition-colors"
                    title={isEn ? "Show explanation" : "Показать пояснение"}
                  >
                    <HelpCircle className="h-3.5 w-3.5 cursor-pointer" />
                  </button>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="-30"
                  max="50"
                  value={currentParams.fbUpsellFactor}
                  onChange={(e) => updateParam('fbUpsellFactor', parseInt(e.target.value))}
                  className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                />
                {renderManualInput(
                  'fbUpsellFactor',
                  -30,
                  50,
                  currentParams.fbUpsellFactor >= 0 ? 'text-emerald-400' : 'text-rose-400',
                  '%'
                )}
              </div>
            </div>

            {/* 5. Премиум-заказы в SPA */}
            <div className="border-b border-brand-border/40 pb-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#F5F2EB] flex items-center font-bold">
                  {isEn ? "Spa Premium Factor (Anjana)" : "Премиум-заказы в SPA (Anjana)"}
                  <button
                    type="button"
                    onClick={() => setActiveHelp('spaPremiumFactor')}
                    className="ml-1.5 text-[#9C8F7E] hover:text-brand-gold focus:outline-none transition-colors"
                    title={isEn ? "Show explanation" : "Показать пояснение"}
                  >
                    <HelpCircle className="h-3.5 w-3.5 cursor-pointer" />
                  </button>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="-30"
                  max="50"
                  value={currentParams.spaPremiumFactor}
                  onChange={(e) => updateParam('spaPremiumFactor', parseInt(e.target.value))}
                  className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                />
                {renderManualInput(
                  'spaPremiumFactor',
                  -30,
                  50,
                  currentParams.spaPremiumFactor >= 0 ? 'text-emerald-400' : 'text-rose-400',
                  '%'
                )}
              </div>
            </div>



            {/* 7. Цена внешнего билета в Аквапарк */}
            <div className="border-b border-brand-border/40 pb-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#F5F2EB] flex items-center font-bold">
                  {isEn ? "Waterpark Ticket Price (External)" : "Цена билета в Аквапарк (внешние гости)"}
                  <button
                    type="button"
                    onClick={() => setActiveHelp('themeParkExternalPrice')}
                    className="ml-1.5 text-[#9C8F7E] hover:text-brand-gold focus:outline-none transition-colors"
                    title={isEn ? "Show explanation" : "Показать пояснение"}
                  >
                    <HelpCircle className="h-3.5 w-3.5 cursor-pointer" />
                  </button>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="25000"
                  step="500"
                  value={currentParams.themeParkExternalPrice}
                  onChange={(e) => updateParam('themeParkExternalPrice', parseInt(e.target.value))}
                  className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                />
                {renderManualInput('themeParkExternalPrice', 0, 25000, 'text-emerald-400', currency === 'USD' ? '$' : '₸')}
              </div>
            </div>

            {/* 8. Внешний поток гостей в Аквапарк */}
            <div className="pb-1">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#F5F2EB] flex items-center font-bold">
                  {isEn ? "Waterpark Traffic (External Guests)" : "Трафик в Аквапарке (внешние гости)"}
                  <button
                    type="button"
                    onClick={() => setActiveHelp('themeParkTicketsCount')}
                    className="ml-1.5 text-[#9C8F7E] hover:text-brand-gold focus:outline-none transition-colors"
                    title={isEn ? "Show explanation" : "Показать пояснение"}
                  >
                    <HelpCircle className="h-3.5 w-3.5 cursor-pointer" />
                  </button>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="25"
                  value={currentParams.themeParkTicketsCount}
                  onChange={(e) => updateParam('themeParkTicketsCount', parseInt(e.target.value))}
                  className="flex-1 accent-brand-gold bg-brand-input-bg rounded-lg cursor-pointer h-2"
                />
                {renderManualInput('themeParkTicketsCount', 0, 2000, 'text-brand-gold', isEn ? 'pax' : 'чел.')}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Explanation Popup Modal */}
      {activeHelp && explanations[activeHelp] && (
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
                  {explanations[activeHelp].title}
                </h3>
                
                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-[10px] font-bold font-mono tracking-wider text-[#8A7355] uppercase">
                      {isEn ? "Description:" : "Описание:"}
                    </h4>
                    <p className="text-xs text-[#403B35] leading-relaxed font-sans mt-1">
                      {explanations[activeHelp].description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold font-mono tracking-wider text-emerald-700 uppercase">
                      {isEn ? "Revenue Impact:" : "Влияние на доход:"}
                    </h4>
                    <p className="text-xs text-[#403B35] leading-relaxed font-sans mt-1">
                      {explanations[activeHelp].impact}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold font-mono tracking-wider text-[#8A7355] uppercase">
                      {isEn ? "RMS Recommendation:" : "Рекомендация RMS:"}
                    </h4>
                    <p className="text-xs text-[#403B35] leading-relaxed font-sans mt-1">
                      {explanations[activeHelp].recommendation}
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
