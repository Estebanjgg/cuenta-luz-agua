'use client';

import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isServiceWorkerReady: boolean;
  hasUpdate: boolean;
}

interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface UsePWAReturn extends PWAState {
  // Instalación
  promptInstall: () => Promise<boolean>;
  
  // Service Worker
  updateApp: () => void;
  
  // Datos offline
  addOfflineData: (type: string, data: any) => void;
  getOfflineData: (type?: string) => OfflineData[];
  syncOfflineData: () => Promise<void>;
  clearOfflineData: (type?: string) => void;
  
  // Caché
  cacheUrl: (url: string) => Promise<void>;
  isCached: (url: string) => Promise<boolean>;
  
  // Notificaciones
  requestNotificationPermission: () => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<PWAState>({
    isOnline: true,
    isInstallable: false,
    isInstalled: false,
    isServiceWorkerReady: false,
    hasUpdate: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Inicialización
  useEffect(() => {
    // Verificar estado inicial
    setState(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches ||
                   (window.navigator as any).standalone === true
    }));

    // Event listeners
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      syncOfflineData();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      setDeferredPrompt(null);
    };

    // Registrar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg);
        setState(prev => ({ ...prev, isServiceWorkerReady: true }));
      });

      // Escuchar actualizaciones
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
          setState(prev => ({ ...prev, hasUpdate: true }));
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Funciones de instalación
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al instalar PWA:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Funciones de Service Worker
  const updateApp = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  // Funciones de datos offline
  const addOfflineData = useCallback((type: string, data: any) => {
    const offlineData: OfflineData = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    const existingData = getOfflineDataFromStorage();
    const updatedData = [...existingData, offlineData];
    localStorage.setItem('pwa_offline_data', JSON.stringify(updatedData));

    // Intentar sincronizar si está online
    if (state.isOnline) {
      syncOfflineData();
    }
  }, [state.isOnline]);

  const getOfflineData = useCallback((type?: string): OfflineData[] => {
    const data = getOfflineDataFromStorage();
    return type ? data.filter(item => item.type === type) : data;
  }, []);

  const syncOfflineData = useCallback(async () => {
    if (!state.isOnline) return;

    const offlineData = getOfflineDataFromStorage().filter(item => !item.synced);
    
    for (const item of offlineData) {
      try {
        // Aquí implementarías la lógica específica de sincronización
        // según el tipo de datos
        await syncDataItem(item);
        
        // Marcar como sincronizado
        markAsSynced(item.id);
      } catch (error) {
        console.error('Error sincronizando item:', item.id, error);
      }
    }
  }, [state.isOnline]);

  const clearOfflineData = useCallback((type?: string) => {
    if (type) {
      const data = getOfflineDataFromStorage().filter(item => item.type !== type);
      localStorage.setItem('pwa_offline_data', JSON.stringify(data));
    } else {
      localStorage.removeItem('pwa_offline_data');
    }
  }, []);

  // Funciones de caché
  const cacheUrl = useCallback(async (url: string) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('dynamic-v1');
        await cache.add(url);
      } catch (error) {
        console.error('Error cacheando URL:', url, error);
      }
    }
  }, []);

  const isCached = useCallback(async (url: string): Promise<boolean> => {
    if ('caches' in window) {
      try {
        const response = await caches.match(url);
        return !!response;
      } catch (error) {
        console.error('Error verificando caché:', url, error);
        return false;
      }
    }
    return false;
  }, []);

  // Funciones de notificaciones
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') return true;
    
    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });
    }
  }, []);

  return {
    ...state,
    promptInstall,
    updateApp,
    addOfflineData,
    getOfflineData,
    syncOfflineData,
    clearOfflineData,
    cacheUrl,
    isCached,
    requestNotificationPermission,
    showNotification
  };
}

// Funciones auxiliares
function getOfflineDataFromStorage(): OfflineData[] {
  try {
    const data = localStorage.getItem('pwa_offline_data');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error leyendo datos offline:', error);
    return [];
  }
}

function markAsSynced(id: string) {
  const data = getOfflineDataFromStorage();
  const updatedData = data.map(item => 
    item.id === id ? { ...item, synced: true } : item
  );
  localStorage.setItem('pwa_offline_data', JSON.stringify(updatedData));
}

async function syncDataItem(item: OfflineData): Promise<void> {
  // Implementar lógica de sincronización específica según el tipo
  switch (item.type) {
    case 'consumption_reading':
      // Sincronizar lectura de consumo
      await fetch('/api/consumption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      break;
      
    case 'calculation':
      // Sincronizar cálculo
      await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      break;
      
    default:
      console.warn('Tipo de datos no reconocido para sincronización:', item.type);
  }
}

// Hook para detectar si la app está instalada
export function useIsInstalled(): boolean {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();
    window.addEventListener('resize', checkInstalled);
    
    return () => window.removeEventListener('resize', checkInstalled);
  }, []);

  return isInstalled;
}