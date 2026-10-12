import { useState, useEffect, useCallback } from 'react';
import { api, setToken, getToken } from '../api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const u = await api('/me');
      setUser(u);
      setAuthError(null);
      return u;
    } catch (err) {
      setUser(null);
      setToken(null);
      setAuthError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (phone, otp = '1234') => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: { phone, otp },
      });
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const voiceOnboard = async (payload) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api('/auth/voice-onboard', {
        method: 'POST',
        body: payload,
      });
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return {
    user,
    setUser,
    loading,
    authError,
    login,
    voiceOnboard,
    logout,
    refreshUser: fetchCurrentUser,
  };
}
