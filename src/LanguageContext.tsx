/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ru' | 'en';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ru: {
    // Header & Meta
    'header.title': 'EXECUTIVE RMS',
    'header.subtitle': 'all-inclusive luxury',
    'header.description': 'Панель управления доходами и бизнес-аналитики (CRM + RMS + BI)',
    'header.developer': 'Разработчик: Alexandr Kharchenko',
    'header.currency': 'Валюта:',
    'header.kzt': 'Тенге (KZT)',
    'header.usd': 'Доллар (USD)',
    'header.live_rate': 'Курс:',
    'header.data_hub': 'СУБД / DATA HUB',
    'header.time_zone': 'Время (GMT+5):',

    // Tabs
    'tab.overview': 'Обзор',
    'tab.whatif': 'Симулятор what-if',
    'tab.ancillary': 'Доп. Доходы',
    'tab.crm': 'Сегменты и CRM',
    'tab.compset': 'Конкуренты',

    // Dashboard Cards
    'kpi.occupancy.title': 'Загрузка номеров',
    'kpi.occupancy.sub': 'Occupancy Rate',
    'kpi.occupancy.desc': 'Доля занятых номеров из 515 доступных (500 номеров + 15 вилл)',
    'kpi.adr.title': 'Средний тариф (ADR)',
    'kpi.adr.sub': 'Average Daily Rate',
    'kpi.adr.desc': 'Средняя стоимость проданного номера в сутки',
    'kpi.revpar.title': 'Доход на номер (RevPAR)',
    'kpi.revpar.sub': 'Revenue Per Available Room',
    'kpi.revpar.desc': 'Выручка от продажи номеров на 1 доступный номер',
    'kpi.trevpar.title': 'Общий доход на номер (TRevPAR)',
    'kpi.trevpar.sub': 'Total RevPAR',
    'kpi.trevpar.desc': 'Общий доход отеля (номера + доп. услуги) на 1 доступный номер',
    'kpi.goppar.title': 'Операционная прибыль (GOPPAR)',
    'kpi.goppar.sub': 'Gross Operating Profit PAR',
    'kpi.goppar.desc': 'Валовая операционная прибыль отеля на 1 доступный номер',

    // Common Buttons / Actions
    'btn.close': 'Закрыть',
    'btn.save': 'Сохранить',
    'btn.calculate': 'Рассчитать',
    'btn.reset': 'Сбросить',
    'btn.help': 'Справка',
    'btn.understand': 'Понятно',
    'btn.confirm': 'Подтвердить прочтение',
    'btn.sync': 'Обновить данные',
    'btn.download_csv': 'Скачать отчет (.CSV)',
    'btn.download_json': 'Скачать параметры (.JSON)',

    // Presets
    'presets.title': '⚡ Стратегические пресеты (RMS)',
    'presets.subtitle': 'Быстрая симуляция макро-сценариев',
    'presets.help': 'Справка по пресетам',
    'presets.desc.title': 'Описание:',
    'presets.desc.body': 'Готовые комплексные сценарии для симулятора доходности, которые позволяют в один клик применить предустановленные параметры для типичных рыночных ситуаций (Летний пик спроса, корпоративный MICE сезон, ценовая война с конкурентами и т.д.).',
    'presets.impact.title': 'Влияние на доход:',
    'presets.impact.body': 'Каждый пресет мгновенно изменяет совокупность факторов: сдвиг загрузки отеля, ADR, комиссии каналов продаж, заполняемость Cabanas, стоимость билетов и объем дополнительных услуг. Это позволяет моментально увидеть финансовые последствия каждого макро-сценария.',
    'presets.rec.title': 'Рекомендация RMS:',
    'presets.rec.body': 'Используйте пресеты для быстрого анализа «чувствительности» отеля к сезонным перепадам спроса и выработки превентивной стратегии управления доходами (Yield Management).',

    // Compset
    'compset.header': 'Анализ конкурентного окружения (Competitor Compset Block)',
    'compset.subtitle': 'Аналитика проникновения, тарифов и генерации доходов (MPI, ARI, RGI)',
    'compset.desc': 'Бенчмаркинг отеля относительно пула ключевых конкурентов в регионе. Данные обновляются через Rate Shopper API.',
    'compset.radar_title': 'Позиционирование ADR относительно конкурентов',
    'compset.radar_desc': 'Анализ тарифов в сравнении с другими отелями побережья.',
    'compset.mpi_title': 'MPI (Market Penetration Index)',
    'compset.mpi_desc': 'Индекс проникновения на рынок (доля по загрузке). MPI > 100% означает, что у нас занято больше номеров, чем у конкурентов.',
    'compset.ari_title': 'ARI (Average Rate Index)',
    'compset.ari_desc': 'Индекс среднего тарифа. ARI > 120% подтверждает премиальную наценку бренда относительно рынка.',
    'compset.rgi_title': 'RGI (Revenue Generation Index)',
    'compset.rgi_desc': 'Индекс генерации доходов (доля RevPAR). Ключевой финансовый индикатор эффективности ценовой политики.',
    'compset.target_mpi': 'Цель: > 100%',
    'compset.target_ari': 'Цель: > 120%',
    'compset.target_rgi': 'Цель: > 110%',
    'compset.chart_title': 'Динамика коммерческих индексов (MPI, ARI, RGI)',

    // Pace / Weather (Overview Extensions)
    'pace.title': 'Pace Report (On-The-Books)',
    'pace.sub': 'Ретроспективное сравнение темпов набора броней',
    'pace.desc': 'Динамический анализ кривой OTB (забронированные ночи на будущие периоды) в сравнении с фактическим результатом аналогичного периода прошлого года и утвержденным годовым бюджетом отеля.',
    'pace.status': 'Темп: +8.4% к прошлому году',
    'pace.limit': 'Лимит емкости: 515 номеров',
    'pace.updated': 'Обновлено: сегодня, 08:00 (GMT+5)',
    'macro.title': 'Внешние факторы (Macro)',
    'macro.sub': 'Regional context matrix',
    'macro.status': 'Спрос: Высокий',
    'macro.desc': 'Учет рыночной конъюнктуры региона для превентивной адаптации тарифов и ресурсов курорта.',
    'macro.weather': 'Погода',
    'macro.weather_sub': 'Ясно, штиль • Темп. воды: +23.2°C',
    'macro.flights': 'Рейсы в Аэропорт',
    'macro.flights_sub': 'Все рейсы вовремя (Алматы, Стамбул)',
    'macro.holidays': 'Ближайшие праздники',
    'macro.holidays_sub': 'День Конституции РК (длинные вых.)',
    'macro.holidays_demand': '+18% Спрос',
    'macro.alert': 'Высокая температура воздуха и приближение праздников стимулируют местный туризм. Рекомендуется удерживать высокие BAR-тарифы на ближайшие выходные.',

    // AI Advisor
    'ai.title': 'ИИ-советник Генерального менеджера (AI Executive Advisor)',
    'ai.sub': 'Generative Revenue Management Strategic Reports',
    'ai.btn_report': 'Сформировать отчет ИИ',
    'ai.tab_report': 'Стратегический отчет',
    'ai.tab_chat': 'Интерактивный чат',
    'ai.init_title': 'Готов к анализу показателей',
    'ai.init_desc': 'Нажмите кнопку выше, чтобы запустить генеративную модель ИИ. Она обработает текущую структуру доходов (TRevPAR/GOPPAR), сдвиг загрузки, комиссии каналов и положение конкурентов, выдав экспертный план действий.',
    'ai.loading_pms': 'Обработка данных RMS...',
    'ai.error_title': 'Ошибка интеграции Gemini API',
    'ai.retry': 'Попробовать снова',
    'ai.roadmap': 'План первоочередных действий (Tactical RoadMap)',
    'ai.footer_desc': 'Рекомендации оптимизированы под маржинальность GOPPAR.',
    'ai.chat_user': 'Генеральный менеджер',
    'ai.chat_bot': 'ИИ-советник AI',
    'ai.chat_placeholder': 'Спросите ИИ о тарифах, TRevPAR, каналах продаж или доп. доходах...',
    'ai.chat_typing': 'ИИ-советник печатает...',
    'ai.chat_typing_metrics': 'Формулирование ответа на основе метрик...',
    'ai.chat_err': 'Ошибка чата',
    'ai.chat_init_msg': 'Приветствую вас, господин Генеральный Менеджер! Я — ваш интеллектуальный советник AI. Я в режиме реального времени отслеживаю все показатели симулятора. Готов ответить на любые ваши вопросы по управлению тарифами (ADR), максимизации TRevPAR/GOPPAR или продвижению дополнительных услуг. Какую задачу мы разберем сегодня?'
  },
  en: {
    // Header & Meta
    'header.title': 'EXECUTIVE RMS',
    'header.subtitle': 'all-inclusive luxury',
    'header.description': 'Revenue Management & Business Intelligence Suite (CRM + RMS + BI)',
    'header.developer': 'Developer: Alexandr Kharchenko',
    'header.currency': 'Currency:',
    'header.kzt': 'Tenge (KZT)',
    'header.usd': 'USD ($)',
    'header.live_rate': 'Rate:',
    'header.data_hub': 'DATA HUB / DBMS',
    'header.time_zone': 'Time (GMT+5):',

    // Tabs
    'tab.overview': 'Overview',
    'tab.whatif': 'What-If Simulator',
    'tab.ancillary': 'Ancillary Revenue',
    'tab.crm': 'Segments & CRM',
    'tab.compset': 'Competitors',

    // Dashboard Cards
    'kpi.occupancy.title': 'Room Occupancy',
    'kpi.occupancy.sub': 'Occupancy Rate',
    'kpi.occupancy.desc': 'Percentage of occupied rooms out of 515 available (500 rooms + 15 villas)',
    'kpi.adr.title': 'Average Daily Rate (ADR)',
    'kpi.adr.sub': 'Average Daily Rate',
    'kpi.adr.desc': 'Average revenue earned per occupied room per day',
    'kpi.revpar.title': 'Revenue Per Room (RevPAR)',
    'kpi.revpar.sub': 'Revenue Per Available Room',
    'kpi.revpar.desc': 'Rooms revenue divided by total available rooms',
    'kpi.trevpar.title': 'Total Revenue Per Room (TRevPAR)',
    'kpi.trevpar.sub': 'Total RevPAR',
    'kpi.trevpar.desc': 'Total hotel revenue (rooms + ancillary) per available room',
    'kpi.goppar.title': 'Operating Profit (GOPPAR)',
    'kpi.goppar.sub': 'Gross Operating Profit PAR',
    'kpi.goppar.desc': 'Gross operating profit per available room',

    // Common Buttons / Actions
    'btn.close': 'Close',
    'btn.save': 'Save',
    'btn.calculate': 'Calculate',
    'btn.reset': 'Reset',
    'btn.help': 'Help',
    'btn.understand': 'Got it',
    'btn.confirm': 'Confirm Reading',
    'btn.sync': 'Sync Live Data',
    'btn.download_csv': 'Download Report (.CSV)',
    'btn.download_json': 'Download Parameters (.JSON)',

    // Presets
    'presets.title': '⚡ Strategic Presets (RMS)',
    'presets.subtitle': 'Instant Macro Scenario Simulations',
    'presets.help': 'Presets Help',
    'presets.desc.title': 'Description:',
    'presets.desc.body': 'Pre-configured comprehensive scenarios for the yield simulator, allowing you to apply typical market situations with a single click (Summer Peak Demand, Corporate MICE Season, Competitor Price War, etc.).',
    'presets.impact.title': 'Revenue Impact:',
    'presets.impact.body': 'Each preset instantly adjusts multiple factors: hotel occupancy shift, ADR, channel commission rates, Cabanas booking rates, Theme Park ticket sales, and ancillary services volume. This shows the direct financial outcome of each macro scenario.',
    'presets.rec.title': 'RMS Recommendation:',
    'presets.rec.body': 'Use these presets for rapid sensitivity analysis of your hotel against seasonal demand swings to deploy preventative Yield Management tactics.',

    // Compset
    'compset.header': 'Competitive Compset Benchmarking',
    'compset.subtitle': 'Market Penetration, Average Rate & Revenue Generation Indexes (MPI, ARI, RGI)',
    'compset.desc': 'Benchmarking against key competitors in the region. Data fetched automatically via Rate Shopper API.',
    'compset.radar_title': 'ADR Positioning relative to Competitors',
    'compset.radar_desc': 'Analysis of tariff positioning in comparison to key coastline hotels.',
    'compset.mpi_title': 'MPI (Market Penetration Index)',
    'compset.mpi_desc': 'Market penetration index (occupancy share). MPI > 100% means we occupy more rooms than the competitor average.',
    'compset.ari_title': 'ARI (Average Rate Index)',
    'compset.ari_desc': 'Average rate index. ARI > 120% confirms strong premium pricing power relative to market.',
    'compset.rgi_title': 'RGI (Revenue Generation Index)',
    'compset.rgi_desc': 'Revenue generation index (RevPAR share). The primary financial KPI measuring pricing policy efficiency.',
    'compset.target_mpi': 'Target: > 100%',
    'compset.target_ari': 'Target: > 120%',
    'compset.target_rgi': 'Target: > 110%',
    'compset.chart_title': 'Commercial Indexes Historical Dynamics (MPI, ARI, RGI)',

    // Pace / Weather (Overview Extensions)
    'pace.title': 'Pace Report (On-The-Books)',
    'pace.sub': 'Historical booking pace tracking comparison',
    'pace.desc': 'Dynamic analysis of the OTB curve (booked room nights for future periods) compared to the actual performance of the same period last year and the approved annual hotel budget.',
    'pace.status': 'Pace: +8.4% vs. Last Year',
    'pace.limit': 'Capacity Limit: 515 rooms',
    'pace.updated': 'Updated: Today, 08:00 (GMT+5)',
    'macro.title': 'External Macro Factors',
    'macro.sub': 'Regional context matrix',
    'macro.status': 'Demand: High',
    'macro.desc': 'Integrating regional market environment for proactive rate and resort resource adaptation.',
    'macro.weather': 'Weather',
    'macro.weather_sub': 'Sunny, calm wind • Water Temp: +23.2°C',
    'macro.flights': 'Flights to Airport',
    'macro.flights_sub': 'All flights on time (Almaty, Istanbul)',
    'macro.holidays': 'Upcoming Holidays',
    'macro.holidays_sub': 'Constitution Day (long weekend)',
    'macro.holidays_demand': '+18% Demand',
    'macro.alert': 'High temperature and upcoming holidays strongly stimulate local leisure tourism. We recommend holding high BAR rates for the upcoming weekend.',

    // AI Advisor
    'ai.title': 'Generative AI Executive Advisor',
    'ai.sub': 'Generative Revenue Management Strategic Reports',
    'ai.btn_report': 'Generate AI Strategy',
    'ai.tab_report': 'Strategic Report',
    'ai.tab_chat': 'Interactive Chat',
    'ai.init_title': 'Ready for Metrics Analysis',
    'ai.init_desc': 'Click the button above to run the generative AI model. It will process your current revenue structures (TRevPAR/GOPPAR), occupancy shifts, channel fees, and competitor indexing to yield an expert tactical action plan.',
    'ai.loading_pms': 'Processing big data...',
    'ai.error_title': 'Gemini API Integration Error',
    'ai.retry': 'Retry Request',
    'ai.roadmap': 'Tactical RoadMap (Immediate Action Plan)',
    'ai.footer_desc': 'Recommendations optimized for GOPPAR margin.',
    'ai.chat_user': 'General Manager',
    'ai.chat_bot': 'AI Advisor',
    'ai.chat_placeholder': 'Ask AI about pricing, TRevPAR, sales channels, or ancillary revenues...',
    'ai.chat_typing': 'AI Advisor is typing...',
    'ai.chat_typing_metrics': 'Synthesizing response based on hotel metrics...',
    'ai.chat_err': 'Chat Error',
    'ai.chat_init_msg': 'Welcome, General Manager! I am your AI intellectual advisor. I monitor all simulator metrics in real-time. I stand ready to answer any of your questions on ADR optimization, TRevPAR/GOPPAR maximization, or promotion of ancillary services. Which strategic challenge should we tackle today?'
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');

  const t = (key: string): string => {
    return translations[language][key] || translations['ru'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
