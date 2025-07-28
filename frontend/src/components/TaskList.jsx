import React, {useState} from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import styles from '../styles/tasklist.module.css';

export function TaskList({tasks, toggleComplete, onEditTask, onDeleteTask}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close 3-dot dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (tasks.length === 0) return null;

  // Toggle dropdown open/closed for each task
  const handleDropdownClick = (e, index) => {
    e.stopPropagation(); // prevent triggering other events
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Handle edit and delete actions
  const handleEdit = (e, task, index) => {
    e.stopPropagation();
    onEditTask(task, index);
    setOpenDropdown(null);
  };

  const handleDelete = (e, task, index) => {
    e.stopPropagation();
    onDeleteTask(task, index);
    setOpenDropdown(null);
  };

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
          {/* Task details */}
          <div>
            <h4 className={styles.title}>{task.title}</h4>
            <p className={styles.description}>{task.description}</p>
            <p className={styles.details}>
              Due: {task.dueDate} | Priority: {task.priority}
            </p>
          </div>

          {/* Task actions: Dropdown + Completion toggle */}
          <div className={styles.taskActions}>
            {/* Three-dots dropdown menu */}
            <div className={styles.dropdownContainer}>
              <button
                className={styles.dropdownTrigger}
                onClick={(e) => handleDropdownClick(e, index)}
                title="More options"
              >
                <MoreVertical size={16} />
              </button>

              {openDropdown === index && (
                <div className={styles.dropdownMenu}>
                  <button
                    className={styles.dropdownItem}
                    onClick={(e) => handleEdit(e, task, index)}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={(e) => handleDelete(e, task, index)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>

          {/* Complete toggle */}
          <div
            onClick={() => toggleComplete(index)}
            className={`${styles.toggleComplete} ${task.completed ? styles.checked : ''}`}
            title={task.completed ? 'Completed' : 'Mark as Done'}
          />
          </div>
        </div>
      ))}
    </div>
  );
}