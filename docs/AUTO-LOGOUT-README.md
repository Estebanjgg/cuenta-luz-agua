# Sistema de Auto-Logout por Inactividad

## 📋 Descripción

Este sistema implementa un mecanismo de cierre automático de sesión por inactividad para mejorar la seguridad de la aplicación. La sesión se cierra automáticamente después de **20 minutos** de inactividad, con una advertencia previa de **2 minutos**.

## 🔧 Componentes Implementados

### 1. Hook `useAutoLogout`
**Archivo:** `app/hooks/useAutoLogout.ts`

**Funcionalidades:**
- Detecta actividad del usuario (clicks, movimientos del mouse, teclas, scroll, etc.)
- Configura timeouts para advertencia y logout automático
- Proporciona funciones para extender la sesión manualmente
- Calcula tiempo restante hasta el logout

**Configuración por defecto:**
```typescript
{
  timeout: 20 * 60 * 1000,        // 20 minutos
  warningTime: 2 * 60 * 1000,     // Advertencia 2 minutos antes
  events: [                        // Eventos que detectan actividad
    'mousedown', 'mousemove', 'keypress', 
    'scroll', 'touchstart', 'click', 'keydown'
  ]
}
```

### 2. Componente de Advertencia
**Archivo:** `app/components/UI/AutoLogoutWarning.tsx`

**Características:**
- Modal que aparece 2 minutos antes del logout
- Contador regresivo en tiempo real
- Botones para extender sesión o cerrar manualmente
- Diseño responsive y accesible
- Animaciones y efectos visuales

### 3. Componente de Estado de Sesión
**Archivo:** `app/components/UI/SessionStatus.tsx`

**Funcionalidades:**
- Muestra tiempo restante hasta el logout
- Botón para extender sesión
- Solo visible en desarrollo (configurable)
- Múltiples posiciones y modos (compacto/completo)
- Indicadores visuales de estado

### 4. Integración en AuthContext
**Archivo:** `app/contexts/AuthContext.tsx`

**Mejoras:**
- Integración del hook de auto-logout
- Manejo del estado de advertencia
- Funciones adicionales en el contexto
- Renderizado condicional del modal de advertencia

## 🚀 Uso y Configuración

### Configuración Básica
El sistema está configurado automáticamente en el `AuthContext` y no requiere configuración adicional.

### Personalización del Timeout
```typescript
// En AuthContext.tsx
const { extendSession, getTimeUntilLogout } = useAutoLogout({
  timeout: 30 * 60 * 1000,        // Cambiar a 30 minutos
  warningTime: 5 * 60 * 1000,     // Advertencia 5 minutos antes
  onWarning: () => {
    setShowLogoutWarning(true)
  }
})
```

### Eventos Personalizados
```typescript
const { extendSession } = useAutoLogout({
  events: ['click', 'keydown'],    // Solo clicks y teclas
  timeout: 15 * 60 * 1000         // 15 minutos
})
```

### Componente de Estado en Producción
```typescript
// Para mostrar el estado en producción
<SessionStatus 
  showInProduction={true} 
  position="top-right" 
  compact={false} 
/>
```

## 🔒 Características de Seguridad

### Detección de Actividad
- **Eventos monitoreados:** clicks, movimiento del mouse, teclas, scroll, touch
- **Optimización:** Throttling para evitar reinicios excesivos del timer
- **Cobertura completa:** Detecta actividad en toda la aplicación

### Gestión de Memoria
- **Cleanup automático:** Limpieza de timeouts al desmontar componentes
- **Event listeners:** Correcta eliminación de listeners
- **Referencias:** Uso de useRef para evitar re-renders innecesarios

### Experiencia de Usuario
- **Advertencia previa:** 2 minutos de aviso antes del logout
- **Extensión fácil:** Un click para extender la sesión
- **Feedback visual:** Indicadores de estado y tiempo restante
- **Responsive:** Funciona en dispositivos móviles y desktop

## 📱 Comportamiento en Diferentes Dispositivos

### Desktop
- Detecta movimiento del mouse, clicks y teclas
- Modal centrado con botones grandes
- Indicador de estado en esquina (desarrollo)

### Móvil/Tablet
- Detecta eventos touch y scroll
- Modal adaptado para pantallas pequeñas
- Botones optimizados para touch

## 🛠️ Desarrollo y Debug

### Componente de Estado (Solo Desarrollo)
El componente `SessionStatus` es visible solo en desarrollo y muestra:
- Tiempo restante en tiempo real
- Email del usuario autenticado
- Botón para extender sesión
- Indicador visual de estado (verde/amarillo/rojo)

### Logs de Consola
```javascript
// El sistema registra eventos importantes:
console.log('Sesión cerrada automáticamente por inactividad')
console.error('Error al cerrar sesión automáticamente:', error)
```

### Testing
```typescript
// Para testing, puedes configurar timeouts cortos:
const { extendSession } = useAutoLogout({
  timeout: 10000,        // 10 segundos
  warningTime: 5000      // Advertencia a los 5 segundos
})
```

## 🔧 Configuraciones Avanzadas

### Callback Personalizado de Advertencia
```typescript
const { extendSession } = useAutoLogout({
  onWarning: (timeLeft) => {
    // Lógica personalizada
    console.log(`Quedan ${timeLeft} segundos`);
    // Mostrar notificación personalizada
    showCustomNotification(`Sesión expira en ${timeLeft}s`);
  }
})
```

### Integración con Analytics
```typescript
const { extendSession } = useAutoLogout({
  onWarning: () => {
    // Registrar evento en analytics
    analytics.track('session_warning_shown');
  }
})
```

## 📊 Métricas y Monitoreo

### Eventos Trackeable
- Advertencias mostradas
- Sesiones extendidas manualmente
- Logouts automáticos por inactividad
- Tiempo promedio de sesión

### Implementación de Métricas
```typescript
// En el AuthContext o componentes
const handleExtendSession = () => {
  analytics.track('session_extended');
  extendSession();
};

const handleAutoLogout = () => {
  analytics.track('auto_logout_triggered');
  signOut();
};
```

## 🚨 Consideraciones Importantes

### Rendimiento
- El sistema usa throttling para evitar actualizaciones excesivas
- Los timeouts se limpian correctamente para evitar memory leaks
- Los event listeners se optimizan para no impactar el rendimiento

### Accesibilidad
- Modal con focus trap automático
- Navegación por teclado completa
- Lectores de pantalla compatibles
- Contraste adecuado en todos los elementos

### Compatibilidad
- Funciona en todos los navegadores modernos
- Compatible con dispositivos touch
- Responsive design para todas las pantallas

## 🔄 Actualizaciones Futuras

### Posibles Mejoras
1. **Configuración por usuario:** Permitir que cada usuario configure su timeout
2. **Múltiples niveles de advertencia:** Advertencias a los 5, 2 y 1 minuto
3. **Persistencia de preferencias:** Guardar configuraciones en localStorage
4. **Integración con notificaciones push:** Advertencias fuera de la aplicación
5. **Modo "No molestar":** Pausar auto-logout durante ciertas actividades

### Roadmap
- [ ] Configuración por usuario
- [ ] Múltiples advertencias
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Integración con PWA

---

**Desarrollado con ❤️ para mejorar la seguridad y experiencia de usuario**