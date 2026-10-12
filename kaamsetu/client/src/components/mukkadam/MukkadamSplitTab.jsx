import { useState } from 'react';
import Card from '../common/Card';
import PainPointTag from '../common/PainPointTag';
import { useToast } from '../../context/ToastContext';
import { Calculator, Send, CheckCircle2, Split, UserCheck, MessageSquare } from 'lucide-react';

export default function MukkadamSplitTab({ onSplitWage, splitResult, crew }) {
  const { addToast } = useToast();
  const [totalWage, setTotalWage] = useState('2800');
  const [mode, setMode] = useState('role_days'); // 'role_days' or 'equal'
  const [alertsSent, setAlertsSent] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!totalWage || Number(totalWage) <= 0) {
      addToast('Please enter total wage amount received', 'warning');
      return;
    }
    setAlertsSent(false);
    try {
      await onSplitWage(Number(totalWage), mode);
      addToast('Wage split computed fairly!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSendAlerts = () => {
    setAlertsSent(true);
    addToast('Simulated: WhatsApp breakdown notifications sent to all crew members!', 'success');
  };

  const presentCount = crew?.filter((c) => c.present).length || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
          <span>➗</span>
          <span>Crew Wage-Split Calculator</span>
        </h2>
        <p className="text-xs text-slate-500">
          Transparent, dispute-free daily wage distribution for your crew
        </p>
      </div>

      {/* Calculator input card */}
      <Card className="border-2 border-safety-400 space-y-3.5">
        <form onSubmit={handleCalculate} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Total Lump-Sum Wage Received from Contractor (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-black text-base text-navy-900">₹</span>
              <input
                type="number"
                value={totalWage}
                onChange={(e) => setTotalWage(e.target.value)}
                placeholder="2800"
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-safety rounded-xl pl-8 pr-4 py-2.5 text-lg font-black text-navy-950"
              />
            </div>
          </div>

          {/* Mode Selector (PDF Feature 9: fair split by days and role) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Split Formula</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('role_days')}
                className={`p-2.5 rounded-xl border-2 text-xs font-extrabold transition text-left flex items-center gap-2 ${
                  mode === 'role_days'
                    ? 'border-navy-900 bg-navy-800 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>⚖️ Fair by Role & Days</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('equal')}
                className={`p-2.5 rounded-xl border-2 text-xs font-extrabold transition text-left flex items-center gap-2 ${
                  mode === 'equal'
                    ? 'border-navy-900 bg-navy-800 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>🟰 Equal Split (All Present)</span>
              </button>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border text-[11px] font-medium text-slate-600 flex justify-between items-center">
            <span>Crew Present: <b>{presentCount} members</b></span>
            <span>Formula: <b>{mode === 'role_days' ? 'Mason 1.3x, Helper 1.0x × Days' : 'Equal 1/N'}</b></span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-safety hover:bg-safety-400 text-navy-950 font-black rounded-xl text-sm shadow-yellow transition"
          >
            Calculate Fair Shares
          </button>
        </form>
      </Card>

      {/* Split Result Breakdown */}
      {splitResult && (
        <Card className="space-y-3.5 border-2 border-emerald-400 bg-emerald-50/30">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="text-sm font-black text-navy-950">Calculated Distribution</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Total ₹{splitResult.total} across {splitResult.shares?.filter((s) => s.present).length} present workers
              </p>
            </div>
            {splitResult.remainder > 0 && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                ₹{splitResult.remainder} rounding buffer
              </span>
            )}
          </div>

          {/* Members share list */}
          <div className="space-y-2">
            {splitResult.shares?.map((s) => (
              <div
                key={s.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  s.present
                    ? 'bg-white border-emerald-200 shadow-2xs'
                    : 'bg-slate-100/70 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-navy-950">{s.name}</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                      {s.role}
                    </span>
                    {!s.present && (
                      <span className="text-[10px] font-bold text-rose-600">(Absent)</span>
                    )}
                  </div>
                  {s.present && s.days && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      {s.days} days completed
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span
                    className={`text-base font-black ${
                      s.present ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    ₹{s.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp share alert button */}
          <button
            onClick={handleSendAlerts}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
              alertsSent
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <MessageSquare size={15} />
            <span>
              {alertsSent
                ? '✓ WhatsApp Split Breakdown Sent to Crew'
                : 'Broadcast Split Receipts via WhatsApp'}
            </span>
          </button>
        </Card>
      )}

      <PainPointTag text="Mukkadam manages payments manually in cash; constant arguments on site about unfair cuts" persona="mukkadam" />
    </div>
  );
}
