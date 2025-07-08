import React from 'react';

export function TaskList({tasks}) {
    if (tasks.length === 0) return null;

    return ( 
        <div style = {{ 
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '15px',
        }}>
            <h3 style = {{ color: '#7dcea0', marginBottom: '15px' }}>
                Your Tasks ({tasks.length})
            </h3>

            {tasks.map((task, index) => (
                <div key={index} style={{
                    padding: '15px',
                    margin: '10px 0',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    border: '1px solid #eee',
                }}>
                    <h4 style={{ margin: 0 }}>{task.title}</h4>
                    <p style={{ margin: '4px 0' }}>{task.description}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#777' }}>
                    Due: {task.dueDate} | Priority: {task.priority}
                    </p>
                </div>
                ))}
        </div>
    );
}