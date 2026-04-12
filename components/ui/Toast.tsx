"use client";

import { useEffect, useState } from "react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "error" | "warning" | "success" | "info";
}

let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

function notify(listeners: ((t: ToastMessage[]) => void)[]) {
  const copy = [...toasts];
  listeners.forEach((fn) => fn(copy));
}

export function showToast(
  message: string,
  type: ToastMessage["type"] = "info"
) {
  const id = `${Date.now()}-${Math.random()}`;
  toasts = [...toasts, { id, message, type }];
  notify(toastListeners);
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify(toastListeners);
  }, 4000);
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (t: ToastMessage[]) => setItems(t);
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  if (items.length === 0) return null;

  const colorMap: Record<ToastMessage["type"], string> = {
    error: "bg-[var(--red)] text-white",
    warning: "bg-yellow-500 text-white",
    success: "bg-[var(--green)] text-white",
    info: "bg-[var(--accent)] text-white",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm ${colorMap[item.type]}`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
