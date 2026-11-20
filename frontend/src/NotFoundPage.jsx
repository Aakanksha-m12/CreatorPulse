import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="error-page">
      <div>
        <div className="error-icon">🔍</div>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Go to Login
        </Link>
      </div>
    </div>
  );
}
