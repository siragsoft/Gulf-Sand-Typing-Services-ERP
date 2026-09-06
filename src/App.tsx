/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BrandingProvider } from './context/BrandingContext';
import { LandingPage } from './components/LandingPage';
import { Phase1Explorer } from './components/Phase1Explorer';
import { LoginScreen } from './components/LoginScreen';
import { PasswordResetView } from './components/PasswordResetView';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Language } from './i18n/translations';

// PrivateRoute Guard Component
interface PrivateRouteProps {
  children: ReactNode;
  fallback: ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 font-sans" dir="rtl">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
        <div className="text-sm font-semibold text-amber-300">التحقق من جلسة المصادقة والأمان...</div>
        <div className="text-xs text-slate-500 mt-1">Gulf Sand ERP Authentication Guard</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'LANDING' | 'LOGIN' | 'ERP'>('LANDING');
  const [lang, setLang] = useState<Language>('ar');
  const { isAuthenticated, isLoading, currentUser, mustChangePasswordModal, setMustChangePasswordModal } = useAuth();

  // Handle Token URL state (for Password Reset & Account Activation)
  const [tokenInfo, setTokenInfo] = useState<{ token: string; type: 'reset' | 'activate' } | null>(null);

  // Sync token from URL query or hash on mount or change
  useEffect(() => {
    const parseUrlToken = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const fullQuery = `${search}&${hash.replace(/^#/, '')}`;

      const params = new URLSearchParams(fullQuery.replace(/^\?/, ''));
      const token = params.get('token');
      const isActivation = window.location.pathname.includes('activate') || hash.includes('activate');

      if (token) {
        setTokenInfo({
          token,
          type: isActivation ? 'activate' : 'reset',
        });
      }
    };

    parseUrlToken();
    window.addEventListener('hashchange', parseUrlToken);
    return () => window.removeEventListener('hashchange', parseUrlToken);
  }, []);

  // Sync html dir and lang
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // If user opened a token link (reset/activation)
  if (tokenInfo) {
    return (
      <PasswordResetView
        token={tokenInfo.token}
        type={tokenInfo.type}
        onBackToLogin={() => {
          setTokenInfo(null);
          window.location.hash = '';
          setCurrentView('LOGIN');
        }}
      />
    );
  }

  // If loading session from backend
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 font-sans" dir="rtl">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
        <div className="text-sm font-semibold text-amber-300">التحقق من جلسة المصادقة والأمان...</div>
        <div className="text-xs text-slate-500 mt-1">Gulf Sand ERP Enterprise Security</div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'LANDING' ? (
        <LandingPage
          lang={lang}
          onToggleLang={toggleLanguage}
          onOpenAuthModal={() => {
            if (isAuthenticated) {
              setCurrentView('ERP');
            } else {
              setCurrentView('LOGIN');
            }
          }}
          onNavigateToErp={() => {
            if (isAuthenticated) {
              setCurrentView('ERP');
            } else {
              setCurrentView('LOGIN');
            }
          }}
        />
      ) : (
        <PrivateRoute
          fallback={
            <LoginScreen
              onNavigateToLanding={() => setCurrentView('LANDING')}
              onOpenResetWithToken={(token, type) => {
                setTokenInfo({ token, type });
              }}
            />
          }
        >
          <Phase1Explorer
            onNavigateToLanding={() => setCurrentView('LANDING')}
            onOpenAuthModal={() => {}}
          />

          {/* Mandatory First-Login Password Change Modal */}
          {mustChangePasswordModal && (
            <ChangePasswordModal
              isOpen={true}
              isMandatoryFirstLogin={true}
              onClose={() => setMustChangePasswordModal(false)}
            />
          )}
        </PrivateRoute>
      )}
    </>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled app error caught in boundary:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-200" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-2xl font-bold mb-4">
            !
          </div>
          <h2 className="text-xl font-bold text-white mb-2">حدث خطأ أثناء تحميل الواجهة</h2>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            تم تسجيل الخطأ الداخلي. يمكنك إعادة تحميل الصفحة للعودة إلى نظام جلف ساند.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
          >
            إعادة تحميل التطبيق
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrandingProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrandingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
