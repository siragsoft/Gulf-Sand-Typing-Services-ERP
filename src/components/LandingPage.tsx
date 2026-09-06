import React, { useState, useMemo } from 'react';
import {
  Building2,
  Globe,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  Zap,
  Users,
  Award,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Crown,
  LogIn,
  Layers,
  Plane,
  Stamp,
  CreditCard,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Calendar,
  DollarSign,
  Car,
  Scale,
  Languages,
  Briefcase,
  Send,
  MessageCircle,
  ExternalLink,
  Sparkles,
  PhoneCall,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../i18n/translations';
import { db } from '../db/database';
import { GulfSandLogo } from './GulfSandLogo';
import { useBranding } from '../context/BrandingContext';

interface LandingPageProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenAuthModal: () => void;
  onNavigateToErp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  onToggleLang,
  onOpenAuthModal,
  onNavigateToErp,
}) => {
  const { currentUser } = useAuth();
  const { branding } = useBranding();
  const isAr = lang === 'ar';

  // -------------------------------------------------------------
  // Live Job Tracker State
  // -------------------------------------------------------------
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  // -------------------------------------------------------------
  // Services Category Filter State & Search
  // -------------------------------------------------------------
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [serviceSearch, setServiceSearch] = useState<string>('');

  // -------------------------------------------------------------
  // Contact Message / Lead Capture Form State
  // -------------------------------------------------------------
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactService, setContactService] = useState('المعاملات الحكومية والهوية');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // -------------------------------------------------------------
  // Comprehensive 10-Category Catalog
  // -------------------------------------------------------------
  const catalogCategories = useMemo(() => [
    {
      id: 'GOV_TRANSACTIONS',
      titleAr: 'المعاملات الحكومية',
      titleEn: 'Government Transactions',
      icon: Building2,
      color: 'from-blue-600 to-indigo-700',
      badgeAr: 'معتمد',
      badgeEn: 'Certified',
      descAr: 'إنجاز كافة معاملات الدوائر والمؤسسات الحكومية في العين وأبوظبي والإمارات.',
      descEn: 'ICP, Tasheel MOHRE, DED, Amer, Municipalities, and Health authorities.',
      services: [
        { nameAr: 'تجديد وإصدار بطاقة الهوية الإماراتية', nameEn: 'Emirates ID Issuance & Renewal', fee: '170 - 370 AED', time: '24 ساعة' },
        { nameAr: 'عقود العمل وتصاريح تسهيل (MOHRE)', nameEn: 'MOHRE Work Permits & Tasheel Contracts', fee: '150 - 650 AED', time: 'فوري' },
        { nameAr: 'الفحص الطبي للإقامة وهيئة الصحة', nameEn: 'Residency Medical Fitness Typing', fee: '260 - 360 AED', time: 'فوري' },
        { nameAr: 'معاملات بلديات أبوظبي وتوثيق العقود', nameEn: 'Tawtheeq & Abu Dhabi Municipality Services', fee: '120 - 250 AED', time: 'نفس اليوم' },
      ],
    },
    {
      id: 'PERSONAL_GOV',
      titleAr: 'الخدمات الشخصية والحكومية',
      titleEn: 'Personal & Government Services',
      icon: Users,
      color: 'from-teal-600 to-emerald-700',
      badgeAr: 'شامل',
      badgeEn: 'Full Support',
      descAr: 'تحديث السجلات، شهادات الاستمرارية، وتعديل بيانات الأحوال المدنية.',
      descEn: 'Civil registry updates, clearance certificates, and official affidavits.',
      services: [
        { nameAr: 'تحديث وتعديل بيانات السجل السكاني', nameEn: 'Population Registry & ICP Profile Update', fee: '80 - 150 AED', time: 'فوري' },
        { nameAr: 'استخراج شهادات براءة الذمة والاستمرارية', nameEn: 'Clearance & Continuity Certificates', fee: '100 - 200 AED', time: 'نفس اليوم' },
        { nameAr: 'الاستعلام وسداد المخالفات الرسمية', nameEn: 'Official Fines Inquiry & Clearance', fee: '50 - 100 AED', time: 'فوري' },
      ],
    },
    {
      id: 'RESIDENCE_VISAS',
      titleAr: 'خدمات الإقامة والتأشيرات',
      titleEn: 'Residence & Visa Services',
      icon: ShieldCheck,
      color: 'from-indigo-600 to-slate-900',
      badgeAr: 'الأكثر طلباً',
      badgeEn: 'Popular',
      descAr: 'إقامات العمل، العائلات، الإقامة الذهبية 10 سنوات، وتأشيرات الزيارة والسياحة.',
      descEn: 'Employment, family sponsorships, 10-year Golden Visas, and entry permits.',
      services: [
        { nameAr: 'الإقامة الذهبية 10 سنوات (مستثمرون / كفاءات)', nameEn: '10-Year Golden Visa Nomination & Processing', fee: 'حسب الفئة', time: '3 - 5 أيام' },
        { nameAr: 'إقامة العمل الجديدة وتجديد الإقامات', nameEn: 'New Work Visa & Residency Renewal', fee: '350 - 950 AED', time: '48 ساعة' },
        { nameAr: 'إقامة الأسرة والتابعين (الزوجة والأبناء)', nameEn: 'Family Residency Sponsorship', fee: '300 - 750 AED', time: '24 - 48 ساعة' },
        { nameAr: 'تأشيرات الزيارة والسياحة (30 / 60 يوماً)', nameEn: 'Tourist & Visit Entry Permits (30/60 Days)', fee: '320 - 550 AED', time: 'نفس اليوم' },
        { nameAr: 'تعديل الوضع الداخلي وتصاريح المغادرة', nameEn: 'In-Country Status Change & Exit Permits', fee: '650 - 1200 AED', time: 'فوري' },
      ],
    },
    {
      id: 'DOCS_ATTESTATION',
      titleAr: 'المستندات والتصديقات',
      titleEn: 'Documents & Attestation',
      icon: Stamp,
      color: 'from-amber-600 to-amber-800',
      badgeAr: 'رسمي',
      badgeEn: 'Official',
      descAr: 'تصديقات وزارة الخارجية والسفارات والقنصليات والشهادات الدراسية.',
      descEn: 'MOFA attestations, embassy verifications, academic apostille & legalizations.',
      services: [
        { nameAr: 'تصديق وزارة الخارجية الإماراتية (MOFA)', nameEn: 'MOFA UAE Official Attestation', fee: '160 - 250 AED', time: '24 ساعة' },
        { nameAr: 'تصديق السفارات والقنصليات المعتمدة', nameEn: 'Foreign Embassies & Consular Attestation', fee: 'حسب السفارة', time: '2 - 4 أيام' },
        { nameAr: 'تصديق الشهادات الجامعية وعقود الزواج', nameEn: 'Degree & Marriage Certificates Attestation', fee: '150 - 300 AED', time: 'نفس اليوم' },
      ],
    },
    {
      id: 'VEHICLE_SERVICES',
      titleAr: 'خدمات المركبات',
      titleEn: 'Vehicle Services',
      icon: Car,
      color: 'from-sky-600 to-blue-800',
      badgeAr: 'مرور أبوظبي',
      badgeEn: 'Abu Dhabi Traffic',
      descAr: 'تجديد الملكية، نقل الملكية، حجز المواعيد، وتأمين السيارات.',
      descEn: 'Vehicle registration renewal, transfer of ownership, fines & insurance.',
      services: [
        { nameAr: 'تجديد ملكية المركبة والفحص الفني', nameEn: 'Vehicle Mulkiya Registration Renewal', fee: '120 - 350 AED', time: 'فوري' },
        { nameAr: 'نقل ملكية المركبة ومبايعة السيارات', nameEn: 'Vehicle Ownership Transfer & Sale Contracts', fee: '150 - 250 AED', time: 'نفس اليوم' },
        { nameAr: 'إصدار وثائق التأمين وضبط المخالفات', nameEn: 'Vehicle Insurance & Traffic Clearance', fee: 'حسب الوثيقة', time: 'فوري' },
      ],
    },
    {
      id: 'LEGAL_JUDICIAL',
      titleAr: 'الخدمات القانونية والقضائية',
      titleEn: 'Legal & Judicial Services',
      icon: Scale,
      color: 'from-slate-700 to-slate-900',
      badgeAr: 'توثيق عدلي',
      badgeEn: 'Notary Public',
      descAr: 'شهادة حسن السيرة، صياغة الوكالات الرسمية، ومعاملات دوائر القضاء.',
      descEn: 'Police clearance certificates, power of attorney drafting & court portals.',
      services: [
        { nameAr: 'شهادة بحث الحالة الجنائية (حسن سيرة وسلوك)', nameEn: 'Police Clearance Certificate (Good Conduct)', fee: '120 - 180 AED', time: 'نفس اليوم' },
        { nameAr: 'صياغة وتوثيق الوكالات العدلية العامة والخاصة', nameEn: 'Power of Attorney (POA) Legal Drafting', fee: '200 - 450 AED', time: 'نفس اليوم' },
        { nameAr: 'تسجيل ومتابعة الطلبات القضائية والإنذارات', nameEn: 'Judicial Notices & Court Case Filings', fee: '150 - 350 AED', time: '24 ساعة' },
      ],
    },
    {
      id: 'TYPING_FORMS',
      titleAr: 'الطباعة والاستمارات',
      titleEn: 'Typing & Forms',
      icon: FileText,
      color: 'from-indigo-600 to-teal-700',
      badgeAr: 'سرعة ودقة',
      badgeEn: 'High Precision',
      descAr: 'طباعة كافة النماذج الرسمية، الخطابات الموجهة، والسير الذاتية.',
      descEn: 'Electronic government forms, formal address letters, and professional CVs.',
      services: [
        { nameAr: 'طباعة الاستمارات والنماذج الحكومية المعتمدة', nameEn: 'Official Government Application Forms', fee: '30 - 80 AED', time: 'فوري' },
        { nameAr: 'صياغة الخطابات والكتب الرسمية الموجهة', nameEn: 'Formal Corporate & Government Correspondence', fee: '50 - 120 AED', time: 'فوري' },
        { nameAr: 'إعداد وتصميم السير الذاتية الاحترافية (ATS)', nameEn: 'Professional Bilingual Resume / CV Design', fee: '75 - 150 AED', time: '24 ساعة' },
      ],
    },
    {
      id: 'TRANSLATION_DOCS',
      titleAr: 'الترجمة وإعداد الوثائق',
      titleEn: 'Translation & Document Preparation',
      icon: Languages,
      color: 'from-emerald-700 to-teal-900',
      badgeAr: 'معتمد قانونياً',
      badgeEn: 'Sworn Legal',
      descAr: 'ترجمة قانونية معتمدة لجميع اللغات، وملفات تأشيرات السفارات الدولية.',
      descEn: 'Certified legal translation (Arabic, English, French, etc.) & visa files.',
      services: [
        { nameAr: 'ترجمة قانونية معتمدة (عربي / إنجليزي / لغات)', nameEn: 'Certified Legal Translation for Ministries', fee: '60 - 120 AED / صفحة', time: 'نفس اليوم' },
        { nameAr: 'تجهيز ملفات تأشيرات شنغن وأمريكا وبريطانيا', nameEn: 'Schengen, UK & US Embassy Visa Dossiers', fee: '250 - 500 AED', time: '24 - 48 ساعة' },
        { nameAr: 'ترجمة التقارير الطبية والوثائق الرسمية', nameEn: 'Medical & Technical Reports Translation', fee: '70 - 130 AED / صفحة', time: 'نفس اليوم' },
      ],
    },
    {
      id: 'BUSINESS_CORPORATE',
      titleAr: 'خدمات الأعمال والشركات',
      titleEn: 'Business & Corporate Services',
      icon: Briefcase,
      color: 'from-amber-700 to-slate-900',
      badgeAr: 'تأسيس شركات',
      badgeEn: 'Corporate Desk',
      descAr: 'تأسيس الرخص التجارية DED، نظام حماية الأجور WPS، والإقرارات الضريبية.',
      descEn: 'Company formation, DED commercial licenses, WPS payroll & VAT compliance.',
      services: [
        { nameAr: 'تأسيس وتجديد الرخص التجارية (DED أبوظبي)', nameEn: 'Trade License Issuance & Renewal (Abu Dhabi DED)', fee: 'حسب النشاط', time: '24 - 48 ساعة' },
        { nameAr: 'صياغة عقود التأسيس وملاحق تعديل الشركاء', nameEn: 'Memorandum of Association (MOA) Amendments', fee: '350 - 850 AED', time: '24 ساعة' },
        { nameAr: 'نظام حماية الأجور (WPS) ومطابقة كشوف الرواتب', nameEn: 'Wages Protection System (WPS) File Processing', fee: '150 - 300 AED', time: 'فوري' },
        { nameAr: 'التسجيل الضريبي وتقديم إقرارات ضريبة VAT', nameEn: 'Corporate Tax & VAT Return Filings (FTA)', fee: '250 - 600 AED', time: 'نفس اليوم' },
      ],
    },
    {
      id: 'TRAVEL_SUPPORT',
      titleAr: 'خدمات السفر والدعم',
      titleEn: 'Travel & Support Services',
      icon: Plane,
      color: 'from-blue-700 to-sky-900',
      badgeAr: 'سياحة وجوازات',
      badgeEn: 'Travel & Consular',
      descAr: 'حجوزات الطيران والفنادق، التأمين الصحي والسياحي، ومعاملات القنصلية.',
      descEn: 'Flight bookings, hotel vouchers, travel insurance & Sudan Consular desk.',
      services: [
        { nameAr: 'إصدار وحجز تذاكر الطيران لجميع الوجهات', nameEn: 'Worldwide Airline Ticket Issuance & Rebooking', fee: 'أفضل سعر', time: 'فوري' },
        { nameAr: 'وثائق التأمين الصحي والسياحي الدولي', nameEn: 'International Travel & Medical Insurance Policies', fee: '90 - 220 AED', time: 'فوري' },
        { nameAr: 'معاملات القنصلية السودانية وتجديد الجوازات', nameEn: 'Sudan Consular Passports & Official Documents', fee: 'معتمد', time: 'مباشر' },
      ],
    },
  ], []);

  // Filtered categories
  const displayedCategories = useMemo(() => {
    return catalogCategories.filter((cat) => {
      const matchCat = activeCategory === 'ALL' || cat.id === activeCategory;
      if (!matchCat) return false;

      if (!serviceSearch.trim()) return true;
      const q = serviceSearch.toLowerCase();
      const matchTitle = cat.titleAr.toLowerCase().includes(q) || cat.titleEn.toLowerCase().includes(q) || cat.descAr.toLowerCase().includes(q);
      const matchServices = cat.services.some((s) => s.nameAr.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q));
      return matchTitle || matchServices;
    });
  }, [catalogCategories, activeCategory, serviceSearch]);

  // Handle Tracking Search
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackSearched(true);
    const transactions = db.getAll('transactions') as any[];
    const customers = db.getAll('customers') as any[];
    const query = trackQuery.trim().toLowerCase();

    const matchedTrx = transactions.find(
      (t) =>
        t.id?.toLowerCase() === query ||
        t.transaction_number?.toLowerCase() === query ||
        t.application_reference_no?.toLowerCase() === query
    );

    if (matchedTrx) {
      const cust = customers.find((c) => c.id === matchedTrx.customer_id);
      setTrackResult({
        ...matchedTrx,
        customer_name: cust ? (isAr ? cust.name_ar : cust.name_en) : matchedTrx.customer_name || 'عميل محترم',
      });
      return;
    }

    const matchedCust = customers.find(
      (c) =>
        c.phone?.toLowerCase().includes(query) ||
        c.emirates_id?.toLowerCase().includes(query) ||
        c.name_ar?.toLowerCase().includes(query) ||
        c.name_en?.toLowerCase().includes(query)
    );

    if (matchedCust) {
      const custTrx = transactions.filter((t) => t.customer_id === matchedCust.id);
      if (custTrx.length > 0) {
        setTrackResult({
          ...custTrx[0],
          customer_name: isAr ? matchedCust.name_ar : matchedCust.name_en,
        });
        return;
      }
    }

    setTrackResult(null);
  };

  // Handle Contact / Lead Submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    try {
      db.insert('crm_leads' as any, {
        name: contactName,
        phone: contactPhone,
        service_interest: contactService,
        notes: contactMessage,
        source: 'LANDING_PAGE_PORTAL',
        status: 'NEW',
      });
    } catch {
      // safe fallback
    }

    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP ANNOUNCEMENT / CONTACT STRIP */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0a192f] text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Working Hours & Address */}
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 text-amber-400">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isAr ? 'العين - العامرة شمال - مكتب رقم 2' : 'Al Ain - Al Amerah North - Office No. 2'}</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isAr ? 'السبت - الخميس: 8:00 ص - 10:00 م' : 'Sat - Thu: 08:00 AM - 10:00 PM'}</span>
            </span>
          </div>

          {/* Direct Phone & Language Support Badge */}
          <div className="flex items-center gap-3 text-[11px]">
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
              {isAr ? 'خدمة باللغتين العربية والإنجليزية' : 'Bilingual Support (AR / EN)'}
            </span>
            <a
              href="tel:+97137665400"
              className="flex items-center gap-1 text-slate-200 hover:text-amber-400 transition font-bold"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>+971 3 766 5400</span>
            </a>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN NAVIGATION HEADER */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <GulfSandLogo size="md" variant="horizontal" />
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
            <a href="#services" className="hover:text-amber-600 transition">
              {isAr ? 'دليل الخدمات' : 'Services Catalog'}
            </a>
            <a href="#how-it-works" className="hover:text-amber-600 transition">
              {isAr ? 'كيف نعمل' : 'How It Works'}
            </a>
            <a href="#tracker" className="hover:text-amber-600 transition flex items-center gap-1">
              <span>{isAr ? 'تتبع معاملة' : 'Track Request'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </a>
            <a href="#about" className="hover:text-amber-600 transition">
              {isAr ? 'عن المركز' : 'About Us'}
            </a>
            <a href="#contact" className="hover:text-amber-600 transition">
              {isAr ? 'تواصل معنا' : 'Contact'}
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* ERP / Role-Based Login */}
            {currentUser ? (
              <button
                id="nav-btn-open-erp"
                onClick={onNavigateToErp}
                className="px-4 py-2.5 rounded-xl bg-[#0a192f] hover:bg-slate-800 text-amber-400 text-xs font-bold flex items-center gap-2 border border-amber-500/40 shadow-sm active:scale-95 transition cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'دخول لوحة التحكم (ERP)' : 'ERP Dashboard'}</span>
              </button>
            ) : (
              <button
                id="nav-btn-login"
                onClick={onOpenAuthModal}
                className="px-4 py-2.5 rounded-xl bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'دخول النظام' : 'Staff / ERP Login'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 3. HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a192f] via-[#0f2444] to-[#0a192f] text-white py-16 sm:py-24 px-4 sm:px-6">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start rtl:lg:text-right">
            {/* Top Quality Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isAr
                  ? 'المركز الرائد في العين للطباعة وإنجاز المعاملات وتأسيس الأعمال'
                  : 'Premier Typing, Government & Corporate Support in Al Ain'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight sm:leading-tight">
              {isAr ? (
                <>
                  جميع معاملاتك وخدماتك <span className="text-amber-400">في مكان واحد</span>
                </>
              ) : (
                <>
                  All Your Services <span className="text-amber-400">in One Place</span>
                </>
              )}
            </h1>

            {/* Value Proposition */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {isAr
                ? 'خدمات جلف ساند للطباعة تقدم حلولاً متكاملة لمعاملات الهوية والإقامة، تصاريح العمل وتسهيل، تأسيس الشركات وتراخيص الدائرة الاقتصادية، الترجمة القانونية المعتمدة، تصديق المستندات، وحجوزات السفر والطيران بأعلى معايير السرعة والدقة.'
                : 'Gulf Sand Typing Services delivers comprehensive support for ICP Emirates ID & Visas, MOHRE Tasheel labor contracts, DED business licenses, certified legal translation, MOFA attestation, and flight bookings with unmatched speed and precision.'}
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                id="hero-btn-contact"
                href="#contact"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{isAr ? 'تواصل معنا الآن' : 'Contact Us'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </a>

              <a
                id="hero-btn-services"
                href="#services"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'استعراض الخدمات (10 فئات)' : 'View Services'}</span>
              </a>

              <a
                href="https://wa.me/971508821940"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">+15,000</div>
                <div className="text-[11px] text-slate-400 font-semibold">{isAr ? 'معاملة منجزة بنجاح' : 'Transactions Completed'}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">99.8%</div>
                <div className="text-[11px] text-slate-400 font-semibold">{isAr ? 'نسبة الدقة والاعتماد' : 'Accuracy Rate'}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-sky-400">+450</div>
                <div className="text-[11px] text-slate-400 font-semibold">{isAr ? 'شركة ومؤسسة مسجلة' : 'Corporate Clients'}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-300">10</div>
                <div className="text-[11px] text-slate-400 font-semibold">{isAr ? 'فئات خدمات متكاملة' : 'Service Categories'}</div>
              </div>
            </div>
          </div>

          {/* Hero Right Quick Job Tracker Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'متابعة وتتبع حالة المعاملة' : 'Live Request Tracker'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'أدخل رقم المعاملة أو رقم الهاتف لمعرفة حالة الإنجاز' : 'Enter transaction number or phone to check status'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleTrackSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder={isAr ? 'مثال: TRX-2026-001 أو 0508821940' : 'e.g. TRX-2026-001 or phone'}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="absolute end-1.5 top-1.5 bottom-1.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
                  >
                    {isAr ? 'استعلام' : 'Search'}
                  </button>
                </div>
              </form>

              {/* Tracking Result Display */}
              {trackSearched && (
                <div className="pt-2">
                  {trackResult ? (
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{trackResult.service_name || 'معاملة حكومية'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {trackResult.status || 'قيد الإجراء'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {isAr ? 'اسم العميل:' : 'Client:'} <span className="text-slate-200">{trackResult.customer_name}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono">
                        {isAr ? 'رقم المرجع:' : 'Ref:'} {trackResult.transaction_number || trackResult.id}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{isAr ? 'لم يتم العثور على معاملة مطابقة. يرجى مراجعة الرقم أو التواصل معنا.' : 'No matching record found.'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Super Admin Quick Sign-in Option */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{isAr ? 'موظف أو مدير؟' : 'Staff or Manager?'}</span>
                <button
                  onClick={onOpenAuthModal}
                  className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تسجيل الدخول للنظام' : 'Access Portal'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. ABOUT SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase">
              {isAr ? 'عن خدمات جلف ساند' : 'About Gulf Sand'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {isAr ? 'شريكك المعتمد والموثوق لكافة المعاملات في العين' : 'Your Trusted Government & Business Partner in Al Ain'}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {isAr
                ? 'مركز خدمات جلف ساند للطباعة في العين - العامرة شمال، يجمع بين الخبرة العميقة في الأنظمة الحكومية والسرعة الفائقة لتقديم تجربة إنجاز سلسة للأفراد والشركات ورواد الأعمال.'
                : 'Located at Al Ain - Al Amerah North (Office No. 2), Gulf Sand Typing Services combines in-depth knowledge of UAE governmental portals with high-velocity processing for individuals and corporations.'}
            </p>
          </div>

          {/* 4 Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Speed */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-amber-400 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'السرعة الفائقة' : 'High Velocity'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'إنجاز فوري لمعاملات الهوية، تصاريح العمل، وتعديل الوضع دون تأخير أو طوابير انتظار.'
                  : 'Instant submission for Emirates ID, labor contracts, and urgent visa changes.'}
              </p>
            </div>

            {/* Pillar 2: Accuracy */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'الدقة والاحترافية' : 'Accuracy & Compliance'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'تدقيق شامل لجميع المستندات قبل التقديم لتجنب الرفض أو الغرامات والتكاليف الإضافية.'
                  : 'Zero-defect document review preventing delays, rejections, or unexpected penalties.'}
              </p>
            </div>

            {/* Pillar 3: Application Follow-up */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'المتابعة المستمرة' : 'End-to-End Follow-up'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'تتبع حالة طلبك لحظة بلحظة مع إشعارات مباشرة حتى استلام المعاملة المنجزة.'
                  : 'Continuous tracking across government channels with real-time updates until delivery.'}
              </p>
            </div>

            {/* Pillar 4: Bilingual Support */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0a192f] text-amber-400 flex items-center justify-center font-bold">
                <Languages className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'الدعم الثنائي (عربي / إنجليزي)' : 'Bilingual Support'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'فريق متخصص يجيد اللغتين العربية والإنجليزية لخدمة كافة الجاليات والشركات في الدولة.'
                  : 'Dedicated multi-lingual specialists providing effortless communication for all nationalities.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. SERVICES SECTION (10 GROUPED CATEGORIES) */}
      {/* ------------------------------------------------------------- */}
      <section id="services" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-100/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase">
                {isAr ? 'دليل الخدمات الشامل' : 'Comprehensive Services'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {isAr ? '10 فئات خدمات رئيسية متكاملة' : '10 Comprehensive Service Categories'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {isAr
                  ? 'تصفح خدماتنا المصنفة بدقة مع الرسوم الحكومية ومواعيد الإنجاز المتوقعة'
                  : 'Explore categorized government, legal, typing, and corporate services'}
              </p>
            </div>

            {/* Search Input Filter */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder={isAr ? 'بحث في الخدمات...' : 'Search services...'}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 ps-9 pe-4 text-xs focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-[#0a192f] text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isAr ? 'جميع الخدمات (10 فئات)' : 'All Categories (10)'}
            </button>
            {catalogCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#0a192f] text-amber-400 shadow-sm border border-amber-500/40'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isAr ? cat.titleAr : cat.titleEn}
              </button>
            ))}
          </div>

          {/* Services Group Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCategories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-amber-400 transition-all p-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#0a192f] text-amber-400 flex items-center justify-center font-bold shrink-0">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full">
                        {isAr ? cat.badgeAr : cat.badgeEn}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {isAr ? cat.titleAr : cat.titleEn}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {isAr ? cat.descAr : cat.descEn}
                      </p>
                    </div>

                    {/* Services Sub-list */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {cat.services.map((srv, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{isAr ? srv.nameAr : srv.nameEn}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded shrink-0">
                            {srv.fee}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Action */}
                  <div className="pt-5 mt-4 border-t border-slate-100">
                    <a
                      href="#contact"
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#0a192f] hover:text-white text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>{isAr ? 'طلب هذه الخدمة الآن' : 'Request Service'}</span>
                      {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. HOW IT WORKS SECTION (5 STEPS) */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase">
              {isAr ? 'خطوات العمل السلسة' : 'Our Workflow'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {isAr ? 'كيف ننجز معاملتك في 5 خطوات واضحة' : 'How We Process Your Request in 5 Steps'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              {isAr
                ? 'إجراءات منظمة وموثقة تضمن سرعة التنفيذ ومطابقة الشروط الحكومية'
                : 'A structured, transparent pipeline ensuring rapid turnaround and zero delays'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                titleAr: 'تواصل معنا',
                titleEn: 'Contact Us',
                descAr: 'اتصل بنا، راسلنا عبر واتساب، أو شرفنا بزيارة المكتب في العامرة شمال.',
                descEn: 'Call, WhatsApp, or visit our Al Ain office.',
                icon: PhoneCall,
              },
              {
                step: '02',
                titleAr: 'مراجعة طلبك',
                titleEn: 'Review Your Request',
                descAr: 'فحص وتدقيق الأوراق الرسمية والتأكد من استيفاء كافة الشروط والرسوم.',
                descEn: 'Document verification & eligibility audit.',
                icon: ShieldCheck,
              },
              {
                step: '03',
                titleAr: 'تجهيز المعاملة',
                titleEn: 'Prepare Your Transaction',
                descAr: 'طباعة الاستمارات وإدخال البيانات في البوابات الحكومية المعتمدة فورياً.',
                descEn: 'Official portal typing & data entry.',
                icon: FileText,
              },
              {
                step: '04',
                titleAr: 'المتابعة والتنسيق',
                titleEn: 'Follow-up',
                descAr: 'متابعة مراحل الموافقة وتزويدك برقم المرجع والإشعارات المباشرة.',
                descEn: 'Continuous status updates & tracking.',
                icon: Clock,
              },
              {
                step: '05',
                titleAr: 'الإنجاز والتسليم',
                titleEn: 'Completion',
                descAr: 'استلام المعاملة المنجزة، التأشيرة، أو العقد موثقاً وجاهزاً للاستخدام.',
                descEn: 'Final delivery & certified handover.',
                icon: CheckCircle2,
              },
            ].map((st, idx) => {
              const StepIcon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-5 rounded-3xl bg-slate-50 border border-slate-200 relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-amber-400 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-amber-500 font-mono">{st.step}</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                      <StepIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isAr ? st.titleAr : st.titleEn}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {isAr ? st.descAr : st.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. CONTACT & STRONG FINAL CTA SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0a192f] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Official Contact Card & Location */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full uppercase">
                {isAr ? 'الموقع والتواصل' : 'Location & Contacts'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {isAr ? 'تواصل معنا أو شرفنا بالزيارة' : 'Visit Our Office or Call Today'}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {isAr
                  ? 'يسعدنا استقبالكم في مكتبنا الرئيسي في العين لتقديم كافة الاستشارات والخدمات الحكومية وتأسيس الأعمال.'
                  : 'We look forward to serving you at our main office in Al Ain for comprehensive governmental and business services.'}
              </p>
            </div>

            {/* Address & Hours Cards */}
            <div className="space-y-3">
              {/* Address */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{isAr ? 'العنوان الرسمي:' : 'Official Address:'}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">
                    {isAr ? branding.locationAr : branding.locationEn}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAr ? 'إمارة أبوظبي، دولة الإمارات العربية المتحدة' : 'Emirate of Abu Dhabi, UAE'}
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{isAr ? 'ساعات العمل وأيام الدوام:' : 'Working Hours & Schedule:'}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium leading-relaxed">
                    {isAr ? branding.operatingHoursAr : branding.operatingHoursEn}
                  </p>
                  <p className="text-[11px] text-rose-400 mt-1 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
                    <span>{isAr ? `العطلة الأسبوعية: ${branding.weeklyHolidayAr}` : `Weekly Holiday: ${branding.weeklyHolidayEn}`}</span>
                  </p>
                </div>
              </div>

              {/* Direct Phones & WhatsApp list */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={`tel:${branding.phone}`}
                    className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>{branding.phone}</span>
                  </a>

                  {branding.phoneSecondary && (
                    <a
                      href={`tel:${branding.phoneSecondary}`}
                      className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{branding.phoneSecondary}</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${branding.mobileWhatsApp.replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span>{isAr ? 'واتساب رئيسي' : 'Primary WhatsApp'}</span>
                  </a>

                  {branding.whatsappSecondary && (
                    <a
                      href={`https://wa.me/${branding.whatsappSecondary.replace(/\s+/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <MessageCircle className="w-4 h-4 text-slate-200" />
                      <span>{isAr ? 'واتساب ثنائي' : 'Secondary WhatsApp'}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive "Send Your Request Now" Form */}
          <div className="lg:col-span-6">
            <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 space-y-5">
              <div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                  {isAr ? 'طلب فوري ومباشر' : 'Instant Request'}
                </span>
                <h3 className="text-xl font-black text-[#0a192f] mt-1.5">
                  {isAr ? 'أرسل طلبك الآن' : 'Send Your Request Now'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'سيقوم مستشار المعاملات بالتواصل معك خلال دقائق لاستكمال طلبك'
                    : 'Our specialist will contact you within minutes to process your transaction'}
                </p>
              </div>

              {contactSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-950">
                    {isAr ? 'تم استلام طلبك بنجاح!' : 'Request Received Successfully!'}
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {isAr
                      ? 'شكراً لتواصلك مع خدمات جلف ساند للطباعة. تم فتح سجل متابعة وسيتصل بك أحد ممثلي الخدمة فوراً.'
                      : 'Thank you for reaching out to Gulf Sand Typing Services. Our representative will contact you shortly.'}
                  </p>
                  <button
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactName('');
                      setContactPhone('');
                      setContactMessage('');
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition"
                  >
                    {isAr ? 'إرسال طلب آخر' : 'Send Another Request'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={isAr ? 'مثال: محمد الشامسي' : 'e.g. John Doe'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="050 XXXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'نوع الخدمة المطلوبة' : 'Service Category'}
                    </label>
                    <select
                      value={contactService}
                      onChange={(e) => setContactService(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="المعاملات الحكومية والهوية">المعاملات الحكومية والهوية (Government & ICP)</option>
                      <option value="الإقامة والتأشيرات">الإقامة والتأشيرات (Residency & Visas)</option>
                      <option value="تأسيس الشركات وتراخيص DED">تأسيس الشركات وتراخيص DED (Corporate & Licenses)</option>
                      <option value="المستندات والتصديقات">المستندات والتصديقات (Attestations & MOFA)</option>
                      <option value="الترجمة القانونية المعتمدة">الترجمة القانونية المعتمدة (Legal Translation)</option>
                      <option value="خدمات السفر والطيران">خدمات السفر والطيران (Travel & Airline Tickets)</option>
                      <option value="خدمات المركبات والمرور">خدمات المركبات والمرور (Vehicle & Traffic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? 'تفاصيل المعاملة أو الاستفسار' : 'Additional Notes / Request Details'}
                    </label>
                    <textarea
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={isAr ? 'اكتب أي تفاصيل إضافية عن معاملتك...' : 'Any specific details...'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <button
                    id="btn-submit-contact-lead"
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#0a192f] hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 border border-amber-500/30 shadow-md active:scale-98 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isAr ? 'أرسل الطلب فورياً' : 'Submit Request'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 px-4 sm:px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand Info */}
            <div className="space-y-3 md:col-span-2">
              <GulfSandLogo size="md" variant="horizontal" theme="dark" />
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                {isAr
                  ? 'المركز المعتمد في العين لإنجاز كافة المعاملات الحكومية، الإقامات، تأسيس الشركات، الترجمة القانونية، والتصديقات الرسمية وحجوزات السفر.'
                  : 'Certified typing & government services center in Al Ain. Handling visas, trade licenses, legal translation, and travel.'}
              </p>
              <div className="text-[11px] text-slate-500">
                {isAr ? 'العين - العامرة شمال - مكتب رقم 2' : 'Al Ain - Al Amerah North - Office No. 2'}
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {isAr ? 'روابط سريعة' : 'Quick Links'}
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#services" className="hover:text-amber-400 transition">{isAr ? 'دليل الخدمات' : 'Services Catalog'}</a></li>
                <li><a href="#how-it-works" className="hover:text-amber-400 transition">{isAr ? 'كيف نعمل' : 'How It Works'}</a></li>
                <li><a href="#tracker" className="hover:text-amber-400 transition">{isAr ? 'تتبع معاملة' : 'Track Job'}</a></li>
                <li><a href="#contact" className="hover:text-amber-400 transition">{isAr ? 'تواصل معنا' : 'Contact'}</a></li>
              </ul>
            </div>

            {/* Col 3: Portal Access */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {isAr ? 'بوابة الموظفين والإدارة' : 'Staff Portal'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'تسجيل الدخول إلى نظام إدارة العمليات والرقابة (ERP).' : 'Log in to the operating system.'}
              </p>
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isAr ? 'دخول النظام' : 'Staff Login'}</span>
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} {isAr ? `${branding.companyNameAr || 'جلف ساند للطباعة والخدمات'}. جميع الحقوق محفوظة.` : `${branding.companyNameEn || 'GULFSAND TYPING SERVICES'}. All rights reserved.`}
            </div>
            <div className="flex items-center gap-4">
              <span>{isAr ? 'الخصوصية والأمان' : 'Privacy & Security'}</span>
              <span>•</span>
              <span>{isAr ? 'شروط الخدمة' : 'Terms of Service'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
