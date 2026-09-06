import React, { useState } from 'react';
import { db } from '../db/database';
import { downloadCSV } from '../utils/csvExporter';
import {
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  Clipboard,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRight,
  Database,
  Users,
  Layers,
  Coins,
  RefreshCw,
  Sparkles,
  Check,
  X,
  FileText,
  FileUp,
} from 'lucide-react';
import { UserRole } from '../types/schema';

type ImportTarget = 'customers' | 'transactions' | 'employees' | 'expenses' | 'invoices' | 'services_pricing';
type ImportSourceMode = 'FILE_UPLOAD' | 'PASTE_TEXT' | 'JSON_UPLOAD';

interface DataImportHubProps {
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onImportComplete?: (table: string, count: number) => void;
}

export const DataImportHub: React.FC<DataImportHubProps> = ({ currentRole, lang, onImportComplete }) => {
  const isAr = lang === 'ar';

  const [targetEntity, setTargetEntity] = useState<ImportTarget>('customers');
  const [sourceMode, setSourceMode] = useState<ImportSourceMode>('FILE_UPLOAD');
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [importStatus, setImportStatus] = useState<'IDLE' | 'PARSED' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [statusMessage, setStatusMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);

  // Entities & Schema Fields Definitions
  const entityConfigs: Record<
    ImportTarget,
    {
      labelAr: string;
      labelEn: string;
      icon: any;
      fields: { key: string; labelAr: string; labelEn: string; required?: boolean }[];
      sampleRow: Record<string, any>;
    }
  > = {
    customers: {
      labelAr: 'العملاء (CRM Customers)',
      labelEn: 'CRM Customers',
      icon: Users,
      fields: [
        { key: 'name_ar', labelAr: 'الاسم بالعربية', labelEn: 'Name (Arabic)', required: true },
        { key: 'name_en', labelAr: 'الاسم بالإنجليزية', labelEn: 'Name (English)' },
        { key: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', required: true },
        { key: 'emirates_id', labelAr: 'رقم الهوية الإماراتية', labelEn: 'Emirates ID' },
        { key: 'passport_number', labelAr: 'رقم جواز السفر', labelEn: 'Passport No' },
        { key: 'nationality', labelAr: 'الجنسية', labelEn: 'Nationality' },
        { key: 'customer_type', labelAr: 'نوع العميل (أفراد / شركات)', labelEn: 'Type (INDIVIDUAL/CORPORATE)' },
        { key: 'current_balance_aed', labelAr: 'الرصيد المستحق (د.إ)', labelEn: 'Current Balance' },
      ],
      sampleRow: {
        name_ar: 'محمد أحمد المنصوري',
        name_en: 'Mohammed Ahmed Al Mansoori',
        phone: '+971501234567',
        emirates_id: '784-1990-1234567-1',
        passport_number: 'N01234567',
        nationality: 'إماراتي',
        customer_type: 'INDIVIDUAL',
        current_balance_aed: 0,
      },
    },
    transactions: {
      labelAr: 'معاملات ومهام الطباعة (Service Tasks)',
      labelEn: 'Typing Service Tasks',
      icon: Layers,
      fields: [
        { key: 'transaction_number', labelAr: 'رقم المعاملة', labelEn: 'Transaction #', required: true },
        { key: 'customer_name_ar', labelAr: 'اسم العميل', labelEn: 'Customer Name', required: true },
        { key: 'customer_phone', labelAr: 'هاتف العميل', labelEn: 'Customer Phone' },
        { key: 'service_name_ar', labelAr: 'اسم الخدمة', labelEn: 'Service Name', required: true },
        { key: 'department', labelAr: 'القسم', labelEn: 'Department' },
        { key: 'status', labelAr: 'الحالة', labelEn: 'Status' },
        { key: 'total_net_amount_aed', labelAr: 'المبلغ الإجمالي (د.إ)', labelEn: 'Total Amount AED' },
        { key: 'typing_fee_aed', labelAr: 'أتعاب الطباعة (د.إ)', labelEn: 'Typing Fee' },
      ],
      sampleRow: {
        transaction_number: 'TRX-2026-901',
        customer_name_ar: 'خالد عبد الله النعيمي',
        customer_phone: '+971559876543',
        service_name_ar: 'تجديد بطاقة الهوية والإقامة',
        department: 'الطباعة والعمليات',
        status: 'جديدة',
        total_net_amount_aed: 350,
        typing_fee_aed: 80,
      },
    },
    employees: {
      labelAr: 'الموظفين والكادر (Staff)',
      labelEn: 'Employees & Staff',
      icon: Users,
      fields: [
        { key: 'full_name_ar', labelAr: 'اسم الموظف بالعربية', labelEn: 'Full Name (Arabic)', required: true },
        { key: 'full_name_en', labelAr: 'الاسم بالإنجليزية', labelEn: 'Full Name (English)' },
        { key: 'job_title_ar', labelAr: 'المسمى الوظيفي', labelEn: 'Job Title', required: true },
        { key: 'department', labelAr: 'القسم', labelEn: 'Department' },
        { key: 'basic_salary_aed', labelAr: 'الراتب الأساسي', labelEn: 'Basic Salary AED' },
        { key: 'housing_allowance_aed', labelAr: 'بدل السكن', labelEn: 'Housing Allowance' },
        { key: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone' },
        { key: 'status', labelAr: 'الحالة الوظيفية', labelEn: 'Status' },
      ],
      sampleRow: {
        full_name_ar: 'سالم راشد الكتبي',
        full_name_en: 'Salem Rashid Al Ketbi',
        job_title_ar: 'طباع أول ومعقب',
        department: 'الطباعة والعمليات',
        basic_salary_aed: 4500,
        housing_allowance_aed: 1500,
        phone: '+971508889900',
        status: 'على رأس عمله',
      },
    },
    expenses: {
      labelAr: 'المصروفات والسندات (Expenses)',
      labelEn: 'Expenses & Vouchers',
      icon: Coins,
      fields: [
        { key: 'title_ar', labelAr: 'بيان المصروف', labelEn: 'Expense Title', required: true },
        { key: 'category_ar', labelAr: 'بند المصروف', labelEn: 'Expense Category', required: true },
        { key: 'amount_aed', labelAr: 'المبلغ (د.إ)', labelEn: 'Amount AED', required: true },
        { key: 'vat_amount_aed', labelAr: 'ضريبة القيمة المضافة 5%', labelEn: 'VAT AED' },
        { key: 'expense_date', labelAr: 'تاريخ الصرف', labelEn: 'Expense Date' },
        { key: 'payment_method', labelAr: 'طريقة الدفع', labelEn: 'Payment Method' },
      ],
      sampleRow: {
        title_ar: 'شراء أحبار وطابعات كانون',
        category_ar: 'مستلزمات مكتبية وطباعة',
        amount_aed: 850,
        vat_amount_aed: 42.5,
        expense_date: new Date().toISOString().slice(0, 10),
        payment_method: 'بطاقة بنكية',
      },
    },
    invoices: {
      labelAr: 'الفواتير والذمم (Invoices)',
      labelEn: 'Invoices & Billing',
      icon: FileSpreadsheet,
      fields: [
        { key: 'invoice_number', labelAr: 'رقم الفاتورة', labelEn: 'Invoice #', required: true },
        { key: 'customer_name_ar', labelAr: 'اسم العميل', labelEn: 'Customer Name', required: true },
        { key: 'total_amount_aed', labelAr: 'إجمالي الفاتورة (د.إ)', labelEn: 'Total Amount AED', required: true },
        { key: 'vat_amount_aed', labelAr: 'الضريبة 5%', labelEn: 'VAT Amount' },
        { key: 'payment_status', labelAr: 'حالة السداد', labelEn: 'Payment Status' },
        { key: 'issue_date', labelAr: 'تاريخ الفاتورة', labelEn: 'Issue Date' },
      ],
      sampleRow: {
        invoice_number: 'INV-2026-105',
        customer_name_ar: 'مؤسسة العين للخدمات التجارية',
        total_amount_aed: 1260,
        vat_amount_aed: 60,
        payment_status: 'غير مدفوع',
        issue_date: new Date().toISOString().slice(0, 10),
      },
    },
    services_pricing: {
      labelAr: 'دليل أسعار الخدمات (Service Catalog)',
      labelEn: 'Service Pricing Catalog',
      icon: Layers,
      fields: [
        { key: 'service_code', labelAr: 'كود الخدمة', labelEn: 'Service Code', required: true },
        { key: 'name_ar', labelAr: 'اسم الخدمة بالعربية', labelEn: 'Service Name Ar', required: true },
        { key: 'name_en', labelAr: 'الاسم بالإنجليزية', labelEn: 'Service Name En' },
        { key: 'category', labelAr: 'الجهة / التصنيف', labelEn: 'Category' },
        { key: 'typing_fee_aed', labelAr: 'أتعاب الطباعة (د.إ)', labelEn: 'Typing Fee AED' },
        { key: 'government_fee_aed', labelAr: 'الرسوم الحكومية (د.إ)', labelEn: 'Gov Fee AED' },
      ],
      sampleRow: {
        service_code: 'ICP-RES-NEW',
        name_ar: 'إصدار إقامة جديدة سنتين',
        name_en: 'New 2-Year Residency Visa',
        category: 'الهيئة الاتحادية للهوية والجنسية',
        typing_fee_aed: 120,
        government_fee_aed: 750,
      },
    },
  };

  const currentConfig = entityConfigs[targetEntity];

  // Helper: Download Sample CSV Template
  const handleDownloadSampleCSV = () => {
    const headers = currentConfig.fields.map((f) => f.key);
    const row = headers.map((k) => currentConfig.sampleRow[k] ?? '');
    downloadCSV(`Template_${targetEntity}`, headers, [row]);
  };

  // Helper: Download Sample JSON Template
  const handleDownloadSampleJSON = () => {
    const data = [currentConfig.sampleRow];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_${targetEntity}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // CSV Parsing Engine
  const parseCSVText = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return;

    // Detect delimiter (comma or tab)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    const parseLine = (line: string): string[] => {
      if (delimiter === '\t') {
        return line.split('\t').map((c) => c.trim().replace(/^"(.*)"$/, '$1'));
      }
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const row: string[] = [];
      let match;
      while ((match = regex.exec(line)) !== null && match[0] !== '') {
        let val = match[1] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        row.push(val.trim());
      }
      return row;
    };

    const headers = parseLine(lines[0]);
    setDetectedHeaders(headers);

    // Build auto-mapping
    const initialMapping: Record<string, string> = {};
    headers.forEach((h) => {
      const cleanH = h.toLowerCase().replace(/[^a-z0-9_أ-ي]/g, '');
      const match = currentConfig.fields.find(
        (f) =>
          f.key.toLowerCase() === cleanH ||
          f.labelAr.replace(/\s+/g, '') === cleanH ||
          cleanH.includes(f.key.toLowerCase()) ||
          f.key.toLowerCase().includes(cleanH)
      );
      if (match) {
        initialMapping[h] = match.key;
      } else {
        initialMapping[h] = h;
      }
    });
    setFieldMappings(initialMapping);

    // Parse Data Rows
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseLine(lines[i]);
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] ?? '';
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);
    setImportStatus('PARSED');
  };

  // Handle File Upload (CSV or JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          if (Array.isArray(json)) {
            setParsedRows(json);
            if (json.length > 0) {
              const keys = Object.keys(json[0]);
              setDetectedHeaders(keys);
              const map: Record<string, string> = {};
              keys.forEach((k) => (map[k] = k));
              setFieldMappings(map);
              setImportStatus('PARSED');
            }
          }
        } catch (err: any) {
          alert(isAr ? 'الملف بتنسيق JSON غير صالح.' : 'Invalid JSON file.');
        }
      } else {
        parseCSVText(content);
      }
    };
    reader.readAsText(file);
  };

  // Handle Pasted Text
  const handleParsePasted = () => {
    if (!rawText.trim()) {
      alert(isAr ? 'يرجى لصق بيانات نصية أو جدول إكسل أولاً.' : 'Please paste text or Excel data first.');
      return;
    }

    if (rawText.trim().startsWith('[') || rawText.trim().startsWith('{')) {
      try {
        const json = JSON.parse(rawText);
        const arr = Array.isArray(json) ? json : [json];
        setParsedRows(arr);
        if (arr.length > 0) {
          const keys = Object.keys(arr[0]);
          setDetectedHeaders(keys);
          const map: Record<string, string> = {};
          keys.forEach((k) => (map[k] = k));
          setFieldMappings(map);
          setImportStatus('PARSED');
        }
        return;
      } catch {}
    }

    parseCSVText(rawText);
  };

  // Commit and Save to Database
  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;

    try {
      let count = 0;
      parsedRows.forEach((row) => {
        const mappedRow: any = {};
        Object.entries(fieldMappings).forEach(([fileHeader, rawTargetKey]) => {
          const targetKey = String(rawTargetKey);
          if (targetKey && targetKey !== '_IGNORE_') {
            let val = row[fileHeader];
            // Format numeric values
            if (
              targetKey.includes('aed') ||
              targetKey.includes('fee') ||
              targetKey.includes('salary') ||
              targetKey.includes('amount')
            ) {
              val = Number(String(val).replace(/[^0-9.-]/g, '')) || 0;
            }
            mappedRow[targetKey] = val;
          }
        });

        // Insert to DB
        db.insert(targetEntity as any, mappedRow);
        count++;
      });

      setImportedCount(count);
      setImportStatus('SUCCESS');
      setStatusMessage(
        isAr
          ? `تم استيراد وحفظ (${count}) سجل بنجاح في جدول ${currentConfig.labelAr}!`
          : `Successfully imported and synced (${count}) records into ${currentConfig.labelEn}!`
      );

      if (onImportComplete) {
        onImportComplete(targetEntity, count);
      }
    } catch (e: any) {
      setImportStatus('ERROR');
      setStatusMessage(e.message);
    }
  };

  const handleReset = () => {
    setParsedRows([]);
    setDetectedHeaders([]);
    setFieldMappings({});
    setRawText('');
    setImportStatus('IDLE');
    setStatusMessage('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & INSTRUCTIONS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs shadow-emerald-200">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {isAr ? 'مركز استيراد البيانات الشامل (Multi-Source Data Import)' : 'Universal Multi-Source Data Import Hub'}
                </h2>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  CSV / Excel / JSON
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'استيراد العملاء، المعاملات، الموظفين، والمصروفات من ملفات CSV أو نسخ مباشر من جداول Excel و JSON.'
                  : 'Import CRM customers, service tasks, payroll, and vouchers from CSV files, Excel copy-paste, or JSON.'}
              </p>
            </div>
          </div>
        </div>

        {/* Template Downloads */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleDownloadSampleCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحميل نموذج CSV' : 'Sample CSV'}</span>
          </button>

          <button
            onClick={handleDownloadSampleJSON}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحميل نموذج JSON' : 'Sample JSON'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TARGET ENTITY SELECTOR CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(entityConfigs) as ImportTarget[]).map((key) => {
          const cfg = entityConfigs[key];
          const Icon = cfg.icon;
          const isSelected = targetEntity === key;

          return (
            <button
              key={key}
              onClick={() => {
                setTargetEntity(key);
                handleReset();
              }}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 scale-102'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-black block line-clamp-1">{isAr ? cfg.labelAr : cfg.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SOURCE INPUT METHOD TABS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800">
              {isAr ? `طريقة إدخال البيانات لـ: ${currentConfig.labelAr}` : `Select Data Source for: ${currentConfig.labelEn}`}
            </span>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSourceMode('FILE_UPLOAD')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                sourceMode === 'FILE_UPLOAD' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>{isAr ? 'رفع ملف CSV / Excel' : 'Upload File'}</span>
            </button>
            <button
              onClick={() => setSourceMode('PASTE_TEXT')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                sourceMode === 'PASTE_TEXT' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>{isAr ? 'نسخ ولصق مباشر' : 'Paste Raw Data'}</span>
            </button>
            <button
              onClick={() => setSourceMode('JSON_UPLOAD')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                sourceMode === 'JSON_UPLOAD' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{isAr ? 'ملف JSON' : 'JSON Import'}</span>
            </button>
          </div>
        </div>

        {/* INPUT MODE: FILE UPLOAD */}
        {sourceMode === 'FILE_UPLOAD' && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition group">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 group-hover:scale-110 flex items-center justify-center transition">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  {isAr ? 'انقر لاختيار ملف CSV أو اسحبه هنا' : 'Click to select or drag & drop CSV file'}
                </span>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  {isAr ? 'يدعم الملفات المفرقة بفواصل أو فواصل جدولية (Tab-delimited)' : 'Supports UTF-8 CSV with Arabic text'}
                </span>
              </div>
            </label>
          </div>
        )}

        {/* INPUT MODE: PASTE DIRECT TEXT / EXCEL */}
        {sourceMode === 'PASTE_TEXT' && (
          <div className="space-y-3">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                isAr
                  ? 'الصق هنا بياناتك من ملف Excel أو Google Sheets (العناوين في السطر الأول، والصفوف بعدها)...'
                  : 'Paste tabular data from Excel or Google Sheets here (Headers in first line, followed by rows)...'
              }
              rows={6}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end">
              <button
                onClick={handleParsePasted}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'معالجة ومطابقة البيانات' : 'Process & Match Data'}</span>
              </button>
            </div>
          </div>
        )}

        {/* INPUT MODE: JSON UPLOAD */}
        {sourceMode === 'JSON_UPLOAD' && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition group">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="json-file-input"
            />
            <label
              htmlFor="json-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 group-hover:scale-110 flex items-center justify-center transition">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  {isAr ? 'انقر لاختيار ملف JSON لمصفوفة البيانات' : 'Click to select JSON data array file'}
                </span>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  [ {`{ "name_ar": "...", ... }`} ]
                </span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MAPPING & LIVE PREVIEW TABLE */}
      {/* ------------------------------------------------------------- */}
      {importStatus === 'PARSED' && parsedRows.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>{isAr ? 'معاينة ومطابقة حقول البيانات قبل الاستيراد' : 'Field Mapping & Data Preview'}</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono">
                  {parsedRows.length} {isAr ? 'سجل جاهز' : 'records ready'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'تحقق من مطابقة أعمدة الملف مع حقول النظام، ثم اضغط حفظ لتحديث قاعدة البيانات.'
                  : 'Verify column mappings below, then confirm import to commit.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleCommitImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 transition active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? `تأكيد استيراد (${parsedRows.length}) سجل` : `Confirm Import (${parsedRows.length})`}</span>
              </button>
            </div>
          </div>

          {/* Field Mappings Header Row */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-700 block">
              {isAr ? 'مطابقة الأعمدة المكتشفة:' : 'Detected Column Mappings:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {detectedHeaders.map((header) => (
                <div key={header} className="p-2 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block truncate" title={header}>
                    {isAr ? 'عمود الملف:' : 'File Header:'} <b>{header}</b>
                  </span>
                  <select
                    value={fieldMappings[header] || ''}
                    onChange={(e) => setFieldMappings({ ...fieldMappings, [header]: e.target.value })}
                    className="w-full p-1.5 rounded border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-800"
                  >
                    <option value="_IGNORE_">{isAr ? '-- تجاهل هذا العمود --' : '-- Ignore column --'}</option>
                    {currentConfig.fields.map((f) => (
                      <option key={f.key} value={f.key}>
                        {isAr ? f.labelAr : f.labelEn} {f.required ? '*' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Live Data Preview Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-64">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="p-2.5">#</th>
                  {detectedHeaders.map((h) => (
                    <th key={h} className="p-2.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {parsedRows.slice(0, 8).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                    {detectedHeaders.map((h) => (
                      <td key={h} className="p-2.5 truncate max-w-[180px]">
                        {String(row[h] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 8 && (
            <p className="text-[11px] text-slate-400 text-center font-mono">
              + {parsedRows.length - 8} {isAr ? 'صفوف إضافية سيتم استيرادها بالكامل...' : 'more rows will be imported...'}
            </p>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. SUCCESS NOTIFICATION BANNER */}
      {/* ------------------------------------------------------------- */}
      {importStatus === 'SUCCESS' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block">{statusMessage}</span>
              <span className="text-[11px] text-emerald-700">
                {isAr ? 'تم تحديث الشاشات ولوحة المؤشرات فورياً.' : 'Views and analytics updated automatically.'}
              </span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
          >
            {isAr ? 'استيراد المزيد' : 'Import More'}
          </button>
        </div>
      )}
    </div>
  );
};
