'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerRegistrationProps {
  onUpdate?: () => void;
  onSuccess?: () => void;
}

export default function ServiceWorkerRegistration({ 
  onUpdate, 
  onSuccess 
}: ServiceWorkerRegistrationProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Verificar si el navegador soporta Service Workers
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Detectar cambios en la conectividad
    const handleOnline = () => {
      setIsOnline(true);
      // Intentar sincronizar datos offline
      if (registration && 'sync' in registration) {
        (registration as any).sync.register('background-sync').catch(console.error);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar estado inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [registration]);

  const registerServiceWorker = async () => {
    try {
      const swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setRegistration(swRegistration);

      // Verificar si hay una actualización disponible
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              setUpdateAvailable(true);
              onUpdate?.();
            }
          });
        }
      });

      // Service Worker activo
      if (swRegistration.active) {
        console.log('Service Worker activo');
        onSuccess?.();
      }

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_OFFLINE_DATA') {
          console.log('Sincronizando datos offline...');
          // Disparar evento personalizado para que otros componentes puedan reaccionar
          window.dispatchEvent(new CustomEvent('sw-sync-data', {
            detail: { timestamp: event.data.timestamp }
          }));
        }
      });

      console.log('Service Worker registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
    }
  };

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Enviar mensaje al Service Worker para que se active inmediatamente
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recargar la página después de que el nuevo SW tome control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  const cacheImportantUrls = () => {
    if (registration) {
      const urlsToCache = [
        '/',
        '/calculadora',
        '/api/auth/session'
      ];
      
      registration.active?.postMessage({
        type: 'CACHE_URLS',
        urls: urlsToCache
      });
    }
  };

  // Cachear URLs importantes cuando la aplicación se carga
  useEffect(() => {
    if (registration && isOnline) {
      cacheImportantUrls();
    }
  }, [registration, isOnline]);

  return (
    <>
      {/* Notificación de actualización disponible */}
      {updateAvailable && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">
                  Nueva versión disponible
                </h3>
                <p className="mt-1 text-sm text-blue-200">
                  Hay una actualización de la aplicación lista para instalar.
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Actualizar
                  </button>
                  <button
                    onClick={() => setUpdateAvailable(false)}
                    className="bg-transparent hover:bg-blue-500 text-blue-200 hover:text-white px-3 py-1 rounded text-sm font-medium transition-colors border border-blue-400"
                  >
                    Más tarde
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de estado de caché (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40">
          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span>
                {isOnline ? 'Online' : 'Offline'} | SW: {registration ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook personalizado para usar el Service Worker
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator);
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

  const sendMessage = (message: any) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  };

  const requestSync = (tag: string) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return (registration as any).sync.register(tag);
      }).catch(console.error);
    }
  };

  return {
    isSupported,
    isRegistered,
    isOnline,
    sendMessage,
    requestSync
  };
}