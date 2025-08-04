import React from 'react';
import { Search, Filter } from 'lucide-react';
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
  setTasks,
}) {
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState(null);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [taskToDelete, setTaskToDelete] = React.useState(null);
  const [filter, setFilter] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleEditTask = (task, index) => {
    const actualIndex = tasks.findIndex(t => t.id === task.id);
    setEditingTask({
      title: task.title,
      description: task.description,
      dueDate: task.due_date,
      priority: task.priority,
    });
    setEditingIndex(actualIndex);
    setShowEditModal(true);
  };

  const saveEditedTask = async () => {
    if (!editingTask || editingIndex === null) return;

    try {
      const taskId = tasks[editingIndex].id;
      const response = await api.put(
        `/tasks/${taskId}`,
        {
          title: editingTask.title,
          description: editingTask.description,
          due_date: editingTask.dueDate,
          priority: editingTask.priority,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      const updatedTasks = [...tasks];
      updatedTasks[editingIndex] = response.data.task;
      setTasks(updatedTasks);

      setShowEditModal(false);
      setEditingTask(null);
      setEditingIndex(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = (task, index) => {
    const actualIndex = tasks.findIndex(t => t.id === task.id);
    setTaskToDelete({ task, index: actualIndex });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      const taskId = taskToDelete.task.id;
      await api.delete(`/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const updatedTasks = tasks.filter(
        (_, index) => index !== taskToDelete.index
      );
      setTasks(updatedTasks);

      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleToggleComplete = (filteredIndex) => {
    const task = filteredTasks[filteredIndex];
    const actualIndex = tasks.findIndex(t => t.id === task.id);
    toggleComplete(actualIndex);
  };

  let filteredTasks = [...tasks];

  if (activeTab === 'pending') {
    filteredTasks = filteredTasks.filter(task => !task.completed);
  } else if (activeTab === 'completed') {
    filteredTasks = filteredTasks.filter(task => task.completed);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(task => {
      const dueDate = task.due_date || task.dueDate;
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        (task.priority && task.priority.toLowerCase().includes(query)) ||
        (dueDate && dueDate.includes(query))
      );
    });
  }

  if (filter === 'priority') {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    filteredTasks.sort(
      (a, b) =>
        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    );
  } else if (filter === 'deadline') {
    filteredTasks.sort((a, b) => {
      const dueDateA = a.due_date || a.dueDate;
      const dueDateB = b.due_date || b.dueDate;
      
      if (!dueDateA && !dueDateB) return 0;
      if (!dueDateA) return 1;
      if (!dueDateB) return -1;
      return new Date(dueDateA) - new Date(dueDateB);
    });
  }

  const getTaskCounts = () => {
    return {
      all: tasks.length,
      pending: tasks.filter(task => !task.completed).length,
      completed: tasks.filter(task => task.completed).length,
    };
  };

  const taskCounts = getTaskCounts();

  return (
    <div className={styles.tasksContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.headerRow}>
          <h1 className={styles.headerTitle}>Tasks</h1>
          <button
            className={styles.backButton}
            onClick={() => setCurrentPage('dashboard')}
          >
            ← Dashboard
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
              <span className={styles.tabCount}>{taskCounts.all}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
              <span className={styles.tabCount}>{taskCounts.pending}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
              <span className={styles.tabCount}>{taskCounts.completed}</span>
            </button>
          </div>
        </div>

        {/* Search & Controls */}
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.sortContainer}>
            <Filter className={styles.filterIcon} size={16} />
            <select
              id='filter'
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={styles.sortSelect}
            >
              <option value=''>Sort by</option>
              <option value='priority'>Priority</option>
              <option value='deadline'>Due Date</option>
            </select>
          </div>

          <button
            className={styles.addTaskButton}
            onClick={() => setShowModal(true)}
          >
            + Add Task
          </button>
        </div>

        {/* Results Info */}
        {(searchQuery || activeTab !== 'all') && (
          <div className={styles.resultsInfo}>
            Showing {filteredTasks.length} of {tasks.length} tasks
            {searchQuery && (
              <span className={styles.searchTerm}>
                {' '}matching "{searchQuery}"
              </span>
            )}
          </div>
        )}

        {/* Task List */}
        <div className={styles.taskListContainer}>
          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              {searchQuery ? (
                <>
                  <p>No tasks found matching "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className={styles.clearSearchButton}
                  >
                    Clear search
                  </button>
                </>
              ) : activeTab === 'pending' ? (
                <p>No pending tasks! Great job! </p>
              ) : activeTab === 'completed' ? (
                <p>No completed tasks yet. Start working on your goals!</p>
              ) : (
                <p>No tasks yet. Create your first task to get started!</p>
              )}
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              toggleComplete={handleToggleComplete}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </div>
      </div>

      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <button
              onClick={() => setShowModal(false)}
              className={styles.closeButton}
            >
              ✕
            </button>
            <TaskForm
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={() => {
                addTask();
                setShowModal(false);
              }}
              heading='Add a New Task'
              buttonText='Add Task'
            />
          </div>
        </div>
      )}

      {showEditModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <button
              onClick={() => setShowEditModal(false)}
              className={styles.closeButton}
            >
              ✕
            </button>
            <TaskForm
              newTask={editingTask}
              setNewTask={setEditingTask}
              addTask={saveEditedTask}
              heading='Edit Task'
              buttonText='Save Changes'
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 style={{ color: '#ff6f00', marginBottom: '20px' }}>
              Delete Task
            </h2>
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
              <button onClick={confirmDelete} className={styles.deleteButton}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}