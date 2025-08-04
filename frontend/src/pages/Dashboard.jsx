import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { authAPI } from '../services/api';
import styles from '../styles/dashboard.module.css';
import PomodoroTimer from '../components/PomodoroTimer';
import StatsDisplay from '../components/StatsDisplay';
import XPBar from '../components/XPBar';
import ProfileButton from '../components/ProfileButton';

export function Dashboard({
  tasks,
  setCurrentPage,
  toggleComplete,
  setIsAuthenticated,
  xpData,
  refreshXP,
  setNotificationQueue,
  statsRefreshTrigger,
}) {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completingTasks, setCompletingTasks] = useState(new Set());

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      setIsAuthenticated(false);
      setCurrentPage('home');
    }
  };

  const pendingTasks = tasks.filter(task => !task.completed || completingTasks.has(task.id));

  return (
    <div className={styles.pageContainer}>
      {isTimerRunning && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 998,
            pointerEvents: 'auto',
          }}
        />
      )}

      <XPBar xpData={xpData} refreshXP={refreshXP} />

      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <button
          onClick={handleLogout}
          className={styles.logoutIconButton}
          title='Logout'
        >
          <LogOut className={styles.logoutIcon} />
        </button>

        <ProfileButton setCurrentPage={setCurrentPage} />
      </div>

      <h1 className={styles.dashboardTitle} style={{ marginTop: '80px' }}>
        Welcome to your Dashboard
      </h1>
      <p className={styles.subtitle}>What would you like to do today?</p>

      <div className={styles.cardGrid}>
        <div
          onClick={() => !isTimerRunning && setCurrentPage('tasks')}
          className={styles.card}
          style={{
            pointerEvents: isTimerRunning ? 'none' : 'auto',
            opacity: isTimerRunning ? 0.5 : 1,
          }}
        >
          <h3>My Tasks</h3>

          {pendingTasks.length === 0 && (
            <p style={{ color: '#777', fontSize: '14px' }}>
              {tasks.length === 0 
                ? 'No tasks yet. Click to add your first task!'
                : 'All tasks completed! Great job! '
              }
            </p>
          )}

          {pendingTasks.length > 0 && (
            <div>
              {pendingTasks.slice(0, 3).map((task, index) => {
                const originalIndex = tasks.findIndex(t => t.id === task.id);
                return (
                  <div
                    key={index}
                    className={`${styles.taskItem} ${completingTasks.has(task.id) ? styles.taskItemCompleted : styles.taskItemIncomplete}`}
                  >
                    <div>
                      <strong>{task.title}</strong>
                      <p
                        style={{
                          margin: '4px 0',
                          fontSize: '14px',
                          color: '#777',
                        }}
                      >
                        Due: {(task.due_date)
                          ? new Date(task.due_date).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: 'numeric',
                            })
                          : 'N/A'} | Priority: {task.priority || 'N/A'}
                      </p>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompletingTasks(prev => new Set([...prev, task.id]));
                        setTimeout(() => {
                          toggleComplete(originalIndex);
                          setCompletingTasks(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(task.id);
                            return newSet;
                          });
                        }, 400);
                      }}
                      className={`${styles.toggleComplete} ${completingTasks.has(task.id) ? styles.completed : ''}`}
                      title='Mark as Done'
                    />
                  </div>
                );
              })}
            </div>
          )}

          {pendingTasks.length > 3 && (
            <p style={{ color: '#777', fontSize: '14px' }}>
              ...and {pendingTasks.length - 3} more pending tasks
            </p>
          )}
        </div>

        <div
          onClick={() => !isTimerRunning && setCurrentPage('sharedboards')}
          className={styles.card}
          style={{
            pointerEvents: isTimerRunning ? 'none' : 'auto',
            opacity: isTimerRunning ? 0.5 : 1,
            cursor: 'pointer',
          }}
        >
          <h3>Shared Boards</h3>
          <p style={{ color: '#777', fontSize: '14px' }}>
            Click to view and manage your shared task boards!
          </p>
        </div>

        <div
          className={styles.card}
          style={{
            position: isTimerRunning ? 'relative' : 'static',
            zIndex: isTimerRunning ? 999 : 'auto',
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
            opacity: isTimerRunning ? 0.5 : 1,
          }}
        >
          <h3>Progress / Analytics</h3>
          <StatsDisplay refreshTrigger={statsRefreshTrigger} />
        </div>
      </div>
    </div>
  );
}
