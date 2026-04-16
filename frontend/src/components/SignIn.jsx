// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import './SignIn.css';

// eslint-disable-next-line react/prop-types
const SignIn = ({ onClose, onSignInSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      if (response.ok) {
        alert('Sign-up successful');
        onClose();
        onSignInSuccess();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to sign up');
    }
  };

  return (
    <div className="signin-modal">
      <div className="signin-content">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignIn}>
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
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button">Sign Up</button>
        </form>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default SignIn;
