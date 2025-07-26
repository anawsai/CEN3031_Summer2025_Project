import React, { useState } from 'react';
import { authAPI } from '../services/api';
import styles from '../styles/signup.module.css';

export function Signup({ setCurrentPage, setIsAuthenticated }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    major: '',
    year: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.register(formData);
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      }
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / 3) * 100;

  return (
    <div className={styles.page}>
      <button onClick={() => setCurrentPage('home')} className={styles.backButton}>
        ← Back to Home
      </button>

      <div className={styles.formContainer}>
        <h2 className={styles.title}>Sign Up</h2>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {step === 1 && (
          <>
            <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className={styles.input} />
            <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className={styles.input} />
            <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" className={styles.input} />
          </>
        )}

        {step === 2 && (
          <>
            <input name="major" value={formData.major} onChange={handleChange} placeholder="Major" className={styles.input} />
            <input name="year" value={formData.year} onChange={handleChange} placeholder="Year" className={styles.input} />
          </>
        )}

        {step === 3 && (
          <>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className={styles.input} />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className={styles.input} />
          </>
        )}

        <div className={styles.buttonRow}>
          {step > 1 && <button onClick={handleBack} className={styles.button}>Back</button>}
          {step < 3 && <button onClick={handleNext} className={styles.button}>Next</button>}
          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={loading ? styles.buttonDisabled : styles.button}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

