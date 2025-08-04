import React from 'react';
import styles from '../styles/home.module.css';

export function Home({ setCurrentPage }) {
  const handleLoginClick = () => setCurrentPage('login');
  const handleSignupClick = () => setCurrentPage('signup');

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <img 
              src="/Swamp_Scheduler_Logo.jpg" 
              alt = "SwampScheduler Logo"
              width={48}     
              height={48}
              className={styles.logoImage}  
            />
            <h1 className={styles.logoText}>SwampScheduler</h1>
          </div>

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

      <main className={styles.mainContent}>
        <div className={styles.welcomeBox}>
          <h2 className={styles.welcomeHeading}>
            The Smart Way to Manage Your Academic Life
          </h2>
          <p className={styles.welcomeText}>
            Built for University of Florida students who demand more from their
            productivity tools. Seamlessly organize tasks, track progress, and
            stay focused with our intuitive Pomodoro integration.
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}></div>
              <div className={styles.featureTitle}>Smart Task Management</div>
              <div className={styles.featureDescription}>
                Organize assignments, projects, and deadlines with intelligent
                prioritization
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}></div>
              <div className={styles.featureTitle}>Pomodoro Integration</div>
              <div className={styles.featureDescription}>
                Built-in focus sessions to maximize your study efficiency
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}></div>
              <div className={styles.featureTitle}>Progress Tracking</div>
              <div className={styles.featureDescription}>
                Visual insights into your productivity patterns and achievements
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
