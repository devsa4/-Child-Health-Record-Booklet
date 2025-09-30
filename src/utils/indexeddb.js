import { openDB } from "idb";
import { toast } from "react-toastify";
// Initialize or open IndexedDB
export const initDB = async () => {
  return openDB("childHealthDB", 6, {
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
      synced: child.synced ?? false // ✅ THIS LINE IS THE FIX
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
export const addRecordToChild = async (childId, record) => {
  try {
    console.log("📥 Saving record offline:", record);

    const db = await openDB("childHealthDB", 6);
    const tx = db.transaction("children", "readwrite");
    const store = tx.objectStore("children");

    let child = await store.get(childId);
    console.log("📦 Retrieved child:", child);

    if (!child) {
      console.warn("⚠️ Child not found — creating placeholder");

      child = {
        child_id: childId,
        name: "Unknown",
        age: 0,
        gender: "",
        consent: false,
        history: [record],
        synced: false,
        createdAt: new Date().toISOString()
      };

      await store.put(child);
      console.log("✅ New child created with record");
    } else {
      const updatedHistory = [...(child.history || []), record];
      const updatedChild = {
        ...child,
        history: updatedHistory,
        synced: false
      };

      await store.put(updatedChild);
      console.log("✅ Record appended to existing child");
    }

    await tx.done;
  } catch (err) {
    console.error("❌ Failed to save record offline:", err);
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

export const bulkPutUsers = async (users) => {
  try {
    const db = await initDB();
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");
    users.forEach(user => store.put(user));
    await tx.done;
    console.log("✅ Bulk users saved to IndexedDB:", users.length);
  } catch (err) {
    console.error("❌ Failed bulk saving users:", err);
  }
};

export const bulkPutChildren = async (children) => {
  try {
    const db = await initDB();
    const tx = db.transaction("children", "readwrite");
    const store = tx.objectStore("children");

    for (const child of children) {
      const existing = await store.get(child.child_id);
      const synced = existing?.synced ?? true;
      await store.put({ ...child, synced });
    }

    await tx.done;
    console.log("✅ Bulk children saved to IndexedDB:", children.length);
  } catch (err) {
    console.error("❌ Failed bulk saving children:", err);
  }
};
// 🔄Sync children to backend
const syncChildren = async () => {
  console.log("🚀 syncChildren() triggered");
  const db = await initDB();
  const tx = db.transaction("children", "readonly");
  const store = tx.objectStore("children");

  const all = await store.getAll();
  const unsynced = all.filter((child) => !child.synced); // ✅ define it here

  console.log("🧵 Unsynced children:", unsynced);

  try {
    const response = await fetch("http://localhost:5000/sync-children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ children: unsynced }),
    });

    if (response.ok) {
      const writeTx = db.transaction("children", "readwrite");
      const writeStore = writeTx.objectStore("children");

      const start = performance.now();

      for (const child of unsynced) {
        const existing = await writeStore.get(child.id);
        if (existing) {
          await writeStore.put({ ...existing, synced: true });
        }
      }

      await writeTx.done;

      const end = performance.now();
      console.log(`✅ Synced ${unsynced.length} children to MongoDB`);
      console.log(`⏱️ Sync took ${Math.round(end - start)}ms`);
      toast("✅ Synced offline records to server");
    } else {
      console.warn("⚠️ Sync failed for some records");
      console.log("🧵 Unsynced payload:", unsynced);
    }
  } catch (err) {
    console.error("❌ Child sync failed:", err);
  }
};
// 🌐 Auto-sync users and children when back online (with debounce)
let syncTimeout;
window.addEventListener("online", () => {
  console.log("🌐 Back online — syncing users and children...");
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncUsers();
    syncChildren();
  }, 1000); // ⏳ wait 1s before syncing
});

