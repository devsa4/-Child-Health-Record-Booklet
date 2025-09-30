import { openDB } from "idb";

export const getDB = () =>
  openDB("ChildRecords", 8, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("offlineRecords")) {
        db.createObjectStore("offlineRecords", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("children")) {
        db.createObjectStore("children", { keyPath: "child_id" });
      }
      if (!db.objectStoreNames.contains("drill")) {
        db.createObjectStore("drill", { keyPath: "id" });
      }
    }
  });