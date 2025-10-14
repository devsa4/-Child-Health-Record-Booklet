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

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User schema
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
  if (!fullName || !email || !password || isAdult === undefined || !nationalId) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      isAdult,
      nationalId,
    });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

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
    return res.status(400).json({ message: "National ID and password are required" });
  }
  try {
    const user = await User.findOne({ nationalId });
    if (!user) {
      return res.status(401).json({ message: "Invalid National ID or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid National ID or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
    message: "Login successful",
    token,
    userId: user.nationalId, // ✅ use nationalId for consistency
    fullName: user.fullName,
    passwordHash: user.password, // ✅ send bcrypt hash for offline login
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

app.get("/users", async (_req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Preload all users for offline login
app.get("/all-users", async (_req, res) => {
  try {
    const users = await User.find({}, "nationalId password fullName").lean();
    res.json({ users });
  } catch (err) {
    console.error("❌ Failed to fetch all users:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Sync users from IndexedDB
app.post("/sync-users", async (req, res) => {
  const { users } = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ success: false, message: "No users to sync" });
  }

  try {
    const existingIds = await User.find({
      nationalId: { $in: users.map(u => u.nationalId) }
    }).distinct("nationalId");

    console.log("⏭️ Skipped duplicate users:", existingIds);

    const newUsers = users.filter(u => {
      return (
        u.nationalId &&
        u.fullName &&
        u.password &&
        typeof u.isAdult === "boolean" &&
        u.email
      ) && !existingIds.includes(u.nationalId);
    });

    if (newUsers.length === 0) {
      return res.status(200).json({ success: true, message: "No new users to insert" });
    }

    const inserted = await User.insertMany(newUsers, { ordered: false });
    console.log("✅ Inserted users:", inserted.map(u => u.nationalId));

    res.status(200).json({
      success: true,
      message: "Users synced successfully",
      inserted: inserted.length,
    });
  } catch (err) {
    console.error("❌ Sync error:", err);
    res.status(500).json({ success: false, message: "Sync failed", error: err.message });
  }
});

// Child schema
const childSchema = new mongoose.Schema({
  child_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  guardian: { type: String },
  weight: { type: Number },
  height: { type: Number },
  illnesses: { type: [String] },
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
  photo: { type: String },
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
  console.log("📡 Connected to DB:", mongoose.connection.name);
  const items = await Child.find().sort({ createdAt: -1 }).lean();
  console.log("📤 Returning children:", items.length);
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

    // Ensure history is initialized
    const updatedHistory = Array.isArray(child.history)
      ? [...child.history, record]
      : [record];

    const result = await Child.updateOne(
      { child_id: childId },
      { $set: { history: updatedHistory } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("MongoDB update failed");
    }

    const updatedChild = await Child.findOne({ child_id: childId });
    console.log("✅ Record added to child:", updatedChild.child_id);
    res.json(updatedChild);
  } catch (err) {
    console.error("❌ Error in /add-record:", err);
    res.status(500).json({ message: "Failed to add record", error: err.message });
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

// ✅ Sync children from IndexedDB
app.post("/sync-children", async (req, res) => {
  console.log("📡 Received POST /sync-children");
  const { children } = req.body;

  if (!Array.isArray(children) || children.length === 0) {
    return res.status(400).json({ message: "No children to sync" });
  }

  try {
    const results = [];

    for (const child of children) {
      const updated = await Child.updateOne(
        { child_id: child.child_id },
        { $set: child },
        { upsert: true }
      );
      results.push({ child_id: child.child_id, status: updated });
    }

    res.status(200).json({
      message: "Children synced successfully",
      synced: results.length,
      details: results,
    });
  } catch (err) {
    console.error("❌ Sync error:", err);
    res.status(500).json({ message: "Sync failed", error: err.message });
  }
});
// ✅ Health check
app.get("/ping", (req, res) => res.send("pong"));

// ✅ Start server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));