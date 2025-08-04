import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import styles from '../styles/tasklist.module.css';

export function TaskList({ tasks, toggleComplete, onEditTask, onDeleteTask }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const triggerRefs = useRef({});

  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (tasks.length === 0) return null;

  const handleDropdownClick = (e, index) => {
    e.stopPropagation();

    if (openDropdown === index) {
      setOpenDropdown(null);
      return;
    }

    const button = triggerRefs.current[index];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX - 100,
      });
    }

    setOpenDropdown(index);
  };

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
      <h3 className={styles.heading}>My Tasks ({tasks.length})</h3>

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

          <div className={styles.taskActions}>
            <div className={styles.dropdownContainer}>
              <button
                ref={(el) => (triggerRefs.current[index] = el)}
                className={styles.dropdownTrigger}
                onClick={(e) => handleDropdownClick(e, index)}
                title='More options'
              >
                <MoreVertical size={16} />
              </button>
            </div>

            <div
              onClick={() => toggleComplete(index)}
              className={`${styles.toggleComplete} ${task.completed ? styles.checked : ''}`}
              title={task.completed ? 'Completed' : 'Mark as Done'}
            />
          </div>
        </div>
      ))}

      {openDropdown !== null &&
        createPortal(
          <div
            className={styles.dropdownMenu}
            style={{
              position: 'absolute',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: 999999,
            }}
          >
            <button
              className={styles.dropdownItem}
              onClick={(e) => handleEdit(e, tasks[openDropdown], openDropdown)}
            >
              <Edit2 size={14} />
              Edit
            </button>
            <button
              className={styles.dropdownItem}
              onClick={(e) =>
                handleDelete(e, tasks[openDropdown], openDropdown)
              }
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
