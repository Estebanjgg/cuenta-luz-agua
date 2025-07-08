'use client';

import { useLanguage, Language } from '../../contexts/LanguageContext';
import { useState } from 'react';

interface LanguageSelectorProps {
  className?: string;
}

const SpainFlag = () => (
  <svg width="20" height="15" viewBox="0 0 512 341" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="341" fill="#AA151B"/>
    <rect y="85" width="512" height="171" fill="#F1BF00"/>
    <rect y="256" width="512" height="85" fill="#AA151B"/>
  </svg>
);

const BrazilFlag = () => (
  <svg width="20" height="15" viewBox="0 0 512 341" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="341" fill="#009739"/>
    <polygon points="256,85 356,170 256,255 156,170" fill="#FEDD00"/>
    <circle cx="256" cy="170" r="35" fill="#012169"/>
    <path d="M256 145 L256 195 M231 170 L281 170" stroke="white" strokeWidth="8"/>
  </svg>
);

const languages = [
  { code: 'es' as Language, name: 'Español', flag: <SpainFlag /> },
  { code: 'pt-BR' as Language, name: 'Português (BR)', flag: <BrazilFlag /> }
];

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors duration-200"
        aria-label={t('languageSelector.selectLanguage')}
      >
        <span className="inline-flex items-center justify-center w-5 h-4 rounded-sm overflow-hidden">
          {currentLanguage?.flag}
        </span>
        <span className="text-white text-sm font-medium hidden sm:block">
          {currentLanguage?.code.toUpperCase()}
        </span>
        <svg 
          className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu desplegable */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{t('languageSelector.selectLanguage')}</p>
                <p className="text-xs text-gray-500">{t('languageSelector.chooseLanguage')}</p>
              </div>
              
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                    language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-5 h-4 rounded-sm overflow-hidden">
                    {lang.flag}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium">{lang.name}</span>
                    {language === lang.code && (
                      <div className="flex items-center mt-1">
                        <svg className="w-3 h-3 text-blue-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-blue-600">{t('languageSelector.active')}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}