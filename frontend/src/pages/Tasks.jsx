import React from 'react';
import styles from '../styles/tasks.module.css';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';

export function Tasks({
  tasks,
  newTask,
  setNewTask,
  addTask,
  setCurrentPage,
  toggleComplete
}) {
  const [showModal, setShowModal] = React.useState(false);
  const [filter, setFilter] = React.useState('');

  let filteredTasks = [...tasks];
  if (filter === 'priority') {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    filteredTasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
  } else if (filter === 'deadline') {
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  return (
    <div className={styles.tasksContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.headerRow}>
          <h1 className={styles.headerTitle}>My Tasks</h1>
          <button
            className={styles.backButton}
            onClick={() => setCurrentPage('dashboard')}
          >
            ← Dashboard
          </button>
        </div>

        <button
          className={styles.addTaskButton}
          onClick={() => setShowModal(true)}
        >
          + Add Task
        </button>

        <div className={styles.sortContainer}>
          <label htmlFor="filter" className={styles.sortLabel}>
            Sort By:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="">None</option>
            <option value="priority">Priority</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>

        <div className={styles.taskListContainer}>
          <TaskList tasks={filteredTasks} toggleComplete={toggleComplete} />
        </div>
      </div>

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <button onClick={() => setShowModal(false)} className={styles.closeButton}>
              ✕
            </button>
            <TaskForm
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={() => {
                addTask();
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
