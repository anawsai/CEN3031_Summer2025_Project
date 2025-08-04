import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Users,
  Crown,
  User,
  Trash2,
  Inbox,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { boardsAPI, invitesAPI } from '../services/api';
import CreateBoardModal from '../components/modals/CreateBoardModal';
import TaskBoard from '../components/TaskBoard';
import styles from '../styles/sharedboards.module.css';

export function SharedBoards({ setCurrentPage }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showBoardView, setShowBoardView] = useState(false);
  const [invites, setInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);

  useEffect(() => {
    fetchBoards();
    fetchInvites();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await boardsAPI.getBoards();
      setBoards(response.data.boards || []);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    try {
      const response = await invitesAPI.getInvites();
      setInvites(response.data.invites || []);
    } catch (error) {
      console.error('Failed to fetch invites:', error);
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

  const handleAcceptInvite = async (inviteId) => {
    try {
      await invitesAPI.acceptInvite(inviteId);
      await fetchInvites();
      await fetchBoards();
      alert('Invite accepted! You can now access the board.');
    } catch (error) {
      alert('Failed to accept invite');
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    try {
      await invitesAPI.declineInvite(inviteId);
      await fetchInvites();
    } catch (error) {
      alert('Failed to decline invite');
    }
  };

  const handleDeleteBoard = async (e, boardId, boardName) => {
    e.stopPropagation(); // Prevent board click

    if (
      window.confirm(
        `Are you sure you want to delete "${boardName}"? This action cannot be undone.`
      )
    ) {
      try {
        await boardsAPI.deleteBoard(boardId);
        await fetchBoards(); // Refresh the board list
      } catch (error) {
        console.error('Failed to delete board:', error);
        alert(
          'Failed to delete board. You may not have permission to delete this board.'
        );
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (showBoardView && selectedBoard) {
    return <TaskBoard board={selectedBoard} onBack={handleBackToBoards} />;
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
            Collaborate with your team on shared task boards. Create new boards
            or join existing ones to work together on projects.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => invites.length > 0 && setShowInvites(!showInvites)}
              className={styles.inviteButton}
              disabled={invites.length === 0}
              style={{
                opacity: invites.length === 0 ? 0.5 : 1,
                cursor: invites.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <Inbox size={16} />
              Invites ({invites.length})
            </button>

            {!loading && (
              <button
                onClick={() => setShowCreateModal(true)}
                className={styles.createButton}
              >
                <Plus size={16} />
                Create New Board
              </button>
            )}
          </div>
        </div>

        {showInvites && invites.length > 0 && (
          <div className={styles.invitesSection}>
            <h3>Pending Invitations</h3>
            <div className={styles.invitesList}>
              {invites.map((invite) => (
                <div key={invite.id} className={styles.inviteCard}>
                  <div className={styles.inviteInfo}>
                    <h4>{invite.board_name}</h4>
                    <p>Invited by {invite.invited_by}</p>
                    {invite.message && (
                      <div className={styles.inviteMessage}>
                        <MessageSquare size={14} />
                        <p>{invite.message}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.inviteActions}>
                    <button
                      onClick={() => handleAcceptInvite(invite.id)}
                      className={styles.acceptButton}
                    >
                      <Check size={16} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.id)}
                      className={styles.declineButton}
                    >
                      <X size={16} />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <p>
              Create your first board to start collaborating with your team, or
              wait to be invited to existing boards.
            </p>
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
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteBoard(e, board.id, board.name)}
                    title='Delete board'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {board.description && (
                  <p className={styles.boardDescription}>{board.description}</p>
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
