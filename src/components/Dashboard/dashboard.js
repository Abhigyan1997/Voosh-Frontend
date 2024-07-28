import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'; // Corrected import
import TaskModal from '../modal/task';
import './dashboard.css';
import { AppBar, Toolbar, Typography, IconButton, Button, Box, TextField, MenuItem } from '@mui/material';
import { Logout, Login, HowToReg } from '@mui/icons-material';

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
                <Button variant="contained" onClick={() => openModal(task)}>Edit</Button>
                <Button variant="contained" color="error" onClick={() => deleteTask(task._id)}>Delete</Button>
                <Button variant="contained" onClick={() => openModal(task)}>View Details</Button>
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
        <Box ref={ref} className="task-column" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{status}</Typography>
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
        </Box>
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
                const response = await axios.get('http://13.233.158.103/api/tasks', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Cache-Control': 'no-cache', // Add this to prevent caching
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

    const openModal = (task = null) => {
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
                await axios.put(`http://13.233.158.103/api/tasks/${currentTask._id}`, task, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setTasks(tasks.map((t) => (t._id === currentTask._id ? { ...t, ...task } : t)));
            } else {
                const response = await axios.post('http://13.233.158.103/api/tasks', { ...task, status: 'TODO', createdAt: new Date().toISOString() }, {
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
            await axios.delete(`http://13.233.158.103/api/tasks/${id}`, {
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
            await axios.put(`http://13.233.158.103/api/tasks/${taskId}`, { status: targetStatus }, {
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
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Task Manager
                        </Typography>
                        <IconButton
                            color="inherit"
                            onClick={() => window.location.href = '/'}
                            className="login" // Add this class
                        >
                            <Login />
                        </IconButton>
                        <IconButton
                            color="inherit"
                            onClick={() => window.location.href = '/'}
                            className="signup" // Add this class if needed
                        >
                            <HowToReg />
                        </IconButton>
                        <IconButton
                            color="inherit"
                            onClick={handleLogout}
                            className="logout" // Add this class
                        >
                            <Logout />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <div className="task-board">
                    <Button variant="contained" color="primary" onClick={() => openModal()} sx={{ mb: 2 }}>
                        Add Task
                    </Button>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <TextField
                            label="Search"
                            variant="outlined"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            sx={{ width: '45%' }}
                        />
                        <TextField
                            select
                            label="Sort By"
                            value={sortBy}
                            onChange={handleSortChange}
                            sx={{ width: '45%' }}
                        >
                            <MenuItem value="recent">Recent</MenuItem>
                            <MenuItem value="oldest">Oldest</MenuItem>
                        </TextField>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                    </Box>
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
