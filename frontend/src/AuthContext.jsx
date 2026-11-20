import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [profile, setProfile] = useState(null);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const data = res.data;
    localStorage.setItem('token', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify({ email: data.email, displayName: data.displayName }));
    setToken(data.token);
    setUser({ email: data.email, displayName: data.displayName });
    return data;
  };

  const signup = async (displayName, email, password) => {
    const res = await authAPI.signup({ email, password, displayName });
    const data = res.data;
    if (data.token) {
      localStorage.setItem('token', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify({ email: data.email, displayName: data.displayName }));
      setToken(data.token);
      setUser({ email: data.email, displayName: data.displayName });
    }
    return data;
  };

  const verifyOtp = async (email, code) => {
    const res = await authAPI.verifyOtp({ email, code });
    const data = res.data;
    localStorage.setItem('token', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify({ email: data.email, displayName: data.displayName }));
    setToken(data.token);
    setUser({ email: data.email, displayName: data.displayName });
    return data;
  };

  const resendOtp = async (email) => authAPI.resendOtp(email);

  const logout = () => {
    const rt = localStorage.getItem('refreshToken');
    if (rt) authAPI.logout(rt).catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const fetchProfile = async () => {
    if (!token) return null;
    try {
      const res = await profileAPI.get();
      const data = res.data;
      if (data && (data.email || data.displayName || data.niche || data.platformFocus || data.username || data.youtubeChannel || data.instagramHandle || data.niches?.length)) {
        setProfile(data);
        return data;
      }
      setProfile(data && Object.keys(data).length > 1 ? data : null);
      return data && Object.keys(data).length > 1 ? data : null;
    } catch {
      setProfile(null);
      return null;
    }
  };

  const saveProfile = async (profileData) => {
    const res = await profileAPI.save(profileData);
    const updated = await fetchProfile();
    if (!updated) {
      setProfile((prev) => ({ ...prev, ...profileData }));
    }
    return { ...res.data, profile: updated || profileData };
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, profile, login, signup, verifyOtp, resendOtp, logout, fetchProfile, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
