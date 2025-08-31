const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // body parser

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdult: { type: Boolean, required: true }
});

const User = mongoose.model('User', userSchema, 'users');

// Signup route
app.post('/signup', async (req, res) => {
  const { fullName, email, password, isAdult } = req.body;

  if (!fullName || !email || !password || isAdult === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newUser = new User({ fullName, email, password, isAdult });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ message: 'Server Error', error: err });
  }
});

// Start server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
