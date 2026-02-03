// src/app/hooks/useSafeSearchParams.js
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UseSearchParamsComponent({ onParamsReady }) {
  const searchParams = useSearchParams();
  onParamsReady(searchParams);
  return null;
}

export function useSafeSearchParams() {
  return new Promise((resolve) => {
    <Suspense fallback={null}>
      <UseSearchParamsComponent onParamsReady={resolve} />
    </Suspense>;
  });
}

// Alternative approach for synchronous usage
export function useSearchParamsSync() {
  try {
    return useSearchParams();
  } catch (error) {
    // Return a fallback for SSR
    return new URLSearchParams();
  }
}
