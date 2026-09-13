
import axiosInstance from "../api/axiosInstance";
import { store } from "../app/store";
import { showToast } from "./showToast";

export async function subscribeToPush() {
  try {
    console.log(1);
    
    const register = await navigator.serviceWorker.register("/sw.js");
    console.log(2);
    
    const permission = await Notification.requestPermission();
    console.log(3);
    
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }
    console.log(4);
    
    let subscription = await register.pushManager.getSubscription();
    console.log(5);
    
    if (!subscription) {
      console.log(6);
      console.log(import.meta.env.VITE_VAPID_PUBLIC_KEY);
      
      subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        ),
      });
    }
    
    console.log(7);
    
    const res = await axiosInstance.post("/notifications/subscribe", {
      subscription,
    });
    console.log(8);



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