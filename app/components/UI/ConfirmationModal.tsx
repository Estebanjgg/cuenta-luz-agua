'use client';

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'info',
  isLoading = false
}: ConfirmationModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      default:
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
    }
  };

  const { icon, bgColor, borderColor, buttonColor } = getIconAndColors();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className={`flex items-center space-x-3 p-4 ${bgColor} ${borderColor} border rounded-lg mb-4`}>
            <span className="text-2xl">{icon}</span>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              {cancelText || t('confirmationModal.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 ${buttonColor}`}
              disabled={isLoading}
            >
              {isLoading ? t('confirmationModal.processing') : (confirmText || t('confirmationModal.confirm'))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}