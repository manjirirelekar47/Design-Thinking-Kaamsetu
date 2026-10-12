import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useJobs(user, isOffline = false) {
  const [jobs, setJobs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [passport, setPassport] = useState(null);
  const [minWageData, setMinWageData] = useState(null);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [contractorAnalytics, setContractorAnalytics] = useState(null);
  const [crewBookings, setCrewBookings] = useState([]);
  const [crew, setCrew] = useState([]);
  const [crewJobs, setCrewJobs] = useState({ jobs: [] });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user || isOffline) return;

    try {
      if (user.role === 'worker') {
        const [j, b, p, mw] = await Promise.all([
          api('/jobs').catch(() => []),
          api('/bookings').catch(() => []),
          api(`/passport/${user.id}`).catch(() => null),
          api(`/minwage?skill=${encodeURIComponent(user.skill || 'Mason')}`).catch(() => null),
        ]);
        setJobs(j);
        setBookings(b);
        setPassport(p);
        setMinWageData(mw);
        localStorage.setItem(`cache_worker_${user.id}`, JSON.stringify({ j, b, p, mw }));
      } else if (user.role === 'contractor') {
        const [j, b, aw, an, cb] = await Promise.all([
          api('/jobs').catch(() => []),
          api('/bookings').catch(() => []),
          api('/workers/available').catch(() => []),
          api('/analytics').catch(() => null),
          api('/contractor/crew-bookings').catch(() => []),
        ]);
        setJobs(j);
        setBookings(b);
        setAvailableWorkers(aw);
        setContractorAnalytics(an);
        setCrewBookings(cb);
        localStorage.setItem(`cache_contractor_${user.id}`, JSON.stringify({ j, b, aw, an, cb }));
      } else if (user.role === 'mukkadam') {
        const [c, cj] = await Promise.all([
          api('/crew').catch(() => []),
          api('/crew/jobs').catch(() => ({ jobs: [] })),
        ]);
        setCrew(c);
        setCrewJobs(cj);
        localStorage.setItem(`cache_mukkadam_${user.id}`, JSON.stringify({ c, cj }));
      }
    } catch (err) {
      console.warn('Jobs polling error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isOffline]);

  // Initial load from cache if offline
  useEffect(() => {
    if (!user) return;
    try {
      const cached = localStorage.getItem(`cache_${user.role}_${user.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.j) setJobs(parsed.j);
        if (parsed.b) setBookings(parsed.b);
        if (parsed.p) setPassport(parsed.p);
        if (parsed.mw) setMinWageData(parsed.mw);
        if (parsed.aw) setAvailableWorkers(parsed.aw);
        if (parsed.an) setContractorAnalytics(parsed.an);
        if (parsed.cb) setCrewBookings(parsed.cb);
        if (parsed.c) setCrew(parsed.c);
        if (parsed.cj) setCrewJobs(parsed.cj);
      }
    } catch {}

    fetchAll();
    const interval = setInterval(fetchAll, 3500);
    return () => clearInterval(interval);
  }, [user, fetchAll]);

  return {
    jobs,
    bookings,
    passport,
    minWageData,
    availableWorkers,
    contractorAnalytics,
    crewBookings,
    crew,
    crewJobs,
    loading,
    refresh: fetchAll,
  };
}
