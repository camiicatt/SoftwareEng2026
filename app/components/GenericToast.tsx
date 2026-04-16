"use client";

import { useEffect } from "react";

type ToastProps = {
  show: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
};

export default function Toast({ show, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed right-4 top-24 z-[100] max-w-sm border-4 border-black bg-[#F2D23C] px-4 py-3 text-sm font-black text-black shadow-[6px_6px_0_0_#000]">
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        <button
          onClick={onClose}
          className="shrink-0 border-2 border-black bg-white px-2 py-1 text-xs"
        >
          X
        </button>
      </div>
    </div>
  );
}