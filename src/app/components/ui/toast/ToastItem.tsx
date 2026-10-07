"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  toast,
  type ToastData,
} from "./toast";

type ToastItemProps = {
  item: ToastData;
};

const toastConfig = {
  success: {
    icon: CheckCircle2,
    title: "Success",
    iconClass: "text-emerald-500",
  },

  error: {
    icon: CircleAlert,
    title: "Error",
    iconClass: "text-red-500",
  },

  warning: {
    icon: TriangleAlert,
    title: "Warning",
    iconClass: "text-amber-500",
  },

  info: {
    icon: Info,
    title: "Information",
    iconClass: "text-blue-500",
  },
};

export default function ToastItem({
  item,
}: ToastItemProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      toast.dismiss(item.id);
    }, item.duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [item.id, item.duration]);

  const config = toastConfig[item.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: -12,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -8,
        scale: 0.96,
      }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-lg shadow-black/10"
    >
      <div className="flex items-start gap-3 p-4">
        <Icon
          size={21}
          strokeWidth={2}
          className={`mt-0.5 shrink-0 ${config.iconClass}`}
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--brand-navy)]">
            {item.title || config.title}
          </p>

          <p className="mt-1 text-sm leading-5 text-[var(--brand-navy)]/65">
            {item.message}
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.dismiss(item.id)}
          aria-label="Close notification"
          className="shrink-0 rounded-lg p-1 text-[var(--brand-navy)]/35 transition hover:bg-gray-100 hover:text-[var(--brand-navy)]"
        >
          <X size={17} />
        </button>
      </div>

      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{
          duration: item.duration / 1000,
          ease: "linear",
        }}
        style={{ transformOrigin: "left" }}
        className="h-0.5 bg-[var(--brand-purple)]"
      />
    </motion.div>
  );
}