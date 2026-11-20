import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';
import VerifyEmailPage from './VerifyEmailPage';
import OnboardingPage from './OnboardingPage';
import DashboardPage from './DashboardPage';
import EditProfilePage from './EditProfilePage';
import BillingPage from './BillingPage';
import ThumbnailScorerPage from './ThumbnailScorerPage';
import HashtagOptimizerPage from './HashtagOptimizerPage';
import PostingTimePage from './PostingTimePage';
import NotFoundPage from './NotFoundPage';
import './App.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
      <Route path="/premium" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
      <Route path="/thumbnail-scorer" element={<ProtectedRoute><ThumbnailScorerPage /></ProtectedRoute>} />
      <Route path="/hashtag-optimizer" element={<ProtectedRoute><HashtagOptimizerPage /></ProtectedRoute>} />
      <Route path="/posting-time" element={<ProtectedRoute><PostingTimePage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
