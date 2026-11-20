import { useEffect, useRef, useState } from 'react';
import AppShell from './AppShell';
import PostPreview, { loadLastPost, saveLastPost } from './PostPreview';
import { thumbnailAPI } from './api';

/**
 * Module 3 — Thumbnail Scorer (frontend, Bootstrap).
 * Backend: POST /api/thumbnails/score (Java ImageIO heuristics, no Python).
 */
const ACCEPT = 'image/png,image/jpeg,image/webp';

function ScoreBar({ label, score }) {
  const color = score >= 75 ? 'bg-success' : score >= 55 ? 'bg-info' : score >= 40 ? 'bg-warning' : 'bg-danger';
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between small"><span>{label}</span><strong>{score}</strong></div>
      <div className="progress" style={{ height: 8 }}>
        <div className={`progress-bar ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function ThumbnailScorerPage() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => { thumbnailAPI.history().then((r) => setHistory(r.data || [])).catch(() => {}); }, []);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const pick = (list) => {
    setError('');
    const imgs = Array.from(list || []).filter((f) => /image\/(png|jpe?g|webp)/.test(f.type));
    if (!imgs.length) { setError('Choose PNG, JPG or WebP images (max 5, 10MB each).'); return; }
    const tooBig = imgs.find((f) => f.size > 10 * 1024 * 1024);
    if (tooBig) { setError(`"${tooBig.name}" is over 10MB — compress and retry.`); return; }
    const merged = [...files, ...imgs].slice(0, 5);
    setFiles(merged);
    setPreviews(merged.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })));
  };

  const analyze = async () => {
    if (!files.length) { setError('Add at least 1 thumbnail first.'); return; }
    setLoading(true); setError('');
    try {
      const res = await thumbnailAPI.score(files);
      const list = res.data?.results || [];
      setResults(list);
      const best = list.find((r) => r.bestPick) || list[0];
      if (best?.annotatedUrl) saveLastPost({ image: `http://localhost:8080${best.annotatedUrl}` });
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Scoring failed — is the backend running on :8080?');
    } finally { setLoading(false); }
  };

  const lastPost = loadLastPost();

  return (
    <AppShell active="/thumbnail-scorer">
      <div className="cp-module container-fluid py-3">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <div>
            <h2 className="fw-bold mb-0">Thumbnail Scorer</h2>
            <p className="text-secondary mb-0 small">Up to 5 images · scored in pure Java (brightness, colour, composition, sharpness, resolution) with rule-of-thirds overlay.</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <strong>Something went wrong.</strong>
            <p className="mb-2 small">{error}</p>
            <button className="btn btn-sm btn-outline-light" onClick={() => { setError(''); analyze(); }}>Try again</button>
          </div>
        )}

        <div className="row g-3">
          <div className="col-lg-5">
            <div className="card">
              <div className="card-header">1 · Upload thumbnails</div>
              <div className="card-body">
                <div
                  className={`cp-dropzone text-center p-4 ${dragging ? 'dragging' : ''}`}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files); }}
                >
                  <div className="fs-1">📷</div>
                  <div className="fw-semibold">Drag & drop or click to browse</div>
                  <div className="small text-secondary">PNG · JPG · WEBP — {files.length}/5 selected</div>
                  <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => pick(e.target.files)} />
                </div>
                {previews.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    {previews.map((p) => (
                      <img key={p.url} src={p.url} alt={p.name} title={p.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)' }} />
                    ))}
                  </div>
                )}
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-primary flex-grow-1" disabled={loading || !files.length} onClick={analyze}>
                    {loading ? 'Scoring…' : 'Score thumbnails'}
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => { setFiles([]); setPreviews([]); setResults([]); }}>Clear</button>
                </div>
                <p className="small text-secondary mt-2 mb-0">Free plan: 3 scores/week · Pro: unlimited.</p>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">Recent scores — tap one to reopen it</div>
              <div className="card-body d-flex flex-column gap-2">
                {(history || []).length === 0 && <p className="text-secondary small mb-0">No scores yet — your runs will appear here with photo, score and top fix.</p>}
                {(history || []).map((h) => {
                  const d = h.details && typeof h.details === 'object' ? h.details : {};
                  const tips = Array.isArray(d.suggestions) ? d.suggestions : [];
                  return (
                    <div key={h.id} className="d-flex gap-2 align-items-center border rounded p-2"
                      style={{ cursor: 'pointer' }} title="Open this analysis"
                      onClick={() => {
                        const bd = d.breakdown && typeof d.breakdown === 'object' ? d.breakdown : {};
                        const fx = Array.isArray(d.fixes) && d.fixes.length ? d.fixes
                          : tips.slice(0, 3).map((t, i) => ({ step: i + 1, how: t, impact: null, why: '' }));
                        setResults([{
                          fileName: h.summary, overallScore: h.score, grade: d.grade || '—',
                          verdict: d.verdict || '', breakdown: bd,
                          suggestions: tips, annotatedUrl: d.annotatedUrl || null,
                          fixes: fx,
                          source: 'history', rank: null, bestPick: false,
                        }]);
                        document.getElementById('thumb-results')?.scrollIntoView({ behavior: 'smooth' });
                      }}>
                      {d.annotatedUrl
                        ? <img src={`http://localhost:8080${d.annotatedUrl}`} alt={h.summary} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                        : <div style={{ width: 64, height: 64, borderRadius: 8, background: 'rgba(255,255,255,.06)' }} className="d-flex align-items-center justify-content-center">🖼️</div>}
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between align-items-center gap-2">
                          <span className="text-truncate small fw-semibold">{h.summary}</span>
                          <span className="badge text-bg-success">{h.score}{d.grade ? ` · ${d.grade}` : ''}</span>
                        </div>
                        <div className="small text-secondary text-truncate">{d.verdict || ''}</div>
                        {tips[0] && <div className="small" style={{ color: '#fbbf24' }}>Next fix: {tips[0]}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-lg-7" id="thumb-results">
            {results.length === 0 && !loading && (
              <div className="card"><div className="card-body text-center text-secondary py-5">
                <div className="fs-1">🖼️</div>
                <p className="mb-0">Results appear here — overall score, grade, 5-part breakdown, annotated overlay and fixes.</p>
              </div></div>
            )}
            {loading && (
              <div className="card"><div className="card-body"><div className="cp-skel-row"><div className="cp-skeleton" /><div className="cp-skeleton" /></div></div></div>
            )}
            {results.length > 0 && results[0]?.bestPick && (
              <div className="alert alert-success">🏆 <strong>Best pick: {results[0].fileName} — {results[0].overallScore}/100</strong> (ranked best of {results.length})</div>
            )}
            {results.length > 0 && (() => {
              const best = results.find((r) => r.bestPick) || results[0];
              const img = best?.annotatedUrl ? `http://localhost:8080${best.annotatedUrl}` : (previews[0]?.url || lastPost.image || '');
              if (!img && !lastPost.title && !(lastPost.hashtags || []).length) return null;
              return (
                <div className="card mb-3">
                  <div className="card-header">Your best pick, as followers will see it</div>
                  <div className="card-body d-flex justify-content-center">
                    <PostPreview image={img} title={lastPost.title || best?.fileName} caption={lastPost.caption || ''} hashtags={lastPost.hashtags || []} compact />
                  </div>
                </div>
              );
            })()}
            {results.map((r, i) => (
              <div key={i} className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="text-truncate">#{r.rank || i + 1} · {r.fileName} {r.bestPick && <span className="badge text-bg-warning ms-1">BEST PICK</span>}</span>
                  <span className="d-flex gap-1 align-items-center">
                    <span className={`badge ${r.source === 'opencv' ? 'text-bg-primary' : 'text-bg-secondary'}`}>{r.source === 'opencv' ? 'OpenCV' : 'Java fallback'}</span>
                    <span className="badge text-bg-success fs-6">{r.overallScore} · {r.grade}</span>
                  </span>
                </div>
                <div className="card-body">
                  <p className="mb-2"><strong>{r.verdict}</strong></p>
                  {(r.fixes || []).length > 0 && (
                    <div className="alert alert-warning mb-3">
                      <strong>To get more clicks, do this:</strong>
                      <ol className="mb-0 mt-1">
                        {(r.fixes || []).map((f, k) => (
                          <li key={k}><strong>{f.how}</strong>{f.impact != null && <span className="badge text-bg-success ms-1">+{f.impact} pts</span>}{f.polish && <span className="badge text-bg-info ms-1">polish</span>}<br /><span className="small">{f.why}</span></li>
                        ))}
                      </ol>
                    </div>
                  )}
                  <div className="row g-3">
                    <div className="col-md-5 text-center">
                      {r.annotatedUrl
                        ? <img className="cp-annotated img-fluid" src={`http://localhost:8080${r.annotatedUrl}`} alt="annotated" />
                        : previews[i] && <img className="cp-annotated img-fluid" src={previews[i].url} alt="preview" />}
                      <div className="small text-secondary mt-1">Overlay: rule-of-thirds grid + focal point</div>
                    </div>
                    <div className="col-md-7">
                      <details>
                        <summary className="small text-secondary" style={{ cursor: 'pointer' }}>Score details (for the curious)</summary>
                        {Object.entries(r.breakdown || {}).map(([k, v]) => (
                          <ScoreBar key={k} label={`${k} (${v.weight}%) — ${v.detail}`} score={v.score} />
                        ))}
                      </details>
                      <ul className="small mt-2 mb-0">
                        {(r.suggestions || []).map((s, j) => <li key={j}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
