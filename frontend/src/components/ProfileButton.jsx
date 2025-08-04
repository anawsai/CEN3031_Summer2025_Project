import React from 'react';
import { User } from 'lucide-react';

const ProfileButton = ({ setCurrentPage }) => {
  const handleClick = () => {
    setCurrentPage('profile');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: 'linear-gradient(135deg, #ff6f00, #ff8f00)',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(255, 111, 0, 0.3)',
        transition: 'all 0.2s ease',
        fontSize: '20px',
      }}
      onMouseOver={(e) => {
        e.target.style.transform = 'scale(1.05)';
        e.target.style.boxShadow = '0 6px 16px rgba(255, 111, 0, 0.4)';
      }}
      onMouseOut={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 4px 12px rgba(255, 111, 0, 0.3)';
      }}
      title='View Profile'
    >
      <User size={24} />
    </button>
  );
};

export default ProfileButton;
