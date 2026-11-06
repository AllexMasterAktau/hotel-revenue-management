/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SimulationParameters } from './types';
import { 
  DEFAULT_SIMULATION_PARAMS, 
  calculateHotelMetrics, 
  getSimulatedSegments, 
  getSimulatedChannels, 
  getSimulatedAncillary,
  BASELINE_COMPETITORS,
  formatKZT,
  formatUSD,
  setUSDExchangeRate,
  USD_TO_KZT_RATE,
  STRATEGIC_PRESETS
} from './data';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import WhatIfSimulator from './components/WhatIfSimulator';
import AncillaryRevenue from './components/AncillaryRevenue';
import SegmentationBlock from './components/SegmentationBlock';
import CompsetBlock from './components/CompsetBlock';
import AIAdvisor from './components/AIAdvisor';
import DataHubModal from './components/DataHubModal';
import { InteractiveHelpModal } from './components/InteractiveHelp';
import OverviewExtensions from './components/OverviewExtensions';
import { useLanguage } from './LanguageContext';
import FrontOfficeDashboard from './components/FrontOfficeDashboard';
import SpaDashboard from './components/SpaDashboard';
import FbDashboard from './components/FbDashboard';
import FinanceDashboard from './components/FinanceDashboard';
import SalesMarketingDashboard from './components/SalesMarketingDashboard';
import DepartmentImportModal from './components/DepartmentImportModal';
import { 
  Landmark, Compass, DollarSign, CalendarDays, BrainCircuit, Globe, 
  Activity, Clock, Zap, HelpCircle, X, Info, LayoutDashboard, 
  Sliders, Users, LineChart, Database, Key, Sparkles, Utensils, 
  Wallet, ChevronLeft, ChevronRight, Target 
} from 'lucide-react';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [currentParams, setCurrentParams] = useState<SimulationParameters>(DEFAULT_SIMULATION_PARAMS);
  const [currency, setCurrency] = useState<'KZT' | 'USD'>('KZT');
  const [activeTab, setActiveTab] = useState<'overview' | 'whatif' | 'ancillary' | 'crm' | 'compset' | 'salesmarketing' | 'frontoffice' | 'spa' | 'fb' | 'finance'>('overview');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(USD_TO_KZT_RATE);
  const [showPresetsHelp, setShowPresetsHelp] = useState<boolean>(false);
  const [showSuiteHelp, setShowSuiteHelp] = useState<boolean>(false);
  const [isDataHubOpen, setIsDataHubOpen] = useState<boolean>(false);
  const [activeHelpTopic, setActiveHelpTopic] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [activeImportDept, setActiveImportDept] = useState<'frontoffice' | 'spa' | 'fb' | 'finance' | 'salesmarketing' | 'hr' | 'engineering'>('frontoffice');
  const [deptStatuses, setDeptStatuses] = useState<Record<string, 'updated' | 'needs_update'>>({
    frontoffice: 'needs_update',
    spa: 'updated',
    fb: 'needs_update',
    finance: 'updated',
    salesmarketing: 'needs_update',
    hr: 'updated',
    engineering: 'needs_update'
  });

  const handleOpenImport = (dept: 'frontoffice' | 'spa' | 'fb' | 'finance' | 'salesmarketing' | 'hr' | 'engineering') => {
    setActiveImportDept(dept);
    setIsImportModalOpen(true);
  };

  const handleDeptStatusChange = (deptId: string, status: 'updated' | 'needs_update') => {
    setDeptStatuses(prev => ({
      ...prev,
      [deptId]: status
    }));
  };

  // Fetch live exchange rate on mount
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && data.rates.KZT) {
            const rate = parseFloat(data.rates.KZT.toFixed(2));
            setUSDExchangeRate(rate);
            setExchangeRate(rate);
            console.log(`Successfully fetched live USD/KZT exchange rate: ${rate}`);
          }
        }
      } catch (e) {
        console.error('Error fetching live USD/KZT exchange rate:', e);
      }
    };
    fetchRate();
  }, []);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Adjust to Aktau time zone (typically UTC+5)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Aqtau',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setCurrentTime(new Intl.DateTimeFormat('ru-RU', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute dynamic KPIs on-the-fly as slider variables move
  const currentKpis = calculateHotelMetrics(currentParams);
  
  const baselineParams: SimulationParameters = {
    ...DEFAULT_SIMULATION_PARAMS,
    baseOccupancy: currentParams.baseOccupancy,
    baseAdr: currentParams.baseAdr,
    baseFbRevenue: currentParams.baseFbRevenue,
    baseSpaRevenue: currentParams.baseSpaRevenue
  };
  const baselineKpis = calculateHotelMetrics(baselineParams);

  const segments = getSimulatedSegments(currentKpis.occupancy, currentKpis.adr, currentParams);
  const channels = getSimulatedChannels(currentKpis.roomsRevenue);
  const ancillaryPosList = getSimulatedAncillary(currentParams, currentKpis.occupancy);
  const baselineAncillaryList = getSimulatedAncillary(baselineParams, baselineKpis.occupancy);

  const getTabTitle = (tab: string) => {
    if (language === 'ru') {
      switch (tab) {
        case 'overview': return 'Главная (Overview)';
        case 'whatif': return 'Моделирование (What-If)';
        case 'ancillary': return 'Доп. доходы (POS)';
        case 'crm': return 'Аналитика (CRM)';
        case 'compset': return 'Рынок (Compset)';
        case 'salesmarketing': return 'Sales & Marketing';
        case 'frontoffice': return 'Front Office & Reception';
        case 'spa': return 'Anjana SPA & Wellness';
        case 'fb': return 'F&B & Рестораны';
        case 'finance': return 'Финансы & OPEX';
        default: return '';
      }
    } else {
      switch (tab) {
        case 'overview': return 'Overview';
        case 'whatif': return 'What-If Simulation';
        case 'ancillary': return 'Ancillary Revenue (POS)';
        case 'crm': return 'Analytics (CRM)';
        case 'compset': return 'Market Benchmarking';
        case 'salesmarketing': return 'Sales & Marketing';
        case 'frontoffice': return 'Front Office & Reception';
        case 'spa': return 'Anjana SPA & Wellness';
        case 'fb': return 'F&B & Restaurants';
        case 'finance': return 'Finance & OPEX';
        default: return '';
      }
    }
  };

  const renderSidebarItem = (
    tabId: typeof activeTab, 
    icon: React.ReactNode, 
    nameRu: string, 
    nameEn: string
  ) => {
    const isActive = activeTab === tabId;
    const label = language === 'ru' ? nameRu : nameEn;
    const isDept = ['salesmarketing', 'finance', 'frontoffice', 'fb', 'spa'].includes(tabId);
    const status = isDept ? deptStatuses[tabId] : null;

    return (
      <button
        key={tabId}
        onClick={() => setActiveTab(tabId)}
        className={`w-full group relative flex items-center transition-all cursor-pointer ${
          isCollapsed ? 'justify-center py-3 px-1' : 'px-3.5 py-2.5 my-1 rounded-lg'
        } ${
          isActive 
            ? 'bg-[#B38E5D] text-neutral-950 font-bold shadow-lg shadow-[#B38E5D]/15 border-l-4 border-amber-500' 
            : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
        }`}
        title={isCollapsed ? label : undefined}
      >
        <div className={`shrink-0 flex items-center justify-center relative ${isActive ? 'text-neutral-950' : 'text-neutral-400 group-hover:text-white'}`}>
          {icon}
          {isCollapsed && isDept && (
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-neutral-950 ${
              status === 'updated' ? 'bg-emerald-400' : 'bg-amber-400'
            }`} />
          )}
        </div>
        {!isCollapsed && (
          <span className="ml-3 text-xs tracking-wide whitespace-nowrap font-medium flex-1 text-left">
            {label}
          </span>
        )}
        {!isCollapsed && isDept && status && (
          <span className={`ml-2 text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 uppercase tracking-wider ${
            status === 'updated'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse'
          }`}>
            {status === 'updated' 
              ? (language === 'ru' ? 'Свежие' : 'Updated') 
              : (language === 'ru' ? 'Нужен импорт' : 'Needs BI')}
          </span>
        )}
        {isCollapsed && isActive && (
          <div className="absolute right-1 w-1 h-3 rounded-full bg-[#B38E5D]" />
        )}
      </button>
    );
  };

  return (
    <div className="h-screen w-screen bg-brand-dark-bg text-[#F5F2EB] flex font-sans selection:bg-brand-gold selection:text-brand-dark-bg overflow-hidden">
      
      {/* Premium Luxury Sidebar Navigation */}
      <aside className={`h-screen bg-neutral-950 border-r border-amber-500/20 transition-all duration-300 flex flex-col justify-between shrink-0 z-30 ${isCollapsed ? 'w-[70px]' : 'w-[360px]'}`}>
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Header / Logo */}
          <div className="p-4 border-b border-brand-border/40 flex items-center justify-between">
            <div className="flex items-center space-x-3.5 overflow-hidden">
              <div className="h-10 w-10 rounded-lg bg-[#B38E5D] flex items-center justify-center shadow-lg shadow-[#B38E5D]/20 shrink-0">
                <span className="font-display font-black text-neutral-950 text-xl tracking-wider">R</span>
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <h1 className="text-xs font-extrabold tracking-[0.18em] font-display text-[#F5F2EB] uppercase leading-none">
                    EXECUTIVE RESORT
                  </h1>
                  <span className="text-[9px] font-mono font-medium tracking-wider uppercase text-[#B38E5D] mt-1.5 block">
                    Executive RMS
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="p-3 space-y-5">
            {/* Group 1: Главное управление */}
            <div>
              {!isCollapsed && (
                <p className="text-[9px] font-mono font-bold tracking-wider text-[#9C8F7E] uppercase px-3 mb-2">
                  {language === 'ru' ? 'ГЛАВНОЕ УПРАВЛЕНИЕ' : 'MAIN CONTROL'}
                </p>
              )}
              <div className="space-y-1">
                {renderSidebarItem('overview', <LayoutDashboard className="h-4 w-4" />, '📊 Главная (Overview)', '📊 Overview')}
                {renderSidebarItem('whatif', <Sliders className="h-4 w-4" />, '🎛️ Моделирование (What-If)', '🎛️ What-If Simulation')}
                {renderSidebarItem('ancillary', <Landmark className="h-4 w-4" />, '🍷 Доп. доходы (POS)', '🍷 Ancillary Revenue (POS)')}
                {renderSidebarItem('crm', <Users className="h-4 w-4" />, '👥 Аналитика (CRM)', '👥 Analytics (CRM)')}
                {renderSidebarItem('compset', <LineChart className="h-4 w-4" />, '📈 Рынок (Compset)', '📈 Market Benchmarking')}
              </div>
            </div>

            {/* Group 2: Центр данных департаментов */}
            <div>
              {!isCollapsed && (
                <p className="text-[9px] font-mono font-bold tracking-wider text-[#9C8F7E] uppercase px-3 mb-2">
                  {language === 'ru' ? 'ЦЕНТР ДАННЫХ ДЕПАРТАМЕНТОВ' : 'DEPARTMENTAL DATA'}
                </p>
              )}
              <div className="space-y-1">
                {renderSidebarItem('salesmarketing', <Target className="h-4 w-4" />, '🎯 Sales & Marketing', '🎯 Sales & Marketing')}
                {renderSidebarItem('finance', <Wallet className="h-4 w-4" />, '💰 Финансы & OPEX', '💰 Finance & OPEX')}
                {renderSidebarItem('frontoffice', <Key className="h-4 w-4" />, '🔑 Front Office & Reception', '🔑 Front Office & Reception')}
                {renderSidebarItem('fb', <Utensils className="h-4 w-4" />, '🍽️ F&B & Рестораны', '🍽️ F&B & Restaurants')}
                {renderSidebarItem('spa', <Sparkles className="h-4 w-4" />, '🧖‍♀️ Anjana SPA & Wellness', '🧖‍♀️ Anjana SPA & Wellness')}
              </div>
            </div>
          </div>
        </div>

        {/* Collapse Button */}
        <div className="p-3 border-t border-brand-border/40 shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer border border-brand-border/30 flex items-center justify-center w-full"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : (
              <div className="flex items-center justify-center space-x-2 text-xs font-mono font-bold">
                <ChevronLeft className="h-4 w-4" />
                <span>{language === 'ru' ? 'Свернуть' : 'Collapse'}</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Upper Header Bar */}
        <header className="border-b border-brand-border bg-brand-card-bg sticky top-0 z-40 px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-md shadow-brand-gold/5">
          <div>
            <h1 className="text-sm font-extrabold tracking-wide font-display text-[#F5F2EB] uppercase">
              {getTabTitle(activeTab)}
            </h1>
            <p className="text-[10px] font-mono text-brand-gold uppercase mt-0.5">
              HOTEL & RESORT • EXECUTIVE RMS
            </p>
          </div>

          {/* Status Indicators & Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Live Aktau Time Clock */}
            <div className="flex items-center space-x-2 text-[#D1C9BC] bg-brand-input-bg px-3 py-1.5 rounded-lg border border-brand-border font-mono text-xs shadow-inner">
              <Clock className="h-3.5 w-3.5 text-brand-gold shrink-0" />
              <span>{t('header.time_zone')}</span>
              <span className="text-white font-bold tracking-widest">{currentTime || '--:--:--'}</span>
            </div>

            {/* Live Exchange Rate Badge */}
            <div className="flex items-center space-x-2 text-[#D1C9BC] bg-brand-input-bg px-3 py-1.5 rounded-lg border border-brand-border font-mono text-xs shadow-inner">
              <Globe className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{t('header.live_rate')} USD/KZT:</span>
              <span className="text-emerald-400 font-bold">{exchangeRate} ₸</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-brand-input-bg rounded-lg p-1 border border-brand-border shadow-inner">
              <button
                onClick={() => setLanguage('ru')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  language === 'ru' 
                    ? 'bg-brand-gold text-brand-dark-bg shadow-md' 
                    : 'text-[#9C8F7E] hover:text-[#F5F2EB]'
                }`}
              >
                Рус
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  language === 'en' 
                    ? 'bg-brand-gold text-brand-dark-bg shadow-md' 
                    : 'text-[#9C8F7E] hover:text-[#F5F2EB]'
                }`}
              >
                Eng
              </button>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center bg-brand-input-bg rounded-lg p-1 border border-brand-border shadow-inner">
              <button
                onClick={() => setCurrency('KZT')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  currency === 'KZT' 
                    ? 'bg-brand-gold text-brand-dark-bg shadow-md' 
                    : 'text-[#9C8F7E] hover:text-[#F5F2EB]'
                }`}
              >
                ₸ KZT
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  currency === 'USD' 
                    ? 'bg-brand-gold text-brand-dark-bg shadow-md' 
                    : 'text-[#9C8F7E] hover:text-[#F5F2EB]'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Data & Integrations Hub Button */}
            <button
              onClick={() => setIsDataHubOpen(true)}
              className="flex items-center space-x-2 bg-brand-input-bg text-brand-gold hover:text-white border border-brand-border hover:border-brand-gold/40 px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all shadow-inner hover:bg-brand-gold/10 cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-[#B38E5D] shrink-0" />
              <span>{t('header.data_hub')}</span>
            </button>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* 1. Executive Dashboard (KPI Summaries) - Upper Executive KPIs always visible */}
          <section id="executive-dashboard-section" className="space-y-2">
            <h3 className={`text-xs font-bold font-mono tracking-wider uppercase px-1 ${activeTab === 'salesmarketing' ? 'text-[#7A6E5D]' : 'text-[#9C8F7E]'}`}>
              {language === 'ru' ? 'Сводные операционные показатели (Upper Executive KPIs)' : 'Upper Executive KPI Summary'}
            </h3>
            <ExecutiveDashboard 
              currentKpis={currentKpis} 
              baselineKpis={baselineKpis} 
              currency={currency} 
              onClickHelp={setActiveHelpTopic}
              isLight={activeTab === 'salesmarketing'}
            />
          </section>

          {/* System Sub-heading Status Banner */}
          <div className={`border rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all shadow-md ${
            activeTab === 'salesmarketing' 
              ? 'bg-[#FCFAF4] border-[#E5DEC9] text-[#2B2723]' 
              : 'bg-gradient-to-r from-brand-gold/10 to-transparent border-brand-border text-[#F5F2EB]'
          }`}>
            <div className="flex items-start space-x-3">
              <Activity className={`h-5 w-5 shrink-0 mt-0.5 animate-pulse ${activeTab === 'salesmarketing' ? 'text-amber-800' : 'text-brand-gold'}`} />
              <div>
                <h2 className={`text-sm font-extrabold uppercase font-display tracking-wide flex items-center gap-1.5 ${activeTab === 'salesmarketing' ? 'text-[#2B2723]' : 'text-[#F5F2EB]'}`}>
                  {language === 'ru' 
                    ? 'Панель стратегического моделирования и управления доходами' 
                    : 'Strategic Revenue Management Suite & Simulation Dashboard'}
                  <button
                    type="button"
                    onClick={() => setShowSuiteHelp(true)}
                    className={`transition-all focus:outline-none p-1 rounded hover:bg-[#B38E5D]/10 cursor-pointer ${activeTab === 'salesmarketing' ? 'text-[#7A6E5D] hover:text-amber-800' : 'text-[#9C8F7E] hover:text-brand-gold'}`}
                    title={language === 'ru' ? 'Показать справку по модулю' : 'Show suite help'}
                  >
                    <HelpCircle className="h-4 w-4 shrink-0" />
                  </button>
                </h2>
                <p className={`text-[11px] mt-0.5 leading-relaxed font-sans ${activeTab === 'salesmarketing' ? 'text-[#5C5246]' : 'text-[#D1C9BC]'}`}>
                  {language === 'ru'
                    ? 'Инструмент сценарного анализа «What-If» и Yield-менеджмента для оценки эластичности спроса, оптимизации каналов продаж и максимизации GOPPAR.'
                    : 'What-If scenario analysis and Yield Management tool to evaluate demand elasticity, optimize distribution channels, and maximize GOPPAR.'}
                </p>
              </div>
            </div>
            <div className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border ${
              activeTab === 'salesmarketing' 
                ? 'bg-[#F4EFE6] border-[#E2D9C5] text-[#5C5246]' 
                : 'bg-brand-input-bg border-brand-border text-[#9C8F7E]'
            }`}>
              {language === 'ru' ? 'ОБЩИЙ ФОНД:' : 'TOTAL CAPACITY:'} <span className={`font-bold ${activeTab === 'salesmarketing' ? 'text-[#2B2723]' : 'text-white'}`}>515 {language === 'ru' ? 'КЛЮЧЕЙ (500 номеров + 15 вилл)' : 'KEYS (500 rooms + 15 villas)'}</span> • {language === 'ru' ? 'СТАТУС:' : 'STATUS:'} <span className="text-emerald-800 font-bold">{language === 'ru' ? 'ОНЛАЙН' : 'ONLINE'}</span>
            </div>
          </div>

        {/* Tab Content Panels */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-6">
              {/* Strategic Presets (RMS) */}
              <div id="strategic-presets-card-container" className="border border-brand-border rounded-xl p-5 bg-brand-card-bg/80 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase flex items-center">
                    <Zap className="h-4 w-4 mr-1.5 text-brand-gold" />
                    {language === 'ru' ? 'Стратегические пресеты (RMS)' : 'Strategic Presets (RMS)'}
                    <button
                      type="button"
                      onClick={() => setShowPresetsHelp(true)}
                      className="ml-1.5 text-[#9C8F7E] hover:text-brand-gold focus:outline-none transition-colors"
                      title={language === 'ru' ? 'Показать пояснение' : 'Show help explanation'}
                    >
                      <HelpCircle className="h-3.5 w-3.5 cursor-pointer shrink-0" />
                    </button>
                  </h3>
                </div>
                <p className="text-xs text-[#D1C9BC] mb-4 font-sans">
                  {language === 'ru' 
                    ? 'Быстрое переключение на ключевые сезоны и рыночные условия для оценки прогноза доходов.'
                    : 'Quickly switch to key seasons and market conditions to evaluate revenue forecasts.'}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {STRATEGIC_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentParams(preset.params)}
                      className="text-left bg-brand-input-bg/60 border border-brand-border/40 hover:border-brand-gold/40 rounded-lg p-3 transition-all hover:bg-brand-input-bg text-xs flex flex-col justify-between group h-full cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-[#F5F2EB] group-hover:text-brand-gold transition-colors block">
                          {language === 'ru' ? preset.nameRu : preset.nameEn}
                        </span>
                        <span className="text-[10px] text-[#9C8F7E] leading-relaxed font-sans mt-1.5 block">
                          {language === 'ru' ? preset.descriptionRu : preset.descriptionEn}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategic Presets Help Modal */}
              {showPresetsHelp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
                  <div className="bg-[#FCFAF2] border border-[#E5DFD5] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                    <button
                      onClick={() => setShowPresetsHelp(false)}
                      className="absolute top-4 right-4 text-[#7A6E5D] hover:text-[#2B2723] transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="flex items-start space-x-3 mt-1">
                      <div className="p-2 bg-[#B2925B]/10 rounded-lg text-[#B2925B] shrink-0 mt-0.5">
                        <Info className="h-5 w-5" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#2B2723] font-sans leading-snug">
                          {language === 'ru' ? '⚡ Стратегические пресеты (RMS)' : '⚡ Strategic Presets (RMS)'}
                        </h3>
                        
                        <div className="space-y-3.5">
                          <div>
                            <h4 className="text-[10px] font-bold font-mono tracking-wider text-[#B2925B] uppercase">
                              {language === 'ru' ? 'Описание:' : 'Description:'}
                            </h4>
                            <p className="text-xs text-[#3D352E] leading-relaxed font-sans mt-1">
                              {language === 'ru' 
                                ? 'Готовые комплексные сценарии для симулятора доходности, которые позволяют в один клик применить предустановленные параметры для типичных рыночных ситуаций (Летний пик спроса, корпоративный MICE сезон, ценовая война с конкурентами и т.д.).'
                                : 'Ready-made integrated scenarios for the revenue simulator, allowing you to apply pre-set parameters in one click for typical market situations (Summer peak demand, corporate MICE season, price war with competitors, etc.).'}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-bold font-mono tracking-wider text-[#22573E] uppercase">
                              {language === 'ru' ? 'Влияние на доход:' : 'Revenue Impact:'}
                            </h4>
                            <p className="text-xs text-[#3D352E] leading-relaxed font-sans mt-1">
                              {language === 'ru'
                                ? 'Каждый пресет мгновенно изменяет совокупность факторов: сдвиг загрузки отеля, ADR, комиссии каналов продаж, заполняемость Cabanas, стоимость билетов и объем дополнительных услуг. Это позволяет моментально увидеть финансовые последствия каждого макро-сценария.'
                                : 'Each preset instantly shifts a combination of factors: hotel occupancy deviation, ADR, sales channel commissions, Cabanas occupancy, theme park ticket pricing, and extra sales volume. This immediately reveals the financial impact of each macro scenario.'}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-bold font-mono tracking-wider text-[#B2925B] uppercase">
                              {language === 'ru' ? 'Рекомендация RMS:' : 'RMS Recommendation:'}
                            </h4>
                            <p className="text-xs text-[#3D352E] leading-relaxed font-sans mt-1">
                              {language === 'ru'
                                ? 'Используйте пресеты для быстрого анализа «чувствительности» отеля к сезонным перепадам спроса и выработки превентивной стратегии управления доходами (Yield Management).'
                                : 'Use presets for rapid sensitivity analysis of hotel performance against seasonal demand shifts and formulation of proactive revenue yielding strategies.'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button
                            onClick={() => setShowPresetsHelp(false)}
                            className="bg-[#2B2723] hover:bg-[#3D352E] text-[#FCFAF2] font-bold text-xs py-2 px-5 rounded-lg transition-colors shadow-md cursor-pointer"
                          >
                            {language === 'ru' ? 'Понятно' : 'Got it'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Pace Report and Weather/Flight Macro Context Bento */}
              <OverviewExtensions 
                currentParams={currentParams}
                onClickHelp={setActiveHelpTopic}
              />

              {/* AI Strategy Advisor */}
              <AIAdvisor 
                currentKpis={currentKpis}
                competitors={BASELINE_COMPETITORS}
                segments={segments}
                channels={channels}
                ancillaryPosList={ancillaryPosList}
                currentParams={currentParams}
              />
            </div>
          )}

          {activeTab === 'whatif' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
              <WhatIfSimulator 
                currentParams={currentParams} 
                onParamsChange={setCurrentParams} 
                currency={currency}
              />
            </div>
          )}

          {activeTab === 'ancillary' && (
            <div className="animate-fade-in">
              <AncillaryRevenue 
                ancillaryPosList={ancillaryPosList}
                baselinePosList={baselineAncillaryList}
                currency={currency}
                currentParams={currentParams}
                onParamsChange={setCurrentParams}
              />
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="animate-fade-in space-y-6">
              {/* Elegant placeholder banner indicating progress */}
              <div className="border border-[#F5F2EB]/10 rounded-xl p-5 bg-gradient-to-r from-brand-gold/5 via-transparent to-transparent backdrop-blur-sm shadow-xl flex items-start space-x-4">
                <div className="h-10 w-10 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0 border border-brand-gold/20">
                  <BrainCircuit className="h-5 w-5 text-brand-gold animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F5F2EB] font-sans uppercase tracking-wide">
                    {language === 'ru' ? 'Модуль аналитики CRM в разработке...' : 'CRM Analytics Module in Development...'}
                  </h4>
                  <p className="text-xs text-[#D1C9BC] leading-relaxed mt-1 font-sans">
                    {language === 'ru'
                      ? 'Интеграция с базой данных Loyalty Club, сегментацией по целям поездок и профилированием гостей находится в процессе подключения. Ниже представлены интерактивные демонстрационные данные по сегментам и каналам продаж для текущего сценария.'
                      : 'Integration with the Loyalty Club database, trip purpose segmentation, and guest profiling is currently being connected. Interactive simulated data for segments and sales channels for the current scenario are presented below.'}
                  </p>
                </div>
              </div>

              {/* Fully functional Segmentation component preserved */}
              <SegmentationBlock 
                segments={segments}
                channels={channels}
                currency={currency}
                onClickHelp={setActiveHelpTopic}
              />
            </div>
          )}

          {activeTab === 'compset' && (
            <div className="animate-fade-in space-y-6">
              {/* Elegant placeholder banner indicating progress */}
              <div className="border border-[#F5F2EB]/10 rounded-xl p-5 bg-gradient-to-r from-[#9C8F7E]/10 via-transparent to-transparent backdrop-blur-sm shadow-xl flex items-start space-x-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                  <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F5F2EB] font-sans uppercase tracking-wide">
                    {language === 'ru' ? 'Радар конкурентов в разработке...' : 'Competitor Radar in Development...'}
                  </h4>
                  <p className="text-xs text-[#D1C9BC] leading-relaxed mt-1 font-sans">
                    {language === 'ru'
                      ? 'Подключение парсинга тарифов конкурентов в реальном времени по API (Booking, OTA Insight) выполняется IT-департаментом. Ниже представлен интерактивный аналитический блок индексов MPI, ARI, RGI относительно отелей-конкурентов.'
                      : 'Real-time API competitor rate parsing (Booking, OTA Insight) is being implemented by the IT department. Below is the fully interactive indices analytics dashboard for MPI, ARI, and RGI indexes relative to competitor hotels.'}
                  </p>
                </div>
              </div>

              {/* Fully functional Compset component preserved */}
              <CompsetBlock 
                currentKpis={currentKpis}
                competitors={BASELINE_COMPETITORS}
                currency={currency}
                onClickHelp={setActiveHelpTopic}
              />
            </div>
          )}

          {/* Departmental dashboards */}
          {activeTab === 'salesmarketing' && (
            <div className="animate-fade-in">
              <SalesMarketingDashboard 
                language={language}
                currentParams={currentParams}
                setCurrentParams={setCurrentParams}
                currency={currency}
                onOpenImport={handleOpenImport}
              />
            </div>
          )}

          {activeTab === 'frontoffice' && (
            <div className="animate-fade-in">
              <FrontOfficeDashboard 
                language={language}
                currentParams={currentParams}
                setCurrentParams={setCurrentParams}
                currency={currency}
                segments={segments}
                channels={channels}
                setActiveHelpTopic={setActiveHelpTopic}
                onOpenImport={handleOpenImport}
              />
            </div>
          )}

          {activeTab === 'spa' && (
            <div className="animate-fade-in">
              <SpaDashboard 
                language={language}
                currentParams={currentParams}
                setCurrentParams={setCurrentParams}
                currency={currency}
                ancillaryPosList={ancillaryPosList}
                baselineAncillaryList={baselineAncillaryList}
                onOpenImport={handleOpenImport}
              />
            </div>
          )}

          {activeTab === 'fb' && (
            <div className="animate-fade-in">
              <FbDashboard 
                language={language}
                currentParams={currentParams}
                setCurrentParams={setCurrentParams}
                currency={currency}
                ancillaryPosList={ancillaryPosList}
                baselineAncillaryList={baselineAncillaryList}
                onOpenImport={handleOpenImport}
              />
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="animate-fade-in">
              <FinanceDashboard 
                language={language}
                currentParams={currentParams}
                setCurrentParams={setCurrentParams}
                currency={currency}
                currentKpis={currentKpis}
                ancillaryPosList={ancillaryPosList}
                onOpenImport={handleOpenImport}
              />
            </div>
          )}
        </div>

      </main>

      {/* Corporate Luxury Footer */}
      <footer className="border-t border-brand-border bg-brand-card-bg py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono text-[#9C8F7E] gap-3">
          <span>© 2026 Executive Revenue Management. Все права защищены.</span>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F0E6] rounded-md border border-[#E2D9C5] shadow-sm">
            <span className="text-[#5C4033] font-medium">{language === 'ru' ? 'Разработчик:' : 'Developer:'}</span>
            <span className="font-extrabold text-[#3D2E1E]">Alexandr Kharchenko</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Intelligence Revenue Engine v3.14</span>
            <span className="flex items-center gap-1 text-[#F5F2EB]">
              <BrainCircuit className="h-3.5 w-3.5 text-brand-gold" />
              Gemini Core Connected
            </span>
          </div>
        </div>
      </footer>

      {/* Dynamic Data Hub and Integration Manager */}
      <DataHubModal 
        isOpen={isDataHubOpen}
        onClose={() => setIsDataHubOpen(false)}
        currentParams={currentParams}
        onParamsChange={setCurrentParams}
        currentKpis={currentKpis}
        baselineKpis={baselineKpis}
        currency={currency}
        onStatusChange={handleDeptStatusChange}
      />

      {/* Department-Specific BI Import Gateway */}
      <DepartmentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        departmentId={activeImportDept}
        language={language}
        currentParams={currentParams}
        onParamsChange={setCurrentParams}
        onStatusChange={handleDeptStatusChange}
        currency={currency}
      />

      {/* Strategic Suite Help Modal */}
      {showSuiteHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#FCFAF2] border border-[#E5DFD5] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSuiteHelp(false)}
              className="absolute top-4 right-4 text-[#7A6E5D] hover:text-[#2B2723] transition-colors cursor-pointer p-1 rounded-lg hover:bg-neutral-200/50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start space-x-3 mt-1">
              <div className="p-2.5 bg-[#B38E5D]/10 rounded-lg text-[#B38E5D] shrink-0 mt-0.5 border border-[#B38E5D]/20">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#2B2723] font-display uppercase tracking-wider leading-snug">
                  {language === 'ru' 
                    ? '🛡️ Панель стратегического моделирования & Yield-менеджмента'
                    : '🛡️ Strategic Modeling & Yield Management Suite'}
                </h3>
                
                <p className="text-xs text-[#5C5446] leading-relaxed font-sans">
                  {language === 'ru' 
                    ? 'Интеллектуальная система поддержки принятия решений позволяет моделировать операционную деятельность отельного комплекса (515 ключей) на основе эластичности спроса, изменения тарифов, загрузки и структуры расходов.'
                    : 'This intelligent decision-support system allows you to model the operational activities of the resort hotel (515 keys) based on demand elasticity, rate adjustments, occupancy trends, and cost structures.'}
                </p>

                <div className="space-y-3 pt-2">
                  <div className="border-l-2 border-[#B38E5D] pl-3">
                    <h4 className="text-xs font-bold text-[#2B2723] uppercase font-mono tracking-wide">
                      {language === 'ru' ? '1. Сценарный анализ «What-If» (Что-Если)' : '1. "What-If" Scenario Analysis'}
                    </h4>
                    <p className="text-[11px] text-[#5C5446] mt-1 leading-relaxed">
                      {language === 'ru'
                        ? 'Изменяйте в реальном времени ключевые параметры: среднюю цену номера (ADR), базовую загрузку (OCC), SPA услуги, рестораны, налоги, комиссии и OPEX. Система мгновенно пересчитает их влияние на доходы и показатель GOPPAR.'
                        : 'Adjust key simulation parameters (ADR, occupancy, F&B/SPA covers, taxes, commission rates, and OPEX) in real time to instantly project outcomes on net profit, departmental revenues, and GOPPAR.'}
                    </p>
                  </div>

                  <div className="border-l-2 border-[#B38E5D] pl-3">
                    <h4 className="text-xs font-bold text-[#2B2723] uppercase font-mono tracking-wide">
                      {language === 'ru' ? '2. Управление данными и заполнение' : '2. Data Entry & Management'}
                    </h4>
                    <p className="text-[11px] text-[#5C5446] mt-1 leading-relaxed">
                      {language === 'ru'
                        ? 'Вы можете загружать исторические данные из PMS (Opera), POS (Simphony) и SPA (Anjana) систем через "Данные и Интеграции" (Data Hub) в правом верхнем углу, либо выполнять точечную ручную регулировку параметров на каждой вкладке.'
                        : 'You can upload historical data from PMS (Opera), POS (Simphony), and SPA (Anjana) systems using the "Data Hub" in the top header, or perform fine manual tuning of parameters directly on each departmental tab.'}
                    </p>
                  </div>

                  <div className="border-l-2 border-[#B38E5D] pl-3">
                    <h4 className="text-xs font-bold text-[#2B2723] uppercase font-mono tracking-wide">
                      {language === 'ru' ? '3. Основные метрики эффективности' : '3. Core Performance Metrics'}
                    </h4>
                    <p className="text-[11px] text-[#5C5446] mt-1 leading-relaxed">
                      {language === 'ru'
                        ? 'RevPAR демонстрирует эффективность номерного фонда, TRevPAR учитывает все дополнительные точки продаж (F&B, SPA), а GOPPAR показывает реальную валовую операционную прибыль на один доступный номер.'
                        : 'RevPAR shows room inventory efficiency, TRevPAR includes all ancillary points of sale (F&B, SPA), and GOPPAR displays the actual gross operating profit per available room.'}
                    </p>
                  </div>
                </div>

                <div className="bg-[#B38E5D]/5 border border-[#B38E5D]/20 p-3 rounded-lg mt-3">
                  <p className="text-[10px] font-mono text-[#7A6E5D] leading-normal">
                    💡 <span className="font-bold">{language === 'ru' ? 'Совет:' : 'Tip:'}</span>{' '}
                    {language === 'ru'
                      ? 'Используйте стратегические пресеты (RMS) на вкладке «Главная» для мгновенного переключения между сезонами и автоматического заполнения параметров моделирования.'
                      : 'Use strategic presets (RMS) on the Overview tab to instantly toggle between key seasons and auto-populate the simulation model.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Universal Help System Modal */}
      <InteractiveHelpModal 
        topicKey={activeHelpTopic}
        onClose={() => setActiveHelpTopic(null)}
      />

      </div>
    </div>
  );
}
