/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  FileText,
  Building2
} from 'lucide-react';
import { Language } from '../i18n/translations';
import { db } from '../db/database';

interface AiInsightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentRole: string;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  embedded?: boolean;
}

export const AiInsightsDrawer: React.FC<AiInsightsDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  currentRole,
  showToast,
  embedded = false,
}) => {
  const isAr = lang === 'ar';
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: isAr
        ? 'مرحباً! أنا المساعد الذكي لنظام جلف ساند ERP. كيف يمكنني مساعدتك في تحليل المعاملات، ملخصات الأداء، أو استفسارات العملاء اليوم؟'
        : 'Hello! I am your Gulf Sand ERP AI Assistant. How can I assist you with operational analytics or summaries today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const handleSendQuery = async (customPrompt?: string) => {
    const queryToSend = customPrompt || prompt;
    if (!queryToSend.trim() || loading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: queryToSend, time: userTime }]);
    if (!customPrompt) setPrompt('');
    setLoading(true);

    try {
      // Gather minimal payload from ERP context (never full database dump)
      const stats = db.getStats();
      const minimalPayload = {
        stats,
        role: currentRole,
        recentTransactions: (db.getAll('transactions') || []).slice(0, 5),
      };

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'dashboard_summaries',
          minimal_payload: minimalPayload,
          user_prompt: queryToSend,
          model_type: 'FLASH', // low cost fast flash model
        }),
      });

      const data = await res.json();
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (data.success && data.result) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.result, time: aiTime }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: isAr
              ? (data.message_ar || 'عذراً، حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي.')
              : (data.message_en || 'AI response error.'),
            time: aiTime,
          },
        ]);
      }
    } catch {
      const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: isAr ? 'تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.' : 'Network error connecting to AI service.',
          time: errTime,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const modalBody = (
    <div className={`w-full ${embedded ? 'max-w-3xl mx-auto rounded-3xl overflow-hidden border border-slate-200 shadow-sm min-h-[600px] my-2' : 'max-w-md h-full shadow-2xl border-s border-slate-200'} bg-white flex flex-col justify-between`}>
      {/* Drawer Header */}
      <div className="p-5 bg-[#0a192f] text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'رؤى الذكاء الاصطناعي' : 'AI Insights Assistant'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Gemini Flash
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isAr ? 'جلف ساند ERP - مساعد ذكي مباشر' : 'Gulf Sand ERP Intelligent Support'}
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

      {/* Quick Suggestion Pills */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => handleSendQuery(isAr ? 'قدم لي ملخصاً تشغيلياً لأداء اليوم' : 'Provide today operational summary')}
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-700 text-xs font-bold whitespace-nowrap shadow-2xs transition cursor-pointer"
        >
          📊 {isAr ? 'ملخص أداء اليوم' : 'Daily Summary'}
        </button>
        <button
          onClick={() => handleSendQuery(isAr ? 'ما هي المعاملات التي تتطلب متابعة عاجلة؟' : 'What transactions need urgent follow-up?')}
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-700 text-xs font-bold whitespace-nowrap shadow-2xs transition cursor-pointer"
        >
          ⚡ {isAr ? 'المعاملات العاجلة' : 'Urgent Tasks'}
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 min-h-[350px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-[#0a192f] text-amber-400'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#0a192f] text-white rounded-se-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-ss-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div
                className={`text-[9px] mt-1.5 font-mono ${
                  msg.sender === 'user' ? 'text-slate-300 text-end' : 'text-slate-400'
                }`}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0a192f] text-amber-400 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>{isAr ? 'جاري تحليل البيانات وإعداد الرد...' : 'Analyzing context and generating insights...'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isAr ? 'اسأل المساعد الذكي عن المعاملات والتقارير...' : 'Ask AI about transactions, reports...'}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center transition cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-[10px] text-slate-400 text-center mt-2">
          {isAr ? 'محمي بواسطة بروتوكولات الأمان وحوكمة الذكاء الاصطناعي لـ ERP' : 'Protected by ERP AI Governance Protocols'}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div id="ai-insights-canvas-view" className="w-full pb-8" dir={isAr ? 'rtl' : 'ltr'}>
        {modalBody}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      {modalBody}
    </div>
  );
};
