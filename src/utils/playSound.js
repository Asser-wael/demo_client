import newOrderSound from "../assets/sounds/money.mp3";
import lowStockSound from "../assets/sounds/warning.mp3";
import orderStatusSound from "../assets/sounds/status.mp3";

export const sounds = {
  newOrder: new Audio(newOrderSound),
  lowStock: new Audio(lowStockSound),
  orderStatus: new Audio(orderStatusSound),
};

export const playSound = (sound) => {
  if (!sound) return;

  sound.currentTime = 0;
  sound.play().catch(() => {
    // Prevent browser autoplay restrictions from throwing uncaught errors
  });
};