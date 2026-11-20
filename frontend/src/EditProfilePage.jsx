import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AppShell from './AppShell';
import PendulumLoader from './PendulumLoader';
import { profileAPI } from './api';
import { NICHES } from './OnboardingPage';
import { calcCompletion } from './profileCompletion';

const GOALS = ['Grow followers', 'Increase engagement', 'Build a personal brand', 'Start monetizing', 'Just exploring'];

const PLATFORMS = [
  { id: 'YouTube', name: 'YouTube', icon: '▶️', formats: ['Shorts', 'Long-form', 'Both'] },
  { id: 'Instagram', name: 'Instagram', icon: '📸', formats: ['Reels', 'Posts', 'Both'] },
];

const AGES = ['13–18', '18–24', '25–34', '35+'];
const GENDERS = ['Everyone', 'Male', 'Female'];
const REGIONS = ['India', 'Asia', 'Global'];
const FREQUENCIES = ['Daily', '3x Week', 'Weekly', 'Monthly'];
const COUNTRIES = ['India', 'USA', 'UK', 'UAE', 'Japan'];
const TIMEZONES = ['GMT +5:30', 'GMT +0', 'GMT -5', 'GMT -8', 'GMT +1'];
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'Arabic', 'French', 'Portuguese', 'Japanese', 'Korean', 'German', 'Tamil', 'Marathi', 'Bengali'];

const AUDIENCE_LABEL = {
  Education: 'Students',
  Gaming: 'Gamers',
  Finance: 'Investors',
  Lifestyle: 'Trend Lovers',
  Tech: 'Techies',
  Travel: 'Travelers',
  Fitness: 'Fitness Enthusiasts',
  Food: 'Foodies',
  Comedy: 'Skit Lovers',
  Beauty: 'Beauty Enthusiasts',
};

const FREQ_RATE = { Daily: '3.2x', '3x Week': '2.4x', Weekly: '1.8x', Monthly: '1.2x' };

const CONFETTI_COLORS = ['#8B5CF6', '#EC4899', '#22C55E', '#FBBF24', '#3B82F6', '#F8FAFC'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        left: (i * 53) % 100,
        delay: (i % 6) * 0.15,
        dur: 2.2 + (i % 4) * 0.3,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rot: (i * 47) % 360,
        round: i % 3 === 0,
      })),
    []
  );
  return (
    <div className="cp-confetti">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            borderRadius: p.round ? '50%' : '2px',
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function CompletionBar({ value, flash }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 250);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className={`cp-progress-track ${flash ? 'cp-saved-flash' : ''}`}>
      <i style={{ width: `${w}%` }} />
    </div>
  );
}

function Avatar({ photo, name, size = 92 }) {
  if (photo) return <img className="avatar-img" style={{ width: size, height: size }} src={photo} alt={name} />;
  const initials = (name || 'C').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="avatar-initials" style={{ width: size, height: size, fontSize: size * 0.34 }}>
      {initials}
    </div>
  );
}

function ProfilePlatform({ id, name, icon, selected, handle, format, formats, onConnect, onRemove, onFormat }) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [val, setVal] = useState(handle || '');

  const submit = () => {
    onConnect(id, val.replace(/^@+/, '').trim());
    setEditing(false);
    setAdding(false);
  };

  const brand = id === 'YouTube'
    ? { bg: 'linear-gradient(135deg, rgba(255,0,0,0.12), rgba(255,0,0,0.04))', border: 'rgba(255,0,0,0.25)', accent: '#FF0000', hoverBg: 'rgba(255,0,0,0.08)', glow: 'rgba(255,0,0,0.15)' }
    : { bg: 'linear-gradient(135deg, rgba(225,48,108,0.12), rgba(131,58,180,0.08), rgba(253,201,60,0.06))', border: 'rgba(225,48,108,0.25)', accent: '#E1306C', hoverBg: 'rgba(225,48,108,0.08)', glow: 'rgba(225,48,108,0.15)' };

  if (!selected && !adding) {
    return (
      <div className="cp-plat-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1.5px dashed rgba(255,255,255,0.1)' }}>
        <div className="cp-plat-card-inner">
          <div className="cp-plat-brand-icon" style={{ background: brand.bg, border: `1px solid ${brand.border}` }}>
            <span>{icon}</span>
          </div>
          <div className="cp-plat-card-info">
            <div className="cp-plat-card-name">{name}</div>
            <div className="cp-plat-card-desc">Track followers, views, and engagement growth</div>
          </div>
          <button className="cp-plat-connect-btn" style={{ background: brand.accent }} onClick={() => { setVal(''); setAdding(true); }}>
            + Connect
          </button>
        </div>
      </div>
    );
  }

  if (!selected && adding) {
    return (
      <div className="cp-plat-card adding" style={{ background: brand.bg, border: `1.5px solid ${brand.border}` }}>
        <div className="cp-plat-card-inner">
          <div className="cp-plat-brand-icon" style={{ background: brand.bg, border: `1px solid ${brand.border}` }}>
            <span>{icon}</span>
          </div>
          <div className="cp-plat-card-info">
            <div className="cp-plat-card-name">{name}</div>
            <div className="cp-plat-card-desc">Enter your {name} handle to start tracking</div>
          </div>
        </div>
        <div className="cp-plat-input-row">
          <span className="cp-plat-at" style={{ color: brand.accent }}>@</span>
          <input
            className="cp-plat-input"
            value={val}
            placeholder={`your${id === 'YouTube' ? 'Channel' : 'Handle'}Name`}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoFocus
          />
          <button className="cp-plat-save-btn" style={{ background: brand.accent }} onClick={submit} disabled={!val.replace(/^@+/, '').trim()}>
            Connect {name}
          </button>
          <button className="cp-plat-cancel-btn" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-plat-card connected" style={{ background: brand.bg, border: `1.5px solid ${brand.border}`, boxShadow: `0 4px 20px ${brand.glow}` }}>
      <div className="cp-plat-card-inner">
        <div className="cp-plat-brand-icon connected" style={{ background: brand.bg, border: `1px solid ${brand.border}` }}>
          <span>{icon}</span>
          <div className="cp-plat-connected-badge" style={{ background: brand.accent }}>✓</div>
        </div>
        <div className="cp-plat-card-info">
          <div className="cp-plat-card-name">{name}</div>
          {handle ? (
            <div className="cp-plat-card-status connected">
              <span className="cp-plat-status-dot" style={{ background: '#22C55E' }} />
              Connected · <a href={id === 'YouTube' ? `https://youtube.com/@${handle}` : `https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer" style={{color: brand.accent, textDecoration:'underline'}}><strong>@{handle}</strong></a>
            </div>
          ) : (
            <div className="cp-plat-card-status">Connected — add your handle below</div>
          )}
        </div>
        <div className="cp-plat-card-actions">
          <button className="cp-plat-edit-btn" onClick={() => { setVal(handle || ''); setEditing(!editing); }} title="Edit handle">✏️</button>
          <button className="cp-plat-remove-btn" onClick={() => onRemove(id)} title={`Remove ${name}`}>✕</button>
        </div>
      </div>
      {editing && (
        <div className="cp-plat-input-row">
          <span className="cp-plat-at" style={{ color: brand.accent }}>@</span>
          <input
            className="cp-plat-input"
            value={val}
            placeholder={`your${id === 'YouTube' ? 'Channel' : 'Handle'}Name`}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoFocus
          />
          <button className="cp-plat-save-btn" style={{ background: brand.accent }} onClick={submit}>Save</button>
        </div>
      )}
      <div className="cp-plat-format-row">
        <span className="cp-plat-format-label">Content format</span>
        <div className="cp-segment">
          {formats.map((f) => (
            <button key={f} className={`cp-seg ${format === f ? 'active' : ''}`} onClick={() => onFormat(id, f)}>{f}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, profile, saveProfile } = useAuth();
  const avatarInput = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [form, setForm] = useState({
    niches: [],
    platforms: [],
    goals: [],
    instagramHandle: '',
    youtubeChannel: '',
    youtubeFormat: 'Both',
    instagramFormat: 'Both',
    profilePhoto: '',
  });

  const [extras, setExtras] = useState({
    username: '',
    country: '',
    timezone: '',
    languages: [],
    age: '',
    gender: 'Everyone',
    region: 'Global',
    frequency: '',
  });

  const [activity, setActivity] = useState(null);

  useEffect(() => {
    if (profile) {
      const focus = (profile.platformFocus || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      const platforms = [];
      if (focus.some((p) => p.includes('youtube')) || profile.youtubeChannel) platforms.push('YouTube');
      if (focus.some((p) => p.includes('instagram')) || profile.instagramHandle) platforms.push('Instagram');
      const niches = Array.isArray(profile.niches) && profile.niches.length
        ? profile.niches
        : profile.niche ? [profile.niche] : [];
      setForm({
        niches,
        platforms,
        goals: (profile.goals || '').split(',').map((s) => s.trim()).filter(Boolean),
        instagramHandle: profile.instagramHandle || '',
        youtubeChannel: profile.youtubeChannel || '',
        youtubeFormat: profile.youtubeFormat || 'Both',
        instagramFormat: profile.instagramFormat || 'Both',
        profilePhoto: profile.profilePhoto || '',
      });
      setExtras({
        username: profile.username || '',
        country: profile.country || '',
        timezone: profile.timezone || '',
        languages: profile.language ? profile.language.split(',').map((s) => s.trim()).filter(Boolean) : [],
        age: profile.audienceAge || '',
        gender: profile.audienceGender || 'Everyone',
        region: profile.audienceRegion || 'Global',
        frequency: profile.postFrequency || '',
      });
    }
    setProfileLoaded(true);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    const act = localStorage.getItem('cp_activity');
    setActivity(
      act
        ? (() => { try { return JSON.parse(act); } catch { return null; } })()
        : [
            { time: 'Today', icon: '▶️', text: 'Connected YouTube' },
            { time: 'Yesterday', icon: '🎯', text: 'Updated Goals' },
            { time: 'Monday', icon: '👥', text: 'Changed Audience' },
          ]
    );
  }, []);

  useEffect(() => {
    if (activity) localStorage.setItem('cp_activity', JSON.stringify(activity));
  }, [activity]);

  const completionResult = calcCompletion(profile, { ...form, ...extras });
  const completion = completionResult.percent;

  const firstName = (user?.displayName || 'Creator').split(' ')[0];
  const username = extras.username || (user?.displayName || 'creator').toLowerCase().replace(/\s+/g, '');

  const targetAudience = form.niches.map((n) => AUDIENCE_LABEL[n]).filter(Boolean).join(', ') || 'Your niche audience';
  const rate = FREQ_RATE[extras.frequency] || '2.4x';
  const insightTip =
    extras.frequency === 'Daily' || extras.frequency === '3x Week'
      ? 'Great cadence — keep it up!'
      : 'Consider increasing your posting frequency.';

  const showConfetti = completion === 100 && !loading;

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const logActivity = (icon, text) => {
    setActivity((a) => [{ time: 'Today', icon, text }, ...(a || []).filter((x) => x.time !== 'Today').slice(0, 5)]);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/image\/(jpe?g|png)$/i.test(file.type)) {
      notify('Only JPG or PNG photos are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify('Photo must be under 5MB');
      return;
    }
    setPhotoUploading(true);
    try {
      const res = await profileAPI.uploadPhoto(file);
      const url = res.data?.url;
      if (url) {
        setForm((f) => ({ ...f, profilePhoto: url }));
        logActivity('🖼️', 'Uploaded Profile Photo');
        notify('Photo uploaded ✓');
      }
    } catch {
      notify('Photo upload failed. Try again.');
    } finally {
      setPhotoUploading(false);
      if (avatarInput.current) avatarInput.current.value = '';
    }
  };

  const toggleNiche = (label) =>
    setForm((f) => ({
      ...f,
      niches: f.niches.includes(label) ? f.niches.filter((n) => n !== label) : [...f.niches, label],
    }));

  const toggleGoal = (id) => {
    const next = form.goals.includes(id) ? form.goals.filter((g) => g !== id) : [...form.goals, id];
    setForm((f) => ({ ...f, goals: next }));
    if (profile) profileAPI.saveGoals(next).catch(() => {});
  };

  const addCustomGoal = async () => {
    const g = customGoal.trim();
    if (!g) return;
    const next = form.goals.includes(g) ? form.goals : [...form.goals, g];
    setForm((f) => ({ ...f, goals: next }));
    setCustomGoal('');
    logActivity('🎯', `Added goal: ${g}`);
    notify('Goal added ✓');
    if (profile) {
      try {
        await profileAPI.saveGoals(next);
      } catch {
        // goals are also sent with "Save Profile"
      }
    }
  };

  const connectPlatform = (id, value) => {
    setForm((f) => {
      const platforms = f.platforms.includes(id) ? f.platforms : [...f.platforms, id];
      return {
        ...f,
        platforms,
        youtubeChannel: id === 'YouTube' ? value : f.youtubeChannel,
        instagramHandle: id === 'Instagram' ? value : f.instagramHandle,
      };
    });
    if (value) logActivity('🔗', `Connected ${id}`);
  };

  const removePlatform = (id) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.filter((p) => p !== id),
      youtubeChannel: id === 'YouTube' ? '' : f.youtubeChannel,
      instagramHandle: id === 'Instagram' ? '' : f.instagramHandle,
    }));
    logActivity('🚫', `Removed ${id}`);
  };

  const setFormat = (id, fmt) => setForm((f) => ({ ...f, [id === 'YouTube' ? 'youtubeFormat' : 'instagramFormat']: fmt }));

  const handleSave = async () => {
    if (form.niches.length === 0) {
      notify('Pick at least one niche first');
      return;
    }
    if (form.platforms.length === 0) {
      notify('Select at least one platform');
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        niche: form.niches[0] || '',
        niches: form.niches,
        platformFocus: form.platforms.join(','),
        goals: form.goals.join(', '),
        instagramHandle: form.instagramHandle,
        youtubeChannel: form.youtubeChannel,
        youtubeFormat: form.youtubeFormat,
        instagramFormat: form.instagramFormat,
        profilePhoto: form.profilePhoto,
        displayName: user?.displayName || '',
        username: username || '',
        email: user?.email || '',
        country: extras.country,
        timezone: extras.timezone,
        language: (extras.languages || []).join(', '),
        audienceAge: extras.age,
        audienceGender: extras.gender,
        audienceRegion: extras.region,
        postFrequency: extras.frequency,
        contentStyle: '',
      };
      console.log('Saving profile payload:', payload);
      const result = await saveProfile(payload);
      console.log('Profile save result:', result);
      logActivity('✨', 'Saved Profile Changes');
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      notify('Profile saved successfully ✓');
      requestAnimationFrame(() => {
        document.querySelector('.shell-content')?.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } catch (err) {
      console.error('Profile save error:', err?.response?.data || err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Could not save. Try again.';
      notify('Error: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  const scrollTo = (id) => document.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (loading || !profileLoaded) {
    return (
      <AppShell active="/edit-profile">
        <div className="dash-loading"><PendulumLoader text="Loading your profile..." /></div>
      </AppShell>
    );
  }

  return (
    <AppShell active="/edit-profile">
      <div className="cp-page">
        {showConfetti && <Confetti />}
        {toast && <div className="toast toast-success">✓ {toast}</div>}

        <section className="cp-hero">
          <div className="cp-hero-text">
            <h1>👋 Welcome back {firstName}</h1>
            <p className="cp-hero-sub">Let's personalize CreatorPulse.</p>
            <p className="cp-hero-note">
              The more we know about your content, the sharper your dashboard becomes.
            </p>
          </div>
          <div className="cp-completion-card">
            <div className="cp-completion-top">
              <span>Profile Completion</span>
              <strong>{completion}%</strong>
            </div>
            <CompletionBar value={completion} flash={savedFlash} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {(completionResult.details || []).map((d) => (
                <span key={d.key} style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: d.done ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                  color: d.done ? '#4ADE80' : '#94A3B8', border: `1px solid ${d.done ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  {d.done ? '✓' : '○'} {d.key}
                </span>
              ))}
            </div>
            <button className="btn btn-primary cp-complete-btn" onClick={() => scrollTo('cp-identity')}>
              {completion < 100 ? 'Complete Profile' : 'View Profile'}
            </button>
          </div>
        </section>

        <div className="cp-grid">
          <div className="cp-main">
            <section className="cp-card" id="cp-identity">
              <div className="cp-card-head"><h3>👤 Creator Identity</h3></div>

              <div className="cp-avatar-row">
                <div className="cp-avatar-wrap">
                  <Avatar photo={form.profilePhoto} name={user?.displayName} size={92} />
                  <button className="cp-avatar-cam" onClick={() => avatarInput.current?.click()} title="Upload photo">📷</button>
                  <input ref={avatarInput} type="file" accept="image/jpeg,image/png" onChange={handlePhoto} hidden />
                </div>
                <div className="cp-avatar-side">
                  <button className="btn btn-secondary btn-sm" onClick={() => avatarInput.current?.click()} disabled={photoUploading}>
                    {photoUploading ? 'Uploading...' : form.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  <p className="cp-note">JPG or PNG · max 5MB</p>
                </div>
              </div>

              <div className="cp-field-grid">
                <div className="cp-field">
                  <label>Display Name</label>
                  <input className="cp-input" value={user?.displayName || ''} readOnly />
                </div>
                <div className="cp-field">
                  <label>Username</label>
                  <input className="cp-input" value={username} onChange={(e) => setExtras({ ...extras, username: e.target.value })} />
                </div>
                <div className="cp-field">
                  <label>Email</label>
                  <input className="cp-input" value={user?.email || ''} readOnly />
                </div>
                <div className="cp-field">
                  <label>Country</label>
                  <div className="cp-chip-row">
                    {COUNTRIES.map((c) => (
                      <button key={c} className={`cp-chip ${extras.country === c ? 'selected' : ''}`} onClick={() => setExtras({ ...extras, country: c })}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="cp-field">
                  <label>Timezone</label>
                  <div className="cp-chip-row">
                    {TIMEZONES.map((t) => (
                      <button key={t} className={`cp-chip ${extras.timezone === t ? 'selected' : ''}`} onClick={() => setExtras({ ...extras, timezone: t })}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="cp-field">
                  <label>Language</label>
                  <div className="cp-chip-row">
                    {LANGUAGES.map((l) => {
                      const selected = (extras.languages || []).includes(l);
                      return (
                        <button key={l} className={`cp-chip ${selected ? 'selected' : ''}`}
                          onClick={() => setExtras({ ...extras, languages: selected ? extras.languages.filter((x) => x !== l) : [...(extras.languages || []), l] })}>{l}</button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="cp-subhead">Niche <span className="cp-subhead-hint">· pick one or more</span></div>
              <div className="gate-niche-grid">
                {NICHES.map((n) => {
                  const selected = form.niches.includes(n.label);
                  return (
                    <button
                      key={n.label}
                      className={`gate-niche ${selected ? 'selected' : ''}`}
                      onClick={() => { toggleNiche(n.label); logActivity('🎯', `Chose ${n.label} niche`); }}
                    >
                      <span className="gate-niche-icon">{n.icon}</span>
                      <span className="gate-niche-label">{n.label}</span>
                      {selected && <span className="gate-niche-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="cp-card" id="cp-platforms">
              <div className="cp-card-head"><h3>📡 Connect Your Platforms</h3></div>
              <p className="cp-subnote">
                Connect your YouTube and Instagram accounts to track real-time growth, engagement, and analytics on your dashboard.
              </p>
              <div className="cp-platform-list">
                {PLATFORMS.map((p) => (
                  <ProfilePlatform
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    icon={p.icon}
                    selected={form.platforms.includes(p.id)}
                    handle={p.id === 'YouTube' ? form.youtubeChannel : form.instagramHandle}
                    format={p.id === 'YouTube' ? form.youtubeFormat : form.instagramFormat}
                    formats={p.formats}
                    onConnect={connectPlatform}
                    onRemove={removePlatform}
                    onFormat={setFormat}
                  />
                ))}
              </div>
              <div className="cp-platform-hint">
                <span className="cp-platform-hint-icon">💡</span>
                <span>After connecting, head to the Dashboard and click <strong>Refresh data</strong> to pull your latest stats.</span>
              </div>
            </section>

            <section className="cp-card">
              <div className="cp-card-head"><h3>🎯 Goals</h3></div>
              <p className="cp-subnote">Pick what you want to grow, or add your own goal — change anytime.</p>
              <div className="cp-goal-chips">
                {GOALS.map((g) => (
                  <button key={g} className={`cp-chip cp-goal-chip ${form.goals.includes(g) ? 'selected' : ''}`} onClick={() => toggleGoal(g)}>
                    {form.goals.includes(g) ? '✓ ' : ''}{g}
                  </button>
                ))}
                {form.goals.filter((g) => !GOALS.includes(g)).map((g) => (
                  <button key={g} className="cp-chip cp-goal-chip selected custom" onClick={() => toggleGoal(g)}>
                    ✓ {g} ✕
                  </button>
                ))}
              </div>
            <div className="cp-goal-add-label">Add your own goal</div>
              <div className="cp-goal-add">
                <textarea
                  className="cp-input cp-goal-textarea"
                  rows={3}
                  value={customGoal}
                  placeholder="Type your own goal — e.g. reach 10K subscribers, post 3 videos a week, hit a 5% click rate…"
                  onChange={(e) => setCustomGoal(e.target.value)}
                />
                <button className="btn btn-secondary cp-goal-add-btn" onClick={addCustomGoal} disabled={!customGoal.trim()}>+ Add</button>
              </div>
            </section>

            <section className="cp-card">
              <div className="cp-card-head"><h3>👥 Audience</h3></div>
              <div className="cp-audience">
                <div className="cp-aud-row">
                  <label>Age</label>
                  <div className="cp-segment">
                    {AGES.map((a) => (
                      <button key={a} className={`cp-seg ${extras.age === a ? 'active' : ''}`} onClick={() => setExtras({ ...extras, age: a })}>{a}</button>
                    ))}
                  </div>
                </div>
                <div className="cp-aud-row">
                  <label>Gender</label>
                  <div className="cp-segment">
                    {GENDERS.map((g) => (
                      <button key={g} className={`cp-seg ${extras.gender === g ? 'active' : ''}`} onClick={() => setExtras({ ...extras, gender: g })}>{g}</button>
                    ))}
                  </div>
                </div>
                <div className="cp-aud-row">
                  <label>Region</label>
                  <div className="cp-segment">
                    {REGIONS.map((r) => (
                      <button key={r} className={`cp-seg ${extras.region === r ? 'active' : ''}`} onClick={() => setExtras({ ...extras, region: r })}>{r}</button>
                    ))}
                  </div>
                </div>
                <div className="cp-aud-row">
                  <label>Content Frequency</label>
                  <div className="cp-segment">
                    {FREQUENCIES.map((f) => (
                      <button key={f} className={`cp-seg ${extras.frequency === f ? 'active' : ''}`} onClick={() => setExtras({ ...extras, frequency: f })}>{f}</button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="cp-savebar" style={{ position: 'sticky', bottom: 0, zIndex: 20, background: 'rgba(15,15,25,0.95)', backdropFilter: 'blur(10px)', padding: '12px 0', marginTop: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span className="cp-save-status" style={{ color: saved ? '#4ADE80' : toast && toast.startsWith('Error') ? '#F87171' : '#94A3B8', fontWeight: 600, fontSize: 13 }}>
                  {saved ? '✓ Profile saved successfully' : toast && toast.startsWith('Error') ? toast : completion < 100 ? `${completion}% complete — ${completionResult.details.filter(d => !d.done).map(d => d.key).join(', ')} remaining` : '✓ All fields complete'}
                </span>
                <button className={`btn ${saved ? 'btn-success' : 'btn-primary'}`} onClick={handleSave} disabled={saving} style={{ minWidth: 140 }}>
                  {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>

          <aside className="cp-rail">
            <section className="cp-card cp-summary-card">
              <div className="cp-card-head"><h3>🧠 Profile Summary</h3></div>
              <div className="cp-summary">
                <div className="cp-sum-row"><span>Creator Type</span><strong>{form.niches.join(', ') || 'Not set'}</strong></div>
                <div className="cp-sum-row"><span>Platform</span><strong>{form.platforms.join(' & ') || 'Not set'}</strong></div>
                <div className="cp-sum-row"><span>Target Audience</span><strong>{targetAudience}</strong></div>
                <div className="cp-sum-row"><span>Posting Frequency</span><strong>{extras.frequency || 'Not set'}</strong></div>
                <div className="cp-sum-row"><span>Goal</span><strong>{form.goals[0] || 'Not set'}</strong></div>
              </div>
            </section>

            <section className="cp-card cp-insight-card">
              <div className="cp-insight-icon">📊</div>
              <p>
                Creators in <strong>{form.niches.join(' / ') || 'your niche'}</strong> who post{' '}
                <strong>{extras.frequency || '3x a week'}</strong> grow <strong>{rate} faster</strong>.
              </p>
              <p className="cp-insight-tip">{insightTip}</p>
            </section>

            <section className="cp-card">
              <div className="cp-card-head"><h3>🕘 Recent Activity</h3></div>
              <div className="cp-activity">
                {(activity || []).map((a, i) => (
                  <div key={i} className="cp-act-item">
                    <div className="cp-act-time">{a.time}</div>
                    <div className="cp-act-body">
                      <span className="cp-act-icon">{a.icon}</span>
                      <span>{a.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="cp-card">
              <div className="cp-card-head"><h3>⚡ Quick Actions</h3></div>
              <div className="cp-actions">
                <button className="cp-action" onClick={() => scrollTo('cp-platforms')}>📡 Connect Platform</button>
                <button className="cp-action" onClick={() => scrollTo('cp-identity')}>✏️ Edit Profile</button>
                <button className="cp-action" onClick={() => avatarInput.current?.click()}>🖼️ Upload Photo</button>
                <button className="cp-action" onClick={() => navigate('/dashboard')}>🏠 View Dashboard</button>
              </div>
            </section>

            <section className="cp-card cp-premium-card">
              <div className="cp-premium-head">
                <span className="cp-premium-badge">💎</span>
                <h3>Unlock Premium</h3>
              </div>
              <ul className="cp-premium-list">
                <li>🕵️ Competitor Tracking</li>
                <li>🧠 Advanced Tools</li>
                <li>📈 Growth Prediction</li>
                <li>🗓️ Content Calendar</li>
              </ul>
              <button className="btn btn-primary cp-premium-btn" onClick={() => navigate('/premium')}>Upgrade</button>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
