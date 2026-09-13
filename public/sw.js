self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const options = {
    body: data.body || "",
    icon: "/notification-badge.png",
    badge: "/notification-badge.png",

    data: {
      url: data.url || "/orders",
      orderId: data.orderId || null,
    },

    tag: data.tag || "notification",

    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "New Notification",
      options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const url = event.notification.data?.url || "/orders";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      const client = clientList.find(
        (client) => client.url.startsWith(self.location.origin)
      );

      if (client) {
        client.navigate(url);
        return client.focus();
      }

      return clients.openWindow(url);
    })
  );
});