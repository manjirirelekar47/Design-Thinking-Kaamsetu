import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Card from '../common/Card';
import PainPointTag from '../common/PainPointTag';
import EmptyState from '../common/EmptyState';
import { useToast } from '../../context/ToastContext';
import {
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Users,
  QrCode,
  Calendar,
  Lock,
  Phone,
  Star,
} from 'lucide-react';

export default function ContractorJobsTab({
  user,
  jobs,
  availableWorkers,
  onPostJob,
  onVerifyContractor,
  onInspectPassport,
}) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    title: '',
    site: '',
    wage: '',
    workersNeeded: '2',
    duration: '2 days',
    escrowFunded: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.site.trim() || !form.wage) {
      addToast('Please fill in title, site location, and daily wage', 'warning');
      return;
    }
    try {
      await onPostJob({
        title: form.title,
        site: form.site,
        wage: Number(form.wage),
        workersNeeded: Number(form.workersNeeded),
        duration: form.duration,
        escrowFunded: form.escrowFunded,
      });
      setForm({
        title: '',
        site: '',
        wage: '',
        workersNeeded: '2',
        duration: '2 days',
        escrowFunded: true,
      });
      addToast('Job posted! WhatsApp/SMS broadcast sent to nearby workers.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Verification status alert */}
      {!user.verified ? (
        <Card className="bg-amber-50 border-2 border-amber-300 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert size={22} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-amber-950">
                Unverified Contractor Account
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Workers trust and prioritize verified builders. Verify your GST / trade registration to get 3x higher applicant response.
              </p>
            </div>
          </div>
          <button
            onClick={onVerifyContractor}
            className="w-full py-2.5 px-4 bg-navy-800 hover:bg-navy-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
          >
            🛡️ Verify My Business (Simulate ID & GST check)
          </button>
        </Card>
      ) : (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Verified Builder & Contractor Account (GST Active)</span>
          </span>
          <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-[10px]">
            ⭐ Trust Score: {user.rating || 4.2}
          </span>
        </div>
      )}

      {/* Post a Job Form (PDF Section 5: skill, number of workers, wage, duration) */}
      <Card className="border-2 border-slate-200/90 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <h3 className="text-base font-black text-navy-950 flex items-center gap-2">
            <PlusCircle size={18} className="text-safety-600" />
            <span>Post New Construction Job</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Site Requirements
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Skill / Trade Needed</label>
              <input
                type="text"
                placeholder="e.g. Mason Crew / Plastering"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-safety rounded-xl px-3 py-2 text-xs font-bold text-navy-950"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Worksite Location</label>
              <input
                type="text"
                placeholder="e.g. Wakad Site B, Pune"
                value={form.site}
                onChange={(e) => setForm({ ...form, site: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-safety rounded-xl px-3 py-2 text-xs font-bold text-navy-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Daily Wage (₹)</label>
              <input
                type="number"
                placeholder="750"
                value={form.wage}
                onChange={(e) => setForm({ ...form, wage: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-safety rounded-xl px-3 py-2 text-xs font-bold text-navy-950"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Workers Needed</label>
              <input
                type="number"
                placeholder="2"
                value={form.workersNeeded}
                onChange={(e) => setForm({ ...form, workersNeeded: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-safety rounded-xl px-3 py-2 text-xs font-bold text-navy-950"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Duration</label>
              <input
                type="text"
                placeholder="3 days"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-safety rounded-xl px-3 py-2 text-xs font-bold text-navy-950"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
            <label className="flex items-center gap-2 font-bold text-navy-950 cursor-pointer">
              <input
                type="checkbox"
                checked={form.escrowFunded}
                onChange={(e) => setForm({ ...form, escrowFunded: e.target.checked })}
                className="w-4 h-4 rounded accent-safety-500 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Lock size={13} className="text-navy-800" />
                <span>Pre-fund wages into Escrow immediately</span>
              </span>
            </label>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
              Attracts Top Workers
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-safety hover:bg-safety-400 text-navy-950 font-black rounded-xl text-sm shadow-yellow transition"
          >
            📢 Post Job & Broadcast Alerts
          </button>
        </form>
      </Card>

      {/* Live Naka Workers list (PDF Feature 16) */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-navy-950 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Workers Available at Naka Today ({availableWorkers?.length || 0})</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">Live Availability</span>
        </div>

        {(!availableWorkers || availableWorkers.length === 0) ? (
          <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">
            No workers currently marked available at the naka.
          </p>
        ) : (
          <div className="space-y-2">
            {availableWorkers.map((w) => (
              <div
                key={w.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-navy-950 text-xs">{w.name}</span>
                    <span className="text-[10px] font-bold bg-navy-100 text-navy-800 px-1.5 py-0.5 rounded">
                      {w.skill}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{w.days} days verified</span>
                    <span>·</span>
                    <span className="flex items-center text-amber-600">
                      <Star size={11} className="fill-amber-500" /> {w.rating || 4.6}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onInspectPassport(w.id)}
                  className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <span>View Passport</span>
                </button>
              </div>
            ))}
          </div>
        )}
        <PainPointTag text="Contractors have to visit multiple labour nakas at 6 AM with zero information on skills" persona="contractor" />
      </Card>

      {/* Active Posted Jobs List */}
      <div className="space-y-3 pt-1">
        <h3 className="text-base font-black text-navy-950">
          Your Active Site Job Posts ({jobs?.length || 0})
        </h3>

        {(!jobs || jobs.length === 0) && (
          <EmptyState
            icon="🏗️"
            title="No jobs posted yet"
            description="Use the form above to post your site requirements."
          />
        )}

        {jobs?.map((j) => (
          <Card key={j.id} className="space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-extrabold text-navy-950">{j.title}</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                  <MapPin size={13} className="text-rose-500" />
                  <span>{j.site}</span>
                  <span>·</span>
                  <span>₹{j.wage}/day</span>
                </div>
              </div>

              {/* Scannable Site QR Code */}
              <div className="text-center p-1 bg-white border-2 border-navy-800 rounded-xl flex-shrink-0 shadow-2xs">
                <QRCodeSVG value={`kaamsetu:site:${j.otp}`} size={54} />
                <span className="text-[9px] font-mono font-bold text-slate-600 block mt-0.5">
                  Site QR
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border text-xs">
              <span className="text-slate-600 font-semibold">
                Daily Site Attendance OTP:
              </span>
              <span className="font-mono font-black text-sm text-navy-950 bg-safety-100 px-2 py-0.5 rounded border border-safety-300">
                {j.otp}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
