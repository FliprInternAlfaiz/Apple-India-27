"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

interface IQueryProvider {
  children: React.ReactNode;
}

export const queryClient = new QueryClient();

const QueryProvider: React.FC<IQueryProvider> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
