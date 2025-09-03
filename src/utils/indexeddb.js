import { openDB } from "idb";

// Initialize or open IndexedDB
export const initDB = async () => {
  return openDB("childHealthDB", 2, {
    upgrade(db) {
      console.log("🔧 IndexedDB upgrade triggered");
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "nationalId" });
        console.log("✅ 'users' store created");
      }
    },
  });
};

// Add user locally (offline)
export const addUser = async (user) => {
  try {
    const db = await initDB();
    await db.put("users", user);
    console.log("💾 User saved locally:", user);
  } catch (err) {
    console.error("❌ Failed to save user to IndexedDB:", err);
  }
};

// Get all unsynced users
export const getAllUsers = async () => {
  try {
    const db = await initDB();
    const users = await db.getAll("users");
    console.log("📥 Retrieved users from IndexedDB:", users);
    return users;
  } catch (err) {
    console.error("❌ Failed to retrieve users:", err);
    return [];
  }
};

// Clear all users after successful sync
export const clearUsers = async () => {
  try {
    const db = await initDB();
    await db.clear("users");
    console.log("🧹 Cleared IndexedDB users after sync");
  } catch (err) {
    console.error("❌ Failed to clear users:", err);
  }
};

// Sync users to backend when online
export const syncUsers = async () => {
  if (!navigator.onLine) {
    console.log("📴 Offline — sync skipped");
    return;
  }

  const users = await getAllUsers();
  if (users.length === 0) {
    console.log("📭 No users to sync");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/sync-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users }),
    });

    if (response.ok) {
      await clearUsers();
      console.log("✅ Synced all offline users to MongoDB");
    } else {
      console.error("❌ Server responded with error:", await response.text());
    }
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
};

// Automatically sync when back online
window.addEventListener("online", () => {
  console.log("🌐 Back online — attempting sync...");
  syncUsers();
});