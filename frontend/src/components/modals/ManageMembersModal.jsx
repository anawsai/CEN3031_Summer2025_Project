import React, { useState, useEffect } from 'react';
import { Crown, User, Trash2, X } from 'lucide-react';
import { boardsAPI } from '../../services/api';
import styles from '../../styles/modal.module.css';

const ManageMembersModal = ({ board, onClose }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [board.id]);

  const fetchMembers = async () => {
    try {
      const response = await boardsAPI.getMembers(board.id);
      setMembers(response.data.members || []);
      setIsOwner(response.data.is_owner);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      alert('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.username} from this board?`)) {
      return;
    }

    try {
      await boardsAPI.removeMember(board.id, member.id);
      await fetchMembers();
      alert(`${member.username} has been removed from the board`);
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ minWidth: '400px' }}>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={20} />
        </button>

        <h2
          style={{
            color: '#ff6f00',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Board Members
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Loading members...
          </div>
        ) : (
          <div className={styles.membersList}>
            {members.map((member) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid rgba(250, 70, 22, 0.2)',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  {member.role === 'owner' ? (
                    <Crown size={20} color='#ff6f00' />
                  ) : (
                    <User size={20} color='#999' />
                  )}
                  <div>
                    <div style={{ color: '#fff', fontWeight: '500' }}>
                      {member.username}
                    </div>
                    <div style={{ color: '#999', fontSize: '12px' }}>
                      {member.email}
                    </div>
                  </div>
                </div>

                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor:
                        member.role === 'owner'
                          ? 'rgba(255, 111, 0, 0.2)'
                          : 'rgba(255, 255, 255, 0.1)',
                      color: member.role === 'owner' ? '#ff6f00' : '#999',
                    }}
                  >
                    {member.role === 'owner' ? 'Owner' : 'Member'}
                  </span>

                  {isOwner && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ff4444',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor =
                          'rgba(255, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      title='Remove member'
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={onClose}
            className={styles.submitButton}
            style={{ width: 'auto', padding: '8px 24px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal;
