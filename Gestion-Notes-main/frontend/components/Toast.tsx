"use client";

import { useEffect, useState } from "react";

export interface ToastState {
  msg: string;
  type: "success" | "error";
  key: number;
}

export default function Toast({ toast }: { toast: ToastState | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, [toast?.key]);

  if (!toast || !visible) return null;

  return (
    <div
      className={[
        "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3",
        "text-[13px] font-medium text-white rounded-lg shadow-xl",
        "animate-[slideUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)]",
        toast.type === "success" ? "bg-gray-900" : "bg-red-600",
      ].join(" ")}
    >
      {toast.type === "success" ? "✓" : "✕"} {toast.msg}
    </div>
  );
}
