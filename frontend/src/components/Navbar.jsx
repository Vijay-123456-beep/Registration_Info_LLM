// Navbar.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import './Navbar.css';
import SignIn from './SignIn';
import Login from './Login';
import Feedback from './Feedback';

// eslint-disable-next-line react/prop-types
const Navbar = ({ onSignInSuccess, onLoginSuccess, onModalStateChange }) => {
  const [activeModal, setActiveModal] = useState(null); // State to track which modal is open (SignIn, Login, Feedback)

  const handleModalOpen = (modalType) => {
    setActiveModal(modalType);
    onModalStateChange(true); // Enable overlay
  };

  const handleModalClose = () => {
    setActiveModal(null);
    onModalStateChange(false); // Disable overlay
  };

  return (
    <>
      <nav className="navbar">
        <img src="/src/components/img/logo.png" alt="Logo" className="logo" />
        <h1 className="website-name">Registration Info LLM</h1>
        <div className="nav-buttons">
          <button className="nav-button" onClick={() => handleModalOpen('feedback')}>Feedback</button>
          <button className="nav-button">About Us</button>
          <button className="nav-button signin-button" onClick={() => handleModalOpen('signin')}>Sign In</button>
          <button className="nav-button login-button" onClick={() => handleModalOpen('login')}>Log In</button>
        </div>
      </nav>

      {activeModal === 'signin' && (
        <SignIn onClose={handleModalClose} onSignInSuccess={onSignInSuccess} />
      )}
      {activeModal === 'login' && (
        <Login onClose={handleModalClose} onLoginSuccess={onLoginSuccess} />
      )}
      {activeModal === 'feedback' && (
        <Feedback onClose={handleModalClose} />
      )}
    </>
  );
};

export default Navbar;
