import { useEffect, useState } from 'react';
import AppShell from './AppShell';
import PostPreview, { saveLastPost } from './PostPreview';
import { optimizeAPI, thumbnailAPI } from './api';

/**
 * Module 4 — Caption / Title / Hashtag optimizer (frontend, Bootstrap + chip input).
 * Backend: POST /api/optimize/analyze (pure-Java lexicon + Flesch-Kincaid + niche reference).
 */
export default function HashtagOptimizerPage() {
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [niche, setNiche] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [thumbImg, setThumbImg] = useState('');

  useEffect(() => { optimizeAPI.history().then((r) => setHistory(r.data || [])).catch(() => {}); }, []);
  useEffect(() => {
    thumbnailAPI.history().then((r) => {
      const first = (r.data || [])[0];
      const url = first?.details?.annotatedUrl;
      if (url) { setThumbImg(`http://localhost:8080${url}`); saveLastPost({ image: `http://localhost:8080${url}` }); }
    }).catch(() => {});
  }, []);

  const addTag = (raw) => {
    const v = (raw || '').trim().replace(/\s+/g, '');
    if (!v) return;
    const tag = v.startsWith('#') ? v : `#${v}`;
    if (!/^#[A-Za-z0-9_]{2,60}$/.test(tag)) { setError('Hashtags: letters/numbers/underscore only, 2–60 chars.'); return; }
    if (tags.length >= 30) { setError('Maximum 30 hashtags.'); return; }
    if (!tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())) setTags([...tags, tag.toLowerCase()]);
    setTagInput('');
  };

  const analyze = async () => {
    setError('');
    if (!caption.trim() && !title.trim() && !tags.length) { setError('Write a caption, a title, or add hashtags first.'); return; }
    setLoading(true);
    try {
      const res = await optimizeAPI.analyze({ caption, title, hashtags: tags, niche: niche || undefined });
      setResult(res.data);
      saveLastPost({ title, caption, hashtags: tags });
      const h = await optimizeAPI.history().catch(() => null);
      if (h) setHistory(h.data || []);
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Analysis failed — is the backend running?');
    } finally { setLoading(false); }
  };

  const card = (titleText, body) => (
    <div className="card h-100"><div className="card-header">{titleText}</div><div className="card-body">{body}</div></div>
  );

  return (
    <AppShell active="/hashtag-optimizer">
      <div className="cp-module container-fluid py-3">
        <h2 className="fw-bold mb-1">Caption & Hashtag Optimizer</h2>
        <p className="text-secondary small">Tone (lexicon) · readability (Flesch-Kincaid) · hashtag relevance (your niche list) · title clickability checklist.</p>
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
              <div className="card-header">Input</div>
              <div className="card-body">
                <label className="form-label">Caption <span className="text-secondary small">{caption.length}/2200</span></label>
                <textarea id="opt-caption" className="form-control" rows={4} maxLength={2200} value={caption}
                  onChange={(e) => setCaption(e.target.value)} placeholder="Write your post caption…" />
                <label className="form-label mt-3">Title <span className="text-secondary small">{title.length}/100</span></label>
                <input id="opt-title" className="form-control" maxLength={100} value={title}
                  onChange={(e) => setTitle(e.target.value)} placeholder="Video / post title…" />
                <label className="form-label mt-3">Hashtags ({tags.length}/30)</label>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {tags.map((t) => (
                    <span key={t} className="cp-tag-chip">{t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`remove ${t}`}>✕</button>
                    </span>
                  ))}
                  {tags.length === 0 && <span className="text-secondary small">Type a tag + Enter — each becomes a removable pill.</span>}
                </div>
                <div className="input-group">
                  <span className="input-group-text">#</span>
                  <input className="form-control" value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                    placeholder="youtubegrowth" />
                  <button className="btn btn-outline-primary" onClick={() => addTag(tagInput)}>Add</button>
                </div>
                <label className="form-label mt-3">Niche <span className="text-secondary small">(optional — defaults to your profile)</span></label>
                <input className="form-control" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Gaming" />
                <button className="btn btn-primary w-100 mt-3" disabled={loading} onClick={analyze}>
                  {loading ? 'Analyzing…' : 'Analyze'}
                </button>
              </div>
            </div>
            <div className="card mt-3">
              <div className="card-header">Recent analyses — tap one to reopen it</div>
              <ul className="list-group list-group-flush">
                {history.length === 0 && <li className="list-group-item bg-transparent text-secondary small">Nothing yet.</li>}
                {history.map((h) => (
                  <li key={h.id} className="list-group-item bg-transparent text-light d-flex justify-content-between align-items-center"
                    style={{ cursor: h.details && typeof h.details === 'object' ? 'pointer' : 'default' }}
                    title={h.details && typeof h.details === 'object' ? 'Open this analysis' : undefined}
                    onClick={() => {
                      const d = h.details;
                      if (!d || typeof d !== 'object') return;
                      setResult({
                        overallScore: h.score, niche: d.niche || '',
                        tone: d.tone, readability: d.readability, hashtags: d.hashtags,
                        title: d.title, keywords: d.keywords,
                      });
                      document.getElementById('opt-results')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                    <span className="small text-truncate">{h.summary}</span>
                    <span className="badge text-bg-info">{h.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-lg-7" id="opt-results">
            {!result && !loading && <div className="card"><div className="card-body text-center text-secondary py-5">✍️<p className="mb-0">Three compact cards + title checklist appear here.</p></div></div>}
            {loading && <div className="card"><div className="card-body"><div className="cp-skel-row"><div className="cp-skeleton" /><div className="cp-skeleton" /><div className="cp-skeleton" /></div></div></div>}
            {result && (() => {
              const areas = [
                { key: 'tone', label: 'tone', score: result.tone.score, go: 'opt-caption', act: 'Add one vivid positive word to your caption.' },
                { key: 'readability', label: 'readability', score: result.readability.score, go: 'opt-caption', act: 'Split your longest sentence in two.' },
                { key: 'hashtags', label: 'hashtags', score: result.hashtags.score, go: 'opt-suggest', act: 'Tap 3 suggested hashtags below to add them.' },
                { key: 'title', label: 'title', score: result.title.score, go: 'opt-title', act: 'Fix the first unchecked title rule below.' },
              ].sort((a, b) => a.score - b.score);
              const next = areas[0];
              const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              return (
              <>
                {(title.trim() || caption.trim() || tags.length > 0) && (
                  <div className="card mb-3">
                    <div className="card-header">As your followers will see it</div>
                    <div className="card-body d-flex justify-content-center">
                      <PostPreview image={thumbImg} title={title} caption={caption} hashtags={tags} compact />
                    </div>
                  </div>
                )}
                <div className="alert alert-success">
                  <strong>Do this next ({next.label} · {next.score}/100):</strong> {next.act}{' '}
                  <button className="btn btn-sm btn-success ms-1" onClick={() => jump(next.go)}>Show me</button>
                </div>
                <div className="alert alert-info d-flex justify-content-between align-items-center py-2">
                  <span>Overall <strong>{result.overallScore}/100</strong> · niche: <strong>{result.niche}</strong></span>
                </div>
                {result.generated && (
                  <div className="card border-success mb-3">
                    <div className="card-header">Your improved post — tap to use, or apply everything at once</div>
                    <div className="card-body d-flex flex-column gap-2">
                      <div>
                        <div className="small fw-bold mb-1">Better titles (tap one):</div>
                        {(result.generated.titles || []).map((t) => (
                          <button key={t} className="btn btn-sm btn-outline-success me-1 mb-1" onClick={() => setTitle(t)}>{t}</button>
                        ))}
                      </div>
                      <div>
                        <div className="small fw-bold mb-1">Opening hook line:</div>
                        <div className="border rounded p-2 small">{result.generated.hook}</div>
                        <div className="small text-secondary mt-1">{result.generated.hookNote}</div>
                        <button className="btn btn-sm btn-outline-success mt-1" onClick={() => setCaption((result.generated.hook + '\n\n' + caption).slice(0, 2200))}>Put hook first</button>
                      </div>
                      <div>
                        <div className="small fw-bold mb-1">Finished hashtag set ({(result.generated.hashtags || []).length}):</div>
                        <div className="d-flex flex-wrap gap-1">{(result.generated.hashtags || []).map((t) => <span key={t} className="cp-tag-chip">{t}</span>)}</div>
                        <div className="small text-secondary mt-1">{result.generated.hashtagsNote}</div>
                      </div>
                      <button className="btn btn-success" onClick={() => {
                        setTitle(result.generated.pickTitle || title);
                        setCaption((result.generated.hook + '\n\n' + caption).slice(0, 2200));
                        setTags((result.generated.hashtags || []).slice(0, 30));
                      }}>Apply everything to my post</button>
                    </div>
                  </div>
                )}
                <div className="row g-3">
                  <div className="col-md-4">{card(`Tone · ${result.tone.score}`, <><span className="badge text-bg-secondary mb-2">{result.tone.label}</span><p className="small mb-1">{result.tone.line}</p><p className="small text-secondary mb-0">+{result.tone.positive} / −{result.tone.negative} · lexicon-based</p></>)}</div>
                  <div className="col-md-4">{card(`Readability · ${result.readability.score}`, <><span className="badge text-bg-secondary mb-2">{result.readability.label}</span><p className="small mb-1">{result.readability.line}</p><p className="small text-secondary mb-0">Flesch-Kincaid {result.readability.fleschEase} · Grade {result.readability.gradeLevel}</p></>)}</div>
                  <div className="col-md-4">{card(`Hashtags · ${result.hashtags.score}`, <><p className="small mb-1">{result.hashtags.line}</p><p className="small text-secondary mb-0">{result.hashtags.matched?.length || 0} niche matches · {result.hashtags.used} used</p></>)}</div>
                </div>
                {result.keywords && (result.keywords.keywords || []).length > 0 && (
                  <details className="card mt-3">
                    <summary className="card-header" style={{ cursor: 'pointer' }}>Keywords (TF-IDF) — {result.keywords.line}</summary>
                    <div className="card-body d-flex flex-wrap gap-2">
                      {(result.keywords.keywords || []).map((k) => (
                        <span key={k.term} className="cp-tag-chip">{k.term} <span className="badge text-bg-dark">{k.score}</span></span>
                      ))}
                    </div>
                    <div className="card-footer small text-secondary">{result.keywords.method}</div>
                  </details>
                )}
                <details className="card mt-3">
                  <summary className="card-header" style={{ cursor: 'pointer' }}>Title checklist · {result.title.score} — {result.title.line}</summary>
                  <ul className="list-group list-group-flush">
                    {(result.title.checks || []).map((c, i) => (
                      <li key={i} className="list-group-item bg-transparent text-light small">
                        <span className={c.pass ? 'cp-check-pass' : 'cp-check-fail'}>{c.pass ? '✓ ' : '○ '}</span>{c.line}
                      </li>
                    ))}
                  </ul>
                </details>
                {(result.hashtags.suggested || []).length > 0 && (
                  <div className="card mt-3" id="opt-suggest">
                    <div className="card-header">Suggested hashtags — tap to add</div>
                    <div className="card-body d-flex flex-column gap-2">
                      {result.hashtags.suggested.map((s) => (
                        <div key={s.tag} className="d-flex justify-content-between align-items-center gap-2 border rounded p-2">
                          <div>
                            <strong>{s.tag}</strong> <span className="badge text-bg-dark ms-1">{s.popularity}</span>
                            {s.why && <div className="small text-secondary">{s.why}</div>}
                          </div>
                          <button className="btn btn-sm btn-outline-info cp-suggest-chip flex-shrink-0"
                            onClick={() => { if (!tags.includes(s.tag.toLowerCase()) && tags.length < 30) setTags([...tags, s.tag.toLowerCase()]); }}>
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
              );
              })()
            }
          </div>
        </div>
      </div>
    </AppShell>
  );
}
