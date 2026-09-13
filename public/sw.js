/* =============================
   SERVICE WORKER — PUSH ONLY
============================= */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "Notification", body: event.data.text() };
  }

  const title = data.title || "New Notification";
  const options = {
    body: data.body || "",
    icon: data.icon || "/notification-badge.png",
    badge: data.badge || "/notification-badge.png",
    data: data.data || {},
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});