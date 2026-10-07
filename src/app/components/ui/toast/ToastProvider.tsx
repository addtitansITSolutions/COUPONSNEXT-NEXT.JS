"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  subscribeToasts,
  type ToastData,
} from "./toast";
import ToastViewport from "./ToastViewport";

type ToastContextType = {
  toasts: ToastData[];
};

const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    return subscribeToasts(setToasts);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts }}>
      {children}

      {/* Toast UI will be rendered separately */}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToastState() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToastState must be used inside ToastProvider"
    );
  }

  return context;
}