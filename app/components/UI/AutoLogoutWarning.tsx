'use client';

import { useState, useEffect } from 'react';

interface AutoLogoutWarningProps {
  onExtendSession: () => void;
  onEndSession?: () => void;
  getTimeUntilLogout: () => number;
}

export default function AutoLogoutWarning({ 
  onExtendSession, 
  onEndSession,
  getTimeUntilLogout 
}: AutoLogoutWarningProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Actualizar el tiempo restante cada segundo
    const interval = setInterval(() => {
      const remaining = getTimeUntilLogout();
      const remainingSeconds = Math.ceil(remaining / 1000);
      setTimeLeft(remainingSeconds);
    }, 1000);

    // Establecer el tiempo inicial
    const initialRemaining = getTimeUntilLogout();
    setTimeLeft(Math.ceil(initialRemaining / 1000));

    return () => clearInterval(interval);
  }, [getTimeUntilLogout]);

  const handleExtendSession = () => {
    onExtendSession();
  };

  const handleLogout = () => {
    onEndSession?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-pulse">
          {/* Icono de advertencia */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
            <svg 
              className="w-8 h-8 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* Título */}
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
            ⚠️ Sesión por Expirar
          </h2>

          {/* Mensaje */}
          <p className="text-gray-600 text-center mb-4">
            Tu sesión se cerrará automáticamente en:
          </p>

          {/* Contador */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-2">
              <span className="text-2xl font-bold text-red-600">
                {formatTime(timeLeft)}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              minutos:segundos
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExtendSession}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              Extender Sesión
            </button>
            
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              Cerrar Sesión
            </button>
          </div>

          {/* Nota informativa */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              💡 <strong>Tip:</strong> Tu sesión se extiende automáticamente cuando interactúas con la aplicación.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}