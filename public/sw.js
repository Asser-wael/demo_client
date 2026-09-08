
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const options = {
    body: data.body,
    icon: "/image.png",
    badge: "/notification-badge.png",
    // صورة كبيرة اختيارية
    image: data.image || undefined,

    // اهتزاز على الأجهزة التي تدعمه
    vibrate: [200, 100, 200],

    // يمنع تجميع الإشعارات المختلفة
    tag: data.tag || "default-notification",

    // لو true يفضل ظاهر لحد ما المستخدم يتفاعل معه
    requireInteraction: false,

    // بيانات إضافية نقدر نستخدمها عند الضغط
    data: {
      url: data.url || "/orders",
      orderId: data.orderId || null,
    },

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

  const action = event.action;
  const url = event.notification.data?.url || "/";

  if (action === "close") {
    return;
  }

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      return clients.openWindow(url);
    })
  );
});