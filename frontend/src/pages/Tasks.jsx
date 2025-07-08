import React from 'react';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';

export function Tasks({
  tasks,
  newTask,
  setNewTask,
  addTask,
  setCurrentPage
}) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7f3e9',
      padding: '48px 24px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#4A5D23',
            margin: 0
          }}>
            Create Tasks
          </h1>

          <button
            onClick={() => setCurrentPage('dashboard')}
            style={{
              backgroundColor: '#ffffff',
              color: '#4A5D23',
              padding: '10px 18px',
              border: '2px solid #4A5D23',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#f1f8e9'}
            onMouseLeave={e => e.target.style.backgroundColor = '#ffffff'}
          >
            ← Dashboard
          </button>
        </div>

        {/* Task Form */}
        <TaskForm
          newTask={newTask}
          setNewTask={setNewTask}
          addTask={addTask}
        />

        {/* Task List */}
        <div style={{ marginTop: '40px' }}>
          <TaskList tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
