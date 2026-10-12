import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../api';
import {
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  Lock,
  Zap,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Star,
  Search,
  MapPin,
  Calendar,
  AlertTriangle,
  FileCheck,
  DollarSign,
  Briefcase,
  Camera,
  QrCode,
  UserCheck,
  Check,
} from 'lucide-react';

export default function ContractorDashboard({
  user,
  jobsState,
  activeTab: propActiveTab,
  onSelectTab,
  onInspectPassport,
  onVerifyContractor,
}) {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const { jobs, bookings, availableWorkers, contractorAnalytics, crewBookings, refresh } = jobsState;

  // Tabs: 'dashboard', 'verification', 'active_sites'
  const [internalTab, setInternalTab] = useState('dashboard');
  const activeTab = propActiveTab || internalTab;
  const setActiveTab = onSelectTab || setInternalTab;

  // View mode for Active Sites: 'kanban' or 'list'
  const [viewMode, setViewMode] = useState('kanban');

  // Verification tab states
  const [lookupQuery, setLookupQuery] = useState('');
  const [scannedWorker, setScannedWorker] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);

  // Post Job Form
  const [form, setForm] = useState({
    title: 'Mason & Plastering Crew',
    site: 'Baner Highstreet Site B, Pune',
    wage: '800',
    workersNeeded: '2',
    duration: '3 days',
    escrowFunded: true,
  });

  // Escrow Deposit Modal
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('10000');

  // Worker Review state
  const [reviewComments, setReviewComments] = useState({});

  const releasableBookings = bookings?.filter((b) => b.status === 'completed' && b.funded) || [];

  // Top up Escrow Pool
  const handleDepositEscrow = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) {
      addToast('Enter a valid deposit amount', 'warning');
      return;
    }
    try {
      const res = await api('/contractor/deposit-escrow', {
        method: 'POST',
        body: { amount: Number(depositAmount) },
      });
      setShowDepositModal(false);
      if (user && res.escrowBalance !== undefined) {
        user.escrowBalance = res.escrowBalance;
      }
      addToast(`₹${Number(depositAmount).toLocaleString('en-IN')} deposited into escrow pool!`, 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Post Job
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.site.trim() || !form.wage) {
      addToast('Fill in title, site location, and wage', 'warning');
      return;
    }
    try {
      await api('/jobs', {
        method: 'POST',
        body: {
          title: form.title,
          site: form.site,
          wage: Number(form.wage),
          workersNeeded: Number(form.workersNeeded),
          duration: form.duration,
          escrowFunded: form.escrowFunded,
        },
      });
      setForm({
        title: '',
        site: '',
        wage: '750',
        workersNeeded: '2',
        duration: '2 days',
        escrowFunded: true,
      });
      addToast('Job posted! WhatsApp & SMS job alerts dispatched to nearby workers.', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Pre-fund booking into Escrow
  const handleFund = async (bookingId) => {
    try {
      await api(`/bookings/${bookingId}/fund`, { method: 'POST' });
      addToast('Daily wage locked in secure Escrow! Worker notified.', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // 1-Click Approve & Release Wage (Enabled only if completed & funded)
  const handleRelease = async (bookingId) => {
    try {
      await api(`/bookings/${bookingId}/release`, { method: 'POST' });
      addToast('Wage approved & released! Worker Digital Passport updated.', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // 1-Click Release All eligible shifts
  const handleReleaseAll = async () => {
    try {
      const res = await api('/bookings/release-all', { method: 'POST' });
      addToast(`⚡ One-click release: ${res.releasedCount} workers paid simultaneously!`, 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Cancel shift with automatic ₹150 penalty compensation
  const handleCancel = async (bookingId) => {
    try {
      await api(`/bookings/${bookingId}/cancel`, { method: 'POST' });
      addToast('Shift cancelled. ₹150 penalty compensation automatically credited to worker.', 'warning');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Rate worker trust
  const handleRate = async (bookingId, stars) => {
    try {
      const comment = reviewComments[bookingId] || 'Punctual & skilled work completed';
      await api(`/bookings/${bookingId}/rate`, {
        method: 'POST',
        body: { stars, comment },
      });
      addToast(`Worker trust rated ${stars} stars!`, 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Cash handover confirmation
  const handleCashAck = async (bookingId) => {
    try {
      await api(`/bookings/${bookingId}/cash-contractor-ack`, { method: 'POST' });
      addToast('Cash handover recorded on platform audit ledger', 'success');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Passport Lookup / Verification
  const lookupWorkerPassport = async (query) => {
    if (!query?.trim()) return;
    setLoadingLookup(true);
    try {
      const data = await api(`/passport/${query.trim()}`);
      setScannedWorker(data);
      addToast(`Verified Wage Passport retrieved for ${data.name}!`, 'success');
    } catch (err) {
      addToast(err.message || 'Worker passport not found', 'error');
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    lookupWorkerPassport(lookupQuery);
  };

  // Simulate scanning worker QR code with camera
  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      lookupWorkerPassport('u1'); // Ramesh Pawar (9000000001)
    }, 1200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-20 select-none">
      {/* Top Banner: Verification Alert if unverified */}
      {!user?.verified ? (
        <Card className="bg-amber-50 border-2 border-amber-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldAlert size={24} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-amber-950">
                  Unverified Contractor Account (Shree Infra)
                </h3>
                <p className="text-xs text-amber-800">
                  Verify GST and trade registration credentials to unlock lower escrow thresholds and worker trust.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onVerifyContractor}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black rounded-xl text-xs transition whitespace-nowrap shadow-md cursor-pointer"
            >
              🛡️ Verify Business (GST Check)
            </button>
          </div>
        </Card>
      ) : (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-300 rounded-3xl text-xs font-bold text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Verified Builder Account (GST Active) · {user.name || 'Patil Builders'}</span>
          </div>
          <Badge variant="success">⭐ Rating: {user?.rating || 4.8} / 5.0</Badge>
        </div>
      )}

      {/* Role Navigation Bar: Strict 3 Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 sm:gap-2">
        {[
          { id: 'dashboard', icon: '📊', label: t('dashboardTab') },
          { id: 'verification', icon: '🪪', label: t('verificationTab') },
          { id: 'active_sites', icon: '🏗️', label: t('activeSitesTab') },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-yellow-400 shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: DASHBOARD (Top Stat Cards + Post Job + 7-Day Chart)   */}
      {/* ============================================================ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top-Level Stat Cards with CSS/SVG Sparklines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Escrow Balance */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                  {t('escrowBalance')}
                </span>
                <button
                  type="button"
                  onClick={() => setShowDepositModal(true)}
                  className="text-[11px] font-black text-slate-900 bg-yellow-400 hover:bg-yellow-300 px-2.5 py-1 rounded-xl transition cursor-pointer shadow-xs"
                >
                  {t('topUp')}
                </button>
              </div>

              <div className="my-2">
                <span className="text-3xl font-black text-slate-950 font-mono tracking-tight">
                  ₹{(contractorAnalytics?.escrowBalance ?? user?.escrowBalance ?? 25000).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                  ● {t('statEscrowSubtitle')}
                </span>
              </div>

              {/* Sparkline */}
              <div className="h-8 w-full mt-1">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path
                    d="M0 20 Q25 5, 50 15 T100 8"
                    fill="none"
                    stroke="#FFC22E"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 2: Active Workers on Site */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                  {t('activeOnSite')}
                </span>
                <Badge variant="yellow">{contractorAnalytics?.active || bookings?.filter((b) => b.status === 'checked_in').length || 0} Working</Badge>
              </div>

              <div className="my-2">
                <span className="text-3xl font-black text-slate-950 font-mono tracking-tight">
                  {contractorAnalytics?.active || bookings?.filter((b) => b.status === 'checked_in').length || 0}
                </span>
                <span className="text-xs font-bold text-slate-500 block mt-0.5">
                  {t('statWorkersSubtitle')}
                </span>
              </div>

              {/* Sparkline */}
              <div className="h-8 w-full mt-1">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path
                    d="M0 18 Q30 22, 60 10 T100 6"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 3: Jobs Completed & Paid */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                  {t('jobsSettled')}
                </span>
                <Badge variant="success">100% On-Time</Badge>
              </div>

              <div className="my-2">
                <span className="text-3xl font-black text-slate-950 font-mono tracking-tight">
                  {contractorAnalytics?.completed || bookings?.filter((b) => b.status === 'paid').length || 0}
                </span>
                <span className="text-xs font-bold text-slate-500 block mt-0.5">
                  ₹{(contractorAnalytics?.paidOut || 0).toLocaleString('en-IN')} Settled to Workers
                </span>
              </div>

              {/* Sparkline */}
              <div className="h-8 w-full mt-1">
                <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                  <path
                    d="M0 15 Q35 8, 70 14 T100 4"
                    fill="none"
                    stroke="#1F2547"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 7-Day Attendance & Wage Settlement Velocity Chart */}
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                  <TrendingUp size={18} className="text-yellow-500" />
                  <span>7-Day Attendance & Wage Settlement Velocity</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Daily worker headcounts and escrow payout reconciliation
                </p>
              </div>

              <div className="flex gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-900">
                  <span className="w-3 h-3 bg-slate-900 rounded-sm" /> Workers on site
                </span>
                <span className="flex items-center gap-1.5 text-yellow-600">
                  <span className="w-3 h-3 bg-yellow-400 rounded-sm" /> Escrow Released (₹)
                </span>
              </div>
            </div>

            <div className="h-52 bg-slate-50 rounded-3xl p-5 border flex items-end justify-between gap-3">
              {(contractorAnalytics?.chartData || [
                { day: 'Mon', workers: 3, escrow: 2100 },
                { day: 'Tue', workers: 4, escrow: 2800 },
                { day: 'Wed', workers: 5, escrow: 3500 },
                { day: 'Thu', workers: 4, escrow: 2800 },
                { day: 'Fri', workers: 6, escrow: 4200 },
                { day: 'Sat', workers: 5, escrow: 3500 },
                { day: 'Sun', workers: 2, escrow: 1400 },
              ]).map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500 mb-1">{d.workers}👷</span>
                  <div className="w-full max-w-[32px] flex items-end gap-1 h-36 justify-center">
                    <div
                      style={{ height: `${(d.workers / 8) * 100}%` }}
                      className="w-3 bg-slate-900 rounded-t-md transition-all shadow-sm"
                    />
                    <div
                      style={{ height: `${(d.escrow / 4500) * 100}%` }}
                      className="w-3 bg-yellow-400 rounded-t-md transition-all shadow-sm"
                    />
                  </div>
                  <span className="text-xs font-black text-slate-700 mt-2">{d.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Easy "Post a Job" Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-2 border-yellow-400/80 space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                  <PlusCircle size={20} className="text-yellow-500" />
                  <span>{t('postJobTitle')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Broadcasts instant SMS/WhatsApp alerts to available workers
                </p>
              </div>

              <form onSubmit={handlePostJob} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Trade Skill</label>
                    <input
                      type="text"
                      placeholder="e.g. Mason Crew"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Worksite Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Baner Site A, Pune"
                      value={form.site}
                      onChange={(e) => setForm({ ...form, site: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Daily Wage (₹)</label>
                    <input
                      type="number"
                      placeholder="750"
                      value={form.wage}
                      onChange={(e) => setForm({ ...form, wage: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Workers Needed</label>
                    <input
                      type="number"
                      placeholder="2"
                      value={form.workersNeeded}
                      onChange={(e) => setForm({ ...form, workersNeeded: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="2 days"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-xl flex items-center justify-between text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.escrowFunded}
                      onChange={(e) => setForm({ ...form, escrowFunded: e.target.checked })}
                      className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                    />
                    <span>Pre-fund wages into Escrow immediately</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold">Attracts 3x more workers</span>
                </div>

                <Button variant="yellow" type="submit">
                  {t('postJobButton')}
                </Button>
              </form>
            </Card>

            {/* Active Posted Jobs with OTP and QR */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Active Site Job Postings ({jobs?.length || 0})
                </h4>
                <Badge variant="neutral">Site QR & OTP</Badge>
              </div>

              {(!jobs || jobs.length === 0) ? (
                <EmptyState
                  icon="💼"
                  title="No active jobs posted"
                  description="Fill out the form to post a new job and generate site check-in credentials."
                />
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {jobs.map((j) => (
                    <div key={j.id} className="p-3.5 bg-slate-50 rounded-2xl border flex items-center justify-between gap-3">
                      <div>
                        <b className="text-sm font-black text-slate-900 block">{j.title}</b>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">{j.site} · ₹{j.wage}/day</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-slate-500">Site OTP:</span>
                          <span className="font-mono font-black text-xs bg-yellow-200/80 text-slate-900 px-2 py-0.5 rounded border border-yellow-400">
                            {j.otp}
                          </span>
                        </div>
                      </div>

                      <div className="text-center p-1.5 bg-white border-2 border-slate-900 rounded-xl shadow-xs">
                        <QRCodeSVG value={`kaamsetu:site:${j.otp}`} size={56} />
                        <span className="text-[9px] font-bold text-slate-500 block mt-0.5">Gate QR</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: VERIFICATION (Scanner to Scan Wage Passport QR)       */}
      {/* ============================================================ */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Interactive Simulated QR Scanner & Lookup */}
            <Card className="space-y-4 border-2 border-yellow-400">
              <div className="border-b pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                    <QrCode size={20} className="text-yellow-500" />
                    <span>Wage Passport QR Scanner</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Scan worker badge or search phone to inspect verified credentials
                  </p>
                </div>
                <Badge variant="yellow">Hero Feature</Badge>
              </div>

              {/* Simulated Camera Viewfinder Frame */}
              <div className="relative rounded-3xl bg-slate-950 overflow-hidden border-4 border-slate-900 aspect-video flex flex-col items-center justify-center p-4 text-center">
                {isScanning ? (
                  <div className="space-y-3 z-10">
                    <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-black text-yellow-300 uppercase tracking-widest animate-pulse">
                      Scanning Worker QR...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 z-10 text-white">
                    <div className="w-20 h-20 border-2 border-dashed border-yellow-400/80 rounded-2xl mx-auto flex items-center justify-center bg-white/5 backdrop-blur-xs">
                      <Camera size={32} className="text-yellow-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">
                      Point device at worker's Digital Wage Passport QR
                    </p>
                  </div>
                )}

                {/* Animated Scanner Laser Bar */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-lg shadow-yellow-400/50 animate-bounce top-1/2" />
                )}

                <div className="absolute bottom-2 inset-x-2 flex justify-center">
                  <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full font-mono">
                    KaamSetu Integrity Verification Engine
                  </span>
                </div>
              </div>

              {/* 1-Tap Trigger Scanner Button */}
              <Button
                variant="yellow"
                icon="📷"
                sublabel="Simulates smartphone scanning worker's physical QR badge"
                disabled={isScanning}
                onClick={handleSimulateScan}
              >
                {isScanning ? 'Scanning...' : t('simulateScan')}
              </Button>

              {/* Manual Phone / ID Search Bar */}
              <form onSubmit={handleLookupSubmit} className="space-y-2 pt-2 border-t">
                <label className="text-xs font-bold text-slate-700 block">
                  Or enter Worker Phone / ID manually:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 9000000001 or u1"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-yellow-400"
                  />
                  <button
                    type="submit"
                    disabled={loadingLookup}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black rounded-xl text-xs transition flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <Search size={14} />
                    <span>{loadingLookup ? 'Verifying...' : t('verify')}</span>
                  </button>
                </div>
                <div className="flex gap-2 text-[11px] font-bold text-slate-500 pt-1">
                  <span>Quick demo:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLookupQuery('9000000001');
                      lookupWorkerPassport('9000000001');
                    }}
                    className="text-slate-900 underline hover:text-yellow-600"
                  >
                    Ramesh (9000000001)
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLookupQuery('9000000004');
                      lookupWorkerPassport('9000000004');
                    }}
                    className="text-slate-900 underline hover:text-yellow-600"
                  >
                    Unverified (9000000004)
                  </button>
                </div>
              </form>
            </Card>

            {/* Right: Inspected Digital Wage Passport Profile */}
            <div className="space-y-4">
              {scannedWorker ? (
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-2xl border-4 border-yellow-400 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="/logo.png"
                        alt="KaamSetu Logo"
                        className="h-10 w-auto object-contain bg-white/10 rounded-xl p-1"
                      />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 block">
                          Official Verified Worker Passport
                        </span>
                        <h3 className="text-xl font-black text-white leading-none">
                          {scannedWorker.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-bold">
                          Trade: <span className="text-yellow-300">{scannedWorker.skill || 'Mason'}</span> · Phone: {scannedWorker.phone}
                        </p>
                      </div>
                    </div>
                    <Badge variant="yellow" icon={<ShieldCheck size={12} />}>
                      Verified ID
                    </Badge>
                  </div>

                  {/* Oversized Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
                    <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
                      <span className="text-2xl font-black text-yellow-400 block font-mono">
                        {scannedWorker.days}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">Days Worked</span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
                      <span className="text-2xl font-black text-emerald-400 block font-mono">
                        ₹{(scannedWorker.totalWagesReceived || (scannedWorker.days * 700)).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">Earned & Settled</span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
                      <div className="flex items-center justify-center gap-0.5 text-2xl font-black text-amber-400">
                        <Star size={16} className="fill-amber-400" />
                        <span>{scannedWorker.rating}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">
                        Rating ({scannedWorker.onTimePct || 96}%)
                      </span>
                    </div>
                  </div>

                  {/* Verified Skill Badges */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">
                      Verified Trust Badges:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '🎖️ NSDC Certified Mason',
                        '⏱️ 96% Punctuality',
                        '🛡️ Zero Safety Violations',
                        '⭐ Top Rated Builder Trust',
                      ].map((badge, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-yellow-300 flex items-center gap-1"
                        >
                          <Check size={12} className="text-emerald-400" />
                          <span>{badge}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tamper-Proof Hash & Direct Hire Action */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                      Hash: {scannedWorker.hash || 'sha256:7f83b1657ff1...'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        addToast(`Direct job offer dispatched to ${scannedWorker.name}!`, 'success');
                      }}
                      className="py-2 px-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl transition text-xs shadow-md cursor-pointer whitespace-nowrap"
                    >
                      + Hire Worker
                    </button>
                  </div>
                </div>
              ) : (
                <Card className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl mb-3">
                    🪪
                  </div>
                  <h4 className="text-sm font-black text-slate-900">No Passport Inspected Yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Click "Simulate Camera Scan" or enter a worker phone on the left to view their portable digital credentials.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Available at Naka Today Section */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span>Workers Available at Naka Today ({availableWorkers?.length || 0})</span>
              </h3>
              <Badge variant="success">Live Chowk Broadcast</Badge>
            </div>

            {(!availableWorkers || availableWorkers.length === 0) ? (
              <EmptyState
                icon="📍"
                title="No workers currently broadcasting at the naka"
                description="Workers toggle availability every morning between 6 AM and 9 AM."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availableWorkers.map((w) => (
                  <div key={w.id} className="p-3.5 bg-slate-50 rounded-2xl border flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <b className="text-sm font-black text-slate-950">{w.name}</b>
                        <Badge variant="neutral">{w.skill}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">
                        {w.days} days · ⭐ {w.rating || 4.8}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => lookupWorkerPassport(w.id)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-yellow-300 font-black rounded-xl text-xs transition shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      Inspect 🪪
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ACTIVE SITES (Attendance, Pre-fund, Approve & Release) */}
      {/* ============================================================ */}
      {activeTab === 'active_sites' && (
        <div className="space-y-4">
          {/* Top Bar with 1-Click Release All & View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <span>🏗️</span>
                <span>{t('activeSitesTitle')}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Track site check-ins, pre-fund escrow, and release wages on shift completion
              </p>
            </div>

            <div className="flex items-center gap-2">
              {releasableBookings.length > 0 && (
                <button
                  type="button"
                  onClick={handleReleaseAll}
                  className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 animate-pulse cursor-pointer"
                >
                  <Zap size={15} />
                  <span>⚡ {t('oneClickReleaseAll')} ({releasableBookings.length} workers)</span>
                </button>
              )}

              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer transition ${
                    viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Kanban
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer transition ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {(!bookings || bookings.length === 0) && (
            <EmptyState
              icon="👷"
              title="No worker bookings yet"
              description="Post a job from the Dashboard or book a Mukkadam crew. When workers accept, they will show here."
            />
          )}

          {viewMode === 'kanban' ? (
            /* Kanban 3-Column Attendance View */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Accepted / Awaiting Check-in */}
              <div className="bg-slate-100/70 p-3.5 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-xs font-black uppercase text-slate-500">
                    1. Accepted ({bookings?.filter((b) => b.status === 'accepted').length || 0})
                  </h4>
                  <Badge variant="neutral">Gate Check-in</Badge>
                </div>

                {bookings
                  ?.filter((b) => b.status === 'accepted')
                  .map((b) => (
                    <Card key={b.id} className="space-y-2.5 p-3.5 bg-white">
                      <div className="flex justify-between items-start">
                        <b className="text-sm font-black text-slate-900">{b.worker?.name}</b>
                        <span className="text-[11px] font-mono font-bold bg-yellow-100 px-2 py-0.5 rounded border border-yellow-300">
                          OTP: {b.job?.otp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">{b.job?.title} · ₹{b.job?.wage}</p>
                      <div className="pt-1 flex gap-2">
                        <Button
                          size="sm"
                          variant={b.funded ? 'ghost' : 'yellow'}
                          disabled={b.funded}
                          onClick={() => handleFund(b.id)}
                        >
                          <Lock size={12} />
                          <span>{b.funded ? '✓ Escrow Locked' : `Pre-Fund ₹${b.job?.wage}`}</span>
                        </Button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancel(b.id)}
                        className="text-[10px] text-rose-700 underline font-bold mt-1 cursor-pointer block hover:text-rose-900"
                      >
                        {t('cancelPenalty')}
                      </button>
                    </Card>
                  ))}
              </div>

              {/* Column 2: Active on Site (Checked In) */}
              <div className="bg-slate-100/70 p-3.5 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-xs font-black uppercase text-slate-500">
                    2. Active on Site ({bookings?.filter((b) => b.status === 'checked_in').length || 0})
                  </h4>
                  <Badge variant="yellow">GPS Live</Badge>
                </div>

                {bookings
                  ?.filter((b) => b.status === 'checked_in')
                  .map((b) => (
                    <Card key={b.id} highlight className="space-y-2.5 p-3.5 bg-white">
                      <div className="flex justify-between items-start">
                        <b className="text-sm font-black text-slate-900">{b.worker?.name}</b>
                        <Badge variant="success">● Checked In</Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">{b.job?.title} · ₹{b.job?.wage}</p>
                      {b.gps && (
                        <p className="text-[11px] text-emerald-700 font-bold">
                          📍 GPS: {b.gps.lat}, {b.gps.lng} (Verified)
                        </p>
                      )}
                      {!b.funded && (
                        <Button size="sm" variant="yellow" onClick={() => handleFund(b.id)}>
                          Pre-fund Escrow ₹{b.job?.wage}
                        </Button>
                      )}
                    </Card>
                  ))}
              </div>

              {/* Column 3: Shift Finished -> 1-Click Approve & Release */}
              <div className="bg-slate-100/70 p-3.5 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-xs font-black uppercase text-slate-500">
                    3. Shift Finished ({bookings?.filter((b) => b.status === 'completed').length || 0})
                  </h4>
                  <Badge variant="warning">Release Ready</Badge>
                </div>

                {bookings
                  ?.filter((b) => b.status === 'completed')
                  .map((b) => (
                    <Card key={b.id} highlight className="space-y-2.5 p-3.5 border-2 border-yellow-400 bg-white">
                      <div className="flex justify-between items-start">
                        <b className="text-sm font-black text-slate-900">{b.worker?.name}</b>
                        <Badge variant="warning">Awaiting Release</Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">{b.job?.title} · ₹{b.job?.wage}</p>
                      {b.claim && (
                        <p className="text-xs font-bold text-rose-700 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                          ⚠️ Worker raised dispute claim
                        </p>
                      )}

                      {/* 1-Click "Approve & Release Payment" button (strictly only if completed & funded) */}
                      <Button
                        size="md"
                        variant="success"
                        disabled={!b.funded}
                        onClick={() => handleRelease(b.id)}
                      >
                        <CheckCircle2 size={16} />
                        <span>{t('approveRelease')} ₹{b.job?.wage}</span>
                      </Button>

                      {!b.funded && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-amber-800 font-bold">Escrow must be pre-funded before release</p>
                          <Button size="sm" variant="yellow" onClick={() => handleFund(b.id)}>
                            Pre-fund Escrow ₹{b.job?.wage}
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {bookings?.map((b) => {
                const isCompleted = b.status === 'completed';
                const isPaid = b.status === 'paid';

                return (
                  <Card key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-950">{b.worker?.name}</h4>
                        <Badge variant={isPaid ? 'success' : isCompleted ? 'warning' : 'neutral'}>
                          {b.status.replace('_', ' ')}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => onInspectPassport(b.workerId)}
                          className="text-[11px] font-bold text-slate-700 bg-yellow-100 hover:bg-yellow-200 px-2 py-0.5 rounded-full border border-yellow-300 cursor-pointer"
                        >
                          Passport 🪪
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-1">
                        {b.job?.title} · {b.job?.site} · ₹{b.job?.wage} · Site OTP: <span className="font-mono">{b.job?.otp}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!b.funded && !['paid', 'cancelled'].includes(b.status) && (
                        <Button size="sm" variant="yellow" onClick={() => handleFund(b.id)}>
                          Pre-Fund ₹{b.job?.wage}
                        </Button>
                      )}

                      {isCompleted && (
                        <Button
                          size="sm"
                          variant="success"
                          disabled={!b.funded}
                          onClick={() => handleRelease(b.id)}
                        >
                          Approve & Release
                        </Button>
                      )}

                      {isPaid && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold text-slate-600">Rate:</span>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleRate(b.id, s)}
                              className="cursor-pointer"
                            >
                              <Star
                                size={16}
                                className={(b.rating || 0) >= s ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Mukkadam Crew Bookings Section */}
          {crewBookings && crewBookings.length > 0 && (
            <Card className="space-y-3 mt-4">
              <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <span>👥</span>
                <span>Squad Bookings from Mukkadams ({crewBookings.length})</span>
              </h3>
              <div className="space-y-2">
                {crewBookings.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-2xl border flex justify-between items-center">
                    <div>
                      <b className="text-sm text-slate-950 block">{c.job?.title}</b>
                      <p className="text-xs text-slate-500">Mukkadam: {c.mukkadam?.name || 'Sunil'}</p>
                    </div>
                    <Badge variant="navy">Crew of {c.size} Workers</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Top up Escrow Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-yellow-400 space-y-4">
            <h3 className="text-lg font-black text-slate-950">Deposit Escrow Pool</h3>
            <p className="text-xs text-slate-600">
              Pre-funded escrow secures guaranteed daily wages for site workers and satisfies dispute protections.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Deposit Amount (₹)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full text-base font-mono font-black p-3 border-2 border-slate-300 rounded-xl text-slate-950 focus:border-yellow-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDepositEscrow}
                className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs shadow-md cursor-pointer"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
