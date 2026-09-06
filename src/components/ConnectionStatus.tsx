/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Language } from '../i18n/translations';

interface ConnectionStatusProps {
  lang: Language;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [status, setStatus] = useState<'CONNECTED' | 'RECONNECTING' | 'OFFLINE'>('CONNECTED');

  useEffect(() => {
    const handleOnline = () => setStatus('CONNECTED');
    const handleOffline = () => setStatus('OFFLINE');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic heartbeat check against backend
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setStatus('CONNECTED');
        } else {
          setStatus('RECONNECTING');
        }
      } catch {
        setStatus('OFFLINE');
      }
    }, 20000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const statusConfig = {
    CONNECTED: {
      labelAr: 'متصل بالخادم',
      labelEn: 'Connected',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Wifi,
    },
    RECONNECTING: {
      labelAr: 'جاري إعادة الاتصال',
      labelEn: 'Reconnecting',
      color: 'bg-amber-500 animate-pulse',
      textColor: 'text-amber-800 bg-amber-50 border-amber-200',
      icon: RefreshCw,
    },
    OFFLINE: {
      labelAr: 'غير متصل',
      labelEn: 'Offline',
      color: 'bg-rose-500',
      textColor: 'text-rose-800 bg-rose-50 border-rose-200',
      icon: WifiOff,
    },
  };

  const current = statusConfig[status];
  const IconComp = current.icon;

  return (
    <div
      className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold ${current.textColor}`}
      dir={isAr ? 'rtl' : 'ltr'}
      title={isAr ? 'حالة الاتصال بخدمات Google Workspace والخادم' : 'Backend & Google Workspace Connection Status'}
    >
      <span className={`w-2 h-2 rounded-full ${current.color}`} />
      <IconComp className={`w-3.5 h-3.5 ${status === 'RECONNECTING' ? 'animate-spin' : ''}`} />
      <span>{isAr ? current.labelAr : current.labelEn}</span>
    </div>
  );
};
