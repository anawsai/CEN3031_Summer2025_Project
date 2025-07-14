import React, {useState} from 'react';
import axios from 'axios';
//pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { Tasks} from './pages/Tasks';
import { Dashboard } from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [tasks, setTasks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '',
    completed: false,
    create_date: new Date().toISOString()
  });

  const toggleComplete = (taskIndex) => {
    const updatedTasks = tasks.map((task, index) =>
      index === taskIndex ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };


//handle adding a new task
const addTask = async () => {
  if (newTask.title.trim() !== '') {
    try {
      const response = await axios.post('http://localhost:5000/api/tasks', {
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.dueDate,
        priority: newTask.priority,
        create_date: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setTasks([...tasks, response.data.task]);  // Add task from server response
      setNewTask({  // Reset the form
        title: '',
        description: '',
        dueDate: '',
        priority: ''
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }
};


  //handle adding a new task
  // const addTask = () => {
  //   if (newTask.title.trim() !== '') {
      // setTasks([...tasks, { ...newTask, completed: false, create_date: new Date().toISOString()}]);
      // setNewTask({
      //   title: '',
      //   description: '',
      //   dueDate: '',
      //   priority: ''
      // });
  //   }
  // };

  //routing logic
  if (currentPage === 'home') {
    return <Home setCurrentPage={setCurrentPage} />;
  }
  if (currentPage === 'dashboard') {
    if (!isAuthenticated) { //if not authenticated, redirect to home (no url access)
      return <Home setCurrentPage={setCurrentPage} />;
    }

    return (
      <Dashboard
        tasks={tasks}
        newTask={newTask}
        setNewTask={setNewTask}
        addTask={addTask}
        setCurrentPage={setCurrentPage}
      />
    );
  }
  if (currentPage === 'login') {
    return <Login 
    setCurrentPage={setCurrentPage} 
    setIsAuthenticated={setIsAuthenticated}
    />;
  }
  if (currentPage === 'signup') {
    return <Signup 
    setCurrentPage={setCurrentPage}
    setIsAuthenticated={setIsAuthenticated}
     />;
  }
  if (currentPage === 'tasks') {
    if (!isAuthenticated) { //if not authenticated, redirect to home (no url access)
      return <Home setCurrentPage={setCurrentPage} />;
    }

    return (
      <Tasks
        tasks={tasks}
        newTask={newTask}
        setNewTask={setNewTask}
        addTask={addTask}
        setCurrentPage={setCurrentPage}
        toggleComplete={toggleComplete}
      />
    );
  }
  return <div>Page not found</div>; //if something goes wrong
}

export default App;
