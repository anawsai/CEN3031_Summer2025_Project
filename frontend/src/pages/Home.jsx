import React from 'react';

export function Home({ setCurrentPage }) {
  // Handle navigation buttons
  const handleLoginClick = () => setCurrentPage('login');
  const handleSignupClick = () => setCurrentPage('signup');


  return (
    <div style={{ minHeight: '100%', backgroundColor: 'beige' }}>
      {/* Header */}
      <header style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="/path-to-gator-logo.png" 
              alt="SwampScheduler Logo" 
              style={{ width: '48px', height: '48px' }}
            />
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#7dcea0',
              margin: 0
            }}>
              SwampScheduler
            </h1>
          </div>

          {/* Sign Up + Login */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleSignupClick}
              style={{
                background: 'transparent',
                color: '#7dcea0',
                padding: '8px 16px',
                border: '1px solid #7dcea0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Sign Up
            </button>

            <button
              onClick={handleLoginClick}
              style={{
                background: 'linear-gradient(135deg, #6B7B47, #7dcea0)',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Welcome Content */}
      <main style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{
            fontSize: '60px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#7dcea0'
          }}>
            Welcome!
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#78716c',
            marginBottom: '32px'
          }}>
            A smart task planner for busy Gators!
          </p>
        </div>
      </main>
    </div>
  );
}
