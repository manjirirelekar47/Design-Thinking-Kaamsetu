import { useState } from 'react';
import Card from '../common/Card';
import PainPointTag from '../common/PainPointTag';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
  HardHat,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  PhoneCall,
} from 'lucide-react';

export default function WorkerRightsTab({ onSendSos }) {
  const { speak, lang } = useLanguage();
  const { addToast } = useToast();

  const [safetyChecks, setSafetyChecks] = useState([
    { id: 1, text: 'Hard Hat / Helmet worn (ISI certified)', done: true },
    { id: 2, text: 'Steel-toe Safety Boots inspected', done: true },
    { id: 3, text: 'High-visibility safety jacket worn', done: false },
    { id: 4, text: 'Safety Harness attached (for working above 2m)', done: false },
    { id: 5, text: 'Site First-Aid box location confirmed', done: true },
    { id: 6, text: 'Emergency supervisor contact verified', done: true },
  ]);

  const [sosSent, setSosSent] = useState(false);

  const toggleCheck = (id) => {
    setSafetyChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  };

  const allChecksDone = safetyChecks.every((c) => c.done);

  const handleSos = async () => {
    try {
      await onSendSos();
      setSosSent(true);
      addToast('🚨 EMERGENCY SOS SENT: Contractor and emergency contacts notified with site GPS!', 'error', 6000);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const SCHEMES = [
    {
      title: 'e-Shram National Database (Ministry of Labour)',
      benefit: '₹2,00,000 Accidental Death & Disability Cover + Universal UAN Card',
      desc: 'Free registration for unorganized workers across India. Eligible for social security pensions and state emergency disaster relief.',
      mr: 'ई-श्रम नोंदणी: २ लाख रुपयांचे अपघात विमा संरक्षण आणि सर्व सरकारी योजनांचा थेट लाभ.',
      hi: 'ई-श्रम पोर्टल: २ लाख रुपये का दुर्घटना बीमा और राष्ट्रीय मजदूर पहचान पत्र।',
    },
    {
      title: 'BOCW Welfare Board (Bhandkam Kamgar Mandal)',
      benefit: '₹5,000 Safety & Tool-Kit Grant + Children Scholarship',
      desc: 'Registered construction workers in Maharashtra receive marriage financial aid, maternity benefits, free health check-ups, and housing subsidy.',
      mr: 'महाराष्ट्र इमारत व इतर बांधकाम कामगार कल्याणकारी मंडळ: मोफत अवजारे संच, आरोग्य तपासणी आणि मुलांच्या शिक्षणासाठी शिष्यवृत्ती.',
      hi: 'भवन निर्माण कल्याण बोर्ड: औजार किट अनुदान, बच्चों की पढ़ाई हेतु छात्रवृत्ति एवं चिकित्सा सहायता।',
    },
    {
      title: 'Ayushman Bharat (PM-JAY Health Protection)',
      benefit: '₹5,00,000 Free Hospitalization per family per year',
      desc: 'Cashless treatment at 27,000+ empanelled government and private hospitals for serious illness, surgical care, and site accident recovery.',
      mr: 'आयुष्मान भारत: प्रति कुटुंब वर्षाला ५ लाख रुपयांपर्यंत मोफत हॉस्पिटल उपचार.',
      hi: 'आयुष्मान भारत: प्रति परिवार प्रति वर्ष ५ लाख रुपये तक का कैशलेस इलाज।',
    },
    {
      title: 'Minimum Wage Rights & Overtime Protection',
      benefit: 'Guaranteed minimum daily rates + 1.5x Overtime Pay',
      desc: 'Illegal for contractors to pay below state gazette minimums. Mandatory 30-min lunch break and rest days.',
      mr: 'किमान वेतन हक्क: ठरवून दिलेल्या दरापेक्षा कमी मजुरी देणे बेकायदेशीर आहे.',
      hi: 'न्यूनतम मजदूरी अधिकार: कानूनन तय मजदूरी से कम देना अपराध है।',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Start-of-Day Safety Checklist (PDF Feature 13) */}
      <Card className="border-2 border-amber-300 bg-amber-50/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-safety text-navy-950 font-black text-base shadow-sm">
              <HardHat size={20} />
            </span>
            <div>
              <h3 className="font-extrabold text-navy-950 text-base">
                Start-of-Day Safety Check-in
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Mandatory daily protective protocol before tool handling
              </p>
            </div>
          </div>
          {allChecksDone ? (
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-300">
              ✓ Ready for Site
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-bold">
              {safetyChecks.filter((c) => c.done).length}/{safetyChecks.length} Done
            </span>
          )}
        </div>

        <div className="space-y-2 pt-1">
          {safetyChecks.map((item) => (
            <label
              key={item.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer text-xs font-bold ${
                item.done
                  ? 'bg-white border-emerald-300 text-emerald-950'
                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleCheck(item.id)}
                className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
              />
              <span className="flex-1">{item.text}</span>
              {item.done && <CheckCircle2 size={16} className="text-emerald-600" />}
            </label>
          ))}
        </div>

        {/* SOS Emergency Button */}
        <div className="pt-2">
          <button
            onClick={handleSos}
            className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border-2 border-rose-700"
          >
            <ShieldAlert size={20} className="animate-bounce" />
            <span>🚨 SOS EMERGENCY — BROADCAST DISTRESS</span>
          </button>
          {sosSent && (
            <p className="text-xs font-bold text-rose-700 text-center mt-2 bg-rose-100 p-2 rounded-xl">
              ✓ High-priority SMS alert broadcasted to contractor supervisor and nearby site contacts.
            </p>
          )}
        </div>

        <PainPointTag text="What if I get hurt on a construction site with no cover or emergency contact?" persona="worker" />
      </Card>

      {/* Welfare Schemes & Legal Rights Helper (PDF Feature 12) */}
      <div className="pt-1">
        <h3 className="text-lg font-black text-navy-950 flex items-center gap-2 mb-3">
          <span>📚</span>
          <span>Welfare Schemes & Legal Rights Helper</span>
        </h3>

        <div className="space-y-3">
          {SCHEMES.map((scheme, idx) => (
            <Card key={idx} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-navy-950 leading-tight">
                    {scheme.title}
                  </h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-1">
                    🎁 {scheme.benefit}
                  </span>
                </div>
                <button
                  onClick={() => speak(lang === 'mr' ? scheme.mr : lang === 'hi' ? scheme.hi : scheme.desc)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 border border-slate-300 transition flex items-center gap-1 text-xs font-bold"
                  title="Listen explanation out loud"
                >
                  <Volume2 size={15} />
                  <span>{lang === 'mr' ? 'ऐका' : lang === 'hi' ? 'सुनें' : 'Listen'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {scheme.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
      <PainPointTag text="Workers lack awareness of government welfare boards, accident claims, and free insurance" persona="worker" />
    </div>
  );
}
