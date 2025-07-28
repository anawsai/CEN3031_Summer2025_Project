import React, { useState } from 'react';
import { authAPI } from '../services/api';
import styles from '../styles/login.module.css';

export function Login({ setCurrentPage, setIsAuthenticated, setTasks }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login(formData);

      //save token and user data to localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.user));

      //reset frontend state
      setTasks([]);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } 
    catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Back to Home button */}
      <button onClick={() => setCurrentPage('home')} className={styles.backButton}>
        ← Back to Home
      </button>

      <div className={styles.formContainer}>
        <h2 className={styles.title}>Login</h2>

        {/* Display error message if any */}
        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Input fields for email and password */}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className={styles.input}
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className={styles.input}
        />

        {/* Link to Signup page */}
        <p onClick={() => setCurrentPage('Signup')} className={styles.signupLink}>
          Need an account? Sign up
        </p>

        {/* Login button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={loading ? styles.loginButtonDisabled : styles.loginButton}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </div>
    </div>
  );
}