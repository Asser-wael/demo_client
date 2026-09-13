import axiosInstance from "../api/axiosInstance";
import { store } from "../app/store";

export async function subscribeToPush() {
  try {
    // ✅ Guard: VAPID key must exist before we try to subscribe
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

    if (!vapidKey) {
      console.error("❌ VITE_VAPID_PUBLIC_KEY is missing in frontend .env");
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push not supported in this browser");
      return;
    }

    const register = await navigator.serviceWorker.register("/sw.js");

    // ✅ Wait until the SW is actually active
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    let subscription = await register.pushManager.getSubscription();

    if (!subscription) {
      subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    // ✅ Send to backend
    const res = await axiosInstance.post("/notifications/subscribe", {
      subscription,
    });

    console.log("✅ Push subscription saved:", res.data);
  } catch (err) {
    console.error("Push subscription error:", err);
    console.error("Response:", err.response?.data);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = atob(base64);

  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}