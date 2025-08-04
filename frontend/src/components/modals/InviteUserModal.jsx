import React, { useState } from 'react';
import styles from '../../styles/modal.module.css';

const InviteUserModal = ({ onClose, onInvite }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      alert('Username is required');
      return;
    }

    setLoading(true);
    try {
      await onInvite(username.trim());
    } catch (error) {
      console.error('Error inviting user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>
          ✕
        </button>

        <h2
          style={{
            color: '#ff6f00',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Invite User to Board
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='Enter username'
            className={styles.input}
            required
          />

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            The user will be added as a member and can view and edit tasks on
            this board.
          </p>

          <div className={styles.buttonRow}>
            <button
              type='button'
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type='submit'
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
