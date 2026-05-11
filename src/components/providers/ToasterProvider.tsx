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
          background: "#18181F",
          color: "#F0F0F5",
          border: "1px solid #2A2A35",
          borderRadius: "14px",
          fontSize: "13px",
          fontWeight: "500",
          padding: "12px 16px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
          maxWidth: "380px",
        },
        success: {
          iconTheme: {
            primary: "#7EE787",
            secondary: "#0A0A0F",
          },
          style: {
            background: "#0F1F11",
            border: "1px solid rgba(126,231,135,0.25)",
          },
        },
        error: {
          iconTheme: {
            primary: "#F05060",
            secondary: "#0A0A0F",
          },
          style: {
            background: "#1C0B0C",
            border: "1px solid rgba(240,80,96,0.25)",
          },
        },
        loading: {
          style: {
            background: "#18181F",
            border: "1px solid #2A2A35",
          },
        },
      }}
    />
  );
}
