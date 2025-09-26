import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "./middleware/auth.js";

dotenv.config();
const app = express();

// ✅ CORS setup
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Increase JSON payload limit (important for Base64 photos)
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ limit: "3mb", extended: true }));

// ✅ Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===================
// ✅ User schema
// ===================
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdult: { type: Boolean, required: true },
  nationalId: { type: String, required: true, unique: true },
});
const User = mongoose.model("User", userSchema, "users");

// ✅ Signup route
app.post("/signup", async (req, res) => {
  const { fullName, email, password, isAdult, nationalId } = req.body;
  if (
    !fullName ||
    !email ||
    !password ||
    isAdult === undefined ||
    !nationalId
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create and save the user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      isAdult,
      nationalId,
    });
    await newUser.save();

    // ✅ Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // ✅ Return token and user ID
    res.status(201).json({
      message: "User created successfully",
      token,
      userId: newUser._id,
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Server Error", error: err });
  }
});

// ✅ Login route
app.post("/login", async (req, res) => {
  const { nationalId, password } = req.body;
  if (!nationalId || !password) {
    return res
      .status(400)
      .json({ message: "National ID and password are required" });
  }
  try {
    const user = await User.findOne({ nationalId });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid National ID or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid National ID or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server Error", error: err });
  }
});
// ✅ Get user profile by MongoDB _id
app.get("/user/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID in token" });
    }

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


// ✅ Sync users from IndexedDB
app.post("/sync-users", async (req, res) => {
  console.log("📡 Received POST /sync-users");
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: "No users to sync" });
  }

  try {
    
    const hashedUsers = await Promise.all(users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return { ...user, password: hashedPassword };
    }));

    await User.insertMany(hashedUsers, { ordered: false }); // skips duplicates
    res.status(200).json({ message: 'Users synced successfully' });

  } catch (err) {
    console.error("❌ Sync error:", err);
    res.status(500).json({ message: "Sync failed", error: err });
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
    details: { type: String },
  },
  history: [
    {
      id: String,
      height: Number,
      weight: Number,
      illnesses: String,
      malnutrition: String,
      date: Date,
    },
  ],
  photo: { type: String }, // Base64 photo
  consent: { type: Boolean, required: true },
  geo: { city: String, country: String },
  createdAt: { type: Date, default: Date.now },
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

// ✅ Add health record to existing child
app.put("/add-record/:childId", async (req, res) => {
  try {
    const { childId } = req.params;
    const record = req.body;

    console.log("📥 Incoming record:", record);
    console.log("🔍 Looking for child:", childId);

    const child = await Child.findOne({ child_id: childId });
    if (!child) {
      console.warn("⚠️ No child found for ID:", childId);
      return res.status(404).json({ message: "Child not found" });
    }

    child.history.push(record);
    await child.save();

    console.log("✅ Record added to child:", child.child_id);
    res.json(child);
  } catch (err) {
    console.error("❌ Error in /add-record:", err);
    res
      .status(500)
      .json({ message: "Failed to add record", error: err.message });
  }
});

// ✅ Add new record to a child's history with logging
app.put("/add-record/:childId", async (req, res) => {
  try {
    const { childId } = req.params;
    const record = req.body;

    console.log("📥 Incoming record:", record);
    console.log("🔍 Looking for child:", childId);

    const child = await Child.findOne({ child_id: childId });
    if (!child) {
      console.warn("⚠️ No child found for ID:", childId);
      return res.status(404).json({ message: "Child not found" });
    }

    child.history.push(record);
    await child.save();

    console.log("✅ Record added to child:", child.child_id);
    res.json(child);
  } catch (err) {
    console.error("❌ Error in /add-record:", err);
    res
      .status(500)
      .json({ message: "Failed to add record", error: err.message });
  }
});

// ✅ Delete a child by unique ID
app.delete("/child/:childId", async (req, res) => {
  try {
    const { childId } = req.params;
    const child = await Child.findOneAndDelete({ child_id: childId });

    if (!child) {
      return res
        .status(200)
        .json({ message: `Child ${childId} already deleted` });
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
app.get("/ping", (req, res) => res.send("pong"));

// ✅ Start server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
