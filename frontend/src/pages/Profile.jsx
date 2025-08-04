import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Star, User, Award } from 'lucide-react';
import api from '../services/api';
import styles from '../styles/profile.module.css';

const Profile = ({ setCurrentPage, xpData }) => {
  const [userData, setUserData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/achievements', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.data && response.data.achievements) {
        setAchievements(response.data.achievements);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUnlockedAchievements = () => {
    return achievements.filter((achievement) => achievement.unlocked);
  };

  const getLockedAchievements = () => {
    return achievements.filter((achievement) => !achievement.unlocked);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.innerContainer}>
        {/* Back Button */}
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={styles.backButton}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Profile Header Card */}
        <div className={styles.profileCard}>
          <div className={styles.userHeader}>
            <div className={styles.avatar}>
              <User size={40} color='white' />
            </div>

            <div className={styles.userInfo}>
              <h1>{userData?.username || 'User'}</h1>
              <p className={styles.fullName}>
                {userData?.first_name} {userData?.last_name}
              </p>
              <p className={styles.email}>{userData?.email}</p>
            </div>
          </div>

          {/* XP Progress */}
          {xpData && (
            <div>
              <div className={styles.xpHeader}>
                <h3 className={styles.xpTitle}>
                  <Star size={20} style={{ color: '#ff6f00' }} />
                  Level {xpData.level}: {xpData.level_name}
                </h3>
                <div className={styles.xpAmount}>{xpData.total_xp} XP</div>
              </div>

              <div className={styles.xpBarContainer}>
                <div
                  className={styles.xpBar}
                  style={{ width: `${xpData.progress_percent}%` }}
                />
                <div className={styles.xpBarText}>
                  {xpData.progress_percent}% Complete
                </div>
              </div>

              <div className={styles.xpFooter}>
                {xpData.xp_to_next_level > 0
                  ? `${xpData.xp_to_next_level} XP to next level`
                  : 'Maximum level reached!'}
              </div>
            </div>
          )}
        </div>

        {/* Achievements Section */}
        <div className={styles.achievementsCard}>
          <h2 className={styles.achievementsTitle}>
            <Trophy size={28} />
            Achievements ({getUnlockedAchievements().length}/
            {achievements.length})
          </h2>

          {loading && (
            <div className={styles.loading}>Loading achievements...</div>
          )}

          {!loading && achievements.length === 0 && (
            <div className={styles.noData}>No achievements data available</div>
          )}

          {!loading && achievements.length > 0 && (
            <>
              {/* Earned Achievements */}
              {getUnlockedAchievements().length > 0 && (
                <div className={styles.earnedSection}>
                  <h3
                    className={`${styles.sectionTitle} ${styles.earnedTitle}`}
                  >
                    <Award size={20} />
                    Earned Achievements
                  </h3>
                  <div className={styles.achievementsGrid}>
                    {getUnlockedAchievements().map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`${styles.achievementItem} ${styles.achievementEarned}`}
                      >
                        <div className={styles.achievementIcon}>
                          {achievement.icon}
                        </div>
                        <div className={styles.achievementContent}>
                          <div className={styles.achievementName}>
                            {achievement.name}
                          </div>
                          <div className={styles.achievementDescription}>
                            {achievement.description}
                          </div>
                          <div className={styles.achievementEarnedInfo}>
                            {achievement.earned_at
                              ? `Earned ${formatDate(achievement.earned_at)} • `
                              : ''}
                            +{achievement.xp_reward} XP
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Achievements */}
              {getLockedAchievements().length > 0 && (
                <div>
                  <h3
                    className={`${styles.sectionTitle} ${styles.lockedTitle}`}
                  >
                    Locked Achievements
                  </h3>
                  <div className={styles.achievementsGrid}>
                    {getLockedAchievements().map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`${styles.achievementItem} ${styles.achievementLocked}`}
                      >
                        <div
                          className={`${styles.achievementIcon} ${styles.achievementIconLocked}`}
                        >
                          {achievement.icon}
                        </div>
                        <div className={styles.achievementContent}>
                          <div className={styles.achievementName}>
                            {achievement.name}
                          </div>
                          <div className={styles.achievementDescription}>
                            {achievement.description}
                          </div>
                          <div className={styles.achievementLockedInfo}>
                            Reward: +{achievement.xp_reward} XP
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
