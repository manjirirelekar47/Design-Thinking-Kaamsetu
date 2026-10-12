import { useState } from 'react';
import Card from '../common/Card';
import PainPointTag from '../common/PainPointTag';
import {
  TrendingUp,
  Users,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Star,
} from 'lucide-react';

export default function ContractorDashboardTab({ analytics, user }) {
  const [activeDayIndex, setActiveDayIndex] = useState(4); // default Friday

  const chartData = analytics?.chartData || [
    { day: 'Mon', workers: 4, wagePaid: 2800, escrow: 700 },
    { day: 'Tue', workers: 5, wagePaid: 3500, escrow: 700 },
    { day: 'Wed', workers: 6, wagePaid: 4200, escrow: 1400 },
    { day: 'Thu', workers: 5, wagePaid: 3500, escrow: 700 },
    { day: 'Fri', workers: 7, wagePaid: 4900, escrow: 2100 },
    { day: 'Sat', workers: 6, wagePaid: 4200, escrow: 1400 },
    { day: 'Sun', workers: 3, wagePaid: 2100, escrow: 0 },
  ];

  const maxWorkers = Math.max(...chartData.map((d) => d.workers), 8);
  const maxWage = Math.max(...chartData.map((d) => d.wagePaid), 5000);

  const selectedData = chartData[activeDayIndex] || chartData[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
          <span>📊</span>
          <span>Operations & Wage Analytics</span>
        </h2>
        <span className="text-xs font-bold bg-navy-100 text-navy-900 px-2.5 py-1 rounded-full">
          Live Site Metrics
        </span>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <Card className="text-center p-3">
          <span className="text-xs font-bold text-slate-500 block uppercase">Active on Site</span>
          <span className="text-2xl font-black text-navy-950 block my-0.5">
            {analytics?.active || 0}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
            ● Checked In
          </span>
        </Card>

        <Card className="text-center p-3">
          <span className="text-xs font-bold text-slate-500 block uppercase">Locked in Escrow</span>
          <span className="text-2xl font-black text-safety-600 block my-0.5">
            ₹{(analytics?.escrowHeld || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full inline-block">
            Guaranteed
          </span>
        </Card>

        <Card className="text-center p-3">
          <span className="text-xs font-bold text-slate-500 block uppercase">Total Paid Out</span>
          <span className="text-2xl font-black text-emerald-600 block my-0.5">
            ₹{(analytics?.paidOut || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Completed Shifts</span>
        </Card>

        <Card className="text-center p-3">
          <span className="text-xs font-bold text-slate-500 block uppercase">Jobs Posted</span>
          <span className="text-2xl font-black text-navy-950 block my-0.5">
            {analytics?.jobs || 0}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">All Sites</span>
        </Card>

        <Card className="text-center p-3">
          <span className="text-xs font-bold text-slate-500 block uppercase">Crew Booked</span>
          <span className="text-2xl font-black text-navy-950 block my-0.5">
            {analytics?.crewBooked || 0}
          </span>
          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full inline-block">
            Mukkadam Teams
          </span>
        </Card>

        <Card className="text-center p-3">
          <span className="text-xs font-bold text-slate-500 block uppercase">Open Claims</span>
          <span className="text-2xl font-black text-rose-600 block my-0.5">
            {analytics?.claims || 0}
          </span>
          <span className="text-[10px] text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded-full inline-block">
            Disputes
          </span>
        </Card>
      </div>

      {/* Visual Chart: 7-Day Attendance & Wage Liabilities Trend */}
      <Card className="space-y-4 border-2 border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-navy-950 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-safety-600" />
              <span>7-Day Attendance & Wage Liability Chart</span>
            </h3>
            <p className="text-xs text-slate-500">
              Daily worker counts & wage settlement velocity
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-navy-900">
              <span className="w-2.5 h-2.5 bg-navy-800 rounded-sm inline-block" /> Workers
            </span>
            <span className="flex items-center gap-1 text-safety-600">
              <span className="w-2.5 h-2.5 bg-safety rounded-sm inline-block" /> Escrow
            </span>
          </div>
        </div>

        {/* Interactive SVG Bar & Trend Chart */}
        <div className="relative pt-2 pb-1 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
          <div className="h-44 flex items-end justify-between gap-2 px-2">
            {chartData.map((d, idx) => {
              const workerHeightPct = Math.round((d.workers / maxWorkers) * 100);
              const escrowHeightPct = Math.round((d.escrow / 2500) * 100);
              const isSelected = activeDayIndex === idx;

              return (
                <div
                  key={d.day}
                  onClick={() => setActiveDayIndex(idx)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Tooltip badge */}
                  <span
                    className={`text-[10px] font-bold px-1 rounded transition-opacity mb-1 ${
                      isSelected
                        ? 'bg-navy-900 text-white'
                        : 'text-slate-400 group-hover:text-slate-800'
                    }`}
                  >
                    {d.workers}👷
                  </span>

                  {/* Dual Bar stack */}
                  <div className="w-full max-w-[28px] flex items-end gap-1 h-32 justify-center">
                    {/* Worker bar in Navy */}
                    <div
                      style={{ height: `${workerHeightPct}%` }}
                      className={`w-3 rounded-t-md transition-all ${
                        isSelected
                          ? 'bg-navy-900 shadow-md ring-2 ring-safety'
                          : 'bg-navy-700/80 hover:bg-navy-900'
                      }`}
                    />
                    {/* Escrow bar in Safety Yellow */}
                    <div
                      style={{ height: `${Math.max(escrowHeightPct, 8)}%` }}
                      className={`w-3 rounded-t-md transition-all ${
                        isSelected
                          ? 'bg-safety shadow-md'
                          : 'bg-safety-400/80 hover:bg-safety'
                      }`}
                    />
                  </div>

                  {/* Day label */}
                  <span
                    className={`text-xs font-bold mt-2 ${
                      isSelected ? 'text-navy-950 font-black' : 'text-slate-500'
                    }`}
                  >
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Interactive day detail card */}
          {selectedData && (
            <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-navy-950">{selectedData.day} Breakdown:</span>
                <span className="text-slate-500 ml-1.5">{selectedData.workers} workers on site</span>
              </div>
              <div className="flex gap-2 font-bold">
                <span className="text-emerald-700">Paid: ₹{selectedData.wagePaid}</span>
                <span>·</span>
                <span className="text-amber-700">In Escrow: ₹{selectedData.escrow}</span>
              </div>
            </div>
          )}
        </div>

        <PainPointTag text="Contractors struggle to manage reliable workers, attendance reconciliation, and weekly wage payroll" persona="contractor" />
      </Card>

      {/* Contractor Trust & Reliability Scorecard */}
      <Card className="bg-gradient-to-r from-navy-900 to-navy-800 text-white border-navy-700 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-safety" />
            <span>Your Contractor Trust Scorecard</span>
          </h3>
          <span className="text-[10px] font-bold bg-safety text-navy-950 px-2 py-0.5 rounded-full">
            Public Rating
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-1">
          <div className="p-3 bg-navy-800/80 rounded-xl border border-navy-700">
            <span className="text-2xl font-black text-safety block">
              {user?.rating || 4.2} / 5.0
            </span>
            <span className="text-[10px] text-slate-300 uppercase font-semibold">Worker Satisfaction</span>
          </div>

          <div className="p-3 bg-navy-800/80 rounded-xl border border-navy-700">
            <span className="text-2xl font-black text-emerald-400 block">
              {user?.onTimePct || 92}%
            </span>
            <span className="text-[10px] text-slate-300 uppercase font-semibold">On-Time Wage Release</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed text-center">
          High trust scores give your site posts priority placement in workers' WhatsApp and app job alerts.
        </p>
      </Card>
    </div>
  );
}
