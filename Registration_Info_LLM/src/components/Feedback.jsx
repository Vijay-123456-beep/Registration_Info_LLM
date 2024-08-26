// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import './Feedback.css';

// eslint-disable-next-line react/prop-types
const Feedback = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim() === '') return;

    // Here, you can handle the submission of the feedback, e.g., sending it to the server.
    console.log('Feedback submitted:', feedback);

    setSubmitted(true);
    setFeedback(''); // Clear the feedback form
  };

  return (
    <div className="feedback-modal">
      <div className="feedback-content">
        <h2>Give Us Your Feedback</h2>
        {submitted ? (
          <p>Thank you for your feedback!</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here..."
              required
            />
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
        )}
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default Feedback;
