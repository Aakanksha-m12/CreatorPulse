import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import PendulumLoader from './PendulumLoader';
import DoodleBackground from './DoodleBackground';

export const NICHES = [
  { label: 'Education', icon: '📚' },
  { label: 'Fitness', icon: '💪' },
  { label: 'Comedy', icon: '😂' },
  { label: 'Beauty', icon: '💄' },
  { label: 'Tech', icon: '💻' },
  { label: 'Food', icon: '🍳' },
  { label: 'Travel', icon: '✈️' },
  { label: 'Finance', icon: '💰' },
  { label: 'Gaming', icon: '🎮' },
  { label: 'Lifestyle', icon: '✨' },
  { label: 'Other', icon: '🎭' },
];

const GATE_PLATFORMS = [
  { id: 'YouTube', icon: '▶️', sub: 'Shorts & long-form' },
  { id: 'Instagram', icon: '📸', sub: 'Reels & posts' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, saveProfile, fetchProfile } = useAuth();
  const [niche, setNiche] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ready = niche && platforms.length > 0;

  const togglePlatform = (id) =>
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const handleSubmit = async () => {
    if (!ready) return;
    setLoading(true);
    try {
      await saveProfile({
        niche,
        niches: [niche],
        platformFocus: platforms.join(','),
        displayName: user?.displayName || '',
        username: (user?.displayName || 'creator').toLowerCase().replace(/\s+/g, ''),
        email: user?.email || '',
        contentStyle: '',
        goals: '',
        profilePhoto: '',
      });
      await fetchProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card">
          <PendulumLoader text="Setting up your dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container onboarding-v2 gate-page">
      <DoodleBackground />
      <div className="onboarding-card onboarding-card-v2 gate-card">
        <div className="gate-welcome">
          <div className="gate-logo">👋</div>
          <h2 className="onboarding-title">Welcome, {user?.displayName?.split(' ')[0] || 'Creator'}!</h2>
          <p className="onboarding-subtitle">Let's personalize your dashboard.</p>
        </div>

        {error && <div className="server-error">⚠️ {error}</div>}

        <div className="gate-section">
          <div className="gate-section-head">
            <h3>What's your niche?</h3>
            <span>1 of 2 · required</span>
          </div>
          <div className="gate-niche-grid">
            {NICHES.map((n) => (
              <button
                key={n.label}
                className={`gate-niche ${niche === n.label ? 'selected' : ''}`}
                onClick={() => setNiche(n.label)}
              >
                <span className="gate-niche-icon">{n.icon}</span>
                <span className="gate-niche-label">{n.label}</span>
                {niche === n.label && <span className="gate-niche-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="gate-section">
          <div className="gate-section-head">
            <h3>Where do you create?</h3>
            <span>2 of 2 · pick one or both</span>
          </div>
          <div className="gate-platform-grid">
            {GATE_PLATFORMS.map((p) => (
              <button
                key={p.id}
                className={`gate-platform ${platforms.includes(p.id) ? 'selected' : ''}`}
                onClick={() => togglePlatform(p.id)}
              >
                <span className="gate-platform-icon">{p.icon}</span>
                <span className="gate-platform-name">{p.id}</span>
                <span className="gate-platform-sub">{p.sub}</span>
                <span className="gate-platform-check">{platforms.includes(p.id) ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        </div>

        <button className={`btn btn-primary gate-continue ${ready ? '' : 'disabled'}`} onClick={handleSubmit} disabled={!ready}>
          Continue to Dashboard →
        </button>
        {!ready && <p className="gate-hint">Pick a niche and at least one platform to continue.</p>}
      </div>
    </div>
  );
}
