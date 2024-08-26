// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import MainContent from './components/MainContent.jsx';
import Chatbot from './components/Chatbot.jsx';
import './App.css';

function App() {
  const [showChatbot, setShowChatbot] = useState(false);

  const handleSignInSuccess = () => {
    // Perform any additional actions upon successful sign-in here
  };

  const handleLoginSuccess = () => {
    setShowChatbot(true); // Show Chatbot after successful login
  };

  return (
    <div className="App">
      <Navbar onSignInSuccess={handleSignInSuccess} onLoginSuccess={handleLoginSuccess} />
      <div className="content-container">
        <div className="left-section">
          <MainContent />
        </div>
        <div className="right-section">
          {showChatbot && <Chatbot />}
        </div>
      </div>
    </div>
  );
}

export default App;
