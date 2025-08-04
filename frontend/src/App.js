import React, {useState, useEffect} from 'react';
import api from './services/api';
import GameNotification from './components/GameNotification';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { Tasks} from './pages/Tasks';
import { Dashboard } from './pages/Dashboard';
import { SharedBoards } from './pages/SharedBoards';
import Profile from './pages/Profile';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [tasks, setTasks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [previousLevel, setPreviousLevel] = useState(null);
  const [xpData, setXpData] = useState(null);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '',
    completed: false,
    create_date: new Date().toISOString()
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setIsAuthenticated(true);
      const savedPage = localStorage.getItem('currentPage');
      if (savedPage && savedPage !== 'login' && savedPage !== 'signup') {
        setCurrentPage(savedPage);
      } else {
        setCurrentPage('dashboard'); 
      }
    }
  }, []);
  
  useEffect(() => {
    if (currentPage !== 'home') {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage]);

  const toggleComplete = (taskIndex) => {
    const task = tasks[taskIndex];
    if (!task) return;

    const updatedTasks = tasks.map((t, index) =>
      index === taskIndex ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);

    api.post(`/tasks/${task.id}/complete`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }).then(response => {
      if (response.data.xp_awarded) {
        setNotificationQueue(prev => [...prev, {
          type: 'xp',
          xp_amount: response.data.xp_awarded,
          reason: 'Task completed!'
        }]);
        
        fetchXPData();
        
        setTimeout(() => {
          setStatsRefreshTrigger(prev => prev + 1);
        }, 100);
      }
      
      if (response.data.achievements_earned) {
        const achievementNotifications = response.data.achievements_earned.map(achievement => ({
          type: 'achievement',
          ...achievement
        }));
        setNotificationQueue(prev => [...prev, ...achievementNotifications]);
      }
    }).catch(error => {
      console.error('Failed to sync task completion:', error);
      setTasks(tasks);
    });
  };

  const fetchXPData = async () => {
    try {
      const response = await api.get('/xp', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const newXpData = response.data;
      setXpData(newXpData);
      
      const currentLevel = newXpData.level;
      
      if (previousLevel !== null && currentLevel > previousLevel) {
        setNotificationQueue(prev => [...prev, {
          type: 'levelup',
          level: currentLevel,
          level_name: newXpData.level_name
        }]);
      }
      
      setPreviousLevel(currentLevel);
    } catch (error) {
      console.error('Failed to check level:', error);
    }
  };

  //Fetch tasks from backend
  const fetchTasks = async() => {
    try{
        const response = await api.get('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
        });
    setTasks(response.data.tasks || []);
    } 
    catch (error) {
      console.error('Error fetching task(s): ', error)
    }
  };

useEffect(() => {
  if (isAuthenticated && !initialLoadComplete) {
    fetchTasks();
    fetchXPData();
    setInitialLoadComplete(true);
  } else if (isAuthenticated) {
    fetchTasks();
    fetchXPData();
  }
}, [isAuthenticated, initialLoadComplete]);

useEffect(() => {
  if (notificationQueue.length > 0 && !currentNotification) {
    setCurrentNotification(notificationQueue[0]);
    setNotificationQueue(prev => prev.slice(1));
  }
}, [notificationQueue, currentNotification]);

const addTask = async () => {
  if (newTask.title.trim() !== '') {
    try {
      const response = await api.post('http://localhost:5000/api/tasks', {
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.dueDate,
        priority: newTask.priority,
        create_date: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      await fetchTasks();
      setTasks([...tasks, response.data.task]); 
      setNewTask({  
        title: '',
        description: '',
        dueDate: '',
        priority: ''
      });
    } 
    catch (error) {
      console.error('Error creating task:', error);
    }
  }
};

  let pageContent;
  
  if (currentPage === 'home') {
    pageContent = <Home setCurrentPage={setCurrentPage} />;
  }
  else if (currentPage === 'dashboard') {
    if (!isAuthenticated) {
      pageContent = <Home setCurrentPage={setCurrentPage} />;
    } else {
      pageContent = (
        <Dashboard
          tasks={tasks}
          newTask={newTask}
          setNewTask={setNewTask}
          addTask={addTask}
          setCurrentPage={setCurrentPage}
          setIsAuthenticated={setIsAuthenticated}
          toggleComplete={toggleComplete}
          xpData={xpData}
          refreshXP={fetchXPData}
          setNotificationQueue={setNotificationQueue}
          statsRefreshTrigger={statsRefreshTrigger}
        />
      );
    }
  }
  else if (currentPage === 'login') {
    pageContent = (
      <Login 
        setCurrentPage={setCurrentPage} 
        setIsAuthenticated={setIsAuthenticated}
        setTasks={setTasks}
      />
    );
  }
  else if (currentPage === 'signup') {
    pageContent = (
      <Signup 
        setCurrentPage={setCurrentPage}
        setIsAuthenticated={setIsAuthenticated}
      />
    );
  }
  else if (currentPage === 'tasks') {
    if (!isAuthenticated) {
      pageContent = <Home setCurrentPage={setCurrentPage} />;
    } else {
      pageContent = (
        <Tasks
          tasks={tasks}
          newTask={newTask}
          setTasks={setTasks}
          setNewTask={setNewTask}
          addTask={addTask}
          setCurrentPage={setCurrentPage}
          toggleComplete={toggleComplete}
        />
      );
    }
  }
  else if (currentPage === 'sharedboards') {
    if (!isAuthenticated) {
      pageContent = <Home setCurrentPage={setCurrentPage} />;
    } else {
      pageContent = (
        <SharedBoards 
          setCurrentPage={setCurrentPage}
        />
      );
    }
  }
  else if (currentPage === 'profile') {
    if (!isAuthenticated) {
      pageContent = <Home setCurrentPage={setCurrentPage} />;
    } else {
      pageContent = (
        <Profile
          setCurrentPage={setCurrentPage}
          xpData={xpData}
          statsRefreshTrigger={statsRefreshTrigger}
        />
      );
    }
  }
  else {
    pageContent = <div>Page not found</div>;
  }

  return (
    <>
      {pageContent}
      {/* Game Notification - shows on all pages */}
      {currentNotification && (
        <GameNotification
          notification={currentNotification}
          onClose={() => setCurrentNotification(null)}
        />
      )}
    </>
  );
}

export default App;
