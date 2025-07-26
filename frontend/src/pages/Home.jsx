import React from 'react';
import styles from '../styles/home.module.css';

export function Home({ setCurrentPage }) {
  const handleLoginClick = () => setCurrentPage('login');
  const handleSignupClick = () => setCurrentPage('signup');

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          
          {/* Logo + Title */}
          <div className={styles.logoSection}>
            <img 
              alt="SwampScheduler Logo" 
              className={styles.logoImage}
            />
            <h1 className={styles.logoText}>SwampScheduler</h1>
          </div>

          {/* Sign Up + Login */}
          <div className={styles.authButtons}>
            <button onClick={handleSignupClick} className={styles.signupButton}>
              Sign Up
            </button>
            <button onClick={handleLoginClick} className={styles.loginButton}>
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Welcome Content */}
      <main className={styles.mainContent}>
        <div className={styles.welcomeBox}>
          <h2 className={styles.welcomeHeading}>Welcome!</h2>
          <p className={styles.welcomeText}>
            A smart task planner for busy Gators!
          </p>
        </div>
      </main>
    </div>
  );
}

