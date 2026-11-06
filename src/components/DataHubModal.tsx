/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { 
  X, 
  UploadCloud, 
  DownloadCloud, 
  RefreshCw, 
  Database, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Server,
  Cpu,
  TrendingUp,
  FileCode,
  Zap,
  Sparkles,
  Percent,
  TrendingDown,
  Wrench,
  Briefcase,
  Key,
  ArrowRight
} from 'lucide-react';
import { SimulationParameters } from '../types';
import { formatKZT } from '../data';
import { useLanguage } from '../LanguageContext';
import * as XLSX from 'xlsx';

interface DataHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParams: SimulationParameters;
  onParamsChange: (params: SimulationParameters) => void;
  currentKpis: any;
  baselineKpis: any;
  currency: 'KZT' | 'USD';
  onStatusChange?: (dept: string, status: 'updated' | 'needs_update') => void;
}

interface DeptInfo {
  id: string;
  nameRu: string;
  nameEn: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  fieldsRu: string[];
  fieldsEn: string[];
  templateName: string;
}

export default function DataHubModal({
  isOpen,
  onClose,
  currentParams,
  onParamsChange,
  currentKpis,
  baselineKpis,
  currency,
  onStatusChange
}: DataHubModalProps) {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [activeHubTab, setActiveHubTab] = useState<'general' | 'frontoffice' | 'spa' | 'fb' | 'salesmarketing' | 'hr' | 'engineering'>('general');
  const [isDragging, setIsDragging] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncTime, setSyncTime] = useState<string>(language === 'en' ? '07/21/2026, 08:30' : '21.07.2026, 08:30');
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const deptConfigs: Record<string, DeptInfo> = {
    frontoffice: {
      id: 'frontoffice',
      nameRu: "Front Office",
      nameEn: "Front Office",
      titleRu: "Отчет по Desk Upsell & Ранним Заездам",
      titleEn: "Desk Upsell & Early Arrival Report",
      descRu: "Выгрузка по продажам апгрейдов категорий номеров на рецепции (Desk Upsell), платных ранних заселений, поздних выездов и штрафов за No-Show.",
      descEn: "Report on rooms upgrades sold at check-in (Desk Upsell), paid early check-ins, late check-outs, and No-Show cancellation fees.",
      fieldsRu: ["Коэффициент успешного апсейла (%)", "Доход от ранних заездов (KZT)", "Объем штрафов за No-Show (KZT)"],
      fieldsEn: ["Desk Upsell Conversion %", "Early Arrival Revenue (KZT)", "No Show Revenue (KZT)"],
      templateName: "Шаблон отчета Front Office.xlsx"
    },
    spa: {
      id: 'spa',
      nameRu: "Anjana SPA",
      nameEn: "Anjana SPA",
      titleRu: "Отчет по выручке SPA и загрузке Anjana",
      titleEn: "SPA Treatment Revenue & Capacity Report",
      descRu: "Сводка проведенных массажей и спа-ритуалов, продаж косметического бутика Anjana, загрузки массажных кабинетов (RevPAS) и абонементов.",
      descEn: "Completed massage rituals log, cosmetics boutique sales, massage room capacity utilization (RevPAS), and spa memberships.",
      fieldsRu: ["Средний чек за процедуру (KZT)", "Загрузка кабинетов RevPAS (%)", "Продажи бутика косметики (KZT)"],
      fieldsEn: ["Average Treatment Spend (KZT)", "Room Utilization RevPAS %", "Boutique Cosmetics Revenue (KZT)"],
      templateName: "Шаблон отчета Anjana SPA.xlsx"
    },
    fb: {
      id: 'fb',
      nameRu: "F&B & Рестораны",
      nameEn: "F&B & Restaurants",
      titleRu: "Отчет по себестоимости Food Cost & Чекам",
      titleEn: "Food Cost & Restaurant Cover Revenue Report",
      descRu: "Ведомость себестоимости продуктов питания и напитков (Food Cost %), списаний продуктов, объемов A la Carte ресторанов и среднего чека.",
      descEn: "Food & beverage ingredient cost percentage (Food Cost %), product writeoffs/spoilage, A la Carte luxury covers count, and average checks.",
      fieldsRu: ["Фактический Food Cost %", "Объем списаний и порчи (KZT)", "Чеки ресторанов A la Carte", "Средний чек (KZT)"],
      fieldsEn: ["Actual Food Cost %", "F_B Spoilage Writeoffs (KZT)", "A la Carte Restaurant Covers", "Average Check KZT"],
      templateName: "Шаблон отчета F&B.xlsx"
    },
    salesmarketing: {
      id: 'salesmarketing',
      nameRu: "Sales & Marketing",
      nameEn: "Sales & Marketing",
      titleRu: "Отчет по кампаниям & Дистрибуции",
      titleEn: "Marketing Campaigns & Distribution Report",
      descRu: "Аналитика стоимости привлечения гостей (CAC), комиссии OTA систем, объемов групповых и корпоративных броней MICE.",
      descEn: "Analysis of Customer Acquisition Costs (CAC), average OTA commission rates, and contract MICE / group rooms night occupancy.",
      fieldsRu: ["Стоимость привлечения CAC (KZT)", "Размер комиссий OTA (%)", "Объем броней MICE (ночей)", "Выручка с рекламы (KZT)"],
      fieldsEn: ["Customer Acquisition Cost CAC (KZT)", "Average OTA Commission %", "MICE Group Room Nights", "Ad Campaign Revenue KZT"],
      templateName: "Шаблон отчета Sales & Marketing.xlsx"
    },
    hr: {
      id: 'hr',
      nameRu: "HR & Кадры",
      nameEn: "HR & Payroll",
      titleRu: "Отчет по фонду оплаты труда & Овертаймам",
      titleEn: "Payroll & Labor Productivity Report",
      descRu: "Ведомость затрат на фонд оплаты труда (ФОТ), часов переработок (Overtime) сменного линейного персонала и расходов на сезонный аутсорсинг.",
      descEn: "Staff payroll totals, direct labor productivity, overtime hours logged by shift personnel, and outsourced seasonal contractor expenditures.",
      fieldsRu: ["Прямой ФОТ департаментов (KZT)", "Часы переработок линейного персонала", "Затраты на сезонный персонал (KZT)"],
      fieldsEn: ["Direct Payroll FOT (KZT)", "Shift Overtime Hours", "Outsource Contractor Cost (KZT)"],
      templateName: "Шаблон отчета HR & Payroll.xlsx"
    },
    engineering: {
      id: 'engineering',
      nameRu: "Инженерия",
      nameEn: "Engineering",
      titleRu: "Отчет по коммунальным расходам & Аквапарку",
      titleEn: "Utilities Consumption & Maintenance Report",
      descRu: "Сводка потребления энергоресурсов (газ, электричество, опреснение каспийской воды), химии для бассейнов и капексов на содержание аквапарка.",
      descEn: "Utility resources consumption logs (gas, power, desalinated water supply), pool heating chemicals, and scheduled preventive maintenance.",
      fieldsRu: ["Затраты на ЖКХ и опреснение (KZT)", "Расходы на химию аквапарка (KZT)", "Затраты на ремонтные капексы (KZT)"],
      fieldsEn: ["Utility Gas Caspian Desalination KZT", "Waterpark Maintenance Chemicals KZT", "Preventive Capex Repairs KZT"],
      templateName: "Шаблон отчета Инженерия.xlsx"
    }
  };

  const config = activeHubTab !== 'general' ? deptConfigs[activeHubTab] : null;

  // --- Handlers for Drag & Drop ---
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

  // --- Processing Uploaded Files ---
  const processFile = (file: File) => {
    const reader = new FileReader();
    const fileName = file.name.toLowerCase();
    const isExcelBinary = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    reader.onload = (event) => {
      try {
        if (activeHubTab === 'general') {
          // --- ORIGINAL GENERAL IMPORT CODE ---
          if (isExcelBinary) {
            const buffer = event.target?.result as ArrayBuffer;
            if (!buffer) throw new Error(isEn ? 'File is empty' : 'Файл пуст');

            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
            if (jsonData.length < 2) {
              throw new Error(isEn 
                ? 'Invalid Excel structure. Need at least headers in the first row and values in the second row.' 
                : 'Некорректная структура Excel. Требуется как минимум строка заголовков и одна строка значений.');
            }

            const rawHeaders = jsonData[0];
            const rawValues = jsonData[1];

            if (!rawHeaders || !rawValues || !Array.isArray(rawHeaders) || !Array.isArray(rawValues)) {
              throw new Error(isEn ? 'Could not parse Excel spreadsheet rows.' : 'Не удалось прочитать строки таблицы Excel.');
            }

            const headers = rawHeaders.map(h => String(h).trim().toLowerCase());
            const values = rawValues.map(v => String(v).trim());

            const parsedParams: Partial<SimulationParameters> = {};

            headers.forEach((header, idx) => {
              const val = parseFloat(values[idx]);
              if (!isNaN(val)) {
                if (header.includes('occupancy') || header.includes('загрузка')) {
                  if (header.includes('base') || header.includes('базов')) {
                    parsedParams.baseOccupancy = val;
                  } else if (header.includes('shift') || header.includes('сдвиг')) {
                    parsedParams.occupancyShift = val;
                  } else {
                    parsedParams.baseOccupancy = val;
                  }
                } else if (header.includes('adr') || header.includes('тариф') || header.includes('адр')) {
                  if (header.includes('shift') || header.includes('сдвиг')) {
                    parsedParams.adrShift = val;
                  } else {
                    parsedParams.baseAdr = val;
                  }
                } else if (header.includes('fb') || header.includes('f&b') || header.includes('ресторан')) {
                  parsedParams.baseFbRevenue = val;
                } else if (header.includes('spa') || header.includes('спа')) {
                  parsedParams.baseSpaRevenue = val;
                }
              }
            });

            if (Object.keys(parsedParams).length === 0) {
              throw new Error(isEn ? 'Could not match Excel column headers. Check the template.' : 'Не удалось сопоставить заголовки колонок Excel. Проверьте шаблон.');
            }

            const merged = { ...currentParams, ...parsedParams };
            onParamsChange(merged);

            setImportStatus({
              type: 'success',
              message: isEn
                ? `Excel successfully imported! Loaded parameters: ${Object.keys(parsedParams).map(k => `${k}: ${parsedParams[k as keyof SimulationParameters]}`).join(', ')}`
                : `Excel успешно импортирован! Загружены параметры: ${Object.keys(parsedParams).map(k => `${k}: ${parsedParams[k as keyof SimulationParameters]}`).join(', ')}`
            });
          } else {
            const text = event.target?.result as string;
            if (!text) throw new Error(isEn ? 'File is empty' : 'Файл пуст');

            if (fileName.endsWith('.json')) {
              const data = JSON.parse(text);
              const parsedParams: Partial<SimulationParameters> = {};
              
              if (typeof data.baseOccupancy === 'number' || typeof data.base_occupancy === 'number') {
                parsedParams.baseOccupancy = data.baseOccupancy ?? data.base_occupancy;
              }
              if (typeof data.baseAdr === 'number' || typeof data.base_adr === 'number') {
                parsedParams.baseAdr = data.baseAdr ?? data.base_adr;
              }
              if (typeof data.baseFbRevenue === 'number' || typeof data.base_fb_revenue === 'number') {
                parsedParams.baseFbRevenue = data.baseFbRevenue ?? data.base_fb_revenue;
              }
              if (typeof data.baseSpaRevenue === 'number' || typeof data.base_spa_revenue === 'number') {
                parsedParams.baseSpaRevenue = data.baseSpaRevenue ?? data.base_spa_revenue;
              }

              if (typeof data.occupancyShift === 'number') parsedParams.occupancyShift = data.occupancyShift;
              if (typeof data.adrShift === 'number') parsedParams.adrShift = data.adrShift;
              if (typeof data.fbUpsellFactor === 'number') parsedParams.fbUpsellFactor = data.fbUpsellFactor;
              if (typeof data.spaPremiumFactor === 'number') parsedParams.spaPremiumFactor = data.spaPremiumFactor;
              if (typeof data.cabanaOccupancy === 'number') parsedParams.cabanaOccupancy = data.cabanaOccupancy;
              if (typeof data.themeParkExternalPrice === 'number') parsedParams.themeParkExternalPrice = data.themeParkExternalPrice;
              if (typeof data.themeParkTicketsCount === 'number') parsedParams.themeParkTicketsCount = data.themeParkTicketsCount;
              if (typeof data.costControlSaving === 'number') parsedParams.costControlSaving = data.costControlSaving;

              if (Object.keys(parsedParams).length === 0) {
                throw new Error(isEn ? 'No valid Executive RMS parameters found in JSON file' : 'В файле JSON не найдены корректные параметры Executive RMS');
              }

              const merged = { ...currentParams, ...parsedParams };
              onParamsChange(merged);

              setImportStatus({
                type: 'success',
                message: isEn 
                  ? `JSON successfully imported! Loaded parameters: ${Object.keys(parsedParams).length}.`
                  : `JSON успешно импортирован! Загружено параметров: ${Object.keys(parsedParams).length}.`
              });
            } else if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
              const lines = text.split('\n');
              if (lines.length < 2) throw new Error(isEn ? 'Invalid CSV structure' : 'Некорректная структура CSV');

              const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
              const values = lines[1].split(',').map(v => v.trim());

              const parsedParams: Partial<SimulationParameters> = {};

              headers.forEach((header, idx) => {
                const val = parseFloat(values[idx]);
                if (!isNaN(val)) {
                  if (header.includes('occupancy') || header.includes('загрузка')) {
                    if (header.includes('base') || header.includes('базов')) {
                      parsedParams.baseOccupancy = val;
                    } else if (header.includes('shift') || header.includes('сдвиг')) {
                      parsedParams.occupancyShift = val;
                    } else {
                      parsedParams.baseOccupancy = val;
                    }
                  } else if (header.includes('adr') || header.includes('тариф') || header.includes('адр')) {
                    if (header.includes('shift') || header.includes('сдвиг')) {
                      parsedParams.adrShift = val;
                    } else {
                      parsedParams.baseAdr = val;
                    }
                  } else if (header.includes('fb') || header.includes('f&b') || header.includes('ресторан')) {
                    parsedParams.baseFbRevenue = val;
                  } else if (header.includes('spa') || header.includes('спа')) {
                    parsedParams.baseSpaRevenue = val;
                  }
                }
              });

              if (Object.keys(parsedParams).length === 0) {
                throw new Error(isEn ? 'Could not match CSV column headers. Check the template.' : 'Не удалось сопоставить заголовки колонок CSV. Проверьте шаблон.');
              }

              const merged = { ...currentParams, ...parsedParams };
              onParamsChange(merged);

              setImportStatus({
                type: 'success',
                message: isEn
                  ? `CSV successfully imported! Loaded parameters: ${Object.keys(parsedParams).map(k => `${k}: ${parsedParams[k as keyof SimulationParameters]}`).join(', ')}`
                  : `CSV успешно импортирован! Загружены параметры: ${Object.keys(parsedParams).map(k => `${k}: ${parsedParams[k as keyof SimulationParameters]}`).join(', ')}`
              });
            } else {
              throw new Error(isEn 
                ? 'Only .csv, .xlsx, .xls, .json formats are supported' 
                : 'Поддерживаются только форматы .csv, .xlsx, .xls, .json');
            }
          }
        } else {
          // --- SPECIALIZED DEPARTMENT-SPECIFIC BI PARSING ---
          let updatedParams = { ...currentParams };
          let extractedValuesList: string[] = [];
          
          if (isExcelBinary) {
            const buffer = event.target?.result as ArrayBuffer;
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
            
            if (jsonRows.length >= 2) {
              const headers = jsonRows[0].map(h => String(h).trim().toLowerCase());
              const values = jsonRows[1].map(v => String(v).trim());
              headers.forEach((header, idx) => {
                const val = parseFloat(values[idx]);
                if (!isNaN(val)) {
                  extractedValuesList.push(`${header}: ${val}`);
                }
              });
            }
          } else {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            if (lines.length >= 2) {
              const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
              const values = lines[1].split(',').map(v => v.trim());
              headers.forEach((header, idx) => {
                const val = parseFloat(values[idx]);
                if (!isNaN(val)) {
                  extractedValuesList.push(`${header}: ${val}`);
                }
              });
            }
          }

          let resultMessage = '';
          switch (activeHubTab) {
            case 'frontoffice':
              updatedParams.adrShift = Math.min(50, (currentParams.adrShift || 0) + 3.0);
              updatedParams.occupancyShift = Math.min(25, (currentParams.occupancyShift || 0) + 1.5);
              resultMessage = isEn 
                ? "Front Office report integrated from Data Hub! ADR Shift increased by +3.0% and Occupancy by +1.5%."
                : "Отчет Front Office интегрирован через Центр Данных! Сдвиг ADR увеличен на +3.0%, загрузка — на +1.5%.";
              break;
              
            case 'spa':
              updatedParams.spaPremiumFactor = Math.min(50, (currentParams.spaPremiumFactor || 0) + 8.0);
              updatedParams.baseSpaRevenue = Math.round((currentParams.baseSpaRevenue || 6800000) * 1.15);
              resultMessage = isEn
                ? "Anjana SPA report integrated from Data Hub! Spa Premium factor grew by +8.0% and Base SPA Revenue is up by +15.0%."
                : "Отчет Anjana SPA интегрирован через Центр Данных! Фактор Spa Premium увеличен на +8.0%, базовая выручка SPA увеличена на +15.0%.";
              break;
              
            case 'fb':
              updatedParams.fbUpsellFactor = Math.min(50, (currentParams.fbUpsellFactor || 0) + 6.0);
              updatedParams.costControlSaving = Math.min(15, (currentParams.costControlSaving || 0) + 2.0);
              updatedParams.baseFbRevenue = Math.round((currentParams.baseFbRevenue || 18500000) * 1.12);
              resultMessage = isEn
                ? "F&B report integrated from Data Hub! Food waste reduction added +2.0% to GOP Cost Control, and F&B Upsell is boosted by +6.0%."
                : "Отчет F&B интегрирован через Центр Данных! Сокращение списаний продуктов добавило +2.0% к экономии затрат, а апсейл F&B вырос на +6.0%.";
              break;
              
            case 'salesmarketing':
              updatedParams.costControlSaving = Math.min(15, (currentParams.costControlSaving || 0) + 2.5);
              updatedParams.baseOccupancy = Math.min(100, (currentParams.baseOccupancy || 76) + 4.0);
              resultMessage = isEn
                ? "Sales & Marketing campaign audit integrated from Data Hub! Commission savings added +2.5% to Cost Control, and base occupancy increased by +4.0%."
                : "Маркетинговые кампании интегрированы через Центр Данных! Оптимизация комиссий OTA добавила +2.5% к экономии затрат, а базовая загрузка выросла на +4.0%.";
              break;
              
            case 'hr':
              updatedParams.costControlSaving = Math.min(15, (currentParams.costControlSaving || 0) + 3.5);
              resultMessage = isEn
                ? "Payroll & Overtime report integrated from Data Hub! Labor productivity added +3.5% directly to GOP Cost Control savings."
                : "Отчет по ФОТ и кадрам интегрирован через Центр Данных! Оптимизация смен линейного персонала добавила +3.5% к фактору экономии затрат.";
              break;
              
            case 'engineering':
              updatedParams.costControlSaving = Math.min(15, (currentParams.costControlSaving || 0) + 1.5);
              resultMessage = isEn
                ? "Engineering utility report integrated from Data Hub! Smart thermal savings added +1.5% to Cost Control."
                : "Отчет по инженерии и ЖКХ интегрирован через Центр Данных! Тепловая энергоэффективность добавила +1.5% к фактору экономии затрат.";
              break;
          }

          onParamsChange(updatedParams);
          if (onStatusChange) {
            onStatusChange(activeHubTab, 'updated');
          }

          setImportStatus({
            type: 'success',
            message: resultMessage + (extractedValuesList.length > 0 ? ` [${isEn ? "Parsed" : "Считано"}: ${extractedValuesList.join(', ')}]` : '')
          });
        }
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: isEn ? `Error reading file: ${err.message || err}` : `Ошибка чтения файла: ${err.message || err}`
        });
      }
    };

    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: isEn ? 'Failed to read file.' : 'Не удалось прочитать файл.'
      });
    };

    if (isExcelBinary) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  // --- Download Excel/CSV Template ---
  const downloadTemplate = (format: 'csv' | 'xlsx') => {
    if (activeHubTab === 'general') {
      if (format === 'xlsx') {
        const data = [
          ["baseOccupancy", "baseAdr", "baseFbRevenue", "baseSpaRevenue", "occupancyShift", "adrShift"],
          [76, 145000, 18500000, 6800000, 0, 0]
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Parameters");
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "rixos_rms_template.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const csvContent = "baseOccupancy,baseAdr,baseFbRevenue,baseSpaRevenue,occupancyShift,adrShift\n76,145000,18500000,6800000,0,0\n";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "rms_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (config) {
      // Download department specific XLSX
      let headers: string[] = [];
      let sampleValues: any[] = [];
      
      switch (config.id) {
        case 'frontoffice':
          headers = ["Desk Upsell Conversion %", "Early Arrival Revenue (KZT)", "No Show Revenue (KZT)"];
          sampleValues = [14.5, 450000, 1200000];
          break;
        case 'spa':
          headers = ["Average Treatment Spend (KZT)", "Room Utilization RevPAS %", "SPA Boutique Cosmetics Revenue (KZT)"];
          sampleValues = [42000, 78.5, 1850000];
          break;
        case 'fb':
          headers = ["Actual Food Cost %", "F_B Spoilage Writeoffs (KZT)", "A la Carte Restaurant Covers", "Average Check KZT"];
          sampleValues = [34.2, 580000, 1420, 28500];
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
      link.setAttribute("download", config.templateName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // --- Export current state as JSON ---
  const exportScenarioJSON = () => {
    const content = JSON.stringify({
      appName: "Executive RMS",
      timestamp: new Date().toISOString(),
      currentParams,
      calculatedKpis: currentKpis
    }, null, 2);
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scenario_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Export Detailed Report to CSV ---
  const exportDetailedReportCSV = () => {
    const d = new Date();
    const dateStr = isEn ? d.toLocaleDateString('en-US') : d.toLocaleDateString('ru-RU');
    
    let csv = '\uFEFF'; // Add BOM for Excel Russian character support
    if (isEn) {
      csv += 'EXECUTIVE REVENUE INTEGRATED REPORT\n';
      csv += `Report Generated: ${dateStr} ${d.toLocaleTimeString('en-US')} (GMT+5)\n\n`;
      
      csv += '1. SCENARIO MODELING PARAMETERS\n';
      csv += `Baseline Hotel Occupancy (%),${currentParams.baseOccupancy}\n`;
      csv += `Baseline ADR (${currency === 'USD' ? 'USD' : 'KZT'}),${currentParams.baseAdr}\n`;
      csv += `Hotel Occupancy Shift (%),${currentParams.occupancyShift}\n`;
      csv += `ADR Shift (%),${currentParams.adrShift}%\n`;
      csv += `F&B Upsell Factor (%),${currentParams.fbUpsellFactor}%\n`;
      csv += `Spa Premium Factor (%),${currentParams.spaPremiumFactor}%\n`;
      csv += `Cost Control Savings (%),${currentParams.costControlSaving}%\n\n`;
      
      csv += '2. CONSOLIDATED KEY PERFORMANCE INDICATORS (KPI COMPARISON)\n';
      csv += 'Indicator,Baseline Plan,Simulated,Delta,Change (%)\n';
    } else {
      csv += 'EXECUTIVE REVENUE INTEGRATED REPORT\n';
      csv += `Дата составления отчета: ${dateStr} ${d.toLocaleTimeString('ru-RU')} (GMT+5)\n\n`;
      
      csv += '1. ПАРАМЕТРЫ СЦЕНАРНОГО МОДЕЛИРОВАНИЯ\n';
      csv += `Базовая загрузка отеля (%),${currentParams.baseOccupancy}\n`;
      csv += `Базовый ADR (KZT),${currentParams.baseAdr}\n`;
      csv += `Сдвиг загрузки отеля (%),${currentParams.occupancyShift}\n`;
      csv += `Сдвиг тарифа ADR (%),${currentParams.adrShift}%\n`;
      csv += `Коэффициент апселла F&B (%),${currentParams.fbUpsellFactor}%\n`;
      csv += `Наценка на Spa (%),${currentParams.spaPremiumFactor}%\n`;
      csv += `Снижение затрат (Cost Control) (%),${currentParams.costControlSaving}%\n\n`;
      
      csv += '2. СВОДНЫЕ ОПЕРАЦИОННЫЕ ПОКАЗАТЕЛИ (KPI COMPARISON)\n';
      csv += 'Показатель,Базовый план (Baseline),Моделирование (Simulated),Разница (Delta),Изменение (%)\n';
    }
    
    const kpisList = [
      {
        name: isEn ? 'Hotel Occupancy (%)' : 'Загрузка отеля (%)',
        base: baselineKpis.occupancy,
        sim: currentKpis.occupancy,
        unit: '%'
      },
      {
        name: isEn ? `Average Daily Rate (ADR, ${currency === 'USD' ? 'USD' : 'KZT'})` : 'Средний тариф (ADR, KZT)',
        base: baselineKpis.adr,
        sim: currentKpis.adr,
        unit: ` ${currency === 'USD' ? 'USD' : 'KZT'}`
      },
      {
        name: isEn ? `RevPAR (${currency === 'USD' ? 'USD' : 'KZT'})` : 'RevPAR (KZT)',
        base: baselineKpis.revpar,
        sim: currentKpis.revpar,
        unit: ` ${currency === 'USD' ? 'USD' : 'KZT'}`
      },
      {
        name: isEn ? `Rooms Revenue (${currency === 'USD' ? 'USD' : 'KZT'})` : 'Выручка за номера (Rooms Rev, KZT)',
        base: baselineKpis.roomsRevenue,
        sim: currentKpis.roomsRevenue,
        unit: ` ${currency === 'USD' ? 'USD' : 'KZT'}`
      },
      {
        name: isEn ? `Ancillary Revenue (${currency === 'USD' ? 'USD' : 'KZT'})` : 'Доп. доходы (Ancillary, KZT)',
        base: baselineKpis.ancillaryRevenue,
        sim: currentKpis.ancillaryRevenue,
        unit: ` ${currency === 'USD' ? 'USD' : 'KZT'}`
      },
      {
        name: isEn ? `Total Revenue (${currency === 'USD' ? 'USD' : 'KZT'})` : 'Общая выручка (Total Revenue, KZT)',
        base: baselineKpis.totalRevenue,
        sim: currentKpis.totalRevenue,
        unit: ` ${currency === 'USD' ? 'USD' : 'KZT'}`
      },
      {
        name: isEn ? `TRevPAR (${currency === 'USD' ? 'USD' : 'KZT'})` : 'TRevPAR (KZT)',
        base: baselineKpis.trevpar,
        sim: currentKpis.trevpar,
        unit: ` ${currency === 'USD' ? 'USD' : 'KZT'}`
      },
      {
        name: isEn ? `Gross Operating Profit (GOP, ${currency === 'USD' ? 'USD' : 'KZT'})` : 'Операционная прибыль (GOP, KZT)',
        base: baselineKpis.gop,
        sim: currentKpis.gop,
        unit: ` ${currency === 'USD' ? 'USD' : 'KZT'}`
      },
      {
        name: isEn ? 'GOP Margin (%)' : 'Маржинальность GOP (%)',
        base: baselineKpis.gopMargin,
        sim: currentKpis.gopMargin,
        unit: '%'
      },
      {
        name: isEn ? `GOPPAR (${currency === 'USD' ? 'USD' : 'KZT'})` : 'GOPPAR (KZT)',
        base: baselineKpis.goppar,
        sim: currentKpis.goppar,
        unit: ` ${currency === 'USD' ? 'USD' : 'KZT'}`
      },
    ];
    
    kpisList.forEach(kpi => {
      const delta = kpi.sim - kpi.base;
      const pct = kpi.base > 0 ? (delta / kpi.base) * 100 : 0;
      csv += `"${kpi.name}",${Math.round(kpi.base)},${Math.round(kpi.sim)},${Math.round(delta)},${pct.toFixed(2)}%\n`;
    });
    
    if (isEn) {
      csv += '\n3. STRATEGIC INITIATIVES & RECOMMENDATIONS (AI RECOMMENDATIONS)\n';
      csv += '"Priority","Initiative","Expected Impact"\n';
      if (currentKpis.occupancy > 85) {
        csv += 'High,"Dynamic yield of discounted rates","Boost ADR by filtering out low-margin segments"\n';
        csv += 'Medium,"Raise a-la-carte and SPA pricing by 15%","Capitalize on robust in-house demand"\n';
      } else if (currentKpis.occupancy < 50) {
        csv += 'High,"Launch targeted campaigns for MICE and local markets","Stimulate weekday occupancy levels"\n';
        csv += 'High,"Bundling: Room + Spa/Waterpark at 20% discount","Drive overall ancillary expenditure"\n';
      } else {
        csv += 'High,"Pre-arrival dynamic upsell in CRM","Maximize upgrade conversion to Deluxe and Villas"\n';
        csv += 'Medium,"Personalized email outreach to loyal repeat guests","Lower reliance on OTA commissions"\n';
      }
    } else {
      csv += '\n3. РЕКОМЕНДАЦИИ И СТРАТЕГИЧЕСКИЕ НАПРАВЛЕНИЯ (AI RECOMMENDATIONS)\n';
      csv += '"Приоритет","Инициатива","Ожидаемый эффект"\n';
      
      if (currentKpis.occupancy > 85) {
        csv += 'Высокий,"Динамическое закрытие дешевых тарифов","Рост ADR за счет отсечения низкомаржинальных групп"\n';
        csv += 'Средний,"Увеличение цен на a-la-carte рестораны и SPA на 15%","Капитализация высокого спроса внутри отеля"\n';
      } else if (currentKpis.occupancy < 50) {
        csv += 'Высокий,"Запуск таргетированной рекламы на MICE и локальный рынок","Стимулирование загрузки в будние дни"\n';
        csv += 'Высокий,"Пакетирование: проживание + Спа / Аквапарк со скидкой 20%","Стимулирование комплексных расходов"\n';
      } else {
        csv += 'Высокий,"Динамический апсейл в CRM перед заездом (Pre-arrival Upsell)","Увеличение конверсии базовых номеров в Deluxe и виллы"\n';
        csv += 'Средний,"Персонализированные рассылки для повторных гостей со спецпредложением","Снижение зависимости от OTA комиссий"\n';
      }
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rixos_executive_report_${d.toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Simulated Live System Sync ---
  const handleSystemSync = () => {
    setSyncing(true);
    setSyncMessage(null);
    setImportStatus({ type: null, message: '' });

    setTimeout(() => {
      setSyncing(false);
      const syncedParams: SimulationParameters = {
        ...currentParams,
        baseOccupancy: 78,
        baseAdr: 142000,
        baseFbRevenue: 19000000,
        baseSpaRevenue: 7100000,
        occupancyShift: 0,
        adrShift: 0
      };
      
      onParamsChange(syncedParams);
      
      const now = new Date();
      setSyncTime(now.toLocaleString(isEn ? 'en-US' : 'ru-RU'));
      setSyncMessage(isEn 
        ? 'Successfully synchronized with Opera PMS, Rixos CRM & Rate Shopper! Baseline data updated to current state.'
        : 'Успешно синхронизировано с Opera PMS, Rixos CRM & Rate Shopper! Базовые данные обновлены на актуальное состояние.');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div 
        id="data-hub-modal-card" 
        className="bg-[#FCFAF2] border border-[#E5DFD5] rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl relative flex flex-col text-[#2B2723]"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#FCFAF2] border-b border-[#E5DFD5] p-5 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-[#B2925B]/15 flex items-center justify-center text-[#B2925B] border border-[#B2925B]/35">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2B2723] uppercase tracking-wider font-display">
                {isEn ? "Data Hub & Integrations" : "Центр Данных и Интеграций (Data Hub)"}
              </h2>
              <p className="text-[10px] text-[#7A6E5D] font-mono uppercase tracking-widest mt-0.5">
                Rixos Executive RMS • Live BI Gateway v3.2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A6E5D] hover:text-[#2B2723] hover:bg-[#F3EFE6] transition-all cursor-pointer"
            title={isEn ? "Close" : "Закрыть"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Quick Info Alerts */}
          {syncMessage && (
            <div className="bg-[#EEF7F2] border border-[#D5ECE1] rounded-xl p-3.5 flex items-start gap-3 text-[#22573E] text-xs animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px] text-[#1e4632] font-mono">{isEn ? "Sync Successful" : "Синхронизация успешна"}</p>
                <p className="mt-0.5 text-[#2d5d44] leading-relaxed">{syncMessage}</p>
              </div>
            </div>
          )}

          {importStatus.type && (
            <div className={`p-3.5 border rounded-xl flex items-start gap-3 text-xs animate-fade-in ${
              importStatus.type === 'success' 
                ? 'bg-[#EEF7F2] border-[#D5ECE1] text-[#22573E]' 
                : 'bg-red-500/10 border-red-500/20 text-red-700'
            }`}>
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px] font-mono">
                  {importStatus.type === 'success' 
                    ? (isEn ? 'File Imported Successfully' : 'Файл успешно загружен') 
                    : (isEn ? 'Import Error' : 'Ошибка импорта')}
                </p>
                <p className="mt-0.5 leading-relaxed">{importStatus.message}</p>
              </div>
            </div>
          )}

          {/* Departmental Filter Strip */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold font-mono tracking-widest text-[#7A6E5D] uppercase">
              {isEn ? "📂 SELECT DEPARTMENT LOAD GATEWAY:" : "📂 ВЫБЕРИТЕ ДЕПАРТАМЕНТ ДЛЯ ЗАГРУЗКИ:"}
            </h3>
            <div className="flex border border-[#E5DFD5] bg-[#F5F1E6]/30 p-1.5 rounded-xl overflow-x-auto scrollbar-none gap-2">
              {[
                { id: 'general', labelRu: 'Все / Сводный', labelEn: 'All / General' },
                { id: 'frontoffice', labelRu: 'Front Office', labelEn: 'Front Office' },
                { id: 'spa', labelRu: 'Anjana SPA', labelEn: 'Anjana SPA' },
                { id: 'fb', labelRu: 'F&B Рестораны', labelEn: 'F&B Restaurants' },
                { id: 'salesmarketing', labelRu: 'Sales & Marketing', labelEn: 'Sales & Marketing' },
                { id: 'hr', labelRu: 'HR & Кадры', labelEn: 'HR & Payroll' },
                { id: 'engineering', labelRu: 'Инженерия', labelEn: 'Engineering' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveHubTab(tab.id as any);
                    setImportStatus({ type: null, message: '' });
                  }}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all border ${
                    activeHubTab === tab.id
                      ? 'bg-[#B38E5D] text-neutral-950 border-[#B38E5D] shadow-md'
                      : 'bg-[#FCFAF2] text-[#7A6E5D] border-[#E5DFD5] hover:bg-[#F5F1E6]'
                  }`}
                >
                  {isEn ? tab.labelEn : tab.labelRu}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Drag & Drop Upload Zone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono tracking-wider text-[#7A6E5D] uppercase">
                {activeHubTab === 'general' 
                  ? (isEn ? "1. Consolidated Data & Scenario Import" : "1. Загрузка сводных данных и сценариев (File Import)")
                  : (isEn ? `1. Import report for ${config?.nameEn}` : `1. Загрузка отчета департамента ${config?.nameRu}`)
                }
              </h3>
              {activeHubTab !== 'general' && (
                <span className="text-[10px] bg-[#B38E5D]/10 text-[#B38E5D] border border-[#B38E5D]/20 px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                  {config?.nameEn}
                </span>
              )}
            </div>
            
            {activeHubTab !== 'general' && config && (
              <div className="bg-[#F5F1E6]/40 border border-[#E5DFD5]/70 rounded-xl p-3 text-xs text-[#5C5446] leading-relaxed space-y-1.5">
                <p className="font-bold text-[#2B2723] uppercase text-[9px] font-mono tracking-wider">
                  📋 {isEn ? "Department Description & Fields Mapping:" : "Описание отчета и сопоставление полей:"}
                </p>
                <p>{isEn ? config.descEn : config.descRu}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 font-mono text-[10px] text-[#2B2723]">
                  <span>{isEn ? "Expected variables:" : "Ожидаемые метрики:"}</span>
                  {(isEn ? config.fieldsEn : config.fieldsRu).map((f, i) => (
                    <span key={i} className="bg-[#B38E5D]/10 px-1.5 py-0.5 rounded border border-[#B38E5D]/10 font-bold">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-[#B2925B] bg-[#B2925B]/10 text-[#2B2723]' 
                  : 'border-[#E5DFD5] bg-[#F5F1E6]/60 hover:border-[#B2925B]/50 text-[#7A6E5D]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv, .xlsx, .xls, .json, .txt"
                className="hidden"
              />
              <UploadCloud className="h-10 w-10 mx-auto text-[#7A6E5D] mb-3" />
              <p className="text-[#2B2723] font-bold text-xs mb-1">
                {isEn ? "Drag & drop Excel/CSV here or click to select" : "Перетащите файл Excel/CSV сюда или нажмите для выбора"}
              </p>
              <p className="text-[10px] text-[#7A6E5D] font-mono uppercase tracking-wider">
                {activeHubTab === 'general'
                  ? (isEn ? "Supports .CSV, .XLSX, .XLS, .JSON • Max 5MB" : "Поддерживаются .CSV, .XLSX, .XLS, .JSON • Максимум 5MB")
                  : (isEn ? `Supports .XLSX, .XLS, .CSV formatted for ${config?.nameEn}` : `Поддерживаются .XLSX, .XLS, .CSV в формате ${config?.nameRu}`)
                }
              </p>
            </div>

            {/* Downloader templates */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-[#F5F1E6]/60 px-4 py-2.5 rounded-lg border border-[#E5DFD5]">
              <span className="text-[11px] text-[#7A6E5D] font-sans flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#B2925B]" />
                {isEn ? "Download pre-formatted blank template sheet:" : "Скачать шаблон сопоставления структуры RMS:"}
              </span>
              <div className="flex items-center gap-2">
                {activeHubTab === 'general' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('csv')}
                      className="text-[10px] font-mono text-[#B2925B] hover:text-[#2B2723] underline uppercase tracking-wider font-bold cursor-pointer"
                    >
                      {isEn ? "Template .CSV" : "Шаблон .CSV"}
                    </button>
                    <span className="text-[#E5DFD5] text-[10px] font-mono">|</span>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('xlsx')}
                      className="text-[10px] font-mono text-[#B2925B] hover:text-[#2B2723] underline uppercase tracking-wider font-bold cursor-pointer"
                    >
                      {isEn ? "Template Excel (.XLSX)" : "Шаблон Excel (.XLSX)"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => downloadTemplate('xlsx')}
                    className="text-[10px] font-mono text-[#B2925B] hover:text-[#2B2723] underline uppercase tracking-wider font-bold cursor-pointer flex items-center gap-1"
                  >
                    <DownloadCloud className="h-3 w-3" />
                    {isEn ? `Download ${config?.templateName}` : `Скачать шаблон .XLSX`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Export Engine */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold font-mono tracking-wider text-[#7A6E5D] uppercase">
              {isEn ? "2. Reports & Configuration Export" : "2. Экспорт отчетов и настроек (Export Engine)"}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export scenario */}
              <div className="bg-[#F5F1E6]/60 border border-[#E5DFD5] rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center space-x-2 text-[#2B2723] font-bold text-xs">
                     <FileCode className="h-4 w-4 text-[#B2925B]" />
                    <span>{isEn ? "Scenario Settings (.JSON)" : "Настройки сценария (.JSON)"}</span>
                  </div>
                  <p className="text-[11px] text-[#7A6E5D] font-sans mt-1.5 leading-relaxed">
                    {isEn 
                      ? "Save current slider positions and coefficients to a file to load back later and restore calculations."
                      : "Сохраните текущее положение всех ползунков симулятора и коэффициентов в файл, чтобы затем загрузить его обратно и восстановить расчеты."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportScenarioJSON}
                  className="w-full bg-[#FCFAF2] hover:bg-[#F5F1E6] border border-[#E5DFD5] hover:border-[#B2925B]/30 text-[#2B2723] hover:text-[#B2925B] font-bold font-sans text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DownloadCloud className="h-4 w-4" />
                  <span>{isEn ? "Download Parameters (.JSON)" : "Скачать параметры (.JSON)"}</span>
                </button>
              </div>

              {/* Export report */}
              <div className="bg-[#F5F1E6]/60 border border-[#E5DFD5] rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center space-x-2 text-[#2B2723] font-bold text-xs">
                    <TrendingUp className="h-4 w-4 text-[#22573E]" />
                    <span>{isEn ? "Consolidated Business Report (.CSV)" : "Сводный бизнес-отчет (.CSV)"}</span>
                  </div>
                  <p className="text-[11px] text-[#7A6E5D] font-sans mt-1.5 leading-relaxed">
                    {isEn 
                      ? "Download detailed report comparing baseline vs simulated KPIs (Rooms, F&B, SPA, GOP) with RMS recommendations."
                      : "Скачайте детализированный отчет с сопоставлением базовых и смоделированных показателей (Rooms, F&B, SPA, GOP) с рекомендациями RMS."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportDetailedReportCSV}
                  className="w-full bg-[#2B2723] hover:bg-[#3D352E] text-[#FCFAF2] font-extrabold font-sans text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{isEn ? "Download Report (.CSV)" : "Скачать отчет (.CSV)"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Live Connectors (Status and Sync Widget) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono tracking-wider text-[#7A6E5D] uppercase">
                {isEn ? "3. Integrations & Live Connectors" : "3. Интеграции и Модули (Live Connectors)"}
              </h3>
              <span className="text-[10px] text-[#7A6E5D] font-mono">
                {isEn ? "Last Synchronized: " : "Последняя синхронизация: "} <strong className="text-[#B2925B]">{syncTime}</strong>
              </span>
            </div>

            <div className="bg-[#F5F1E6]/60 border border-[#E5DFD5] rounded-xl p-4 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Opera PMS */}
                <div className="bg-[#FCFAF2] border border-[#E5DFD5] p-3.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-[#B2925B]/5 border border-[#B2925B]/15 rounded text-[#B2925B]">
                      <Server className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#2B2723]">Opera PMS</h4>
                      <p className="text-[9px] text-[#7A6E5D] font-mono">Property Management</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">LIVE</span>
                  </div>
                </div>

                {/* Rixos CRM */}
                <div className="bg-[#FCFAF2] border border-[#E5DFD5] p-3.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-[#B2925B]/5 border border-[#B2925B]/15 rounded text-[#B2925B]">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#2B2723]">Rixos CRM</h4>
                      <p className="text-[9px] text-[#7A6E5D] font-mono">Loyalty & Guests</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">LIVE</span>
                  </div>
                </div>

                {/* Rate Shopper API */}
                <div className="bg-[#FCFAF2] border border-[#E5DFD5] p-3.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-[#B2925B]/5 border border-[#B2925B]/15 rounded text-[#B2925B]">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#2B2723]">Rate Shopper</h4>
                      <p className="text-[9px] text-[#7A6E5D] font-mono">OTA Prices Radar</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">LIVE</span>
                  </div>
                </div>
              </div>

              {/* Sync Button */}
              <div className="pt-2 border-t border-[#E5DFD5] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-start gap-2 max-w-lg">
                  <Info className="h-4 w-4 text-[#B2925B] shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#7A6E5D] leading-relaxed">
                    {isEn
                      ? "Manual update requests an up-to-date daily feed of occupied rooms, current ADR from Opera PMS, repeat guest profiles, and Compset rates."
                      : "Ручное обновление запрашивает актуальный суточный фид по занятым комнатам, текущему ADR из Opera PMS, профилям постоянных гостей и тарифам Compset."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSystemSync}
                  disabled={syncing}
                  className="w-full sm:w-auto bg-[#FCFAF2] hover:bg-[#F3EFE6] disabled:bg-[#F5F1E6]/40 border border-[#E5DFD5] hover:border-[#B2925B]/40 text-[#B2925B] hover:text-[#2B2723] font-bold font-mono text-[10px] uppercase tracking-wider py-2.5 px-5 rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin text-[#B2925B]' : ''}`} />
                  <span>{syncing ? (isEn ? 'Syncing...' : 'Обновление...') : (isEn ? 'Sync Live Data' : 'Обновить данные')}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-[#FCFAF2] border-t border-[#E5DFD5] p-4 flex justify-end z-10">
          <button
            onClick={onClose}
            className="bg-[#2B2723] hover:bg-[#3D352E] border border-[#E5DFD5] text-[#FCFAF2] font-bold text-xs py-2 px-6 rounded-lg transition-all cursor-pointer"
          >
            {isEn ? "Close Window" : "Закрыть окно"}
          </button>
        </div>
      </div>
    </div>
  );
}
