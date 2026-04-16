// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import './Login.css';

// eslint-disable-next-line react/prop-types
const Login = ({ onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous error messages

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        alert('Login successful');
        onLoginSuccess(); // Trigger the login success callback to show the Chatbot
        onClose();  // Close the login modal
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('Failed to login. Please try again later.');
    }
  };

  return (
    <div className="login-modal">
      <div className="login-content">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button">Login</button>
        </form>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default Login;
