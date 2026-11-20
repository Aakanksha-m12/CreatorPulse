import { useState } from 'react';

/**
 * Follower's-eye preview: one phone frame showing thumbnail + title +
 * first caption line + hashtags, as followers see it in feed.
 * Fed by all three tools via props (image from thumbnails,
 * title/caption/tags from the optimizer).
 */
export function saveLastPost(partial) {
  try {
    const prev = JSON.parse(localStorage.getItem('cp_last_post') || '{}');
    localStorage.setItem('cp_last_post', JSON.stringify({ ...prev, ...partial }));
  } catch { /* private-mode */ }
}

export function loadLastPost() {
  try {
    return JSON.parse(localStorage.getItem('cp_last_post') || '{}');
  } catch { return {}; }
}

export default function PostPreview({ image, title, caption, hashtags, compact }) {
  const [view, setView] = useState('youtube');
  const firstLine = (caption || '').split('\n').map((s) => s.trim()).find((s) => s) || '';
  const tags = (hashtags || []).slice(0, 6);

  return (
    <div className="cp-phone-wrap">
      <div className="btn-group btn-group-sm mb-2">
        <button className={`btn ${view === 'youtube' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('youtube')}>YouTube feed</button>
        <button className={`btn ${view === 'reels' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('reels')}>Reels feed</button>
      </div>
      <div className="cp-phone">
        <div className="cp-phone-notch" />
        {view === 'youtube' ? (
          <div className="cp-yt">
            {image ? <img src={image} alt="thumbnail" /> : <div className="cp-yt-ph">Your thumbnail appears here</div>}
            <div className="cp-yt-title">{title || 'Your title appears here'}</div>
            <div className="cp-yt-meta">Your channel · just now</div>
            {firstLine && <div className="cp-yt-desc">{firstLine}</div>}
            {tags.length > 0 && <div className="cp-yt-tags">{tags.join(' ')}</div>}
          </div>
        ) : (
          <div className="cp-reel">
            {image ? <img src={image} alt="cover" /> : <div className="cp-yt-ph">Your cover appears here</div>}
            <div className="cp-reel-grad" />
            <div className="cp-reel-overlay">
              <div className="cp-reel-cap">{firstLine || 'Your opening line appears here'}</div>
              {tags.length > 0 && <div className="cp-reel-tags">{tags.slice(0, 4).join(' ')}</div>}
              <div className="cp-reel-actions"><span>♡</span><span>💬</span><span>↗</span></div>
            </div>
          </div>
        )}
      </div>
      {!compact && <p className="small text-secondary mt-2 mb-0">This is what a follower sees before deciding in 2 seconds. If YOU would not stop scrolling, change the thumbnail or first line.</p>}
    </div>
  );
}
