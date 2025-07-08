import React from 'react';

export function Dashboard({ setCurrentPage }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'beige', padding: '24px' }}>
      <h1 style={{ color: '#7dcea0', fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
        Welcome to your Dashboard 🐊
      </h1>

      <p style={{ fontSize: '18px', marginBottom: '32px' }}>
        What would you like to do today?
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {/* Feature Buttons */}
        <button onClick={() => setCurrentPage('tasks')} style={cardStyle}>
           Create Tasks
        </button>
        <button onClick={() => setCurrentPage('schedule')} style={cardStyle}>
           View Adaptive Schedule
        </button>
        <button onClick={() => setCurrentPage('xp')} style={cardStyle}>
            XP & Achievements
        </button>
        <button onClick={() => setCurrentPage('pomodoro')} style={cardStyle}>
           Start Pomodoro Timer
        </button>
        <button onClick={() => setCurrentPage('shared')} style={cardStyle}>
           Shared Task Boards
        </button>
        <button onClick={() => setCurrentPage('analytics')} style={cardStyle}>
           View Analytics
        </button>
      </div>
    </div>
  );
}

const cardStyle = {
  padding: '24px',
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '1px solid #ccc',
  fontSize: '18px',
  fontWeight: '600',
  color: '#6B7B47',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'left'
};
