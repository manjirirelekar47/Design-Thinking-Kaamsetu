import { useState, useEffect } from 'react';
import { Mic, Volume2, X, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { api, setToken } from '../../api';

export default function VoiceAssistantModal({ isOpen, onClose, onLoginSuccess }) {
  const { lang, speak } = useLanguage();
  const { addToast } = useToast();
  const [step, setStep] = useState(1); // 1: Name, 2: Skill, 3: Area, 4: Done
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('Mason');
  const [area, setArea] = useState('Baner, Pune');
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const SKILLS = [
    { name: 'Mason', icon: '🧱', mr: 'गवंडी', hi: 'राजमिस्त्री' },
    { name: 'Helper', icon: '📦', mr: 'मदतनीस', hi: 'हेल्पर' },
    { name: 'Painter', icon: '🎨', mr: 'रंगारी', hi: 'पेंटर' },
    { name: 'Plumber', icon: '🚰', mr: 'प्लंबर', hi: 'प्लंबर' },
    { name: 'Electrician', icon: '⚡', mr: 'इलेक्ट्रिशियन', hi: 'इलेक्ट्रीशियन' },
  ];

  const AREAS = ['Baner, Pune', 'Wakad, Pune', 'Kothrud, Pune', 'Hadapsar, Pune', 'Pimpri-Chinchwad'];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName('');
      setVoiceTranscript('');
      promptForStep(1);
    }
  }, [isOpen]);

  const promptForStep = (currentStep) => {
    let msg = '';
    if (currentStep === 1) {
      msg = lang === 'mr' ? 'कृपया तुमचे नाव बोला.' : lang === 'hi' ? 'कृपया अपना नाम बोलिए.' : 'Please speak your full name.';
    } else if (currentStep === 2) {
      msg = lang === 'mr' ? 'तुमचे काम निवडा किंवा बोला.' : lang === 'hi' ? 'अपना काम चुनें या बोलें.' : 'Select or speak your primary skill.';
    } else if (currentStep === 3) {
      msg = lang === 'mr' ? 'तुमचा नाका किंवा परिसर निवडा.' : lang === 'hi' ? 'अपना इलाका या नाका चुनें.' : 'Select your labor naka or work area.';
    }
    speak(msg);
  };

  const handleSimulateVoice = (recognizedText) => {
    setIsListening(true);
    setVoiceTranscript(recognizedText);
    setTimeout(() => {
      setIsListening(false);
      if (step === 1) {
        setName(recognizedText);
        setStep(2);
        promptForStep(2);
      } else if (step === 2) {
        setSkill(recognizedText);
        setStep(3);
        promptForStep(3);
      } else if (step === 3) {
        setArea(recognizedText);
        setStep(4);
      }
    }, 900);
  };

  const startBrowserMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Microphone not supported on this browser. Use one-tap voice options below.', 'warning');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      setIsListening(true);
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setIsListening(false);
        handleSimulateVoice(text);
      };
      recognition.onerror = () => {
        setIsListening(false);
        addToast('Voice capture timed out. Tap a preset name below.', 'warning');
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: name || 'Ramesh Ahirwar',
        skill,
        area,
        language: lang,
      };
      const res = await api('/auth/voice-onboard', { method: 'POST', body: payload });
      setToken(res.token);
      addToast(`Welcome ${res.user.name}! Voice onboarding complete.`, 'success');
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-safety relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-safety flex items-center justify-center text-navy-900 shadow-md">
            <Mic size={24} className={isListening ? 'animate-pulse text-red-700' : ''} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-navy-900">Voice-First Onboarding</h2>
            <p className="text-xs font-semibold text-slate-500">
              {lang === 'mr' ? 'बोलून नाव व काम नोंदवा - टाईप करण्याची गरज नाही' : lang === 'hi' ? 'बोलकर काम और नाम दर्ज करें - लिखना नहीं पड़ेगा' : 'Speak to register - zero typing needed'}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                step >= s ? 'bg-safety-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Speak Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-safety-50 border border-safety-200 rounded-2xl text-center">
              <span className="text-3xl block mb-2">🗣️</span>
              <p className="font-bold text-navy-900 text-base">
                {lang === 'mr' ? 'तुमचे नाव बोला:' : lang === 'hi' ? 'अपना नाम बोलिए:' : 'Speak your name:'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Tap microphone or choose quick voice sample</p>
            </div>

            <div className="flex justify-center my-3">
              <button
                onClick={startBrowserMic}
                className={`w-18 h-18 rounded-full flex flex-col items-center justify-center font-bold transition shadow-lg ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-safety hover:bg-safety-400 text-navy-900 ring-4 ring-safety-200'
                }`}
              >
                <Mic size={28} />
                <span className="text-[10px] uppercase font-bold mt-1">
                  {isListening ? 'Listening...' : 'Tap & Speak'}
                </span>
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Spoken Samples:</p>
              <div className="grid grid-cols-2 gap-2">
                {['Ramesh Ahirwar', 'Santosh Pawar', 'Ganesh Patil', 'Dilip Gaikwad'].map((samp) => (
                  <button
                    key={samp}
                    onClick={() => handleSimulateVoice(samp)}
                    className="p-2.5 bg-slate-50 hover:bg-safety-100 hover:border-safety border rounded-xl text-xs font-bold text-navy-900 flex items-center justify-between transition"
                  >
                    <span>🎙️ "{samp}"</span>
                    <ArrowRight size={13} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Skill */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3 bg-safety-50 border border-safety-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Worker Name</span>
                <p className="font-black text-navy-900">{name}</p>
              </div>
              <span className="text-emerald-700 bg-emerald-100 text-xs px-2 py-0.5 rounded-full font-bold">✔ Spoken</span>
            </div>

            <p className="font-bold text-navy-900 text-sm">
              {lang === 'mr' ? 'कामाचा प्रकार निवडा:' : lang === 'hi' ? 'हुनर / काम चुनें:' : 'Select your primary skill:'}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {SKILLS.map((s) => (
                <button
                  key={s.name}
                  onClick={() => {
                    setSkill(s.name);
                    setStep(3);
                    promptForStep(3);
                  }}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition font-bold text-left ${
                    skill === s.name
                      ? 'border-safety-500 bg-safety-50 text-navy-950 ring-2 ring-safety-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <div className="text-sm font-extrabold leading-tight">{s.name}</div>
                    <div className="text-[11px] font-medium text-slate-500">
                      {lang === 'mr' ? s.mr : s.hi}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Labor Naka / Area */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="font-bold text-navy-900 text-sm">
              {lang === 'mr' ? 'तुमचा नाका / परिसर निवडा:' : lang === 'hi' ? 'अपना लेबर नाका चुनें:' : 'Select your Labour Naka / Chowk:'}
            </p>

            <div className="space-y-2">
              {AREAS.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setArea(a);
                    setStep(4);
                  }}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between font-bold text-sm transition ${
                    area === a
                      ? 'border-safety-500 bg-safety-50 text-navy-950 font-extrabold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">📍 {a}</span>
                  {area === a && <Check size={16} className="text-navy-900" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Review and Complete */}
        {step === 4 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center text-3xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-extrabold text-navy-900">Profile Ready!</h3>
            <div className="bg-slate-50 rounded-2xl p-4 border text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Name:</span><b>{name}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">Skill:</span><b>{skill}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">Naka:</span><b>{area}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">Wage Passport:</span><b className="text-emerald-700">Generated (0 days)</b></div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3.5 px-4 bg-safety hover:bg-safety-400 text-navy-950 font-black rounded-2xl text-base shadow-yellow transition"
            >
              🚀 Enter KaamSetu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
