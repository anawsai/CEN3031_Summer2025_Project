import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import styles from '../../styles/editProfile.module.css';

const EditProfileModal = ({ userData, onClose, onUpdate }) => {
  const [major, setMajor] = useState(userData?.major || '');
  const [year, setYear] = useState(userData?.year || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.put(
        '/user/profile',
        {
          major: major.trim(),
          year: year.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (response.data.user) {
        // Update local storage
        const updatedUserData = { ...userData, major, year };
        localStorage.setItem('user_data', JSON.stringify(updatedUserData));

        // Notify parent component
        onUpdate(updatedUserData);
        onClose();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Profile</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* User Information Section */}
          <div className={styles.profileSection}>
            <h3 className={styles.sectionTitle}>Account Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.label}>Username</span>
                <span className={styles.value}>
                  {userData?.username || 'N/A'}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{userData?.email || 'N/A'}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.label}>First Name</span>
                <span className={styles.value}>
                  {userData?.first_name || 'N/A'}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.label}>Last Name</span>
                <span className={styles.value}>
                  {userData?.last_name || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Information Section (Editable) */}
          <div className={styles.editableSection}>
            <h3 className={styles.sectionTitle}>Academic Information</h3>

            <div className={styles.formGroup}>
              <label htmlFor='major'>Major</label>
              <input
                type='text'
                id='major'
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder='e.g., Computer Science'
                maxLength={100}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor='year'>Academic Year</label>
              <select
                id='year'
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value=''>Select Year</option>
                <option value='Freshman'>Freshman</option>
                <option value='Sophomore'>Sophomore</option>
                <option value='Junior'>Junior</option>
                <option value='Senior'>Senior</option>
                <option value='Graduate'>Graduate</option>
              </select>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.modalActions}>
            <button
              type='button'
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
