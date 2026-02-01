import React, { createContext, useContext, useState, useCallback } from 'react';

interface PushNotificationData {
  tipo: string;
  servicioId: string;
  [key: string]: any;
}

interface PushNotificationContextType {
  pendingNotification: PushNotificationData | null;
  setPendingNotification: (data: PushNotificationData | null) => void;
  clearPendingNotification: () => void;
}

const PushNotificationContext = createContext<PushNotificationContextType>({
  pendingNotification: null,
  setPendingNotification: () => {},
  clearPendingNotification: () => {},
});

export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingNotification, setPending] = useState<PushNotificationData | null>(null);

  const setPendingNotification = useCallback((data: PushNotificationData | null) => {
    setPending(data);
  }, []);

  const clearPendingNotification = useCallback(() => {
    setPending(null);
  }, []);

  return (
    <PushNotificationContext.Provider value={{ pendingNotification, setPendingNotification, clearPendingNotification }}>
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotification = () => useContext(PushNotificationContext);