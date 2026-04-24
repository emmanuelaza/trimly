"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--background-elevated)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-strong)",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: "var(--success)",
            secondary: "var(--background-primary)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--danger)",
            secondary: "var(--background-primary)",
          },
        },
      }}
    />
  );
}
