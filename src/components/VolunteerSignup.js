import React, { useState } from 'react';

function VolunteerSignup({ setPage, setProfile }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('volunteer');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function generateId() {
    return 'V' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  const handleSubmit = e => {
    e.preventDefault();
    const id = generateId();
    setProfile({ id, name, role: type, password });
    setSubmitted(true);
    setTimeout(() => setPage('profile'), 1200);
  };

  return (
    <div className="card fade-in">
      <h2 style={{ textAlign: 'center' }}>Volunteer / Donor Signup</h2>
      {submitted ? (
        <div style={{ color: '#43a047', fontWeight: 'bold', fontSize: 20, textAlign: 'center', margin: '2rem 0', animation: 'fadeIn 1.2s' }}>
          Thank you for joining Saarthi!
        </div>
      ) : (
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Name:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ marginTop: 4 }} />
          </div>
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Role:</label>
            <select value={type} onChange={e => setType(e.target.value)} style={{ marginTop: 4 }}>
              <option value="volunteer">Volunteer</option>
              <option value="donor">Donor (Money)</option>
              <option value="donor-clothes">Donor (Clothes)</option>
              <option value="donor-food">Donor (Food)</option>
            </select>
          </div>
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Password:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ marginTop: 4 }} />
          </div>
          <button type="submit" style={{ width: '100%', fontWeight: 700, fontSize: 18 }}>Sign Up</button>
        </form>
      )}
    </div>
  );
}

export default VolunteerSignup;
