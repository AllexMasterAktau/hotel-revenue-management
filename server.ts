/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST Endpoint: AI Advisor for the General Manager
app.post('/api/ai/advise', async (req, res) => {
  const { kpis, compset, segments, channels, ancillary, params, language } = req.body;
  const isEn = language === 'en';

  const prompt = isEn ? `
  You are a premium AI Advisor (Chief Revenue Officer & AI Advisor) for the General Manager of the luxury resort complex (5 stars, total inventory 515 keys: 500 standard rooms and 15 ultra-luxury villas).

  You are provided with the current financial and market metrics based on the "What-If" simulator:
  
  CURRENT OPERATIONAL METRICS (KPIs):
  - Occupancy: ${kpis.occupancy.toFixed(1)}% (Shift: ${params.occupancyShift > 0 ? '+' : ''}${params.occupancyShift}%)
  - Average Daily Rate (ADR): ${new Intl.NumberFormat('en-US').format(kpis.adr)} ₸ (Shift: ${params.adrShift > 0 ? '+' : ''}${params.adrShift}%)
  - RevPAR: ${new Intl.NumberFormat('en-US').format(kpis.revpar)} ₸
  - TRevPAR: ${new Intl.NumberFormat('en-US').format(kpis.trevpar)} ₸
  - GOPPAR: ${new Intl.NumberFormat('en-US').format(kpis.goppar)} ₸
  - GOP Margin: ${kpis.gopMargin.toFixed(1)}%
  - Total Revenue: ${new Intl.NumberFormat('en-US').format(kpis.totalRevenue)} ₸ (Rooms: ${new Intl.NumberFormat('en-US').format(kpis.roomsRevenue)} ₸, Ancillary: ${new Intl.NumberFormat('en-US').format(kpis.ancillaryRevenue)} ₸)
  
  COMPSET MARKET INDICES:
  - MPI: ${compset.mpi.toFixed(1)}% (Target > 100% means we lead the market in occupancy)
  - ARI: ${compset.ari.toFixed(1)}% (Target > 100% means our brand rate is more expensive than competitors)
  - RGI: ${compset.rgi.toFixed(1)}% (Primary measure of market share power)

  GUEST SEGMENTATION:
  ${segments.map((s: any) => `- ${s.name}: Share ${s.share}%, ADR ${new Intl.NumberFormat('en-US').format(s.adr)} ₸, Revenue ${new Intl.NumberFormat('en-US').format(s.revenue)} ₸`).join('\n')}

  ANCILLARY REVENUE SOURCES:
  ${ancillary.map((a: any) => `- ${a.name}: Revenue ${new Intl.NumberFormat('en-US').format(a.currentRevenue)} ₸ (Visitors: ${a.visitorCount}, Average spend: ${new Intl.NumberFormat('en-US').format(a.averageSpend)} ₸)`).join('\n')}

  ACTIVE SIMULATION PARAMETERS:
  - Cabana Occupancy: ${params.cabanaOccupancy}%
  - Water Park External Ticket Price: ${new Intl.NumberFormat('en-US').format(params.themeParkExternalPrice)} ₸
  - External Tickets Sold: ${params.themeParkTicketsCount} pcs.
  - F&B Upsell Factor: ${params.fbUpsellFactor}%
  - SPA Premium Factor: ${params.spaPremiumFactor}%
  - Operating Cost Savings: ${params.costControlSaving}%

  TASK:
  Analyze these metrics and compile a strategic report for the General Manager (GM) of the hotel entirely in English.
  The report should contain a deep analysis of TRevPAR and GOPPAR, competitive positioning (based on MPI, ARI, RGI indexes) and 3-4 concrete, actionable, high-priority plans for maximizing profits.
  ` : `
  Вы — высококлассный искусственный интеллект-советник (Chief Revenue Officer & AI Advisor) для генерального менеджера премиального курортного отеля (5 звезд, общий фонд 515 ключей: 500 стандартных номеров и 15 ультра-роскошных вилл).

  Вам предоставлены текущие финансовые и рыночные метрики на основе симулятора "What-If":
  
  ТЕКУЩИЕ ОПЕРАЦИОННЫЕ ПОКАЗАТЕЛИ (KPI):
  - Загрузка (Occupancy): ${kpis.occupancy.toFixed(1)}% (Сдвиг: ${params.occupancyShift > 0 ? '+' : ''}${params.occupancyShift}%)
  - Средняя стоимость номера (ADR): ${new Intl.NumberFormat('ru-RU').format(kpis.adr)} ₸ (Сдвиг: ${params.adrShift > 0 ? '+' : ''}${params.adrShift}%)
  - RevPAR (Доход на доступный номер): ${new Intl.NumberFormat('ru-RU').format(kpis.revpar)} ₸
  - TRevPAR (Общий доход на номер): ${new Intl.NumberFormat('ru-RU').format(kpis.trevpar)} ₸
  - GOPPAR (Операционная прибыль на номер): ${new Intl.NumberFormat('ru-RU').format(kpis.goppar)} ₸
  - Маржа GOP (Gross Operating Profit Margin): ${kpis.gopMargin.toFixed(1)}%
  - Общая выручка (Total Revenue): ${new Intl.NumberFormat('ru-RU').format(kpis.totalRevenue)} ₸ (Номера: ${new Intl.NumberFormat('ru-RU').format(kpis.roomsRevenue)} ₸, Доп. доходы: ${new Intl.NumberFormat('ru-RU').format(kpis.ancillaryRevenue)} ₸)
  
  МАРКЕТИНГОВЫЕ ИНДЕКСЫ КОНКУРЕНТНОЙ СРЕДЫ (COMPSET INDEXES):
  - MPI (Market Penetration Index / Индекс загрузки): ${compset.mpi.toFixed(1)}% (Цель > 100% означает, что мы опережаем рынок по загрузке)
  - ARI (Average Rate Index / Индекс цены ADR): ${compset.ari.toFixed(1)}% (Цель > 100% означает, что наш бренд стоит дороже конкурентов)
  - RGI (Revenue Generation Index / Индекс RevPAR): ${compset.rgi.toFixed(1)}% (Основной показатель рыночной силы)

  СЕГМЕНТАЦИЯ КЛИЕНТОВ (GUEST SEGMENTS):
  ${segments.map((s: any) => `- ${s.name}: Доля ${s.share}%, ADR ${new Intl.NumberFormat('ru-RU').format(s.adr)} ₸, Выручка ${new Intl.NumberFormat('ru-RU').format(s.revenue)} ₸`).join('\n')}

  ИСТОЧНИКИ ДОПОЛНИТЕЛЬНЫХ ДОХОДОВ (ANCILLARY REVENUE):
  ${ancillary.map((a: any) => `- ${a.name}: Выручка ${new Intl.NumberFormat('ru-RU').format(a.currentRevenue)} ₸ (Посетители: ${a.visitorCount}, Средний чек: ${new Intl.NumberFormat('ru-RU').format(a.averageSpend)} ₸)`).join('\n')}

  АКТИВНЫЕ ПАРАМЕТРЫ СИМУЛЯЦИИ:
  - Заполняемость Cabanas (VIP-шатров): ${params.cabanaOccupancy}%
  - Цена внешнего билета в Аквапарк: ${new Intl.NumberFormat('ru-RU').format(params.themeParkExternalPrice)} ₸
  - Количество проданных внешних билетов: ${params.themeParkTicketsCount} шт.
  - Фактор доп. продаж F&B: ${params.fbUpsellFactor}%
  - Премиум на услуги SPA: ${params.spaPremiumFactor}%
  - Оптимизация операционных расходов: ${params.costControlSaving}%

  ЗАДАЧА:
  Проанализируйте эти показатели и составьте стратегический отчет для Генерального менеджера (ГМ) отеля на чистом русском языке.
  Отчет должен содержать глубокий анализ TRevPAR и GOPPAR, оценку конкурентоспособности (по индексам MPI, ARI, RGI) и 3-4 конкретных, выполнимых плана действий с высоким приоритетом для максимизации прибыли.
  `;

  try {
    const client = getAiClient();
    
    if (client) {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: isEn 
            ? 'You are the world\'s leading hotel consultant and expert in Revenue Management (RMS) and BI analytics. You are communicating with the General Manager of the resort complex. Your tone is professional, strategic, respectful, and constructive. You use the terms ADR, RevPAR, TRevPAR, GOPPAR, MPI, ARI, RGI perfectly. Conduct all calculations in tenge (₸). Respond entirely in English, outputting structured JSON format.'
            : 'Вы — ведущий мировой гостиничный консультант и эксперт по Revenue Management (RMS) и BI аналитике. Вы общаетесь с Генеральным менеджером курортного комплекса. Ваш тон — профессиональный, стратегический, уважительный и конструктивный. Вы отлично оперируете терминами ADR, RevPAR, TRevPAR, GOPPAR, MPI, ARI, RGI. Все расчеты проводите в тенге (₸). Выдавайте структурированный ответ в JSON формате.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              advice: {
                type: Type.STRING,
                description: isEn 
                  ? 'Detailed strategic analysis of hotel performance in Markdown format. Address the General Manager respectfully ("Mr. General Manager" or "Dear General Manager"). Structure text in paragraphs with headers, highlight strengths of current simulation, risks, and opportunities. Respond entirely in English.'
                  : 'Подробный стратегический анализ показателей отеля в формате Markdown. Обращайтесь к Генеральному менеджеру уважительно ("Уважаемый Генеральный менеджер" или "Г-н Генеральный Менеджер"). Структурируйте текст по абзацам с заголовками, выделите сильные стороны текущей симуляции, риски и возможности.'
              },
              strategicActions: {
                type: Type.ARRAY,
                description: isEn 
                  ? 'List of 3-4 concrete tactical recommendations.' 
                  : 'Список из 3-4 конкретных тактических рекомендаций.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: isEn ? 'Short name of the initiative (e.g., "Dynamic VIP Cabanas Packaging")' : 'Краткое название инициативы (напр. "Динамическое пакетирование VIP Cabanas")' },
                    description: { type: Type.STRING, description: isEn ? 'Detailed description: what to do, for which segment, and why' : 'Детальное описание: что сделать, для какого сегмента и почему' },
                    priority: { type: Type.STRING, description: 'Priority: High, Medium, or Low' },
                    impactMetric: { type: Type.STRING, description: 'Main metric affected by action (e.g., GOPPAR, TRevPAR, ADR, Occupancy)' }
                  },
                  required: ['title', 'description', 'priority', 'impactMetric']
                }
              }
            },
            required: ['advice', 'strategicActions']
          }
        }
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText.trim());
      return res.json(parsedData);
    } else {
      // Robust fallback response if no API key is available
      console.log('Gemini API key is not set, generating high-quality realistic fallback advice.');
      
      const isHighGop = kpis.goppar > 85000;
      const isLowOcc = kpis.occupancy < 70;

      if (isEn) {
        const fallbackAdvice = `### Strategic Express Analysis for the General Manager

Dear Mr. General Manager,

Based on the provided simulation data, our resort complex demonstrates **TRevPAR at ${new Intl.NumberFormat('en-US').format(kpis.trevpar)} ₸** and **GOPPAR of ${new Intl.NumberFormat('en-US').format(kpis.goppar)} ₸** with an operating margin of **${kpis.gopMargin.toFixed(1)}%**.

#### 1. Competitive Positioning Analysis (Compset)
*   **Market Penetration Index (MPI): ${compset.mpi.toFixed(1)}%**. ${isLowOcc ? 'We are losing market share to key beachfront competitors. Active OTA channels and targeted promotional campaigns are required.' : 'We confidently lead in occupancy, exceeding the market average. This confirms the high demand for our All-Inclusive concept.'}
*   **Average Daily Rate (ARI): ${compset.ari.toFixed(1)}%**. Our pricing is significantly above the compset average. Our brand holds its premium position, but it is essential to monitor demand elasticity.
*   **Revenue Generation Index (RGI): ${compset.rgi.toFixed(1)}%**. Our revenue distribution efficiency index indicates ${compset.rgi > 110 ? 'a dominant position in the regional market.' : 'the need for targeted tariff optimization to maximize RevPAR.'}

#### 2. Auxiliary Revenue (Ancillary Revenue & CRM)
Ancillary sales account for **${new Intl.NumberFormat('en-US').format(kpis.ancillaryRevenue)} ₸** or **${((kpis.ancillaryRevenue / kpis.totalRevenue) * 100).toFixed(1)}%** of total resort revenues.
*   **VIP Cabanas:** Current cabana occupancy is **${params.cabanaOccupancy}%**. This is a high-margin segment that requires cross-promotion among suite and villa guests.
*   **Water Park:** External visitor traffic generates a stable **${new Intl.NumberFormat('en-US').format(params.themeParkTicketsCount * params.themeParkExternalPrice)} ₸**. It is recommended to implement dynamic ticket pricing based on weather and hotel occupancy.
*   **Spa & Wellness:** SPA appeal is strong, but average ticket can be boosted by packaging "Hammam Ritual + Dining".

#### 3. Cost Optimization
The cost control factor is set at **${params.costControlSaving}%**. At a GOP margin of **${kpis.gopMargin.toFixed(1)}%**, we maintain excellent profitability, but room remains for optimizing F&B cost without compromising premium quality.`;

        const fallbackActions = [
          {
            title: "Dynamic Packaging of VIP Cabanas & SPA",
            description: "Combine pier cabana rental with premium spa treatments and premium champagne. Target couples and wellness segments directly at check-in (Reception upselling).",
            priority: "High",
            impactMetric: "TRevPAR"
          },
          {
            title: "Optimize OTA Channels in favor of Direct Bookings",
            description: "The current OTA share is around 32%. Offer exclusive privileges (early check-in, 15% off SPA) for guests booking directly via website or mobile app to save on commissions.",
            priority: "High",
            impactMetric: "GOPPAR"
          },
          {
            title: "Dynamic Pricing for Water Park Day Passes",
            description: "Increase external ticket price to 15,000 ₸ during peak days (Fri-Sun) and lower to 9,500 ₸ on weekdays to balance guest traffic and maximize park revenue.",
            priority: "Medium",
            impactMetric: "TRevPAR"
          },
          {
            title: "Implement Smart Energy Systems in Villas",
            description: "Enhance energy efficiency controls in distant villas during vacancy periods. This reduces utility costs by 3-5% and directly boosts GOPPAR.",
            priority: "Medium",
            impactMetric: "GOPPAR"
          }
        ];

        return res.json({
          advice: fallbackAdvice,
          strategicActions: fallbackActions
        });
      } else {
        let fallbackAdvice = `### Стратегический экспресс-анализ для Генерального менеджера
 
 Уважаемый г-н Генеральный Менеджер,
 
 На основе предоставленных данных симуляции, наш курортный комплекс демонстрирует **TRevPAR на уровне ${new Intl.NumberFormat('ru-RU').format(kpis.trevpar)} ₸** и **GOPPAR в размере ${new Intl.NumberFormat('ru-RU').format(kpis.goppar)} ₸** при операционной марже **${kpis.gopMargin.toFixed(1)}%**.
 
 #### 1. Анализ рыночного позиционирования (Compset)
 *   **Индекс проникновения (MPI): ${compset.mpi.toFixed(1)}%**. ${isLowOcc ? 'Мы уступаем долю рынка ключевым пляжным конкурентам. Требуется активация каналов OTA и точечных промо-активностей.' : 'Мы уверенно лидируем по загрузке, превосходя среднерыночный показатель. Это подтверждает высокую востребованность концепции All-Inclusive.'}
 *   **Индекс тарифа (ARI): ${compset.ari.toFixed(1)}%**. Наше ценообразование значительно превышает уровень compset. Бренд держит премиальную планку, однако важно следить за эластичностью спроса.
 *   **Индекс доходности (RGI): ${compset.rgi.toFixed(1)}%**. Наш показатель эффективности распределения доходов показывает ${compset.rgi > 110 ? 'доминирующее положение на регионе.' : 'необходимость точечной оптимизации тарифов для максимизации RevPAR.'}
 
 #### 2. Дополнительные доходы (Ancillary Revenue & CRM)
 Дополнительные продажи составляют **${new Intl.NumberFormat('ru-RU').format(kpis.ancillaryRevenue)} ₸** или **${((kpis.ancillaryRevenue / kpis.totalRevenue) * 100).toFixed(1)}%** от общего дохода курорта. 
 *   **Кабаны (Cabanas):** Текущая загрузка VIP-шатров составляет **${params.cabanaOccupancy}%**. Это высокомаржинальный сегмент, требующий кросс-сегментного продвижения среди гостей люксовых номеров и вилл.
 *   **Аквапарк:** Внешний поток генерирует стабильные **${new Intl.NumberFormat('ru-RU').format(params.themeParkTicketsCount * params.themeParkExternalPrice)} ₸**. Рекомендуется внедрить динамические тарифы на внешние билеты в зависимости от погодных условий и загрузки отеля.
 *   **Spa & Wellness:** Привлекательность SPA-услуг высока, однако средний чек можно увеличить за счет пакетных предложений "Hammam Ritual + Dining".
 
 #### 3. Оптимизация затрат
 Коэффициент контроля затрат установлен на уровне **${params.costControlSaving}%**. При марже GOP в **${kpis.gopMargin.toFixed(1)}%** мы удерживаем отличный уровень рентабельности, но сохраняются возможности для оптимизации затрат на продукты питания (Food & Beverage cost) без потери премиального качества сервиса.`;

        const fallbackActions = [
          {
            title: "Динамическое пакетирование VIP Cabanas & SPA",
            description: "Объединить аренду пирсовых кабан с премиальными спа-процедурами и бутылкой элитного шампанского. Нацелить предложение на сегмент 'Пары / СПА' непосредственно при заселении (Upselling на ресепшн).",
            priority: "High",
            impactMetric: "TRevPAR"
          },
          {
            title: "Оптимизация каналов OTA в пользу Direct Booking",
            description: "Текущая доля OTA составляет около 32%. Предложить эксклюзивные привилегии (ранний заезд, скидка 15% на SPA) для гостей, бронирующих напрямую через сайт или мобильное приложение, для экономии на комиссиях.",
            priority: "High",
            impactMetric: "GOPPAR"
          },
          {
            title: "Динамическое ценообразование билетов в Аквапарк",
            description: "Повысить стоимость внешних билетов до 15 000 ₸ в периоды пиковой загрузки (пятница-воскресенье) и снизить до 9 500 ₸ в будни для регулирования трафика и максимизации выручки аквапарка.",
            priority: "Medium",
            impactMetric: "TRevPAR"
          },
          {
            title: "Внедрение смарт-систем энергосбережения на виллах",
            description: "Усилить контроль энергоэффективности на отдаленных виллах в периоды отсутствия гостей. Это снизит постоянные затраты на 3-5% и напрямую увеличит маржу GOP.",
            priority: "Medium",
            impactMetric: "GOPPAR"
          }
        ];

        return res.json({
          advice: fallbackAdvice,
          strategicActions: fallbackActions
        });
      }
    }
  } catch (error: any) {
    console.error('Error generating AI advice:', error);
    res.status(500).json({ error: error.message || 'Ошибка генерации рекомендаций AI.' });
  }
});

// REST Endpoint: Interactive Chat with AI Advisor for the General Manager
app.post('/api/ai/chat', async (req, res) => {
  const { messages, kpis, compset, segments, channels, ancillary, params, language } = req.body;
  const isEn = language === 'en';
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: isEn ? 'The field messages is required and must be an array.' : 'Поле messages обязательно и должно быть массивом.' });
  }

  const hotelContext = isEn ? `
You are an elite artificial intelligence advisor (Chief Revenue Officer & AI Advisor) for the General Manager of the luxury resort complex (5 stars, total inventory 515 keys: 500 standard rooms and 15 ultra-luxury villas).
The General Manager is chatting with you in real time.

CURRENT OPERATING METRICS (KPIs):
- Occupancy: ${kpis.occupancy.toFixed(1)}%
- Average Daily Rate (ADR): ${new Intl.NumberFormat('en-US').format(kpis.adr)} ₸
- RevPAR (Revenue Per Available Room): ${new Intl.NumberFormat('en-US').format(kpis.revpar)} ₸
- TRevPAR (Total Revenue Per Available Room): ${new Intl.NumberFormat('en-US').format(kpis.trevpar)} ₸
- GOPPAR (Gross Operating Profit Per Available Room): ${new Intl.NumberFormat('en-US').format(kpis.goppar)} ₸
- GOP Margin: ${kpis.gopMargin.toFixed(1)}%
- Total Revenue: ${new Intl.NumberFormat('en-US').format(kpis.totalRevenue)} ₸ (Rooms: ${new Intl.NumberFormat('en-US').format(kpis.roomsRevenue)} ₸, Ancillary: ${new Intl.NumberFormat('en-US').format(kpis.ancillaryRevenue)} ₸)

COMPSET MARKET INDICES:
- MPI: ${compset.mpi.toFixed(1)}%
- ARI: ${compset.ari.toFixed(1)}%
- RGI: ${compset.rgi.toFixed(1)}%

GUEST SEGMENTS:
${segments.map((s: any) => `- ${s.name}: Share ${s.share}%, ADR ${new Intl.NumberFormat('en-US').format(s.adr)} ₸, Revenue ${new Intl.NumberFormat('en-US').format(s.revenue)} ₸`).join('\n')}

ANCILLARY REVENUE SOURCES:
${ancillary.map((a: any) => `- ${a.name}: Revenue ${new Intl.NumberFormat('en-US').format(a.currentRevenue)} ₸ (Visitors: ${a.visitorCount}, Average spend: ${new Intl.NumberFormat('en-US').format(a.averageSpend)} ₸)`).join('\n')}

ACTIVE SIMULATION PARAMETERS:
- Cabana Occupancy: ${params.cabanaOccupancy}%
- Water Park External Ticket Price: ${new Intl.NumberFormat('en-US').format(params.themeParkExternalPrice)} ₸
- External Tickets Sold: ${params.themeParkTicketsCount} pcs.
- F&B Upsell Factor: ${params.fbUpsellFactor}%
- SPA Premium Factor: ${params.spaPremiumFactor}%
- Operating Cost Savings: ${params.costControlSaving}%

Answer the General Manager's questions professionally, respectfully, concisely, and constructively. Conduct all calculations in tenge (₸). Suggest concrete tactical recommendations based on current simulation numbers. Use exquisite and clear business English.
` : `
Вы — высококлассный искусственный интеллект-советник (Chief Revenue Officer & AI Advisor) для генерального менеджера премиального курортного отеля (5 звезд, общий фонд 515 ключей: 500 стандартных номеров и 15 ультра-роскошных вилл).
Генеральный менеджер ведет с вами чат в реальном времени.

ТЕКУЩИЕ ОПЕРАЦИОННЫЕ ПОКАЗАТЕЛИ (KPI):
- Загрузка (Occupancy): ${kpis.occupancy.toFixed(1)}%
- Средняя стоимость номера (ADR): ${new Intl.NumberFormat('ru-RU').format(kpis.adr)} ₸
- RevPAR (Доход на доступный номер): ${new Intl.NumberFormat('ru-RU').format(kpis.revpar)} ₸
- TRevPAR (Общий доход на номер): ${new Intl.NumberFormat('ru-RU').format(kpis.trevpar)} ₸
- GOPPAR (Операционная прибыль на номер): ${new Intl.NumberFormat('ru-RU').format(kpis.goppar)} ₸
- Маржа GOP (Gross Operating Profit Margin): ${kpis.gopMargin.toFixed(1)}%
- Общая выручка (Total Revenue): ${new Intl.NumberFormat('ru-RU').format(kpis.totalRevenue)} ₸ (Номера: ${new Intl.NumberFormat('ru-RU').format(kpis.roomsRevenue)} ₸, Доп. доходы: ${new Intl.NumberFormat('ru-RU').format(kpis.ancillaryRevenue)} ₸)

МАРКЕТИНГОВЫЕ ИНДЕКСЫ КОНКУРЕНТНОЙ СРЕДЫ (COMPSET INDEXES):
- MPI (Индекс загрузки): ${compset.mpi.toFixed(1)}%
- ARI (Индекс цены ADR): ${compset.ari.toFixed(1)}%
- RGI (Индекс RevPAR): ${compset.rgi.toFixed(1)}%

СЕГМЕНТАЦИЯ КЛИЕНТОВ (GUEST SEGMENTS):
${segments.map((s: any) => `- ${s.name}: Доля ${s.share}%, ADR ${new Intl.NumberFormat('ru-RU').format(s.adr)} ₸, Выручка ${new Intl.NumberFormat('ru-RU').format(s.revenue)} ₸`).join('\n')}

ИСТОЧНИКИ ДОПОЛНИТЕЛЬНЫХ ДОХОДОВ (ANCILLARY REVENUE):
${ancillary.map((a: any) => `- ${a.name}: Выручка ${new Intl.NumberFormat('ru-RU').format(a.currentRevenue)} ₸ (Посетители: ${a.visitorCount}, Средний чек: ${new Intl.NumberFormat('ru-RU').format(a.averageSpend)} ₸)`).join('\n')}

АКТИВНЫЕ ПАРАМЕТРЫ СИМУЛЯЦИИ:
- Заполняемость Cabanas: ${params.cabanaOccupancy}%
- Цена внешнего билета в Аквапарк: ${new Intl.NumberFormat('ru-RU').format(params.themeParkExternalPrice)} ₸
- Количество проданных внешних билетов: ${params.themeParkTicketsCount} шт.
- Фактор доп. продаж F&B: ${params.fbUpsellFactor}%
- Премиум на услуги SPA: ${params.spaPremiumFactor}%
- Оптимизация операционных расходов: ${params.costControlSaving}%

Отвечайте на вопросы Генерального менеджера профессионально, уважительно, кратко и конструктивно. Все расчеты проводите в тенге (₸). Предлагайте конкретные тактические рекомендации на основе текущих цифр симуляции. Используйте изысканный, но понятный деловой русский язык.
`;

  try {
    const client = getAiClient();
    if (client) {
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: hotelContext,
          temperature: 0.7,
        }
      });

      return res.json({ response: response.text || (isEn ? 'Sorry, I was unable to generate a response.' : 'Извините, я не смог сформулировать ответ.') });
    } else {
      console.log('Gemini API key is not set, generating fallback chat response.');
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      
      let reply = '';
      if (isEn) {
        reply = `Hello, Mr. General Manager!

I am currently running in demonstration mode as the Gemini API key has not been configured in your Settings yet. However, analyzing your current metrics:
*   **Occupancy**: ${kpis.occupancy.toFixed(1)}%
*   **ADR**: ${new Intl.NumberFormat('en-US').format(kpis.adr)} ₸
*   **GOPPAR**: ${new Intl.NumberFormat('en-US').format(kpis.goppar)} ₸

Your request: *"${lastUserMsg}"*

I suggest focusing on optimizing high-margin VIP cabanas and adjusting SPA tariff structures to uplift TRevPAR without putting stress on the rooms inventory. Once your Gemini API key is configured in Settings > Secrets, I will be able to provide you with incredibly detailed, tailored recommendations for any specific operational question!`;
      } else {
        reply = `Здравствуйте, господин Генеральный Менеджер! 
      
Я работаю в демонстрационном режиме, так как ключ API Gemini не задан в настройках. Тем не менее, анализируя ваши текущие показатели:
*   **Загрузка**: ${kpis.occupancy.toFixed(1)}%
*   **ADR**: ${new Intl.NumberFormat('ru-RU').format(kpis.adr)} ₸
*   **GOPPAR**: ${new Intl.NumberFormat('ru-RU').format(kpis.goppar)} ₸

Ваш запрос: *"${lastUserMsg}"*

Рекомендую обратить внимание на оптимизацию высокомаржинальных кабан и регулирование тарифа SPA, что позволит поднять TRevPAR без увеличения нагрузки на номерной фонд. Как только ключ Gemini API будет подключен в Settings > Secrets, я смогу дать вам детальный развернутый ответ на любой специализированный вопрос!`;
      }

      return res.json({ response: reply });
    }
  } catch (error: any) {
    console.error('Error in chat route:', error);
    res.status(500).json({ error: error.message || (isEn ? 'Error generating AI chat response.' : 'Ошибка генерации ответа в чате.') });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // In development, let Vite handle assets
  const startVite = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  };
  startVite();
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
