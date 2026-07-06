'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AlertType = 'info' | 'destructive';

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  alert: (message: string | AlertOptions) => Promise<void>;
  confirm: (options: string | AlertOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertState extends AlertOptions {
  id: string;
  isConfirm: boolean;
  resolve: (value: boolean) => void;
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  const addAlert = useCallback((options: AlertOptions, isConfirm: boolean): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlerts((prev) => [
        ...prev,
        {
          ...options,
          id: Math.random().toString(36).substring(7),
          isConfirm,
          resolve,
        },
      ]);
    });
  }, []);

  const alert = useCallback(
    (options: string | AlertOptions) => {
      const opts = typeof options === 'string' ? { title: 'Alert', message: options } : options;
      return addAlert({ confirmText: 'OK', ...opts }, false).then(() => {});
    },
    [addAlert]
  );

  const confirm = useCallback(
    (options: string | AlertOptions) => {
      const opts = typeof options === 'string' ? { title: 'Confirm', message: options } : options;
      return addAlert({ confirmText: 'OK', cancelText: 'Cancel', ...opts }, true);
    },
    [addAlert]
  );

  const handleClose = (id: string, result: boolean) => {
    setAlerts((prev) => {
      const alertState = prev.find((a) => a.id === id);
      if (alertState) {
        alertState.resolve(result);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  return (
    <AlertContext.Provider value={{ alert, confirm }}>
      {children}
      
      <AnimatePresence>
        {alerts.length > 0 && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            />
            
            <div className="relative z-10 w-full max-w-[280px] sm:max-w-xs flex flex-col items-center justify-center">
              {alerts.map((a, i) => {
                const isTop = i === alerts.length - 1;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ 
                      opacity: isTop ? 1 : 0, 
                      scale: isTop ? 1 : 0.95,
                      y: isTop ? 0 : -10,
                      pointerEvents: isTop ? 'auto' : 'none',
                      position: isTop ? 'relative' : 'absolute'
                    }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    className="w-full bg-[#f8f8f8]/95 dark:bg-[#2c2c2e]/95 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[14px] shadow-2xl overflow-hidden"
                  >
                    <div className="px-4 py-5 text-center space-y-1">
                      <h3 className="text-[16px] font-semibold tracking-tight text-black dark:text-white">
                        {a.title}
                      </h3>
                      <p className="text-[13px] leading-snug text-black/60 dark:text-white/60 px-2">
                        {a.message}
                      </p>
                    </div>
                    
                    <div className={`flex border-t border-black/10 dark:border-white/10 ${a.isConfirm ? 'flex-row' : 'flex-col'}`}>
                      {a.isConfirm && (
                        <button
                          onClick={() => handleClose(a.id, false)}
                          className="flex-1 py-3 text-[16px] text-blue-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-r border-black/10 dark:border-white/10 focus:outline-none focus:bg-black/10 dark:focus:bg-white/10"
                        >
                          {a.cancelText || 'Cancel'}
                        </button>
                      )}
                      <button
                        onClick={() => handleClose(a.id, true)}
                        className={`flex-1 py-3 text-[16px] font-semibold transition-colors focus:outline-none focus:bg-black/10 dark:focus:bg-white/10 hover:bg-black/5 dark:hover:bg-white/5 ${
                          a.type === 'destructive' ? 'text-red-500' : 'text-blue-500'
                        }`}
                      >
                        {a.confirmText || 'OK'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
