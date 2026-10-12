import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import WagePassport from '../components/WagePassport';
import VoiceReader from '../components/VoiceReader';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { api } from '../api';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  HardHat,
  AlertTriangle,
  FileCheck,
  Zap,
  Banknote,
  Share2,
  Award,
  QrCode,
  Briefcase,
  Lock,
  PhoneCall,
  MessageSquare,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const SAFETY_ITEMS = {
  en: [
    'Hard Hat / Helmet worn (ISI certified)',
    'Steel-toe Safety Boots inspected',
    'High-visibility safety jacket worn',
    'Safety Harness attached (for working above 2m)',
    'Site First-Aid kit location verified',
    'Emergency supervisor contact saved',
  ],
  hi: [
    'सुरक्षा हेलमेट पहना हुआ है (ISI प्रमाणित)',
    'सुरक्षा जूते (स्टील टो बूट) जांचे गए',
    'रिफ्लेक्टिव जैकेट पहनी हुई है',
    'सुरक्षा बेल्ट / हार्नेस बंधी है (2 मीटर ऊंचाई हेतु)',
    'प्राथमिक उपचार किट (First Aid) की जगह पता है',
    'आपातकालीन सुपरवाइजर नंबर सेव है',
  ],
  mr: [
    'सुरक्षा हेल्मेट घातले आहे (ISI प्रमाणित)',
    'स्टील-टो सुरक्षा बूट तपासले आहेत',
    'रिफ्लेक्टिव्ह सेफ्टी जाकीट घातले आहे',
    'सुरक्षा पट्टा / हार्नेस बांधला आहे (२ मीटरपेक्षा जास्त उंचीवर)',
    'प्रथमोपचार पेटीची (First Aid) जागा माहित आहे',
    'आपत्कालीन सुपरवायझरचा नंबर सेव्ह आहे',
  ],
};

export default function WorkerApp({ user, jobsState, activeTab, onSelectTab }) {
  const { t, lang, speak } = useLanguage();
  const { addToast } = useToast();
  const { jobs, bookings, passport, minWageData, loading, refresh } = jobsState;

  const [siteOtp, setSiteOtp] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimBookingId, setClaimBookingId] = useState(null);

  const [safetyChecks, setSafetyChecks] = useState({
    0: true,
    1: true,
    2: false,
    3: false,
    4: true,
    5: true,
  });
  const [sosSent, setSosSent] = useState(false);

  // Accept Job
  const handleAccept = async (jobId) => {
    try {
      await api(`/jobs/${jobId}/accept`, { method: 'POST' });
      addToast('Job accepted! Daily wage locked in escrow.', 'success');
      refresh();
      if (onSelectTab) onSelectTab('attendance');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Naka Availability Toggle
  const handleToggleAvail = async (available) => {
    try {
      await api('/availability', { method: 'POST', body: { available } });
      addToast(available ? 'Marked available at Naka today' : 'Availability turned off', 'info');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Check In with OTP & GPS (Simulated)
  const handleCheckIn = async (bookingId) => {
    try {
      const coords = { lat: 18.559, lng: 73.7868, site: 'Baner' };
      await api(`/bookings/${bookingId}/checkin`, {
        method: 'POST',
        body: { otp: siteOtp, gps: coords },
      });
      addToast('Check-in confirmed with site OTP & GPS coordinates (Simulated)!', 'success');
      setSiteOtp('');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // End Shift
  const handleCheckout = async (bookingId) => {
    try {
      await api(`/bookings/${bookingId}/checkout`, { method: 'POST' });
      addToast('Shift completed! Payment release pending contractor verification.', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Set Payout Method
  const handleSetPayMethod = async (bookingId, method) => {
    try {
      await api(`/bookings/${bookingId}/paymethod`, { method: 'POST', body: { method } });
      addToast(`Payout method changed to ${method} (Simulated)`, 'info');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Cash Acknowledgment
  const handleCashAck = async (bookingId) => {
    try {
      await api(`/bookings/${bookingId}/cash-ack`, { method: 'POST' });
      addToast('Cash payment acknowledged and saved in Wage Passport!', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Instant Payout (Simulated)
  const handleInstantPayout = async (bookingId) => {
    try {
      await api(`/bookings/${bookingId}/instant`, { method: 'POST' });
      addToast('⚡ Instant payout sent to UPI account (Simulated)!', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Rate Contractor
  const handleRateContractor = async (bookingId, stars) => {
    try {
      await api(`/bookings/${bookingId}/rate-contractor`, {
        method: 'POST',
        body: { stars, comment: 'Punctual escrow payment' },
      });
      addToast(`Rated contractor trust ${stars} stars!`, 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Wage Claim
  const handleClaim = async () => {
    try {
      await api(`/bookings/${claimBookingId}/claim`, { method: 'POST', body: { reason: claimReason } });
      setShowClaimModal(false);
      setClaimReason('');
      addToast('Wage dispute claim registered with attendance proof', 'warning');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Safety SOS
  const handleSos = async () => {
    try {
      await api('/sos', { method: 'POST' });
      setSosSent(true);
      addToast('🚨 EMERGENCY SOS BROADCAST SENT to contractor (Simulated SMS)!', 'error', 6000);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Update Trade Skill & Consent
  const handleUpdateSkill = async (newSkill) => {
    try {
      await api('/profile', { method: 'POST', body: { skill: newSkill } });
      addToast('Skill profile updated', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleConsent = async (consent) => {
    try {
      await api('/profile', { method: 'POST', body: { consent } });
      addToast(consent ? 'Privacy consent active' : 'Consent withdrawn', 'info');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const isJobAccepted = (jobId) =>
    bookings?.some((b) => b.jobId === jobId && !['paid', 'cancelled'].includes(b.status));

  const passportUrl = `${window.location.origin}/api/passport/${user.id}`;

  const getJobSpeech = (job) => {
    if (lang === 'mr') {
      return `${job.title}, ${job.site}. रोजची मजुरी ${job.wage} रुपये. कॉन्ट्रॅक्टर ${job.contractor?.name || 'प्रमाणित'}. काम स्वीकारण्यासाठी खाली दाबा.`;
    }
    if (lang === 'hi') {
      return `${job.title}, ${job.site}. रोज़ाना मजदूरी ${job.wage} रुपये. ठेकेदार ${job.contractor?.name || 'सत्यापित'}. काम स्वीकार करने के लिए नीचे दबाएं.`;
    }
    return `${job.title}, ${job.site}. ${job.wage} rupees daily wage. Contractor ${job.contractor?.name || 'Verified'}. Tap below to accept.`;
  };

  const getMinWageSpeech = (mw) => {
    if (!mw) return '';
    if (lang === 'mr') {
      return `${mw.skill} कामासाठी सरकारी किमान मजुरी ₹${mw.range[0]} ते ₹${mw.range[1]} दररोज आहे. यापेक्षा कमी मजुरी स्वीकारू नका.`;
    }
    if (lang === 'hi') {
      return `${mw.skill} काम के लिए सरकारी न्यूनतम मजदूरी ₹${mw.range[0]} से ₹${mw.range[1]} प्रतिदिन है। इससे कम स्वीकार न करें।`;
    }
    return `${mw.skill} government minimum wage benchmark is ${mw.range[0]} to ${mw.range[1]} rupees per day.`;
  };

  const getPassportSpeech = () => {
    if (lang === 'mr') {
      return `कामगार ${passport?.name || user.name}. ${passport?.days || user.days} दिवस काम पूर्ण. एकूण मजुरी ₹${passport?.totalWagesReceived || user.days * 700}. रेटिंग ${passport?.rating || user.rating} स्टार.`;
    }
    if (lang === 'hi') {
      return `कामगार ${passport?.name || user.name}. ${passport?.days || user.days} दिन काम पूरा. कुल प्राप्त मजदूरी ₹${passport?.totalWagesReceived || user.days * 700}. रेटिंग ${passport?.rating || user.rating} स्टार.`;
    }
    return `Worker ${passport?.name || user.name}. ${passport?.days || user.days} verified days worked. Secured wages ₹${passport?.totalWagesReceived || user.days * 700}. Rating ${passport?.rating || user.rating} stars.`;
  };

  const getSafetySpeech = () => {
    if (lang === 'mr') {
      return 'कामापूर्वी सुरक्षा नियम: डोक्यावर हेल्मेट, पायात सेफ्टी बूट, रिफ्लेक्टिव्ह जाकीट आणि आपत्कालीन मदत क्रमांक तयार ठेवा.';
    }
    if (lang === 'hi') {
      return 'काम से पहले सुरक्षा नियम: सुरक्षा हेलमेट, सेफ्टी जूते, रिफ्लेक्टिव जैकेट और आपातकालीन संपर्क नंबर तैयार रखें।';
    }
    return 'Start-of-day safety protocol: Wear certified hard hat, safety boots, and verify emergency supervisor contacts before beginning work.';
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 select-none">
      {/* ============================================================ */}
      {/* TAB 1: HOME / JOBS (Job Alerts, Min Wage, Safety Check-in)  */}
      {/* ============================================================ */}
      {activeTab === 'home_jobs' && (
        <div className="space-y-4">
          {/* Naka Availability Toggle Card */}
          <Card highlight={passport?.available}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📍</span>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">
                    {t('availableAtNaka')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {passport?.available
                      ? '🟢 ' + t('availableDesc')
                      : t('availableDescOff')}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!passport?.available}
                  onChange={(e) => handleToggleAvail(e.target.checked)}
                />
                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner" />
              </label>
            </div>
          </Card>

          {/* Missed-Call & WhatsApp Alert Simulator Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-xl border-2 border-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-yellow-400 text-slate-950 font-bold">📲</span>
                <div>
                  <h4 className="text-sm font-black text-white">{t('missedCallAlerts')}</h4>
                  <p className="text-[11px] text-slate-300">{t('buttonPhoneWorks')}</p>
                </div>
              </div>
              <Badge variant="yellow">Simulated</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (jobs?.[0]) handleAccept(jobs[0].id);
                  addToast('Simulated: Accepted job via 1800 missed call!', 'success');
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-yellow-300 border border-slate-700 transition"
              >
                <PhoneCall size={14} />
                <span>Missed Call: 1800-SETU</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (jobs?.[0]) handleAccept(jobs[0].id);
                  addToast('Simulated: Accepted job via WhatsApp reply "YES"!', 'success');
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 text-xs font-bold text-emerald-300 border border-emerald-800 transition"
              >
                <MessageSquare size={14} />
                <span>WhatsApp "YES 1"</span>
              </button>
            </div>
          </div>

          {/* Job Alerts Section Header */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <span>💼</span>
              <span>{t('jobAlerts')} ({jobs?.length || 0})</span>
            </h2>
            <Badge variant="neutral">Trade: {user.skill || 'Mason'}</Badge>
          </div>

          {loading && <SkeletonLoader lines={2} />}

          {(!jobs || jobs.length === 0) && !loading && (
            <EmptyState
              icon="🔍"
              title={t('noOpenJobs')}
              description={t('noOpenJobsDesc')}
            />
          )}

          {/* Job Cards */}
          {jobs?.map((job) => {
            const accepted = isJobAccepted(job.id);
            const speakDetails = getJobSpeech(job);

            return (
              <Card key={job.id} highlight={accepted} className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-950 leading-tight">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1">
                      <MapPin size={13} className="text-rose-500 flex-shrink-0" />
                      <span>{job.site}</span>
                      <span>·</span>
                      <span>{job.km ? `${job.km} km` : 'Near Naka'}</span>
                      {job.duration && (
                        <>
                          <span>·</span>
                          <span className="bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded font-bold">
                            {job.duration}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="success">{job.match || 95}% Match</Badge>
                    {job.escrowFunded && (
                      <Badge variant="yellow" icon={<Lock size={10} />}>Escrow Locked</Badge>
                    )}
                  </div>
                </div>

                {/* Contractor Trust Credentials */}
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900">{job.contractor?.name || 'Patil Builders'}</span>
                    {job.contractor?.verified && (
                      <Badge variant="success" icon={<ShieldCheck size={11} />}>{t('verified')}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <span className="flex items-center gap-0.5 text-amber-600">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      {job.contractor?.rating || 4.2}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={12} />
                      {job.contractor?.onTimePct || 92}% on-time
                    </span>
                  </div>
                </div>

                {/* Daily Wage + VoiceReader */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {t('dailyWageRate')}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-950 font-mono tracking-tight">
                        ₹{job.wage}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{t('perShift')}</span>
                    </div>
                  </div>

                  <VoiceReader text={speakDetails} />
                </div>

                {/* Massive 1-Tap Accept Button (min-h-[56px]) */}
                {accepted ? (
                  <Button
                    icon="📍"
                    sublabel={t('headToSite')}
                    variant="navy"
                    onClick={() => onSelectTab && onSelectTab('attendance')}
                    speechText={lang === 'mr' ? 'काम स्वीकारले. हजेरी नोंदवण्यासाठी हजेरी टॅबवर जा.' : lang === 'hi' ? 'काम स्वीकार किया. हाजिरी लगाने के लिए हाजिरी टैब पर जाएं.' : 'Shift accepted. Go to attendance tab to check in'}
                  >
                    {t('goToAttendance')}
                  </Button>
                ) : (
                  <Button
                    icon="🤝"
                    sublabel={lang === 'mr' ? '१-क्लिकने मजुरी सुरक्षित एस्क्रोमध्ये लॉक होते' : lang === 'hi' ? '1-क्लिक से मजदूरी सुरक्षित एस्क्रो में लॉक होती है' : '1-Tap accept locks wage into pre-funded escrow'}
                    variant="yellow"
                    onClick={() => handleAccept(job.id)}
                    speechText={speakDetails}
                  >
                    {t('acceptJob')}
                  </Button>
                )}
              </Card>
            );
          })}

          {/* Minimum Wage Checker (PDF Feature 11) */}
          {minWageData && (
            <Card className="bg-yellow-50/70 border-2 border-yellow-300 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 block">
                    Government Minimum Wage Benchmark
                  </span>
                  <h4 className="text-base font-black text-slate-950">
                    {minWageData.skill} Rate: ₹{minWageData.range[0]} - ₹{minWageData.range[1]} / day
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{minWageData.note}</p>
                </div>
                <VoiceReader text={getMinWageSpeech(minWageData)} />
              </div>
            </Card>
          )}

          {/* Start-of-Day Safety Check-in (PDF Feature 13) */}
          <Card className="border-2 border-yellow-400 bg-yellow-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-yellow-400 text-slate-950 font-black">
                  <HardHat size={20} />
                </span>
                <div>
                  <h3 className="font-black text-slate-950 text-base">
                    {t('safetyProtocol')}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {t('safetyDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <VoiceReader text={getSafetySpeech()} />
                <Badge variant="yellow">Daily Protocol</Badge>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {(SAFETY_ITEMS[lang] || SAFETY_ITEMS.en).map((itemText, idx) => {
                const isChecked = !!safetyChecks[idx];
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer text-xs font-bold ${
                      isChecked
                        ? 'bg-white border-emerald-300 text-emerald-950'
                        : 'bg-white/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setSafetyChecks((prev) => ({ ...prev, [idx]: !prev[idx] }))
                      }
                      className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    />
                    <span className="flex-1">{itemText}</span>
                    {isChecked && <CheckCircle2 size={16} className="text-emerald-600" />}
                  </label>
                );
              })}
            </div>

            {/* Red SOS Emergency Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSos}
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border-2 border-rose-800 select-none cursor-pointer"
              >
                <AlertTriangle size={20} className="animate-bounce" />
                <span>{t('sosAlert')}</span>
              </button>
              {sosSent && (
                <p className="text-xs font-bold text-rose-800 text-center mt-2 bg-rose-100 p-2 rounded-xl">
                  ✓ High-priority distress alert broadcasted to contractor with site location.
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: ATTENDANCE (GPS/OTP/QR Check-In & Shift Ending)       */}
      {/* ============================================================ */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <span>📍</span>
              <span>{t('attendanceTracking')}</span>
            </h2>
            <Badge variant="neutral">{t('simulated')} GPS & OTP</Badge>
          </div>

          {(!bookings || bookings.length === 0) && (
            <EmptyState
              icon="📝"
              title={t('noActiveBookings')}
              description={t('noActiveBookingsDesc')}
            />
          )}

          {bookings?.map((b) => {
            const isAccepted = b.status === 'accepted';
            const isCheckedIn = b.status === 'checked_in';
            const isCompleted = b.status === 'completed';
            const isPaid = b.status === 'paid';

            return (
              <Card key={b.id} highlight={isAccepted || isCheckedIn} className="space-y-4">
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-950 leading-tight">
                      {b.job?.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-0.5">
                      <MapPin size={13} className="text-rose-500" />
                      <span>{b.job?.site}</span>
                      <span>·</span>
                      <span className="text-slate-900 font-extrabold">{b.contractor?.name}</span>
                    </div>
                  </div>

                  <Badge
                    variant={isPaid ? 'success' : isCheckedIn ? 'yellow' : isCompleted ? 'warning' : 'neutral'}
                    size="md"
                  >
                    {b.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Step 1: Accepted -> Check In with OTP or QR */}
                {isAccepted && (
                  <div className="space-y-3 pt-1">
                    <div className="p-3.5 bg-yellow-50 border-2 border-yellow-300 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-950 uppercase tracking-wide">
                          {t('siteVerification')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSiteOtp(b.job?.otp || '4821')}
                          className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          <QrCode size={13} />
                          <span>{t('scanQr')}</span>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder={t('enterSiteOtp')}
                          value={siteOtp}
                          onChange={(e) => setSiteOtp(e.target.value)}
                          className="flex-1 bg-white border-2 border-slate-300 focus:border-yellow-400 rounded-xl px-3 py-2 text-base font-mono font-black text-center tracking-widest text-slate-950"
                        />
                        <button
                          type="button"
                          onClick={() => setSiteOtp(b.job?.otp || '4821')}
                          className="px-3 bg-slate-200 hover:bg-slate-300 font-bold text-xs rounded-xl text-slate-700 cursor-pointer"
                        >
                          {t('useOtp')} {b.job?.otp || '4821'}
                        </button>
                      </div>
                    </div>

                    <Button
                      icon="📍"
                      sublabel={lang === 'mr' ? 'कामाच्या जागेवरील GPS व हजेरी OTP पडताळणी' : lang === 'hi' ? 'कार्यस्थल के GPS और हाजिरी OTP का सत्यापन' : 'Verifies GPS worksite coordinates and attendance OTP'}
                      variant="yellow"
                      disabled={!siteOtp.trim()}
                      onClick={() => handleCheckIn(b.id)}
                    >
                      {t('checkIn')} ({t('simulated')} GPS)
                    </Button>
                  </div>
                )}

                {/* Step 2: Checked In -> Shift Active -> End Shift */}
                {isCheckedIn && (
                  <div className="space-y-3 pt-1">
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-950">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>{t('shiftActive')} ({new Date(b.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                      </span>
                      <Badge variant="success">📍 {t('verified')} GPS ({t('simulated')})</Badge>
                    </div>

                    <Button
                      icon="🛑"
                      sublabel={lang === 'mr' ? 'मजुरी वर्ग करण्यासाठी शिफ्ट समाप्तीची वेळ नोंदवते' : lang === 'hi' ? 'मजदूरी जारी करने के लिए शिफ्ट समाप्ति समय दर्ज करता है' : 'Records end-of-shift timestamp for contractor wage release'}
                      variant="navy"
                      onClick={() => handleCheckout(b.id)}
                    >
                      {t('endShift')}
                    </Button>
                  </div>
                )}

                {/* Step 3: Shift Completed / Paid */}
                {isCompleted && (
                  <div className="space-y-2">
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs font-bold text-amber-950 flex items-center justify-between">
                      <span>{t('shiftFinished')} ({new Date(b.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                      <Badge variant="warning">{t('awaitingRelease')}</Badge>
                    </div>
                    {onSelectTab && (
                      <button
                        type="button"
                        onClick={() => onSelectTab('wage_tracker')}
                        className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-yellow-300 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>{t('trackSettlement')}</span>
                      </button>
                    )}
                  </div>
                )}

                {isPaid && (
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-950 flex items-center justify-between">
                      <span>✓ {t('wageSettled')}</span>
                      <Badge variant="success">Paid via {b.payMethod} ({t('simulated')})</Badge>
                    </div>
                    {onSelectTab && (
                      <button
                        type="button"
                        onClick={() => onSelectTab('wage_passport')}
                        className="w-full py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>{t('viewUpdatedPassport')}</span>
                      </button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: WAGE TRACKER (Timeline, Payout Choice, Wage Claim)     */}
      {/* ============================================================ */}
      {activeTab === 'wage_tracker' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <span>📈</span>
              <span>{t('wageTracker')}</span>
            </h2>
          </div>

          {(!bookings || bookings.length === 0) && (
            <EmptyState
              icon="💰"
              title={t('noWageRecords')}
              description={t('noWageRecordsDesc')}
            />
          )}

          {bookings?.map((b) => {
            const isCompleted = b.status === 'completed';
            const isPaid = b.status === 'paid';
            const isCancelled = b.status === 'cancelled';

            return (
              <Card key={b.id} className="space-y-4">
                <div className="flex justify-between items-start border-b pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-950">{b.job?.title}</h3>
                    <p className="text-xs text-slate-500 font-bold">{b.contractor?.name} · {b.job?.site}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-950 font-mono">₹{b.job?.wage}</span>
                    <Badge variant={isPaid ? 'success' : 'yellow'} size="sm">
                      {b.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Timeline Stepper: Work done -> Verified -> Paid */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span>{t('timelineTitle')}</span>
                    <span>{t('wageDueToday')}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    {[
                      { label: t('workDone'), done: !!b.checkOutAt || isPaid },
                      { label: t('verifiedInEscrow'), done: b.funded },
                      { label: t('paid'), done: isPaid },
                    ].map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mb-1 ${
                            step.done ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {step.done ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[10px] leading-tight ${step.done ? 'font-black text-slate-950' : 'text-slate-400 font-semibold'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payout method choice (Simulated) */}
                {!isPaid && !isCancelled && (
                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Banknote size={15} /> {t('payoutMethod')}:
                    </span>
                    <select
                      value={b.payMethod || 'UPI'}
                      onChange={(e) => handleSetPayMethod(b.id, e.target.value)}
                      className="bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1.5 font-black text-slate-950 focus:outline-none"
                    >
                      <option value="UPI">UPI (GPay / PhonePe)</option>
                      <option value="Bank transfer">Direct Bank Transfer</option>
                      <option value="Cash">Cash at Site</option>
                    </select>
                  </div>
                )}

                {/* Post-payment actions */}
                {isPaid && (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2.5 text-xs font-bold">
                    <div className="flex justify-between items-center text-emerald-950">
                      <span>✓ {t('paid')} ₹{b.job?.wage} via {b.payMethod} ({t('simulated')})</span>
                      <Badge variant="success">+1 {t('daysWorked')}</Badge>
                    </div>

                    {b.payMethod === 'Cash' && (
                      <Button size="sm" variant="ghost" disabled={b.cashAck} onClick={() => handleCashAck(b.id)}>
                        <FileCheck size={15} />
                        <span>{b.cashAck ? `✓ ${t('confirmCashReceipt')}` : t('confirmCashReceipt')}</span>
                      </Button>
                    )}

                    {b.payMethod !== 'Cash' && (
                      <Button size="sm" variant={b.instant ? 'ghost' : 'navy'} disabled={b.instant} onClick={() => handleInstantPayout(b.id)}>
                        <Zap size={15} className="text-yellow-400" />
                        <span>{b.instant ? `⚡ ${t('instantPayout')} (Settled)` : t('instantPayout')}</span>
                      </Button>
                    )}

                    {/* Rate contractor */}
                    <div className="flex items-center justify-between pt-1 border-t border-emerald-200">
                      <span className="text-slate-700">{t('rateContractorPrompt')}</span>
                      <div className="flex gap-1 text-base">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => handleRateContractor(b.id, s)}>
                            <Star size={17} className={(b.contractorRating || 0) >= s ? 'fill-amber-400 text-amber-500' : 'text-slate-300'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Prominent "Raise Claim/Dispute" Button */}
                <div className="pt-1">
                  {b.claim ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-950 flex items-center gap-2">
                      <AlertCircle size={15} className="text-amber-600" />
                      <span>{t('claimRaised')}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setClaimBookingId(b.id);
                        setShowClaimModal(true);
                      }}
                      className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertCircle size={14} className="text-rose-600" />
                      <span>{t('raiseClaimPrompt')}</span>
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: DIGITAL WAGE PASSPORT (HERO FEATURE ID CARD)          */}
      {/* ============================================================ */}
      {activeTab === 'wage_passport' && (
        <div className="space-y-4">
          {/* High-End Physical ID Card (Hero Feature) */}
          <WagePassport user={user} passport={passport} />

          {/* Update Primary Trade */}
          <Card className="space-y-2.5">
            <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
              <Briefcase size={16} className="text-slate-700" />
              <span>{t('updateTradeSkill')}</span>
            </h3>
            <select
              value={passport?.skill || user.skill}
              onChange={(e) => handleUpdateSkill(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-yellow-400 rounded-xl p-3 text-sm font-black text-slate-950 focus:outline-none"
            >
              {['Mason', 'Helper', 'Painter', 'Plumber', 'Electrician'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Card>

          {/* Privacy Consent */}
          <Card className="bg-slate-50 border-2 border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-slate-800" />
                <h4 className="text-xs font-black text-slate-950">{t('dataPrivacy')}</h4>
              </div>
              <input
                type="checkbox"
                checked={!!passport?.consent}
                onChange={(e) => handleToggleConsent(e.target.checked)}
                className="w-5 h-5 accent-slate-900 rounded cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('privacyDesc')}
            </p>
          </Card>
        </div>
      )}

      {/* Wage Dispute Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-rose-500 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle size={22} />
              <h3 className="text-lg font-black text-slate-950">Raise Wage Dispute</h3>
            </div>
            <p className="text-xs text-slate-600">
              State the reason for overdue wage claim. Your digital check-in logs and GPS verification will be attached automatically.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Completed shift 4 days ago, wage release still pending..."
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              className="w-full text-xs p-3 border-2 border-slate-200 focus:border-rose-500 rounded-xl"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClaim}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md"
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
