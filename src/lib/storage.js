// src/lib/storage.js
// Simple localStorage wrapper with a consistent API.
// Falls back gracefully if storage is unavailable.

const PREFIX = "fc:";

function key(k) {
  return PREFIX + k;
}

export const storage = {
  get(k) {
    try {
      const val = localStorage.getItem(key(k));
      return val !== null ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },

  set(k, value) {
    try {
      localStorage.setItem(key(k), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(k) {
    try {
      localStorage.removeItem(key(k));
      return true;
    } catch {
      return false;
    }
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
      return true;
    } catch {
      return false;
    }
  },

  getDeviceId() {
    let id = this.get("deviceId");
    if (!id) {
      id = "dev_" + Math.random().toString(36).slice(2, 11) + "_" + Date.now().toString(36);
      this.set("deviceId", id);
    }
    return id;
  },
};
