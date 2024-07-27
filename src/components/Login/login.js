import React, { useState } from 'react';
import axios from 'axios';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.token) {
        // Handle successful login (e.g., store token, redirect user)
        localStorage.setItem('token', response.data.token);
        setSuccess('Login successful!');
        setError('');
        // Redirect or navigate to another page
        window.location.href = '/dashboard'; // Example redirection
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
      setSuccess('');
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <div className="header-title">TODO</div>
        <nav className="login-nav">
          <button className="nav-button active">Login</button>
          <button className="nav-button">Signup</button>
        </nav>
      </header>
      <div className="login-form-container">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="login-footer">
          <p>Don't have an account? <a href="signup">Signup</a></p>
          <button className="google-login">Login with Google</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
