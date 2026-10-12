import { useState } from 'react';
import Card from '../common/Card';
import LargeIconButton from '../common/LargeIconButton';
import PainPointTag from '../common/PainPointTag';
import EmptyState from '../common/EmptyState';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { MapPin, ShieldCheck, Star, Clock, PhoneCall, MessageSquare, Volume2, CheckCircle2 } from 'lucide-react';

export default function WorkerJobsTab({ user, jobs, bookings, onAcceptJob, onToggleAvailability, passport }) {
  const { t, speak, lang } = useLanguage();
  const { addToast } = useToast();
  const [selectedJobId, setSelectedJobId] = useState(null);

  const isJobAccepted = (jobId) => {
    return bookings?.some(
      (b) => b.jobId === jobId && !['paid', 'cancelled'].includes(b.status)
    );
  };

  const speakJobDetails = (job) => {
    let text = '';
    if (lang === 'mr') {
      text = `${job.title}, ठिकाण ${job.site}. मजुरी ${job.wage} रुपये दररोज. कॉन्ट्रॅक्टर ${job.contractor?.name || 'प्रमाणित'}.`;
    } else if (lang === 'hi') {
      text = `${job.title}, जगह ${job.site}. मजदूरी ${job.wage} रुपये प्रति दिन. ठेकेदार ${job.contractor?.name || 'प्रमाणित'}.`;
    } else {
      text = `${job.title} at ${job.site}. Daily wage rupees ${job.wage}. Contractor ${job.contractor?.name || 'Verified'}.`;
    }
    speak(text);
  };

  return (
    <div className="space-y-4">
      {/* Naka Availability Check-in Card (PDF Feature 16) */}
      <Card highlight={passport?.available} className="border-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📍</span>
            <div>
              <h3 className="font-extrabold text-navy-950 text-base">
                {t('availableAtNaka')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {passport?.available
                  ? '🟢 Contractors nearby can see you on their Naka live map'
                  : 'Tap toggle to broadcast your availability to hiring contractors'}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!passport?.available}
              onChange={(e) => onToggleAvailability(e.target.checked)}
            />
            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
          </label>
        </div>
        <PainPointTag
          text="Standing at the labour chowk for 3 hours every morning with zero visibility"
          persona="worker"
        />
      </Card>

      {/* Missed-Call & WhatsApp Job Alerts Gateway (PDF Feature 4) */}
      <Card className="bg-gradient-to-r from-navy-900 to-navy-800 text-white border-navy-700">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-safety/20 text-safety">📲</span>
            <div>
              <h4 className="font-bold text-sm text-white">Missed-Call & WhatsApp Alerts</h4>
              <p className="text-[11px] text-slate-300">Works on basic button phone — No app or internet needed</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase bg-safety text-navy-950 px-2 py-0.5 rounded-full">
            No Data
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-navy-700/80">
          <button
            onClick={() => {
              if (jobs?.[0]) onAcceptJob(jobs[0].id);
              addToast('Simulated: Accepted job via 1800 missed call!', 'success');
            }}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-navy-700/80 hover:bg-navy-700 text-xs font-semibold text-slate-100 border border-navy-600 transition"
          >
            <PhoneCall size={14} className="text-safety" />
            <span>Missed Call: 1800-SETU</span>
          </button>
          <button
            onClick={() => {
              if (jobs?.[0]) onAcceptJob(jobs[0].id);
              addToast('Simulated: Accepted job via WhatsApp reply "YES"!', 'success');
            }}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-xs font-semibold text-emerald-200 border border-emerald-700/60 transition"
          >
            <MessageSquare size={14} className="text-emerald-400" />
            <span>WhatsApp "YES 1"</span>
          </button>
        </div>
        <PainPointTag
          text="No mobile data at naka; has to show up in person to learn about work"
          persona="worker"
        />
      </Card>

      {/* Job listings header */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
          <span>💼</span>
          <span>Today's Verified Jobs ({jobs?.length || 0})</span>
        </h2>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Matched to {user.skill || 'Mason'}
        </span>
      </div>

      {/* Empty State if no jobs */}
      {(!jobs || jobs.length === 0) && (
        <EmptyState
          icon="🔍"
          title="No open jobs right now"
          description="Contractors post new requirements every morning at 7:00 AM."
        />
      )}

      {/* Job Cards */}
      {jobs?.map((job) => {
        const accepted = isJobAccepted(job.id);

        return (
          <Card key={job.id} highlight={accepted} className="space-y-3">
            {/* Top row: Title and match pill */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-navy-950 leading-tight">
                  {job.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1">
                  <MapPin size={13} className="text-rose-500" />
                  <span>{job.site}</span>
                  <span>·</span>
                  <span>{job.km ? `${job.km} km away` : 'Near Naka'}</span>
                  {job.duration && (
                    <>
                      <span>·</span>
                      <span className="text-navy-700 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                        {job.duration}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {job.match || 95}% Match
                </span>
                {job.escrowFunded && (
                  <span className="text-[10px] font-bold text-navy-800 bg-safety-100 px-2 py-0.5 rounded-full border border-safety-300">
                    🔒 Escrow Funded
                  </span>
                )}
              </div>
            </div>

            {/* Contractor trust credentials */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-navy-900">{job.contractor?.name || 'Patil Builders'}</span>
                {job.contractor?.verified ? (
                  <span className="flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold text-[10px]">
                    <ShieldCheck size={11} /> Verified
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                    Unverified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-semibold">
                <span className="flex items-center gap-0.5 text-amber-600">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  {job.contractor?.rating || 4.2}
                </span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock size={12} />
                  {job.contractor?.onTimePct || 92}% on-time pay
                </span>
              </div>
            </div>

            {/* Daily Wage callout */}
            <div className="flex items-baseline justify-between py-1">
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase">Guaranteed Daily Wage</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-navy-950">₹{job.wage}</span>
                  <span className="text-xs font-semibold text-slate-500">/ 8-hr shift</span>
                </div>
              </div>
              <button
                onClick={() => speakJobDetails(job)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-xs font-bold transition border border-slate-300"
                aria-label="Listen job audio"
              >
                <Volume2 size={15} className="text-navy-800" />
                <span>{t('listen')}</span>
              </button>
            </div>

            {/* Accept / Accepted Large Button */}
            <LargeIconButton
              icon={accepted ? '✅' : '🤝'}
              label={accepted ? 'Job Accepted — Head to Site' : t('acceptJob')}
              sublabel={accepted ? 'Go to "My Work" tab to check in' : 'Locks wage in pre-funded escrow upon check-in'}
              variant={accepted ? 'success' : 'yellow'}
              disabled={accepted}
              onClick={() => onAcceptJob(job.id)}
              speechText={`${job.title}, ₹${job.wage}. ${accepted ? 'Accepted' : 'Click to accept'}`}
            />
          </Card>
        );
      })}
    </div>
  );
}
