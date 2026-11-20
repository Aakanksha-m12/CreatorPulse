import { useMemo } from 'react';

export default function PasswordStrength({ password }) {
  const { strength, label } = useMemo(() => {
    if (!password) return { strength: 0, label: '' };
    let score = 0;
    if (password.length >= 8 && password.length <= 10) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (score <= 1) return { strength: 1, label: 'Weak' };
    if (score <= 3) return { strength: 2, label: 'Medium' };
    return { strength: 3, label: 'Strong' };
  }, [password]);

  if (!password) return null;

  const classes = ['', 'weak', 'medium', 'strong'];

  return (
    <div style={{ marginTop: 8 }}>
      <div className="password-strength-bar">
        {[1, 2, 3].map((seg) => (
          <div key={seg} className={`pw-segment ${seg <= strength ? `filled ${classes[strength]}` : ''}`} />
        ))}
      </div>
      <div className={`password-strength-label ${classes[strength]}`}>
        {label}
      </div>
    </div>
  );
}
