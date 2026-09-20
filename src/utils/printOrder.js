import qz from "qz-tray";
import { connectQZ } from "./qzPrinter.js";

/* =========================================================
   HELPERS
========================================================= */

const safe = (value, fallback = "-") => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
};

const line = (text = "") => `${text}\n`;

const separator = () =>
  "--------------------------------\n";

/* =========================================================
   PRINT ORDER
========================================================= */

export async function printOrder(order) {
  if (!order?._id) {
    throw new Error("Invalid order");
  }

  /* =======================================================
     CONNECT QZ
  ======================================================= */

  await connectQZ();

  /* =======================================================
     GET DEFAULT PRINTER
  ======================================================= */

  const printerName = await qz.printers.getDefault();

  if (!printerName) {
    throw new Error("No default printer found");
  }

  /* =======================================================
     CREATE CONFIG
  ======================================================= */

  const config = qz.configs.create(
    printerName,
    {
      encoding: "UTF-8",
      jobName: `Order-${
        order.orderCode ||
        order._id.slice(-8)
      }`,
    }
  );

  const data = [];

  /* =======================================================
     INIT PRINTER
  ======================================================= */

  data.push("\x1B\x40");

  /* =======================================================
     HEADER
  ======================================================= */

  data.push("\x1B\x61\x01");

  data.push("\x1B\x45\x01");

  data.push(line("NEW LEVEL"));

  data.push("\x1B\x45\x00");

  data.push(line("Order Receipt"));

  data.push("\x1B\x61\x00");

  data.push(separator());

  /* =======================================================
     ORDER INFO
  ======================================================= */

  data.push(
    line(
      `Order: ${
        order.orderCode ||
        order._id?.slice(-8)?.toUpperCase()
      }`
    )
  );

  data.push(
    line(
      `Date: ${
        order.createdAt
          ? new Date(
              order.createdAt
            ).toLocaleString("en-EG")
          : "-"
      }`
    )
  );

  data.push(separator());

  /* =======================================================
     ORDER TYPE — printed prominently so kitchen/counter staff
     immediately know how to handle the order.
  ======================================================= */

  const orderTypeLabels = {
    delivery: "DELIVERY",
    takeaway: "TAKEAWAY",
    dine_in: "DINE IN",
  };

  // Legacy orders with no orderType default to delivery, same as the
  // schema default, so old tickets don't print "undefined".
  const orderType = order.orderType || "delivery";

  data.push("\x1B\x45\x01");

  data.push(
    line(
      `TYPE: ${orderTypeLabels[orderType] || "DELIVERY"}${
        orderType === "dine_in" && order.tableNumber
          ? ` (Table ${order.tableNumber})`
          : ""
      }`
    )
  );

  data.push("\x1B\x45\x00");

  data.push(separator());

  /* =======================================================
     CUSTOMER
  ======================================================= */

  data.push(line("CUSTOMER"));

  data.push(
    line(
      `Name: ${safe(
        order.shippingAddress?.fullName
      )}`
    )
  );

  data.push(
    line(
      `Phone: ${safe(
        order.shippingAddress?.phone
      )}`
    )
  );

  // City/Address only matter for delivery orders — omit them for
  // takeaway/dine-in instead of printing irrelevant "-" placeholders.
  if (orderType === "delivery") {
    data.push(
      line(
        `City: ${safe(
          order.shippingAddress?.city
        )}`
      )
    );

    data.push(
      line(
        `Address: ${safe(
          order.shippingAddress?.address
        )}`
      )
    );
  }

  data.push(separator());

  /* =======================================================
     ITEMS
  ======================================================= */

  data.push(line("ITEMS"));

  for (const item of order.items || []) {
    data.push(
      line(
        safe(item.name)
      )
    );

    data.push(
      line(
        `Size: ${safe(item.size)}  Variant: ${safe(
          item.variant
        )}`
      )
    );

    data.push(
      line(
        `Qty: ${safe(
          item.quantity,
          0
        )}  Price: ${safe(
          item.price,
          0
        )} EGP`
      )
    );

    data.push("\n");
  }

  data.push(separator());

  /* =======================================================
     TOTAL
  ======================================================= */

  data.push("\x1B\x45\x01");

  data.push(
    line(
      `TOTAL: ${safe(
        order.totalPrice,
        0
      )} EGP`
    )
  );

  data.push("\x1B\x45\x00");

  data.push("\n");

  /* =======================================================
     PAYMENT
  ======================================================= */

  data.push(
    line(
      `Payment: ${
        order.paymentMethod === "cash"
          ? "Cash"
          : "Wallet"
      }`
    )
  );

  /* =======================================================
     WALLET
  ======================================================= */

  if (
    order.paymentMethod === "wallet" &&
    order.walletPayment
  ) {
    data.push(
      line(
        `Sender: ${safe(
          order.walletPayment
            .senderName
        )}`
      )
    );

    data.push(
      line(
        `Sender Phone: ${safe(
          order.walletPayment
            .senderPhone
        )}`
      )
    );

    data.push(
      line(
        `Transaction: ${safe(
          order.walletPayment
            .transactionId
        )}`
      )
    );
  }

  data.push(separator());

  /* =======================================================
     FOOTER
  ======================================================= */

  data.push("\x1B\x61\x01");

  data.push(
    line(
      "Thank you for your order"
    )
  );

  data.push(
    line("NEW LEVEL")
  );

  data.push("\n");
  data.push("\n");
  data.push("\n");

  /* =======================================================
     CUT PAPER
  ======================================================= */

  data.push("\x1D\x56\x00");

  /* =======================================================
     PRINT
  ======================================================= */

  await qz.print(config, [
    {
      type: "raw",
      format: "command",
      flavor: "plain",
      data: data.join(""),
    },
  ]);

  return true;
}