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
    <>
      {isLogin ? (
        <AnimatedLoginForm onToggleMode={toggleMode} />
      ) : (
        <SignUpForm onToggleMode={toggleMode} />
      )}
    </>
  )
}