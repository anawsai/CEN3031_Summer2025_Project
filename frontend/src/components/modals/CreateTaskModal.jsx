import React, { useState } from 'react';
import styles from '../../styles/modal.module.css';

const CreateTaskModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium',
    status: 'todo',
    assigned_to: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Task title is required');
      return;
    }

    setLoading(true);
    try {
      const taskData = { ...formData };
      if (!taskData.assigned_to.trim()) {
        delete taskData.assigned_to;
      }
      if (!taskData.due_date) {
        delete taskData.due_date;
      }
      
      await onCreate(taskData);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>
          ✕
        </button>
        
        <h2 style={{ color: '#ff6f00', marginBottom: '24px', textAlign: 'center' }}>
          Create New Task
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Task Title"
            className={styles.input}
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description (optional)"
            className={`${styles.input} ${styles.textarea}`}
            rows="3"
          />

          <div className={styles.formRow}>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className={styles.input}
              placeholder="Due Date (optional)"
            />

            <input
              type="text"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              placeholder="Assign to username (optional)"
              className={styles.input}
            />
          </div>

          <div className={styles.buttonRow}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;