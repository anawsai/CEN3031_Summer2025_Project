import React from 'react';

export function TaskForm({ newTask, setNewTask, addTask }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    addTask();
  };

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '15px',
      marginBottom: '20px'
    }}>
      <h3 style={{ color: '#7dcea0', marginBottom: '20px' }}>Add a New Task</h3>

      <input
        type="text"
        value={newTask.title}
        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        placeholder="Task Title"
        style={inputStyle}
        required
      />

      <textarea
        value={newTask.description}
        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        placeholder="Description"
        style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
      />

      <input
        type="date"
        value={newTask.dueDate}
        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
        style={inputStyle}
      />

      <select
        value={newTask.priority}
        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
        style={inputStyle}
      >
        <option value="">Select Priority</option>
        <option value="High"> High</option>
        <option value="Medium"> Medium</option>
        <option value="Low">Low</option>
      </select>

      <button type="submit" style={buttonStyle}>
        Add Task
      </button>
    </form>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '16px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '16px'
};

const buttonStyle = {
  background: 'linear-gradient(135deg, #6B7B47, #7dcea0)',
  color: 'white',
  padding: '15px 30px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '16px',
  width: '100%'
};

