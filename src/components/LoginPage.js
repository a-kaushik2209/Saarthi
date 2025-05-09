import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

function LoginPage({ setPage, redirectAfterLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await loginUser(email, password);
      setPage(redirectAfterLogin || 'landing'); // Redirect to specified page or home page after login
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await registerUser(email, password, name);
      // Redirect to landing page after registration
      setPage('landing');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };

  return (
    <div className="card fade-in" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center' }}>{isRegistering ? 'Create Account' : 'Login'}</h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin} autoComplete="off">
        {isRegistering && (
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Full Name:</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
        )}
        <div style={{ marginBottom: '1.3rem' }}>
          <label style={{ fontWeight: 500 }}>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: '1.3rem' }}>
          <label style={{ fontWeight: 500 }}>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            disabled={loading}
            minLength={6}
          />
        </div>
        {error && <div style={{ color: '#e53935', marginBottom: 10 }}>{error}</div>}
        <button 
          type="submit" 
          style={{ width: '100%', fontWeight: 700, fontSize: 18 }}
          disabled={loading}
        >
          {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Login')}
        </button>
      </form>
      <div style={{ marginTop: 15, textAlign: 'center' }}>
        <button 
          onClick={toggleMode} 
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          disabled={loading}
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
      </div>
      <button 
        onClick={() => setPage('landing')} 
        style={{ width: '100%', marginTop: 10 }}
        disabled={loading}
      >
        Back
      </button>
    </div>
  );
}

export default LoginPage;
