import React, { useState, useEffect } from 'react';

const AchievementNotification = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '20px',
      backgroundColor: '#1a1a1a',
      border: '3px solid #FFD700',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
      transform: isVisible ? 'translateX(0)' : 'translateX(400px)',
      transition: 'transform 0.3s ease-out',
      minWidth: '300px',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{
          fontSize: '40px',
          marginRight: '15px'
        }}>
          {achievement.icon}
        </div>
        <div>
          <div style={{
            color: '#FFD700',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '4px'
          }}>
            🎉 ACHIEVEMENT UNLOCKED!
          </div>
          <h3 style={{
            margin: 0,
            color: '#FA4616',
            fontSize: '20px'
          }}>
            {achievement.name}
          </h3>
        </div>
      </div>

      <p style={{
        margin: '10px 0',
        color: '#ffffff',
        fontSize: '14px'
      }}>
        {achievement.description}
      </p>

      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        padding: '8px 12px',
        textAlign: 'center',
        marginTop: '10px'
      }}>
        <span style={{
          color: '#FFD700',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          +{achievement.xp_reward} XP
        </span>
      </div>

      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          color: '#999',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '5px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default AchievementNotification;