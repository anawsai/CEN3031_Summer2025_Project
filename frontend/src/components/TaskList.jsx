import React from 'react';
import styles from '../styles/tasklist.module.css';

export function TaskList({ tasks, toggleComplete }) {
  if (tasks.length === 0) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>
        Your Tasks ({tasks.length})
      </h3>

      {tasks.map((task, index) => (
        <div
          key={index}
          className={`${styles.taskItem} ${task.completed ? styles.completed : styles.incomplete}`}
        >
          <div>
            <h4 className={styles.title}>{task.title}</h4>
            <p className={styles.description}>{task.description}</p>
            <p className={styles.details}>
              Due: {task.dueDate} | Priority: {task.priority}
            </p>
          </div>

          <div
            onClick={() => toggleComplete(index)}
            className={`${styles.toggleComplete} ${task.completed ? styles.checked : ''}`}
            title={task.completed ? 'Completed' : 'Mark as Done'}
          />
        </div>
      ))}
    </div>
  );
}
