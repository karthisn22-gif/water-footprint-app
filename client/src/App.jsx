import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import HistoryPage from './pages/History';
import Chatbot from './components/Chatbot';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import './i18n';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { user } = useContext(AuthContext);
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <div className="rain-background-container">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="raindrop"
            style={{ 
              left: `${Math.random() * 100}vw`,
              animationDuration: `${0.8 + Math.random() * 1.5}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
      {user && <Navbar theme={theme} toggleTheme={toggleTheme} />}
      <div className="app-container">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
        </Routes>
      </div>
      {user && <Chatbot />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
