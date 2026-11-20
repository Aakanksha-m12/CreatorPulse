import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AppShell from './AppShell';
import PendulumLoader from './PendulumLoader';
import { contentAPI, socialAPI, historyAPI, postingAPI, thumbnailAPI } from './api';
import { NICHES } from './OnboardingPage';
import { calcCompletion } from './profileCompletion';

/* ---------- helpers ---------- */

function useCountUp(target, active = true, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!active || target == null) { setValue(target ?? 0); return; }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, active, duration]);
  return value;
}

const fmtNum = (n) => {
  if (n == null) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
};

function smoothValues(vals) {
  if (vals.length <= 2) return vals;
  return vals.map((v, i) => {
    if (i === 0 || i === vals.length - 1) return v;
    return Math.round((vals[i - 1] + v + vals[i + 1]) / 3);
  });
}

function Avatar({ photo, name, size = 56 }) {
  const [imgErr, setImgErr] = useState(false);
  if (photo && !imgErr) {
    return <img className="avatar-img" style={{ width: size, height: size }} src={photo} alt={name} onError={() => setImgErr(true)} />;
  }
  const initials = (name || 'C').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="avatar-initials" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

/* ---------- Growth Chart ---------- */

const GROWTH_RANGES = [['week', 'Weekly'], ['month', 'Monthly'], ['year', 'Yearly']];

function GrowthChart({ labels, values, range }) {
  const [offset, setOffset] = useState(1);
  useEffect(() => {
    setOffset(1);
    const t = setTimeout(() => setOffset(0), 140);
    return () => clearTimeout(t);
  }, [range, values.length]);

  if (!values.length) return <div className="trend-nodata">No growth data yet — keep posting!</div>;

  const smoothed = smoothValues(values);
  const W = 640, H = 180, P = 20;
  const min = Math.min(...smoothed);
  const max = Math.max(...smoothed);
  const span = max - min || 1;
  const points = smoothed.map((v, i) => {
    const x = P + (i * (W - 2 * P)) / (smoothed.length - 1);
    const y = H - P - ((v - min) / span) * (H - 2 * P);
    return [x, y];
  });
  const line = points.map((p) => p.join(',')).join(' ');
  const area = `M${points[0][0]},${H} L${line.replace(/,/g, ' ')} L${points[points.length - 1][0]},${H} Z`;
  const maxLabels = 6;
  const step = Math.max(1, Math.ceil(smoothed.length / maxLabels));

  return (
    <div className="growth-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="trend-svg">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trendGrad)" />
        <polyline points={line} pathLength={1} fill="none" className="trend-line"
          style={{ strokeDasharray: 1, strokeDashoffset: offset }} />
        {points.filter((_, i) => i % step === 0 || i === points.length - 1).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} className="trend-dot" />
        ))}
      </svg>
      <div className="growth-x-labels">
        {labels.map((l, i) => (i % step === 0 || i === labels.length - 1 ? <span key={i}>{l}</span> : <span key={i} />))}
      </div>
    </div>
  );
}

/* ---------- Overflow Menu ---------- */

function OverflowMenu({ onManual, onConnect, onRefresh, onEntries, refreshing }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="overflow-menu-wrap" ref={ref}>
      <button className="overflow-menu-btn" onClick={() => setOpen(!open)} title="More options">⋯</button>
      {open && (
        <div className="overflow-menu">
          <button onClick={() => { onManual(); setOpen(false); }}>✍️ Enter manually</button>
          <button onClick={() => { onEntries(); setOpen(false); }}>📊 View all entries</button>
          <button onClick={() => { onConnect(); setOpen(false); }}>🔗 How to connect</button>
          <button onClick={() => { onRefresh(); setOpen(false); }} disabled={refreshing}>
            {refreshing ? '⟳ Loading...' : '⟳ Refresh data'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Today's Goal ---------- */

const GOAL_OPTIONS = [
  { key: 'upload', icon: '🖼️', label: 'Upload a thumbnail' },
  { key: 'score', icon: '🎯', label: 'Score 85+ on a thumbnail' },
  { key: 'title', icon: '✏️', label: 'Write a title' },
  { key: 'hashtags', icon: '#️⃣', label: 'Try 5 new hashtags' },
  { key: 'publish', icon: '🚀', label: 'Publish a video' },
  { key: 'engage', icon: '💬', label: 'Reply to 10 comments' },
];

const loadGoals = () => {
  try {
    const s = JSON.parse(localStorage.getItem('cp_today_goals') || '[]');
    return Array.isArray(s) ? s.filter((k) => GOAL_OPTIONS.some((g) => g.key === k)) : [];
  } catch { return []; }
};

function TodayGoal() {
  const [goals, setGoals] = useState(loadGoals);
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp_today_done') || '{}'); } catch { return {}; }
  });
  const [editing, setEditing] = useState(() => loadGoals().length === 0);
  const [hint, setHint] = useState('');

  useEffect(() => { localStorage.setItem('cp_today_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('cp_today_done', JSON.stringify(done)); }, [done]);

  const togglePick = (key) => {
    if (goals.includes(key)) {
      setGoals((g) => g.filter((k) => k !== key));
      setDone((d) => { const n = { ...d }; delete n[key]; return n; });
    } else if (goals.length >= 4) {
      setHint('You can pick up to 4 goals');
      setTimeout(() => setHint(''), 2200);
    } else {
      setGoals((g) => [...g, key]);
    }
  };

  const doneCount = goals.filter((k) => done[k]).length;
  const allDone = goals.length > 0 && doneCount === goals.length;

  if (editing || goals.length === 0) {
    return (
      <div className="goal-card">
        <div className="card-head">
          <h3>Today's Goal</h3>
          <span className="checklist-count">{goals.length}/4 max</span>
        </div>
        <p className="goal-sub">Pick 1–4 goals for today — your daily focus.</p>
        <div className="goal-pick-grid">
          {GOAL_OPTIONS.map((g) => {
            const sel = goals.includes(g.key);
            return (
              <button key={g.key} className={`goal-pick ${sel ? 'selected' : ''}`} onClick={() => togglePick(g.key)}>
                <span className="goal-pick-check">{sel ? '✓' : ''}</span>
                <span className="goal-pick-icon">{g.icon}</span>
                <span className="goal-pick-label">{g.label}</span>
              </button>
            );
          })}
        </div>
        {hint && <p className="goal-hint">{hint}</p>}
        {goals.length === 0 && !hint && <p className="goal-hint">Pick at least 1 goal to set today's focus.</p>}
        <div className="goal-actions">
          <button className="btn btn-primary btn-sm" disabled={goals.length === 0} onClick={() => setEditing(false)}>
            Set today's goals →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="goal-card">
      <div className="card-head">
        <h3>Today's Goal</h3>
        <button className="view-all" onClick={() => setEditing(true)}>Edit goals</button>
      </div>
      {allDone ? (
        <div className="goal-complete-badge">🏆 Today's goal complete — great job!</div>
      ) : (
        <>
          <div className="checklist-track"><i style={{ width: `${(doneCount / goals.length) * 100}%` }} /></div>
          <div className="checklist-count-row">Done {doneCount} of {goals.length}</div>
          {GOAL_OPTIONS.filter((g) => goals.includes(g.key)).map((g) => (
            <button key={g.key} className={`checklist-item ${done[g.key] ? 'done' : ''}`}
              onClick={() => setDone((d) => ({ ...d, [g.key]: !d[g.key] }))}>
              <span className="checklist-box">{done[g.key] ? '✓' : ''}</span>
              <span className="checklist-icon">{g.icon}</span>
              <span className="checklist-label">{g.label}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

/* ---------- upload zone ---------- */

function UploadZone({ uploadedName, onUpload }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f && /image\/(png|jpe?g|webp)/.test(f.type)) onUpload(f);
  };
  return (
    <div className={`upload-zone ${dragOver ? 'dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
      <div className="upload-zone-icon">📷</div>
      {uploadedName ? (
        <><div className="upload-zone-title">Analyze another thumbnail</div>
        <div className="upload-zone-sub">Last: {uploadedName}</div></>
      ) : (
        <><div className="upload-zone-title">Drag Thumbnail Here</div>
        <div className="upload-zone-sub">or <span className="upload-browse">Browse File</span></div></>
      )}
      <div className="upload-zone-formats">PNG · JPG · WEBP</div>
    </div>
  );
}

/* ---------- creator assistant ---------- */

const SAMPLE_IDEAS = [
  ['Script', 'Start with a 3-second before/after teaser, then walk through the fix step by step.'],
  ['Hook', '"Nobody tells you this about thumbnails…"'],
  ['Title', 'The 5-Second Thumbnail Trick That Doubled My CTR'],
  ['Hashtags', '#ThumbnailTips #YouTubeGrowth #CreatorTips #Viralshorts'],
  ['Caption', "Swipe for the breakdown — What's the one thing your thumbnail is missing?"],
];

function CreatorAssistant({ niche, platform }) {
  const [ideas, setIdeas] = useState(null);
  const [generating, setGenerating] = useState(false);
  const gen = () => {
    setGenerating(true);
    setTimeout(() => { setIdeas(SAMPLE_IDEAS); setGenerating(false); }, 900);
  };
  return (
    <div className="ai-assistant">
      <div className="card-head">
        <h3>Creator Assistant</h3>
        <span className="idea-spark">✨</span>
      </div>
      <p className="ai-assistant-sub">
        {niche ? `Describe a "${niche}" ${platform} video to get scripts, hooks, titles, hashtags and captions.`
          : 'Set your niche on the profile page to unlock content made for you.'}
      </p>
      {!ideas ? (
        <div className="ai-preview-grid">
          <span>📜 Scripts</span><span>🪝 Hooks</span><span>📰 Titles</span><span>#️⃣ Hashtags</span><span>💬 Captions</span>
        </div>
      ) : (
        <div className="ai-ideas">
          {ideas.map(([k, v]) => (
            <div key={k} className="ai-idea">
              <span className="ai-idea-kind">{k}</span>
              <span className="ai-idea-text">{v}</span>
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-primary btn-block" onClick={gen} disabled={generating}>
        {generating ? 'Generating…' : (ideas ? 'Regenerate ideas' : '✨ Generate ideas')}
      </button>
    </div>
  );
}

/* ---------- activity timeline ---------- */

function ActivityTimeline({ uploads, onUpload }) {
  if (uploads.length === 0) {
    return (
      <div className="timeline-empty">
        <div className="timeline-empty-icon">🎬</div>
        <p>Your uploads will appear here as a timeline.</p>
        <button className="btn btn-secondary" onClick={onUpload}>Upload Content</button>
      </div>
    );
  }
  const groupLabel = (d) => {
    const today = new Date();
    const day = new Date(d);
    const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((startOf(today) - startOf(day)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return day.toLocaleDateString(undefined, { weekday: 'long' });
  };
  let lastGroup = null;
  return (
    <div className="timeline">
      {uploads.slice(0, 8).map((u) => {
        const g = groupLabel(u.uploadedAt);
        const showGroup = g !== lastGroup;
        lastGroup = g;
        return (
          <div key={u.id}>
            {showGroup && <div className="timeline-group">{g}</div>}
            <div className="timeline-item">
              <span className="timeline-dot" />
              <span className="timeline-thumb">🖼️</span>
              <span className="timeline-file">{u.originalFilename}</span>
              <span className="tier-badge tier-low">Pending</span>
            </div>
          </div>
        );
      })}
      <div className="timeline-item dim">
        <span className="timeline-dot" />
        <span className="timeline-thumb">#️⃣</span>
        <span className="timeline-file">Generated hashtags</span>
        <span className="tier-badge tier-high">Done</span>
      </div>
    </div>
  );
}

/* ---------- platform content ---------- */

const PLAT_CONTENT = {
  YouTube: {
    hashtags: [['#thumbnailtips', '1.2M', '+24%'], ['#youtubeshorts', '2.1M', '+31%'], ['#creatorlife', '210K', '+8%'], ['#viralvideo', '890K', '+15%']],
    time: '7–9 PM',
    timeNote: 'Your YouTube audience is most active weekday evenings. Posting then could lift reach by an estimated 28%.',
    titles: ['The 5-Second Trick That Doubled My CTR', 'Why Your Thumbnails Get Ignored (Fix in 60s)', 'I Tested 3 Styles — Only 1 Blew Up'],
  },
  Instagram: {
    hashtags: [['#reels', '3.4M', '+31%'], ['#reelsinstagram', '1.1M', '+19%'], ['#explorepage', '950K', '+22%'], ['#contentcreator', '640K', '+11%']],
    time: '5–7 PM · 12 PM',
    timeNote: 'Your Instagram audience is most active at midday and early evening. Posting then could lift reach by an estimated 24%.',
    titles: ['3 Reel Hooks That Stop the Scroll', 'This 5-Second Intro Doubled My Reach', 'The 12-Second Edit That Keeps Viewers Watching'],
  },
};

function LockBadge({ label = 'Advanced' }) {
  return <span className="lock-badge">🔒 {label}</span>;
}

/* ---------- AI insights (cross-module summary) ---------- */

function AiInsights({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [thumb, setThumb] = useState(null);
  const [recent, setRecent] = useState([]);
  const [window_, setWindow_] = useState(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [t, h, p] = await Promise.allSettled([
          thumbnailAPI.history(), historyAPI.recent(5), postingAPI.personal(),
        ]);
        if (!live) return;
        if (t.status === 'fulfilled' && t.value.data?.length) setThumb(t.value.data[0]);
        if (h.status === 'fulfilled') setRecent(h.value.data || []);
        if (p.status === 'fulfilled' && p.value.data?.best?.length) setWindow_(p.value.data.best[0]);
      } catch { /* insights are best-effort */ } finally { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, []);

  const cards = [
    {
      icon: '◇', title: 'Thumbnail',
      text: thumb ? `Latest scored ${thumb.score}/100 — ${thumb.summary}` : 'No thumbnails analyzed yet.',
      cta: thumb ? 'View analysis' : 'Score one',
      path: '/thumbnail-scorer',
    },
    {
      icon: '◇', title: 'Content',
      text: recent.find((r) => String(r.kind).includes('COMBINED'))
        ? `Last optimization ${recent.find((r) => String(r.kind).includes('COMBINED')).score}/100.`
        : 'No content analyses yet.',
      cta: 'Optimize content',
      path: '/hashtag-optimizer',
    },
    {
      icon: '◇', title: 'Posting',
      text: window_ ? `Audience most active ${window_.window} (${window_.platform}).` : 'Recommendations loading…',
      cta: 'View recommendation',
      path: '/posting-time',
    },
  ];

  return (
    <section className="dash-card" style={{ marginTop: 16 }}>
      <div className="card-head"><h3>AI Insights</h3></div>
      {loading ? (
        <div className="cp-skel-row">
          <div className="cp-skeleton" /><div className="cp-skeleton" /><div className="cp-skeleton" />
        </div>
      ) : (
        <div className="ai-insights-grid">
          {cards.map((c) => (
            <div key={c.title} className="ai-insight">
              <span className="ai-insight-icon">{c.icon}</span>
              <div><strong>{c.title}</strong><p>{c.text}</p>
                <button className="view-all" onClick={() => onNavigate(c.path)}>{c.cta} →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ========== MAIN PAGE ========== */

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile } = useAuth();
  const [plan] = useState(() => localStorage.getItem('cp_plan') || 'free');
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(true);
  const [range, setRange] = useState('week');
  const [platform, setPlatform] = useState('YouTube');
  const [growth, setGrowth] = useState(null);
  const [growthLoading, setGrowthLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [manualForm, setManualForm] = useState({ platform: '', followers: '', views: '', date: new Date().toISOString().slice(0, 10) });
  const [manualSaving, setManualSaving] = useState(false);
  const [manualMsg, setManualMsg] = useState('');
  const [manualError, setManualError] = useState('');
  const [overview, setOverview] = useState(null);
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [showEntries, setShowEntries] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const refreshGrowth = useCallback((r) => {
    setGrowthLoading(true);
    socialAPI.growth(r)
      .then((res) => setGrowth(res.data))
      .catch(() => setGrowth({ platforms: [] }))
      .finally(() => setGrowthLoading(false));
  }, []);

  const refreshAll = useCallback(async () => {
    setGrowthLoading(true);
    try {
      const rRes = await socialAPI.refresh();
      const details = rRes.data?.details || [];
      const failed = details.filter((d) => !d.live);
      if (rRes.data && rRes.data.refreshed === false && failed.length) {
        setManualMsg(`Refresh issue: ${failed.map((d) => d.message).join(' ')}`);
        setTimeout(() => setManualMsg(''), 6000);
      } else if (rRes.data?.refreshed) {
        setManualMsg('Live data refreshed ✓');
        setTimeout(() => setManualMsg(''), 3000);
      }
    } catch { setManualMsg('Refresh failed — check connection and try again.'); setTimeout(() => setManualMsg(''), 4000); }
    try {
      const [gRes, oRes] = await Promise.all([
        socialAPI.growth(range),
        socialAPI.overview(),
      ]);
      setGrowth(gRes.data);
      setOverview(oRes.data);
    } catch {
      setGrowth({ platforms: [] });
    } finally {
      setGrowthLoading(false);
    }
  }, [range]);

  const refetchData = useCallback(async () => {
    setGrowthLoading(true);
    try {
      const [gRes, oRes] = await Promise.all([
        socialAPI.growth(range),
        socialAPI.overview(),
      ]);
      setGrowth(gRes.data);
      setOverview(oRes.data);
    } catch {
      setGrowth({ platforms: [] });
    } finally {
      setGrowthLoading(false);
    }
  }, [range]);

  const loadEntries = useCallback(async () => {
    setEntriesLoading(true);
    try {
      const res = await socialAPI.entries(false);
      setEntries(res.data || []);
    } catch { /* ok */ } finally { setEntriesLoading(false); }
  }, []);

  const deleteEntry = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await socialAPI.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      refetchData();
    } catch { /* ok */ }
  };

  const startEditEntry = (entry) => {
    setEditingEntry(entry);
    setManualForm({
      platform: entry.platform,
      followers: String(entry.followers || ''),
      views: String(entry.totalViews || ''),
      date: entry.date,
    });
    setShowManual(true);
    setShowEntries(false);
  };

  const submitManual = async () => {
    if (!manualForm.platform) { setManualError('Choose a platform first'); return; }
    setManualSaving(true);
    setManualError('');
    try {
      if (editingEntry) {
        await socialAPI.updateEntry(editingEntry.id, {
          platform: manualForm.platform,
          followers: Number(manualForm.followers) || 0,
          views: Number(manualForm.views) || 0,
          date: manualForm.date,
        });
        setManualMsg(`Updated entry for ${manualForm.date} ✓`);
      } else {
        await socialAPI.manual({
          platform: manualForm.platform,
          followers: Number(manualForm.followers) || 0,
          views: Number(manualForm.views) || 0,
          date: manualForm.date,
        });
        setManualMsg(`Saved for ${manualForm.platform === 'YOUTUBE' ? 'YouTube' : 'Instagram'} — added to chart`);
      }
      setShowManual(false);
      setEditingEntry(null);
      setManualForm({ platform: '', followers: '', views: '', date: new Date().toISOString().slice(0, 10) });
      refetchData();
      loadEntries();
      setTimeout(() => setManualMsg(''), 4000);
    } catch {
      setManualError('Could not save. Try again.');
    } finally {
      setManualSaving(false);
    }
  };

  useEffect(() => { refreshGrowth(range); }, [range, refreshGrowth]);

  useEffect(() => {
    refetchData();
  }, [refetchData]);

  useEffect(() => {
    const load = async () => {
      try { await fetchProfile(); } catch { /* new user */ } finally { setLoading(false); }
    };
    load();
    loadEntries();
  }, []);

  useEffect(() => {
    const loadUploads = async () => {
      try { const res = await contentAPI.list(); setUploads(res.data || []); } catch { /* ok */ } finally { setUploadsLoading(false); }
    };
    loadUploads();
  }, []);

  const focus = (profile?.platformFocus || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const hasYT = focus.some((p) => p.includes('youtube')) || !!profile?.youtubeChannel;
  const hasIG = focus.some((p) => p.includes('instagram')) || !!profile?.instagramHandle;
  const both = hasYT && hasIG;
  const activePlatform = both ? platform : hasYT ? 'YouTube' : hasIG ? 'Instagram' : 'YouTube';
  const content = PLAT_CONTENT[activePlatform] || PLAT_CONTENT.YouTube;

  const uploaded = uploads.length > 0;
  const uploadedName = uploads[0]?.originalFilename;

  const growthPlatforms = growth?.platforms || [];
  const activeGrowth = growthPlatforms.find((p) => p.platform === activePlatform.toUpperCase()) || growthPlatforms[0] || null;
  const growthPct = activeGrowth?.growthPercent ?? 0;
  const animatedFollowers = Math.round(useCountUp(activeGrowth?.followers ?? 0));

  const completionResult = calcCompletion(profile, null);
  const completion = completionResult.percent;
  const primaryNiche = (profile?.niches && profile.niches[0]) || profile?.niche || '';
  const nicheMeta = NICHES.find((n) => n.label === primaryNiche);
  const nicheIcon = nicheMeta?.icon || '🎯';

  const isYTConnected = !!profile?.youtubeChannel;
  const isIGConnected = !!profile?.instagramHandle;
  const activeHandle = activePlatform === 'YouTube' ? profile?.youtubeChannel : profile?.instagramHandle;
  const isActiveConnected = activePlatform === 'YouTube' ? isYTConnected : isIGConnected;

  const growthSummary = useMemo(() => {
    if (!activeGrowth?.series?.length) return null;
    const series = activeGrowth.series;
    const total = series.length;
    const latest = activeGrowth.followers ?? series[series.length - 1]?.followers ?? 0;
    const earliest = activeGrowth.firstFollowers ?? series[0]?.followers ?? 0;
    const absoluteChange = latest - earliest;
    const avgFollowers = Math.round(series.reduce((s, p) => s + (p.followers || 0), 0) / (total || 1));
    const maxFollowers = Math.max(...series.map((p) => p.followers || 0));
    const minFollowers = Math.min(...series.map((p) => p.followers || 0));
    const pctChange = earliest > 0 ? (((latest - earliest) / earliest) * 100).toFixed(1) : (latest > 0 ? '∞' : '0.0');
    const rangeLabel = range === 'week' ? '7 days' : range === 'month' ? '30 days' : '12 months';
    let trend = 'stable';
    let trendColor = '#94A3B8';
    let trendLabel = 'Steady';
    let trendIcon = '➡️';
    if (absoluteChange > 0) { trend = 'growing'; trendColor = '#4ADE80'; trendLabel = `Growing +${pctChange}%`; trendIcon = '📈'; }
    else if (absoluteChange < 0) { trend = 'declining'; trendColor = '#F87171'; trendLabel = `Declining ${pctChange}%`; trendIcon = '📉'; }
    return {
      trend, trendColor, trendLabel, trendIcon, pctChange, absoluteChange,
      latest, earliest, avgFollowers, maxFollowers, minFollowers,
      totalPoints: total, rangeLabel,
      formula: earliest > 0 ? `((${fmtNum(latest)} − ${fmtNum(earliest)}) ÷ ${fmtNum(earliest)}) × 100 = ${pctChange}%` : 'Not enough data',
    };
  }, [activeGrowth, range]);

  const goUpload = () => navigate('/thumbnail-scorer');

  return (
    <AppShell active="/dashboard">
      <div className="dash">
        {loading ? (
          <div className="dash-loading"><PendulumLoader text="Loading your pulse..." /></div>
        ) : (
          <>
            {/* SECTION 1 — GROWTH JOURNEY */}
            <section className="gj-card">
              <div className="gj-head">
                <div className="gj-identity">
                  <Avatar photo={profile?.profilePhoto} name={user?.displayName} size={64} />
                  <div>
                    <div className="gj-name">{user?.displayName || 'Creator'}</div>
                    <div className="creator-type-badge">
                      <span className="ct-icon">{nicheIcon}</span>
                      <span className="ct-label">{primaryNiche ? `${primaryNiche} Creator` : 'Creator'}</span>
                      <span className="ct-pct">{completion}% complete</span>
                    </div>
                    <div className="gj-sub">Track your channel growth over time.</div>
                  </div>
                </div>
                <div className="gj-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/edit-profile')}>Edit Profile</button>
                </div>
              </div>

              <div className="gj-toolbar">
                <div className="plat-tabs">
                  {growthPlatforms.map((gp) => {
                    const pName = gp.platform === 'YOUTUBE' ? 'YouTube' : 'Instagram';
                    const connected = gp.platform === 'YOUTUBE' ? isYTConnected : isIGConnected;
                    return (
                      <button key={gp.platform}
                        className={`plat-tab ${gp.platform === activePlatform.toUpperCase() ? 'active' : ''}`}
                        onClick={() => setPlatform(pName)}>
                        {gp.platform === 'YOUTUBE' ? '▶️' : '📸'} {pName}
                        {connected && <span className="plat-connected-dot" title="Connected" />}
                      </button>
                    );
                  })}
                  {activeGrowth && (
                    <span className={`gj-source ${activeGrowth.source || 'simulated'}`}>
                      {activeGrowth.source === 'live' ? '🔴 Live' : activeGrowth.source === 'manual' ? '✍️ Manual' : '🔵 Demo data'}
                    </span>
                  )}
                </div>
                <div className="gj-toolbar-right">
                  <div className="chart-range-toggle">
                    {GROWTH_RANGES.map(([k, lbl]) => (
                      <button key={k} className={`range-btn ${range === k ? 'active' : ''}`} onClick={() => setRange(k)}>{lbl}</button>
                    ))}
                  </div>
                  <OverflowMenu
                    onManual={() => setShowManual(true)}
                    onConnect={() => setShowConnect(true)}
                    onRefresh={refreshAll}
                    onEntries={() => { setShowEntries(!showEntries); loadEntries(); }}
                    refreshing={growthLoading}
                  />
                </div>
              </div>

              {showManual && (
                <div className="gj-manual">
                  <div className="gj-manual-head">
                    <b>{editingEntry ? 'Edit Entry' : 'Enter stats manually'}</b>
                    <span>{editingEntry ? 'Update your saved entry below.' : 'Pick a date and enter your numbers — they feed the growth chart.'}</span>
                    <button className="gj-manual-close" onClick={() => { setShowManual(false); setEditingEntry(null); setManualForm({ platform: '', followers: '', views: '', date: new Date().toISOString().slice(0, 10) }); }}>✕</button>
                  </div>
                  <div className="gj-manual-grid">
                    <input className="cp-input" type="date" value={manualForm.date}
                      onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} />
                    <select className="cp-input" value={manualForm.platform} onChange={(e) => setManualForm({ ...manualForm, platform: e.target.value })}>
                      <option value="">Platform</option>
                      <option value="YOUTUBE">▶️ YouTube</option>
                      <option value="INSTAGRAM">📸 Instagram</option>
                    </select>
                    <input className="cp-input" type="number" min="0" placeholder="Followers" value={manualForm.followers}
                      onChange={(e) => setManualForm({ ...manualForm, followers: e.target.value })} />
                    <input className="cp-input" type="number" min="0" placeholder="Views" value={manualForm.views}
                      onChange={(e) => setManualForm({ ...manualForm, views: e.target.value })} />
                    <button className="btn btn-primary btn-sm" onClick={submitManual} disabled={manualSaving}>
                      {manualSaving ? 'Saving...' : editingEntry ? 'Update entry' : 'Add entry'}
                    </button>
                  </div>
                  {manualError && <p className="goal-hint">{manualError}</p>}
                </div>
              )}

              {/* Entry History */}
              {showEntries && (
                <div className="gj-entries-panel">
                  <div className="gj-manual-head">
                    <b>📊 All Entries ({entries.length})</b>
                    <span>View, edit, or delete your manually entered data and past records.</span>
                    <button className="gj-manual-close" onClick={() => setShowEntries(false)}>✕</button>
                  </div>
                  {entriesLoading ? (
                    <div className="gj-loading"><PendulumLoader text="Loading entries..." /></div>
                  ) : entries.length === 0 ? (
                    <div className="gj-entries-empty">
                      <p>No entries yet. Click "Enter manually" to add your first data point.</p>
                    </div>
                  ) : (
                    <div className="gj-entries-table-wrap">
                      <table className="gj-entries-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Platform</th>
                            <th>Channel</th>
                            <th>Followers</th>
                            <th>Views</th>
                            <th>Source</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((e) => (
                            <tr key={e.id}>
                              <td>{e.date}</td>
                              <td>{e.platform === 'YOUTUBE' ? '▶️ YouTube' : '📸 Instagram'}</td>
                              <td className="small text-secondary">@{e.handle || '—'}</td>
                              <td>{fmtNum(e.followers)}</td>
                              <td>{fmtNum(e.totalViews)}</td>
                              <td>
                                <span className={`gj-source ${e.manualData ? 'manual' : e.realData ? 'live' : 'simulated'}`}>
                                  {e.manualData ? '✍️ Manual' : e.realData ? '🔴 Live' : '🔵 Demo'}
                                </span>
                              </td>
                              <td className="gj-entries-actions">
                                {e.manualData && (
                                  <>
                                    <button className="gj-entry-edit" onClick={() => startEditEntry(e)} title="Edit">✏️</button>
                                    <button className="gj-entry-del" onClick={() => deleteEntry(e.id)} title="Delete">🗑️</button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {showConnect && (
                <div className="gj-connect">
                  <div className="gj-connect-head">
                    <b>How to connect your accounts</b>
                    <button className="gj-manual-close" onClick={() => setShowConnect(false)}>✕</button>
                  </div>
                  <p>Go to <button className="gj-link" onClick={() => { setShowConnect(false); navigate('/edit-profile'); }}>Creator Profile</button> and type your channel name or username under Platforms. Save — your stats will appear here automatically.</p>
                </div>
              )}

              {manualMsg && <div className="gj-manual-ok">✓ {manualMsg}</div>}

              {growthLoading ? (
                <div className="gj-loading"><PendulumLoader text="Loading growth data..." /></div>
              ) : activeGrowth ? (
                <>
                  <div className="gj-body">
                    <div className="gj-score">
                      <span className="gj-score-label">Followers</span>
                      <div className="gj-score-num">
                        {fmtNum(animatedFollowers)}
                        <span className={`gj-badge ${growthPct >= 0 ? 'up' : 'down'}`}>
                          {growthPct >= 0 ? '▲' : '▼'} {Math.abs(growthPct)}%
                        </span>
                      </div>
                      <span className="gj-score-cap">vs. previous period</span>
                      {activeHandle && <span className="gj-score-sub"><a href={activePlatform === 'YouTube' ? `https://youtube.com/@${activeHandle}` : `https://instagram.com/${activeHandle}`} target="_blank" rel="noopener noreferrer" style={{color:'#8B5CF6', textDecoration:'underline'}}>@{activeHandle}</a></span>}
                    </div>
                    <div className="gj-chart">
                      <GrowthChart
                        labels={(activeGrowth.series || []).map((s) => s.label)}
                        values={(activeGrowth.series || []).map((s) => s.followers || s.views)}
                        range={range}
                      />
                    </div>
                  </div>
                  <div className="gj-stats">
                    <div className="gj-stat"><span className="gj-stat-icon">👥</span><b>{fmtNum(activeGrowth.followers)}</b><em>Followers</em></div>
                    <div className="gj-stat"><span className="gj-stat-icon">📈</span><b>{growthPct >= 0 ? '+' : ''}{growthPct}%</b><em>Growth</em></div>
                    <div className="gj-stat"><span className="gj-stat-icon">👁️</span><b>{fmtNum(activeGrowth.totalViews)}</b><em>Total Views</em></div>
                  </div>

                  {growthSummary && (
                    <div className="gj-summary-bar" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginTop: 14 }}>
                      <div className="gj-summary-row">
                        <span className="gj-summary-dot" style={{ background: growthSummary.trendColor }} />
                        <span className="gj-summary-label" style={{ color: growthSummary.trendColor, fontWeight: 700 }}>
                          {growthSummary.trendIcon} {growthSummary.trendLabel}
                        </span>
                        <span className="gj-summary-detail">
                          {growthSummary.absoluteChange >= 0 ? '+' : ''}{fmtNum(growthSummary.absoluteChange)} followers over {growthSummary.rangeLabel}
                        </span>
                      </div>
                      <div className="gj-summary-sub" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                        <span>
                          <strong style={{ color: '#E2E8F0' }}>Starting:</strong> {fmtNum(growthSummary.earliest)} → <strong style={{ color: '#E2E8F0' }}>Now:</strong> {fmtNum(growthSummary.latest)}
                          {' · '}<strong style={{ color: '#E2E8F0' }}>Peak:</strong> {fmtNum(growthSummary.maxFollowers)}
                          {' · '}<strong style={{ color: '#E2E8F0' }}>Avg:</strong> {fmtNum(growthSummary.avgFollowers)}
                        </span>
                        <span style={{ fontSize: 11, color: '#64748B' }}>
                          {growthSummary.totalPoints} data points · {growthSummary.rangeLabel} range
                        </span>
                        <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>
                          Formula: {growthSummary.formula}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeGrowth?.recentVideos?.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginTop: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#E2E8F0', marginBottom: 8 }}>🎬 Recent Videos</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activeGrowth.recentVideos.map((v, i) => (
                          <a key={v.id || i} href={v.url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', color: 'inherit', transition: 'background 0.15s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                                {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginLeft: 12, flexShrink: 0 }}>
                              <span style={{ fontSize: 11, color: '#94A3B8' }}>👁️ {fmtNum(v.views)}</span>
                              <span style={{ fontSize: 11, color: '#94A3B8' }}>👍 {fmtNum(v.likes)}</span>
                              <span style={{ fontSize: 11, color: '#94A3B8' }}>💬 {fmtNum(v.comments)}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="gj-empty">
                  <div className="gj-empty-icon">📊</div>
                  <h4>{(hasYT || hasIG) ? 'Enter your stats to see growth' : 'Connect a platform to see growth'}</h4>
                  <p>
                    {(hasYT || hasIG)
                      ? <>Your {hasYT ? 'YouTube' : ''}{hasYT && hasIG ? ' & ' : ''}{hasIG ? 'Instagram' : ''} handle{(hasYT && hasIG) ? 's are' : ' is'} connected. Enter your stats manually or click Refresh to pull data.</>
                      : 'Add your YouTube channel or Instagram handle to track followers and views over time.'}
                  </p>
                  <div className="gj-connect-quick">
                    {(hasYT || hasIG) ? (
                      <>
                        <button className="btn btn-primary" onClick={() => setShowManual(true)}>✍️ Enter Stats Manually</button>
                        <button className="btn btn-secondary" onClick={refreshAll}>🔄 Refresh Data</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-primary" onClick={() => navigate('/edit-profile')}>▶️ Connect YouTube</button>
                        <button className="btn btn-secondary" onClick={() => navigate('/edit-profile')}>📸 Connect Instagram</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </section>

            <AiInsights onNavigate={navigate} />

            {/* SECTION 2+3 — RECENT ACTIVITY + TODAY'S GOAL */}
            <div className="dash-row dash-top-row">
              <section className="dash-card activity-card">
                <div className="card-head">
                  <h3>Recent Activity</h3>
                  {uploads.length > 0 && <button className="view-all" onClick={goUpload}>View all</button>}
                </div>
                {uploadsLoading ? (
                  <div className="activity-loading"><PendulumLoader text="Loading..." /></div>
                ) : (
                  <ActivityTimeline uploads={uploads} onUpload={goUpload} />
                )}
              </section>
              <TodayGoal />
            </div>

            {/* SECTION 4 — TOOLS & INSIGHTS */}
            <section className="tools">
              <div className="tools-head">
                <h2>Tools &amp; Insights</h2>
                {both && (
                  <div className="plat-tabs">
                    <button className={`plat-tab ${activePlatform === 'YouTube' ? 'active' : ''}`} onClick={() => setPlatform('YouTube')}>▶️ YouTube</button>
                    <button className={`plat-tab ${activePlatform === 'Instagram' ? 'active' : ''}`} onClick={() => setPlatform('Instagram')}>📸 Instagram</button>
                  </div>
                )}
              </div>

              <div className="tools-grid">
                <div className="dash-card">
                  <div className="card-head">
                    <h3>Upload Thumbnail</h3>
                    <span className="tier-badge tier-medium">Free</span>
                  </div>
                  <UploadZone uploadedName={uploadedName} onUpload={goUpload} />
                </div>

                <div className="dash-card ai-analysis">
                  <div className="card-head">
                    <h3>Thumbnail Analysis</h3>
                    <LockBadge />
                  </div>
                  {uploaded ? (
                    <div className="ai-analysis-body">
                      <div className="ai-analysis-big">Nice!</div>
                      <p>Your latest thumbnail scored <strong>91/100</strong> — that's <strong>12% better</strong> than your previous upload. Text size and contrast are on point.</p>
                      <ul className="ai-analysis-list">
                        <li>✓ Strong contrast — easy to read at small sizes</li>
                        <li>✓ Clear focal point in the center third</li>
                        <li>▸ Try a brighter accent color to boost CTR further</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="ai-analysis-body empty">
                      <div className="ai-analysis-big">👋</div>
                      <p>Drop your first thumbnail and CreatorPulse grades contrast, text, faces and the curiosity gap — instantly.</p>
                      <button className="btn btn-primary" onClick={goUpload}>Analyze now</button>
                    </div>
                  )}
                </div>

                <div className="dash-card">
                  <div className="card-head">
                    <h3>Creator Assistant</h3>
                    <LockBadge />
                  </div>
                  <CreatorAssistant niche={profile?.niche} platform={activePlatform} />
                </div>

                <div className="dash-card insight-card">
                  <div className="card-head">
                    <h3>Trending Hashtags</h3>
                    <LockBadge />
                  </div>
                  <div className="hashtag-trends">
                    {content.hashtags.map(([h, c, g]) => (
                      <div key={h} className="hashtag-trend">
                        <span className="hashtag-trend-hash">{h}</span>
                        <span className="hashtag-trend-count">{c}</span>
                        <span className="hashtag-trend-growth">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dash-card insight-card">
                  <div className="card-head">
                    <h3>Best Posting Time</h3>
                    <LockBadge />
                  </div>
                  <div className="posting-time-big">⏰ {content.time}</div>
                  <p className="insight-empty">{content.timeNote}</p>
                  <button className="btn btn-secondary btn-block" onClick={() => navigate('/posting-time')}>See full schedule</button>
                </div>

                <div className="dash-card insight-card">
                  <div className="card-head">
                    <h3>Title Suggestions</h3>
                    <LockBadge />
                  </div>
                  <ul className="title-suggestions">
                    {content.titles.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                  <button className="btn btn-secondary btn-block" onClick={() => navigate('/hashtag-optimizer')}>Optimize titles</button>
                </div>
              </div>
            </section>

            </>
        )}
      </div>
    </AppShell>
  );
}
