/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { Language } from '../i18n/translations';

interface ToastNotificationProps {
  message: { text: string; type: 'success' | 'error' | 'info' } | null;
  onClose: () => void;
  lang: Language;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  onClose,
  lang,
}) => {
  if (!message) return null;
  const isAr = lang === 'ar';

  const bgColors = {
    success: 'bg-[#0a192f] text-white border-amber-500/40 shadow-xl',
    error: 'bg-rose-950 text-rose-100 border-rose-800/60 shadow-xl',
    info: 'bg-slate-900 text-slate-100 border-slate-700 shadow-xl',
  };

  const IconComp = message.type === 'success' ? CheckCircle2 : message.type === 'error' ? AlertCircle : Info;
  const iconColor = message.type === 'success' ? 'text-amber-400' : message.type === 'error' ? 'text-rose-400' : 'text-sky-400';

  return (
    <div
      className="fixed bottom-6 end-6 z-50 animate-bounce-short"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${bgColors[message.type]} max-w-md`}>
        <div className={`shrink-0 ${iconColor}`}>
          <IconComp className="w-5 h-5" />
        </div>
        <div className="text-xs font-bold leading-snug flex-1">
          {message.text}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
