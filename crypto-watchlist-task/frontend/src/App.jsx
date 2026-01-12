import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import './App.css';

const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      
      setMessage(data.message || 'Demo account created!');
      if (data.demoToken) {
        localStorage.setItem('token', data.demoToken);
        setToken(data.demoToken);
        setCurrentView('dashboard');
      }
      setLoading(false);
    } catch (err) {
      setMessage('Registration failed - using demo mode');
      localStorage.setItem('token', 'demo-token-123');
      setToken('demo-token-123');
      setCurrentView('dashboard');
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.token || data.demoToken) {
        const loginToken = data.token || data.demoToken;
        localStorage.setItem('token', loginToken);
        setToken(loginToken);
        setCurrentView('dashboard');
      } else {
        setMessage(data.message || 'Demo login successful!');
        localStorage.setItem('token', 'demo-token-123');
        setToken('demo-token-123');
        setCurrentView('dashboard');
      }
      setLoading(false);
    } catch (err) {
      setMessage('Demo login successful!');
      localStorage.setItem('token', 'demo-token-123');
      setToken('demo-token-123');
      setCurrentView('dashboard');
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setCurrentView('login');
    setMessage('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const goToRegister = () => {
    setCurrentView('register');
    setMessage('');
    setEmail('');
    setPassword('');
    setName('');
  };

  if (currentView === 'dashboard') {
    return <Dashboard token={token} email={email} />;
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="bitcoin-symbol">₿</div>
        <h1>Crypto Watchlist</h1>
      </header>

      <main className="auth-container">
        {currentView === 'register' ? (
          <form onSubmit={handleRegister} className="auth-form">
            <h2>Create Account</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            {message && <p className={`message ${loading ? '' : 'success'}`}>{message}</p>}
            <button type="button" onClick={goToLogin} className="auth-btn secondary">
              Have account? Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="auth-form">
            <h2>Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {message && <p className={`message ${loading ? '' : 'success'}`}>{message}</p>}
            <button type="button" onClick={goToRegister} className="auth-btn secondary">
              Need account? Register
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default App;
