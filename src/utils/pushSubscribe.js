import axiosInstance from "../api/axiosInstance";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPush() {
  try {
    await navigator.serviceWorker.register("/sw.js");

    const registration = await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const key = urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      );

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
    }

    await axiosInstance.post("/notifications/subscribe", {
      subscription,
    });

    console.log("Push subscription successful");
  } catch (error) {
    console.error("Push subscribe failed:", error);
  }
}