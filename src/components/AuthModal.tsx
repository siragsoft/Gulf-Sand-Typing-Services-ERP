/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Crown,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  LogIn,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext';
import { Language } from '../i18n/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccessRedirectToErp?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSuccessRedirectToErp,
}) => {
  const { login, currentUser, isAuthenticated } = useAuth();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState(SUPER_ADMIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Message feedback
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setFeedback({ 
        text: isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password', 
        type: 'error' 
      });
      return;
    }
    
    setIsLoading(true);
    setFeedback(null);
    
    const res = await login(loginEmail.trim(), loginPassword);
    setIsLoading(false);
    
    if (res.success) {
      setFeedback({ text: res.message_ar || res.message || '', type: 'success' });
      setTimeout(() => {
        onClose();
        if (onSuccessRedirectToErp) onSuccessRedirectToErp();
      }, 400);
    } else {
      setFeedback({ text: res.message_ar || res.message || '', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 transform transition-all animate-in fade-in zoom-in-95 duration-200"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 rtl:left-auto rtl:right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                {isAr ? 'بوابة التحقق الآمنة' : 'Secure Enterprise Auth'}
              </span>
              <h2 className="text-base font-black text-white mt-1">
                {isAr ? 'تسجيل الدخول إلى نظام ERP' : 'Gulf Sand ERP Login'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            {isAr
              ? 'يرجى إدخال بيانات اعتمادك المعتمدة للوصول إلى لوحة التحكم والعمليات.'
              : 'Enter your verified enterprise credentials to access the ERP operations.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {feedback && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {isAuthenticated && currentUser ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{currentUser.fullNameAr || currentUser.email}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSuccessRedirectToErp) onSuccessRedirectToErp();
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all"
              >
                {isAr ? 'الانتقال إلى نظام ERP' : 'Proceed to ERP'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'البريد الإلكتروني المهني' : 'Work Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@gulfsandtyping.ae"
                    className="w-full pr-10 pl-3 rtl:pr-10 rtl:pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pr-10 pl-3 rtl:pr-10 rtl:pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{isAr ? 'تسجيل الدخول الآمن' : 'Secure Login'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
