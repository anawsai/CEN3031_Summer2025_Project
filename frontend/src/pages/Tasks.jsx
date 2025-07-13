import React from 'react';
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
             My Tasks
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

        {/* Add Task Button */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: '#6B7B47',
            color: 'white',
            padding: '14px 24px',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
        >
          + Add Task
        </button>

        {/* Task List */}
        <div style={{ marginTop: '40px' }}>
          <TaskList tasks={tasks} toggleComplete={toggleComplete}/>
        </div>
      </div>  

      {/* Modal */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowModal(false)} style={closeBtnStyle}>
              ✕
            </button>
            <TaskForm
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={() => {
                addTask();
                setShowModal(false); //close modal after adding
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}



const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: 'white',
  padding: '40px',
  borderRadius: '16px',
  maxWidth: '600px',
  width: '90%',
  position: 'relative'
};

const closeBtnStyle = {
  position: 'absolute',
  top: '12px',
  right: '16px',
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#888'
};
