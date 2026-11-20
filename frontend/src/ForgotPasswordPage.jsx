import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from './api';
import SplitLayout from './SplitLayout';
import FloatingInput from './FloatingInput';
import PasswordStrength from './PasswordStrength';
import PasswordRequirements from './PasswordRequirements';
import PendulumLoader from './PendulumLoader';
import { MailIcon, LockIcon } from './Icons';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return; }
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      setInfo('If an account exists with that email, a 6-digit code has been sent.');
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code'); return; }
    setLoading(true);
    setError('');
    try {
      await authAPI.verifyResetOtp({ email, code });
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const setNewPassword = async (e) => {
    e.preventDefault();
    if (password.length < 8 || password.length > 10) { setError('Password must be 8–10 characters'); return; }
    if (!/[A-Z]/.test(password)) { setError('Password must include an uppercase letter'); return; }
    if (!/[0-9]/.test(password)) { setError('Password must include a number'); return; }
    if (!/[^A-Za-z0-9]/.test(password)) { setError('Password must include a special character'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword({ email, code, newPassword: password });
      navigate('/login', { state: { resetDone: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Code may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <SplitLayout>
      <div className="form-card"><PendulumLoader text="Please wait..." /></div>
    </SplitLayout>
  );

  return (
    <SplitLayout>
      <div className="form-card">
        <div className="form-header">
          <h1>Reset Password</h1>
          {step === 'email' && <p>Enter your email to receive a 6-digit code</p>}
          {step === 'code' && <p>Enter the code sent to your email</p>}
          {step === 'password' && <p>Choose a new password</p>}
        </div>

        {error && <div className="server-error">⚠️ {error}</div>}
        {info && <div className="server-error" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>✓ {info}</div>}

        {step === 'email' && (
          <form onSubmit={requestCode}>
            <FloatingInput
              label="Email"
              icon={<MailIcon size={18} />}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !email}>
              Send Code
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={verifyCode}>
            <FloatingInput
              label="6-digit code"
              icon={<MailIcon size={18} />}
              type="text"
              maxLength={6}
              inputMode="numeric"
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/[^0-9]/g, '')); setError(''); }}
              placeholder="123456"
            />
            <button type="submit" className="btn btn-primary" disabled={loading || code.length !== 6}>
              Verify Code
            </button>
            <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => setStep('email')}>
              ← Back
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={setNewPassword}>
            <FloatingInput
              label="New Password"
              icon={<LockIcon size={18} />}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
            <PasswordStrength password={password} />
            <PasswordRequirements password={password} />
            <FloatingInput
              label="Confirm Password"
              icon={<LockIcon size={18} />}
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(''); }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Reset Password
            </button>
            <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => setStep('code')}>
              ← Back
            </button>
          </form>
        )}

        <div className="auth-link">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </SplitLayout>
  );
}
