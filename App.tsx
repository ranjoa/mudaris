
import React, { useState, useEffect } from 'react';
import { AppMode, Language, User, ReportItem } from './types';
import StudentView from './components/StudentView';
import ParentView from './components/ParentView';
import LoginView from './components/LoginView';

const App: React.FC = () => {
  const [user, setUser] = useState<(User & { interest?: string }) | null>(() => {
    const saved = localStorage.getItem('mudarris_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [mode, setMode] = useState<AppMode>('student');
  const [lang, setLang] = useState<Language>('ar');
  const [timer, setTimer] = useState(0);
  const [reports, setReports] = useState<ReportItem[]>([
    {
      id: '1',
      titleEn: 'Math Session',
      titleAr: 'جلسة الرياضيات',
      status: 'completed',
      icon: '📐',
      summaryEn: 'Excellent focus today on algebraic patterns.',
      summaryAr: 'تركيز ممتاز اليوم في درس الأنماط الجبرية.',
    }
  ]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('mudarris_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mudarris_user');
    }
  }, [user]);

  useEffect(() => {
    let interval: any;
    if (user && mode === 'student') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [user, mode]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeSwitch = (target: AppMode) => {
    if (target === 'parent' && mode !== 'parent') {
      setIsAuthenticating(true);
    } else {
      setMode(target);
    }
  };

  const verifyPassword = () => {
    if (passwordInput === '1234') {
      setMode('parent');
      setIsAuthenticating(false);
      setPasswordInput('');
    } else {
      alert(lang === 'ar' ? 'كلمة المرور غير صحيحة' : 'Incorrect Password');
    }
  };

  const handleLogout = () => {
    if (window.confirm(lang === 'ar' ? 'هل تريدين تسجيل الخروج؟' : 'Do you want to logout?')) {
      setUser(null);
    }
  };

  if (!user) {
    return (
      <LoginView 
        onLogin={(u) => setUser({...u, name: u.name || 'مستخدم'})} 
        lang={lang} 
        toggleLanguage={() => setLang(l => l === 'ar' ? 'en' : 'ar')} 
      />
    );
  }

  const isRtl = lang === 'ar';

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto bg-white shadow-2xl relative transition-all overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Header Section - Strictly 24px margins */}
      <div className={`px-6 pt-12 pb-6 text-white transition-all duration-500 ${mode === 'parent' ? 'bg-saudi-gold' : 'bg-mudarris-blue'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="relative shrink-0">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center font-bold border border-white/20 text-lg shadow-sm backdrop-blur-md">👤</div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </button>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">{isRtl ? 'طالب ذكي' : 'Smart Student'}</p>
              <h1 className="text-base font-extrabold truncate max-w-[140px] leading-tight">{user.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-black/10 rounded-lg text-xs font-bold border border-white/10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              <span className="font-mono">{formatTime(timer)}</span>
            </div>
            <button 
              onClick={() => handleModeSwitch(mode === 'student' ? 'parent' : 'student')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                mode === 'parent' ? 'bg-white text-saudi-gold' : 'bg-saudi-gold text-white'
              }`}
            >
              {mode === 'student' ? (isRtl ? 'بوابة الأهل' : 'Parent Gate') : (isRtl ? 'وضع الدراسة' : 'Study Mode')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {mode === 'student' ? (
          <StudentView 
            lang={lang} 
            initialInterest={user.interest}
            onReportGenerated={(r) => setReports(prev => [{...r, id: Date.now().toString()}, ...prev])} 
          />
        ) : (
          <ParentView lang={lang} reports={reports} userName={user.name} />
        )}
      </div>

      {/* Modern Bottom Tab Bar */}
      <div className="bg-white border-t border-gray-100 grid grid-cols-2 gap-0 pt-3 pb-8 px-6">
        <button onClick={() => handleModeSwitch('student')} className={`flex flex-col items-center gap-1.5 transition-colors ${mode === 'student' ? 'text-mudarris-blue' : 'text-gray-400'}`}>
          <div className={`w-12 h-10 rounded-lg flex items-center justify-center transition-all ${mode === 'student' ? 'bg-mudarris-blue/10' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">{isRtl ? 'المُدرّس' : 'Tutor'}</span>
        </button>
        <button onClick={() => handleModeSwitch('parent')} className={`flex flex-col items-center gap-1.5 transition-colors ${mode === 'parent' ? 'text-saudi-gold' : 'text-gray-400'}`}>
          <div className={`w-12 h-10 rounded-lg flex items-center justify-center transition-all ${mode === 'parent' ? 'bg-saudi-gold/10' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">{isRtl ? 'التقارير' : 'Reports'}</span>
        </button>
      </div>

      {/* Secure Gate UI Refined */}
      {isAuthenticating && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-lg z-50 flex items-center justify-center p-6 animate-pop">
          <div className="bg-white w-full rounded-2xl p-8 shadow-2xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-saudi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">{isRtl ? 'بوابة الأمان' : 'Security Gate'}</h3>
              <p className="text-gray-500 text-sm mt-2">{isRtl ? 'الرجاء إدخال رمز المرور للمتابعة' : 'Enter parent password to continue'}</p>
            </div>
            <input 
              type="password" 
              autoFocus
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-lg p-4 text-center text-3xl tracking-widest mb-6 focus:border-saudi-gold outline-none font-bold"
              placeholder="••••"
            />
            <div className="flex gap-4">
              <button onClick={() => setIsAuthenticating(false)} className="flex-1 py-4 bg-gray-100 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors">{isRtl ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={verifyPassword} className="flex-1 py-4 bg-saudi-gold text-white rounded-lg font-bold shadow-sm hover:brightness-105 transition-all">{isRtl ? 'دخول' : 'Enter'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
