import { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { api } from '../api';
import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  MapPin,
  Calculator,
  MessageSquare,
  Briefcase,
  Banknote,
  Send,
} from 'lucide-react';

export default function MukkadamApp({ user, jobsState, activeTab }) {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const { crew, crewJobs, refresh } = jobsState;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Helper');
  const [newMemberDays, setNewMemberDays] = useState('5');

  const [totalWage, setTotalWage] = useState('2800');
  const [splitMode, setSplitMode] = useState('role_days');
  const [splitResult, setSplitResult] = useState(null);
  const [alertsSent, setAlertsSent] = useState(false);
  const [crewAvailable, setCrewAvailable] = useState(true);

  const presentCount = crew?.filter((c) => c.present).length || 0;

  // Toggle Member Attendance
  const handleToggleAttendance = async (crewId) => {
    try {
      await api(`/crew/${crewId}/toggle`, { method: 'POST' });
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Bulk Mark All Present / Absent
  const handleBulkAttendance = async (present) => {
    try {
      for (const member of crew || []) {
        if (member.present !== present) {
          await api(`/crew/${member.id}/toggle`, { method: 'POST' });
        }
      }
      addToast(present ? 'All crew members marked Present!' : 'All crew marked Absent', 'info');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Add Crew Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      addToast('Worker name is required', 'warning');
      return;
    }
    try {
      await api('/crew', {
        method: 'POST',
        body: { name: newMemberName, role: newMemberRole, days: Number(newMemberDays) },
      });
      setNewMemberName('');
      setShowAddForm(false);
      addToast(`${newMemberName} added to crew profile!`, 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Bulk Book Job for Entire Crew
  const handleBookJob = async (jobId) => {
    try {
      const res = await api('/crew/book', { method: 'POST', body: { jobId } });
      addToast(`Crew of ${res.size} workers booked successfully!`, 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Calculate Wage Split
  const handleCalculateSplit = async (e) => {
    e.preventDefault();
    if (!totalWage || Number(totalWage) <= 0) {
      addToast('Enter a valid wage amount', 'warning');
      return;
    }
    try {
      const res = await api('/crew/split', {
        method: 'POST',
        body: { total: Number(totalWage), mode: splitMode },
      });
      setSplitResult(res);
      setAlertsSent(false);
      addToast('Fair wage split calculated!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 select-none">
      {/* ============================================================ */}
      {/* TAB 1: CREW LIST (Add/Manage Crew & Set Availability)        */}
      {/* ============================================================ */}
      {activeTab === 'crew_list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <span>👥</span>
                <span>{t('squadManagement')} ({crew?.length || 0})</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">{t('squadReadiness')}</p>
            </div>
            <Badge variant="success" size="md">
              {presentCount} Ready
            </Badge>
          </div>

          {/* Squad Availability Card */}
          <Card highlight={crewAvailable}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">{t('squadAvailability')}</h3>
                <p className="text-xs text-slate-500">
                  {crewAvailable ? '🟢 Contractors see your whole crew available for booking' : 'Crew availability paused'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={crewAvailable}
                  onChange={(e) => {
                    setCrewAvailable(e.target.checked);
                    addToast(e.target.checked ? 'Crew marked available for hire' : 'Crew marked busy', 'info');
                  }}
                />
                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner" />
              </label>
            </div>
          </Card>

          {/* Add Crew Member Trigger */}
          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full py-3.5 px-3 bg-white hover:bg-gray-50 border-2 border-dashed border-slate-300 rounded-3xl text-xs font-black text-slate-900 transition flex items-center justify-center gap-2 shadow-2xs"
            >
              <UserPlus size={16} />
              <span>{t('addWorker')}</span>
            </button>
          ) : (
            <Card className="border-2 border-yellow-400 bg-yellow-50/50">
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wide">
                  New Crew Member
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕ Cancel
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dilip Gaikwad"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Trade Role</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-950"
                    >
                      <option value="Mason">Mason (1.3x)</option>
                      <option value="Helper">Helper (1.0x)</option>
                      <option value="Painter">Painter (1.2x)</option>
                      <option value="Electrician">Electrician (1.4x)</option>
                      <option value="Plumber">Plumber (1.3x)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Shifts Completed</label>
                    <input
                      type="number"
                      value={newMemberDays}
                      onChange={(e) => setNewMemberDays(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-950"
                    />
                  </div>
                </div>

                <Button size="md" variant="navy" type="submit">
                  Save to Crew
                </Button>
              </form>
            </Card>
          )}

          {/* Crew Members List */}
          <div className="space-y-2.5">
            {crew?.map((c) => (
              <Card key={c.id} className="flex items-center justify-between gap-3 p-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {c.role === 'Mason' ? '🧱' : c.role === 'Painter' ? '🎨' : '📦'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-950">{c.name}</h4>
                      <Badge variant="neutral">{c.role || 'Worker'}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      <span>{c.days || 1} shifts completed</span>
                      {c.phone && <span> · <span className="font-mono">{c.phone}</span></span>}
                    </div>
                  </div>
                </div>

                <Badge variant={c.present ? 'success' : 'neutral'}>
                  {c.present ? 'Ready' : 'Off-Duty'}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: GROUP JOBS (Accept for Entire Crew)                   */}
      {/* ============================================================ */}
      {activeTab === 'group_jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <span>💼</span>
                <span>{t('groupJobsTitle')}</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Book contract jobs for all {presentCount} present crew members
              </p>
            </div>
            <Badge variant="yellow">{presentCount} Active Workers</Badge>
          </div>

          {presentCount === 0 && (
            <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs font-bold text-amber-950">
              ⚠️ No crew members are marked present. Go to "Crew Attendance" to mark attendance first.
            </div>
          )}

          {(!crewJobs?.jobs || crewJobs.jobs.length === 0) && (
            <EmptyState
              icon="📋"
              title="No open crew jobs"
              description="Contractors post group requirements for full masonry squads."
            />
          )}

          <div className="space-y-3">
            {crewJobs?.jobs?.map((j) => {
              const totalPayout = j.wage * (presentCount || 4);

              return (
                <Card key={j.id} highlight={j.booked} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-slate-950">{j.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mt-0.5">
                        <MapPin size={13} className="text-rose-500" />
                        <span>{j.site}</span>
                        <span>·</span>
                        <span className="text-slate-900">{j.contractor?.name}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-950 block font-mono">₹{j.wage}/day</span>
                      <span className="text-[10px] text-slate-400 font-bold">{t('perWorker')}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-2xl border flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">{t('totalSquadDailyWage')} ({presentCount} members):</span>
                    <span className="text-emerald-700 text-sm font-black font-mono">₹{totalPayout}</span>
                  </div>

                  <Button
                    icon={j.booked ? '✓' : '👥'}
                    sublabel={j.booked ? 'Contractor alerted' : `Accepts job for all ${presentCount} present workers`}
                    variant={j.booked ? 'success' : 'yellow'}
                    disabled={j.booked || presentCount === 0}
                    onClick={() => handleBookJob(j.id)}
                  >
                    {j.booked ? t('crewBookedConfirmed') : `${t('acceptForCrewCount')} (${presentCount})`}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: CREW ATTENDANCE (Bulk Toggle Switches)                */}
      {/* ============================================================ */}
      {activeTab === 'crew_attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <span>✅</span>
                <span>{t('crewAttendanceTitle')}</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Bulk toggle switches for site check-in</p>
            </div>
            <Badge variant="success">{presentCount} Present</Badge>
          </div>

          {/* Quick Bulk Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleBulkAttendance(true)}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-2xl text-xs font-black text-emerald-900 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>{t('markAllPresent')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkAttendance(false)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-2xl text-xs font-black text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <XCircle size={15} />
              <span>{t('markAllAbsent')}</span>
            </button>
          </div>

          {/* Toggle Switches for Each Member */}
          <div className="space-y-2.5">
            {crew?.map((c) => (
              <Card key={c.id} className="flex items-center justify-between gap-3 p-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {c.role === 'Mason' ? '🧱' : c.role === 'Painter' ? '🎨' : '📦'}
                  </span>
                  <div>
                    <h4 className="font-black text-sm text-slate-950">{c.name}</h4>
                    <span className="text-xs text-slate-500 font-semibold">{c.role}</span>
                  </div>
                </div>

                {/* Bulk Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleAttendance(c.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-2xs select-none cursor-pointer ${
                    c.present
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {c.present ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{c.present ? t('present') : t('absent')}</span>
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: WAGE SPLITTER (Smart Fair Calculator with Remainder)  */}
      {/* ============================================================ */}
      {activeTab === 'wage_splitter' && (
        <div className="space-y-4">
          <div className="px-1">
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <span>➗</span>
              <span>{t('wageSplitterTitle')}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t('wageSplitterDesc')}
            </p>
          </div>

          {/* Calculator Card */}
          <Card className="border-2 border-yellow-400 space-y-4">
            <form onSubmit={handleCalculateSplit} className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  {t('lumpSumWage')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-black text-lg text-slate-900">₹</span>
                  <input
                    type="number"
                    value={totalWage}
                    onChange={(e) => setTotalWage(e.target.value)}
                    placeholder="2800"
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-yellow-400 rounded-2xl pl-9 pr-4 py-2.5 text-xl font-black text-slate-950 font-mono"
                  />
                </div>
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">{t('distributionFormula')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSplitMode('role_days')}
                    className={`p-2.5 rounded-2xl border-2 text-xs font-black transition text-left flex items-center gap-2 select-none cursor-pointer ${
                      splitMode === 'role_days'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{t('weightedSplit')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSplitMode('equal')}
                    className={`p-2.5 rounded-2xl border-2 text-xs font-black transition text-left flex items-center gap-2 select-none cursor-pointer ${
                      splitMode === 'equal'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{t('equalSplit')}</span>
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border text-[11px] font-bold text-slate-600 flex justify-between">
                <span>Present: {presentCount} members</span>
                <span>Mode: {splitMode === 'role_days' ? 'Mason 1.3x, Helper 1.0x' : 'Exact equal'}</span>
              </div>

              <Button variant="yellow" type="submit">
                {t('computeDistribution')}
              </Button>
            </form>
          </Card>

          {/* Breakdown Results with Exact Remainder */}
          {splitResult && (
            <Card className="space-y-3.5 border-2 border-emerald-400 bg-emerald-50/40">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-950">{t('calculatedDistribution')}</h3>
                  <p className="text-[11px] text-slate-500 font-bold">
                    {t('totalAcrossPresentCrew')}: ₹{splitResult.total}
                  </p>
                </div>
                {splitResult.remainder > 0 && (
                  <Badge variant="warning">₹{splitResult.remainder} {t('remainderBuffer')}</Badge>
                )}
              </div>

              <div className="space-y-2">
                {splitResult.shares?.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                      s.present
                        ? 'bg-white border-emerald-200 shadow-2xs'
                        : 'bg-slate-100/70 border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-950">{s.name}</span>
                        <Badge variant="neutral">{s.role}</Badge>
                        {!s.present && <Badge variant="danger">{t('absent')}</Badge>}
                      </div>
                      {s.present && s.days && (
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {s.days} shifts completed
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-800 font-mono">
                        ₹{s.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setAlertsSent(true);
                  addToast('Simulated: WhatsApp breakdown receipts sent to all crew members!', 'success');
                }}
                className={`w-full py-3 px-3 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                  alertsSent
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <MessageSquare size={16} />
                <span>
                  {alertsSent
                    ? t('whatsappReceiptsDispatched')
                    : t('whatsappReceiptsBroadcast')}
                </span>
              </button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
