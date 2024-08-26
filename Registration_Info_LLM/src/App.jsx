import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import MainContent from './components/MainContent.jsx';
import Chatbot from './components/Chatbot.jsx';
import './App.css';

function App() {
  const [showChatbot, setShowChatbot] = useState(false);

  const handleSignInSuccess = () => {
    // Additional actions on successful sign-in
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
        <div className={`right-section ${showChatbot ? 'chatbot-visible' : ''}`}>
          {showChatbot && <Chatbot />}
        </div>
      </div>
    </div>
  );
}

export default App;
