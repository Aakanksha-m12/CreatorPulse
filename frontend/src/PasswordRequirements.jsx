export default function PasswordRequirements({ password }) {
  if (!password) return null;

  const checks = [
    { label: '8–10 characters', ok: password.length >= 8 && password.length <= 10 },
    { label: 'An uppercase letter (A–Z)', ok: /[A-Z]/.test(password) },
    { label: 'A number (0–9)', ok: /[0-9]/.test(password) },
    { label: 'A special character (@#!...)', ok: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="pw-req">
      {checks.map((c, i) => (
        <div key={i} className={`pw-req-item ${c.ok ? 'ok' : ''}`}>
          <span className="pw-req-icon">{c.ok ? '✓' : '○'}</span>
          {c.label}
        </div>
      ))}
    </div>
  );
}
