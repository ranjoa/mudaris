
import React, { useState } from 'react';
import { Language, User } from '../types';

interface Props {
  onLogin: (user: User & { interest?: string }) => void;
  lang: Language;
  toggleLanguage: () => void;
}

const LoginView: React.FC<Props> = ({ onLogin, lang, toggleLanguage }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const isRtl = lang === 'ar';

  const interests = [
    { id: 'math', icon: '📐', labelAr: 'الرياضيات', labelEn: 'Math', descAr: 'لنتحدى الأرقام والذكاء', descEn: 'Challenge numbers & logic' },
    { id: 'science', icon: '🧪', labelAr: 'العلوم', labelEn: 'Science', descAr: 'اكتشفي أسرار الكون', descEn: 'Discover universe secrets' },
    { id: 'arabic', icon: '📖', labelAr: 'لغتي', labelEn: 'Arabic', descAr: 'جمال لغتنا العربية', descEn: 'The beauty of our language' },
    { id: 'english', icon: '🌍', labelAr: 'English', labelEn: 'English', descAr: 'تحدثي مع العالم', descEn: 'Speak with the world' },
  ];

  const steps = [
    {
      badge: lang === 'ar' ? 'البداية' : 'The Beginning',
      title: lang === 'ar' ? 'مستقبلك يبدأ هنا' : 'Your Future Starts Here',
      desc: lang === 'ar' ? 'أهلاً بك في عالم مُدرّس، حيث يصبح التعلم مغامرة ذكية وشخصية.' : 'Welcome to the world of Mudarris, where learning becomes a smart personal adventure.',
      icon: (
        <div className="relative">
          <div className="w-20 h-20 bg-mudarris-blue rounded-2xl flex items-center justify-center shadow-lg-soft">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-saudi-gold rounded-full border-4 border-white"></div>
        </div>
      )
    },
    {
      badge: lang === 'ar' ? 'المميزات' : 'Features',
      title: lang === 'ar' ? 'واجبك.. صار أسهل' : 'Homework.. Simplified',
      desc: lang === 'ar' ? 'بلمسة واحدة، صور واجبك واحصل على شرح مفصل، خطوة بخطوة، تماماً كمعلمك الخصوصي.' : 'With one tap, photograph your homework and get detailed, step-by-step explanations, just like a private tutor.',
      icon: (
        <div className="relative">
          <div className="w-20 h-20 bg-saudi-gold rounded-2xl flex items-center justify-center shadow-lg-soft">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  return (
    <div className="h-full bg-white relative flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-full h-1/2 bg-mudarris-blue/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-full h-1/2 bg-saudi-gold/5 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-sm z-10 flex flex-col h-full justify-between py-12">
        <div className="flex justify-center">
          <button 
            onClick={toggleLanguage}
            className="px-6 py-2 rounded-lg bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-500 hover:text-mudarris-blue hover:bg-white transition-all uppercase tracking-widest shadow-sm"
          >
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {step < 2 ? (
            <div key={step} className="animate-pop flex flex-col items-center text-center gap-8">
              <div className="mb-2">{steps[step].icon}</div>
              <div className="flex flex-col gap-4">
                <span className="inline-block px-3 py-1 bg-mudarris-blue/10 text-mudarris-blue rounded-full text-[10px] font-bold uppercase tracking-[0.2em] w-fit mx-auto">
                  {steps[step].badge}
                </span>
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{steps[step].title}</h1>
                <p className="text-gray-500 font-medium leading-relaxed text-sm px-4">{steps[step].desc}</p>
              </div>
              <button 
                onClick={handleNext}
                className="w-full py-4 bg-mudarris-blue text-white rounded-lg font-bold text-base shadow-md hover:brightness-105 active:scale-[0.99] transition-all"
              >
                {lang === 'ar' ? 'استمرار' : 'Continue'}
              </button>
            </div>
          ) : step === 2 ? (
            <div className="animate-pop flex flex-col items-center text-center gap-10">
              <div className="flex flex-col gap-3">
                <h2 className="text-3xl font-extrabold text-gray-900">{isRtl ? 'ما هو اسمكِ؟' : "What's your name?"}</h2>
                <p className="text-gray-500 font-medium text-sm">{isRtl ? 'أهلاً بكِ في عالم مُدرّس الذكي' : 'Welcome to Mudarris smart world'}</p>
              </div>
              <input 
                type="text"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-5 rounded-lg bg-gray-50 border-2 border-transparent focus:border-mudarris-blue/20 focus:bg-white text-black font-extrabold text-xl transition-all outline-none text-center shadow-sm"
                placeholder={isRtl ? 'اكتبي اسمكِ هنا...' : 'Your name...'}
              />
              <button 
                disabled={!name.trim()}
                onClick={handleNext}
                className={`w-full py-4 rounded-lg font-bold text-base transition-all ${
                  name.trim() ? 'bg-mudarris-blue text-white shadow-md active:scale-[0.99]' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {lang === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          ) : (
            <div className="animate-pop flex flex-col gap-6">
              <div className="text-center flex flex-col gap-2">
                <h2 className="text-2xl font-extrabold text-gray-900">{isRtl ? `أهلاً يا ${name}` : `Welcome, ${name}`}</h2>
                <p className="text-gray-500 font-medium text-sm">{isRtl ? 'ماذا تريدين أن تتعلمي اليوم؟' : 'What do you want to learn today?'}</p>
              </div>
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                {interests.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedInterest(item.id)}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all duration-300 group ${
                      selectedInterest === item.id 
                        ? 'bg-mudarris-blue border-mudarris-blue text-white shadow-md' 
                        : 'bg-white border-gray-100 text-gray-600 hover:border-mudarris-blue/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 ${isRtl ? 'ml-4' : 'mr-4'} ${selectedInterest === item.id ? 'bg-white/20' : 'bg-gray-50'}`}>
                      {item.icon}
                    </div>
                    <div className={`${isRtl ? 'text-right' : 'text-left'} flex-1 min-w-0`}>
                      <p className="font-extrabold text-sm">{lang === 'ar' ? item.labelAr : item.labelEn}</p>
                      <p className={`text-[10px] font-bold truncate ${selectedInterest === item.id ? 'text-white/70' : 'text-gray-400'}`}>
                        {lang === 'ar' ? item.descAr : item.descEn}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <button 
                disabled={!selectedInterest}
                onClick={() => onLogin({ name, interest: selectedInterest || undefined })}
                className={`w-full py-4 rounded-lg font-bold text-base transition-all mt-4 ${
                  selectedInterest ? 'bg-saudi-gold text-white shadow-md active:scale-[0.99]' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isRtl ? 'ابدئي الدراسة' : 'Start Studying'}
              </button>
            </div>
          )}
        </div>

        {/* Standardized Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-mudarris-blue' : 'w-1.5 bg-gray-200'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
