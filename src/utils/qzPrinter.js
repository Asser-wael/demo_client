import qz from "qz-tray";

let connectingPromise = null;

/**
 * Connect to QZ Tray
 */
export async function connectQZ() {
  if (qz.websocket.isActive()) {
    return true;
  }

  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = qz.websocket
    .connect()
    .then(() => {
      console.log("✅ QZ Tray connected");
      return true;
    })
    .catch((error) => {
      console.error("❌ QZ Tray connection failed:", error);
      throw error;
    })
    .finally(() => {
      connectingPromise = null;
    });

  return connectingPromise;
}

/**
 * Disconnect QZ Tray
 */
export async function disconnectQZ() {
  if (!qz.websocket.isActive()) {
    return;
  }

  try {
    await qz.websocket.disconnect();
    console.log("🔌 QZ Tray disconnected");
  } catch (error) {
    console.error("❌ QZ disconnect failed:", error);
  }
}

/**
 * Get all installed printers
 */
export async function getPrinters() {
  await connectQZ();

  return qz.printers.find();
}

/**
 * Get default printer
 */
export async function getDefaultPrinter() {
  await connectQZ();

  return qz.printers.getDefault();
}