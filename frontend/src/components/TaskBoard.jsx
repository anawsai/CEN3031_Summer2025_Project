import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, UserPlus } from 'lucide-react';
import { boardsAPI } from '../services/api';
import CreateTaskModal from './modals/CreateTaskModal';
import InviteUserModal from './modals/InviteUserModal';
import TaskCard from './TaskCard';
import styles from '../styles/taskboard.module.css';

const TaskBoard = ({ board, onBack }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.id]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await boardsAPI.getBoardTasks(board.id);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await boardsAPI.createBoardTask(board.id, taskData);
      await fetchTasks();
      setShowCreateTask(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleInviteUser = async (username) => {
    try {
      await boardsAPI.inviteUser(board.id, username);
      setShowInviteUser(false);
      alert(`User ${username} invited successfully!`);
    } catch (error) {
      console.error('Failed to invite user:', error);
      alert(
        error.response?.data?.error ||
          'Failed to invite user. Please try again.'
      );
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await boardsAPI.updateBoardTask(board.id, taskId, updates);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      handleUpdateTask(draggedTask.id, { status: newStatus });
    }
    setDraggedTask(null);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: '#ff6f00' },
    { id: 'in_progress', title: 'In Progress', color: '#2196F3' },
    { id: 'done', title: 'Done', color: '#4CAF50' },
  ];

  return (
    <div className={styles.taskBoard}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Boards
          </button>
          <div>
            <h1>{board.name}</h1>
            <p className={styles.description}>{board.description}</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={() => setShowCreateTask(true)}
            className={styles.actionButton}
          >
            <Plus size={16} />
            Add Task
          </button>

          {board.role === 'admin' && (
            <button
              onClick={() => setShowInviteUser(true)}
              className={styles.actionButton}
            >
              <UserPlus size={16} />
              Invite User
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading tasks...</div>
      ) : (
        <div className={styles.board}>
          {columns.map((column) => (
            <div
              key={column.id}
              className={styles.column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div
                className={styles.columnHeader}
                style={{ borderTopColor: column.color }}
              >
                <h3>{column.title}</h3>
                <span className={styles.taskCount}>
                  {getTasksByStatus(column.id).length}
                </span>
              </div>

              <div className={styles.taskList}>
                {getTasksByStatus(column.id).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={(updates) => handleUpdateTask(task.id, updates)}
                    onDragStart={(e) => handleDragStart(e, task)}
                  />
                ))}

                {getTasksByStatus(column.id).length === 0 && (
                  <div className={styles.emptyColumn}>
                    <p>No tasks yet</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onCreate={handleCreateTask}
        />
      )}

      {showInviteUser && (
        <InviteUserModal
          onClose={() => setShowInviteUser(false)}
          onInvite={handleInviteUser}
        />
      )}
    </div>
  );
};

export default TaskBoard;
