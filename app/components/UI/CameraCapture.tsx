'use client';

import React, { useState, useRef, useCallback } from 'react';
import Tesseract, { createWorker } from 'tesseract.js';
import { useLanguage } from '../../contexts/LanguageContext';

interface CameraCaptureProps {
  onReadingExtracted: (value: string) => void;
  isProcessing?: boolean;
}

export default function CameraCapture({ onReadingExtracted, isProcessing = false }: CameraCaptureProps) {
  const { t } = useLanguage();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar soporte de cámara
  const checkCameraSupport = (): boolean => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  // Iniciar cámara
  const startCamera = useCallback(async () => {
    try {
      setError('');
      setIsCapturing(false); // Reset estado antes de empezar
      setIsLoadingCamera(true); // Mostrar indicador de carga
      
      // Verificar soporte de cámara
      if (!checkCameraSupport()) {
        setError(t('cameraCapture.cameraNotSupported'));
        setIsLoadingCamera(false);
        return;
      }
      
      console.log('Solicitando acceso a la cámara...');
      
      // Configuración optimizada para móviles
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Usar cámara trasera en móviles
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        }
      };
      
      // Intentar con configuración completa primero
      let mediaStream: MediaStream;
      try {
        console.log('Intentando configuración completa...');
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Si falla, intentar con configuración básica
        console.warn('Falling back to basic camera configuration:', err);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment'
          }
        });
      }
      
      console.log('Cámara obtenida exitosamente');
      
      // --- INICIO DE CÓDIGO DE DIAGNÓSTICO ---
      console.log('Stream de cámara obtenido:', mediaStream);
      console.log('Tracks activos:', mediaStream.getTracks());
      console.log('Referencia del <video>:', videoRef.current);
      // --- FIN DE CÓDIGO DE DIAGNÓSTICO ---
      
      setStream(mediaStream);
      setIsCapturing(true);
      setIsLoadingCamera(false); // Ocultar indicador de carga
      
      // Usar setTimeout para asegurar que el DOM se actualice antes de acceder al video
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Reproducir video directamente
          console.log('Iniciando reproducción del video...');
          videoRef.current.play().catch(err => {
            console.error('ERROR AL INTENTAR REPRODUCIR VIDEO:', err);
            setError(t('cameraCapture.cameraError'));
            setIsCapturing(false);
            setIsLoadingCamera(false);
          });
        } else {
          console.error('ERROR CRÍTICO: La referencia al elemento <video> es NULA.');
          setError(t('cameraCapture.cameraError'));
          setIsCapturing(false);
          setIsLoadingCamera(false);
        }
      }, 100); // 100ms delay para permitir que el DOM se actualice
        
      // Timeout de seguridad
      setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState === 0) {
          console.error('Video no se cargó en tiempo esperado');
          setError(t('cameraCapture.cameraError'));
          setIsCapturing(false);
          setIsLoadingCamera(false);
          stopCamera();
        }
      }, 10000); // 10 segundos timeout
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setIsCapturing(false); // Asegurar que el estado se resetee
      setIsLoadingCamera(false); // Ocultar indicador de carga
      
      // Mensajes de error específicos
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(t('cameraCapture.permissionDenied'));
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError(t('cameraCapture.noCameraFound'));
      } else if (err.name === 'NotSupportedError') {
        setError(t('cameraCapture.cameraNotSupported'));
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError(t('cameraCapture.cameraInUse'));
      } else {
        setError(t('cameraCapture.cameraError'));
      }
    }
  }, [t]);

  // Detener cámara
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
    setCapturedImage(null);
  }, [stream]);

  // Optimizar imagen para OCR
  const optimizeImageForOCR = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): string => {
    // Calcular dimensiones optimizadas (máximo 1920x1080 para mejor rendimiento)
    const maxWidth = 1920;
    const maxHeight = 1080;
    const currentWidth = canvas.width;
    const currentHeight = canvas.height;
    
    let newWidth = currentWidth;
    let newHeight = currentHeight;
    
    if (currentWidth > maxWidth || currentHeight > maxHeight) {
      const ratio = Math.min(maxWidth / currentWidth, maxHeight / currentHeight);
      newWidth = Math.round(currentWidth * ratio);
      newHeight = Math.round(currentHeight * ratio);
      
      // Crear canvas temporal para redimensionar
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      if (!tempContext) return canvas.toDataURL('image/jpeg', 0.8);
      
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;
      
      // Redimensionar con suavizado
      tempContext.imageSmoothingEnabled = true;
      tempContext.imageSmoothingQuality = 'high';
      tempContext.drawImage(canvas, 0, 0, newWidth, newHeight);
      
      return tempCanvas.toDataURL('image/jpeg', 0.85);
    }
    
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Capturar foto
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    try {
      // Configurar canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Verificar que el video tiene dimensiones válidas
      if (canvas.width === 0 || canvas.height === 0) {
        setError(t('cameraCapture.cameraError'));
        return;
      }
      
      // Dibujar el frame actual del video en el canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Optimizar imagen para OCR
      const imageDataUrl = optimizeImageForOCR(canvas, context);
      setCapturedImage(imageDataUrl);
      
      // Detener la cámara después de capturar
      stopCamera();
      
      // Procesar la imagen con OCR
      processImageWithOCR(imageDataUrl);
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError(t('cameraCapture.cameraError'));
    }
  }, [stopCamera]);

  // Validar imagen antes del procesamiento
  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Verificar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError(t('cameraCapture.invalidFileType'));
        resolve(false);
        return;
      }
      
      // Verificar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(t('cameraCapture.fileTooLarge'));
        resolve(false);
        return;
      }
      
      // Verificar que la imagen se puede cargar
      const img = new Image();
      img.onload = () => {
        // Verificar dimensiones mínimas
        if (img.width < 100 || img.height < 100) {
          setError(t('cameraCapture.imageTooSmall'));
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => {
        setError(t('cameraCapture.invalidImage'));
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Manejar selección de archivo
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setError('');
    
    // Validar imagen
    const isValid = await validateImage(file);
    if (!isValid) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setCapturedImage(imageDataUrl);
      processImageWithOCR(imageDataUrl);
    };
    reader.onerror = () => {
      setError(t('cameraCapture.fileReadError'));
    };
    reader.readAsDataURL(file);
  }, []);

  // Validar imagen antes del OCR
  const validateImageForOCR = (imageDataUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Verificar que la imagen tiene dimensiones válidas
        if (img.width < 50 || img.height < 50) {
          setError(t('cameraCapture.imageTooSmall'));
          resolve(false);
        } else if (img.width > 4000 || img.height > 4000) {
          setError(t('cameraCapture.imageTooLarge'));
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => {
        setError(t('cameraCapture.invalidImage'));
        resolve(false);
      };
      img.src = imageDataUrl;
    });
  };

  // Procesar imagen con OCR
  const processImageWithOCR = useCallback(async (imageDataUrl: string) => {
    setIsProcessingOCR(true);
    setError('');
    setOcrProgress(0);
    
    try {
      // Validar imagen antes del procesamiento
      const isValidForOCR = await validateImageForOCR(imageDataUrl);
      if (!isValidForOCR) {
        return;
      }

      // Crear worker con configuración mejorada
      const worker = await createWorker('spa', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
        errorHandler: (err) => {
          console.error('Tesseract Worker Error:', err);
        }
      });
      
      try {
        // Configurar Tesseract para mejorar la detección de números
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789.,', // Solo números, puntos y comas
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // Uniform block of text
          preserve_interword_spaces: '0',
          tessedit_ocr_engine_mode: '1' // Neural nets LSTM engine
        });
        
        // Procesar imagen
        const { data: { text, confidence } } = await worker.recognize(imageDataUrl);
        
        // Verificar confianza del OCR
        if (confidence < 30) {
          setError(t('cameraCapture.lowConfidence'));
          return;
        }
        
        // Extraer números del texto reconocido
        const extractedNumbers = extractMeterReading(text);
        
        if (extractedNumbers) {
          onReadingExtracted(extractedNumbers);
        } else {
          setError(t('cameraCapture.noReadingDetected'));
        }
      } finally {
        // Asegurar que el worker se termine siempre
        await worker.terminate();
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      
      // Mensajes de error más específicos
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        setError(t('cameraCapture.networkError'));
      } else if (err.message?.includes('memory') || err.message?.includes('allocation')) {
        setError(t('cameraCapture.memoryError'));
      } else if (err.message?.includes('read image')) {
        setError(t('cameraCapture.imageReadError'));
      } else {
        setError(t('cameraCapture.ocrError'));
      }
    } finally {
      setIsProcessingOCR(false);
      setOcrProgress(0);
    }
  }, [onReadingExtracted]);

  // Extraer lectura del medidor del texto OCR
  const extractMeterReading = (text: string): string | null => {
    // Limpiar el texto
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Buscar patrones de números que podrían ser lecturas de medidor
    // Patrones comunes: 12345, 12345.6, 12,345.6, etc.
    const patterns = [
      /\b(\d{3,6}(?:[.,]\d{1,2})?)\b/g, // 3-6 dígitos con decimales opcionales
      /\b(\d{4,})\b/g, // 4 o más dígitos consecutivos
    ];
    
    const foundNumbers: string[] = [];
    
    patterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) {
        foundNumbers.push(...matches);
      }
    });
    
    if (foundNumbers.length === 0) return null;
    
    // Tomar el número más largo (probablemente la lectura principal)
    const longestNumber = foundNumbers.reduce((longest, current) => 
      current.replace(/[.,]/g, '').length > longest.replace(/[.,]/g, '').length ? current : longest
    );
    
    // Normalizar el formato (usar punto como decimal)
    return longestNumber.replace(',', '.');
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-full shadow-lg mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{t('cameraCapture.title')}</h3>
          <p className="text-gray-600 text-sm">{t('cameraCapture.description')}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {isProcessingOCR && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-center mb-2">
            <svg className="animate-spin w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-700 font-medium">{t('cameraCapture.processing')} {ocrProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${ocrProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Video preview para cámara */}
      {isCapturing && (
        <div className="mb-4">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full max-w-md mx-auto rounded-xl border-2 border-gray-300 h-auto aspect-video"
          />
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={capturePhoto}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
            >
              {t('cameraCapture.capture')}
            </button>
            <button
              onClick={stopCamera}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
            >
              {t('cameraCapture.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Imagen capturada */}
      {capturedImage && (
        <div className="mb-4">
          <img 
            src={capturedImage} 
            alt={t('cameraCapture.capturedImage')} 
            className="w-full max-w-md mx-auto rounded-xl border-2 border-gray-300"
          />
          <div className="flex justify-center mt-3">
            <button
              onClick={() => {
                setCapturedImage(null);
                setError('');
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm transition-colors"
            >
              {t('cameraCapture.delete')}
            </button>
          </div>
        </div>
      )}

      {/* Indicador de carga de cámara */}
      {isLoadingCamera && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-center">
            <svg className="animate-spin w-6 h-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-700 font-medium">Iniciando cámara...</span>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      {!isCapturing && !capturedImage && !isLoadingCamera && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={startCamera}
            disabled={isProcessing || isProcessingOCR || isLoadingCamera}
            className="flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            {t('cameraCapture.openCamera')}
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || isProcessingOCR || isLoadingCamera}
            className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t('cameraCapture.selectImage')}
          </button>
        </div>
      )}

      {/* Input oculto para seleccionar archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Instrucciones */}
      <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-yellow-800 font-medium text-sm mb-1">{t('cameraCapture.tipsTitle')}</p>
            <ul className="text-yellow-700 text-xs space-y-1">
              <li>{t('cameraCapture.tip1')}</li>
              <li>{t('cameraCapture.tip2')}</li>
              <li>{t('cameraCapture.tip3')}</li>
              <li>{t('cameraCapture.tip4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}