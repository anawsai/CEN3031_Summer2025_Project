import React from 'react';

export function Signup({ setCurrentPage, setIsAuthenticated }) {
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

        <input
          type="text"
          placeholder="Full Name"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        />

        <input
          type="email"
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
          placeholder="Password"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '24px',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        />

        <button 
            onClick={() => {
                setIsAuthenticated(true);
                setCurrentPage('dashboard'); 
        }}
        
            style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #6B7B47, #7dcea0)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
        }}>
          Sign Up
        </button>
      </div>
    </div>
  );
}
