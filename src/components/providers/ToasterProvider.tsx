"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1F1F26",
          color: "#F2F2F0",
          border: "1px solid #2E2E38",
          borderRadius: "14px",
          fontSize: "14px",
          fontWeight: "500",
          padding: "14px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset",
          maxWidth: "380px",
        },
        success: {
          iconTheme: {
            primary: "#C9F53B",
            secondary: "#0A0A0B",
          },
          style: {
            background: "#1F1F26",
            border: "1px solid rgba(201,245,59,0.25)",
          },
        },
        error: {
          iconTheme: {
            primary: "#F87171",
            secondary: "#0A0A0B",
          },
          style: {
            background: "#1F1F26",
            border: "1px solid rgba(248,113,113,0.25)",
          },
        },
        loading: {
          style: {
            background: "#1F1F26",
            border: "1px solid #2E2E38",
          },
        },
      }}
    />
  );
}
