import React, { useState } from "react";
import ToastNotification from "./ToastNotification";

// ─── COMPONENT ────────────────────────────────────────────────────────────────
// Standalone toast stack, use outside of ToastProvider context.

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  return (
    <div style={{
      position:      "fixed",
      top:           "1.5rem",
      right:         "1.5rem",
      zIndex:        100000000000,
      display:       "flex",
      flexDirection: "column",
      alignItems:    "flex-end",
      gap:           "0.75rem",
    }}>
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          {...toast}
          onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        />
      ))}
    </div>
  );
};

export default ToastContainer;