"use client";

import { AnimatePresence } from "framer-motion";

import {
  type ToastData,
  type ToastPosition,
} from "./toast";

import ToastItem from "./ToastItem";

type ToastViewportProps = {
  toasts: ToastData[];
};

const positionClasses: Record<ToastPosition, string> = {
  "top-left":
    "left-4 top-4 items-start sm:left-6 sm:top-6",

  "top-center":
    "left-1/2 top-4 -translate-x-1/2 items-center sm:top-6",

  "top-right":
    "right-4 top-4 items-end sm:right-6 sm:top-6",

  "center-left":
    "left-4 top-1/2 -translate-y-1/2 items-start sm:left-6",

  center:
    "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center",

  "center-right":
    "right-4 top-1/2 -translate-y-1/2 items-end sm:right-6",

  "bottom-left":
    "bottom-4 left-4 items-start sm:bottom-6 sm:left-6",

  "bottom-center":
    "bottom-4 left-1/2 -translate-x-1/2 items-center sm:bottom-6",

  "bottom-right":
    "bottom-4 right-4 items-end sm:bottom-6 sm:right-6",
};

export default function ToastViewport({
  toasts,
}: ToastViewportProps) {
  const positions: ToastPosition[] = [
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ];

  return (
    <>
      {positions.map((position) => {
        const positionToasts = toasts.filter(
          (toast) => toast.position === position
        );

        if (positionToasts.length === 0) {
          return null;
        }

        return (
          <div
            key={position}
            className={`pointer-events-none fixed z-[9999] flex max-w-[calc(100vw-2rem)] flex-col gap-3 sm:max-w-sm ${positionClasses[position]}`}
          >
            <AnimatePresence mode="popLayout">
              {positionToasts.map((item) => (
                <ToastItem
                  key={item.id}
                  item={item}
                />
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}