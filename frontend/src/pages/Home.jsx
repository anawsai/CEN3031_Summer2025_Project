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
          <h2 className={styles.welcomeHeading}>The Smart Way to Manage Your Academic Life</h2>
          <p className={styles.welcomeText}>
            Built for University of Florida students who demand more from their productivity tools. 
            Seamlessly organize tasks, track progress, and stay focused with our intuitive Pomodoro integration.
          </p>
          
          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}></div> {/* Icon can be added later !!!!!!!!!!!!!*/}
              <div className={styles.featureTitle}>Smart Task Management</div>
              <div className={styles.featureDescription}>Organize assignments, projects, and deadlines with intelligent prioritization</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}></div>  {/* Icon can be added later !!!!!!!!!!!!!*/}
              <div className={styles.featureTitle}>Pomodoro Integration</div>
              <div className={styles.featureDescription}>Built-in focus sessions to maximize your study efficiency</div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}></div>  {/* Icon can be added later !!!!!!!!!!!!! */}
              <div className={styles.featureTitle}>Progress Tracking</div>
              <div className={styles.featureDescription}>Visual insights into your productivity patterns and achievements</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}