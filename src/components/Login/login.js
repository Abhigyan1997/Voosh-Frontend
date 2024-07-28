import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Alert, Link, AppBar, Toolbar, Card, CardContent, CardActions, InputAdornment, IconButton } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://13.233.158.103/api/users/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setSuccess('Login successful!');
        setError('');
        navigate('/dashboard'); // Example redirection
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
      setSuccess('');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://13.233.158.103/auth/google';
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#fff' }}>
            TODO
          </Typography>
          <Button color="inherit" variant="outlined" sx={{ color: '#fff', borderColor: '#fff' }} onClick={() => navigate('/signup')}>
            Signup
          </Button>
          <Button color="inherit" sx={{ color: '#fff' }} onClick={() => navigate('/login')}>
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <Card sx={{ mt: 5, borderRadius: 3, boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <CardActions sx={{ mt: 2, justifyContent: 'center' }}>
              <Button type="submit" variant="contained" color="primary" size="large" sx={{ px: 4, py: 1 }}>
                Login
              </Button>
            </CardActions>
          </form>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </CardContent>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography>
            Don't have an account? <Link href="/signup">Signup</Link>
          </Typography>
          <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 1 }} onClick={handleGoogleLogin}>
            Login with Google
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
