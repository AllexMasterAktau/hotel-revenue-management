/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HotelKPIs } from '../types';
import { formatKZT, formatUSD } from '../data';
import { TrendingUp, TrendingDown, Percent, DollarSign, Hotel, Landmark, PieChart, ShieldAlert } from 'lucide-react';
import { HelpTrigger } from './InteractiveHelp';
import { useLanguage } from '../LanguageContext';

interface ExecutiveDashboardProps {
  currentKpis: HotelKPIs;
  baselineKpis: HotelKPIs;
  currency: 'KZT' | 'USD';
  onClickHelp: (key: string) => void;
  isLight?: boolean;
}

export default function ExecutiveDashboard({ currentKpis, baselineKpis, currency, onClickHelp, isLight }: ExecutiveDashboardProps) {
  const { language, t } = useLanguage();

  const formatValue = (value: number, isCurrency = true) => {
    if (!isCurrency) return value.toFixed(1);
    return currency === 'KZT' ? formatKZT(value) : formatUSD(value);
  };

  const getPercentChange = (current: number, baseline: number) => {
    if (baseline === 0) return 0;
    return ((current - baseline) / baseline) * 100;
  };

  const kpiCards = [
    {
      id: 'occupancy',
      title: t('kpi.occupancy.title'),
      subTitle: t('kpi.occupancy.sub'),
      current: currentKpis.occupancy,
      baseline: baselineKpis.occupancy,
      isCurrency: false,
      suffix: '%',
      icon: Hotel,
      description: t('kpi.occupancy.desc'),
      color: isLight 
        ? 'border-[#E5DEC9] bg-[#FCFAF4] shadow-md' 
        : 'border-brand-border bg-brand-card-bg',
      labelColor: isLight ? 'text-[#5C5246]' : 'text-[#D1C9BC]'
    },
    {
      id: 'adr',
      title: t('kpi.adr.title'),
      subTitle: t('kpi.adr.sub'),
      current: currentKpis.adr,
      baseline: baselineKpis.adr,
      isCurrency: true,
      suffix: '',
      icon: DollarSign,
      description: t('kpi.adr.desc'),
      color: isLight 
        ? 'border-[#E5DEC9] bg-[#FCFAF4] shadow-md' 
        : 'border-brand-border bg-brand-card-bg',
      labelColor: isLight ? 'text-[#5C5246]' : 'text-[#D1C9BC]'
    },
    {
      id: 'revpar',
      title: t('kpi.revpar.title'),
      subTitle: t('kpi.revpar.sub'),
      current: currentKpis.revpar,
      baseline: baselineKpis.revpar,
      isCurrency: true,
      suffix: '',
      icon: Landmark,
      description: t('kpi.revpar.desc'),
      color: isLight 
        ? 'border-[#E5DEC9] bg-[#FCFAF4] shadow-md' 
        : 'border-brand-border bg-brand-card-bg',
      labelColor: isLight ? 'text-[#5C5246]' : 'text-[#D1C9BC]'
    },
    {
      id: 'trevpar',
      title: t('kpi.trevpar.title'),
      subTitle: t('kpi.trevpar.sub'),
      current: currentKpis.trevpar,
      baseline: baselineKpis.trevpar,
      isCurrency: true,
      suffix: '',
      icon: PieChart,
      description: t('kpi.trevpar.desc'),
      color: isLight 
        ? 'border-[#E8DAB8] bg-[#FAF5E8] shadow-md' 
        : 'border-brand-gold/30 bg-brand-gold/5 shadow-inner',
      labelColor: isLight ? 'text-[#8B6B23]' : 'text-brand-gold'
    },
    {
      id: 'goppar',
      title: t('kpi.goppar.title'),
      subTitle: t('kpi.goppar.sub'),
      current: currentKpis.goppar,
      baseline: baselineKpis.goppar,
      isCurrency: true,
      suffix: '',
      icon: TrendingUp,
      description: t('kpi.goppar.desc'),
      color: isLight 
        ? 'border-[#C8E8D5] bg-[#F0F8F3] shadow-md' 
        : 'border-emerald-500/30 bg-emerald-500/5 shadow-inner',
      labelColor: isLight ? 'text-[#1B633F]' : 'text-emerald-400'
    }
  ];

  return (
    <div id="executive-dashboard-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiCards.map((card) => {
        const change = getPercentChange(card.current, card.baseline);
        const IconComponent = card.icon;
        const isPositive = change >= 0;
        const isTrevparOrGoppar = card.id === 'trevpar' || card.id === 'goppar';

        return (
          <div
            key={card.id}
            id={`kpi-card-${card.id}`}
            className={`border rounded-lg p-4.5 backdrop-blur-sm shadow-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${card.color}`}
          >
            <div className="flex justify-between items-start mb-2.5">
              <div className="min-w-0 pr-2">
                <div className="flex items-center space-x-1">
                  <span className={`text-[10px] font-bold tracking-wider uppercase truncate ${card.labelColor}`}>
                    {card.title}
                  </span>
                  <HelpTrigger topicKey={card.id} onClickHelp={onClickHelp} />
                </div>
                <span className={`text-[9px] font-mono block tracking-tight mt-0.5 ${isLight ? 'text-[#7A6E5D]' : 'text-[#9C8F7E]'}`}>
                  {card.subTitle}
                </span>
              </div>
              <div className={`p-1.5 rounded shrink-0 ${
                isLight
                  ? card.id === 'trevpar'
                    ? 'bg-amber-200/80 text-amber-900 border border-amber-300'
                    : card.id === 'goppar'
                    ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-300'
                    : 'bg-stone-200 text-stone-800 border border-stone-300'
                  : card.id === 'trevpar'
                  ? 'bg-brand-gold/10 text-brand-gold'
                  : card.id === 'goppar'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-brand-input-bg text-brand-gold'
              }`}>
                <IconComponent className="h-4 w-4" />
              </div>
            </div>

            <div className="my-2">
              <div className="flex items-baseline space-x-1">
                <span className={`font-sans font-bold tracking-tight ${isLight ? 'text-[#2B2723]' : 'text-[#F5F2EB]'} ${isTrevparOrGoppar ? 'text-2xl lg:text-3xl font-mono' : 'text-xl lg:text-2xl font-mono'}`}>
                  {formatValue(card.current, card.isCurrency)}
                  {card.suffix}
                </span>
              </div>
              <div className={`text-[10px] font-mono mt-0.5 ${isLight ? 'text-[#6E6252]' : 'text-[#9C8F7E]'}`}>
                {language === 'ru' ? 'План:' : 'Plan:'} {formatValue(card.baseline, card.isCurrency)}
                {card.suffix}
              </div>
            </div>

            <div className={`border-t pt-2.5 mt-2 flex items-center justify-between ${isLight ? 'border-[#E5DEC9]' : 'border-brand-border/40'}`}>
              <span className={`text-[10px] max-w-[65%] leading-tight ${isLight ? 'text-[#5C5246]' : 'text-[#9C8F7E]'}`}>
                {card.description}
              </span>
              {change !== 0 ? (
                <span
                  id={`kpi-change-${card.id}`}
                  className={`text-[10px] font-mono font-extrabold flex items-center space-x-0.5 px-1.5 py-0.5 rounded ${
                    isLight
                      ? isPositive 
                        ? 'text-emerald-950 bg-emerald-200/90 border border-emerald-400/60' 
                        : 'text-rose-950 bg-rose-200/90 border border-rose-400/60'
                      : isPositive 
                        ? 'text-emerald-400 bg-emerald-500/10' 
                        : 'text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {isPositive ? '+' : ''}
                  {change.toFixed(1)}%
                </span>
              ) : (
                <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded shadow-sm ${
                  isLight ? 'text-stone-900 bg-stone-200 border border-stone-300' : 'text-white-pure bg-[#8E8273]'
                }`}>
                  0.0%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
