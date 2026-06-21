// public/sw.js
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

// Handle background push notifications sent from server
self.addEventListener("push", (e) => {
  if (!e.data) return;

  try {
    const data = e.data.json();
    const title = data.title || "Focus Control Alert";
    const options = {
      body: data.body || "",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: data.tag || "active-block-reminder",
      renotify: true,
      data: data.data || {},
    };

    e.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Failed to parse push notification payload:", err);
    const text = e.data.text();
    e.waitUntil(
      self.registration.showNotification("Focus Control Alert", {
        body: text,
      })
    );
  }
});

// Handle notification click to open/focus the app
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window/tab if it is open
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});
