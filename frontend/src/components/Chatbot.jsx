// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chatbot.css";
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const LLM_URL = "http://localhost:5000/query";
  //const LLM_URL = "https://f495-183-82-51-10.ngrok-free.app/query";


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const newMessages = [...messages, { text: input, isUser: true }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        LLM_URL,
        { query: input }, // Updated key to match FastAPI backend
        { headers: { "Content-Type": "application/json" } }
      );

      const botResponse = response.data.response || "No response field in data.";

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botResponse, isUser: false },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Error: Unable to fetch response",
          isUser: false,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Chat with Us</div>
      <div className="chat-body" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.isUser ? "user-message" : "bot-message"}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {message.isUser ? (
              message.text
            ) : (
              <ReactMarkdown>{message.text}</ReactMarkdown>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="bot-message" style={{ fontStyle: "italic", opacity: 0.7 }}>
            Chatbot is typing...
          </div>
        )}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="chat-input"
          placeholder="Type a message..."
        />
        <button className="chat-send-button" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
