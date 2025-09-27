import { openDB } from "idb";

// Initialize or open IndexedDB
export const initDB = async () => {
  return openDB("childHealthDB", 3, {
    upgrade(db) {
      console.log("🔧 IndexedDB upgrade triggered");

      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "nationalId" });
        console.log("✅ 'users' store created");
      }

      if (!db.objectStoreNames.contains("children")) {
        db.createObjectStore("children", { keyPath: "child_id" });
        console.log("✅ 'children' store created");
      }
    },
  });
};

// 💾 Save user locally
export const addUser = async (user) => {
  try {
    const db = await initDB();
    await db.put("users", user);
    console.log("💾 User saved locally:", user);
  } catch (err) {
    console.error("❌ Failed to save user:", err);
  }
};

// 📥 Get all users
export const getAllUsers = async () => {
  try {
    const db = await initDB();
    const users = await db.getAll("users");
    console.log("📥 Retrieved users:", users);
    return users;
  } catch (err) {
    console.error("❌ Failed to retrieve users:", err);
    return [];
  }
};

// 🧹 Clear users after sync
export const clearUsers = async () => {
  try {
    const db = await initDB();
    await db.clear("users");
    console.log("🧹 Cleared users");
  } catch (err) {
    console.error("❌ Failed to clear users:", err);
  }
};

// 🔄 Sync users to backend
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
      console.log("✅ Synced users to MongoDB");
    } else {
      console.error("❌ Server error:", await response.text());
    }
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
};

// 👶 Save child locally
export const addChild = async (child) => {
  try {
    const db = await initDB();
    const childToSave = {
      ...child,
      child_id: child.child_id || child.id || child._id || "unknown_id",
      synced: false // ✅ mark child as unsynced for offline tracking
    };
    await db.put("children", childToSave);
    console.log("💾 Child saved locally:", childToSave);
  } catch (err) {
    console.error("❌ Failed to save child:", err);
  }
};

// 🔍 Get child by ID
export const getChildById = async (childId) => {
  try {
    const db = await initDB();
    const tx = db.transaction("children", "readonly");
    const store = tx.objectStore("children");
    const normalizedId = String(childId).trim();
    const result = await store.get(normalizedId);
    await tx.done;
    console.log("📦 Retrieved child:", result);
    return result;
  } catch (err) {
    console.error("❌ Failed to retrieve child:", err);
    return null;
  }
};

// 📝 Add a new progress record to a child
export const addRecordToChild = async (childId, newRecord) => {
  try {
    const db = await initDB();
    const tx = db.transaction("children", "readwrite");
    const store = tx.objectStore("children");

    const normalizedId = String(childId).trim();
    const child = await store.get(normalizedId);
    if (!child) throw new Error("Child not found in IndexedDB");

    const updatedHistory = Array.isArray(child.history)
      ? [...child.history, newRecord]
      : [newRecord];

    const updatedChild = { ...child, history: updatedHistory };
    await store.put(updatedChild);
    await tx.done;

    console.log("📈 Added record to child:", newRecord);
  } catch (err) {
    console.error("❌ Failed to add record to child:", err);
  }
};

// 📥 Get all children
export const getAllChildren = async () => {
  try {
    const db = await initDB();
    const children = await db.getAll("children");
    console.log("📥 Retrieved all children:", children);
    return children;
  } catch (err) {
    console.error("❌ Failed to retrieve children:", err);
    return [];
  }
};

// 🧹 Clear children if needed
export const clearChildren = async () => {
  try {
    const db = await initDB();
    await db.clear("children");
    console.log("🧹 Cleared children");
  } catch (err) {
    console.error("❌ Failed to clear children:", err);
  }
};

// 🔄Sync children to backend
export const syncChildren = async () => {
  if (!navigator.onLine) {
    console.log("📴 Offline — child sync skipped");
    return;
  }

  const children = await getAllChildren();
  const unsynced = children.filter((c) => !c.synced);

  if (unsynced.length === 0) {
    console.log("📭 No unsynced children to sync");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/sync-children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ children: unsynced }),
    });

    if (response.ok) {
      const db = await initDB();
      const tx = db.transaction("children", "readwrite");
      const store = tx.objectStore("children");

      for (const child of unsynced) {
        await store.put({ ...child, synced: true }); // ✅ mark as synced
      }

      await tx.done;
      console.log("✅ Synced unsynced children to MongoDB");
    }
  } catch (err) {
    console.error("❌ Child sync failed:", err);
  }
};

// 🌐 Auto-sync users and children when online
window.addEventListener("online", () => {
  console.log("🌐 Back online — syncing users and children...");
  syncUsers();
  syncChildren();
});