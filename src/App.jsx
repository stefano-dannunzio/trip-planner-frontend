import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TripDetail from './pages/TripDetail';
import Login from './pages/Login';


// --- NEW: Protected Route Wrapper ---
// This checks for a token. If it's missing, it kicks the user to the login screen.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// --- NEW: Public Route Wrapper ---
// This checks for a token. If it EXISTS, it prevents the user from seeing 
// the login page and pushes them directly to the dashboard.
function PublicRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  // A quick check for the root "/" redirect
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <BrowserRouter>
      <Routes>
        {/* Smart redirect for the root URL based on login status */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
        />

        {/* We wrap the Login page in the PublicRoute */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* We wrap our private pages in the ProtectedRoute */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:id"
          element={
            <ProtectedRoute>
              <TripDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;