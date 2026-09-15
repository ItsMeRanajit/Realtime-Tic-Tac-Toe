import React, { createContext, useContext, useState, useCallback } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let borderStyle = "border-sky-200 bg-sky-50 text-sky-900";
          let icon = <FiInfo className="w-5 h-5 text-sky-500 shrink-0" />;

          if (toast.type === "success") {
            borderStyle = "border-emerald-200 bg-emerald-50 text-emerald-900";
            icon = <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
          } else if (toast.type === "error") {
            borderStyle = "border-rose-200 bg-rose-50 text-rose-900";
            icon = <FiAlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl border-2 shadow-lg backdrop-blur-md transition-all animate-fade-in font-bold text-sm ${borderStyle}`}
            >
              <div className="flex items-center gap-3 pr-2">
                {icon}
                <p className="tracking-wide">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: (msg) => console.log(msg),
      removeToast: () => {},
    };
  }
  return context;
};
