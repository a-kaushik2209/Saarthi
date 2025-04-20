import React, { useState } from 'react';

function LoginPage({ setPage, setProfile, profiles }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = e => {
    e.preventDefault();
    const found = profiles.find(p => p.id === id && p.password === password);
    if (found) {
      setProfile(found);
      setPage('profile');
    } else {
      setError('Invalid ID or password.');
    }
  };

  return (
    <div className="card fade-in" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <form onSubmit={handleLogin} autoComplete="off">
        <div style={{ marginBottom: '1.3rem' }}>
          <label style={{ fontWeight: 500 }}>Unique ID:</label>
          <input type="text" value={id} onChange={e => setId(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '1.3rem' }}>
          <label style={{ fontWeight: 500 }}>Password:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div style={{ color: '#e53935', marginBottom: 10 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', fontWeight: 700, fontSize: 18 }}>Login</button>
      </form>
      <button onClick={() => setPage('landing')} style={{ width: '100%', marginTop: 10 }}>Back</button>
    </div>
  );
}

export default LoginPage;
