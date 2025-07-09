'use client';

import { useState, useEffect, useRef } from 'react';
import { ValidationResult } from '../../../types';
import { formatNumber } from '../../../utils/calculations';
import { useLanguage } from '../../../contexts/LanguageContext';
import { CameraCapture } from '..';
import TooltipHelper from '../TooltipHelper';

interface ReadingFormProps {
  onAddReading: (date: string, value: number) => Promise<ValidationResult> | ValidationResult;
  currentReading: number;
  currentMonth: {
    month: string;
    year: number;
    readingDay?: number;
    initialReading: number;
  };
  onUpdateReadingDay?: (newReadingDay: number) => void;
}

export default function ReadingForm({ onAddReading, currentReading, currentMonth, onUpdateReadingDay }: ReadingFormProps) {
  const { t } = useLanguage();
  const [date, setDate] = useState('');
  const [reading, setReading] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [isEditingReadingDay, setIsEditingReadingDay] = useState(false);
  const [editableReadingDay, setEditableReadingDay] = useState(currentMonth.readingDay || 1);
  const menuRef = useRef<HTMLDivElement>(null);


  // Establecer fecha actual solo en el cliente para evitar errores de hidratación
  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Actualizar editableReadingDay cuando cambie currentMonth.readingDay
  useEffect(() => {
    setEditableReadingDay(currentMonth.readingDay || 1);
  }, [currentMonth.readingDay]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCameraMenu(false);
      }
    };

    if (showCameraMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCameraMenu]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const readingValue = parseFloat(reading);
    
    if (isNaN(readingValue)) {
      setError('Por favor ingresa un valor numérico válido');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await onAddReading(date, readingValue);
      
      if (result.isValid) {
        setReading('');
        setDate(new Date().toISOString().split('T')[0]);
      } else {
        setError(result.message || 'Error al agregar la lectura');
      }
    } catch (error) {
      setError('Error al agregar la lectura');
    }
    
    setIsSubmitting(false);
  };

  const handleReadingChange = (value: string) => {
    setReading(value);
    if (error) {
      setError('');
    }
  };

  // Manejar lectura extraída del OCR
  const handleReadingExtracted = (extractedValue: string) => {
    setReading(extractedValue);
    setShowCamera(false);
    if (error) {
      setError('');
    }
  };

  // Procesar imagen subida
  const processUploadedImage = async (file: File) => {
    try {
      // Crear un canvas para procesar la imagen
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        // Configurar el canvas con las dimensiones de la imagen
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Dibujar la imagen en el canvas
        ctx?.drawImage(img, 0, 0);
        
        // Obtener los datos de la imagen
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        
        // Aquí podrías integrar OCR (Tesseract.js u otro)
        // Por ahora, simularemos la extracción
        console.log('Procesando imagen subida para OCR...');
        
        // Placeholder para OCR - en una implementación real usarías Tesseract.js
        // const { data: { text } } = await Tesseract.recognize(imageData, 'eng');
        // const extractedReading = extractMeterReading(text);
        
        // Por ahora, solo mostramos un mensaje
        alert('Funcionalidad de OCR para imágenes subidas en desarrollo. Por favor, ingresa la lectura manualmente.');
      };
      
      // Cargar la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error procesando imagen:', error);
      alert('Error al procesar la imagen. Por favor, intenta de nuevo.');
    }
  };

  const handleCameraCapture = (imageSrc: string) => {
    setShowCamera(false);
    // Aquí puedes procesar la imagen capturada
    console.log('Imagen capturada:', imageSrc);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-transparent rounded-full opacity-30 -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200 to-transparent rounded-full opacity-30 translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {t('addNewReading')}
            </h2>
            <p className="text-gray-600 text-sm">
              {t('registerElectricConsumption')}
            </p>
          </div>
        </div>

        {/* Componente de captura de cámara */}
         {showCamera && (
           <div className="mb-6">
             <div className="flex justify-between items-center mb-4">
               <h4 className="text-lg font-semibold text-gray-800">{t('cameraCapture.title')}</h4>
               <button
                 type="button"
                 onClick={() => setShowCamera(false)}
                 className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
               >
                 {t('cameraCapture.close')}
               </button>
             </div>
             <CameraCapture 
               onReadingExtracted={handleReadingExtracted}
               isProcessing={isSubmitting}
             />
           </div>
         )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-6m0 0V7m0 6h6m-6 0H6" />
                </svg>
                {t('readingDate')}:
                <TooltipHelper type="measurement" />
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('meterReading')}:
                <TooltipHelper type="reading" />
              </label>
              
              <div className="relative">
                 <input
                   type="number"
                   value={reading}
                   onChange={(e) => handleReadingChange(e.target.value)}
                   className={`w-full p-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                     error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500'
                   }`}
                   placeholder={`${t('mustBeGreaterThan')} ${currentReading.toLocaleString()}`}
                    step="0.1"
                    required
                 />
                 
                 {/* Ícono de cámara dentro del input */}
                 <button
                   type="button"
                   onClick={() => setShowCameraMenu(!showCameraMenu)}
                   className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                   title="Capturar lectura"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                 </button>
                 
                 {/* Menú de cámara */}
                     {showCameraMenu && (
                       <div ref={menuRef} className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                         <div className="py-2">
                           <button
                             type="button"
                             onClick={() => {
                               setShowCamera(true);
                               setShowCameraMenu(false);
                             }}
                             className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center space-x-3 group"
                           >
                             <div className="bg-green-100 group-hover:bg-green-200 p-2 rounded-lg transition-colors">
                               <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                               </svg>
                             </div>
                             <div>
                               <p className="font-medium text-gray-900">Fotografiar medidor o subir imagen</p>
                               <p className="text-xs text-gray-500">Activar cámara</p>
                             </div>
                           </button>
                         </div>
                       </div>
                     )}
               </div>
            </div>
          </div>
        
        {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-blue-800 font-semibold text-sm mb-2">{t('importantInfo')}</p>
                <p className="text-blue-700 text-sm mb-2">
                  {t('currentMeterReading')} <span className="font-bold">{currentReading.toLocaleString()} kWh</span>
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-blue-700 text-sm">
                    {t('initialMeasurementDay')}:
                  </p>
                  {isEditingReadingDay ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={editableReadingDay}
                        onChange={(e) => setEditableReadingDay(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      />
                      <button
                         type="button"
                         onClick={() => {
                           if (onUpdateReadingDay) {
                             onUpdateReadingDay(editableReadingDay);
                           }
                           setIsEditingReadingDay(false);
                         }}
                         className="text-green-600 hover:text-green-700 p-1"
                         title="Guardar"
                       >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditableReadingDay(currentMonth.readingDay || 1);
                          setIsEditingReadingDay(false);
                        }}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Cancelar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-800">{currentMonth.readingDay || 1}</span>
                      <button
                        type="button"
                        onClick={() => setIsEditingReadingDay(true)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Editar día de medición"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !reading || !date}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${
              isSubmitting || !reading || !date
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-200 hover:shadow-xl'
            }`}
          >
            <div className="flex items-center justify-center">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('addingReading')}...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('addReading')}
                </>
              )}
            </div>
          </button>
      </form>
      </div>
    </div>
  );
}