import React, {useState} from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  //handle adding a new task
  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, newTask]);
      setNewTask('');
    }
  };

  //Task Creation Page (just a simple form for now that gets executed when the user clicks the "Get Started" button !!!)
  if (currentPage === 'tasks') { 
    return (
      <div style ={{
        minHeight: '100%',
        backgroundColor: 'beige',
        padding: '24px'
      }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style = {{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#7dcea0',
          margin: 0
        }}>
            Create Tasks
        </h1>

       {/* Back to Home Button */}
        <button
          onClick={()=> setCurrentPage('home')}
          style={{
            background: 'transparent',
            color: '#7dcea0',
            padding: '8px 16px',
            border: '1px solid #7dcea0',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            ← Back to Home
        </button>
      </div>

      {/* Task Creation Form */}
      <div style ={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '20px',
      }}>
        <h3 style={{
          color: '#7dcea0',
          marginBottom: '20px'
        }}>
          Add a New Task
        </h3>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What needs to be done?"
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '20px',
            fontSize: '16px'
          }}
          />

        <button
          onClick={addTask}
          style={{
            background: 'linear-gradient(135deg, #6B7B47, #7dcea0)',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px',
          }}>
          Add Task
        </button>
      </div>

      {/* Task List */}
       {tasks.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '15px',
        }}>
          <h3 style={{
            color: '#7dcea0',
            marginBottom: '15px'
          }}>
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
              {task}
            </div>
          ))}
        </div>
      )}
      </div>
    );
  }


  // Home Page
  return (
    <div style={{
      minHeight: '100%',
      backgroundColor: 'beige'
    }}>
      {/* Header */}
      <header style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left side - Logo and Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Logo */}
            <img 
              src="/path-to-gator-logo.png" 
              alt="SwampScheduler Logo" 
              style={{ width: '48px', height: '48px' }}
            />
            {/* Title */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#7dcea0',
              margin: 0
            }}>
              SwampScheduler
            </h1>
          </div>

          {/* Right side - Login Buttons */}
          <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <button style={{
                  background: 'transparent',
                  color: '#7dcea0',
                  padding: '8px 16px',
                  border: '1px solid #7dcea0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}>
                  Sign Up
                </button>
                
                <button style={{
                  background: 'linear-gradient(135deg, #6B7B47, #7dcea0)',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}>
                  Login
                </button>
              </div>
            </div>
          </header>

      {/* Simple Draft of Homepage Content */}
      <main style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        minHeight: '100vh'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <h2 style={{
            fontSize: '60px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#7dcea0'
          }}>
            Welcome!
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#78716c',
            marginBottom: '32px'
          }}>
            A smart task planner for busy Gators!
          </p>
          
          <button 
            onClick={() => setCurrentPage('tasks')}  //nav to tasks page
            style={{
              background: 'linear-gradient(135deg, #6B7B47, #7dcea0)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
            }}>
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;

