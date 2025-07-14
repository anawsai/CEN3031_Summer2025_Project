import React, { useState } from 'react';
import { authAPI } from '../services/api';

export function Login({ setCurrentPage, setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);

      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.user));

      setIsAuthenticated(true);
      setCurrentPage('dashboard');

      console.log('Login successful:', response);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'beige', padding: '24px' }}>
      <button
        onClick={() =>setCurrentPage('home')}
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
        <h2 style={{ color: '#7dcea0', marginBottom: '24px' }}>Login</h2>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '24px',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        />

        <p
          onClick={() => setCurrentPage('Signup')}
          style = {{                  
            color: 'blue',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginBottom: '24px',
            textAlign: 'right',
            fontSize: '0.9rem'
          }} 
        >
          Need an account? Sign up
        </p>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #6B7B47, #7dcea0)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </div>
    </div>
  );
}
