import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import api from '../services/api';
import styles from '../styles/signup.module.css';

export function Signup({
  setCurrentPage,
  setIsAuthenticated,
  fetchXPData,
  fetchTasks,
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    major: '',
    year: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasNumber: false,
    hasSymbol: false,
  });
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: '',
  });
  const [checkingUsername, setCheckingUsername] = useState(null);

  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordStrength({
      hasMinLength: minLength,
      hasNumber: hasNumber,
      hasSymbol: hasSymbol,
    });

    if (!minLength || !hasNumber || !hasSymbol) {
      setPasswordError(
        'Password must be at least 6 characters with 1 number and 1 symbol'
      );
      return false;
    }

    setPasswordError('');
    return true;
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameStatus({
        checking: false,
        available: false,
        message:
          username.length > 0 ? 'Username must be at least 3 characters' : '',
      });
      return;
    }

    setUsernameStatus({
      checking: true,
      available: null,
      message: 'Checking...',
    });

    try {
      const response = await api.post('/auth/check-username', { username });
      setUsernameStatus({
        checking: false,
        available: response.data.available,
        message: response.data.message,
      });
    } catch (error) {
      setUsernameStatus({
        checking: false,
        available: null,
        message: 'Error checking username',
      });
    }
  };

  useEffect(() => {
    if (checkingUsername) {
      clearTimeout(checkingUsername);
    }

    if (formData.username) {
      const timeout = setTimeout(() => {
        checkUsernameAvailability(formData.username);
      }, 500); // Debounce for 500ms
      setCheckingUsername(timeout);
    }

    return () => {
      if (checkingUsername) {
        clearTimeout(checkingUsername);
      }
    };
  }, [formData.username]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'password') {
      validatePassword(e.target.value);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    // Validate password before submission
    if (!validatePassword(formData.password)) {
      setError('Please fix the password requirements');
      return;
    }

    // Check if username is available
    if (!usernameStatus.available) {
      setError('Please choose an available username');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.register(formData);

      // Don't store tokens - make them log in properly
      // This ensures all data loads correctly on first login
      alert('Registration successful! Please log in with your new account.');
      setCurrentPage('home');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / 3) * 100;

  return (
    <div className={styles.page}>
      <button
        onClick={() => setCurrentPage('home')}
        className={styles.backButton}
      >
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
            <input
              name='firstName'
              value={formData.firstName}
              onChange={handleChange}
              placeholder='First Name'
              className={styles.input}
              required
            />
            <input
              name='lastName'
              value={formData.lastName}
              onChange={handleChange}
              placeholder='Last Name'
              className={styles.input}
              required
            />
          </>
        )}

        {step === 2 && (
          <>
            <input
              name='major'
              value={formData.major}
              onChange={handleChange}
              placeholder='Major'
              className={styles.input}
            />
            <select
              name='year'
              value={formData.year}
              onChange={handleChange}
              className={styles.input}
            >
              <option value=''>Select Year</option>
              <option value='Freshman'>Freshman</option>
              <option value='Sophomore'>Sophomore</option>
              <option value='Junior'>Junior</option>
              <option value='Senior'>Senior</option>
              <option value='Graduate'>Graduate</option>
            </select>
          </>
        )}

        {step === 3 && (
          <>
            <input
              name='username'
              value={formData.username}
              onChange={handleChange}
              placeholder='Username'
              className={`${styles.input} ${
                formData.username && !usernameStatus.checking
                  ? usernameStatus.available
                    ? styles.inputSuccess
                    : styles.inputError
                  : ''
              }`}
              required
            />
            {formData.username && (
              <div className={styles.usernameStatus}>
                <span
                  className={
                    usernameStatus.checking
                      ? styles.statusChecking
                      : usernameStatus.available
                        ? styles.statusAvailable
                        : styles.statusUnavailable
                  }
                >
                  {usernameStatus.message}
                </span>
              </div>
            )}
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Email'
              className={styles.input}
              required
            />
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='Password'
              className={`${styles.input} ${passwordError && formData.password ? styles.inputError : ''}`}
              required
            />
            {formData.password && (
              <div className={styles.passwordRequirements}>
                <div
                  className={`${styles.requirement} ${passwordStrength.hasMinLength ? styles.requirementMet : ''}`}
                >
                  {passwordStrength.hasMinLength ? '✓' : '○'} At least 6
                  characters
                </div>
                <div
                  className={`${styles.requirement} ${passwordStrength.hasNumber ? styles.requirementMet : ''}`}
                >
                  {passwordStrength.hasNumber ? '✓' : '○'} Contains a number
                </div>
                <div
                  className={`${styles.requirement} ${passwordStrength.hasSymbol ? styles.requirementMet : ''}`}
                >
                  {passwordStrength.hasSymbol ? '✓' : '○'} Contains a symbol
                </div>
              </div>
            )}
          </>
        )}

        <div className={styles.buttonRow}>
          {step > 1 && (
            <button onClick={handleBack} className={styles.button}>
              Back
            </button>
          )}
          {step < 3 && (
            <button onClick={handleNext} className={styles.button}>
              Next
            </button>
          )}
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

        <p onClick={() => setCurrentPage('login')} className={styles.loginLink}>
          Already have an account? Log in
        </p>
      </div>
    </div>
  );
}
