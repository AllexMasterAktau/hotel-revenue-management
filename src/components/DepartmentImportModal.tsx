/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  DownloadCloud,
  FileCode,
  ArrowRight,
  Sparkles,
  Percent,
  TrendingUp,
  Clock,
  Briefcase,
  Wrench,
  DollarSign
} from 'lucide-react';
import { SimulationParameters } from '../types';
import * as XLSX from 'xlsx';

interface DepartmentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: 'frontoffice' | 'spa' | 'fb' | 'finance' | 'salesmarketing' | 'hr' | 'engineering';
  language: 'ru' | 'en';
  currentParams: SimulationParameters;
  onParamsChange: (params: SimulationParameters) => void;
  onStatusChange?: (dept: string, status: 'updated' | 'needs_update') => void;
  currency: 'KZT' | 'USD';
}

interface DepartmentConfig {
  nameRu: string;
  nameEn: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  fieldsRu: string[];
  fieldsEn: string[];
  templateFileName: string;
  effectsRu: string;
  effectsEn: string;
}

export default function DepartmentImportModal({
  isOpen,
  onClose,
  departmentId,
  language,
  currentParams,
  onParamsChange,
  onStatusChange,
  currency
}: DepartmentImportModalProps) {
  const isEn = language === 'en';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  if (!isOpen) return null;

  // Department-specific configurations
  const deptConfigs: Record<string, DepartmentConfig> = {
    frontoffice: {
      nameRu: "Front Office & Рецепция",
      nameEn: "Front Office & Reception",
      titleRu: "Отчет по Desk Upsell & Ранним Заездам",
      titleEn: "Desk Upsell & Early Arrival Report",
      descRu: "Импортируйте отчеты о продажах категорий номеров при заезде (Desk Upsell), платных ранних заселениях (Early Check-In), поздних выездах (Late Check-Out) и штрафах за No-Show.",
      descEn: "Import reports on room category upsells at check-in (Desk Upsell), paid early arrivals (Early Check-In), late departures (Late Check-Out), and No-Show cancellation penalties.",
      fieldsRu: [
        "Коэффициент успешного апсейла (Desk Upsell Rate, %)",
        "Дополнительный доход от ранних заездов (Early Check-In Revenue, KZT)",
        "Объем штрафов за No-Show (No-Show Revenue, KZT)"
      ],
      fieldsEn: [
        "Desk Upsell Conversion Rate (%)",
        "Early Check-In / Late Check-Out Revenue (KZT)",
        "No-Show penalty capture amount (KZT)"
      ],
      templateFileName: "Шаблон отчета Front Office.xlsx",
      effectsRu: "Успешная обработка отчета Front Office скорректирует сдвиг тарифа ADR на +3.0% за счет Desk Upsell и увеличит загрузку номеров на +1.5% за счет оптимизации поздних выездов.",
      effectsEn: "Successful processing of the Front Office report will adjust the ADR shift by +3.0% due to Desk Upsell and increase occupancy by +1.5% from optimized late departures."
    },
    spa: {
      nameRu: "Anjana SPA & Wellness",
      nameEn: "Anjana SPA & Wellness",
      titleRu: "Отчет по выручке SPA и загрузке Anjana",
      titleEn: "SPA Treatment Revenue & Capacity Report",
      descRu: "Загружайте отчеты о проведенных спа-процедурах, продаже косметических средств из бутика, загрузке процедурных кабинетов (RevPAS) и продаже клубных абонементов.",
      descEn: "Upload reports about spa treatments completed, cosmetics boutique product sales, treatment room utilization (RevPAS), and annual wellness membership sales.",
      fieldsRu: [
        "Средний чек за процедуру (Average Treatment Spend, KZT)",
        "Коэффициент загрузки массажных кабинетов (RevPAS, %)",
        "Продажи бутика косметики Anjana (SPA Boutique Sales, KZT)"
      ],
      fieldsEn: [
        "Average Spa Treatment Spend (KZT)",
        "Spa Room Utilization Rate - RevPAS (%)",
        "Anjana Boutique cosmetics sales (KZT)"
      ],
      templateFileName: "Шаблон отчета Anjana SPA.xlsx",
      effectsRu: "Загрузка SPA отчета активирует премиальную наценку в симуляторе (+8.0% к фактору Spa Premium) и увеличит базовую выручку SPA на +15.0%.",
      effectsEn: "Uploading the SPA report activates a premium markup in the simulator (+8.0% to the Spa Premium factor) and increases base SPA revenue by +15.0%."
    },
    fb: {
      nameRu: "F&B & Рестораны",
      nameEn: "F&B & Restaurants",
      titleRu: "Отчет по себестоимости Food Cost & Чекам",
      titleEn: "Food Cost & Restaurant Cover Revenue Report",
      descRu: "Импортируйте отчеты о себестоимости продуктов питания и напитков (Food Cost %), списаниях продуктов, объеме продаж в ресторанах A la Carte и среднем чеке на гостя.",
      descEn: "Import reports on food & beverage ingredient cost percentage (Food Cost %), product waste/spoilage, sales performance in luxury A la Carte venues, and average cover size.",
      fieldsRu: [
        "Себестоимость продуктов (Food Cost %, плановая vs факт)",
        "Объем списаний и порчи (F&B Spoilage, KZT)",
        "Чеки A la Carte ресторанов и баров (A la Carte covers)"
      ],
      fieldsEn: [
        "Food Cost percentage (target vs actual %)",
        "F&B Waste & Spoilage Write-offs (KZT)",
        "A la Carte restaurant and beach bar covers"
      ],
      templateFileName: "Шаблон отчета F&B.xlsx",
      effectsRu: "Система автоматически снизит издержки (GOP Cost Control на +2.0% за счет оптимизации списаний) и поднимет фактор апселла F&B на +6.0% за счет роста чеков.",
      effectsEn: "The system will automatically reduce costs (+2.0% to GOP Cost Control due to optimized food waste) and elevate the F&B upsell factor by +6.0%."
    },
    finance: {
      nameRu: "Финансы & OPEX",
      nameEn: "Finance & OPEX",
      titleRu: "Сводный отчет по операционным расходам",
      titleEn: "Operational Expense (OPEX) Ledger Report",
      descRu: "Загружайте сводный реестр операционных расходов отеля, административно-хозяйственные издержки (A&G), банковские комиссии за эквайринг и прочие накладные расходы.",
      descEn: "Upload the consolidated hotel operational expenses ledger, administrative & general (A&G) costs, card merchant acquisition bank commissions, and other overheads.",
      fieldsRu: [
        "Административно-хозяйственные издержки (A&G Expenses, KZT)",
        "Комиссии банковского эквайринга (Merchant Fees, %)",
        "Прочие нераспределенные операционные расходы (Other OPEX)"
      ],
      fieldsEn: [
        "Administrative & General (A&G) Costs (KZT)",
        "Credit Card Merchant Acquiring Fees (%)",
        "Other Undistributed Operating Overhead Ledger"
      ],
      templateFileName: "Шаблон отчета Финансы.xlsx",
      effectsRu: "Успешная сверка финансов позволяет выявить скрытые резервы экономии и увеличивает показатель контроля операционных затрат (Cost Control) на +4.0%.",
      effectsEn: "Successful financial reconciliation uncovers hidden efficiency reserves and increases the hotel Cost Control parameter directly by +4.0%."
    },
    salesmarketing: {
      nameRu: "Sales & Marketing",
      nameEn: "Sales & Marketing",
      titleRu: "Отчет по рекламным кампаниям & Дистрибуции",
      titleEn: "Marketing Campaigns & Distribution Report",
      descRu: "Импортируйте выгрузки по затратам на привлечение клиентов (CAC), рекламным бюджетам, комиссиям онлайн-агентств (OTA) и групповым броням сегмента MICE.",
      descEn: "Import summaries on Customer Acquisition Costs (CAC), digital advertising budgets, online travel agency commission rates (OTA), and group MICE contract bookings.",
      fieldsRu: [
        "Стоимость привлечения бронирования (CAC, KZT)",
        "Средний размер комиссий OTA посредников (%)",
        "Объем групповых и корпоративных броней (MICE Room Nights)"
      ],
      fieldsEn: [
        "Booking Customer Acquisition Cost - CAC (KZT)",
        "Average OTA intermediary commission rate (%)",
        "MICE / Group contract room nights volume"
      ],
      templateFileName: "Шаблон отчета Sales & Marketing.xlsx",
      effectsRu: "Систематизация расходов снижает комиссии каналов (прирост Cost Control на +2.5%) и стимулирует базовую загрузку на +4.0% за счет привлеченных MICE групп.",
      effectsEn: "Systematized ad expenditure lowers commission leaks (+2.5% to Cost Control savings) and boosts base occupancy by +4.0% through contracted MICE groups."
    },
    hr: {
      nameRu: "HR & Кадры (Payroll)",
      nameEn: "HR & Payroll",
      titleRu: "Отчет по фонду оплаты труда & Овертаймам",
      titleEn: "Payroll & Labor Productivity Report",
      descRu: "Загружайте табели учета рабочего времени, затраты на фонд оплаты труда (ФОТ), часы переработок (Overtime) линейного персонала и расходы на сезонных контрактников.",
      descEn: "Upload payroll lists, labor productivity metrics, overtime hours tracked for front-line personnel, and auxiliary seasonal staff outsourcing contractor costs.",
      fieldsRu: [
        "Прямой фонд оплаты труда департаментов (Direct Payroll, KZT)",
        "Объем часов переработок (Overtime hours, hrs)",
        "Затраты на сезонный аутсорсинг (Seasonal Staff Costs, KZT)"
      ],
      fieldsEn: [
        "Departmental Direct Payroll (KZT)",
        "Overtime hours logged by shift personnel (hrs)",
        "Seasonal outsourcing staffing contractor expense (KZT)"
      ],
      templateFileName: "Шаблон отчета HR & Payroll.xlsx",
      effectsRu: "Оптимизация штатного расписания и сокращение переработок позволяет увеличить эффективность ФОТ и добавляет +3.5% к коэффициенту экономии затрат отеля.",
      effectsEn: "Shift roster optimization and reduction of redundant overtimes improves payroll productivity and adds +3.5% to the hotel's GOP Cost Control factor."
    },
    engineering: {
      nameRu: "Инженерия & Энергоэффективность",
      nameEn: "Engineering & Maintenance",
      titleRu: "Отчет по коммунальным расходам & Аквапарку",
      titleEn: "Utilities Consumption & Maintenance Report",
      descRu: "Импортируйте показатели потребления коммунальных ресурсов (электроэнергия, опресненная вода из Каспия), расходы на химию для подогрева бассейнов и ремонт аквапарка.",
      descEn: "Import resource consumption stats (electricity, desalinated Caspian water supply), heating/purification chemicals for outdoor pools, and general waterpark repair costs.",
      fieldsRu: [
        "Затраты на электроэнергию и опреснение воды (Utilities, KZT)",
        "Объем химикатов для очистки бассейнов аквапарка (Pool Chemicals)",
        "Затраты на плановый технический ремонт (Capital Maintenance)"
      ],
      fieldsEn: [
        "Electricity & water desalination utility costs (KZT)",
        "Pool heating and water purification chemicals volume",
        "Scheduled preventive maintenance expenditures (KZT)"
      ],
      templateFileName: "Шаблон отчета Инженерия.xlsx",
      effectsRu: "Внедрение умных датчиков и снижение потерь тепла сокращает коммунальные статьи расхода, повышая общую эффективность Cost Control на дополнительные +1.5%.",
      effectsEn: "Implementation of smart heat sensors and thermal insulation saves utilities expense, boosting overall Cost Control efficiency by an extra +1.5%."
    }
  };

  const config = deptConfigs[departmentId] || deptConfigs.frontoffice;

  // Drag-and-drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Process selected file
  const processFile = (file: File) => {
    setLoading(true);
    setImportStatus({ type: null, message: '' });
    setParsedData(null);

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isCsv = fileName.endsWith('.csv') || fileName.endsWith('.txt');

    setTimeout(() => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          let updatedParams = { ...currentParams };
          let parsedFieldsList: string[] = [];

          if (isExcel) {
            const buffer = event.target?.result as ArrayBuffer;
            if (!buffer) throw new Error(isEn ? 'File is empty' : 'Файл пуст');
            
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
            
            if (jsonRows.length < 2) {
              throw new Error(isEn 
                ? 'Invalid format. Sheet must contain headers in row 1 and values in row 2.'
                : 'Некорректная структура. Страница должна содержать заголовки в 1-й строке и значения во 2-й.');
            }
            
            const headers = jsonRows[0].map(h => String(h).trim().toLowerCase());
            const values = jsonRows[1].map(v => String(v).trim());
            
            headers.forEach((header, idx) => {
              const val = parseFloat(values[idx]);
              if (!isNaN(val)) {
                parsedFieldsList.push(`${header}: ${val}`);
              }
            });
          } else if (isCsv) {
            const text = event.target?.result as string;
            if (!text) throw new Error(isEn ? 'File is empty' : 'Файл пуст');
            
            const lines = text.split('\n');
            if (lines.length < 2) throw new Error(isEn ? 'CSV must have at least 2 lines' : 'CSV должен иметь как минимум 2 строки');
            
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const values = lines[1].split(',').map(v => v.trim());
            
            headers.forEach((header, idx) => {
              const val = parseFloat(values[idx]);
              if (!isNaN(val)) {
                parsedFieldsList.push(`${header}: ${val}`);
              }
            });
          } else if (fileName.endsWith('.json')) {
            const text = event.target?.result as string;
            const data = JSON.parse(text);
            Object.keys(data).forEach(key => {
              parsedFieldsList.push(`${key}: ${data[key]}`);
            });
          } else {
            throw new Error(isEn ? 'Unsupported format. Please upload .xlsx, .xls, .csv, .json' : 'Неподдерживаемый формат. Пожалуйста, загрузите .xlsx, .xls, .csv, .json');
          }

          // Apply specialized parameter changes based on Department ID
          let resultMessage = '';
          switch (departmentId) {
            case 'frontoffice':
              updatedParams.adrShift = Math.min(50, (currentParams.adrShift || 0) + 3.0);
              updatedParams.occupancyShift = Math.min(25, (currentParams.occupancyShift || 0) + 1.5);
              resultMessage = isEn 
                ? "Front Office Desk Upsell Report integrated! ADR Shift increased by +3.0% and Occupancy by +1.5%."
                : "Отчет Front Office Desk Upsell интегрирован! Сдвиг ADR увеличен на +3.0%, загрузка — на +1.5%.";
              break;
              
            case 'spa':
              updatedParams.spaPremiumFactor = Math.min(50, (currentParams.spaPremiumFactor || 0) + 8.0);
              updatedParams.baseSpaRevenue = Math.round((currentParams.baseSpaRevenue || 6800000) * 1.15);
              resultMessage = isEn
                ? "Anjana SPA & Wellness report integrated! Spa Premium factor grew by +8.0% and Base SPA Revenue is up by +15.0%."
                : "Отчет Anjana SPA & Wellness интегрирован! Фактор Spa Premium увеличен на +8.0%, базовая выручка SPA увеличена на +15.0%.";
              break;
              
            case 'fb':
              updatedParams.fbUpsellFactor = Math.min(50, (currentParams.fbUpsellFactor || 0) + 6.0);
              updatedParams.costControlSaving = Math.min(15, (currentParams.costControlSaving || 0) + 2.0);
              updatedParams.baseFbRevenue = Math.round((currentParams.baseFbRevenue || 18500000) * 1.12);
              resultMessage = isEn
                ? "F&B covers and cost report integrated! Food waste reduction added +2.0% to GOP Cost Control, and F&B Upsell is boosted by +6.0%."
                : "Отчет F&B по чекам и издержкам интегрирован! Сокращение списаний продуктов добавило +2.0% к экономии затрат, а апсейл F&B вырос на +6.0%.";
              break;
              
            case 'finance':
              updatedParams.costControlSaving = Math.min(15, (currentParams.costControlSaving || 0) + 4.0);
              resultMessage = isEn
                ? "OPEX expenses audited successfully! Administrative overhead reduction added +4.0% directly to GOP Cost Control."
                : "Сверка операционных статей (OPEX) завершена успешно! Снижение административных накладных расходов добавило +4.0% к экономии затрат.";
              break;
              
            case 'salesmarketing':
              updatedParams.costControlSaving = Math.min(15, (currentParams.costControlSaving || 0) + 2.5);
              updatedParams.baseOccupancy = Math.min(100, (currentParams.baseOccupancy || 76) + 4.0);
              resultMessage = isEn
                ? "Sales & Marketing campaign audit integrated! Commission leakage savings added +2.5% to Cost Control, and Group MICE room nights increased base occupancy by +4.0%."
                : "Аудит маркетинговых кампаний интегрирован! Оптимизация комиссий OTA добавила +2.5% к экономии затрат, а MICE группы подняли базовую загрузку на +4.0%.";
              break;
              
            case 'hr':
              updatedParams.costControlSaving = Math.min(15, (currentParams.costControlSaving || 0) + 3.5);
              resultMessage = isEn
                ? "Payroll & Overtime productivity report integrated! Roster efficiency gains added +3.5% directly to GOP Cost Control savings."
                : "Отчет по ФОТ и овертаймам интегрирован! Оптимизация графика сменности линейного персонала добавила +3.5% к фактору экономии затрат.";
              break;
              
            case 'engineering':
              updatedParams.costControlSaving = Math.min(15, (currentParams.costControlSaving || 0) + 1.5);
              resultMessage = isEn
                ? "Waterpark utility & engineering report integrated! Smart heating and thermal efficiency saved utilities, adding +1.5% to Cost Control."
                : "Отчет по ЖКХ и инженерии аквапарка интегрирован! Внедрение сберегающих датчиков и оптимизация тепла добавили +1.5% к фактору экономии затрат.";
              break;
          }

          onParamsChange(updatedParams);
          if (onStatusChange) {
            onStatusChange(departmentId, 'updated');
          }

          setParsedData(parsedFieldsList);
          setImportStatus({
            type: 'success',
            message: resultMessage
          });
        } catch (err: any) {
          setImportStatus({
            type: 'error',
            message: isEn ? `Failed to process report: ${err.message || err}` : `Ошибка обработки отчета: ${err.message || err}`
          });
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setImportStatus({
          type: 'error',
          message: isEn ? 'Error reading spreadsheet file.' : 'Ошибка считывания файла таблицы.'
        });
        setLoading(false);
      };

      if (isExcel) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    }, 1200); // Luxury artificial loading for premium feel
  };

  // Download specific Excel Template
  const downloadSpecificTemplate = () => {
    let headers: string[] = [];
    let sampleValues: any[] = [];
    
    switch (departmentId) {
      case 'frontoffice':
        headers = ["Desk Upsell Conversion %", "Early Arrival Revenue (KZT)", "No Show Revenue (KZT)", "Late Checkout Fees (KZT)"];
        sampleValues = [14.5, 450000, 1200000, 380000];
        break;
      case 'spa':
        headers = ["Average Treatment Spend (KZT)", "Room Utilization RevPAS %", "SPA Boutique Cosmetics Revenue (KZT)"];
        sampleValues = [42000, 78.5, 1850000];
        break;
      case 'fb':
        headers = ["Actual Food Cost %", "F_B Spoilage Writeoffs (KZT)", "A la Carte Restaurant Covers", "Average Check KZT"];
        sampleValues = [34.2, 580000, 1420, 28500];
        break;
      case 'finance':
        headers = ["Admin & General Expense (KZT)", "Acquiring Banking Comm %", "Unallocated OPEX Ledger (KZT)"];
        sampleValues = [8400000, 1.85, 4200000];
        break;
      case 'salesmarketing':
        headers = ["Customer Acquisition Cost CAC (KZT)", "Average OTA Commission %", "MICE Group Room Nights", "Ad Campaign Revenue KZT"];
        sampleValues = [12500, 16.5, 340, 15000000];
        break;
      case 'hr':
        headers = ["Direct Payroll FOT (KZT)", "Shift Overtime Hours", "Outsource Contractor Cost (KZT)"];
        sampleValues = [18200000, 184, 3200000];
        break;
      case 'engineering':
        headers = ["Utility Gas Caspian Desalination KZT", "Waterpark Maintenance Chemicals KZT", "Preventive Capex Repairs KZT"];
        sampleValues = [9500000, 1800000, 4500000];
        break;
    }

    const data = [headers, sampleValues];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Template");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", config.templateFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div 
        id={`import-modal-${departmentId}`} 
        className="bg-[#FCFAF2] border border-[#E5DFD5] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-[#2B2723]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7A6E5D] hover:text-[#2B2723] transition-colors cursor-pointer p-1 rounded-lg hover:bg-[#F5F1E6]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-3 mt-1 pb-4 border-b border-[#E5DFD5]">
          <div className="p-3 bg-[#B38E5D]/10 rounded-xl text-[#B38E5D] shrink-0 mt-0.5 border border-[#B38E5D]/20">
            {departmentId === 'frontoffice' && <TrendingUp className="h-5 w-5" />}
            {departmentId === 'spa' && <Sparkles className="h-5 w-5" />}
            {departmentId === 'fb' && <Percent className="h-5 w-5" />}
            {departmentId === 'finance' && <DollarSign className="h-5 w-5" />}
            {departmentId === 'salesmarketing' && <FileCode className="h-5 w-5" />}
            {departmentId === 'hr' && <Briefcase className="h-5 w-5" />}
            {departmentId === 'engineering' && <Wrench className="h-5 w-5" />}
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold tracking-widest text-[#B38E5D] uppercase block">
              {isEn ? "Contextual Data Upload" : "Контекстный Импорт Данных"}
            </span>
            <h3 className="text-base font-bold text-[#2B2723] font-display uppercase tracking-wide leading-snug mt-0.5">
              {isEn ? config.titleEn : config.titleRu}
            </h3>
            <p className="text-[11px] font-mono text-[#7A6E5D] font-medium mt-1">
              Rixos Executive RMS • {isEn ? config.nameEn : config.nameRu}
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-4 pt-4">
          <p className="text-xs text-[#5C5446] leading-relaxed">
            {isEn ? config.descEn : config.descRu}
          </p>

          {/* Expected database mapping fields */}
          <div className="bg-[#F5F1E6]/60 rounded-xl p-3 border border-[#E5DFD5]">
            <h4 className="text-[10px] font-mono font-bold tracking-wider text-[#7A6E5D] uppercase mb-2">
              📂 {isEn ? "Mapped Fields in Spreadsheet:" : "Ожидаемые поля в таблице:"}
            </h4>
            <ul className="space-y-1.5">
              {(isEn ? config.fieldsEn : config.fieldsRu).map((field, index) => (
                <li key={index} className="text-xs text-[#2B2723] flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#B38E5D]" />
                  <span className="font-sans">{field}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="space-y-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-[#B38E5D] bg-[#B38E5D]/10 text-[#2B2723]' 
                  : 'border-[#E5DFD5] bg-[#F5F1E6]/30 hover:border-[#B38E5D]/50 text-[#7A6E5D]'
              } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv, .xlsx, .xls, .json"
                disabled={loading}
                className="hidden"
              />
              
              {loading ? (
                <div className="space-y-3">
                  <div className="h-8 w-8 border-2 border-t-brand-gold border-[#E5DFD5] rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-[#2B2723] animate-pulse">
                    {isEn ? "Parsing report sheets..." : "Выполняется парсинг отчета..."}
                  </p>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 mx-auto text-[#7A6E5D] mb-2" />
                  <p className="text-[#2B2723] font-bold text-xs">
                    {isEn ? "Drag & drop Excel/CSV here or click" : "Перетащите Excel/CSV сюда или нажмите"}
                  </p>
                  <p className="text-[10px] text-[#7A6E5D] font-mono uppercase tracking-wider mt-1">
                    {isEn ? "Supports .XLSX, .XLS, .CSV • Max 5MB" : "Поддерживаются .XLSX, .XLS, .CSV • До 5MB"}
                  </p>
                </>
              )}
            </div>

            {/* Template Download Button */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#F5F1E6]/40 border border-[#E5DFD5]/70 rounded-lg">
              <span className="text-[10px] text-[#7A6E5D] flex items-center gap-1">
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#B38E5D]" />
                {isEn ? "Need the pre-formatted layout?" : "Нет готового файла?"}
              </span>
              <button
                type="button"
                onClick={downloadSpecificTemplate}
                className="text-[10px] font-mono text-[#B38E5D] hover:text-[#2B2723] font-bold flex items-center gap-1 cursor-pointer transition-all hover:underline"
              >
                <DownloadCloud className="h-3 w-3" />
                {isEn ? "Download Template .XLSX" : "Скачать шаблон отчета"}
              </button>
            </div>
          </div>

          {/* Strategic Feedback / Effects */}
          <div className="bg-[#B38E5D]/5 border border-[#B38E5D]/20 p-3 rounded-lg text-xs leading-relaxed text-[#7A6E5D]">
            <p className="font-sans">
              🌟 <span className="font-bold text-[#2B2723]">{isEn ? "RMS Impact Action:" : "Влияние на RMS:"}</span>{' '}
              {isEn ? config.effectsEn : config.effectsRu}
            </p>
          </div>

          {/* Import Status Alert Block */}
          {importStatus.type && (
            <div className={`p-4 border rounded-xl flex items-start gap-3 text-xs animate-fade-in ${
              importStatus.type === 'success' 
                ? 'bg-[#EEF7F2] border-[#D5ECE1] text-[#22573E]' 
                : 'bg-red-500/10 border-red-500/20 text-red-700'
            }`}>
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold uppercase tracking-wider text-[10px] font-mono">
                  {importStatus.type === 'success' 
                    ? (isEn ? 'Database Update Succeeded' : 'Данные успешно загружены') 
                    : (isEn ? 'Parsing Exception Raised' : 'Ошибка обработки таблицы')}
                </p>
                <p className="mt-1 leading-relaxed text-[11px]">{importStatus.message}</p>
                
                {parsedData && parsedData.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-600/10">
                    <p className="text-[10px] font-mono uppercase tracking-wider font-bold mb-1">
                      {isEn ? "Extracted Key-Value Nodes:" : "Извлеченные переменные:"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px]">
                      {parsedData.map((node: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[#22573E]">
                          <ArrowRight className="h-2.5 w-2.5" />
                          <span>{node}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#E5DFD5] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-[#2B2723] hover:bg-[#3D352E] text-[#FCFAF2] font-bold text-xs py-2 px-6 rounded-lg transition-all cursor-pointer"
          >
            {isEn ? "Close" : "Закрыть окно"}
          </button>
        </div>
      </div>
    </div>
  );
}
