/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, X, Info, Award, Calculator, TrendingUp } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export interface HelpTopic {
  title: string;
  subtitle: string;
  purpose: string;
  methodology: string;
  advice: string;
}

export const HELP_TOPICS: Record<string, HelpTopic> = {
  occupancy: {
    title: 'Загрузка номеров (Occupancy Rate)',
    subtitle: 'Базовый операционный индикатор заполняемости отеля',
    purpose: 'Отражает уровень использования номерного фонда курорта (500 номеров и 15 премиальных вилл). Генеральному менеджеру важно отслеживать загрузку для правильного планирования персонала, закупок продуктов питания (F&B) и прогнозирования нагрузки на инфраструктуру аквапарка.',
    methodology: 'Рассчитывается как отношение проданных номеров к общему количеству доступных номеров за период: \n[Формула]: (Проданные номера / 515 доступных номеров) * 100%.',
    advice: 'Стремитесь к оптимальной загрузке в пределах 75-85% в высокий сезон. Слишком высокая загрузка (95%+) при низком тарифе говорит о недополученной прибыли (занижена цена). При падении загрузки ниже 50% в будни рассмотрите запуск пакетных предложений или акций «Раннее бронирование».'
  },
  adr: {
    title: 'Средний суточный тариф (ADR)',
    subtitle: 'Average Daily Rate • Ключевой ценовой показатель',
    purpose: 'Показывает среднюю фактическую стоимость, по которой продается один номер в сутки. Это главный инструмент регулирования маржинальности отеля.',
    methodology: 'Рассчитывается делением общей выручки от продажи номеров на количество фактически проданных номеров за вычетом комплиментарных (бесплатных) номеров: \n[Формула]: Выручка от номеров / Количество проданных номеров.',
    advice: 'Внедряйте динамическое ценообразование (BAR уровни). Повышайте тариф по мере сокращения количества свободных номеров на выбранные даты. Контролируйте, чтобы высокая цена не обрушила загрузку, создавая дисбаланс.'
  },
  revpar: {
    title: 'Доход на доступный номер (RevPAR)',
    subtitle: 'Revenue Per Available Room • Главный KPI продаж номеров',
    purpose: 'Объединяет показатели загрузки и среднего тарифа в единую метрику. Позволяет сравнивать операционную эффективность отеля независимо от его размера и колебаний цен.',
    methodology: 'Рассчитывается как произведение загрузки на средний тариф или делением выручки от номеров на общий доступный фонд: \n[Формула]: ADR * (Загрузка / 100)  ИЛИ  Выручка от номеров / 515.',
    advice: 'Не гонитесь исключительно за 100% загрузкой или максимальным тарифом. Максимальный RevPAR достигается при сбалансированной стратегии Yield Management, когда высокая цена подкрепляется стабильным спросом.'
  },
  trevpar: {
    title: 'Общий доход на доступный номер (TRevPAR)',
    subtitle: 'Total RevPAR • Комплексный показатель доходности курорта',
    purpose: 'Для премиального отеля, работающего по системе All Inclusive с широкой инфраструктурой дополнительных услуг, этот показатель критически важен. Он оценивает способность отеля монетизировать гостя во всех точках продаж (SPA, рестораны, аренды Cabanas, аквапарк).',
    methodology: 'Складывает выручку от номеров и выручку всех дополнительных POS-терминалов, после чего делит на общий доступный фонд номеров: \n[Формула]: (Выручка Rooms + Выручка F&B, SPA, Cabanas, Аквапарка) / 515.',
    advice: 'Увеличивайте TRevPAR за счет активного апсейла VIP-услуг (например, кабан на пирсе или индивидуальных спа-процедур) на этапе бронирования в CRM.'
  },
  goppar: {
    title: 'Валовая операционная прибыль (GOPPAR)',
    subtitle: 'Gross Operating Profit Per Available Room • Метрика инвестора',
    purpose: 'Индикатор чистой операционной эффективности бизнеса. Показывает прибыль, остающуюся после вычета всех операционных расходов (зарплаты, себестоимость продуктов, коммунальные платежи), приходящуюся на один доступный номер.',
    methodology: 'Рассчитывается вычитанием операционных расходов из общей выручки и делением на доступный фонд: \n[Формула]: (Общая выручка - Операционные расходы) / 515 доступных номеров.',
    advice: 'Даже при росте выручки GOPPAR может падать из-за неэффективного менеджмента. Регулируйте затраты (Cost Control) в низкий сезон: закрывайте неиспользуемые крылья отеля, оптимизируйте графики работы персонала.'
  },
  pace_report: {
    title: 'Pace Report (On-The-Books)',
    subtitle: 'Кривая темпов бронирования на 30–90 дней вперед',
    purpose: 'Позволяет заглянуть в будущее и оценить, насколько быстро заполняется отель на предстоящие даты по сравнению с прошлым годом (LY) и запланированным бюджетом.',
    methodology: 'Строится на основе ежедневного накопления зарезервированных номеров (On-The-Books) на фиксированные будущие даты.',
    advice: 'Если текущий темп (кривая OTB) идет значительно выше прошлого года, это сигнал к немедленному повышению тарифов (ADR) для оставшихся номеров. Если темп отстает — запускайте таргетированные спецпредложения.'
  },
  macro_context: {
    title: 'Внешние факторы (Macro Context)',
    subtitle: 'Влияние климата, транспорта и календаря на курорт',
    purpose: 'Анализ факторов внешней среды региона, определяющих спонтанный спрос (Walk-In гостей) и продажи билетов в аквапарк.',
    methodology: 'Свод метеорологических данных Каспийского моря, мониторинг расписания рейсов авиакомпаний в местный аэропорт (SCO) и государственных праздников РК.',
    advice: 'При температуре воды в море выше +22°С резко возрастает маржинальность аквапарка. Повышайте цены на входные билеты (Day Pass) для нерезидентов отеля до 20 000 ₸, чтобы избежать перегрузки пляжа.'
  },
  channel_mix: {
    title: 'Доли каналов продаж (Channel Mix)',
    subtitle: 'Структура дистрибуции номерного фонда',
    purpose: 'Помогает оптимизировать расходы на продажи. Высокая зависимость от OTA (Booking.com) забирает до 15-20% выручки в виде комиссий.',
    methodology: 'Процентное соотношение доходов или проданных ночей по основным каналам продаж: Direct (Сайт/Приложение), OTA, MICE/Corporate, Tour Operators.',
    advice: 'Стимулируйте прямые продажи (Direct) через предоставление бонусов в отельной CRM (бесплатный трансфер, ранний заезд). Идеальная цель — удерживать долю прямых продаж выше 35%.'
  },
  cost_of_acquisition: {
    title: 'Стоимость привлечения клиентов (CAC & Net Revenue)',
    subtitle: 'Анализ реальной чистой доходности каналов продаж',
    purpose: 'Показывает разницу между ценой продажи номера (Gross ADR) и реальным доходом отеля за вычетом комиссий посредникам и маркетинговых затрат.',
    methodology: 'Рассчитывается вычитанием комиссионных вознаграждений OTA/агентам и прямых рекламных расходов из валового дохода канала: \n[Формула]: Гросс Доход - Комиссии - Маркетинговый бюджет.',
    advice: 'Оценивайте каналы по Net ADR. Иногда выгоднее снизить цену на 10% для прямого гостя, чем платить 18% комиссии международному туроператору.'
  },
  wash_factor: {
    title: 'Анализ отмен и незаездов (Wash Factor)',
    subtitle: 'Оптимизация политики овербукинга',
    purpose: 'Анализирует вероятность отмены бронирований ближе к дате заезда, помогая Генеральному менеджеру безопасно перепродавать номера во избежание простоя.',
    methodology: 'Процент броней, которые аннулируются до даты заезда: \n[Формула]: (Количество отмененных номеров / Общее число бронирований) * 100%.',
    advice: 'При стабильном Wash Factor в 5-8% в летний сезон, вы можете смело перепродавать (овербукинг) отель на 3-4% в пиковые даты. Это гарантирует 100% фактическую загрузку без риска переселения.'
  },
  compset_radar: {
    title: 'Радар тарифов конкурентов (Competitor Rate Radar)',
    subtitle: 'Ценовой радар отелей региона',
    purpose: 'Отслеживание открытых розничных тарифов прямых пятизвездочных конкурентов в реальном времени для недопущения ценового демпинга.',
    methodology: 'Парсинг цен отелей-конкурентов Compset (например, Caspian Riviera, Grand Hotel) с помощью Rate Shopper API.',
    advice: 'Наш отель является безусловным лидером региона. Держите премию бренда (наценку) в размере 15-25% относительно средней цены рынка благодаря концепции All-Inclusive и масштабной инфраструктуре.'
  },
  market_indices: {
    title: 'Рыночные коммерческие индексы (ARI, MPI, RGI)',
    subtitle: 'Сравнительный анализ эффективности на рынке',
    purpose: 'Метрики показывают, забирает ли наш отель свою справедливую долю рынка относительно конкурентов по загрузке, тарифу и доходу.',
    methodology: 'MPI = Загрузка отеля / Ср. загрузка рынка. \nARI = ADR отеля / Ср. ADR рынка. \nRGI = RevPAR отеля / Ср. RevPAR рынка. \nЗначение 100% означает полное соответствие средней медиане рынка.',
    advice: 'Если ваш RGI > 110%, отель доминирует на рынке. Если RGI < 100%, но MPI > 100% — вы демпингуете (продаете много дешевых номеров). Если ARI > 100%, но MPI < 90% — ваши цены завышены для текущего спроса.'
  }
};

export const HELP_TOPICS_EN: Record<string, HelpTopic> = {
  occupancy: {
    title: 'Occupancy Rate',
    subtitle: 'Base operational indicator of hotel occupancy',
    purpose: 'Reflects the utilization level of resort room inventory (500 rooms and 15 premium villas). It is critical for the General Manager to track occupancy for proper staff planning, food and beverage (F&B) procurement, and predicting the load on the water park infrastructure.',
    methodology: 'Calculated as the ratio of sold rooms to total available rooms over a period: \n[Formula]: (Sold Rooms / 515 Available Rooms) * 100%.',
    advice: 'Aim for optimal occupancy within 75-85% in high season. Too high occupancy (95%+) at a low rate suggests missed profit (underpriced rooms). If occupancy falls below 50% on weekdays, consider launching packages or "Early Booking" promotions.'
  },
  adr: {
    title: 'Average Daily Rate (ADR)',
    subtitle: 'Average Daily Rate • Key pricing indicator',
    purpose: 'Shows the average actual rate at which one room is sold per day. It is the main tool for regulating hotel margin.',
    methodology: 'Calculated by dividing total room revenue by the number of rooms actually sold, excluding complimentary (free) rooms: \n[Formula]: Room Revenue / Number of Sold Rooms.',
    advice: 'Implement dynamic pricing (BAR levels). Raise the rate as the number of available rooms decreases for selected dates. Ensure that high price does not collapse occupancy, creating an imbalance.'
  },
  revpar: {
    title: 'Revenue Per Available Room (RevPAR)',
    subtitle: 'Revenue Per Available Room • Main KPI of room sales',
    purpose: 'Combines occupancy and average rate indicators into a single metric. Allows comparing hotel operational efficiency regardless of size and price fluctuations.',
    methodology: 'Calculated as the product of occupancy and average daily rate, or by dividing room revenue by the total available inventory: \n[Formula]: ADR * (Occupancy / 100)  OR  Room Revenue / 515.',
    advice: 'Do not chase 100% occupancy or maximum rate exclusively. Maximum RevPAR is achieved with a balanced Yield Management strategy, where high rate is supported by stable demand.'
  },
  trevpar: {
    title: 'Total RevPAR (TRevPAR)',
    subtitle: 'Total RevPAR • Comprehensive resort profitability indicator',
    purpose: 'For the resort, operating on an All-Inclusive basis with a large non-room infrastructure, this indicator is critical. It evaluates the hotel\'s ability to monetize a guest across all POS terminals (SPA, restaurants, Cabanas, water park).',
    methodology: 'Adds room revenue and revenue of all auxiliary POS terminals, then divides by the total available room inventory: \n[Formula]: (Rooms Revenue + Revenue of F&B, SPA, Cabanas, Water Park) / 515.',
    advice: 'Increase TRevPAR through active upselling of VIP services (e.g., cabanas on the pier or individual spa treatments) during the booking stage in the CRM.'
  },
  goppar: {
    title: 'Gross Operating Profit PAR (GOPPAR)',
    subtitle: 'Gross Operating Profit Per Available Room • Investor metric',
    purpose: 'Indicator of net operational efficiency of the business. Shows the profit remaining after deducting all operating expenses (salaries, cost of goods, utility bills) per available room.',
    methodology: 'Calculated by subtracting operating expenses from total revenue and dividing by available inventory: \n[Formula]: (Total Revenue - Operating Expenses) / 515 Available Rooms.',
    advice: 'Even with revenue growth, GOPPAR can fall due to inefficient management. Regulate expenses (Cost Control) in low season: close unused hotel wings, optimize staff schedules.'
  },
  pace_report: {
    title: 'Pace Report (On-The-Books)',
    subtitle: 'Booking pace curve 30 to 90 days ahead',
    purpose: 'Allows peering into the future and evaluating how quickly the hotel is filling for upcoming dates compared to last year (LY) and the planned budget.',
    methodology: 'Built on the daily accumulation of reserved rooms (On-The-Books) on fixed future dates.',
    advice: 'If the current booking pace (OTB curve) is significantly higher than last year, it is a signal to immediately raise rates (ADR) for remaining rooms. If pace lags behind, launch targeted special offers.'
  },
  macro_context: {
    title: 'External Factors (Macro Context)',
    subtitle: 'Impact of climate, transport, and calendar on the resort',
    purpose: 'Analysis of regional external environment factors determining spontaneous demand (Walk-In guests) and water park ticket sales.',
    methodology: 'Summary of Caspian Sea meteorological data, monitoring airline flight schedules to local airport (SCO), and RK public holidays.',
    advice: 'When the sea water temperature rises above +22°C, water park profitability increases sharply. Raise prices for day passes (Day Pass) for non-residents to 20,000 ₸ to avoid beach overcrowding.'
  },
  channel_mix: {
    title: 'Sales Channels Share (Channel Mix)',
    subtitle: 'Room inventory distribution structure',
    purpose: 'Helps optimize sales costs. High dependence on OTAs (Booking.com) takes up to 15-20% of revenue as commission.',
    methodology: 'Percentage ratio of revenues or room nights sold across main sales channels: Direct (Website/App), OTA, MICE/Corporate, Tour Operators.',
    advice: 'Boost direct sales (Direct) by offering benefits in hotel CRM (free transfer, early check-in). An ideal goal is keeping direct sales share above 35%.'
  },
  cost_of_acquisition: {
    title: 'Cost of Customer Acquisition (CAC & Net Revenue)',
    subtitle: 'Analysis of real net channel profitability',
    purpose: 'Shows the difference between the room sale price (Gross ADR) and actual hotel revenue net of intermediary commissions and marketing costs.',
    methodology: 'Calculated by subtracting OTA/agent commissions and direct advertising costs from the gross revenue of the channel: \n[Formula]: Gross Revenue - Commissions - Marketing Budget.',
    advice: 'Evaluate channels by Net ADR. Sometimes it is more profitable to reduce the rate by 10% for a direct guest than to pay 18% commission to an international tour operator.'
  },
  wash_factor: {
    title: 'Cancellations & No-Shows (Wash Factor)',
    subtitle: 'Overbooking policy optimization',
    purpose: 'Analyzes the probability of cancellation closer to the check-in date, helping the General Manager safely overbook rooms to avoid vacancy.',
    methodology: 'Percentage of bookings that are canceled before check-in: \n[Formula]: (Canceled Bookings / Total Bookings) * 100%.',
    advice: 'With a stable Wash Factor of 5-8% in summer season, you can safely overbook the hotel by 3-4% on peak dates. This guarantees 100% actual occupancy without overbooking relocation risks.'
  },
  compset_radar: {
    title: 'Competitor Rate Radar',
    subtitle: 'Regional hotel price radar',
    purpose: 'Tracking open retail rates of direct five-star competitors in real-time to prevent price dumping.',
    methodology: 'Parsing prices of compset competitor hotels (e.g., Caspian Riviera, Grand Hotel) using Rate Shopper API.',
    advice: 'Our hotel is the absolute market leader. Maintain a brand premium of 15-25% over the market average, thanks to the All-Inclusive concept and massive infrastructure.'
  },
  market_indices: {
    title: 'Market Indices (ARI, MPI, RGI)',
    subtitle: 'Comparative market performance analysis',
    purpose: 'Metrics show whether our hotel is capturing its fair share of the market relative to competitors in occupancy, rate, and revenue.',
    methodology: 'MPI = Hotel Occupancy / Market Avg. Occupancy. \nARI = Hotel ADR / Market Avg. ADR. \nRGI = Hotel RevPAR / Market Avg. RevPAR. \nValue of 100% means perfect alignment with the market average.',
    advice: 'If your RGI > 110%, the hotel dominates the market. If RGI < 100% but MPI > 100% — you are dumping (selling too many cheap rooms). If ARI > 100% but MPI < 90% — your rates are too high for current demand.'
  }
};

interface HelpModalProps {
  topicKey: string | null;
  onClose: () => void;
}

export function InteractiveHelpModal({ topicKey, onClose }: HelpModalProps) {
  const { language } = useLanguage();
  
  if (!topicKey) return null;

  const topicsDict = language === 'ru' ? HELP_TOPICS : HELP_TOPICS_EN;
  const topic = topicsDict[topicKey];

  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div 
        id={`help-modal-${topicKey}`}
        className="bg-[#FCFAF2] border border-[#E5DFD5] rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden animate-slide-up"
      >
        {/* Header Decorator Accent */}
        <div className="h-1 w-full bg-[#B2925B]" />

        <div className="p-6 space-y-5">
          {/* Title Area */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#B2925B] uppercase block">
                {language === 'ru' ? 'РИКСОС RMS • СПРАВОЧНАЯ СИСТЕМА' : 'RIXOS RMS • HELP SYSTEM'}
              </span>
              <h3 className="text-base font-bold text-[#2B2723] font-sans tracking-tight">
                {topic.title}
              </h3>
              <p className="text-[11px] text-[#7A6E5D] italic font-sans leading-none">
                {topic.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7A6E5D] hover:text-[#2B2723] hover:bg-[#F3EFE6] transition-all cursor-pointer"
              title={language === 'ru' ? 'Закрыть' : 'Close'}
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {/* 1. Purpose */}
            <div className="bg-[#F5F1E6]/60 border border-[#E5DFD5] rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-[10px] font-bold font-mono tracking-wider text-[#7A6E5D] uppercase flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-[#B2925B]" />
                <span>{language === 'ru' ? 'Назначение (Для Генерального менеджера)' : 'Purpose (For General Manager)'}</span>
              </h4>
              <p className="text-xs text-[#3D352E] leading-relaxed font-sans">
                {topic.purpose}
              </p>
            </div>

            {/* 2. Methodology */}
            <div className="bg-[#F5F1E6]/60 border border-[#E5DFD5] rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-[10px] font-bold font-mono tracking-wider text-[#7A6E5D] uppercase flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-[#B2925B]" />
                <span>{language === 'ru' ? 'Методология и Формулы расчета' : 'Methodology & Formulas'}</span>
              </h4>
              <p className="text-xs text-[#3D352E] leading-relaxed font-mono whitespace-pre-line bg-[#FCFAF2] p-2.5 rounded border border-[#E5DFD5] text-[#9B773E] font-semibold">
                {topic.methodology}
              </p>
            </div>

            {/* 3. Strategic Advice */}
            <div className="bg-[#EEF7F2] border border-[#D5ECE1] rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-[10px] font-bold font-mono tracking-wider text-[#22573E] uppercase flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{language === 'ru' ? 'Стратегический совет RMS' : 'RMS Strategic Advice'}</span>
              </h4>
              <p className="text-xs text-[#3D352E] leading-relaxed font-sans">
                {topic.advice}
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-[#E5DFD5] flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#2B2723] hover:bg-[#3D352E] text-[#FCFAF2] font-extrabold text-xs py-2.5 px-6 rounded-lg transition-all shadow-md cursor-pointer"
            >
              {language === 'ru' ? 'Подтвердить прочтение' : 'Acknowledge Reading'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HelpTriggerProps {
  topicKey: string;
  onClickHelp: (key: string) => void;
  className?: string;
}

export function HelpTrigger({ topicKey, onClickHelp, className = "" }: HelpTriggerProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClickHelp(topicKey);
      }}
      className={`text-[#9C8F7E] hover:text-brand-gold transition-colors focus:outline-none focus:ring-1 focus:ring-brand-gold/40 rounded-full p-0.5 cursor-pointer shrink-0 ${className}`}
      title="Показать подробную справку"
    >
      <HelpCircle className="h-3.5 w-3.5" />
    </button>
  );
}
