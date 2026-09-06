import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Building,
  Sparkles,
  Layers,
  MapPin,
  Send,
  X,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../db';
import { UserRole, BookingStatus, ServiceCategory } from '../types/schema';
import { generateBookingVoucherPDF } from '../utils/pdfGenerator';
import { browserNotificationService } from '../utils/browserNotifications';

interface ServiceBookingProps {
  currentRole: UserRole;
  lang?: 'ar' | 'en';
  onNavigateToCustomer?: (customerId: string) => void;
  onOpenNewTransactionForCustomer?: (customerId: string, customerName: string) => void;
}

const COUNTERS = [
  { id: 'C1', nameAr: 'كاونتر 1: الهوية والجوازات (ICP)', nameEn: 'Counter 1: ICP & Emirates ID', category: 'RESIDENCY_VISIT', color: 'indigo' },
  { id: 'C2', nameAr: 'كاونتر 2: تسهيل ووزارة العمل', nameEn: 'Counter 2: Tasheel & MOHRE', category: 'RESIDENCY_VISIT', color: 'emerald' },
  { id: 'C3', nameAr: 'كاونتر 3: الرخص التجارية (DED)', nameEn: 'Counter 3: DED Trade Licensing', category: 'BUSINESS_COMPANIES', color: 'amber' },
  { id: 'C4', nameAr: 'كاونتر 4: شؤون القنصلية السودانية', nameEn: 'Counter 4: Sudan Consular Services', category: 'SUDAN_SERVICES', color: 'cyan' },
  { id: 'C5', nameAr: 'كاونتر 5: الترجمة القانونية والتصديقات', nameEn: 'Counter 5: Legal Translation', category: 'LEGAL_TRANSLATION', color: 'purple' },
];

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '04:00 PM', '04:30 PM', '05:00 PM',
  '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM',
  '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM',
];

const SERVICE_PRESETS = [
  { id: 'SRV-001', nameAr: 'إصدار / تجديد هوية إماراتية (ICP)', nameEn: 'Emirates ID Issuance & Renewal', category: 'ICP', duration: '20 دقيقة', fee: 350 },
  { id: 'SRV-002', nameAr: 'تجديد إقامة وتصريح عمل (تسهيل)', nameEn: 'Residency & Work Permit Renewal', category: 'MOHRE', duration: '30 دقيقة', fee: 650 },
  { id: 'SRV-003', nameAr: 'فحص طبي للإقامة (صحة)', nameEn: 'Medical Fitness Screening', category: 'MEDICAL', duration: '15 دقيقة', fee: 290 },
  { id: 'SRV-004', nameAr: 'تأسيس / تجديد رخصة تجارية (DED)', nameEn: 'DED Trade License Renewal', category: 'DED', duration: '45 دقيقة', fee: 1800 },
  { id: 'SRV-005', nameAr: 'معاملات الجواز والقنصلية السودانية', nameEn: 'Sudan Passport & Consular Attestation', category: 'CONSULAR', duration: '25 دقيقة', fee: 400 },
  { id: 'SRV-006', nameAr: 'ترجمة قانونية وتصديق خارجية', nameEn: 'Legal Translation & MOFA Attestation', category: 'TRANSLATION', duration: '30 دقيقة', fee: 250 },
  { id: 'SRV-007', nameAr: 'حجز طيران وسياحة وعمرة', nameEn: 'Airline Booking & Umrah Visa', category: 'TRAVEL', duration: '25 دقيقة', fee: 1200 },
];

export const ServiceBooking: React.FC<ServiceBookingProps> = ({
  currentRole,
  lang = 'ar',
  onNavigateToCustomer,
  onOpenNewTransactionForCustomer,
}) => {
  const isAr = lang === 'ar';

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const [viewMode, setViewMode] = useState<'GRID' | 'AGENDA'>('GRID');
  const [selectedCounterFilter, setSelectedCounterFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Live database records
  const [bookingsList, setBookingsList] = useState<any[]>(() => db.getAll('bookings'));
  const [customersList, setCustomersList] = useState<any[]>(() => db.getAll('customers'));

  // Modals & Details
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any | null>(null);

  // New Booking Form fields
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formEmiratesId, setFormEmiratesId] = useState('');
  const [formServiceId, setFormServiceId] = useState(SERVICE_PRESETS[0].id);
  const [formCounterId, setFormCounterId] = useState('C1');
  const [formTimeSlot, setFormTimeSlot] = useState(TIME_SLOTS[4]); // 10:00 AM
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<BookingStatus>(BookingStatus.CONFIRMED);

  // Sync DB subscriptions
  useEffect(() => {
    const unsub = db.subscribe('bookings', () => {
      setBookingsList(db.getAll('bookings'));
    });
    const unsubCust = db.subscribe('customers', () => {
      setCustomersList(db.getAll('customers'));
    });
    return () => {
      unsub();
      unsubCust();
    };
  }, []);

  // Format date helper
  const dateFormatted = useMemo(() => {
    try {
      const d = new Date(selectedDate);
      return d.toLocaleDateString(isAr ? 'ar-AE' : 'en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate, isAr]);

  // Navigate Date
  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  // Filtered bookings for active date
  const dateBookings = useMemo(() => {
    return bookingsList.filter((b) => {
      const bDate = b.travel_date_departure || b.booking_date || b.created_at?.slice(0, 10);
      const matchDate = bDate === selectedDate || (!bDate && selectedDate === '2026-08-15');
      if (!matchDate) return false;

      if (selectedCounterFilter !== 'ALL') {
        const counterMatch = (b.counter_id || b.counter_number || '').toLowerCase().includes(selectedCounterFilter.toLowerCase());
        if (!counterMatch) return false;
      }

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const cust = (b.customer_name_ar || b.customer_name || '').toLowerCase();
        const code = (b.booking_code || b.id || '').toLowerCase();
        const phone = (b.customer_phone || '').toLowerCase();
        const srv = (b.booking_type || b.service_name || '').toLowerCase();
        return cust.includes(q) || code.includes(q) || phone.includes(q) || srv.includes(q);
      }

      return true;
    });
  }, [bookingsList, selectedDate, selectedCounterFilter, searchFilter]);

  // Quick Open Slot to Book
  const handleOpenSlotToBook = (counterId: string, timeSlot: string) => {
    setFormCounterId(counterId);
    setFormTimeSlot(timeSlot);
    setFormCustomerId('');
    setFormCustomerName('');
    setFormCustomerPhone('');
    setFormEmiratesId('');
    setFormNotes('');
    setIsNewBookingModalOpen(true);
  };

  // Select existing customer
  const handleSelectCustomer = (customerId: string) => {
    setFormCustomerId(customerId);
    const found = customersList.find((c) => c.id === customerId);
    if (found) {
      setFormCustomerName(found.name_ar || found.name_en || '');
      setFormCustomerPhone(found.phone || '');
      setFormEmiratesId(found.emirates_id || '');
    }
  };

  // Submit Booking
  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim() && !formCustomerId) {
      alert(isAr ? 'يرجى إدخال اسم العميل أو اختياره من القائمة' : 'Please enter customer name');
      return;
    }

    const selectedService = SERVICE_PRESETS.find((s) => s.id === formServiceId) || SERVICE_PRESETS[0];
    const selectedCounter = COUNTERS.find((c) => c.id === formCounterId) || COUNTERS[0];

    const bookingId = db.generateId('bookings');
    const newRecord = {
      id: bookingId,
      booking_code: bookingId,
      created_at: new Date().toISOString(),
      status: formStatus,
      booking_type: selectedService.nameAr,
      service_name: selectedService.nameAr,
      service_id: selectedService.id,
      customer_id: formCustomerId || 'CUS-WALKIN',
      customer_name_ar: formCustomerName,
      customer_phone: formCustomerPhone,
      emirates_id: formEmiratesId,
      counter_id: selectedCounter.id,
      counter_number: isAr ? selectedCounter.nameAr : selectedCounter.nameEn,
      booking_date: selectedDate,
      travel_date_departure: selectedDate,
      time_slot: formTimeSlot,
      selling_price_aed: selectedService.fee,
      notes: formNotes,
    };

    db.insert('bookings', newRecord);

    // Trigger Browser Notification
    browserNotificationService.notifyBookingConfirmed(
      bookingId,
      formCustomerName,
      selectedService.nameAr,
      `${selectedDate} @ ${formTimeSlot}`
    );

    setIsNewBookingModalOpen(false);
  };

  // Update Status
  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
    db.update('bookings', bookingId, {
      status: newStatus,
    });
    if (selectedBookingForDetails && selectedBookingForDetails.id === bookingId) {
      setSelectedBookingForDetails((prev: any) => ({ ...prev, status: newStatus }));
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const totalToday = dateBookings.length;
    const confirmed = dateBookings.filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.ISSUED).length;
    const inProgress = dateBookings.filter((b) => b.status === 'قيد الإنجاز' || b.status === 'IN_PROGRESS').length;
    const completed = dateBookings.filter((b) => b.status === BookingStatus.COMPLETED || b.status === 'مكتمل').length;
    const totalPossibleSlots = COUNTERS.length * TIME_SLOTS.length;
    const occupancyRate = Math.round((totalToday / totalPossibleSlots) * 100);

    return {
      totalToday,
      confirmed,
      inProgress,
      completed,
      occupancyRate,
    };
  }, [dateBookings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ----------------- Top Header & Controls ----------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isAr ? 'جدولة مواعيد خدمات الطباعة والترجمة' : 'Typing Services Booking & Appointments'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {isAr ? 'مباشر وتفاعلي' : 'Live Scheduler'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isAr
                ? 'إدارة حجوزات المراجعين، تخصيص كاونترات الطباعة، وطباعة بطاقات الموعد الرسمية'
                : 'Manage walk-in and booked appointments across typing counters with instant PDF vouchers'}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'GRID'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {isAr ? 'مخطط الكاونترات (Grid)' : 'Counters Grid'}
              </button>
              <button
                onClick={() => setViewMode('AGENDA')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'AGENDA'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {isAr ? 'جدول المواعيد اليومي' : 'Daily Agenda'}
              </button>
            </div>

            {/* Book Slot Button */}
            <button
              onClick={() => {
                setFormCustomerId('');
                setFormCustomerName('');
                setFormCustomerPhone('');
                setFormEmiratesId('');
                setFormNotes('');
                setIsNewBookingModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'حجز موعد مراجع جديد' : 'New Appointment'}</span>
            </button>
          </div>
        </div>

        {/* Date Selector Banner & Quick Stats */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Interactive Date Navigator */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full md:w-auto">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition text-slate-600 dark:text-slate-300"
              title={isAr ? 'اليوم السابق' : 'Previous Day'}
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>

            <div className="flex items-center gap-2 px-3">
              <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              />
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">({dateFormatted})</span>
            </div>

            <button
              onClick={() => handleShiftDate(1)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition text-slate-600 dark:text-slate-300"
              title={isAr ? 'اليوم التالي' : 'Next Day'}
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
              className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-2xs border border-slate-200 dark:border-slate-600"
            >
              {isAr ? 'اليوم' : 'Today'}
            </button>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto">
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-center shrink-0">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{isAr ? 'حجوزات اليوم' : 'Total Today'}</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{stats.totalToday}</span>
            </div>
            <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-center shrink-0">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block">{isAr ? 'مؤكد' : 'Confirmed'}</span>
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">{stats.confirmed}</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-center shrink-0">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">{isAr ? 'مكتمل' : 'Completed'}</span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">{stats.completed}</span>
            </div>
            <div className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-center shrink-0">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 block">{isAr ? 'نسبة الإشغال' : 'Occupancy'}</span>
              <span className="text-xs font-black text-purple-700 dark:text-purple-300">{stats.occupancyRate}%</span>
            </div>
          </div>
        </div>

        {/* Counter Filter Pills */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold text-[11px] shrink-0">{isAr ? 'كاونتر الطباعة:' : 'Filter Counter:'}</span>
          <button
            onClick={() => setSelectedCounterFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 transition ${
              selectedCounterFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'كافة الكاونترات' : 'All Counters'}
          </button>
          {COUNTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCounterFilter(c.id)}
              className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 transition ${
                selectedCounterFilter === c.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {isAr ? c.nameAr : c.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* ----------------- View Mode 1: Interactive Counters Grid ----------------- */}
      {viewMode === 'GRID' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header Row: Counters */}
              <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 font-bold text-xs">
                <div className="text-slate-400 p-2 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                {COUNTERS.map((counter) => (
                  <div
                    key={counter.id}
                    className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center"
                  >
                    <span className="text-slate-900 dark:text-white font-bold block truncate">
                      {isAr ? counter.nameAr : counter.nameEn}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-normal">
                      {counter.category}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grid Time Slots Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {TIME_SLOTS.map((slot) => (
                  <div key={slot} className="grid grid-cols-[100px_repeat(5,1fr)] gap-2 py-2 items-center">
                    {/* Time Label */}
                    <div className="text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {slot}
                    </div>

                    {/* Counters Slots */}
                    {COUNTERS.map((counter) => {
                      // Find if this counter has a booking in this time slot on the selected date
                      const booking = dateBookings.find((b) => {
                        const matchCounter = (b.counter_id === counter.id) || (b.counter_number && b.counter_number.includes(counter.id));
                        const matchSlot = b.time_slot === slot;
                        return matchCounter && matchSlot;
                      });

                      if (booking) {
                        const isCompleted = booking.status === BookingStatus.COMPLETED || booking.status === 'مكتمل';
                        const isConfirmed = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.ISSUED;

                        return (
                          <div
                            key={counter.id}
                            onClick={() => setSelectedBookingForDetails(booking)}
                            className={`p-2 rounded-xl border transition cursor-pointer group shadow-2xs ${
                              isCompleted
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                : isConfirmed
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 hover:border-indigo-400'
                                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="truncate">{booking.customer_name_ar || booking.customer_name || 'راجع الكاونتر'}</span>
                              <span className="text-[9px] font-mono opacity-70">
                                {booking.booking_code || booking.id?.slice(-5)}
                              </span>
                            </div>
                            <div className="text-[10px] opacity-80 truncate mt-0.5">
                              {booking.service_name || booking.booking_type || 'خدمة طباعة'}
                            </div>
                          </div>
                        );
                      }

                      // Empty Slot - Click to book
                      return (
                        <button
                          key={counter.id}
                          onClick={() => handleOpenSlotToBook(counter.id, slot)}
                          className="h-11 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-300 dark:text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-center gap-1 text-[11px] font-medium group"
                        >
                          <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                          <span className="opacity-0 group-hover:opacity-100 transition text-[10px]">
                            {isAr ? 'حجز الموعد' : 'Book'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- View Mode 2: Daily Agenda List ----------------- */}
      {viewMode === 'AGENDA' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAr ? `قائمة المواعيد لـ (${dateFormatted})` : `Appointments List for (${dateFormatted})`}
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              {dateBookings.length} {isAr ? 'موعد مسجل' : 'bookings recorded'}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-3"># {isAr ? 'كود الحجز' : 'Booking Code'}</th>
                  <th className="p-3">{isAr ? 'الوقت' : 'Time Slot'}</th>
                  <th className="p-3">{isAr ? 'المراجع / العميل' : 'Customer'}</th>
                  <th className="p-3">{isAr ? 'الخدمة المطلوبة' : 'Service'}</th>
                  <th className="p-3">{isAr ? 'الكاونتر المخصص' : 'Counter'}</th>
                  <th className="p-3">{isAr ? 'الرسوم التقديرية' : 'Fee AED'}</th>
                  <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-3 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dateBookings.length > 0 ? (
                  dateBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {b.booking_code || b.id}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {b.time_slot || '10:00 AM'}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div>{b.customer_name_ar || b.customer_name || 'مراجع عام'}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{b.customer_phone || '-'}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                        {b.service_name || b.booking_type || 'خدمة طباعة'}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold">
                        {b.counter_number || 'كاونتر 1'}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {(Number(b.selling_price_aed) || 350).toFixed(2)} AED
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === BookingStatus.COMPLETED || b.status === 'مكتمل'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.ISSUED
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {b.status || 'مؤكد'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedBookingForDetails(b)}
                            className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg transition"
                            title={isAr ? 'عرض التفاصيل' : 'View Details'}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => generateBookingVoucherPDF({ booking: b, lang: lang === 'en' ? 'en' : 'ar' })}
                            className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg transition"
                            title={isAr ? 'طباعة بطاقة الموعد PDF' : 'Download PDF Voucher'}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">
                      {isAr ? 'لا توجد حجوزات مسجلة في هذا اليوم' : 'No bookings found for this day'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- Modal: New Appointment Booking ----------------- */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAr ? 'حجز موعد مراجع جديد لخدمات الطباعة' : 'Book New Service Appointment'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4 text-xs">
              {/* Customer Selector / Walk-in input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'اختيار عميل مسجل أو إدخال مراجع جديد' : 'Select Registered Customer or Walk-in'}
                </label>
                <select
                  value={formCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{isAr ? '-- مراجع جديد (Walk-in) --' : '-- New Walk-in Customer --'}</option>
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_ar || c.name_en} ({c.phone || c.emirates_id || c.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{isAr ? 'اسم المراجع' : 'Customer Name'} *</label>
                  <input
                    type="text"
                    required
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    placeholder={isAr ? 'مثال: محمد أحمد العوضي' : 'e.g. Mohammed Ahmed'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{isAr ? 'رقم الهاتف' : 'Phone'} *</label>
                  <input
                    type="tel"
                    required
                    value={formCustomerPhone}
                    onChange={(e) => setFormCustomerPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Emirates ID */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">{isAr ? 'رقم الهوية الإماراتية (اختياري)' : 'Emirates ID (Optional)'}</label>
                <input
                  type="text"
                  value={formEmiratesId}
                  onChange={(e) => setFormEmiratesId(e.target.value)}
                  placeholder="784-1990-1234567-1"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Service Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">{isAr ? 'نوع الخدمة المطلوبة' : 'Service Type'}</label>
                <select
                  value={formServiceId}
                  onChange={(e) => setFormServiceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SERVICE_PRESETS.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {isAr ? srv.nameAr : srv.nameEn} - ({srv.fee} AED / {srv.duration})
                    </option>
                  ))}
                </select>
              </div>

              {/* Counter & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{isAr ? 'الكاونتر المخصص' : 'Counter'}</label>
                  <select
                    value={formCounterId}
                    onChange={(e) => setFormCounterId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {COUNTERS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.nameAr : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">{isAr ? 'الوقت المحجوز' : 'Time Slot'}</label>
                  <select
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">{isAr ? 'ملاحظات ومتطلبات خاصة' : 'Notes'}</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={isAr ? 'مثال: يرجى إحضار الجواز الأصلي وصورة شخصية بخلفية بيضاء' : 'e.g. Bring original passport and photos'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-xl font-bold transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'تأكيد الحجز وطباعة الإيصال' : 'Confirm & Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- Modal: Booking Details & Action Card ----------------- */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isAr ? 'تفاصيل موعد خدمة الطباعة' : 'Appointment Details'}
                  </h3>
                  <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    {selectedBookingForDetails.booking_code || selectedBookingForDetails.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'اسم المراجع:' : 'Customer:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBookingForDetails.customer_name_ar || selectedBookingForDetails.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'رقم الهاتف:' : 'Phone:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBookingForDetails.customer_phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'الخدمة المطلوبة:' : 'Service:'}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedBookingForDetails.service_name || selectedBookingForDetails.booking_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'الكاونتر المخصص:' : 'Assigned Counter:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBookingForDetails.counter_number || 'كاونتر 1'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'التاريخ والوقت:' : 'Date & Time:'}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedBookingForDetails.booking_date || selectedBookingForDetails.travel_date_departure || selectedDate} @ {selectedBookingForDetails.time_slot || '10:00 AM'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'حالة الموعد:' : 'Status:'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {selectedBookingForDetails.status || 'مؤكد'}
                </span>
              </div>
              {selectedBookingForDetails.notes && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-1">{isAr ? 'ملاحظات:' : 'Notes:'}</span>
                  <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedBookingForDetails.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Status Update Actions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isAr ? 'تحديث موقف المراجع في الصالة:' : 'Update Visitor Status:'}
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBookingForDetails.id, BookingStatus.CONFIRMED)}
                  className={`p-2 rounded-xl font-bold transition border ${
                    selectedBookingForDetails.status === BookingStatus.CONFIRMED
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isAr ? 'مؤكد / في الانتظار' : 'Waiting'}
                </button>
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBookingForDetails.id, 'قيد الإنجاز' as any)}
                  className={`p-2 rounded-xl font-bold transition border ${
                    selectedBookingForDetails.status === 'قيد الإنجاز'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isAr ? 'جاري الطباعة' : 'In Service'}
                </button>
                <button
                  onClick={() => handleUpdateBookingStatus(selectedBookingForDetails.id, BookingStatus.COMPLETED)}
                  className={`p-2 rounded-xl font-bold transition border ${
                    selectedBookingForDetails.status === BookingStatus.COMPLETED
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isAr ? 'تم الإنجاز بنجاح' : 'Completed'}
                </button>
              </div>
            </div>

            {/* Actions: Print PDF Voucher & Open Transaction */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => generateBookingVoucherPDF({ booking: selectedBookingForDetails, lang: lang === 'en' ? 'en' : 'ar' })}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة بطاقة الموعد PDF' : 'PDF Voucher'}</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenNewTransactionForCustomer) {
                    onOpenNewTransactionForCustomer(
                      selectedBookingForDetails.customer_id,
                      selectedBookingForDetails.customer_name_ar || selectedBookingForDetails.customer_name
                    );
                    setSelectedBookingForDetails(null);
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'فتح معاملة طباعة فورية' : 'Start Transaction'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
