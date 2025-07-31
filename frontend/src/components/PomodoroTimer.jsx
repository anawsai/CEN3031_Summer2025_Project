import React, { useState, useEffect } from 'react';
import { pomodoroAPI } from '../services/api';

const PomodoroTimer = ({ refreshXP, setNotificationQueue, onTimerStateChange }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  useEffect(() => {
    if (onTimerStateChange) {
      onTimerStateChange(isRunning);
    }
  }, [isRunning, onTimerStateChange]);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft === 0 && sessionId) {
      setIsRunning(false);
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
          setTimeout(() => setTimeLeft(30), 1000);
        })
        .catch(err => console.error('Failed to complete session:', err));
    }
  }, [timeLeft, sessionId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = async () => {
    if (isRunning) {
      setIsRunning(false);
      setTimeLeft(30);
      setSessionId(null);
    } else {
      try {
        const response = await pomodoroAPI.startSession();
        setSessionId(response.session_id);
        setIsRunning(true);
        console.log('Pomodoro session started:', response.session_id);
      } catch (error) {
        console.error('Failed to start pomodoro session:', error);
      }
    }
  };

  return (
    <div>
      <div style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', margin: '20px 0' }}>
        {formatTime(timeLeft)}
      </div>
      <button 
        onClick={handleStartStop}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          backgroundColor: isRunning ? '#ff4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {isRunning ? 'Stop' : 'Start'}
      </button>
    </div>
  );
};

export default PomodoroTimer;