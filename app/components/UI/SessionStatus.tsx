'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAutoLogout } from '../../hooks/useAutoLogout';
import { useLanguage } from '../../contexts/LanguageContext';

interface SessionStatusProps {
  showInProduction?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

export default function SessionStatus({ 
  showInProduction = false, 
  position = 'bottom-right',
  compact = false 
}: SessionStatusProps) {
  const { user } = useAuth();
  const { getTimeUntilLogout, extendSession } = useAutoLogout();
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Solo mostrar en desarrollo o si está explícitamente habilitado
  const shouldShow = process.env.NODE_ENV === 'development' || showInProduction;

  useEffect(() => {
    if (!shouldShow || !user) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    
    const updateTimeLeft = () => {
      const remaining = getTimeUntilLogout();
      setTimeLeft(remaining);
    };

    // Actualizar inmediatamente
    updateTimeLeft();

    // Actualizar cada segundo
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [shouldShow, user, getTimeUntilLogout]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (compact) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}m ${seconds}s`;
  };

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-40';
    
    switch (position) {
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'bottom-right':
      default:
        return `${baseClasses} bottom-4 right-4`;
    }
  };

  const getStatusColor = () => {
    const minutes = Math.floor(timeLeft / (1000 * 60));
    
    if (minutes <= 2) return 'bg-red-500';
    if (minutes <= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!isVisible) return null;

  if (compact) {
    return (
      <div className={`${getPositionClasses()} group`}>
        <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            <span className="text-xs font-mono text-gray-600">
              {formatTime(timeLeft)}
            </span>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {t('sessionStatus.autoLogoutTooltip')}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={getPositionClasses()}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">{t('sessionStatus.title')}</h3>
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        </div>
        
        {/* Información del usuario */}
        <div className="mb-2">
          <p className="text-xs text-gray-500 truncate">
            {user?.email || t('sessionStatus.authenticatedUser')}
          </p>
        </div>
        
        {/* Tiempo restante */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1">{t('sessionStatus.timeRemaining')}</p>
          <p className="text-lg font-mono font-bold text-gray-800">
            {formatTime(timeLeft)}
          </p>
        </div>
        
        {/* Botón de extensión */}
        <button
          onClick={extendSession}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors duration-200"
        >
          {t('sessionStatus.extendSession')}
        </button>
        
        {/* Nota de desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            {t('sessionStatus.onlyInDevelopment')}
          </p>
        )}
      </div>
    </div>
  );
}