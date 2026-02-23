import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MCQTest from './pages/MCQTest';
import ProblemRound from './pages/ProblemRound';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={
              <ProtectedRoute role="team">
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/test/round1" element={
              <ProtectedRoute role="team">
                <MCQTest />
              </ProtectedRoute>
            } />

            <Route path="/test/round2" element={
              <ProtectedRoute role="team">
                <ProblemRound />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <ToastContainer theme="dark" position="bottom-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
