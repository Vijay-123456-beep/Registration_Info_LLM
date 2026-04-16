const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true }
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).send({ message: 'All fields are required' });
    }

    // Hash password securely with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();
    res.status(201).send({ message: 'User signed up successfully' });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.username) res.status(400).send({ message: 'Username already exists' });
      else if (error.keyPattern.email) res.status(400).send({ message: 'Email already exists' });
    } else res.status(500).send({ message: 'Server error' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send({ message: 'Both username and password are required' });
    const user = await User.findOne({ username });

    // Secure password comparison using bcryptjs
    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).send({ message: 'Login successful', username: user.username });
    } else {
      res.status(401).send({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
});

// Chatbot Query Route - PROXY TO COLAB LLM
app.post('/query', async (req, res) => {
  const { query } = req.body;
  const COLAB_URL = process.env.COLAB_URL;

  console.log(`Forwarding query to Colab: "${query}"`);

  try {
    let targetUrl = COLAB_URL;
    if (!targetUrl.endsWith('/query')) {
      targetUrl = targetUrl.replace(/\/$/, '') + '/query';
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`Colab API responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).send({ response: data.response });
  } catch (error) {
    console.error('Error proxying to Colab:', error.message);
    res.status(500).send({ response: "Error: Unable to reach the LLM server. Please ensure your Google Colab notebook is running." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  console.log(`Proxying chatbot queries to: ${process.env.COLAB_URL}`);
});
