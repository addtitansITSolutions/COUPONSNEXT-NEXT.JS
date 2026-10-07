export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastOptions = {
  position?: ToastPosition;
  duration?: number;
  title?: string;
};

export type ToastData = {
  id: string;
  type: ToastType;
  message: string;
  position: ToastPosition;
  duration: number;
  title?: string;
  createdAt: number;
};

type ToastListener = (toasts: ToastData[]) => void;

const DEFAULT_POSITION: ToastPosition = "top-right";
const DEFAULT_DURATION = 4000;
const MAX_TOASTS_PER_POSITION = 3;

let toastCounter = 0;

const listeners = new Set<ToastListener>();
let toasts: ToastData[] = [];

function notifyListeners() {
  const snapshot = [...toasts];

  listeners.forEach((listener) => {
    listener(snapshot);
  });
}

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener);

  listener([...toasts]);

  return () => {
    listeners.delete(listener);
  };
}

function createToast(
  type: ToastType,
  message: string,
  options?: ToastOptions
) {
  const position = options?.position ?? DEFAULT_POSITION;
  const duration = options?.duration ?? DEFAULT_DURATION;

  const toast: ToastData = {
    id: `${Date.now()}-${toastCounter++}`,
    type,
    message,
    position,
    duration,
    title: options?.title,
    createdAt: Date.now(),
  };

  const positionToasts = toasts.filter(
    (item) => item.position === position
  );

  if (positionToasts.length >= MAX_TOASTS_PER_POSITION) {
    const oldestToast = positionToasts.reduce((oldest, current) =>
      current.createdAt < oldest.createdAt ? current : oldest
    );

    toasts = toasts.filter(
      (item) => item.id !== oldestToast.id
    );
  }

  toasts = [...toasts, toast];

  notifyListeners();

  return toast.id;
}

function removeToast(id: string) {
  const exists = toasts.some((toast) => toast.id === id);

  if (!exists) {
    return;
  }

  toasts = toasts.filter((toast) => toast.id !== id);

  notifyListeners();
}

export const toast = {
  success(message: string, options?: ToastOptions) {
    return createToast("success", message, options);
  },

  error(message: string, options?: ToastOptions) {
    return createToast("error", message, options);
  },

  warning(message: string, options?: ToastOptions) {
    return createToast("warning", message, options);
  },

  info(message: string, options?: ToastOptions) {
    return createToast("info", message, options);
  },

  dismiss(id: string) {
    removeToast(id);
  },

  dismissAll() {
    toasts = [];
    notifyListeners();
  },
};