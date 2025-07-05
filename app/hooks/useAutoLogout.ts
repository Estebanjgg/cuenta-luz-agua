'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UseAutoLogoutOptions {
  timeout?: number; // Tiempo en milisegundos (por defecto 20 minutos)
  events?: string[]; // Eventos a escuchar para detectar actividad
  onWarning?: (timeLeft: number) => void; // Callback cuando quedan 2 minutos
  warningTime?: number; // Tiempo antes del logout para mostrar advertencia (por defecto 2 minutos)
}

const DEFAULT_TIMEOUT = 20 * 60 * 1000; // 20 minutos en milisegundos
const DEFAULT_WARNING_TIME = 2 * 60 * 1000; // 2 minutos en milisegundos
const DEFAULT_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'keydown'
];

export const useAutoLogout = (options: UseAutoLogoutOptions = {}) => {
  const {
    timeout = DEFAULT_TIMEOUT,
    events = DEFAULT_EVENTS,
    onWarning,
    warningTime = DEFAULT_WARNING_TIME
  } = options;

  const { user, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Función para limpiar los timeouts
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  // Función para cerrar sesión automáticamente
  const autoSignOut = useCallback(async () => {
    try {
      await signOut();
      console.log('Sesión cerrada automáticamente por inactividad');
    } catch (error) {
      console.error('Error al cerrar sesión automáticamente:', error);
    }
  }, [signOut]);

  // Función para mostrar advertencia
  const showWarning = useCallback(() => {
    const timeLeft = Math.ceil(warningTime / 1000); // Convertir a segundos
    onWarning?.(timeLeft);
  }, [onWarning, warningTime]);

  // Función para reiniciar el timer
  const resetTimer = useCallback(() => {
    if (!user) return;

    lastActivityRef.current = Date.now();
    clearTimeouts();

    // Configurar timeout para la advertencia
    if (onWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        showWarning();
      }, timeout - warningTime);
    }

    // Configurar timeout para el logout automático
    timeoutRef.current = setTimeout(() => {
      autoSignOut();
    }, timeout);
  }, [user, timeout, warningTime, onWarning, clearTimeouts, autoSignOut, showWarning]);

  // Función para manejar la actividad del usuario
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Solo reiniciar si ha pasado al menos 1 segundo desde la última actividad
    // Esto evita reiniciar el timer demasiado frecuentemente
    if (timeSinceLastActivity > 1000) {
      resetTimer();
    }
  }, [resetTimer]);

  // Función para extender la sesión manualmente
  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Función para obtener el tiempo restante hasta el logout
  const getTimeUntilLogout = useCallback(() => {
    if (!user || !timeoutRef.current) return 0;
    
    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = timeout - elapsed;
    return Math.max(0, remaining);
  }, [user, timeout]);

  useEffect(() => {
    // Solo activar el auto-logout si hay un usuario autenticado
    if (!user) {
      clearTimeouts();
      return;
    }

    // Inicializar el timer
    resetTimer();

    // Agregar event listeners para detectar actividad
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Cleanup function
    return () => {
      clearTimeouts();
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [user, events, handleUserActivity, resetTimer, clearTimeouts]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return {
    extendSession,
    getTimeUntilLogout,
    isActive: !!user && !!timeoutRef.current
  };
};

export default useAutoLogout;