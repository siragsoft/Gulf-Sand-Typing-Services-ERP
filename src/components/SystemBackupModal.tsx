/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db } from '../db/database';
import {
  Download,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  Database,
  Lock,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface SystemBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  embedded?: boolean;
}

export const SystemBackupModal: React.FC<SystemBackupModalProps> = ({
  isOpen,
  onClose,
  lang,
  showToast,
  embedded = false,
}) => {
  const isAr = lang === 'ar';
  const [confirmed, setConfirmed] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExecuteBackup = () => {
    if (!confirmed) return;
    setBackingUp(true);

    setTimeout(() => {
      try {
        const json = db.exportDatabaseJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gulfsand_erp_full_system_backup_${new Date().toISOString().replace(/:/g, '-')}.json`;
        a.click();

        setBackingUp(false);
        setBackupSuccess(true);
        showToast(isAr ? 'تم إنشاء النسخة الاحتياطية الشاملة وتنزيلها بنجاح' : 'Full system backup created successfully', 'success');
      } catch {
        setBackingUp(false);
        showToast(isAr ? 'فشل إنشاء النسخة الاحتياطية' : 'Failed to create backup', 'error');
      }
    }, 800);
  };

  const modalBody = (
    <div className={`bg-white w-full ${embedded ? 'max-w-2xl mx-auto my-2 shadow-sm' : 'max-w-lg shadow-2xl'} rounded-3xl overflow-hidden border border-slate-200`}>
      {/* Modal Header */}
      <div className="p-6 bg-[#0a192f] text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'نسخة احتياطية شاملة للنظام' : 'Full System Backup'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Admin Only
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isAr ? 'تصدير كافة السجلات، التكوينات، المعاملات، وقواعد البيانات' : 'Export all records, configurations & transactions'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>{isAr ? 'رجوع / إغلاق' : 'Back / Close'}</span>
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6 space-y-6">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>{isAr ? 'صلاحية المدير الأعلى (System Admin)' : 'Authorized Admin Privilege'}</span>
          </div>
          <p className="leading-relaxed text-amber-800">
            {isAr
              ? 'تحتوي النسخة الاحتياطية على كافة تفاصيل النظام، السجلات المالية، حسابات العملاء، الموظفين، وسجلات الأمان (Audit Logs). يُرجى الاحتفاظ بالملف في مكان آمن ومشفر.'
              : 'This backup contains all system records, financial transactions, customer profiles, HR data, and security audit logs. Keep this file secure.'}
          </p>
        </div>

        {backupSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-emerald-900">
              {isAr ? 'تمت عملية النسخ الاحتياطي بنجاح!' : 'Backup Completed Successfully!'}
            </h3>
            <p className="text-xs text-emerald-700">
              {isAr ? 'تم تنزيل ملف النسخة الاحتياطية الشاملة إلى جهازك.' : 'The system state backup file has been downloaded.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {isAr ? 'إغلاق النافذة' : 'Close'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded mt-0.5 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-slate-800 leading-relaxed">
                {isAr
                  ? 'أؤكد بصفتي مديراً للنظام رغبتي في إنشاء وتنزيل نسخة احتياطية شاملة لجميع بيانات وقواعد بيانات جلف ساند ERP.'
                  : 'I confirm as System Administrator that I want to generate and download a complete system state backup.'}
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleExecuteBackup}
                disabled={!confirmed || backingUp}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <Download className={`w-4 h-4 ${backingUp ? 'animate-bounce' : ''}`} />
                <span>{backingUp ? (isAr ? 'جاري التصدير...' : 'Exporting...') : (isAr ? 'بدء النسخ الاحتياطي الشامل' : 'Start Full Backup')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div id="system-backup-canvas-view" className="w-full pb-8" dir={isAr ? 'rtl' : 'ltr'}>
        {modalBody}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      {modalBody}
    </div>
  );
};
