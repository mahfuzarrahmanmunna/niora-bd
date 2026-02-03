// src/app/components/SearchParamsWrapper.jsx
"use client";

import { Suspense } from "react";

const SearchParamsWrapper = ({ children }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
};

export default SearchParamsWrapper;
