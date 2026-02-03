import { Suspense } from "react";
import PaymentSuccessClient from "./PaymentSuccessClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          Processing payment...
        </div>
      }
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}
