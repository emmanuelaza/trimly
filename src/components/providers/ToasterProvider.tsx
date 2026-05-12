"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#FFFFFF",
          color: "#0F1729",
          border: "1px solid #E2E6EE",
          borderRadius: "14px",
          fontSize: "13px",
          fontWeight: "500",
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(15,23,41,0.12)",
          maxWidth: "380px",
        },
        success: {
          iconTheme: {
            primary: "#22C55E",
            secondary: "#FFFFFF",
          },
          style: {
            background: "#FFFFFF",
            border: "1px solid rgba(34,197,94,0.30)",
            borderLeft: "3px solid #22C55E",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "#FFFFFF",
          },
          style: {
            background: "#FFFFFF",
            border: "1px solid rgba(239,68,68,0.30)",
            borderLeft: "3px solid #EF4444",
          },
        },
        loading: {
          style: {
            background: "#FFFFFF",
            border: "1px solid #E2E6EE",
          },
        },
      }}
    />
  );
}
