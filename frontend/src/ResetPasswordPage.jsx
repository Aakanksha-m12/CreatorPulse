import { Link } from 'react-router-dom';
import SplitLayout from './SplitLayout';

export default function ResetPasswordPage() {
  return (
    <SplitLayout>
      <div className="form-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", marginBottom: 8 }}>Password Reset</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
          Password resets now use a 6-digit code sent to your email instead of a link.
        </p>
        <Link to="/forgot-password" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '12px 32px' }}>
          Reset with Code
        </Link>
      </div>
    </SplitLayout>
  );
}
