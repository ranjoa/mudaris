
import React from 'react';
import { ReportItem, Language } from '../types';

interface Props {
  lang: Language;
  reports: ReportItem[];
  userName: string;
}

const ParentView: React.FC<Props> = ({ lang, reports, userName }) => {
  const isRtl = lang === 'ar';

  const stats = [
    { label: isRtl ? 'ساعات الدراسة' : 'Study Hours', val: '4.2', color: 'text-blue-600', icon: '⏱️' },
    { label: isRtl ? 'دروس مكتملة' : 'Mastered', val: '12', color: 'text-green-600', icon: '🏆' },
    { label: isRtl ? 'معدل التركيز' : 'Focus Score', val: '94%', color: 'text-amber-600', icon: '⚡' },
  ];

  const shareViaWhatsApp = () => {
    const lastReport = reports[0];
    const reportText = isRtl 
      ? `تقرير مُدرّّس لـ ${userName}:
جلسات اليوم: ${reports.length}
آخر نشاط: ${lastReport.summaryAr}
ساعات الدراسة: 4.2 ساعة
معدل التركيز: 94%`
      : `Mudarris Report for ${userName}:
Today's Sessions: ${reports.length}
Last Activity: ${lastReport.summaryEn}
Study Hours: 4.2h
Focus Score: 94%`;

    const url = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto no-scrollbar pb-20">
      <div className="px-6 pt-8">
        {/* Stats Grid - Aligned to 8pt */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {stats.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm-soft text-center flex flex-col items-center gap-1">
              <span className="text-xl mb-1">{s.icon}</span>
              <span className="text-base font-extrabold text-gray-900 leading-tight">{s.val}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Action Button - 8px Border Radius */}
        <button 
          onClick={shareViaWhatsApp}
          className="w-full bg-[#25D366] text-white py-4 rounded-lg font-bold text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-3 mb-10"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span>{isRtl ? 'إرسال ملخص للواتساب' : 'Receive WhatsApp Summary'}</span>
        </button>

        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{isRtl ? 'سجل المتابعة' : 'Activity Log'}</h2>
          <div className="flex items-center gap-2 bg-mudarris-blue/5 px-3 py-1 rounded-full border border-mudarris-blue/10">
             <span className="w-1.5 h-1.5 bg-mudarris-blue rounded-full animate-pulse"></span>
             <span className="text-[10px] font-bold text-mudarris-blue uppercase tracking-widest">LIVE</span>
          </div>
        </div>

        {/* Compact & Clean Reports List */}
        <div className="flex flex-col gap-6">
          {reports.map((item) => (
            <div key={item.id} className="flex gap-4 group animate-pop">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lg shrink-0 group-hover:bg-gray-50 transition-colors">
                {item.icon}
              </div>
              <div className="flex-1 bg-white p-4 rounded-xl shadow-sm-soft border border-gray-50 relative">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-gray-900">{isRtl ? item.titleAr : item.titleEn}</h4>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">12:45 PM</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  {isRtl ? item.summaryAr : item.summaryEn}
                </p>
                <div className="mt-3 flex items-center gap-1.5 opacity-30">
                  <svg className="w-3.5 h-3.5 text-mudarris-blue fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{isRtl ? 'تمت القراءة' : 'Seen'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentView;
