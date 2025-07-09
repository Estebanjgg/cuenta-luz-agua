'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface AnimatedLoginFormProps {
  onToggleForm: () => void;
}

export function AnimatedLoginForm({ onToggleForm }: AnimatedLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  
  const { signIn } = useAuth();
  const { t } = useLanguage();

  // Auto-blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 2000 + 3000); // Random interval between 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailFocus = () => {
    setIsEmailFocused(true);
    setIsPasswordFocused(false);
  };

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
    setIsEmailFocused(false);
  };

  const handleBlur = () => {
    setIsEmailFocused(false);
    setIsPasswordFocused(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Animated Avatar - Yeti Style */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48 rounded-full border-4 border-blue-700 overflow-hidden bg-gradient-to-b from-sky-200 to-blue-300">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                style={{ transform: 'scale(1.05)' }}
              >
                {/* Background Circle */}
                <circle cx="100" cy="100" r="95" fill="#a9ddf3" />
                
                {/* Body/Torso */}
                <path 
                  d="M200,158.5c0-20.2-14.8-36.5-35-36.5h-14.9V72.8c0-27.4-21.7-50.4-49.1-50.8c-28-0.5-50.9,22.1-50.9,50v50 H35.8C16,122,0,138,0,157.8L0,213h200L200,158.5z" 
                  fill="#FFFFFF" 
                  stroke="#3A5E77" 
                  strokeWidth="2.5"
                />
                
                {/* Face */}
                <path 
                  d="M134.5,46v35.5c0,21.815-15.446,39.5-34.5,39.5s-34.5-17.685-34.5-39.5V46" 
                  fill="#DDF1FA"
                />
                
                {/* Hair/Fur on top */}
                <path 
                  d="M81.457,27.929 c1.755-4.084,5.51-8.262,11.253-11.77c0.979,2.565,1.883,5.14,2.712,7.723c3.162-4.265,8.626-8.27,16.272-11.235 c-0.737,3.293-1.588,6.573-2.554,9.837c4.857-2.116,11.049-3.64,18.428-4.156c-2.403,3.23-5.021,6.391-7.852,9.474" 
                  fill="#FFFFFF" 
                  stroke="#3A5E77" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                
                {/* Left Ear */}
                <g className="ear-left">
                  <circle cx="47" cy="83" r="11.5" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="2.5" />
                  <path d="M46.3 78.9c-2.3 0-4.1 1.9-4.1 4.1 0 2.3 1.9 4.1 4.1 4.1" 
                        fill="#ddf1fa" stroke="#3a5e77" strokeWidth="2.5" 
                        strokeLinecap="round" strokeLinejoin="round" />
                </g>
                
                {/* Right Ear */}
                <g className="ear-right">
                  <circle cx="153" cy="83" r="11.5" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="2.5" />
                  <path d="M153.7,78.9 c2.3,0,4.1,1.9,4.1,4.1c0,2.3-1.9,4.1-4.1,4.1" 
                        fill="#ddf1fa" stroke="#3a5e77" strokeWidth="2.5" 
                        strokeLinecap="round" strokeLinejoin="round" />
                </g>
                
                {/* Eyebrow area */}
                <path 
                  d="M63.56,55.102 c6.243,5.624,13.38,10.614,21.296,14.738c2.071-2.785,4.01-5.626,5.816-8.515c4.537,3.785,9.583,7.263,15.097,10.329 c1.197-3.043,2.287-6.104,3.267-9.179c4.087,2.004,8.427,3.761,12.996,5.226c0.545-3.348,0.986-6.696,1.322-10.037 c4.913-0.481,9.857-1.34,14.787-2.599" 
                  fill="#FFFFFF" 
                  stroke="#3A5E77" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`transition-all duration-300 ${
                    isPasswordFocused ? 'translate-y-1' : ''
                  }`}
                />
                
                {/* Eyes - Open State */}
                <g className={`transition-all duration-300 ${
                  isPasswordFocused ? 'opacity-0' : 'opacity-100'
                }`}>
                  {/* Left Eye */}
                  <circle 
                    cx="85.5" 
                    cy="78.5" 
                    r="3.5" 
                    fill="#3a5e77"
                    className={`transition-all duration-150 ${
                      isBlinking ? 'scale-y-0' : 'scale-y-100'
                    }`}
                    style={{ transformOrigin: '85.5px 78.5px' }}
                  />
                  <circle 
                    cx="84" 
                    cy="76" 
                    r="1" 
                    fill="#ffffff"
                    className={`transition-all duration-150 ${
                      isBlinking ? 'scale-y-0' : 'scale-y-100'
                    }`}
                    style={{ transformOrigin: '84px 76px' }}
                  />
                  
                  {/* Right Eye */}
                  <circle 
                    cx="114.5" 
                    cy="78.5" 
                    r="3.5" 
                    fill="#3a5e77"
                    className={`transition-all duration-150 ${
                      isBlinking ? 'scale-y-0' : 'scale-y-100'
                    }`}
                    style={{ transformOrigin: '114.5px 78.5px' }}
                  />
                  <circle 
                    cx="113" 
                    cy="76" 
                    r="1" 
                    fill="#ffffff"
                    className={`transition-all duration-150 ${
                      isBlinking ? 'scale-y-0' : 'scale-y-100'
                    }`}
                    style={{ transformOrigin: '113px 76px' }}
                  />
                </g>
                
                {/* Nose */}
                <path 
                  d="M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3c-1.3-1.6-.2-3.7 1.8-3.7z" 
                  fill="#3a5e77"
                />
                
                {/* Mouth */}
                <path 
                  d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z" 
                  fill="none" 
                  stroke="#3A5E77" 
                  strokeWidth="2.5" 
                  strokeLinejoin="round"
                  className={`transition-all duration-300 ${
                    email.length > 0 || password.length > 0 ? 'translate-y-1' : ''
                  }`}
                />
                
                {/* Chin detail */}
                <path 
                  d="M84.1 121.6c2.7 2.9 6.1 5.4 9.8 7.5l.9-4.5c2.9 2.5 6.3 4.8 10.2 6.5 0-1.9-.1-3.9-.2-5.8 3 1.2 6.2 2 9.7 2.5-.3-2.1-.7-4.1-1.2-6.1" 
                  fill="none" 
                  stroke="#3a5e77" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                
                {/* Arms covering eyes when password is focused */}
                <g className={`transition-all duration-500 ease-in-out ${
                  isPasswordFocused ? 'opacity-100' : 'opacity-0'
                }`}>
                  {/* Left Arm */}
                  <g className={`transition-all duration-500 ${
                    isPasswordFocused ? 'translate-x-0 translate-y-0' : '-translate-x-20 translate-y-20'
                  }`}>
                    <path 
                      d="M121.3,98.4 111,59.7 149.8,49.3 169.8,85.4" 
                      fill="#DDF1FA" 
                      stroke="#3A5E77" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    {/* Hand fingers */}
                    <g transform="translate(160, 70)">
                      <path d="M158.3,67.8l23.1-6.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-23.1,6.2" 
                            fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" />
                      <path d="M160.8,77.5l19.4-5.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-18.3,4.9" 
                            fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" />
                    </g>
                  </g>
                  
                  {/* Right Arm */}
                  <g className={`transition-all duration-500 ${
                    isPasswordFocused ? 'translate-x-0 translate-y-0' : 'translate-x-20 translate-y-20'
                  }`}>
                    <path 
                      d="M78.7,98.4 89,59.7 50.2,49.3 30.2,85.4" 
                      fill="#DDF1FA" 
                      stroke="#3A5E77" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    {/* Hand fingers */}
                    <g transform="translate(40, 70)">
                      <path d="M41.7,67.8l-23.1-6.2c-2.7-0.7-5.4,0.9-6.1,3.5v0c-0.7,2.7,0.9,5.4,3.5,6.1l23.1,6.2" 
                            fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" />
                      <path d="M39.2,77.5l-19.4-5.2c-2.7-0.7-5.4,0.9-6.1,3.5v0c-0.7,2.7,0.9,5.4,3.5,6.1l18.3,4.9" 
                            fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" />
                    </g>
                  </g>
                </g>
              </svg>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-bold text-blue-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleEmailFocus}
                onBlur={handleBlur}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-blue-600 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-lg font-semibold transition-all duration-200 bg-blue-50"
                placeholder="email@domain.com"
              />
              {email.length === 0 && !isEmailFocused && (
                <p className="absolute top-12 left-4 text-blue-600 text-lg font-normal opacity-65 pointer-events-none transition-all duration-200">
                  email@domain.com
                </p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-bold text-blue-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={handleBlur}
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-blue-600 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-lg font-semibold transition-all duration-200 bg-blue-50"
                  placeholder={t('auth.password')}
                />
                <label className="absolute top-1 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 cursor-pointer">
                  <span className="text-sm font-medium mr-2">
                    {showPassword ? t('auth.hide') : t('auth.show')}
                  </span>
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 border-blue-600 rounded transition-all duration-200 ${
                    showPassword ? 'bg-blue-600' : 'bg-blue-50'
                  }`}>
                    {showPassword && (
                      <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </label>
              </div>
            </div>
        
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('auth.signingIn')}
                  </div>
                ) : (
                  t('auth.signIn')
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onToggleForm}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 underline"
              >
                {t('auth.noAccount')} {t('auth.signUp')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}