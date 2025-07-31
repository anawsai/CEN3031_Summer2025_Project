import React, { useState, useEffect } from 'react';

const GameNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    
    const duration = notification.type === 'xp' ? 4000 : 5000;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, notification.type]);

  if (!notification) return null;

  const getNotificationStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: '100px',
      right: '20px',
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
      transform: isVisible ? 'translateX(0)' : 'translateX(400px)',
      transition: 'transform 0.3s ease-out',
      minWidth: '300px',
      zIndex: 1000
    };

    switch (notification.type) {
      case 'achievement':
        return { ...baseStyle, border: '3px solid #FFD700' };
      case 'levelup':
        return { ...baseStyle, border: '3px solid #0021A5' };
      case 'xp':
        return { ...baseStyle, border: '3px solid #FA4616' };
      default:
        return baseStyle;
    }
  };

  const renderContent = () => {
    switch (notification.type) {
      case 'achievement':
        return (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <div style={{
                fontSize: '40px',
                marginRight: '15px'
              }}>
                {notification.icon}
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
                  {notification.name}
                </h3>
              </div>
            </div>

            <p style={{
              margin: '10px 0',
              color: '#ffffff',
              fontSize: '14px'
            }}>
              {notification.description}
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
                +{notification.xp_reward} XP
              </span>
            </div>
          </>
        );

      case 'levelup':
        return (
          <>
            <div style={{
              textAlign: 'center',
              marginBottom: '15px'
            }}>
              <div style={{
                color: '#0021A5',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                🚀 LEVEL UP!
              </div>
              <div style={{
                fontSize: '48px',
                marginBottom: '8px'
              }}>
                🐊
              </div>
              <h2 style={{
                margin: 0,
                color: '#FA4616',
                fontSize: '24px'
              }}>
                Level {notification.level}
              </h2>
              <h3 style={{
                margin: '5px 0 0 0',
                color: '#ffffff',
                fontSize: '18px'
              }}>
                {notification.level_name}
              </h3>
            </div>
          </>
        );

      case 'xp':
        return (
          <>
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                color: '#FA4616',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                ✨ XP GAINED!
              </div>
              <div style={{
                fontSize: '36px',
                color: '#FFD700',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                +{notification.xp_amount} XP
              </div>
              {notification.reason && (
                <p style={{
                  margin: 0,
                  color: '#ffffff',
                  fontSize: '14px'
                }}>
                  {notification.reason}
                </p>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={getNotificationStyle()}>
      {renderContent()}

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

export default GameNotification;