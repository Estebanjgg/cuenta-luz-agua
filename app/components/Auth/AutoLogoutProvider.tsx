'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAutoLogout } from '../../hooks/useAutoLogout';
import AutoLogoutWarning from '../UI/AutoLogoutWarning';

interface AutoLogoutProviderProps {
  children: React.ReactNode;
  timeout?: number;
  warningTime?: number;
}

export const AutoLogoutProvider: React.FC<AutoLogoutProviderProps> = ({
  children,
  timeout = 20 * 60 * 1000, // 20 minutos por defecto
  warningTime = 2 * 60 * 1000, // 2 minutos por defecto
}) => {
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const { user } = useAuth();

  // Hook de auto-logout con configuración personalizada
  const { extendSession, getTimeUntilLogout } = useAutoLogout({
    timeout,
    warningTime,
    onWarning: () => {
      setShowLogoutWarning(true);
    },
  });

  const handleExtendSession = () => {
    setShowLogoutWarning(false);
    extendSession();
  };

  const handleEndSession = () => {
    setShowLogoutWarning(false);
    // El auto-logout se encargará de cerrar la sesión
  };

  // Solo renderizar si hay un usuario autenticado
  if (!user) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {/* Componente de advertencia de auto-logout */}
      {showLogoutWarning && (
        <AutoLogoutWarning 
          onExtendSession={handleExtendSession}
          onEndSession={handleEndSession}
          getTimeUntilLogout={getTimeUntilLogout}
        />
      )}
    </>
  );
};

export default AutoLogoutProvider;