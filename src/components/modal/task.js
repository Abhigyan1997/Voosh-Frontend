import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './task.css';

const TaskModal = ({ isOpen, onRequestClose, task, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description });
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Task Modal"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>{task ? 'Edit Task' : 'Add Task'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        {task && (
          <div className="form-group">
            <p><strong>Created At:</strong> {task.createdAt.toLocaleString()}</p>
          </div>
        )}
        <button type="submit" className="save-button">
          Save
        </button>
        <button onClick={onRequestClose} className="close-button">
          Close
        </button>
      </form>
    </Modal>
  );
};

export default TaskModal;
