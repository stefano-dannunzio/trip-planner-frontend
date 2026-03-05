import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TripDetail from './pages/TripDetail';

function App() {
  return (
    // BrowserRouter wraps our entire app to enable routing features
    <BrowserRouter>
      <Routes>
        {/* If the user goes to the root URL ("/"), redirect them to the dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Define the paths for our actual pages */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* The ":id" means this part of the URL is dynamic (a variable) */}
        <Route path="/trip/:id" element={<TripDetail />} />

        {/* A simple placeholder for our future login page */}
        <Route path="/login" element={<div style={{ padding: '20px' }}><h1>Login Page 🔐</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;