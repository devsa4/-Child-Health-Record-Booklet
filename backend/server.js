import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();
const app = express();

// ✅ CORS setup to handle preflight requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdult: { type: Boolean, required: true },
  nationalId: { type: String, required: true, unique: true }
});
const User = mongoose.model('User', userSchema, 'users');

// ✅ Signup route
app.post('/signup', async (req, res) => {
  const { fullName, email, password, isAdult, nationalId } = req.body;
  if (!fullName || !email || !password || isAdult === undefined || !nationalId) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const newUser = new User({ fullName, email, password, isAdult, nationalId });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Server Error', error: err });
  }
});

// ✅ Login route
app.post('/login', async (req, res) => {
  const { nationalId, password } = req.body;
  if (!nationalId || !password) {
    return res.status(400).json({ message: 'National ID and password are required' });
  }
  try {
    const user = await User.findOne({ nationalId, password });
    if (!user) return res.status(401).json({ message: 'Invalid National ID or password' });
    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server Error', error: err });
  }
});

// ✅ Sync users from IndexedDB
app.post('/sync-users', async (req, res) => {
  console.log("📡 Received POST /sync-users");
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: 'No users to sync' });
  }

  try {
    await User.insertMany(users, { ordered: false }); // skips duplicates
    console.log("✅ Synced users:", users.map(u => u.nationalId));
    res.status(200).json({ message: 'Users synced successfully' });
  } catch (err) {
    console.error('❌ Sync error:', err);
    res.status(500).json({ message: 'Sync failed', error: err });
  }
});

// ✅ Health check route (optional)
app.get('/ping', (req, res) => {
  res.send('pong');
});

// ✅ Start server
app.listen(5000, () => console.log('🚀 Server running on port 5000'));