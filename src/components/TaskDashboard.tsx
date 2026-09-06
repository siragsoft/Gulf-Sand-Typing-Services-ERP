/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { db } from '../db/database';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Phone,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Check,
  Play,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface TaskDashboardProps {
  lang: Language;
  onNavigateTab: (tab: any) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const TaskDashboard: React.FC<TaskDashboardProps> = ({
  lang,
  onNavigateTab,
  showToast,
}) => {
  const isAr = lang === 'ar';
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load bookings and active tasks/transactions from database
  const [bookings, setBookings] = useState<any[]>(() => db.getAll('bookings') || []);
  const [transactions, setTransactions] = useState<any[]>(() => db.getAll('transactions') || []);

  const refreshData = () => {
    setBookings(db.getAll('bookings') || []);
    setTransactions(db.getAll('transactions') || []);
  };

  // Combine and normalize into scannable operational task items
  const tasksList = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      clientName: string;
      phone: string;
      serviceName: string;
      status: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      date: string;
      type: 'BOOKING' | 'TRANSACTION';
      raw: any;
    }> = [];

    bookings.forEach((b) => {
      list.push({
        id: `booking-${b.id}`,
        title: b.service_name || 'حجز خدمة حكومية',
        clientName: b.customer_name || 'عميل جلف ساند',
        phone: b.customer_phone || b.phone || '-',
        serviceName: b.service_name || 'معاملة',
        status: b.status || 'قيد الانتظار',
        priority: b.status === 'عاجل' || b.is_urgent ? 'HIGH' : 'MEDIUM',
        date: b.booking_date || b.created_at?.slice(0, 10) || 'اليوم',
        type: 'BOOKING',
        raw: b,
      });
    });

    transactions.forEach((tx) => {
      const isUrgent = tx.priority === 'عاجل' || tx.status === 'معلق' || tx.status === 'متأخرة';
      list.push({
        id: `tx-${tx.id}`,
        title: tx.transaction_number || tx.service_type || 'معاملة قيد التنفيذ',
        clientName: tx.customer_name || 'عميل محترم',
        phone: tx.customer_phone || '-',
        serviceName: tx.service_type || 'خدمة طباعة وتصديق',
        status: tx.status || 'قيد الإجراء',
        priority: isUrgent ? 'HIGH' : 'MEDIUM',
        date: tx.created_at?.slice(0, 10) || 'اليوم',
        type: 'TRANSACTION',
        raw: tx,
      });
    });

    return list;
  }, [bookings, transactions]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasksList.filter((task) => {
      // Priority filter
      if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false;
      // Status filter
      if (filterStatus !== 'ALL' && !task.status.includes(filterStatus)) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q) || task.clientName.toLowerCase().includes(q) || task.serviceName.toLowerCase().includes(q) || task.phone.toLowerCase().includes(q);
        if (!matchTitle) return false;
      }
      return true;
    });
  }, [tasksList, filterPriority, filterStatus, searchQuery]);

  const handleUpdateTaskStatus = (task: any, newStatus: string) => {
    try {
      if (task.type === 'BOOKING') {
        db.update('bookings', task.raw.id, { status: newStatus });
      } else {
        db.update('transactions', task.raw.id, { status: newStatus });
      }
      refreshData();
      showToast(isAr ? 'تم تحديث حالة المهمة بنجاح' : 'Task status updated successfully', 'success');
    } catch {
      showToast(isAr ? 'تعذر تحديث المهمة' : 'Failed to update task', 'error');
    }
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a192f] via-[#0f2444] to-[#0a192f] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 end-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'لوحة المهام والحجوزات التشغيلية' : 'Operational Tasks & Bookings Dashboard'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {isAr ? 'إدارة المهام والحجوزات الفورية' : 'Task & Booking Center'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {isAr
                ? 'عرض وتنسيق الحجوزات النشطة ومعاملات العملاء بأسلوب بطاقات سريعة وسهلة للمتابعة.'
                : 'Scannable, touch-friendly card layout for active bookings and administrative tasks.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700 px-4 py-3 rounded-2xl text-center">
              <div className="text-xl font-black text-amber-400">{tasksList.length}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{isAr ? 'إجمالي المهام النشطة' : 'Total Active Tasks'}</div>
            </div>
            <button
              onClick={() => {
                refreshData();
                showToast(isAr ? 'تم تحديث البيانات بنجاح' : 'Data refreshed', 'success');
              }}
              className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>{isAr ? 'تحديث القائمة' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span>{isAr ? 'التصنيف:' : 'Filter:'}</span>
          </span>
          <button
            onClick={() => setFilterPriority('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterPriority === 'ALL' ? 'bg-[#0a192f] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setFilterPriority('HIGH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterPriority === 'HIGH' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            {isAr ? 'عالي الأهمية / عاجل' : 'High Priority'}
          </button>
          <button
            onClick={() => setFilterStatus('قيد')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'قيد' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {isAr ? 'قيد التنفيذ' : 'In Progress'}
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، الخدمة أو الهاتف...' : 'Search by client, service...'}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 ps-9 pe-4 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {isAr ? 'لا توجد مهام مطابقة للبحث' : 'No matching tasks found'}
          </h3>
          <p className="text-xs text-slate-500">
            {isAr ? 'جميع الحجوزات والمعاملات منجزة أو غير مطابقة للفلاتر الحالية.' : 'All bookings and operational tasks are completed.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-3xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                task.priority === 'HIGH' ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                {/* Card Top Row */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      task.type === 'BOOKING'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {task.type === 'BOOKING' ? (isAr ? 'حجز موعد' : 'Booking') : (isAr ? 'معاملة تشغيلية' : 'Transaction')}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      task.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {task.priority === 'HIGH' ? (isAr ? 'عاجل' : 'High') : (isAr ? 'معتاد' : 'Normal')}
                  </span>
                </div>

                {/* Title & Service */}
                <div>
                  <h3 className="text-sm font-black text-slate-900">{task.title}</h3>
                  <p className="text-xs text-amber-700 font-semibold mt-0.5">{task.serviceName}</p>
                </div>

                {/* Client Info */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{task.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span dir="ltr">{task.phone}</span>
                  </div>
                </div>
              </div>

              {/* Status & Quick Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {task.status}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateTaskStatus(task, 'قيد التنفيذ')}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition cursor-pointer"
                    title={isAr ? 'تعيين قيد التنفيذ' : 'Set In Progress'}
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleUpdateTaskStatus(task, 'منجز')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إنجاز' : 'Complete'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
