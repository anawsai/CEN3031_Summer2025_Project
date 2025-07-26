import React from 'react';
import styles from '../styles/taskform.module.css';

export function TaskForm({ newTask, setNewTask, addTask }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    addTask();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.heading}>Add a New Task</h3>

      <input
        type="text"
        value={newTask.title}
        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        placeholder="Task Title"
        className={styles.input}
        required
      />

      <textarea
        value={newTask.description}
        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        placeholder="Description"
        className={`${styles.input} ${styles.textarea}`}
      />

      <input
        type="date"
        value={newTask.dueDate}
        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
        className={styles.input}
      />

      <select
        value={newTask.priority}
        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
        className={styles.input}
      >
        <option value="">Select Priority</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <button type="submit" className={styles.button}>
        Add Task
      </button>
    </form>
  );
}


