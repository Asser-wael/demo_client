import axiosInstance from "../api/axiosInstance";

export async function subscribeToPush() {
  try {
    const registration =
      await navigator.serviceWorker.register("/sw.js");

    await navigator.serviceWorker.ready;

    const permission =
      await Notification.requestPermission();

    if (permission !== "granted") return;

    let subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            urlBase64ToUint8Array(
              import.meta.env.VITE_VAPID_PUBLIC_KEY
            ),
        });
    }

    console.log("Subscription:", subscription);

    await axiosInstance.post(
      "/notifications/subscribe",
      { subscription }
    );

    console.log("Push subscribed!");
  } catch (error) {
    console.error("Push error:", error);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = atob(base64);

  return Uint8Array.from(
    [...raw].map((char) => char.charCodeAt(0))
  );
}