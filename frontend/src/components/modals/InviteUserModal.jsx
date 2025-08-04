import React, { useState } from 'react';
import styles from '../../styles/modal.module.css';

const InviteUserModal = ({ onClose, onInvite }) => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState(
    "Hi! I'd like to invite you to my Taskboard!"
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      alert('Username is required');
      return;
    }

    setLoading(true);
    try {
      await onInvite(username.trim(), message.trim());
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

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Add a message (optional)'
            className={styles.textarea}
            rows={3}
            style={{
              marginTop: '16px',
              resize: 'vertical',
              minHeight: '60px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(250, 70, 22, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              color: '#ffffff',
              fontSize: '14px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              marginBottom: '20px',
              marginTop: '16px',
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
