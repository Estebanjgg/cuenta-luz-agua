# 🚀 Implementaciones Prioritarias - Guía Paso a Paso

## 📋 Implementaciones Inmediatas (Prioridad Alta)

### 1. 🛡️ Validación con Zod

#### Instalación
```bash
npm install zod
```

#### Crear Esquemas de Validación
```typescript
// app/schemas/tariff.schema.ts
import { z } from 'zod';

// Esquema para configuración de tarifa
export const TariffConfigSchema = z.object({
  pricePerKwh: z.number()
    .min(0.01, 'El precio debe ser mayor a 0.01')
    .max(5.0, 'El precio no puede exceder 5.0 reales'),
  additionalFees: z.number()
    .min(0, 'Las tarifas adicionales no pueden ser negativas')
    .max(500, 'Las tarifas adicionales son muy altas')
    .optional(),
  publicLightingFee: z.number()
    .min(0, 'La tarifa de alumbrado no puede ser negativa')
    .max(200, 'La tarifa de alumbrado es muy alta')
    .optional(),
  icmsRate: z.number()
    .min(0, 'La tasa ICMS no puede ser negativa')
    .max(30, 'La tasa ICMS no puede exceder 30%')
    .optional(),
  pisRate: z.number()
    .min(0, 'La tasa PIS no puede ser negativa')
    .max(10, 'La tasa PIS no puede exceder 10%')
    .optional(),
  cofinsRate: z.number()
    .min(0, 'La tasa COFINS no puede ser negativa')
    .max(10, 'La tasa COFINS no puede exceder 10%')
    .optional()
});

// Esquema para tarifa guardada
export const SavedTariffSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'El nombre contiene caracteres inválidos'),
  company_name: z.string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),
  state: z.string()
    .length(2, 'El estado debe tener exactamente 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'El estado debe estar en mayúsculas'),
  city: z.string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede exceder 100 caracteres'),
  config: TariffConfigSchema
});

// Tipos TypeScript derivados
export type TariffConfig = z.infer<typeof TariffConfigSchema>;
export type SavedTariff = z.infer<typeof SavedTariffSchema>;
```

#### Integrar Validación en useTariffManager
```typescript
// app/hooks/useTariffManager.ts (agregar al hook existente)
import { TariffConfigSchema, SavedTariffSchema } from '@/schemas/tariff.schema';

export const useTariffManager = () => {
  // ... código existente ...

  const validateTariffConfig = useCallback((config: any) => {
    try {
      return TariffConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Configuración inválida: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }, []);

  const validateSavedTariff = useCallback((tariff: any) => {
    try {
      return SavedTariffSchema.parse(tariff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Tarifa inválida: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }, []);

  const saveTariff = useCallback(async (tariff: any) => {
    if (!user || !session) {
      throw new Error('Usuario no autenticado');
    }

    // Validar antes de guardar
    const validatedTariff = validateSavedTariff({
      ...tariff,
      user_id: user.id,
      is_predefined: false
    });

    const { data, error } = await supabase
      .from('saved_tariffs')
      .insert([validatedTariff])
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [user, session, validateSavedTariff]);

  const updateUserTariffConfig = useCallback(async (config: any) => {
    if (!user || !session) {
      throw new Error('Usuario no autenticado');
    }

    // Validar configuración
    const validatedConfig = validateTariffConfig(config);

    const { data, error } = await supabase
      .from('user_tariff_config')
      .upsert({
        user_id: user.id,
        config: validatedConfig,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [user, session, validateTariffConfig]);

  return {
    // ... propiedades existentes ...
    validateTariffConfig,
    validateSavedTariff,
    saveTariff,
    updateUserTariffConfig
  };
};
```

---

### 2. 🧪 Tests Unitarios Básicos

#### Instalación de Testing
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

#### Configurar Jest (jest.config.js)
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/app/$1'
  }
};

module.exports = createJestConfig(customJestConfig);
```

#### Setup de Jest (jest.setup.js)
```javascript
import '@testing-library/jest-dom';

// Mock de Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      update: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: {}, error: null }))
    }))
  }))
}));
```

#### Test para useTariffManager
```typescript
// __tests__/hooks/useTariffManager.test.ts
import { renderHook, act } from '@testing-library/react';
import { useTariffManager } from '@/hooks/useTariffManager';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock del contexto de autenticación
const mockAuthContext = {
  user: { id: 'test-user-id' },
  session: { access_token: 'test-token' },
  loading: false
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

describe('useTariffManager', () => {
  it('should validate tariff config correctly', async () => {
    const { result } = renderHook(() => useTariffManager());
    
    const validConfig = {
      pricePerKwh: 0.85,
      additionalFees: 25.50,
      publicLightingFee: 15.30
    };
    
    expect(() => {
      result.current.validateTariffConfig(validConfig);
    }).not.toThrow();
  });

  it('should throw error for invalid tariff config', async () => {
    const { result } = renderHook(() => useTariffManager());
    
    const invalidConfig = {
      pricePerKwh: -1, // Precio negativo inválido
      additionalFees: 1000 // Muy alto
    };
    
    expect(() => {
      result.current.validateTariffConfig(invalidConfig);
    }).toThrow();
  });

  it('should validate saved tariff correctly', async () => {
    const { result } = renderHook(() => useTariffManager());
    
    const validTariff = {
      name: 'Tarifa Teste',
      company_name: 'CEMIG',
      state: 'MG',
      city: 'Belo Horizonte',
      config: {
        pricePerKwh: 0.85,
        additionalFees: 25.50
      }
    };
    
    expect(() => {
      result.current.validateSavedTariff(validTariff);
    }).not.toThrow();
  });
});
```

---

### 3. 🚨 Error Boundary

#### Componente Error Boundary
```typescript
// app/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TariffErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Tariff Error Boundary:', error, errorInfo);
    
    // Aquí puedes enviar el error a un servicio de logging
    // como Sentry, LogRocket, etc.
    if (typeof window !== 'undefined') {
      // Ejemplo con console (reemplazar con servicio real)
      console.error('Error en sistema de tarifas:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <TariffErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Componente de fallback para errores
const TariffErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
    <div className="flex items-center mb-4">
      <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 className="text-lg font-semibold text-red-800">Error en el Sistema de Tarifas</h3>
    </div>
    
    <p className="text-red-700 mb-4">
      Ocurrió un error inesperado. Por favor, recarga la página o intenta más tarde.
    </p>
    
    {process.env.NODE_ENV === 'development' && error && (
      <details className="mt-4">
        <summary className="cursor-pointer text-red-600 font-medium">Detalles del error (desarrollo)</summary>
        <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
          {error.message}\n{error.stack}
        </pre>
      </details>
    )}
    
    <button 
      onClick={() => window.location.reload()}
      className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
    >
      Recargar Página
    </button>
  </div>
);
```

#### Usar Error Boundary en TariffConfig
```typescript
// app/components/UI/TariffConfig.tsx (modificar el export)
import { TariffErrorBoundary } from '@/components/ErrorBoundary';

// Al final del archivo, envolver el componente
const TariffConfigWithErrorBoundary: React.FC<TariffConfigProps> = (props) => (
  <TariffErrorBoundary>
    <TariffConfig {...props} />
  </TariffErrorBoundary>
);

export default TariffConfigWithErrorBoundary;
```

---

### 4. 🎯 Hook de Notificaciones

#### Instalación
```bash
npm install react-hot-toast
```

#### Hook personalizado
```typescript
// app/hooks/useToast.ts
import { toast } from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 6000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
      },
    });
  };

  const showWarning = (message: string) => {
    toast(message, {
      duration: 5000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
```

#### Integrar en TariffConfig
```typescript
// app/components/UI/TariffConfig.tsx (agregar al componente)
import { useToast } from '@/hooks/useToast';

const TariffConfig: React.FC<TariffConfigProps> = ({ isOpen, onClose, onSave }) => {
  const { showSuccess, showError, showWarning } = useToast();
  const { saveTariff, updateUserTariffConfig } = useTariffManager();

  const handleSave = async () => {
    try {
      if (configType === 'saved' && selectedTariff) {
        await applyTariffToUser(selectedTariff);
        showSuccess('Tarifa aplicada exitosamente');
      } else if (configType === 'automatic') {
        await updateUserTariffConfig(finalConfig);
        showSuccess('Configuración automática guardada');
      } else if (configType === 'manual') {
        const newTariff = await saveTariff({
          name: tariffName,
          company_name: 'Manual',
          state: 'BR',
          city: 'Manual',
          config: finalConfig
        });
        await applyTariffToUser(newTariff);
        showSuccess('Tarifa manual guardada y aplicada');
      }
      
      onSave(finalConfig);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      showError(error instanceof Error ? error.message : 'Error al guardar la configuración');
    }
  };

  // ... resto del componente
};
```

#### Configurar Toaster en Layout
```typescript
// app/layout.tsx (agregar al layout principal)
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
```

---

## 📋 Checklist de Implementación Inmediata

### ✅ Paso 1: Validación
- [ ] Instalar Zod: `npm install zod`
- [ ] Crear `app/schemas/tariff.schema.ts`
- [ ] Integrar validación en `useTariffManager`
- [ ] Probar validaciones con datos inválidos

### ✅ Paso 2: Tests
- [ ] Instalar dependencias de testing
- [ ] Configurar Jest
- [ ] Crear tests básicos para `useTariffManager`
- [ ] Ejecutar tests: `npm test`

### ✅ Paso 3: Error Boundary
- [ ] Crear `app/components/ErrorBoundary.tsx`
- [ ] Envolver `TariffConfig` con Error Boundary
- [ ] Probar con errores simulados

### ✅ Paso 4: Notificaciones
- [ ] Instalar react-hot-toast: `npm install react-hot-toast`
- [ ] Crear `app/hooks/useToast.ts`
- [ ] Integrar en `TariffConfig`
- [ ] Configurar `Toaster` en layout

---

## 🎯 Resultados Esperados

Después de implementar estas mejoras:

✅ **Validación Robusta** - Prevención de datos inválidos
✅ **Tests Automatizados** - Detección temprana de errores
✅ **Manejo de Errores** - Mejor experiencia de usuario
✅ **Feedback Visual** - Notificaciones claras y útiles
✅ **Código Más Mantenible** - Estructura más sólida

¡Estas implementaciones harán que tu aplicación sea mucho más robusta y profesional! 🚀