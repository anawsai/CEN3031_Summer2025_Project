import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { authAPI } from '../services/api';
import api from '../services/api';
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
  isAuthenticated,
}) {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ xpChange: '' });
  const [adminMessage, setAdminMessage] = useState('');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await api.get('/user/is-admin', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setIsAdmin(response.data.is_admin);
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  };

  const handleAdminXPAdjust = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const response = await api.post(
        '/admin/adjust-xp',
        {
          email: userData.email, // Always adjust own XP
          xp_change: parseInt(adminForm.xpChange) || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      setAdminMessage(`XP updated! New total: ${response.data.new_xp}`);
      setAdminForm({ xpChange: '' });
      refreshXP();
    } catch (error) {
      setAdminMessage(error.response?.data?.error || 'Failed to adjust XP');
    }
  };

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
          alignItems: 'flex-end',
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

      {isAdmin && (
        <button
          onClick={() => setShowAdminModal(true)}
          className={styles.adminButton}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 100,
          }}
          title='Admin Panel'
        >
          👑 Admin
        </button>
      )}

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

          {tasks.filter((task) => !task.completed).length === 0 && (
            <p style={{ color: '#777', fontSize: '14px' }}>
              No active tasks. Click to add a new task!
            </p>
          )}

          {tasks.filter((task) => !task.completed).length > 0 && (
            <div>
              {tasks
                .filter((task) => !task.completed)
                .slice(0, 3)
                .map((task) => {
                  const originalIndex = tasks.findIndex(
                    (t) => t.id === task.id
                  );
                  return (
                    <div
                      key={task.id}
                      className={`${styles.taskItem} ${task.completed ? styles.taskItemCompleted : styles.taskItemIncomplete}`}
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
                          Due: {task.due_date || task.dueDate || 'N/A'} |
                          Priority: {task.priority || 'N/A'}
                        </p>
                      </div>

                      {!task.completed && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComplete(originalIndex);
                          }}
                          className={`${styles.toggleComplete} ${task.completed ? styles.completed : ''}`}
                          title={task.completed ? 'Completed' : 'Mark as Done'}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {tasks.filter((task) => !task.completed).length > 3 && (
            <p style={{ color: '#777', fontSize: '14px' }}>
              ...and {tasks.filter((task) => !task.completed).length - 3} more
              active tasks
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
          onClick={() => !isTimerRunning && setCurrentPage('analytics')}
          className={styles.card}
          style={{
            pointerEvents: isTimerRunning ? 'none' : 'auto',
            opacity: isTimerRunning ? 0.5 : 1,
            cursor: isTimerRunning ? 'default' : 'pointer',
          }}
        >
          <h3>Progress / Analytics</h3>
          <StatsDisplay refreshTrigger={statsRefreshTrigger} />
        </div>
      </div>

      {showAdminModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAdminModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => {
                setShowAdminModal(false);
                setAdminMessage('');
              }}
            >
              ✕
            </button>

            <h2 style={{ color: '#ff6f00', marginBottom: '24px' }}>
              👑 Admin XP Tool
            </h2>

            <div className={styles.adminForm}>
              <h3 style={{ color: '#ffffff', marginBottom: '16px' }}>
                Add XP to Your Account
              </h3>

              <input
                type='number'
                placeholder='XP to add (e.g. 100)'
                value={adminForm.xpChange}
                onChange={(e) => setAdminForm({ xpChange: e.target.value })}
                className={styles.adminInput}
                autoFocus
              />

              <button
                onClick={handleAdminXPAdjust}
                className={styles.adminSubmitButton}
                disabled={!adminForm.xpChange}
              >
                Add {adminForm.xpChange || '0'} XP
              </button>

              {adminMessage && (
                <p
                  className={
                    adminMessage.includes('updated')
                      ? styles.successMessage
                      : styles.errorMessage
                  }
                >
                  {adminMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
