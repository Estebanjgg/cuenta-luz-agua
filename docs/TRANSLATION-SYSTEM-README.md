# Sistema de Traducción Local

## Descripción

Se ha implementado un sistema de traducción local que permite cambiar el idioma de la aplicación entre **Español** y **Portugués de Brasil**. El sistema funciona completamente offline sin necesidad de APIs externas.

## Características

### ✅ Funcionalidades Implementadas

- **Selector de idioma en el navbar**: Botón con banderas que permite cambiar entre idiomas
- **Persistencia local**: El idioma seleccionado se guarda en localStorage
- **Traducción en tiempo real**: Cambio inmediato de idioma sin recargar la página
- **Cobertura completa**: Traducciones para navbar, formularios, estadísticas y mensajes
- **Interfaz intuitiva**: Dropdown con banderas y nombres de idiomas

### 🌐 Idiomas Soportados

1. **Español (es)** 🇪🇸 - Idioma por defecto
2. **Português do Brasil (pt-BR)** 🇧🇷

## Arquitectura del Sistema

### Componentes Principales

#### 1. LanguageContext (`app/contexts/LanguageContext.tsx`)
- **Propósito**: Contexto React que maneja el estado global del idioma
- **Funciones**:
  - `setLanguage()`: Cambia el idioma actual
  - `t()`: Función de traducción que retorna el texto en el idioma actual
  - Persistencia automática en localStorage

#### 2. LanguageSelector (`app/components/UI/LanguageSelector.tsx`)
- **Propósito**: Componente UI para seleccionar idioma
- **Características**:
  - Dropdown con banderas y nombres de idiomas
  - Indicador visual del idioma activo
  - Responsive design
  - Cierre automático al hacer clic fuera

### Estructura de Traducciones

```typescript
const translations = {
  'es': {
    'navbar.title': 'Control de Energía',
    'navbar.subtitle': 'Gestión inteligente de consumo',
    // ... más traducciones
  },
  'pt-BR': {
    'navbar.title': 'Controle de Energia',
    'navbar.subtitle': 'Gestão inteligente de consumo',
    // ... más traducciones
  }
};
```

## Uso del Sistema

### Para Desarrolladores

#### 1. Usar traducciones en componentes

```tsx
import { useLanguage } from '../contexts/LanguageContext';

function MiComponente() {
  const { t } = useLanguage();
  
  return (
    <h1>{t('navbar.title')}</h1>
  );
}
```

#### 2. Agregar nuevas traducciones

1. Abrir `app/contexts/LanguageContext.tsx`
2. Agregar la nueva clave en ambos idiomas:

```typescript
'es': {
  // ... traducciones existentes
  'nueva.clave': 'Texto en español'
},
'pt-BR': {
  // ... traducciones existentes
  'nueva.clave': 'Texto em português'
}
```

#### 3. Cambiar idioma programáticamente

```tsx
const { setLanguage } = useLanguage();

// Cambiar a portugués
setLanguage('pt-BR');

// Cambiar a español
setLanguage('es');
```

### Para Usuarios

1. **Localizar el selector**: En la barra de navegación superior, buscar el botón con la bandera
2. **Hacer clic**: Presionar el botón para abrir el menú de idiomas
3. **Seleccionar idioma**: Elegir entre Español 🇪🇸 o Português (BR) 🇧🇷
4. **Cambio automático**: La interfaz cambiará inmediatamente al idioma seleccionado

## Categorías de Traducciones

### 📋 Navbar
- Título de la aplicación
- Subtítulo
- Opciones del menú de usuario
- Botones de acción

### 📝 Formularios
- Etiquetas de campos
- Botones de envío
- Mensajes de validación

### 📊 Estadísticas
- Títulos de métricas
- Unidades de medida
- Descripciones

### 📅 Fechas y Períodos
- Nombres de meses
- Navegación temporal
- Etiquetas de período

### ⚡ Tarifas
- Tipos de banderas tarifarias
- Descripciones de costos
- Gestión de tarifas

### 🔧 Acciones
- Botones de acción
- Confirmaciones
- Mensajes de estado

## Beneficios del Sistema

### ✅ Ventajas

1. **Offline**: No requiere conexión a internet
2. **Rápido**: Cambios instantáneos sin latencia
3. **Económico**: Sin costos de APIs externas
4. **Mantenible**: Fácil agregar nuevos idiomas
5. **Persistente**: Recuerda la preferencia del usuario
6. **Accesible**: Interfaz clara con banderas visuales

### 🎯 Casos de Uso

- **Usuarios hispanohablantes**: Interfaz en español por defecto
- **Usuarios brasileños**: Cambio fácil a portugués brasileño
- **Aplicaciones multiregionales**: Soporte para diferentes mercados
- **Desarrollo internacional**: Base para agregar más idiomas

## Expansión Futura

### 🚀 Posibles Mejoras

1. **Más idiomas**: Inglés, francés, italiano, etc.
2. **Detección automática**: Usar idioma del navegador
3. **Traducciones dinámicas**: Cargar desde archivos JSON
4. **Pluralización**: Manejo de formas plurales
5. **Formateo de fechas**: Localización de fechas y números
6. **RTL Support**: Soporte para idiomas de derecha a izquierda

### 📁 Estructura Recomendada para Expansión

```
app/
├── locales/
│   ├── es.json
│   ├── pt-BR.json
│   ├── en.json
│   └── fr.json
├── contexts/
│   └── LanguageContext.tsx
└── utils/
    └── i18n.ts
```

## Troubleshooting

### Problemas Comunes

1. **Texto no cambia**: Verificar que se esté usando `t('clave.correcta')`
2. **Idioma no persiste**: Comprobar que localStorage esté habilitado
3. **Clave no encontrada**: Agregar la traducción en ambos idiomas
4. **Selector no aparece**: Verificar importación en Navbar

### Debugging

```tsx
// Verificar idioma actual
const { language } = useLanguage();
console.log('Idioma actual:', language);

// Verificar traducción específica
const { t } = useLanguage();
console.log('Traducción:', t('navbar.title'));
```

## Conclusión

El sistema de traducción local proporciona una solución robusta y eficiente para la internacionalización de la aplicación, permitiendo una experiencia de usuario fluida en múltiples idiomas sin dependencias externas.