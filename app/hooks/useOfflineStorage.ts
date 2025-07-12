'use client';

import { useState, useEffect } from 'react';

interface OfflineData {
  timestamp: number;
  data: any;
}

export function useOfflineStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState<T[]>([]);

  useEffect(() => {
    // Verificar estado de conexión
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      // Cargar datos del localStorage al inicializar
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed: OfflineData = JSON.parse(item);
        setStoredValue(parsed.data);
      }

      // Cargar datos pendientes de sincronización
      const pendingKey = `${key}_pending`;
      const pendingItem = window.localStorage.getItem(pendingKey);
      if (pendingItem) {
        setPendingSync(JSON.parse(pendingItem));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      const dataToStore: OfflineData = {
        timestamp: Date.now(),
        data: valueToStore
      };

      window.localStorage.setItem(key, JSON.stringify(dataToStore));

      // Si estamos offline, agregar a la cola de sincronización
      if (!isOnline) {
        const newPending = [...pendingSync, valueToStore];
        setPendingSync(newPending);
        window.localStorage.setItem(`${key}_pending`, JSON.stringify(newPending));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const clearPendingSync = () => {
    setPendingSync([]);
    window.localStorage.removeItem(`${key}_pending`);
  };

  const getOfflineData = (): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed: OfflineData = JSON.parse(item);
        return parsed.data;
      }
    } catch (error) {
      console.error('Error getting offline data:', error);
    }
    return null;
  };

  const isDataStale = (maxAgeMinutes: number = 60): boolean => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed: OfflineData = JSON.parse(item);
        const ageMinutes = (Date.now() - parsed.timestamp) / (1000 * 60);
        return ageMinutes > maxAgeMinutes;
      }
    } catch (error) {
      console.error('Error checking data age:', error);
    }
    return true;
  };

  return {
    value: storedValue,
    setValue,
    isOnline,
    pendingSync,
    clearPendingSync,
    getOfflineData,
    isDataStale,
    hasPendingSync: pendingSync.length > 0
  };
}