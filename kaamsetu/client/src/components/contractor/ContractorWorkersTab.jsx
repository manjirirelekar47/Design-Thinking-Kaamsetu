import { useState } from 'react';
import Card from '../common/Card';
import LargeIconButton from '../common/LargeIconButton';
import PainPointTag from '../common/PainPointTag';
import EmptyState from '../common/EmptyState';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Star,
  Zap,
  MapPin,
  Lock,
  UserCheck,
  FileCheck,
  Search,
} from 'lucide-react';

export default function ContractorWorkersTab({
  bookings,
  crewBookings,
  onFundBooking,
  onReleaseBooking,
  onReleaseAll,
  onCancelBooking,
  onRateWorker,
  onCashAckContractor,
  onInspectPassport,
}) {
  const { addToast } = useToast();
  const [workerReviewComment, setWorkerReviewComment] = useState('');
  const [passportLookupQuery, setPassportLookupQuery] = useState('');

  const releasableCount = bookings?.filter(
    (b) => b.status === 'completed' && b.funded
  ).length || 0;

  const handleLookupPassport = (e) => {
    e.preventDefault();
    if (!passportLookupQuery.trim()) {
      addToast('Enter worker phone or ID (e.g. 9000000001 or u1)', 'warning');
      return;
    }
    onInspectPassport(passportLookupQuery.trim());
  };

  return (
    <div className="space-y-4">
      {/* Header and One-Click Wage Release (PDF Feature 17) */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
          <span>👷</span>
          <span>Workers & Escrow ({bookings?.length || 0})</span>
        </h2>

        {releasableCount > 0 && (
          <button
            onClick={onReleaseAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-safety hover:bg-safety-400 text-navy-950 rounded-xl text-xs font-black shadow-yellow transition border border-safety-600 animate-pulse"
          >
            <Zap size={14} />
            <span>⚡ Release All ({releasableCount})</span>
          </button>
        )}
      </div>

      {/* Passport Verification Search Bar */}
      <Card className="bg-navy-900 text-white border-navy-800">
        <form onSubmit={handleLookupPassport} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-safety flex items-center gap-1.5">
              <UserCheck size={15} />
              <span>Verify Worker Passport (Hero Feature)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Scan QR or enter Phone</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 9000000001 or worker ID u1"
              value={passportLookupQuery}
              onChange={(e) => setPassportLookupQuery(e.target.value)}
              className="flex-1 bg-navy-800 border border-navy-700 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-safety"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-safety hover:bg-safety-400 text-navy-950 font-bold rounded-xl text-xs flex items-center gap-1"
            >
              <Search size={14} />
              <span>Verify</span>
            </button>
          </div>
        </form>
        <PainPointTag text="No way to verify whether a worker's claims of 10 years experience are true" persona="contractor" />
      </Card>

      {/* Empty State */}
      {(!bookings || bookings.length === 0) && (
        <EmptyState
          icon="👥"
          title="No workers active yet"
          description="When workers accept your posted jobs, their attendance and escrow status will show here."
        />
      )}

      {/* Bookings cards */}
      {bookings?.map((b) => {
        const isAccepted = b.status === 'accepted';
        const isCheckedIn = b.status === 'checked_in';
        const isCompleted = b.status === 'completed';
        const isPaid = b.status === 'paid';
        const isCancelled = b.status === 'cancelled';

        return (
          <Card key={b.id} highlight={!isPaid && !isCancelled} className="space-y-3.5">
            {/* Worker Identity & Passport credentials */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-navy-950 leading-tight">
                    {b.worker?.name}
                  </h3>
                  <button
                    onClick={() => onInspectPassport(b.workerId)}
                    className="text-[10px] font-bold text-navy-800 bg-safety-100 px-2 py-0.5 rounded-full border border-safety-300 hover:bg-safety-200 transition"
                  >
                    View Passport 🪪
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-0.5">
                  <span>{b.worker?.skill}</span>
                  <span>·</span>
                  <span>{b.worker?.days} verified days</span>
                  <span>·</span>
                  <span className="flex items-center text-amber-600">
                    <Star size={12} className="fill-amber-500" /> {b.worker?.rating || 4.6}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : isCheckedIn
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : isCompleted
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : isCancelled
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {b.status.replace('_', ' ')}
                </span>
                <span className="text-sm font-black text-navy-950 block mt-1">₹{b.job?.wage}</span>
              </div>
            </div>

            {/* Worksite & Attendance details */}
            <div className="bg-slate-50 rounded-xl p-3 border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Job / Site:</span>
                <span className="font-bold text-navy-950">{b.job?.title} ({b.job?.site})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Attendance OTP:</span>
                <span className="font-mono font-bold text-navy-950 bg-slate-200 px-1.5 py-0.2 rounded">
                  {b.job?.otp}
                </span>
              </div>
              {b.checkInAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Check-in Time:</span>
                  <span className="font-bold text-emerald-800">
                    {new Date(b.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {b.gps && ` (📍 GPS: ${b.gps.lat}, ${b.gps.lng})`}
                  </span>
                </div>
              )}
              {b.checkOutAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Shift Ended:</span>
                  <span className="font-bold text-navy-950">
                    {new Date(b.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {b.claim && (
                <div className="flex items-center gap-1.5 p-2 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 font-bold">
                  <AlertCircle size={14} />
                  <span>Worker raised wage dispute: {b.claimReason || 'Attendance proof attached'}</span>
                </div>
              )}
            </div>

            {/* Escrow Pre-fund & Wage Release Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                disabled={b.funded || isPaid || isCancelled}
                onClick={() => onFundBooking(b.id)}
                className={`py-3 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  b.funded
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-safety hover:bg-safety-400 text-navy-950 shadow-yellow border border-safety-600'
                }`}
              >
                <Lock size={14} />
                <span>{b.funded ? '✓ Escrow Locked' : `Pre-Fund ₹${b.job?.wage}`}</span>
              </button>

              <button
                disabled={b.status !== 'completed' || !b.funded}
                onClick={() => onReleaseBooking(b.id)}
                className={`py-3 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  b.status === 'completed' && b.funded
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 size={14} />
                <span>Approve & Release Wage</span>
              </button>
            </div>

            {/* Cash Handover Confirmation for Contractor (PDF Feature 7) */}
            {isPaid && b.payMethod === 'Cash' && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  disabled={b.cashContractorAck}
                  onClick={() => onCashAckContractor(b.id)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    b.cashContractorAck
                      ? 'bg-slate-100 text-slate-700 border border-slate-300'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                >
                  <FileCheck size={14} />
                  <span>
                    {b.cashContractorAck
                      ? '✓ Cash Handover Confirmed by Contractor'
                      : 'Confirm Cash Handed Over to Worker'}
                  </span>
                </button>
              </div>
            )}

            {/* Cancel job with ₹150 automatic compensation */}
            {(isAccepted || isCheckedIn) && (
              <div className="pt-1 text-center">
                <button
                  onClick={() => onCancelBooking(b.id)}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
                >
                  Cancel shift (triggers ₹150 automatic compensation to worker)
                </button>
              </div>
            )}

            {/* Rate worker after wage release */}
            {isPaid && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-navy-950">
                  <span>Rate Worker Performance:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => onRateWorker(b.id, s, workerReviewComment)}
                        className="text-base"
                      >
                        <Star
                          size={17}
                          className={
                            (b.rating || 0) >= s
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {!b.rating && (
                  <input
                    type="text"
                    placeholder="Short feedback (e.g. Excellent speed, clean tiling work)"
                    value={workerReviewComment}
                    onChange={(e) => setWorkerReviewComment(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                )}
              </div>
            )}
          </Card>
        );
      })}

      {/* Mukkadam Crew Bookings Section */}
      {crewBookings && crewBookings.length > 0 && (
        <Card className="space-y-3">
          <h3 className="text-sm font-extrabold text-navy-950 flex items-center gap-2">
            <span>👥</span>
            <span>Mukkadam Crew Bookings</span>
          </h3>
          <div className="space-y-2">
            {crewBookings.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 rounded-xl border flex justify-between items-center text-xs">
                <div>
                  <b className="text-navy-950">{c.job?.title}</b>
                  <p className="text-slate-500">Mukkadam: {c.mukkadam?.name || 'Sunil'}</p>
                </div>
                <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Crew of {c.size} Workers
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
