import axiosInstance from "../api/axiosInstance";
import { store } from "../app/store";
import { showToast } from "./showToast";

export async function subscribeToPush() {
  try {
    const register = await navigator.serviceWorker.register("/sw.js");

    const permission = await Notification.requestPermission();

    if (permission !== "granted") return;


    let subscription = await register.pushManager.getSubscription();

    if (!subscription) {
      subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        ),
      });
    }


    const res = await axiosInstance.post("/notifications/subscribe", {
      subscription,
    });



  } catch (err) {
    console.log(err);
    console.log(err.response);
    console.log(err.response?.data);
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