import React, { useState } from 'react';

export function Signup({ setCurrentPage, setIsAuthenticated }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    major: '',
    year: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log(formData);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const progressPercent = (step / 3) * 100;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'beige', padding: '24px' }}>
      <button
        onClick={() => setCurrentPage('home')}
        style={{
          background: 'transparent',
          color: '#7dcea0',
          border: '1px solid #7dcea0',
          borderRadius: '8px',
          padding: '8px 16px',
          marginBottom: '24px',
          cursor: 'pointer',
        }}
      >
        ← Back to Home
      </button>

      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#7dcea0', marginBottom: '24px' }}>Sign Up</h2>

        <div style={{ height: '10px', width: '100%', backgroundColor: '#eee', borderRadius: '5px', marginBottom: '20px' }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: '#7dcea0',
            borderRadius: '5px'
          }}></div>
        </div>

        {step === 1 && (
          <>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              style={inputStyle}
            />
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              style={inputStyle}
            />
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              style={inputStyle}
            />
          </>
        )}

        {step === 2 && (
          <>
            <input
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="Major"
              style={inputStyle}
            />
            <input
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Year"
              style={inputStyle}
            />
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              style={inputStyle}
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              style={inputStyle}
            />
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          {step > 1 && (
            <button onClick={handleBack} style={buttonStyle}>Back</button>
          )}
          {step < 3 && (
            <button onClick={handleNext} style={buttonStyle}>Next</button>
          )}
          {step === 3 && (
            <button onClick={handleSubmit} style={buttonStyle}>Sign Up</button>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '16px',
  borderRadius: '8px',
  border: '1px solid #ccc'
};

const buttonStyle = {
  background: 'linear-gradient(135deg, #6B7B47, #7dcea0)',
  color: 'white',
  padding: '12px 20px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600'
};

