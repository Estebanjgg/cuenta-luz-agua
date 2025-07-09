'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TooltipHelperProps {
  type: 'reading' | 'measurement' | 'tariff';
  className?: string;
}

export default function TooltipHelper({ type, className = '' }: TooltipHelperProps) {
  const { t } = useLanguage();
  // Estado del tooltip
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Debug: Log cuando cambia el estado
  useEffect(() => {
  }, [showTooltip]);

  const getTooltipContent = () => {
    switch (type) {
      case 'reading':
        return {
          title: t('tooltipHelper.readingTitle'),
          description: t('tooltipHelper.readingDescription'),
          imageSrc: '/images/factura-ejemplo/factura-ejemplo-kwh-data-inicial.png',
          imageAlt: t('tooltipHelper.readingImageAlt')
        };
      case 'measurement':
        return {
          title: t('tooltipHelper.measurementTitle'),
          description: t('tooltipHelper.measurementDescription'),
          imageSrc: '/images/factura-ejemplo/factura-ejemplo-kwh-data-inicial.png',
          imageAlt: t('tooltipHelper.measurementImageAlt')
        };
      case 'tariff':
        return {
          title: t('tooltipHelper.tariffTitle'),
          description: t('tooltipHelper.tariffDescription'),
          imageSrc: '/images/factura-ejemplo/factura-ejemplo-kwh-data-inicial.png',
          imageAlt: t('tooltipHelper.tariffImageAlt')
        };
      default:
        return {
          title: '',
          description: '',
          imageSrc: '',
          imageAlt: ''
        };
    }
  };

  const content = getTooltipContent();



  const handleCloseTooltip = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowTooltip(false);
  };

  const handleOpenTooltip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(true);
  };



  // Manejar tecla ESC para cerrar tooltip
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseTooltip();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          if (showTooltip) {
            handleCloseTooltip(e);
          } else {
            handleOpenTooltip(e);
          }
        }}
        className="ml-2 p-1 text-blue-500 hover:text-blue-700 transition-colors rounded-full hover:bg-blue-50"
        title={t('tooltipHelper.helpButton')}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {showTooltip && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => handleCloseTooltip(e)}
          />
          
          {/* Tooltip modal - Siempre centrado */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-xl p-4 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{content.title}</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{content.description}</p>
            
            {/* Imagen de ayuda */}
            <div className="bg-gray-50 rounded-lg p-2 mb-3 max-h-64 overflow-y-auto">
              <div className="relative">
                <img 
                  src={content.imageSrc}
                  alt={content.imageAlt}
                  className="w-full h-auto rounded border max-w-full object-contain cursor-pointer"
                  loading="lazy"
                  onClick={(e) => handleCloseTooltip(e)}
                  onError={(e) => {
                    // Si la imagen no se encuentra, mostrar un placeholder
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBkZSBheXVkYTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                💡 Haz clic en la imagen para cerrar el tooltip
              </p>
            </div>
            
            <div className="text-xs text-gray-500 mb-4">
              {t('tooltipHelper.helpNote')}
            </div>
            
            {/* Botón Cerrar */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  handleCloseTooltip(e);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
            </div>
          </div>
        </>
      )}


    </div>
  );
}