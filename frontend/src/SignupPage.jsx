import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import SplitLayout from './SplitLayout';
import FloatingInput from './FloatingInput';
import PasswordStrength from './PasswordStrength';
import PasswordRequirements from './PasswordRequirements';
import PendulumLoader from './PendulumLoader';
import CreatorPulseLogo from './CreatorPulseLogo';
import { UserIcon, MailIcon, LockIcon } from './Icons';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (field) => {
    const e = { ...errors };
    if (!field || field === 'displayName') {
      if (!form.displayName.trim()) e.displayName = 'Display name is required';
      else delete e.displayName;
    }
    if (!field || field === 'email') {
      if (!form.email) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
      else delete e.email;
    }
    if (!field || field === 'password') {
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 8 || form.password.length > 10) e.password = 'Must be 8–10 characters';
      else if (!/[A-Z]/.test(form.password)) e.password = 'Must include an uppercase letter';
      else if (!/[0-9]/.test(form.password)) e.password = 'Must include a number';
      else if (!/[^A-Za-z0-9]/.test(form.password)) e.password = 'Must include a special character';
      else delete e.password;
    }
    if (!field || field === 'confirmPassword') {
      if (!form.confirmPassword) e.confirmPassword = 'Confirm your password';
      else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
      else delete e.confirmPassword;
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
    setTouched({ displayName: true, email: true, password: true, confirmPassword: true });
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form.displayName, form.email, form.password);
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.password || err.response?.data?.email || 'Signup failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <SplitLayout>
      <div className="form-card">
        <PendulumLoader text="Creating your account..." />
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
          <h1>Welcome Creator</h1>
          <p>Grow your YouTube & Instagram together</p>
        </div>

        {serverError && <div className="server-error">⚠️ {serverError}</div>}

        <form onSubmit={handleSubmit}>
          <FloatingInput
            label="Display Name"
            icon={<UserIcon size={18} />}
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            onBlur={() => handleBlur('displayName')}
            error={touched.displayName && errors.displayName ? errors.displayName : ''}
          />

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

          <PasswordStrength password={form.password} />
          <PasswordRequirements password={form.password} />

          <FloatingInput
            label="Confirm Password"
            icon={<LockIcon size={18} />}
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            onBlur={() => handleBlur('confirmPassword')}
            error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ''}
          />

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </SplitLayout>
  );
}
