import React, { useState } from 'react';
import {LogOut} from 'lucide-react';
import { authAPI } from '../services/api';
import styles from '../styles/dashboard.module.css';
import PomodoroTimer from '../components/PomodoroTimer';
import StatsDisplay from '../components/StatsDisplay';
import XPBar from '../components/XPBar';

export function Dashboard({ tasks, setCurrentPage, toggleComplete, setIsAuthenticated, xpData, refreshXP, setNotificationQueue, statsRefreshTrigger }) {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } 
    catch (error) {
      console.error('Logout failed:', error);
    } 
    finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      setIsAuthenticated(false);
      setCurrentPage('home');
    }
  };

  return (
    <div className={styles.pageContainer}>
  
      {isTimerRunning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 998,
          pointerEvents: 'auto'
        }} />
      )}
      
      <XPBar xpData={xpData} refreshXP={refreshXP} />
      
      <button onClick={handleLogout} className={styles.logoutIconButton} title="Logout">
        <LogOut className={styles.logoutIcon} />
      </button>
  
      <h1 className={styles.dashboardTitle} style={{ marginTop: '80px' }}>
        Welcome to your Dashboard
      </h1>
      <p className={styles.subtitle}>
        What would you like to do today?
      </p>
  
      <div className={styles.cardGrid}>
  
        <div 
          onClick={() => !isTimerRunning && setCurrentPage('tasks')} 
          className={styles.card}
          style={{ 
            pointerEvents: isTimerRunning ? 'none' : 'auto',
            opacity: isTimerRunning ? 0.5 : 1
          }}>
          <h3>My Tasks</h3>
  
          {tasks.length === 0 && (
            <p style={{ color: '#777', fontSize: '14px' }}>
              No tasks yet. Click to add your first task!
            </p>
          )}
  
          {tasks.length > 0 && (
            <div>
              {tasks.slice(0, 3).map((task, index) => (
                <div
                  key={index}
                  className={`${styles.taskItem} ${task.completed ? styles.taskItemCompleted : styles.taskItemIncomplete}`}
                >
                  <div>
                    <strong>{task.title}</strong>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#777' }}>
                      Due: {task.dueDate || 'N/A'} | Priority: {task.priority || 'N/A'}
                    </p>
                  </div>
  
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(index);
                    }}
                    className={`${styles.toggleComplete} ${task.completed ? styles.completed : ''}`}
                    title={task.completed ? 'Completed' : 'Mark as Done'}
                  />
                </div>
              ))}
            </div>
          )}
  
          {tasks.length > 3 && (
            <p style={{ color: '#777', fontSize: '14px' }}>
              ...and {tasks.length - 3} more tasks
            </p>
          )}
        </div>
  
        <div 
          className={styles.card}
          style={{ 
            position: isTimerRunning ? 'relative' : 'static',
            zIndex: isTimerRunning ? 999 : 'auto'
          }}
        >
          <h3>Pomodoro Timer</h3>
          <PomodoroTimer 
            refreshXP={refreshXP} 
            setNotificationQueue={setNotificationQueue}
            onTimerStateChange={setIsTimerRunning}
          />
        </div>
  
        <div 
          className={styles.card}
          style={{ 
            pointerEvents: isTimerRunning ? 'none' : 'auto',
            opacity: isTimerRunning ? 0.5 : 1
          }}
        >
          <h3>Progress / Analytics</h3>
          <StatsDisplay refreshTrigger={statsRefreshTrigger} />
        </div>
  
      </div>
    </div>
  );
}
