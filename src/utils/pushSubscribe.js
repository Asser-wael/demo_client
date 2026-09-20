import axiosInstance from "../api/axiosInstance";

// Push notifications require: a service worker, the Push API, and the
// Notification API. Not every browser/context has all three — most
// notably iOS Safari only exposes them when the site has been "Added to
// Home Screen" and launched as a standalone app (iOS 16.4+); a regular
// Safari tab on iPhone never supports Web Push, no matter what code runs
// here. Checking this up front means we skip quietly instead of throwing
// confusing errors on unsupported browsers.
export function isPushSupported() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function subscribeToPush() {
  if (!isPushSupported()) {
    return;
  }

  try {
    const register = await navigator.serviceWorker.register("/sw.js");

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return;
    }

    let subscription = await register.pushManager.getSubscription();

    if (!subscription) {
      subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        ),
      });
    }

    await axiosInstance.post("/notifications/subscribe", {
      subscription,
    });
  } catch (err) {
    console.error(
      "Push subscription failed:",
      err.response?.data || err.message
    );
  }
}

// Called on logout, or from a notification-settings toggle — removes the
// subscription from this device both locally and on the backend, so the
// server stops trying to (and failing to) push to a device that opted out.
export async function unsubscribeFromPush() {
  if (!isPushSupported()) {
    return;
  }

  try {
    const register = await navigator.serviceWorker.getRegistration();
    const subscription = await register?.pushManager.getSubscription();

    if (!subscription) {
      return;
    }

    const endpoint = subscription.endpoint;

    await subscription.unsubscribe();

    await axiosInstance.post("/notifications/unsubscribe", {
      endpoint,
    });
  } catch (err) {
    console.error(
      "Push unsubscribe failed:",
      err.response?.data || err.message
    );
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = atob(base64);

  return Uint8Array.from(
    [...raw].map((c) => c.charCodeAt(0))
  );
}
