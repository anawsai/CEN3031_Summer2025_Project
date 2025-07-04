import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100%',
      backgroundColor: 'beige'
    }}>
      {/* Header */}
      <header style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left side - Logo and Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Logo */}
            <img 
              src="/path-to-gator-logo.png" 
              alt="SwampScheduler Logo" 
              style={{ width: '48px', height: '48px' }}
            />
            {/* Title */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#7dcea0',
              margin: 0
            }}>
              SwampScheduler
            </h1>
          </div>

          {/* Right side - Login Buttons */}
          <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <button style={{
                  background: 'transparent',
                  color: '#7dcea0',
                  padding: '8px 16px',
                  border: '1px solid #7dcea0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}>
                  Sign Up
                </button>
                
                <button style={{
                  background: 'linear-gradient(135deg, #6B7B47, #7dcea0)',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}>
                  Login
                </button>
              </div>
            </div>
          </header>

      {/* Simple Draft of Homepage */}
      <main style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        minHeight: '100vh'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px'
        }}>
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
          
          <button style={{
            background: 'linear-gradient(135deg, #6B7B47, #7dcea0)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '12px',
            fontWeight: '600',
            border: 'none',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
          }}>
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;

