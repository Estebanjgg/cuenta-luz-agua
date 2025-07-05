'use client';

import { useEffect, useRef } from 'react';
import { Reading } from '../types';
import { CHART_CONFIG } from '../constants';
import { formatNumber, formatDate } from '../utils/calculations';

interface ConsumptionChartProps {
  readings: Reading[];
  initialReading: number;
}

export default function ConsumptionChart({ readings, initialReading }: ConsumptionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuración del canvas usando constantes
    const { width, height, margin } = CHART_CONFIG.dimensions;
    const { colors } = CHART_CONFIG;
    
    canvas.width = width;
    canvas.height = height;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    if (readings.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('No hay datos para mostrar', width / 2, height / 2);
      return;
    }

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Preparar datos
    const dataPoints = readings.map((reading, index) => ({
      x: index,
      y: reading.value - initialReading,
      date: reading.date,
      value: reading.value
    }));

    // Escalas
    const maxConsumption = Math.max(...dataPoints.map(d => d.y));
    const scaleX = chartWidth / Math.max(dataPoints.length - 1, 1);
    const scaleY = chartHeight / Math.max(maxConsumption, 1);

    // Líneas de cuadrícula
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Líneas horizontales
    for (let i = 0; i <= 5; i++) {
      const value = (maxConsumption / 5) * i;
      const y = margin.top + chartHeight - (value * scaleY);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }

    // Líneas verticales
    dataPoints.forEach((point, index) => {
      if (index % Math.ceil(dataPoints.length / 6) === 0) {
        const x = margin.left + point.x * scaleX;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
        ctx.stroke();
      }
    });

    // Dibujar línea
    ctx.beginPath();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    
    dataPoints.forEach((point, index) => {
      const x = margin.left + point.x * scaleX;
      const y = margin.top + chartHeight - point.y * scaleY;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Dibujar puntos
    dataPoints.forEach(point => {
      const x = margin.left + point.x * scaleX;
      const y = margin.top + chartHeight - point.y * scaleY;
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#1d4ed8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Etiquetas del eje Y
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const value = (maxConsumption / 5) * i;
      const y = margin.top + chartHeight - (value * scaleY);
      ctx.fillText(`${formatNumber(value)} kWh`, margin.left - 10, y + 4);
    }

    // Etiquetas del eje X
    ctx.textAlign = 'center';
    dataPoints.forEach((point, index) => {
      if (index % Math.ceil(dataPoints.length / 6) === 0) {
        const x = margin.left + point.x * scaleX;
        const date = new Date(point.date).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        });
        ctx.fillText(date, x, height - 10);
      }
    });

  }, [readings, initialReading]);

  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📊 Gráfico de Consumo
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <span className="text-4xl mb-2 block">📈</span>
            <p>Agrega lecturas para ver el gráfico</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Gráfico de Consumo</h3>
      <div className="overflow-x-auto">
        <canvas 
          ref={canvasRef}
          className="border border-gray-200 rounded"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      {readings.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <p>Consumo total acumulado: <span className="font-semibold">{formatNumber(Math.max(...readings.map(r => r.value)) - initialReading)} kWh</span></p>
        </div>
      )}
    </div>
  );
}