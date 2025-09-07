import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();
const app = express();

// ✅ CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ===================
// ✅ User schema
// ===================
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
    const user = await User.findOne({ nationalId });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid National ID or password' });
    }
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

// ===================
// ✅ Child schema
// ===================
const childSchema = new mongoose.Schema({
  child_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  guardian: { type: String },
  weight: { type: Number },
  height: { type: Number },
  illnesses: { type: String },
  malnutrition: {
    hasSigns: { type: String, enum: ["yes", "no", ""], default: "" },
    details: { type: String }
  },
  history: [
    {
      height: Number,
      weight: Number,
      illnesses: String,
      malnutrition: String,
      date: Date
    }
  ],
  photo: { type: String },
  consent: { type: Boolean, required: true },
  geo: { city: String, country: String },
  createdAt: { type: Date, default: Date.now }
});
const Child = mongoose.model("Child", childSchema, "children");

// ✅ Create child record
app.post("/child", async (req, res) => {
  try {
    const child = new Child(req.body);
    await child.save();
    res.status(201).json({ message: "Child record saved successfully" });
  } catch (err) {
    console.error("❌ Child save error:", err);
    res.status(500).json({ message: "Server Error", error: err });
  }
});

// ✅ Get all children
app.get("/children", async (_req, res) => {
  const items = await Child.find().sort({ createdAt: -1 }).lean();
  res.json(items);
});

// ✅ Get child by unique ID
app.get("/child-by-unique-id/:uniqueId", async (req, res) => {
  try {
    const child = await Child.findOne({ child_id: req.params.uniqueId }).lean();
    if (!child) return res.status(404).json({ message: "Child not found" });
    res.json(child);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add new record to a child's history
app.put("/add-record/:childId", async (req, res) => {
  try {
    const { childId } = req.params;
    const record = req.body;

    const child = await Child.findOne({ child_id: childId });
    if (!child) return res.status(404).json({ message: "Child not found" });

    child.history.push(record);
    await child.save();

    res.json(child);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add record" });
  }
});

// ✅ Delete a child by unique ID
app.delete("/child/:childId", async (req, res) => {
  try {
    const { childId } = req.params;
    const child = await Child.findOneAndDelete({ child_id: childId });

    if (!child) {
      return res.status(200).json({ message: `Child ${childId} already deleted` });
    }

    res.status(200).json({ message: `Deleted child: ${childId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting child" });
  }
});

// ✅ Sync-users alias for bulk insert
app.post("/sync-users-children", async (req, res) => {
  try {
    const children = req.body;
    const saved = await Child.insertMany(children, { ordered: false });
    res.status(201).json({ message: "Children synced successfully", saved });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Health check
app.get('/ping', (req, res) => res.send('pong'));

// ✅ Start server
app.listen(5000, () => console.log('🚀 Server running on port 5000'));
