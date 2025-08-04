import React from 'react';

const XPBar = ({ xpData, refreshXP }) => {
  if (!xpData) {
    return null;
  }

  const xpInLevel = xpData.total_xp - xpData.min_xp_for_level;
  const xpNeededForLevel = xpData.max_xp_for_level - xpData.min_xp_for_level;

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Level {xpData.level}: {xpData.level_name}
          </h3>
        </div>
        <div
          style={{
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          {xpData.total_xp} XP
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '15px',
          height: '20px',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid #FA4616',
        }}
      >
        <div
          style={{
            backgroundColor: '#FA4616',
            height: '100%',
            width: `${xpData.progress_percent}%`,
            transition: 'width 0.5s ease-in-out',
            background: 'linear-gradient(90deg, #FA4616 0%, #0021A5 100%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '12px',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          }}
        >
          {xpInLevel} / {xpNeededForLevel} XP
        </div>
      </div>

      <div
        style={{
          marginTop: '4px',
          color: '#ffffff',
          fontSize: '12px',
          textAlign: 'center',
        }}
      >
        {xpData.xp_to_next_level > 0
          ? `${xpData.xp_to_next_level} XP to next level`
          : 'Maximum level reached! 🐊'}
      </div>
    </div>
  );
};

export default XPBar;
