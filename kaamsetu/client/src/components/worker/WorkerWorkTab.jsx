import { useState } from 'react';
import Card from '../common/Card';
import LargeIconButton from '../common/LargeIconButton';
import PainPointTag from '../common/PainPointTag';
import EmptyState from '../common/EmptyState';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  MapPin,
  QrCode,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Star,
  Banknote,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

export default function WorkerWorkTab({
  bookings,
  onCheckIn,
  onCheckOut,
  onSetPayMethod,
  onRaiseClaim,
  onCashAck,
  onInstantPayout,
  onRateContractor,
  minWageData,
}) {
  const { t, lang } = useLanguage();
  const { addToast } = useToast();
  const [siteOtp, setSiteOtp] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedBookingForClaim, setSelectedBookingForClaim] = useState(null);
  const [contractorComment, setContractorComment] = useState('');

  const handleQrSimulation = (otpValue) => {
    setSiteOtp(otpValue || '4821');
    addToast(`QR Scanned: Site OTP ${otpValue || '4821'} filled`, 'success');
  };

  const submitClaim = async (bookingId) => {
    try {
      await onRaiseClaim(bookingId, claimReason);
      setShowClaimModal(false);
      setClaimReason('');
      addToast('Wage dispute claim registered with verified attendance logs', 'warning');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
          <span>📍</span>
          <span>{t('work')} & Attendance ({bookings?.length || 0})</span>
        </h2>
      </div>

      {/* Empty State */}
      {(!bookings || bookings.length === 0) && (
        <EmptyState
          icon="📝"
          title="No active bookings yet"
          description="Go to the Jobs tab and accept a job to start working with guaranteed escrow payment."
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
          <Card key={b.id} highlight={!isPaid && !isCancelled} className="space-y-4">
            {/* Header: Job Title & Status Pill */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-navy-950 leading-tight">
                  {b.job?.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-0.5">
                  <MapPin size={13} className="text-rose-500" />
                  <span>{b.job?.site}</span>
                  <span>·</span>
                  <span className="font-bold text-navy-800">{b.contractor?.name}</span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                <span
                  className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : isCheckedIn
                      ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                      : isCompleted
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : isCancelled
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {b.status.replace('_', ' ')}
                </span>
                <span className="text-base font-black text-navy-950">₹{b.job?.wage}</span>
              </div>
            </div>

            {/* Wage Countdown & Timeline (PDF Feature 6) */}
            <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-navy-900">
                  <Clock size={14} className="text-safety-600" />
                  <span>Wage Due Status:</span>
                  <span className="font-bold text-navy-950">
                    {isPaid ? 'Completed & Settled' : 'Due Today by 6:00 PM'}
                  </span>
                </div>
                {b.funded ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[11px] border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck size={12} /> Escrow Locked
                  </span>
                ) : (
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[11px] border border-amber-200">
                    Escrow Pending
                  </span>
                )}
              </div>

              {/* Status Timeline */}
              <div className="grid grid-cols-4 gap-1 text-center pt-1">
                {[
                  { step: '1. Escrow', done: b.funded },
                  { step: '2. Check In', done: !!b.checkInAt },
                  { step: '3. End Shift', done: !!b.checkOutAt },
                  { step: '4. Wage Paid', done: isPaid },
                ].map((st, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                        st.done
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {st.done ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-semibold leading-tight ${
                        st.done ? 'text-navy-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {st.step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* GPS attendance info if checked in */}
            {b.checkInAt && (
              <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span>
                    Shift start recorded: {new Date(b.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {b.gps && (
                  <span className="text-[11px] font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    📍 GPS Verified
                  </span>
                )}
              </div>
            )}

            {/* Step: Accepted -> Check In with OTP / QR */}
            {isAccepted && (
              <div className="space-y-2.5 pt-1">
                <div className="p-3 bg-safety-50 rounded-2xl border border-safety-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-navy-950 uppercase tracking-wide">
                      Site Attendance Verification
                    </span>
                    <button
                      onClick={() => handleQrSimulation(b.job?.otp)}
                      className="text-xs font-bold text-navy-900 bg-white hover:bg-slate-100 px-2 py-1 rounded-lg border border-slate-300 flex items-center gap-1 shadow-2xs"
                    >
                      <QrCode size={13} />
                      <span>Scan Site QR</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 4-digit Site OTP (e.g. 4821)"
                      value={siteOtp}
                      onChange={(e) => setSiteOtp(e.target.value)}
                      className="flex-1 bg-white border-2 border-slate-300 focus:border-safety rounded-xl px-3 py-2.5 text-base font-mono font-bold text-navy-950 tracking-widest text-center"
                    />
                    <button
                      onClick={() => setSiteOtp(b.job?.otp || '4821')}
                      className="px-3 bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 rounded-xl"
                      title="Auto-fill seeded OTP"
                    >
                      Use OTP
                    </button>
                  </div>
                </div>

                <LargeIconButton
                  icon="📍"
                  label={t('checkIn')}
                  sublabel="Verifies GPS location & site OTP"
                  variant="yellow"
                  disabled={!siteOtp.trim()}
                  onClick={() => onCheckIn(b.id, siteOtp)}
                />
              </div>
            )}

            {/* Step: Checked In -> End Shift */}
            {isCheckedIn && (
              <div className="space-y-2 pt-1">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
                  Worker active on site. When the day's work is finished, tap "Complete Shift" to request payment release.
                </div>
                <LargeIconButton
                  icon="🏁"
                  label={t('endShift')}
                  sublabel="Records end-of-shift timestamp"
                  variant="navy"
                  onClick={() => onCheckOut(b.id)}
                />
              </div>
            )}

            {/* Payout Method selection (while not yet paid or cancelled) */}
            {!isPaid && !isCancelled && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-navy-900 flex items-center gap-1">
                  <Banknote size={15} />
                  <span>{t('payoutMethod')}:</span>
                </span>
                <select
                  value={b.payMethod || 'UPI'}
                  onChange={(e) => onSetPayMethod(b.id, e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-navy-950 focus:outline-none"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe)</option>
                  <option value="Bank transfer">Direct Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cash">Cash at Site</option>
                </select>
              </div>
            )}

            {/* Paid State Actions: Cash Ack, Instant Payout, Contractor Trust Rating */}
            {isPaid && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle size={15} className="text-emerald-600" />
                    <span>Wage Paid: ₹{b.job?.wage} via {b.payMethod}</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    +1 Passport Day
                  </span>
                </div>

                {/* Cash Payment Acknowledgement (PDF Feature 7) */}
                {b.payMethod === 'Cash' && (
                  <div className="pt-2 border-t border-emerald-200/80">
                    <button
                      disabled={b.cashAck}
                      onClick={() => onCashAck(b.id)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        b.cashAck
                          ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                          : 'bg-white hover:bg-slate-50 text-navy-900 border-2 border-emerald-500 shadow-sm'
                      }`}
                    >
                      <FileCheck size={15} />
                      <span>{b.cashAck ? '✓ Cash Payment Acknowledged (Recorded in Passport)' : t('confirmCashReceipt')}</span>
                    </button>
                    <PainPointTag text="Cash payments leave no proof of wages paid" persona="worker" />
                  </div>
                )}

                {/* Instant Payout (PDF Feature 1 & 2.5) */}
                {b.payMethod !== 'Cash' && (
                  <div>
                    <button
                      disabled={b.instant}
                      onClick={() => onInstantPayout(b.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        b.instant
                          ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                          : 'bg-navy-800 hover:bg-navy-700 text-white shadow-sm'
                      }`}
                    >
                      <Zap size={14} className="text-safety" />
                      <span>{b.instant ? '⚡ Instant UPI Payout Settled to Bank' : t('instantPayout')}</span>
                    </button>
                  </div>
                )}

                {/* Rate Contractor Trust Score (PDF Feature 8) */}
                <div className="pt-2 border-t border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-navy-950">
                    <span>{t('rateContractor')}:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => onRateContractor(b.id, star, contractorComment)}
                          className="text-lg transition hover:scale-125"
                          title={`Rate ${star} stars`}
                        >
                          <Star
                            size={18}
                            className={
                              (b.contractorRating || 0) >= star
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300'
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <PainPointTag text="Workers have no idea if a new contractor pays on time or is trustworthy" persona="worker" />
                </div>
              </div>
            )}

            {/* Cancelled State (PDF Feature 10) */}
            {isCancelled && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                  <span className="flex items-center gap-1">
                    <AlertCircle size={14} /> Contractor Cancelled Late
                  </span>
                  <span className="bg-rose-200 text-rose-950 px-2 py-0.5 rounded-full font-black">
                    +₹150 Compensation Credited
                  </span>
                </div>
                <PainPointTag text="Worker travels to site and loses a whole day's wage on last-minute cancellation" persona="worker" />
              </div>
            )}

            {/* Wage Dispute / Claim button (PDF Feature 5) */}
            <div className="pt-1 flex items-center justify-between">
              {b.claim ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-300 w-full">
                  <AlertCircle size={14} />
                  <span>{t('claimRaised')}: Attendance logs & GPS submitted for arbitration</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedBookingForClaim(b.id);
                    setShowClaimModal(true);
                  }}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1"
                >
                  <AlertCircle size={13} />
                  <span>{t('raiseClaim')}</span>
                </button>
              )}
            </div>
            {b.claim && (
              <PainPointTag text="Contractor not paying for 10 days; worker has no recourse" persona="worker" />
            )}
          </Card>
        );
      })}

      {/* Minimum Wage Checker Card (PDF Feature 11) */}
      {minWageData && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-safety-400">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 block">
                Official Minimum Wage Benchmark
              </span>
              <h4 className="text-base font-black text-navy-950">
                {minWageData.skill} Rate: ₹{minWageData.range[0]} - ₹{minWageData.range[1]} / day
              </h4>
              <p className="text-xs text-slate-600 mt-1">{minWageData.note}</p>
            </div>
            <span className="text-2xl">⚖️</span>
          </div>
          <PainPointTag text="Workers don't know government minimum wage rules and accept underpayment" persona="worker" />
        </Card>
      )}

      {/* Wage Dispute Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-rose-500 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertCircle size={24} />
              <h3 className="text-lg font-black text-navy-950">Raise Wage Dispute</h3>
            </div>
            <p className="text-xs text-slate-600">
              Submit an official wage claim. Your digital check-in time and GPS attendance records will be automatically attached as proof.
            </p>
            <textarea
              rows={3}
              placeholder="State reason: e.g. Contractor has not released escrow after shift completion..."
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              className="w-full text-xs p-3 border-2 border-slate-200 focus:border-rose-500 rounded-xl"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowClaimModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => submitClaim(selectedBookingForClaim)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md"
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
