import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UsersPage from './pages/users/UsersPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ClientsPage from './pages/clients/ClientsPage';
import CreditRequestsPage from './pages/creditrequests/CreditRequestsPage';
import DecisionPanel from './pages/decisions/DecisionPanel';
import ReportsPage from './pages/reports/ReportsPage';
import TransactionsPage from './pages/transactions/TransactionsPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import SecurityPage from './pages/security/SecurityPage';
import HelpPage from './pages/help/HelpPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Se încarcă...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return <MainLayout>{children}</MainLayout>;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/users" element={<ProtectedRoute roles={['Admin']}><UsersPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/credit-requests" element={<ProtectedRoute><CreditRequestsPage /></ProtectedRoute>} />
          <Route path="/decisions" element={<ProtectedRoute roles={['Admin', 'Analyst']}><DecisionPanel /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
