import React from 'react';
import {LogOut} from 'lucide-react';
import { authAPI } from '../services/api';
import styles from '../styles/dashboard.module.css';

export function Dashboard({ tasks, setCurrentPage, toggleComplete, setIsAuthenticated }) {
  // Handle user logout
  const handleLogout = async () => {
    try {
      await authAPI.logout(); //backend logout
    } 
    catch (error) {
      console.error('Logout failed:', error);
    } 
    finally {
      // clear frontend state regardless of backend success
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      setIsAuthenticated(false);
      setCurrentPage('home');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'beige', padding: '24px' }}>

      {/* Logout button */}
      <button onClick={handleLogout} className={styles.logoutIconButton} title="Logout">
        <LogOut className={styles.logoutIcon} />
      </button>

      {/* Header */}
      <h1 style={{ color: '#7dcea0', fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
        Welcome to your Dashboard 🐊
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '32px' }}>
        What would you like to do today?
      </p>

      {/* Main card layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>

        {/* My Tasks Card */}
        <div onClick={() => setCurrentPage('tasks')} className={styles.card}>
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

                  {/* Completion toggle */}
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

        {/* Pomodoro Timer Card */}
        <div className={styles.card}>
          <h3>Pomodoro Timer</h3>
          <div className={styles.pomodoroCircle}></div>
          <p style={{ textAlign: 'center', color: '#777' }}>
            Unlock prizes as you complete tasks!
          </p>
        </div>

        {/* Progress / Analytics Card */}
        <div className={styles.card}>
          <h3>Progress / Analytics</h3>
          <p style={{ color: '#777' }}>
            Track your focus, productivity, and XP here.
          </p>
        </div>

      </div>
    </div>
  );
}
