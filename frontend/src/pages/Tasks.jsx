import React from 'react';
import api from '../services/api';
import styles from '../styles/tasks.module.css';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';

export function Tasks({
  tasks,
  newTask,
  setNewTask,
  addTask,
  setCurrentPage,
  toggleComplete,
  setTasks
}) {

  //UI states for modals and task editing/deletion
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState(null);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [taskToDelete, setTaskToDelete] = React.useState(null);
  const [filter, setFilter] = React.useState('');

// Handle task editing
const handleEditTask = (task, index) => {
  setEditingTask({
    title: task.title,
    description: task.description,
    dueDate: task.due_date,
    priority: task.priority
  });
  setEditingIndex(index);
  setShowEditModal(true);
};

// Save edited task
const saveEditedTask = async () => {
  if (!editingTask || editingIndex === null) return;

  try {
    const taskId = tasks[editingIndex].id;
    const response = await api.put(`/tasks/${taskId}`, {
      title: editingTask.title,
      description: editingTask.description,
      due_date: editingTask.dueDate,
      priority: editingTask.priority
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

  //update local tasks state
  const updatedTasks = [...tasks];
  updatedTasks[editingIndex] = response.data.task;
  setTasks(updatedTasks);
  
  //close the modal and reset editing state
  setShowEditModal(false);
  setEditingTask(null);
  setEditingIndex(null);
  } 
  catch (error) {
  console.error('Error updating task:', error);
  alert('Failed to update task. Please try again.');
  }
};

// Handle task deletion
const handleDeleteTask = (task, index) => {
  setTaskToDelete({ task, index });
  setShowDeleteConfirm(true);
};

// Confirm and delete task
const confirmDelete = async () => {
  if (!taskToDelete) return;

  try {
    const taskId = taskToDelete.task.id;
    await api.delete(`/tasks/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  });

  //remove the task from local state
  const updatedTasks = tasks.filter((_, index) => index !== taskToDelete.index);
  setTasks(updatedTasks);

  //close the confirmation modal
  setShowDeleteConfirm(false);
  setTaskToDelete(null);
  } 
  catch (error) {
    console.error('Error deleting task:', error);
    alert('Failed to delete task. Please try again.');
  }
};

  // Filter tasks based on selected criteria
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

        {/* Header with back button */} 
        <div className={styles.headerRow}>
          <h1 className={styles.headerTitle}> Tasks</h1>
          <button
            className={styles.backButton}
            onClick={() => setCurrentPage('dashboard')}
          >
            ← Dashboard
          </button>
        </div>

        {/* Add Task Button */}
        <button
          className={styles.addTaskButton}
          onClick={() => setShowModal(true)}
        >
          + Add Task
        </button>

        {/* Sort Dropdown */}
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

        {/* Task List */}
        <div className={styles.taskListContainer}>
          <TaskList 
            tasks={filteredTasks} 
            toggleComplete={toggleComplete}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>

      {/* ----------------- Modals ------------------*/}
      {/* Add Task Modal */}
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
              heading="Add a New Task"
              buttonText="Add Task"
            />
          </div>
        </div>
      )}

      {/*Edit Task Modal */}
      {showEditModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <button onClick={() => setShowEditModal(false)} className={styles.closeButton}>
              ✕
            </button>
            <TaskForm
              newTask={editingTask}
              setNewTask={setEditingTask}
              addTask={saveEditedTask}
              heading="Edit Task"
              buttonText="Save Changes"
            />
          </div>
        </div>
      )}

      {/*Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 style={{ color: '#ff6f00', marginBottom: '20px' }}>Delete Task</h2>
            <p style={{ color: '#ffffff', marginBottom: '16px' }}>
              Are you sure you want to delete "{taskToDelete?.task.title}"?
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
