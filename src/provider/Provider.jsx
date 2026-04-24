"use client";
import { CartProvider } from "@/app/context/CartContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default: 5 minutes
            staleTime: 60 * 1000,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <CartProvider>{children}</CartProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
