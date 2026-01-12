import React, { useState } from 'react';
import './Dashboard.css';
import Profile from './Profile';

const Dashboard = ({ token, email }) => {
  const [currentView, setCurrentView] = useState('main');
  const [coins, setCoins] = useState([]);
  const [newCoin, setNewCoin] = useState('');
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Research BTC halving', completed: false },
    { id: 2, title: 'Set price alerts', completed: true }
  ]);
  const [newTask, setNewTask] = useState({ title: '', completed: false });
  const [editingTask, setEditingTask] = useState(null);
  const userName = "Demo User"; // Linked to profile

  // TASKS CRUD
  const createTask = () => {
    if (!newTask.title.trim()) return;
    const task = { ...newTask, id: Date.now(), completed: false };
    setTasks([task, ...tasks]);
    setNewTask({ title: '', completed: false });
  };

  const updateTask = (updatedTask) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setEditingTask(null);
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // COINS OPERATIONS
  const addCoin = () => {
    if (newCoin && !coins.includes(newCoin.toUpperCase())) {
      const coin = newCoin.toUpperCase();
      setCoins([...coins, coin]);
      setNewCoin('');
    }
  };

  const removeCoin = (coinToRemove) => {
    setCoins(coins.filter(coin => coin !== coinToRemove));
  };

  // PROFILE PAGE RENDER
  if (currentView === 'profile') {
    return (
      <Profile 
        token={token} 
        email={email}
        userName={userName}
        onBack={() => setCurrentView('main')} 
      />
    );
  }

  return (
    <div className="dashboard-container">
      {/* HEADER*/}
      <div className="dashboard-header">
        <div className="logo">
          <div className="bitcoin-symbol">₿</div>
          <h1>Crypto Watchlist</h1>
        </div>
        <div className="user-info">
          {/* LINK TO PROFILE */}
          <div 
            className="user-avatar clickable-avatar"
            onClick={() => setCurrentView('profile')}
            title="View Profile"
          >
            {userName[0]}
          </div>
          <span className="user-email">{email || 'Demo User'}</span>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{tasks.filter(t => !t.completed).length}</div>
          <div>Pending Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{coins.length}</div>
          <div>Watchlist</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">$12,450</div>
          <div>Portfolio</div>
        </div>
      </div>

      {/* TASKS CRUD */}
      <div className="tasks-section">
        <h2>Tasks 
          <span className="count">({tasks.filter(t => !t.completed).length})</span>
        </h2>
        
        <div className="task-input-group">
          <input
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            placeholder="Add new task..."
            className="task-input"
            onKeyPress={(e) => e.key === 'Enter' && createTask()}
          />
          <button onClick={createTask} className="add-task-btn">Add Task</button>
        </div>

        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => updateTask({...task, completed: e.target.checked})}
              />
              {editingTask?.id === task.id ? (
                <input
                  value={task.title}
                  onChange={(e) => updateTask({...task, title: e.target.value})}
                  className="task-edit-input"
                  autoFocus
                  onBlur={() => setEditingTask(null)}
                  onKeyPress={(e) => e.key === 'Enter' && setEditingTask(null)}
                />
              ) : (
                <span onDoubleClick={() => setEditingTask(task)}>{task.title}</span>
              )}
              <button 
                onClick={() => deleteTask(task.id)}
                className="delete-task-btn"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* COINS WATCHLIST */}
      <div className="add-section">
        <h2>Add Coin</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter coin symbol (BTC, ETH...)"
            value={newCoin}
            onChange={(e) => setNewCoin(e.target.value)}
            className="coin-input"
            onKeyPress={(e) => e.key === 'Enter' && addCoin()}
          />
          <button onClick={addCoin} className="add-btn">Add Coin</button>
        </div>
      </div>

      <div className="watchlist-section">
        <h2>Your Watchlist 
          <span className="count">({coins.length})</span>
        </h2>
        {coins.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <h3>Your watchlist is empty</h3>
            <p>Add your first coin to get started!</p>
          </div>
        ) : (
          <div className="coins-grid">
            {coins.map(coin => (
              <div key={coin} className="coin-card">
                <span>{coin}</span>
                <button 
                  className="remove" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCoin(coin);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
