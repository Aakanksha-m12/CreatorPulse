import { useState } from 'react';

export default function FloatingInput({
  label,
  icon,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  onBlur,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
}) {
  const [focused, setFocused] = useState(false);

  const handleFocus = () => setFocused(true);
  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) onBlur(e);
  };

  const isUp = focused || value;

  return (
    <div className={`floating-group ${error ? 'has-error' : ''}`}>
      <span className="input-icon">{icon}</span>
      <input
        type={showPasswordToggle && showPassword ? 'text' : type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || label}
        autoComplete={type === 'password' ? 'current-password' : 'off'}
      />
      <label className={`floating-label ${isUp ? 'up' : ''}`}>{label}</label>
      {showPasswordToggle && (
        <button type="button" className="toggle-password" onClick={onTogglePassword}>
          {showPassword ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}
      {error && <div className="error-text">⚠️ {error}</div>}
    </div>
  );
}
