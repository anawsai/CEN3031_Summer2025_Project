import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, Crown, User } from 'lucide-react';
import { boardsAPI } from '../services/api';
import CreateBoardModal from '../components/modals/CreateBoardModal';
import TaskBoard from '../components/TaskBoard';
import styles from '../styles/sharedboards.module.css';

export function SharedBoards({ setCurrentPage }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showBoardView, setShowBoardView] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await boardsAPI.getBoards();
      setBoards(response.boards || []);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (boardData) => {
    try {
      await boardsAPI.createBoard(boardData);
      await fetchBoards(); 
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create board:', error);
      alert('Failed to create board. Please try again.');
    }
  };

  const handleBoardClick = (board) => {
    setSelectedBoard(board);
    setShowBoardView(true);
  };

  const handleBackToBoards = () => {
    setShowBoardView(false);
    setSelectedBoard(null);
    fetchBoards(); 
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (showBoardView && selectedBoard) {
    return (
      <TaskBoard 
        board={selectedBoard} 
        onBack={handleBackToBoards}
      />
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.innerContainer}>
        
        <div className={styles.headerRow}>
          <h1 className={styles.headerTitle}>Shared Boards</h1>
          <button
            className={styles.backButton}
            onClick={() => setCurrentPage('dashboard')}
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>
        </div>

        <div className={styles.subHeader}>
          <p className={styles.description}>
            Collaborate with your team on shared task boards. Create new boards or join existing ones to work together on projects.
          </p>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className={styles.createButton}
          >
            <Plus size={16} />
            Create New Board
          </button>
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading your boards...</p>
          </div>
        )}

        {!loading && boards.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Users size={64} />
            </div>
            <h3>No shared boards yet</h3>
            <p>Create your first board to start collaborating with your team, or wait to be invited to existing boards.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className={styles.emptyCreateButton}
            >
              <Plus size={16} />
              Create Your First Board
            </button>
          </div>
        )}

        {!loading && boards.length > 0 && (
          <div className={styles.boardsGrid}>
            {boards.map((board) => (
              <div 
                key={board.id} 
                className={styles.boardCard}
                onClick={() => handleBoardClick(board)}
              >
                
                <div className={styles.boardHeader}>
                  <div className={styles.boardInfo}>
                    <h3 className={styles.boardName}>{board.name}</h3>
                    <div className={styles.roleTag}>
                      {board.role === 'admin' ? (
                        <>
                          <Crown size={12} />
                          Admin
                        </>
                      ) : (
                        <>
                          <User size={12} />
                          Member
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {board.description && (
                  <p className={styles.boardDescription}>
                    {board.description}
                  </p>
                )}

                <div className={styles.boardMeta}>
                  <div className={styles.metaItem}>
                    <span>Created by {board.created_by}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>{formatDate(board.created_at)}</span>
                  </div>
                </div>

                <div className={styles.boardHover}>
                  <span>Click to open board →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateBoardModal 
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateBoard}
          />
        )}
      </div>
    </div>
  );
}