// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);
  const LLM_URL = 'https://4100-34-125-123-20.ngrok-free.app/query';

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { text: input, isUser: true }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await axios.post(
        LLM_URL,
        { query: input },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const botResponse = response.data.answer;

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botResponse, isUser: false },
      ]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Error: Unable to fetch response', isUser: false, isError: true },
      ]);
    }
  };

  return (
    <div className="chat-container" ref={chatContainerRef}>
      <div className="chat-header">Chat with Us</div>
      <div className="chat-body">
        {messages.map((message, index) => (
          <div key={index} className={message.isUser ? 'user-message' : 'bot-message'}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="chat-input"
          placeholder="Type a message..."
        />
        <button className="chat-send-button" onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
