import { useEffect, useState } from 'react';
import AppShell from './AppShell';
import { postingAPI, plansAPI } from './api';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const fmtH = (h) => `${((h + 11) % 12) + 1}${h < 12 ? 'a' : 'p'}`;

/**
 * Module 5 — Posting-time recommendation (frontend, Bootstrap).
 * Backend: GET /api/posting-times/personal + /schedule (seeded lookup).
 */
export default function PostingTimePage() {
  const [personal, setPersonal] = useState(null);
  const [platform, setPlatform] = useState('YouTube');
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const [planForm, setPlanForm] = useState({ title: '', platform: 'YouTube', date: '', time: '19:00', note: '' });
  const [planMsg, setPlanMsg] = useState('');

  const loadPlans = () => plansAPI.list().then((r) => setPlans(r.data || [])).catch(() => {});

  const savePlan = async () => {
    if (!planForm.title.trim()) { setPlanMsg('Give your future post a title first.'); return; }
    try {
      await plansAPI.create(planForm);
      setPlanForm({ title: '', platform: 'YouTube', date: '', time: '19:00', note: '' });
      setPlanMsg('Saved — it will wait for you here until posting day.');
      loadPlans();
      setTimeout(() => setPlanMsg(''), 3500);
    } catch (e) { setPlanMsg(e.response?.data?.error || 'Could not save.'); }
  };

  useEffect(() => {
    loadPlans();
    postingAPI.personal().then((r) => {
      setPersonal(r.data);
      const first = r.data?.platforms?.[0];
      if (first) setPlatform(first.toLowerCase().includes('insta') ? 'Instagram' : 'YouTube');
    }).catch(() => setError('Could not load recommendations — is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    postingAPI.schedule(platform).then((r) => setSchedule(r.data)).catch(() => {});
  }, [platform]);

  const grid = schedule?.grid || {};
  const hotSet = new Set();
  Object.entries(grid).forEach(([d, hs]) => (hs || []).forEach((h) => hotSet.add(`${d}-${h}`)));

  return (
    <AppShell active="/posting-time">
      <div className="cp-module container-fluid py-3">
        <h2 className="fw-bold mb-1">Best Posting Time</h2>
        <p className="text-secondary small">Your personal posting plan — built from your niche, your audience, your history and what's coming up.</p>
        {error && (
          <div className="alert alert-danger">
            <strong>Something went wrong.</strong>
            <p className="mb-2 small">{error} If the problem continues, check the service status.</p>
            <button className="btn btn-sm btn-outline-light" onClick={() => window.location.reload()}>Try again</button>
          </div>
        )}
        {loading && <div className="card"><div className="card-body"><div className="cp-skel-row"><div className="cp-skeleton" /><div className="cp-skeleton" /></div></div></div>}

        {!loading && personal?.videoAngles?.length > 0 && personal?.best?.length > 0 && (
          <div className="alert alert-success">
            <strong>Your plan:</strong> post “{personal.videoAngles[0].title}” on <strong>{personal.best[0].day ? personal.best[0].day + ', ' : ''}{personal.best[0].window}</strong> ({personal.best[0].platform}) — {personal.best[0].source || personal.best[0].reasoning}
          </div>
        )}

        {(personal?.videoAngles || []).length > 0 && (
          <div className="card border-success mb-3">
            <div className="card-header">Post this next — personalized for you</div>
            <div className="card-body d-flex flex-column gap-3">
              {personal.videoAngles.map((a, i) => (
                <div key={i} className="border rounded p-3">
                  <div className="fw-bold">{i + 1}. {a.title}</div>
                  <p className="small text-secondary mb-1 mt-1">Why now: {a.why}</p>
                  {a.followsUp && <p className="small mb-0" style={{ color: '#a78bfa' }}>{a.followsUp}</p>}
                </div>
              ))}
              {(personal?.upcomingEvents || []).length > 0 && (
                <div className="d-flex flex-wrap gap-2">
                  {personal.upcomingEvents.map((e) => (
                    <span key={e.name} className={`badge ${e.nicheMatch ? 'text-bg-warning' : 'text-bg-secondary'}`}>
                      {e.name} · {e.date} ({e.inDays}d){e.nicheMatch ? ' · your niche' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {(personal?.best || []).length > 0 && (
          <div className="row g-3 mb-3">
            {personal.best.map((b) => (
              <div key={b.platform} className="col-md-6">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <div className="text-secondary small">{b.platform} · {personal.niche} · {b.timezone || personal.timezone} · {b.audience || personal.audience}</div>
                    <div className="display-6 fw-bold">⏰ {b.window}</div>
                    {b.day && <div className="fw-semibold">Best day: {b.day}</div>}
                    <p className="small mt-2 mb-0">{b.reasoning}</p>
                    <div className="d-flex gap-2 justify-content-center mt-2">
                      <span className="badge text-bg-success">+{b.boost}% est. reach</span>
                      {b.source && <span className="badge text-bg-info">{b.source}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card mb-3">
          <div className="card-header">Your saved plans — future titles + posting times, kept here</div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-5">
                <input className="form-control" placeholder="Future video title…" maxLength={120}
                  value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} />
              </div>
              <div className="col-md-2">
                <select className="form-select" value={planForm.platform} onChange={(e) => setPlanForm({ ...planForm, platform: e.target.value })}>
                  <option>YouTube</option>
                  <option>Instagram</option>
                </select>
              </div>
              <div className="col-md-2">
                <input type="date" className="form-control" value={planForm.date} onChange={(e) => setPlanForm({ ...planForm, date: e.target.value })} />
              </div>
              <div className="col-md-2">
                <input type="time" className="form-control" value={planForm.time} onChange={(e) => setPlanForm({ ...planForm, time: e.target.value })} />
              </div>
              <div className="col-md-1 d-grid">
                <button className="btn btn-primary" onClick={savePlan}>Save</button>
              </div>
            </div>
            {planMsg && <p className="small mt-2 mb-0" style={{ color: '#a78bfa' }}>{planMsg}</p>}
            <div className="d-flex flex-column gap-2 mt-3">
              {plans.length === 0 && <p className="text-secondary small mb-0">Nothing planned yet — save your next video title and its posting time above.</p>}
              {plans.map((p) => (
                <div key={p.id} className={`d-flex justify-content-between align-items-center gap-2 border rounded p-2 ${p.status === 'DONE' ? 'opacity-50' : ''}`}>
                  <div style={{ minWidth: 0 }}>
                    <div className={p.status === 'DONE' ? 'text-decoration-line-through' : 'fw-semibold'}>{p.title}</div>
                    <div className="small text-secondary">{p.platform}{p.plannedFor ? ` · ${new Date(p.plannedFor).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : ''}</div>
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    {p.status !== 'DONE' && <button className="btn btn-sm btn-outline-success" onClick={() => plansAPI.update(p.id, { status: 'DONE' }).then(loadPlans)}>Posted ✓</button>}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => { if (confirm('Delete this plan?')) plansAPI.remove(p.id).then(loadPlans); }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <details className="card">
          <summary className="card-header d-flex flex-wrap gap-2 align-items-center justify-content-between" style={{ cursor: 'pointer' }}>
            <span>Full weekly schedule (reference)</span>
            <div className="btn-group btn-group-sm" onClick={(e) => e.preventDefault()}>
              {['YouTube', 'Instagram'].map((p) => (
                <button key={p} className={`btn ${platform === p ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPlatform(p)}>{p}</button>
              ))}
            </div>
          </summary>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm table-bordered align-middle text-center mb-0">
                <thead><tr><th className="text-start">Day</th>{HOURS.map((h) => <th key={h} className="cp-grid-cell small">{fmtH(h)}</th>)}</tr></thead>
                <tbody>
                  {DAYS.map((d) => (
                    <tr key={d}>
                      <th className="text-start">{d}</th>
                      {HOURS.map((h) => (
                        <td key={h} className={hotSet.has(`${d}-${h}`) ? 'cp-grid-hot' : 'cp-grid-cold'}>
                          {hotSet.has(`${d}-${h}`) ? '●' : '·'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              {(schedule?.rules || []).map((r) => (
                <div key={r.id} className="d-flex justify-content-between border-bottom py-2 small">
                  <span><strong>{r.dayType}</strong> · {r.window} <span className="text-secondary">({r.niche})</span><br /><span className="text-secondary">{r.reasoning}</span></span>
                  <span className="badge text-bg-success align-self-start">+{r.boost}%</span>
                </div>
              ))}
              {(schedule?.rules || []).length === 0 && <p className="text-secondary small mb-0">No rules found.</p>}
            </div>
          </div>
        </details>
      </div>
    </AppShell>
  );
}
