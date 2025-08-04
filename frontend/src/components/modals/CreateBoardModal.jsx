import React, { useState } from 'react';
import styles from '../../styles/modal.module.css';

const CreateBoardModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Board name is required');
      return;
    }

    setLoading(true);
    try {
      await onCreate(formData);
    } catch (error) {
      console.error('Error creating board:', error);
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
          Create New Board
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            placeholder='Board Name'
            className={styles.input}
            required
          />

          <textarea
            name='description'
            value={formData.description}
            onChange={handleChange}
            placeholder='Description (optional)'
            className={`${styles.input} ${styles.textarea}`}
            rows='3'
          />

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
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
