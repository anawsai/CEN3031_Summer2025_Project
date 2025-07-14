import React from 'react';


export function TaskList({ tasks, toggleComplete }) {
  if (tasks.length === 0) return null;

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '15px',
    }}>
      <h3 style={{ color: '#7dcea0', marginBottom: '15px' }}>
        Your Tasks ({tasks.length})
      </h3>

      {tasks.map((task, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px',
          margin: '10px 0',
          backgroundColor: task.completed ? '#d4edda' : '#f9f9f9',
          borderRadius: '8px',
          border: '1px solid #eee',
        }}>
          <div>
            <h4 style={{ margin: 0 }}>{task.title}</h4>
            <p style={{ margin: '4px 0' }}>{task.description}</p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#777' }}>
              Due: {task.dueDate} | Priority: {task.priority}
            </p>
          </div>

          <div
            onClick={() => toggleComplete(index)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid #4A5D23',
              backgroundColor: task.completed ? '#4A5D23' : 'transparent',
              cursor: 'pointer',
              marginLeft: '12px',
            }}
            title={task.completed ? 'Completed' : 'Mark as Done'}
          />
        </div>
      ))}
    </div>
  );
}