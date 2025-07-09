'use client'

import React, { useState } from 'react'
import { AnimatedLoginForm } from './AnimatedLoginForm'
import { SignUpForm } from './SignUpForm'

export const AuthComponent: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Control de Energía
          </h1>
          <p className="text-gray-600">
            Gestiona tu consumo eléctrico de manera inteligente
          </p>
        </div>
        
        {isLogin ? (
          <AnimatedLoginForm onToggleMode={toggleMode} />
        ) : (
          <SignUpForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  )
}