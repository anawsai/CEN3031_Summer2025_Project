import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

const StatsDisplay = ({ refreshTrigger }) => {
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayStats();
  }, [refreshTrigger]);

  const fetchTodayStats = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getTaskStats();
      setTodayCount(response.total_completed || 0);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setTodayCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading stats...</div>;
  }

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#333333',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', color: '#ffffff' }}>
        Today's Progress
      </h3>
      <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4CAF50' }}>
        {todayCount}
      </div>
      <div style={{ fontSize: '16px', color: '#cccccc' }}>tasks completed</div>
    </div>
  );
};

export default StatsDisplay;
