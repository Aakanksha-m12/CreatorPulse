import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import SplitLayout from './SplitLayout';
import FloatingInput from './FloatingInput';
import PendulumLoader from './PendulumLoader';
import CreatorPulseLogo from './CreatorPulseLogo';
import { MailIcon, LockIcon } from './Icons';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('expired');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [verifyHint, setVerifyHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const validate = (field) => {
    const e = { ...errors };
    if (!field || field === 'email') {
      if (!form.email) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
      else delete e.email;
    }
    if (!field || field === 'password') {
      if (!form.password) e.password = 'Password is required';
      else delete e.password;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validate(field);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid email or password';
      setServerError(msg);
      setVerifyHint(msg.toLowerCase().includes('verify'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <SplitLayout>
      <div className="form-card">
        <PendulumLoader text="Logging in..." />
      </div>
    </SplitLayout>
  );

  return (
    <SplitLayout>
      <div className="form-card">
        <div className="form-header">
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
            <div className="fh-logo-pulse">
              <CreatorPulseLogo size={48} />
            </div>
          </div>
          <h1>Welcome Back</h1>
          <p>Continue growing your audience today</p>
        </div>

        {expired && <div className="server-error">🔒 Your session has expired. Please log in again.</div>}
        {serverError && <div className="server-error">⚠️ {serverError}</div>}
        {verifyHint && (
          <div className="auth-link" style={{ justifyContent: 'center' }}>
            <Link to={`/verify-email?email=${encodeURIComponent(form.email)}`} className="forgot-link">
              Verify your email now
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FloatingInput
            label="Email"
            icon={<MailIcon size={18} />}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onBlur={() => handleBlur('email')}
            error={touched.email && errors.email ? errors.email : ''}
          />

          <FloatingInput
            label="Password"
            icon={<LockIcon size={18} />}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onBlur={() => handleBlur('password')}
            error={touched.password && errors.password ? errors.password : ''}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <div className="form-row">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/signup">Create Account</Link>
        </div>
      </div>
    </SplitLayout>
  );
}
