import React, { useState } from 'react';
import { Calendar, User, Flag, Trash2 } from 'lucide-react';
import styles from '../styles/taskcard.module.css';

const TaskCard = ({ task, onUpdate, onDragStart, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    due_date: task.due_date || '',
    assigned_to: task.assigned_to || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || '',
      assigned_to: task.assigned_to || '',
    });
    setIsEditing(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#ff4444';
      case 'Medium':
        return '#ff9800';
      case 'Low':
        return '#4caf50';
      default:
        return '#999';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDateString) => {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div
      className={`${styles.taskCard} ${isOverdue(task.due_date) ? styles.overdue : ''}`}
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDoubleClick={handleEdit}
    >
      {isEditing ? (
        <div className={styles.editForm}>
          <input
            type='text'
            value={editData.title}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
            className={styles.editInput}
            placeholder='Task title'
          />

          <textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            className={styles.editTextarea}
            placeholder='Description'
            rows='2'
          />

          <div className={styles.editRow}>
            <select
              value={editData.priority}
              onChange={(e) =>
                setEditData({ ...editData, priority: e.target.value })
              }
              className={styles.editSelect}
            >
              <option value='Low'>Low</option>
              <option value='Medium'>Medium</option>
              <option value='High'>High</option>
            </select>

            <input
              type='date'
              value={editData.due_date}
              onChange={(e) =>
                setEditData({ ...editData, due_date: e.target.value })
              }
              className={styles.editDate}
            />
          </div>

          <input
            type='text'
            value={editData.assigned_to}
            onChange={(e) =>
              setEditData({ ...editData, assigned_to: e.target.value })
            }
            className={styles.editInput}
            placeholder='Assign to username'
          />

          <div className={styles.editActions}>
            <button onClick={handleCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={handleSave} className={styles.saveButton}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.taskHeader}>
            <h4 className={styles.taskTitle}>{task.title}</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div
                className={styles.priorityBadge}
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                <Flag size={12} />
                {task.priority}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this task?')) {
                    onDelete();
                  }
                }}
                className={styles.deleteButton}
                title='Delete task'
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {task.description && (
            <p className={styles.taskDescription}>{task.description}</p>
          )}

          <div className={styles.taskMeta}>
            {task.due_date && (
              <div
                className={`${styles.metaItem} ${isOverdue(task.due_date) ? styles.overdueText : ''}`}
              >
                <Calendar size={14} />
                <span>{formatDate(task.due_date)}</span>
              </div>
            )}

            {task.assigned_to && (
              <div className={styles.metaItem}>
                <User size={14} />
                <span>{task.assigned_to}</span>
              </div>
            )}
          </div>

          <div className={styles.editHint}>
            <small>Double-click to edit</small>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;
