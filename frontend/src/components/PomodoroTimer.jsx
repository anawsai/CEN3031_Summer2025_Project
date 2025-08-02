import React, { useState, useEffect } from 'react';
import { pomodoroAPI } from '../services/api';

const PomodoroTimer = ({ refreshXP, setNotificationQueue, onTimerStateChange }) => {
  const [workDuration, setWorkDuration] = useState(30); 
  const [showSettings, setShowSettings] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  useEffect(() => {
    if (onTimerStateChange) {
      onTimerStateChange(isRunning && !isPaused);
    }
  }, [isRunning, isPaused, onTimerStateChange]);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (timeLeft === 0 && sessionId) {
      setIsRunning(false);
      setIsPaused(false);
      pomodoroAPI.completeSession(sessionId)
        .then((response) => {
          console.log('Pomodoro session completed!');
          
          if (response.xp_awarded && setNotificationQueue) {
            setNotificationQueue(prev => [...prev, {
              type: 'xp',
              xp_amount: response.xp_awarded,
              reason: 'Pomodoro session completed!'
            }]);
          }
          
          if (response.achievements_earned && setNotificationQueue) {
            const achievementNotifications = response.achievements_earned.map(achievement => ({
              type: 'achievement',
              ...achievement
            }));
            setNotificationQueue(prev => [...prev, ...achievementNotifications]);
          }
          
          if (refreshXP) {
            refreshXP();
          }
          setSessionId(null);
          setTimeout(() => setTimeLeft(workDuration), 1000);
        })
        .catch(err => console.error('Failed to complete session:', err));
    }
  }, [timeLeft, sessionId, workDuration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    try {
      const response = await pomodoroAPI.startSession();
      setSessionId(response.session_id);
      setIsRunning(true);
      setIsPaused(false);
      console.log('Pomodoro session started:', response.session_id);
    } catch (error) {
      console.error('Failed to start pomodoro session:', error);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(workDuration);
    setSessionId(null);
  };

  return (
    <div>
      <div style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', margin: '20px 0' }}>
        {formatTime(timeLeft)}
      </div>
      
      {isPaused && (
        <div style={{ textAlign: 'center', color: '#888', marginBottom: '10px' }}>
          Paused
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {!isRunning ? (
          <button 
            onClick={handleStart}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Start
          </button>
        ) : (
          <>
            <button 
              onClick={isPaused ? handleResume : handlePause}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '16px',
                backgroundColor: isPaused ? '#4CAF50' : '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button 
              onClick={handleStop}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '16px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Stop
            </button>
          </>
        )}
      </div>

      <button 
        onClick={() => setShowSettings(!showSettings)}
        style={{
          width: '100%',
          padding: '8px',
          fontSize: '14px',
          backgroundColor: 'transparent',
          color: '#666',
          border: '1px solid #666',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Settings
      </button>

      {showSettings && (
        <div style={{
          marginTop: '10px',
          padding: '15px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <label style={{ color: '#fff', display: 'block', marginBottom: '4px', fontSize: '14px' }}>
              Work Duration (seconds):
            </label>
            <input
              type="number"
              value={workDuration}
              onChange={(e) => {
                const newDuration = parseInt(e.target.value);
                setWorkDuration(newDuration);
                if (!isRunning) setTimeLeft(newDuration);
              }}
              min="1"
              max="3600"
              style={{
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid #666',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                width: '60px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;