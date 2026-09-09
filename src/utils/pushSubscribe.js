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
      console.log("1 - subscription:", subscription);

      console.log("2 - VAPID:", import.meta.env.VITE_VAPID_PUBLIC_KEY);

      console.log("3 - register:", register);

      const key = urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      );

      console.log("4 - converted key:", key);

      subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });

      console.log("5 - SUCCESS:", subscription);
    }
    console.log(6);


    const res = await axiosInstance.post("/notifications/subscribe", {
      subscription,
    });
    console.log(7);



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