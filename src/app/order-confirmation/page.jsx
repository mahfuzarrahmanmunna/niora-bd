// src/app/order-confirmation/page.jsx
import { Suspense } from "react";
import OrderConfirmationClient from "./OrderConfirmationClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">Loading…</div>
      }
    >
      <OrderConfirmationClient />
    </Suspense>
  );
}
