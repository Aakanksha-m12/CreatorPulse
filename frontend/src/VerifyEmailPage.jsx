import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import SplitLayout from './SplitLayout';
import FloatingInput from './FloatingInput';
import PendulumLoader from './PendulumLoader';
import { MailIcon } from './Icons';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Enter your email'); return; }
    if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const data = await verifyOtp(email, code);
      if (data.token) navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.code || 'Verification failed. Check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    if (!email) { setError('Enter your email first'); return; }
    setLoading(true);
    try {
      await resendOtp(email);
      setResent(true);
      setInfo('A new code has been sent.');
      setTimeout(() => setInfo(''), 4000);
    } catch {
      setError('Could not resend the code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !resent) return (
    <SplitLayout>
      <div className="form-card"><PendulumLoader text="Verifying code..." /></div>
    </SplitLayout>
  );

  return (
    <SplitLayout>
      <div className="form-card">
        <div className="form-header">
          <h1>Verify Your Email</h1>
          <p>Enter the 6-digit code we sent to your inbox</p>
        </div>

        {error && <div className="server-error">⚠️ {error}</div>}
        {info && <div className="server-error" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>✓ {info}</div>}

        <form onSubmit={handleVerify}>
          <FloatingInput
            label="Email"
            icon={<MailIcon size={18} />}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
          />

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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            Verify & Continue
          </button>
        </form>

        <div className="auth-link" style={{ justifyContent: 'center', marginTop: 16 }}>
          <button type="button" className="forgot-link" onClick={handleResend} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            Didn't get the code? Resend
          </button>
        </div>

        <div className="auth-link">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </SplitLayout>
  );
}
