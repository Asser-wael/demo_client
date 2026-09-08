import React from "react";

export default function Currency({ amount, className = "" }) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return <span className={className}>NZ$ —</span>;
  }

  const formatted = Number(amount).toLocaleString("en-NZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return <span className={className}>NZ$ {formatted}</span>;
}