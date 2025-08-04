import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import api from '../services/api';
import styles from '../styles/analytics.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Analytics({ setCurrentPage }) {
  const [todayStats, setTodayStats] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const [weekData, setWeekData] = useState({
    labels: [],
    data: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch today's stats
      const todayResponse = await api.get('/analytics/tasks', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        params: {
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
        },
      });

      // Set today's stats
      const todayCompleted = todayResponse.data.total_completed || 0;
      setTodayStats({
        completed: todayCompleted,
        total: todayResponse.data.total_completed || 0,
        percentage: 0, // We'll calculate this if needed
      });

      // Fetch weekly data
      const weekResponse = await api.get('/analytics/daily-completions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      setWeekData({
        labels: weekResponse.data.labels,
        data: weekResponse.data.data,
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const chartData = {
    labels: weekData.labels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: weekData.data,
        fill: true,
        backgroundColor: 'rgba(255, 111, 0, 0.1)',
        borderColor: '#ff6f00',
        pointBackgroundColor: '#ff6f00',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ff6f00',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `${context.parsed.y} tasks completed`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.headerRow}>
          <h1 className={styles.headerTitle}>Analytics</h1>
          <button
            className={styles.backButton}
            onClick={() => setCurrentPage('dashboard')}
          >
            ← Dashboard
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading analytics...</div>
        ) : (
          <>
            {/* Today's Progress */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Today's Progress</h2>
              <div className={styles.todayStats}>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>
                    {todayStats.completed}
                  </div>
                  <div className={styles.statLabel}>Tasks Completed Today</div>
                </div>
              </div>
            </div>

            {/* Week's Progress */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Week's Progress</h2>
              <div className={styles.chartContainer}>
                <Line data={chartData} options={chartOptions} />
              </div>
              <div className={styles.weekSummary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Total this week:</span>
                  <span className={styles.summaryValue}>
                    {weekData.data.reduce((sum, val) => sum + val, 0)} tasks
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Daily average:</span>
                  <span className={styles.summaryValue}>
                    {(
                      weekData.data.reduce((sum, val) => sum + val, 0) / 7
                    ).toFixed(1)}{' '}
                    tasks
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
