import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider, useToast } from './context/ToastContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { useAuth } from './hooks/useAuth';
import { useJobs } from './hooks/useJobs';

// Core UI Components
import Header from './components/common/Header';
import BottomNav from './components/BottomNav';
import OfflineBanner from './components/OfflineBanner';
import LoadingSpinner from './components/common/LoadingSpinner';
import PassportInspectorModal from './components/contractor/PassportInspectorModal';

// Pages
import LoginPage from './pages/LoginPage';
import WorkerApp from './pages/WorkerApp';
import MukkadamApp from './pages/MukkadamApp';
import ContractorDashboard from './pages/ContractorDashboard';
import { api } from './api';

// Strict Tab-Based Navigation mapped to Phase 2 Prototype Feature Plan
const TABS = {
  worker: [
    ['home_jobs', '💼', 'homeJobs'],
    ['attendance', '📍', 'attendance'],
    ['wage_tracker', '📈', 'wageTracker'],
    ['wage_passport', '🪪', 'wagePassport'],
  ],
  mukkadam: [
    ['crew_list', '👥', 'crewList'],
    ['group_jobs', '💼', 'groupJobs'],
    ['crew_attendance', '✅', 'crewAttendance'],
    ['wage_splitter', '➗', 'wageSplitter'],
  ],
  contractor: [
    ['dashboard', '📊', 'dashboard'],
    ['verification', '🪪', 'verification'],
    ['active_sites', '🏗️', 'activeSites'],
  ],
};

function AppContent() {
  const { user, setUser, loading: authLoading, login, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('home_jobs');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [inspectedWorkerId, setInspectedWorkerId] = useState(null);

  const { addToast } = useToast();
  const jobsState = useJobs(user, isSimulatedOffline);

  // Set default tab when user role changes
  useEffect(() => {
    if (user && TABS[user.role]) {
      setActiveTab(TABS[user.role][0][0]);
    }
  }, [user?.role]);

  // Contractor verify action
  const handleVerifyContractor = async () => {
    try {
      const res = await api('/verify', { method: 'POST' });
      setUser(res);
      addToast('Contractor business verified with active GST check!', 'success');
      jobsState.refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <LoadingSpinner text="Starting KaamSetu Platform..." />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage
        onLogin={login}
        onVoiceOnboard={(newUser) => setUser(newUser)}
      />
    );
  }

  const isMobileRole = user.role === 'worker' || user.role === 'mukkadam';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        user={user}
        onLogout={logout}
        isOffline={isSimulatedOffline}
        setIsOffline={setIsSimulatedOffline}
        onQuickLogin={login}
      />

      {/* Offline Status Banner */}
      <OfflineBanner
        isOffline={isSimulatedOffline}
        onSync={() => {
          setIsSimulatedOffline(false);
          jobsState.refresh();
          addToast('Reconnected and synced data!', 'success');
        }}
      />

      {/* Main View Container */}
      <main
        className={`flex-1 p-4 ${
          isMobileRole ? 'max-w-md mx-auto w-full' : 'w-full max-w-5xl mx-auto'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={user.role + '_' + activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {user.role === 'worker' && (
              <WorkerApp
                user={user}
                jobsState={jobsState}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
              />
            )}

            {user.role === 'mukkadam' && (
              <MukkadamApp
                user={user}
                jobsState={jobsState}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
              />
            )}

            {user.role === 'contractor' && (
              <ContractorDashboard
                user={user}
                jobsState={jobsState}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onInspectPassport={setInspectedWorkerId}
                onVerifyContractor={handleVerifyContractor}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile-constrained Bottom Nav for Worker and Mukkadam */}
      {isMobileRole && (
        <BottomNav
          role={user.role}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          tabs={TABS[user.role] || []}
        />
      )}

      {/* Contractor Passport Inspection Modal */}
      {inspectedWorkerId && (
        <PassportInspectorModal
          workerId={inspectedWorkerId}
          onClose={() => setInspectedWorkerId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ToastProvider>
  );
}
