
import React, { useState, useRef, useEffect } from 'react';
import { Message, Language, ReportItem } from '../types';
import { aiService, decode, decodeAudioData, createPcmBlob } from '../services/geminiService';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface Props {
  lang: Language;
  onReportGenerated: (report: Omit<ReportItem, 'id'>) => void;
  initialInterest?: string;
}

const StudentView: React.FC<Props> = ({ lang, onReportGenerated, initialInterest }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const outAudioCtxRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveSessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const isRtl = lang === 'ar';

  useEffect(() => {
    const subjectNames: Record<string, string> = {
      math: lang === 'ar' ? 'الرياضيات' : 'Math',
      science: lang === 'ar' ? 'العلوم' : 'Science',
      arabic: lang === 'ar' ? 'اللغة العربية' : 'Arabic',
      english: lang === 'ar' ? 'اللغة الإنجليزية' : 'English',
    };

    const chosenSubject = initialInterest ? subjectNames[initialInterest] : '';
    const welcome = lang === 'ar' 
      ? `أهلاً بكِ يا بطلة.. أنا مُدرّس.. بما أنكِ اخترتِ ${chosenSubject || 'التعلّم اليوم'}، فدعينا نبدأ بدرس ممتع!` 
      : `Hello champion! I am Mudarris. Since you chose ${chosenSubject || 'to learn today'}, let's start something amazing!`;
    
    setMessages([{ id: 'init', role: 'model', text: welcome, timestamp: new Date() }]);
    speakText(welcome);

    return () => {
      stopLiveSession();
    };
  }, [lang, initialInterest]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, liveTranscription]);

  const speakText = async (text: string) => {
    if (isLive) return; // Don't use TTS in Live mode
    setIsSpeaking(true);
    const audioData = await aiService.speak(text);
    if (audioData) {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } else {
      setIsSpeaking(false);
    }
  };

  const startLiveSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioCtxRef.current = inCtx;
      outAudioCtxRef.current = outCtx;

      const ai = aiService.getAI();
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `أنت "مُدرّس" (Mudarris)، معلّم AI بلهجة سعودية بيضاء مهذبة. أنت الآن في جلسة صوتية مباشرة مع الطالب.
1. عرّف نفسك دائماً بـ "مُدرّس".
2. خاطب الطالب بـ "يا بطل" أو "يا مبدع".
3. كن تفاعلياً للغاية، شجعه على الكلام.
4. إذا سكت الطالب، اسأله إذا كان لديه استفسار حول ${initialInterest || 'الدرس'}.
5. التزم بأسلوبك المنظم والمشجع.`,
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsLive(true);
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setLiveTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setLiveTranscription('');
            }

            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64) {
              const ctx = outAudioCtxRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLive(false),
          onerror: () => setIsLive(false),
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Live session failed", err);
    }
  };

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    setIsLive(false);
    setLiveTranscription('');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: new Date() }]);
    processAIResponse(text);
  };

  const processAIResponse = async (text: string, imageData?: string, mimeType?: string) => {
    setIsLoading(true);
    try {
      const ai = aiService.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text }] }],
        config: {
          systemInstruction: `أنت "مُدرّس" (Mudarris)، معلّم AI بلهجة سعودية بيضاء مهذبة. خاطب الطالب دائماً بـ "يا بطل" أو "يا مبدع". رتب كلامك في نقاط واضحة.`,
        }
      });

      const cleanedText = response.text?.replace(/[\*\#\_]/g, '').trim() || '';
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: cleanedText, timestamp: new Date() }]);
      speakText(cleanedText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: isRtl ? 'يا مُدرّس، هل يمكنك مساعدتي في حل هذا الواجب؟' : 'Teacher, can you help me with this homework?', image: base64Data, timestamp: new Date() }]);
      processAIResponse('حل هذا الواجب المرفق في الصورة', base64Data.split(',')[1], file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full bg-mudarris-blue-light relative flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-pattern pointer-events-none"></div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

      {/* Header Info */}
      <div className="flex-1 flex flex-col px-6 pt-6 relative z-10 overflow-hidden">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4 animate-pop">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-saudi-gold/10 rounded-lg flex items-center justify-center text-lg border border-saudi-gold/10">
              {initialInterest === 'math' ? '📐' : initialInterest === 'science' ? '🧪' : '📚'}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isRtl ? 'المهمة الحالية' : 'Goal'}</p>
              <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
                {initialInterest === 'math' ? (isRtl ? 'هندسة الأشكال' : 'Geometry Master') : (isRtl ? 'عالم العلوم' : 'Science Explorer')}
              </h4>
            </div>
            <button 
              onClick={isLive ? stopLiveSession : startLiveSession}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all shadow-md flex items-center gap-2 ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-mudarris-blue text-white'}`}
            >
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white' : 'bg-green-400'}`}></div>
              {isLive ? (isRtl ? 'إنهاء الجلسة' : 'End Live') : (isRtl ? 'تحدث مع مُدرّس' : 'Talk Live')}
            </button>
          </div>
        </div>

        {/* Live Visualizer Overlay */}
        {isLive && (
          <div className="mt-4 bg-mudarris-blue rounded-2xl p-6 shadow-lg animate-pop text-white relative overflow-hidden">
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="flex items-center gap-1 h-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="voice-bar bg-white w-1.5 rounded-full" style={{ animationDelay: `${i * 0.1}s`, height: '20px' }}></div>
                ))}
              </div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest">{isRtl ? 'مُدرّس يستمع إليك...' : 'Mudarris is listening...'}</p>
              {liveTranscription && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 w-full text-center min-h-[60px] flex items-center justify-center">
                  <p className="text-sm font-medium leading-relaxed italic">"{liveTranscription}"</p>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          </div>
        )}

        {/* Message Stream */}
        <div className={`flex-1 overflow-y-auto py-8 space-y-6 no-scrollbar pb-32 ${isLive ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop`}>
              <div className={`max-w-[85%] p-4 rounded-xl relative shadow-sm-soft ${
                msg.role === 'user' ? 'chat-bubble-user rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <div className={`flex items-center justify-between mb-2 gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${msg.role === 'user' ? 'opacity-60' : 'opacity-40'}`}>
                    {msg.role === 'user' ? (isRtl ? 'أنتِ' : 'You') : (isRtl ? 'مُدرّس' : 'Mudarris')}
                  </span>
                  {msg.role === 'model' && isSpeaking && (
                    <div className="flex gap-0.5">
                      <div className="voice-bar"></div>
                      <div className="voice-bar [animation-delay:-0.4s]"></div>
                      <div className="voice-bar [animation-delay:-0.2s]"></div>
                    </div>
                  )}
                </div>
                {msg.image && <img src={msg.image} className="mb-3 rounded-lg overflow-hidden border border-gray-100 shadow-sm" />}
                <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/90 backdrop-blur-md py-3 px-5 rounded-full flex items-center gap-1.5 shadow-sm-soft border border-gray-100">
                <div className="w-1.5 h-1.5 bg-mudarris-blue rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-mudarris-blue rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-mudarris-blue rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Pill */}
      {!isLive && (
        <div className="fixed bottom-24 inset-x-0 z-40 px-6 py-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="bg-white rounded-full p-1.5 flex items-center gap-2 border border-gray-100 shadow-lg-soft">
              <button onClick={handleCameraClick} className="w-12 h-12 bg-gray-50 text-mudarris-blue rounded-full flex items-center justify-center hover:bg-gray-100 transition-all shrink-0">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <input 
                type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isRtl ? 'اسأليني أي شيء...' : 'Ask me anything...'}
                className="flex-1 bg-transparent text-gray-900 font-bold outline-none text-sm px-2"
              />
              <button onClick={handleSendMessage} className={`w-12 h-12 rounded-full transition-all flex items-center justify-center shrink-0 ${inputText.trim() ? 'bg-mudarris-blue text-white' : 'bg-gray-50 text-gray-200'}`} disabled={!inputText.trim()}>
                <svg className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;
