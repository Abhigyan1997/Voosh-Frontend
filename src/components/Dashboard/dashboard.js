import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'; // Corrected import
import TaskModal from '../modal/task';
import './dashboard.css';

// Function to convert UTC date to local date
const formatDateToLocal = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }); // Adjust the timeZone as needed
};

// Task Types
const ItemTypes = {
  TASK: 'task',
};

// TaskCard Component
const TaskCard = ({ task, index, moveTask, openModal, deleteTask }) => {
  const [, ref] = useDrag({
    type: ItemTypes.TASK,
    item: { id: task._id, index },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    hover: (item) => {
      if (item.index !== index) {
        moveTask(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="task-card"
    >
      <p>{task.title}</p>
      <p>{task.description}</p>
      <p>Created At: {task.createdAt}</p>
      <div className="task-buttons">
        <button onClick={() => openModal(task)}>Edit</button>
        <button className="delete-button" onClick={() => deleteTask(task._id)}>Delete</button>
        <button onClick={() => openModal(task)}>View Details</button>
      </div>
    </div>
  );
};

// TaskColumn Component
const TaskColumn = ({ status, tasks, moveTask, openModal, deleteTask }) => {
  const [, ref] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item) => moveTask(item.id, status),
  });

  return (
    <div ref={ref} className="task-column">
      <h2>{status}</h2>
      {tasks.map((task, index) => (
        <TaskCard
          key={task._id}
          task={task}
          index={index}
          moveTask={moveTask}
          openModal={openModal}
          deleteTask={deleteTask}
        />
      ))}
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSortChange = (e) => setSortBy(e.target.value);

  const openModal = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
  };

  const saveTask = async (task) => {
    try {
      if (currentTask) {
        await axios.put(`http://localhost:5000/api/tasks/${currentTask._id}`, task, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setTasks(tasks.map((t) => (t._id === currentTask._id ? { ...t, ...task } : t)));
      } else {
        const response = await axios.post('http://localhost:5000/api/tasks', { ...task, status: 'TODO', createdAt: new Date().toISOString() }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setTasks([...tasks, response.data]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const moveTask = async (taskId, targetStatus) => {
    const updatedTasks = tasks.map((task) => {
      if (task._id === taskId) {
        return { ...task, status: targetStatus };
      }
      return task;
    });

    setTasks(updatedTasks);

    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: targetStatus }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getColumnTasks = (status) => {
    const filteredTasks = tasks
      .filter((task) => task.status === status && task.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const sortedTasks = filteredTasks.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0; // Default no sorting
    });

    return sortedTasks.map((task) => ({
      ...task,
      createdAt: formatDateToLocal(task.createdAt),
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="header-title">Task Manager</h1>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </header>
        <div className="task-board">
          <button className="add-task-button" onClick={() => openModal(null)}>Add Task</button>
          <div className="search-sort">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <select value={sortBy} onChange={handleSortChange} className="sort-select">
              <option value="recent">Sort By: Recent</option>
              <option value="oldest">Sort By: Oldest</option>
            </select>
          </div>
          <div className="task-columns">
            {['TODO', 'IN PROGRESS', 'DONE'].map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={getColumnTasks(status)}
                moveTask={(taskId, targetStatus) => moveTask(taskId, targetStatus)}
                openModal={openModal}
                deleteTask={deleteTask}
              />
            ))}
          </div>
        </div>
        <TaskModal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          task={currentTask}
          onSave={saveTask}
        />
      </div>
    </DndProvider>
  );
};

export default Dashboard;
