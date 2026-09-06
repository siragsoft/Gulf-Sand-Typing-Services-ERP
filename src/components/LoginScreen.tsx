import React, { useState } from 'react';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext';
import { GulfSandLogo } from './GulfSandLogo';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  KeyRound,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';

interface LoginScreenProps {
  onOpenResetWithToken?: (token: string, type: 'reset' | 'activate') => void;
  onNavigateToLanding?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onOpenResetWithToken, onNavigateToLanding }) => {
  const { login, forgotPassword, sessionExpired, sessionExpiredMessage, clearSessionExpired } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
  const [previewResetUrl, setPreviewResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    clearSessionExpired();

    if (!email.trim()) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني.');
      return;
    }
    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message_ar || 'بيانات الدخول غير صحيحة');
      if (res.locked) {
        setIsLocked(true);
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    setPreviewResetUrl(null);
    const res = await forgotPassword(forgotEmail.trim());
    setForgotLoading(false);
    setForgotSuccessMessage(res.message_ar);
    if (res.previewResetUrl) {
      setPreviewResetUrl(res.previewResetUrl);
    }
  };

  const fillSuperAdminCredentials = () => {
    setEmail(SUPER_ADMIN_EMAIL);
    setPassword('zain12345');
    setErrorMessage('');
  };

  const fillStaffCredentials = () => {
    setEmail('manager@gulfsandtyping.ae');
    setPassword('Staff#2026!Gulf');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-slate-100" dir="rtl">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Back to Landing Page Button */}
        {onNavigateToLanding && (
          <div className="mb-4 flex justify-between items-center">
            <button
              type="button"
              onClick={onNavigateToLanding}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-0 rotate-180 text-amber-400" />
              <span>العودة إلى الصفحة الرئيسية للزوار</span>
            </button>
            <span className="text-[11px] text-slate-500 font-medium">مركز جلف ساند</span>
          </div>
        )}

        {/* Header Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-3">
            <GulfSandLogo size="lg" variant="stacked" theme="dark" />
          </div>
          <p className="text-xs text-amber-400 font-semibold mt-1">
            Gulf Sand ERP • بوابة تسجيل الدخول الموحدة
          </p>
        </div>

        {/* Session Expired Alert */}
        {sessionExpired && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-3 animate-fadeIn">
            <Clock className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-300">تنبيه انتهاء الجلسة</div>
              <div>{sessionExpiredMessage || 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى.'}</div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-300">خطأ في تسجيل الدخول</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-200">تسجيل الدخول</h2>
              <p className="text-xs text-slate-400">يرجى إدخال بيانات اعتمادك المعتمدة</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>اتصال آمن ومشفّر</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="login-email">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gulfsandtyping.ae"
                  dir="ltr"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-all text-left"
                  disabled={loading || isLocked}
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300" htmlFor="login-password">
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotSuccessMessage('');
                    setPreviewResetUrl(null);
                    setForgotEmail(email);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  dir="ltr"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-all text-left"
                  disabled={loading || isLocked}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading || isLocked}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري التحقق والمصادقة...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Secure System Access */}
          <div className="mt-6 pt-4 border-t border-slate-800/20 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              بوابة الدخول الرسمية لموظفي جلف ساند للطباعة والخدمات
            </span>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>محمي بواسطة خوارزميات التشفير PBKDF2 وSHA-512 وجلسات HttpOnly الآمنة</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">استعادة كلمة المرور</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm px-2 py-1"
              >
                إغلاق
              </button>
            </div>

            {forgotSuccessMessage ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-emerald-300">تم استلام الطلب بنجاح</div>
                    <div className="mt-1">{forgotSuccessMessage}</div>
                  </div>
                </div>

                {previewResetUrl && onOpenResetWithToken && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>رابط إعادة التعيين التجريبي المولد:</span>
                    </div>
                    <p className="text-slate-400 mb-2">
                      تم إنشاء رمز آمن لمرة واحدة صالح لمدة 60 دقيقة. يمكنك النقر للاختبار المباشر:
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(false);
                        const token = previewResetUrl.split('token=')[1];
                        if (token) onOpenResetWithToken(token, 'reset');
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>فتح شاشة تعديل كلمة المرور الآن</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  أدخل بريدك الإلكتروني المسجل في النظام، وسيقوم النظام بإنشاء رابط آمن لمرة واحدة لتعديل كلمة المرور.
                </p>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="forgot-email">
                    البريد الإلكتروني
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@gulfsandtyping.ae"
                    dir="ltr"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-left"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    {forgotLoading ? 'جاري الإرسال...' : 'إرسال الرابط'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
