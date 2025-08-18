// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import MainContent from './components/MainContent.jsx';
import Chatbot from './components/Chatbot.jsx';
import './App.css';

function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const handleSignInSuccess = () => {
    // Additional actions on successful sign-in
  };

  const handleLoginSuccess = () => {
    setShowChatbot(true); // Show Chatbot after successful login
  };

  const handleModalStateChange = (state) => {
    setIsModalOpen(state); // Function to update modal state
  };

  return (
    <div className={`App ${isModalOpen ? 'modal-open' : ''}`}> 
      <Navbar 
        onSignInSuccess={handleSignInSuccess} 
        onLoginSuccess={handleLoginSuccess} 
        onModalStateChange={handleModalStateChange} // Pass this function as a prop
      />
      <div className="content-container">
        <MainContent />
        {showChatbot && <Chatbot />}
      </div>
    </div>
  );
}


export default App;
