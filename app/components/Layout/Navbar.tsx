'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../UI/LanguageSelector';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onLogout: () => void;
  onShowTariffManager?: () => void;
  currentPage?: string;
}

export default function Navbar({ onLogout, onShowTariffManager, currentPage }: NavbarProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="relative z-50 bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-white/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <span className="text-xl sm:text-2xl">⚡</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                  {t('navbar.title')}
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm hidden sm:block truncate">
                  {t('navbar.subtitle')}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <Link 
                href="/control-consumo"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/' 
                    ? 'bg-white/20 text-white' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                📊 {t('navbar.consumptionControl')}
              </Link>
              <Link 
                href="/calculadora"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/calculadora' 
                    ? 'bg-white/20 text-white' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                🏠 {t('navbar.applianceCalculator')}
              </Link>
            </div>
            
            <LanguageSelector />
            
            {/* Avatar y datos del usuario */}
            <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-2">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              
              <div>
                <p className="text-white font-medium text-sm">
                  {user?.email?.split('@')[0] || t('user')}
                </p>
                <p className="text-blue-100 text-xs">
                  {user?.email || 'usuario@ejemplo.com'}
                </p>
              </div>
            </div>

            {/* Desktop Dropdown Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email?.split('@')[0] || t('user')}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'usuario@ejemplo.com'}
                    </p>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{t('navbar.profile')}</span>
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t('navbar.settings')}</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-2"></div>
                  
                  {onShowTariffManager && (
                    <button 
                      onClick={onShowTariffManager}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      <span>{t('navbar.manageTariffs')}</span>
                    </button>
                  )}
                  
                  <div className="border-t border-gray-100 mt-2">
                    <button 
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>{t('navbar.logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <LanguageSelector className="scale-90" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors duration-200"
              aria-label={t('navbar.openMenu')}
            >
              <svg 
                className={`w-6 h-6 text-white transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-blue-500/30 bg-blue-700/50 backdrop-blur-sm">
            <div className="px-4 py-4 space-y-4">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xl">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user?.email?.split('@')[0] || t('user')}
                  </p>
                  <p className="text-blue-100 text-xs truncate">
                    {user?.email || 'usuario@ejemplo.com'}
                  </p>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2 mb-4">
                <Link 
                  href="/control-consumo"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    pathname === '/' 
                      ? 'bg-white/20 text-white' 
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>📊 {t('navbar.consumptionControl')}</span>
                </Link>
                
                <Link 
                  href="/calculadora"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    pathname === '/calculadora' 
                      ? 'bg-white/20 text-white' 
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>🏠 {t('navbar.applianceCalculator')}</span>
                </Link>
              </div>

              {/* Mobile Menu Items */}
              <div className="space-y-2 border-t border-blue-500/30 pt-4">
                <button className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg flex items-center space-x-3 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{t('navbar.profile')}</span>
                </button>
                
                <button className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg flex items-center space-x-3 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{t('navbar.settings')}</span>
                </button>
                
                {onShowTariffManager && (
                  <button 
                    onClick={() => {
                      onShowTariffManager();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <span>{t('navbar.manageTariffs')}</span>
                  </button>
                )}
                
                <div className="border-t border-blue-500/30 pt-2 mt-2">
                  <button 
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-300 hover:bg-red-500/20 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>{t('navbar.logout')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}