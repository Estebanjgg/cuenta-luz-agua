'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos para los idiomas soportados
export type Language = 'es' | 'pt-BR';

// Interfaz para el contexto
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Crear el contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traducciones locales
const translations = {
  es: {
    // Navbar
    appTitle: 'Control de Energía',
    appSubtitle: 'Gestión inteligente del consumo eléctrico',
    userPlaceholder: 'Usuario',
    profile: 'Mi Perfil',
    settings: 'Configuración',
    manageTariffs: 'Gestionar Tarifas',
    logout: 'Cerrar Sesión',
    
    // Navbar object
    navbar: {
      title: 'Control de Energía',
      subtitle: 'Gestión inteligente del consumo eléctrico',
      profile: 'Mi Perfil',
      settings: 'Configuración',
      manageTariffs: 'Gestionar Tarifas',
      logout: 'Cerrar Sesión',
      consumptionControl: 'Control de Consumo',
      applianceCalculator: 'Calculadora de Electrodomésticos',
      openMenu: 'Abrir menú'
    },
    
    // Actions object
    actions: {
      resetMonth: 'Reiniciar Mes',
      resetMonthDescription: 'Reinicia todas las lecturas del mes actual'
    },
    
    // Footer object
    footer: {
      message: 'Gestiona tu consumo de energía de manera inteligente',
      tech: 'Desarrollado con tecnología moderna para un mejor control energético'
    },
    
    // Home page
    homePage: {
      loading: 'Cargando...',
      title: 'Control de Energía',
      subtitle: 'Gestiona tu consumo eléctrico de manera inteligente y ahorra en tu factura de luz',
      description: 'Registra tus lecturas, analiza tu consumo y calcula costos con precisión usando nuestras herramientas avanzadas',
      
      // Consumption Control Card
      consumptionControl: {
        title: 'Control de Consumo',
        description: 'Registra tus lecturas mensuales, visualiza gráficos de consumo y obtén estadísticas detalladas para optimizar tu uso de energía.',
        features: {
          meterReadings: 'Registro de lecturas del medidor',
          consumptionGraphs: 'Gráficos y estadísticas de consumo',
          monthlyProjections: 'Proyecciones mensuales',
          costBreakdown: 'Desglose detallado de costos'
        },
        button: 'Ir al Control de Consumo'
      },
      
      // Calculator Card
      calculator: {
        title: 'Calculadora de Tarifas',
        description: 'Calcula el costo exacto de tu consumo eléctrico con diferentes tarifas y banderas tarifarias del sistema brasileño.',
        features: {
          tariffFlags: 'Cálculo con banderas tarifarias',
          tariffComparison: 'Comparación de tarifas',
          costSimulation: 'Simulación de costos',
          customTariffs: 'Gestión de tarifas personalizadas'
        },
        button: 'Ir a la Calculadora'
      },
      
      // Benefits Section
      benefits: {
        title: '¿Por qué elegir nuestro sistema?',
        subtitle: 'Herramientas profesionales para el control inteligente de tu consumo eléctrico',
        guaranteedSavings: {
          title: 'Ahorro Garantizado',
          description: 'Optimiza tu consumo y reduce hasta un 30% en tu factura eléctrica'
        },
        totalPrecision: {
          title: 'Precisión Total',
          description: 'Cálculos exactos basados en las tarifas oficiales brasileñas'
        },
        easyToUse: {
          title: 'Fácil de Usar',
          description: 'Interface intuitiva y moderna para una experiencia excepcional'
        }
      }
    },
    
    // Main page
    loadingData: 'Cargando datos...',
    monthActions: 'Acciones del Mes',
    resetMonth: 'Reiniciar Mes',
    resetMonthDescription: 'Reinicia todas las lecturas del mes actual',
    footerMessage: 'Gestiona tu consumo de energía de manera inteligente',
    
    // MonthSelector
    monthSelector: {
      title: 'Navegación de Períodos',
      description: 'Selecciona el mes y año para ver o iniciar el registro de lecturas',
      yearLabel: 'Año:',
      currentLabel: '(Actual)',
      currentPeriod: 'Período actual:',
      howItWorks: '¿Cómo funciona?',
      monthWithData: 'Mes con datos: Se mostrará el historial existente',
      newMonth: 'Mes nuevo: Se solicitará la lectura inicial del medidor',
      yearChange: 'Cambio de año: Se inicia un nuevo período de mediciones',
      newPeriodTitle: 'Iniciar Nuevo Período',
      importantNote: 'Importante: Vas a iniciar un nuevo período de mediciones. Necesitamos la lectura actual de tu medidor para comenzar.',
      monthLabel: 'Mes:',
      initialReadingLabel: 'Lectura inicial del medidor (kWh):',
      placeholder: 'Ej: 65788',
      cancel: 'Cancelar',
      startPeriod: 'Iniciar Período',
      validationError: 'La lectura inicial debe ser un número válido mayor a 0',
      validationTooHigh: 'La lectura inicial parece demasiado alta',
      validationGeneral: 'Error de validación'
    },
    
    // Months array
    months: {
      enero: 'enero',
      febrero: 'febrero',
      marzo: 'marzo',
      abril: 'abril',
      mayo: 'mayo',
      junio: 'junio',
      julio: 'julio',
      agosto: 'agosto',
      septiembre: 'septiembre',
      octubre: 'octubre',
      noviembre: 'noviembre',
      diciembre: 'diciembre'
    },
    
    // ReadingForm
     addNewReading: 'Agregar Nueva Lectura',
     registerElectricConsumption: 'Registra tu consumo eléctrico actual',
     readingDate: 'Fecha de la lectura',
     meterReading: 'Lectura del medidor (kWh)',
     mustBeGreaterThan: 'Debe ser mayor a',
     importantInfo: 'Información importante',
     currentMeterReading: 'La lectura actual del medidor es',
     addingReading: 'Agregando lectura',
     addReading: 'Agregar Lectura',
     enterValidNumber: 'Por favor ingresa un valor numérico válido',
    
    // ReadingsList
    readingsHistory: 'Historial de Lecturas',
    noReadingsRegistered: 'No hay lecturas registradas',
    readingsWillAppear: 'Las lecturas que agregues aparecerán aquí',
    readingNumber: 'Lectura #',
    meterReadingLabel: 'Lectura del medidor',
    consumptionSincePrevious: 'Consumo desde anterior',
    totalMonthConsumption: 'Consumo total del mes',
    daysSinceStart: 'Días desde inicio',
    deleteReading: 'Eliminar lectura',
    readingsRegistered: 'lectura registrada',
    readingsRegisteredPlural: 'lecturas registradas',
    firstReading: 'Primera Lectura',
    lastReading: 'Última Lectura',
    totalConsumption: 'Consumo Total',
    
    // ConsumptionStats
    statisticsOf: 'Estadísticas de',
    period: 'Período',
    monthProgress: 'Progreso del mes',
    day: 'Día',
    of: 'de',
    totalConsumptionLabel: 'Consumo Total',
    accumulatedConsumption: 'Consumo acumulado del mes',
    dailyAverage: 'Promedio Diario',
    averageConsumptionPerDay: 'Consumo promedio por día',
    monthlyProjection: 'Proyección Mensual',
    estimationForMonth: 'Estimación para todo el mes',
    estimatedCost: 'Costo Estimado',
    totalEstimatedCost: 'Costo total estimado',
    readingsSummary: 'Resumen de Lecturas',
    totalReadingsRegistered: 'Total de lecturas registradas',
    lastReadingValue: 'Última lectura',
    averageFrequency: 'Frecuencia promedio',
    projections: 'Proyecciones',
    remainingConsumption: 'Consumo restante estimado',
    remainingDays: 'Días restantes del mes',
    suggestedDailyConsumption: 'Consumo diario sugerido',
    noReadingsForStats: 'No hay lecturas registradas',
    addFirstReadingForStats: 'Agrega tu primera lectura para ver las estadísticas de consumo',
    consumptionStatistics: 'Estadísticas de Consumo',
    monthlyAccumulatedConsumption: 'Consumo acumulado del mes',
    estimationForWholeMonth: 'Estimación para todo el mes',
    dayOf: 'Día {current} de {total}',
    estimatedRemainingConsumption: 'Consumo restante estimado',
    remainingDaysOfMonth: 'Días restantes del mes',
    
    // CostBreakdown
    costBreakdown: 'Desglose de Costos',
    appliedTariff: 'Tarifa aplicada',
    activeTariff: 'Tarifa Activa',
    flag: 'Bandera',
    baseConsumption: 'Consumo Base',
    transmissionService: 'Servicio de Transmisión',
    sectorCharges: 'Encargos Sectoriales',
    taxesAndCharges: 'Impuestos y Encargos',
    publicLightingContribution: 'Contribución Iluminación Pública',
    monthlyFixedRate: 'Tarifa fija mensual',
    totalToPay: 'Total a Pagar',
    consumedKwh: 'kWh consumidos',
    perKwh: 'por kWh',
    note: 'Nota',
    breakdownNote: 'Este desglose está basado en la estructura tarifaria de',
    selectedDistributor: 'la empresa distribuidora seleccionada',
    breakdownDisclaimer: 'y puede variar según la región, tipo de conexión y período de facturación.',
    noConsumptionRegistered: 'No hay consumo registrado',
    addReadingsForCostBreakdown: 'Agrega lecturas para ver el desglose de costos',
    tariffPerKwh: 'Tarifa por kWh',
    monthConsumption: 'Consumo del mes',
    costComponents: 'Componentes del Costo',
    subtotal: 'Subtotal',
    finalTotal: 'Total Final',
    costEstimationNote: 'Los valores mostrados son estimaciones basadas en las tarifas vigentes. El costo real puede variar según otros factores como descuentos, subsidios o cambios en las tarifas durante el período de facturación.',
    consumed: 'consumidos',
    selectedDistributionCompany: 'la empresa distribuidora seleccionada',
    costVariationNote: 'y puede variar según la región, tipo de conexión y período de facturación.',
    monthlyFixedTariff: 'Tarifa fija mensual',
    costBreakdownNote: 'Este desglose está basado en la estructura tarifaria de',
    initialMeasurementDay: 'Día de medición inicial',
    tooltipHelper: {
      readingTitle: 'Cómo encontrar la lectura del medidor',
      readingDescription: 'Busca el número de lectura actual en tu factura. Generalmente aparece como "Lectura Actual" o "Consumo" en kWh.',
      readingImageAlt: 'Imagen mostrando dónde encontrar la lectura en la factura',
      measurementTitle: 'Cómo encontrar la fecha de medición',
      measurementDescription: 'Busca la fecha en que se realizó la medición del medidor. Puede aparecer como "Fecha de Lectura" o "Período de Facturación".',
      measurementImageAlt: 'Imagen mostrando dónde encontrar la fecha de medición en la factura',
      tariffTitle: 'Cómo encontrar los valores de tarifas',
      tariffDescription: 'Busca la sección de "Detalle de Tarifas" o "Composición del Consumo" en tu factura. Aquí encontrarás los valores por kWh de cada tarifa aplicada.',
      tariffImageAlt: 'Imagen mostrando dónde encontrar los valores de tarifas en la factura',
      helpButton: 'Ver ayuda visual',
      helpNote: 'Esta información te ayudará a ingresar los datos correctos de tu factura.'
    },
    
    // TariffFlagSelector
    tariffFlagSelector: {
      currentTariffFlag: 'Bandera Tarifaria Actual',
      selectTariffFlag: 'Seleccionar Bandera Tarifaria',
      tariffFlag: 'Bandera',
      noSurcharge: 'Sin recargo',
      whatDoesItMean: '¿Qué significa?',
      savingTips: 'Consejos para ahorrar',
      active: 'activa',
      recommendations: 'Recomendaciones',
      andMore: 'Ver más...',
      showLess: 'Ver menos',
      tariffFlagSystem: 'Sistema de Banderas Tarifarias',
      tariffFlagSystemDescription: 'Las banderas tarifarias indican las condiciones de generación de energía eléctrica en el país y determinan si habrá o no un recargo en la cuenta de luz.',
      moreInfoANEEL: 'Más información ANEEL',
      howSystemWorks: 'Cómo funciona el sistema',
      flagWithSurcharge: 'Bandera {name} - {surcharge}',
      flagMeaning: 'Bandera {name} - ¿Qué significa?',
      flagActive: 'Bandera {name} activa',
      learnMore: 'Más información',
       
       // Flag explanations
      greenExplanation: 'Condiciones favorables de generación. Los embalses de las hidroeléctricas están en niveles adecuados y no es necesario activar termoeléctricas más caras.',
      yellowExplanation: 'Condiciones menos favorables. Los niveles de los embalses están bajando y algunas termoeléctricas comienzan a operar, aumentando el costo de generación.',
      redLevel1Explanation: 'Condiciones más costosas. Los embalses están en niveles bajos y más termoeléctricas están operando, aumentando significativamente los costos.',
      redLevel2Explanation: 'Condiciones muy costosas. Los embalses están en niveles críticos y casi todo el parque de termoeléctricas está activado, resultando en los mayores costos de generación.',
      
      // Green flag tips
      greenTip1: 'Aprovecha para usar electrodomésticos de alto consumo',
      greenTip2: 'Es un buen momento para cargar dispositivos electrónicos',
      greenTip3: 'Puedes usar el aire acondicionado sin preocupaciones adicionales',
      greenTip4: 'Ideal para usar la secadora de ropa y lavavajillas',
      greenTip5: 'Buen momento para planchar ropa acumulada',
      greenTip6: 'Puedes usar el horno eléctrico para cocinar sin restricciones',
      greenTip7: 'Aprovecha para cargar vehículos eléctricos si los tienes',
      greenTip8: 'Es seguro usar calentadores eléctricos de agua',
      
      // Yellow flag tips
      yellowTip1: 'Evita usar varios electrodomésticos al mismo tiempo',
      yellowTip2: 'Prefiere usar la lavadora y lavavajillas en horarios fuera de pico (evita 18h-21h)',
      yellowTip3: 'Ajusta el aire acondicionado a 23°C o más',
      yellowTip4: 'Apaga luces innecesarias y usa iluminación LED',
      yellowTip5: 'Reduce el tiempo de ducha en 2-3 minutos',
      yellowTip6: 'Usa la función \'eco\' en electrodomésticos cuando esté disponible',
      yellowTip7: 'Evita abrir la puerta del refrigerador innecesariamente',
      yellowTip8: 'Planifica mejor el uso de la plancha (plancha varias piezas juntas)',
      yellowTip9: 'Considera secar ropa al sol en lugar de usar secadora',
      
      // Red Level 1 tips
      redLevel1Tip1: 'Reduce el tiempo de ducha y usa la opción \'verano\' del calentador',
      redLevel1Tip2: 'Evita usar electrodomésticos en horario de pico (18h-21h)',
      redLevel1Tip3: 'Desconecta aparatos en standby de la tomada',
      redLevel1Tip4: 'Usa ventiladores en lugar de aire acondicionado cuando sea posible',
      redLevel1Tip5: 'Planifica el uso de lavadora y secadora para días con menor consumo',
      redLevel1Tip6: 'Ajusta la temperatura del refrigerador a 3-4°C (no más frío)',
      redLevel1Tip7: 'Usa microondas en lugar del horno eléctrico para calentar comida',
      redLevel1Tip8: 'Apaga el calentador eléctrico cuando no lo uses',
      redLevel1Tip9: 'Reduce el brillo de pantallas de TV y computadoras',
      redLevel1Tip10: 'Evita usar múltiples dispositivos electrónicos simultáneamente',
      
      // Red Level 2 tips
      redLevel2Tip1: 'Reduce drásticamente el uso de electrodomésticos de alto consumo',
      redLevel2Tip2: 'Toma duchas más cortas y en modo \'verano\'',
      redLevel2Tip3: 'Evita completamente el horario de pico (18h-21h)',
      redLevel2Tip4: 'Desconecta todos los aparatos que no sean esenciales',
      redLevel2Tip5: 'Usa iluminación natural siempre que sea posible',
      redLevel2Tip6: 'Considera postponer actividades que requieran mucha energía',
      redLevel2Tip7: 'Ajusta la temperatura del refrigerador a niveles menos fríos',
      redLevel2Tip8: 'Evita usar secadora de ropa - seca al aire libre',
      redLevel2Tip9: 'No uses aire acondicionado - opta por ventiladores',
      redLevel2Tip10: 'Cocina con gas en lugar de electrodomésticos eléctricos',
      redLevel2Tip11: 'Carga dispositivos móviles solo cuando sea necesario',
      redLevel2Tip12: 'Apaga completamente la TV cuando no la veas',
      redLevel2Tip13: 'Usa agua fría para lavar ropa cuando sea posible',
      redLevel2Tip14: 'Evita usar plancha eléctrica - considera alternativas',
      
      greenFlag: {
        description: 'Condiciones favorables de generación de energía. No hay recargo adicional en la tarifa.',
        tips: [
          'Momento ideal para usar electrodomésticos de alto consumo',
          'Aprovecha para cargar dispositivos electrónicos',
          'Es el mejor momento para usar aire acondicionado si es necesario'
        ]
      },
      yellowFlag: {
        description: 'Condiciones de generación menos favorables. Recargo de R$ 0,01885 por cada kWh consumido.',
        tips: [
          'Evita usar varios electrodomésticos al mismo tiempo',
          'Prefiere usar la lavadora y lavavajillas en horarios de menor consumo',
          'Reduce el uso de aire acondicionado y calentadores eléctricos'
        ]
      },
      redFlag1: {
        description: 'Condiciones más costosas de generación. Recargo de R$ 0,04463 por cada kWh consumido.',
        tips: [
          'Evita usar electrodomésticos de alto consumo',
          'Desconecta aparatos en standby',
          'Usa iluminación LED y aprovecha la luz natural',
          'Posterga el uso de lavadora, secadora y lavavajillas'
        ]
      },
      redFlag2: {
        description: 'Condiciones críticas y más costosas. Recargo de R$ 0,07877 por cada kWh consumido.',
        tips: [
          'Reduce al máximo el consumo de energía',
          'Usa solo electrodomésticos esenciales',
          'Evita duchas muy largas con calentador eléctrico',
          'Desconecta todos los aparatos no esenciales',
          'Considera usar generadores alternativos si es posible'
        ]
      }
    },

    // TariffModal
    tariffModal: {
      newTariff: 'Nueva Tarifa',
      city: 'Ciudad *',
      state: 'Estado *',
      stateRequired: 'El estado es requerido',
      electricCompany: 'Compañía Eléctrica *',
      tariffsByFlag: 'Tarifas por Bandera (R$/kWh)',
      aneelInfo: 'Los recargos por bandeira son valores oficiales de ANEEL, uniformes para todo Brasil',
      applyAneelValues: 'Aplicar Valores ANEEL',
      flagInfo: 'ℹ️ Información sobre Bandeiras Tarifarias',
      greenFlagInfo: '🟢 Verde: Sin recargo adicional (R$ 0,00/kWh)',
      yellowFlagInfo: '🟡 Amarilla: Recargo de R$ 0,01885/kWh',
      redFlag1Info: '🔴 Roja Nivel 1: Recargo de R$ 0,04463/kWh',
      redFlag2Info: '🔴 Roja Nivel 2: Recargo de R$ 0,07877/kWh',
      flagInfoNote: 'Estos valores se suman a la tarifa base de energía de tu distribuidora.',
      greenFlagLabel: '🟢 Bandera Verde * (Tarifa Base)',
      yellowFlagLabel: '🟡 Bandera Amarilla *',
      redFlag1Label: '🔴 Bandera Roja Nivel 1 *',
      redFlag2Label: '🔴 Bandera Roja Nivel 2 *',
      baseTariffNote: 'Tarifa base sin recargo adicional',
      fixedTariffs: 'Tarifas Fijas (R$)',
      additionalFees: 'Tarifas Adicionales',
      publicLighting: 'Alumbrado Público',
      makePublic: 'Hacer esta tarifa pública (otros usuarios podrán verla y copiarla)',
      cancel: 'Cancelar',
      saving: 'Guardando...',
      update: 'Actualizar',
      createTariff: 'Crear Tarifa',
      priceGreaterThanZero: 'El precio por kWh (verde) debe ser mayor a 0'
    },

    // PublicTariffsModal
    publicTariffsModal: {
      title: 'Tarifas Públicas',
      searchPlaceholder: 'Buscar por ciudad, estado o compañía...',
      searching: 'Buscando...',
      search: 'Buscar',
      clear: 'Limpiar',
      resultsFound: '{count} resultado(s) encontrado(s) para "{term}"',
      noTariffsFound: 'No se encontraron tarifas',
      noPublicTariffs: 'No hay tarifas públicas disponibles',
      tryOtherTerms: 'Intenta con otros términos de búsqueda',
      beFirstToCreate: 'Sé el primero en crear una tarifa pública',
      public: 'Pública',
      green: 'Verde',
      yellow: 'Amarilla',
      red1: 'Roja 1',
      red2: 'Roja 2',
      additionalFees: 'Tarifas adicionales',
      publicLighting: 'Alumbrado público',
      created: 'Creada',
      copying: 'Copiando...',
      copyTariff: 'Copiar Tarifa',
      infoTitle: '💡 Información sobre Tarifas Públicas',
      infoItems: [
        '• Las tarifas públicas son creadas por otros usuarios de la comunidad',
        '• Al copiar una tarifa, se creará una copia personal que podrás editar',
        '• Verifica siempre que los datos sean correctos antes de usar una tarifa',
        '• Puedes hacer tus propias tarifas públicas para ayudar a otros usuarios'
      ],
      close: 'Cerrar'
    },

    // TariffSelector
    tariffSelector: {
      title: 'Seleccionar Tarifa',
      change: 'Cambiar',
      myTariffs: 'Mis Tarifas',
      selectExisting: 'Seleccionar una tarifa existente...',
      createNew: '➕ Crear Nueva Tarifa',
      viewPublic: '🌍 Ver Tarifas Públicas',
      tip: '💡 Tip: Puedes crear tarifas personalizadas o usar tarifas públicas creadas por otros usuarios.',
      newTariff: 'Nueva Tarifa',
      confirmSelection: 'Confirmar Selección'
    },

    // TariffManager
    tariffManager: {
      title: 'Gestión de Tarifas',
      publicTariffs: 'Tarifas Públicas',
      newTariff: 'Nueva Tarifa',
      noTariffsTitle: 'No tienes tarifas creadas',
      noTariffsDescription: 'Crea tu primera tarifa personalizada o copia una tarifa pública existente.',
      viewPublicTariffs: 'Ver Tarifas Públicas',
      createNewTariff: 'Crear Nueva Tarifa',
      public: 'Pública',
      baseTariff: 'Tarifa Base',
      green: 'Verde',
      yellow: 'Amarilla',
      red1: 'Roja 1',
      red2: 'Roja 2',
      additionalFees: 'Tarifas adicionales',
      publicLighting: 'Alumbrado público',
      selected: 'Seleccionada',
      select: 'Seleccionar',
      edit: 'Editar',
      delete: 'Eliminar',
      deleting: 'Eliminando...',
      editTariff: 'Editar Tarifa',
      confirmSelection: 'Confirmar Selección',
      confirmDeleteTitle: 'Confirmar eliminación',
      confirmDeleteMessage: '¿Estás seguro de que quieres eliminar esta tarifa? Esta acción no se puede deshacer.',
      cancel: 'Cancelar',
      deleteError: 'Error al eliminar la tarifa',
      copySuccess: 'Tarifa copiada exitosamente'
    },
    
    // Months
    january: 'enero',
    february: 'febrero',
    march: 'marzo',
    april: 'abril',
    may: 'mayo',
    june: 'junio',
    july: 'julio',
    august: 'agosto',
    september: 'septiembre',
    october: 'octubre',
    november: 'noviembre',
    december: 'diciembre',
    
    // Units
    kwh: 'kWh',
    currency: 'R$',
    days: 'días',
    
    // Section titles
    readings: 'Lecturas',
    statistics: 'Estadísticas',
    costBreakdownTitle: 'Desglose de Costos',
    
    // General UI

    // SessionStatus
    sessionStatus: {
      title: 'Estado de Sesión',
      timeRemaining: 'Tiempo restante:',
      extendSession: 'Extender Sesión',
      authenticatedUser: 'Usuario autenticado',
      onlyInDevelopment: 'Solo visible en desarrollo',
      autoLogoutTooltip: 'Tiempo hasta auto-logout'
    },

    // ConsumptionChart
    consumptionChart: {
      title: 'Gráfico de Consumo',
      noData: 'No hay datos para mostrar',
      addReadingsMessage: 'Agrega lecturas para ver el gráfico',
      totalAccumulated: 'Consumo total acumulado:'
    },

    // PeriodNavigator
    periodNavigator: {
      period: 'Período:',
      current: '(Actual)',
      tariffAssigned: '✓ Tarifa asignada',
      noTariff: '⚠ Sin tarifa',
      assignTariff: 'Asignar tarifa',
      manageTariffs: 'Gestionar Tarifas',
      newPeriodTitle: 'Iniciar Nuevo Período',
      importantNote: '📋 Importante:',
      importantMessage: 'Vas a iniciar un nuevo período de mediciones. Necesitamos la lectura actual de tu medidor para comenzar.',
      initialReadingLabel: 'Lectura inicial del medidor (kWh):',
      placeholder: 'Ej: 65788',
      cancel: 'Cancelar',
      startPeriod: 'Iniciar Período',
      tariffManagementTitle: 'Gestión de Tarifas',
      currentTariff: '✓ Tarifa actual:',
      noTariffAssigned: '⚠ No hay tarifa asignada para este mes',
      confirmSelection: 'Confirmar Selección',
      validationErrors: {
        invalidNumber: 'La lectura inicial debe ser un número válido mayor a 0',
        tooHigh: 'La lectura inicial parece demasiado alta',
        validationError: 'Error de validación'
      }
    },

    // Auth Components
    loginForm: {
      title: 'Iniciar Sesión',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      emailPlaceholder: 'tu@email.com',
      passwordPlaceholder: '••••••••',
      signingIn: 'Iniciando sesión...',
      signIn: 'Iniciar Sesión',
      noAccount: '¿No tienes una cuenta?',
      signUpHere: 'Regístrate aquí'
    },

    signUpForm: {
      title: 'Crear Cuenta',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      emailPlaceholder: 'tu@email.com',
      passwordPlaceholder: '••••••••',
      passwordMismatch: 'Las contraseñas no coinciden',
      passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
      accountCreated: '¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.',
      creatingAccount: 'Creando cuenta...',
      createAccount: 'Crear Cuenta',
      haveAccount: '¿Ya tienes una cuenta?',
      signInHere: 'Inicia sesión aquí'
    },

    languageSelector: {
      selectLanguage: 'Seleccionar idioma',
      chooseLanguage: 'Escolher idioma',
      active: 'Activo / Ativo'
    },

    // ConfirmationModal
    confirmationModal: {
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      processing: 'Procesando...',
      tariffSelected: 'Tarifa Seleccionada',
      tariffSelectedMessage: 'Has seleccionado la tarifa de {city}, {state} - {company}. ¿Deseas confirmar esta selección?',
      tariffCreated: 'Tarifa Creada con Éxito',
      tariffCreatedMessage: 'Tu nueva tarifa para {city}, {state} - {company} ha sido creada exitosamente. ¿Deseas usarla ahora?',
      useNow: 'Usar Ahora',
      later: 'Más Tarde'
    },

    // Exit confirmation
    confirmExit: 'Confirmar salida',
    confirmExitMessage: '¿Estás seguro de que no quieres cargar ningún mes? Serás redirigido a la página principal.',
    cancel: 'Cancelar',
    confirm: 'Confirmar',

    // Initial Month Modal
    initialMonthModal: {
      welcomeTitle: '¡Bienvenido al Control de Consumo!',
      welcomeSubtitle: 'Selecciona el período que deseas gestionar',
      selectYear: 'Selecciona el año',
      selectMonth: 'Selecciona el mes',
      current: 'Actual',
      withData: 'Con datos',
      infoTitle: 'Información:',
      monthsWithData: 'Meses con datos guardados - Se cargarán automáticamente',
      monthsWithoutData: 'Meses sin datos - Podrás crear un nuevo período',
      createNewPeriod: 'Crear nuevo período',
      importantNote: 'Importante: Necesitas ingresar la lectura inicial del medidor para este período.',
      measurementDay: 'Día de medición',
      measurementDayHelp: 'Selecciona el día del mes en que se realizó la medición de luz',
      dayLabel: 'Día',
      back: 'Volver',
      createPeriod: 'Crear período'
    },

    // CameraCapture
    cameraCapture: {
      title: 'Captura Automática',
      description: 'Toma una foto del medidor para extraer la lectura',
      openCamera: '📷 Abrir Cámara',
      selectImage: '🖼️ Seleccionar Imagen',
      capture: '📸 Capturar',
      cancel: '❌ Cancelar',
      close: '✕ Cerrar',
      delete: '🗑️ Eliminar',
      processing: 'Procesando imagen...',
      capturedImage: 'Imagen capturada',
      cameraError: 'No se pudo acceder a la cámara. Verifica los permisos.',
      permissionDenied: 'Permiso de cámara denegado. Permite el acceso en la configuración.',
      noCameraFound: 'No se encontró ninguna cámara en el dispositivo.',
      cameraNotSupported: 'La cámara no es compatible con este navegador.',
      cameraInUse: 'La cámara está siendo usada por otra aplicación.',
      ocrError: 'Error al procesar la imagen. Intenta nuevamente.',
      noReadingDetected: 'No se pudo detectar una lectura válida en la imagen. Intenta con mejor iluminación o ángulo.',
      invalidFileType: 'Tipo de archivo no válido. Selecciona una imagen.',
      fileTooLarge: 'El archivo es demasiado grande. Máximo 10MB.',
      imageTooSmall: 'La imagen es demasiado pequeña. Mínimo 100x100 píxeles.',
      imageTooLarge: 'La imagen es demasiado grande. Máximo 4000x4000 píxeles.',
      invalidImage: 'Imagen no válida o corrupta.',
      fileReadError: 'Error al leer el archivo.',
      imageReadError: 'Error al leer la imagen para OCR.',
      networkError: 'Error de conexión. Verifica tu internet.',
      memoryError: 'Error de memoria. Intenta con una imagen más pequeña.',
      lowConfidence: 'Calidad de imagen baja. Intenta con mejor iluminación.',
      tipsTitle: '💡 Consejos para mejores resultados:',
      tip1: '• Asegúrate de que los números estén bien iluminados',
      tip2: '• Mantén la cámara estable y enfocada',
      tip3: '• Los números deben estar claramente visibles',
      tip4: '• Evita reflejos y sombras sobre el medidor'
    }
  },
  'pt-BR': {
    // Navbar
    appTitle: 'Controle de Energia',
    appSubtitle: 'Gestão inteligente do consumo elétrico',
    userPlaceholder: 'Usuário',
    profile: 'Meu Perfil',
    settings: 'Configurações',
    manageTariffs: 'Gerenciar Tarifas',
    logout: 'Sair',
    
    // Navbar object
    navbar: {
      title: 'Controle de Energia',
      subtitle: 'Gestão inteligente do consumo elétrico',
      profile: 'Meu Perfil',
      settings: 'Configurações',
      manageTariffs: 'Gerenciar Tarifas',
      logout: 'Sair',
      consumptionControl: 'Controle de Consumo',
      applianceCalculator: 'Calculadora de Eletrodomésticos',
      openMenu: 'Abrir menu'
    },
    
    // Actions object
    actions: {
      resetMonth: 'Reiniciar Mês',
      resetMonthDescription: 'Reinicia todas as leituras do mês atual'
    },
    
    // Footer object
    footer: {
      message: 'Gerencie seu consumo de energia de forma inteligente',
      tech: 'Desenvolvido com tecnologia moderna para um melhor controle energético'
    },
    
    // Home page
    homePage: {
      loading: 'Carregando...',
      title: 'Controle de Energia',
      subtitle: 'Gerencie seu consumo elétrico de forma inteligente e economize na sua conta de luz',
      description: 'Registre suas leituras, analise seu consumo e calcule custos com precisão usando nossas ferramentas avançadas',
      
      // Consumption Control Card
      consumptionControl: {
        title: 'Controle de Consumo',
        description: 'Registre suas leituras mensais, visualize gráficos de consumo e obtenha estatísticas detalhadas para otimizar seu uso de energia.',
        features: {
          meterReadings: 'Registro de leituras do medidor',
          consumptionGraphs: 'Gráficos e estatísticas de consumo',
          monthlyProjections: 'Projeções mensais',
          costBreakdown: 'Detalhamento detalhado de custos'
        },
        button: 'Ir ao Controle de Consumo'
      },
      
      // Calculator Card
      calculator: {
        title: 'Calculadora de Tarifas',
        description: 'Calcule o custo exato do seu consumo elétrico com diferentes tarifas e bandeiras tarifárias do sistema brasileiro.',
        features: {
          tariffFlags: 'Cálculo com bandeiras tarifárias',
          tariffComparison: 'Comparação de tarifas',
          costSimulation: 'Simulação de custos',
          customTariffs: 'Gestão de tarifas personalizadas'
        },
        button: 'Ir à Calculadora'
      },
      
      // Benefits Section
      benefits: {
        title: 'Por que escolher nosso sistema?',
        subtitle: 'Ferramentas profissionais para o controle inteligente do seu consumo elétrico',
        guaranteedSavings: {
          title: 'Economia Garantida',
          description: 'Otimize seu consumo e reduza até 30% na sua conta elétrica'
        },
        totalPrecision: {
          title: 'Precisão Total',
          description: 'Cálculos exatos baseados nas tarifas oficiais brasileiras'
        },
        easyToUse: {
          title: 'Fácil de Usar',
          description: 'Interface intuitiva e moderna para uma experiência excepcional'
        }
      }
    },
    
    // Main page
    loadingData: 'Carregando dados...',
    monthActions: 'Ações do Mês',
    resetMonth: 'Reiniciar Mês',
    resetMonthDescription: 'Reinicia todas as leituras do mês atual',
    footerMessage: 'Gerencie seu consumo de energia de forma inteligente',
    
    // MonthSelector
    monthSelector: {
      title: 'Navegação de Períodos',
      description: 'Selecione o mês e ano para ver ou iniciar o registro de leituras',
      yearLabel: 'Ano:',
      currentLabel: '(Atual)',
      currentPeriod: 'Período atual:',
      howItWorks: 'Como funciona?',
      monthWithData: 'Mês com dados: Será mostrado o histórico existente',
      newMonth: 'Mês novo: Será solicitada a leitura inicial do medidor',
      yearChange: 'Mudança de ano: Inicia um novo período de medições',
      newPeriodTitle: 'Iniciar Novo Período',
      importantNote: 'Importante: Você vai iniciar um novo período de medições. Precisamos da leitura atual do seu medidor para começar.',
      monthLabel: 'Mês:',
      initialReadingLabel: 'Leitura inicial do medidor (kWh):',
      placeholder: 'Ex: 65788',
      cancel: 'Cancelar',
      startPeriod: 'Iniciar Período',
      validationError: 'A leitura inicial deve ser um número válido maior que 0',
      validationTooHigh: 'A leitura inicial parece muito alta',
      validationGeneral: 'Erro de validação'
    },
    
    // Months array
    months: {
      enero: 'janeiro',
      febrero: 'fevereiro',
      marzo: 'março',
      abril: 'abril',
      mayo: 'maio',
      junio: 'junho',
      julio: 'julho',
      agosto: 'agosto',
      septiembre: 'setembro',
      octubre: 'outubro',
      noviembre: 'novembro',
      diciembre: 'dezembro'
    },
    
    // ReadingForm
     addNewReading: 'Adicionar Nova Leitura',
     registerElectricConsumption: 'Registre seu consumo elétrico atual',
     readingDate: 'Data da leitura',
     meterReading: 'Leitura do medidor (kWh)',
     mustBeGreaterThan: 'Deve ser maior que',
     importantInfo: 'Informação importante',
     currentMeterReading: 'A leitura atual do medidor é',
     addingReading: 'Adicionando leitura',
     addReading: 'Adicionar Leitura',
     enterValidNumber: 'Por favor, insira um valor numérico válido',
    
    // ReadingsList
    readingsHistory: 'Histórico de Leituras',
    noReadingsRegistered: 'Não há leituras registradas',
    readingsWillAppear: 'As leituras que você adicionar aparecerão aqui',
    readingNumber: 'Leitura #',
    meterReadingLabel: 'Leitura do medidor',
    consumptionSincePrevious: 'Consumo desde anterior',
    totalMonthConsumption: 'Consumo total do mês',
    daysSinceStart: 'Dias desde o início',
    deleteReading: 'Excluir leitura',
    readingsRegistered: 'leitura registrada',
    readingsRegisteredPlural: 'leituras registradas',
    firstReading: 'Primeira Leitura',
    lastReading: 'Última Leitura',
    totalConsumption: 'Consumo Total',
    
    // ConsumptionStats
    statisticsOf: 'Estatísticas de',
    period: 'Período',
    monthProgress: 'Progresso do mês',
    day: 'Dia',
    of: 'de',
    totalConsumptionLabel: 'Consumo Total',
    accumulatedConsumption: 'Consumo acumulado do mês',
    dailyAverage: 'Média Diária',
    averageConsumptionPerDay: 'Consumo médio por dia',
    monthlyProjection: 'Projeção Mensal',
    estimationForMonth: 'Estimativa para todo o mês',
    estimatedCost: 'Custo Estimado',
    totalEstimatedCost: 'Custo total estimado',
    readingsSummary: 'Resumo das Leituras',
    totalReadingsRegistered: 'Total de leituras registradas',
    lastReadingValue: 'Última leitura',
    averageFrequency: 'Frequência média',
    projections: 'Projeções',
    remainingConsumption: 'Consumo restante estimado',
    remainingDays: 'Dias restantes do mês',
    suggestedDailyConsumption: 'Consumo diário sugerido',
    noReadingsForStats: 'Não há leituras registradas',
    addFirstReadingForStats: 'Adicione sua primeira leitura para ver as estatísticas de consumo',
    consumptionStatistics: 'Estatísticas de Consumo',
    monthlyAccumulatedConsumption: 'Consumo acumulado do mês',
    estimationForWholeMonth: 'Estimativa para todo o mês',
    dayOf: 'Dia {current} de {total}',
    estimatedRemainingConsumption: 'Consumo restante estimado',
    remainingDaysOfMonth: 'Dias restantes do mês',
    
    // CostBreakdown
    costBreakdown: 'Detalhamento de Custos',
    appliedTariff: 'Tarifa aplicada',
    activeTariff: 'Tarifa Ativa',
    flag: 'Bandeira',
    baseConsumption: 'Consumo Base',
    transmissionService: 'Serviço de Transmissão',
    sectorCharges: 'Encargos Setoriais',
    taxesAndCharges: 'Impostos e Encargos',
    publicLightingContribution: 'Contribuição Iluminação Pública',
    monthlyFixedRate: 'Taxa fixa mensal',
    totalToPay: 'Total a Pagar',
    consumedKwh: 'kWh consumidos',
    perKwh: 'por kWh',
    note: 'Nota',
    breakdownNote: 'Este detalhamento está baseado na estrutura tarifária de',
    selectedDistributor: 'a empresa distribuidora selecionada',
    breakdownDisclaimer: 'e pode variar conforme a região, tipo de conexão e período de faturamento.',
    noConsumptionRegistered: 'Não há consumo registrado',
    addReadingsForCostBreakdown: 'Adicione leituras para ver o detalhamento de custos',
    tariffPerKwh: 'Tarifa por kWh',
    monthConsumption: 'Consumo do mês',
    costComponents: 'Componentes do Custo',
    subtotal: 'Subtotal',
    finalTotal: 'Total Final',
    costEstimationNote: 'Os valores mostrados são estimativas baseadas nas tarifas vigentes. O custo real pode variar conforme outros fatores como descontos, subsídios ou mudanças nas tarifas durante o período de faturamento.',
    consumed: 'consumidos',
    selectedDistributionCompany: 'a empresa distribuidora selecionada',
    costVariationNote: 'e pode variar conforme a região, tipo de conexão e período de faturamento.',
    monthlyFixedTariff: 'Tarifa fixa mensal',
    costBreakdownNote: 'Este detalhamento está baseado na estrutura tarifária de',
    initialMeasurementDay: 'Dia de medição inicial',
    tooltipHelper: {
      readingTitle: 'Como encontrar a leitura do medidor',
      readingDescription: 'Procure o número da leitura atual na sua conta. Geralmente aparece como "Leitura Atual" ou "Consumo" em kWh.',
      readingImageAlt: 'Imagem mostrando onde encontrar a leitura na conta',
      measurementTitle: 'Como encontrar a data de medição',
      measurementDescription: 'Procure a data em que foi realizada a medição do medidor. Pode aparecer como "Data de Leitura" ou "Período de Faturamento".',
      measurementImageAlt: 'Imagem mostrando onde encontrar a data de medição na conta',
      tariffTitle: 'Como encontrar os valores das tarifas',
      tariffDescription: 'Procure a seção de "Detalhamento de Tarifas" ou "Composição do Consumo" na sua conta. Aqui você encontrará os valores por kWh de cada tarifa aplicada.',
      tariffImageAlt: 'Imagem mostrando onde encontrar os valores das tarifas na conta',
      helpButton: 'Ver ajuda visual',
      helpNote: 'Esta informação te ajudará a inserir os dados corretos da sua conta.'
    },
    
    // TariffFlagSelector
    tariffFlagSelector: {
      currentTariffFlag: 'Bandeira Tarifária Atual',
      selectTariffFlag: 'Selecionar Bandeira Tarifária',
      tariffFlag: 'Bandeira',
      noSurcharge: 'Sem acréscimo',
      whatDoesItMean: 'O que significa?',
      savingTips: 'Dicas para economizar',
      active: 'ativa',
      recommendations: 'Recomendações',
      andMore: 'Ver mais...',
      showLess: 'Ver menos',
      tariffFlagSystem: 'Sistema de Bandeiras Tarifárias',
      tariffFlagSystemDescription: 'As bandeiras tarifárias indicam as condições de geração de energia elétrica no país e determinam se haverá ou não acréscimo na conta de luz.',
      moreInfoANEEL: 'Mais informações ANEEL',
      howSystemWorks: 'Como funciona o sistema',
      flagWithSurcharge: 'Bandeira {name} - {surcharge}',
      flagMeaning: 'Bandeira {name} - O que significa?',
      flagActive: 'Bandeira {name} ativa',
      learnMore: 'Mais informações',
       
       // Flag explanations
      greenExplanation: 'Condições favoráveis de geração. Os reservatórios das hidrelétricas estão em níveis adequados e não é necessário acionar termelétricas mais caras.',
      yellowExplanation: 'Condições menos favoráveis. Os níveis dos reservatórios estão baixando e algumas termelétricas começam a operar, aumentando o custo de geração.',
      redLevel1Explanation: 'Condições mais caras. Os reservatórios estão em níveis baixos e mais termelétricas estão operando, aumentando significativamente os custos.',
      redLevel2Explanation: 'Condições muito caras. Os reservatórios estão em níveis críticos e quase todo o parque de termelétricas está acionado, resultando nos maiores custos de geração.',
      
      // Green flag tips
      greenTip1: 'Aproveite para usar eletrodomésticos de alto consumo',
      greenTip2: 'É um bom momento para carregar dispositivos eletrônicos',
      greenTip3: 'Pode usar o ar condicionado sem preocupações adicionais',
      greenTip4: 'Ideal para usar a secadora de roupas e lava-louças',
      greenTip5: 'Bom momento para passar roupas acumuladas',
      greenTip6: 'Pode usar o forno elétrico para cozinhar sem restrições',
      greenTip7: 'Aproveite para carregar veículos elétricos se tiver',
      greenTip8: 'É seguro usar aquecedores elétricos de água',
      
      // Yellow flag tips
      yellowTip1: 'Evite usar vários eletrodomésticos ao mesmo tempo',
      yellowTip2: 'Prefira usar a máquina de lavar e lava-louças em horários fora de pico (evite 18h-21h)',
      yellowTip3: 'Ajuste o ar condicionado para 23°C ou mais',
      yellowTip4: 'Apague luzes desnecessárias e use iluminação LED',
      yellowTip5: 'Reduza o tempo de banho em 2-3 minutos',
      yellowTip6: 'Use a função \'eco\' em eletrodomésticos quando disponível',
      yellowTip7: 'Evite abrir a porta da geladeira desnecessariamente',
      yellowTip8: 'Planeje melhor o uso do ferro (passe várias peças juntas)',
      yellowTip9: 'Considere secar roupas no sol em vez de usar secadora',
      
      // Red Level 1 tips
      redLevel1Tip1: 'Reduza o tempo de banho e use a opção \'verão\' do aquecedor',
      redLevel1Tip2: 'Evite usar eletrodomésticos no horário de pico (18h-21h)',
      redLevel1Tip3: 'Desligue aparelhos em standby da tomada',
      redLevel1Tip4: 'Use ventiladores em vez de ar condicionado quando possível',
      redLevel1Tip5: 'Planeje o uso de máquina de lavar e secadora para dias de menor consumo',
      redLevel1Tip6: 'Ajuste a temperatura da geladeira para 3-4°C (não mais frio)',
      redLevel1Tip7: 'Use microondas em vez do forno elétrico para esquentar comida',
      redLevel1Tip8: 'Desligue o aquecedor elétrico quando não estiver usando',
      redLevel1Tip9: 'Reduza o brilho de telas de TV e computadores',
      redLevel1Tip10: 'Evite usar múltiplos dispositivos eletrônicos simultaneamente',
      
      // Red Level 2 tips
      redLevel2Tip1: 'Reduza drasticamente o uso de eletrodomésticos de alto consumo',
      redLevel2Tip2: 'Tome banhos mais curtos e no modo \'verão\'',
      redLevel2Tip3: 'Evite completamente o horário de pico (18h-21h)',
      redLevel2Tip4: 'Desligue todos os aparelhos que não sejam essenciais',
      redLevel2Tip5: 'Use iluminação natural sempre que possível',
      redLevel2Tip6: 'Considere adiar atividades que exijam muita energia',
      redLevel2Tip7: 'Ajuste a temperatura da geladeira para níveis menos frios',
      redLevel2Tip8: 'Evite usar secadora de roupas - seque ao ar livre',
      redLevel2Tip9: 'Não use ar condicionado - opte por ventiladores',
      redLevel2Tip10: 'Cozinhe com gás em vez de eletrodomésticos elétricos',
      redLevel2Tip11: 'Carregue dispositivos móveis apenas quando necessário',
      redLevel2Tip12: 'Desligue completamente a TV quando não estiver assistindo',
      redLevel2Tip13: 'Use água fria para lavar roupas quando possível',
      redLevel2Tip14: 'Evite usar ferro elétrico - considere alternativas',
      
      greenFlag: {
        description: 'Condições favoráveis de geração de energia. Não há acréscimo adicional na tarifa.',
        tips: [
          'Momento ideal para usar eletrodomésticos de alto consumo',
          'Aproveite para carregar dispositivos eletrônicos',
          'É o melhor momento para usar ar condicionado se necessário'
        ]
      },
      yellowFlag: {
        description: 'Condições de geração menos favoráveis. Acréscimo de R$ 0,01885 para cada kWh consumido.',
        tips: [
          'Evite usar vários eletrodomésticos ao mesmo tempo',
          'Prefira usar a máquina de lavar e lava-louças em horários de menor consumo',
          'Reduza o uso de ar condicionado e aquecedores elétricos'
        ]
      },
      redFlag1: {
        description: 'Condições mais caras de geração. Acréscimo de R$ 0,04463 para cada kWh consumido.',
        tips: [
          'Evite usar eletrodomésticos de alto consumo',
          'Desligue aparelhos em standby',
          'Use iluminação LED e aproveite a luz natural',
          'Adie o uso de máquina de lavar, secadora e lava-louças'
        ]
      },
      redFlag2: {
        description: 'Condições críticas e mais caras. Acréscimo de R$ 0,07877 para cada kWh consumido.',
        tips: [
          'Reduza ao máximo o consumo de energia',
          'Use apenas eletrodomésticos essenciais',
          'Evite banhos muito longos com aquecedor elétrico',
          'Desligue todos os aparelhos não essenciais',
          'Considere usar geradores alternativos se possível'
        ]
      }
    },

    // TariffModal
    tariffModal: {
      newTariff: 'Nova Tarifa',
      city: 'Cidade *',
      state: 'Estado *',
      stateRequired: 'O estado é obrigatório',
      electricCompany: 'Companhia Elétrica *',
      tariffsByFlag: 'Tarifas por Bandeira (R$/kWh)',
      aneelInfo: 'Os acréscimos por bandeira são valores oficiais da ANEEL, uniformes para todo o Brasil',
      applyAneelValues: 'Aplicar Valores ANEEL',
      flagInfo: 'ℹ️ Informações sobre Bandeiras Tarifárias',
      greenFlagInfo: '🟢 Verde: Sem acréscimo adicional (R$ 0,00/kWh)',
      yellowFlagInfo: '🟡 Amarela: Acréscimo de R$ 0,01885/kWh',
      redFlag1Info: '🔴 Vermelha Patamar 1: Acréscimo de R$ 0,04463/kWh',
      redFlag2Info: '🔴 Vermelha Patamar 2: Acréscimo de R$ 0,07877/kWh',
      flagInfoNote: 'Estes valores são somados à tarifa base de energia da sua distribuidora.',
      greenFlagLabel: '🟢 Bandeira Verde * (Tarifa Base)',
      yellowFlagLabel: '🟡 Bandeira Amarela *',
      redFlag1Label: '🔴 Bandeira Vermelha Patamar 1 *',
      redFlag2Label: '🔴 Bandeira Vermelha Patamar 2 *',
      baseTariffNote: 'Tarifa base sem acréscimo adicional',
      fixedTariffs: 'Tarifas Fixas (R$)',
      additionalFees: 'Tarifas Adicionais',
      publicLighting: 'Iluminação Pública',
      makePublic: 'Tornar esta tarifa pública (outros usuários poderão vê-la e copiá-la)',
      cancel: 'Cancelar',
      saving: 'Salvando...',
      update: 'Atualizar',
      createTariff: 'Criar Tarifa',
      priceGreaterThanZero: 'O preço por kWh (verde) deve ser maior que 0'
    },

    // PublicTariffsModal
    publicTariffsModal: {
      title: 'Tarifas Públicas',
      searchPlaceholder: 'Buscar por cidade, estado ou companhia...',
      searching: 'Buscando...',
      search: 'Buscar',
      clear: 'Limpar',
      resultsFound: '{count} resultado(s) encontrado(s) para "{term}"',
      noTariffsFound: 'Nenhuma tarifa encontrada',
      noPublicTariffs: 'Não há tarifas públicas disponíveis',
      tryOtherTerms: 'Tente com outros termos de busca',
      beFirstToCreate: 'Seja o primeiro a criar uma tarifa pública',
      public: 'Pública',
      green: 'Verde',
      yellow: 'Amarela',
      red1: 'Vermelha 1',
      red2: 'Vermelha 2',
      additionalFees: 'Tarifas adicionais',
      publicLighting: 'Iluminação pública',
      created: 'Criada',
      copying: 'Copiando...',
      copyTariff: 'Copiar Tarifa',
      infoTitle: '💡 Informações sobre Tarifas Públicas',
      infoItems: [
        '• As tarifas públicas são criadas por outros usuários da comunidade',
        '• Ao copiar uma tarifa, será criada uma cópia pessoal que você poderá editar',
        '• Sempre verifique se os dados estão corretos antes de usar uma tarifa',
        '• Você pode tornar suas próprias tarifas públicas para ajudar outros usuários'
      ],
      close: 'Fechar'
    },

    // TariffSelector
    tariffSelector: {
      title: 'Selecionar Tarifa',
      change: 'Alterar',
      myTariffs: 'Minhas Tarifas',
      selectExisting: 'Selecionar uma tarifa existente...',
      createNew: '➕ Criar Nova Tarifa',
      viewPublic: '🌍 Ver Tarifas Públicas',
      tip: '💡 Dica: Você pode criar tarifas personalizadas ou usar tarifas públicas criadas por outros usuários.',
      newTariff: 'Nova Tarifa',
      confirmSelection: 'Confirmar Seleção'
    },

    // TariffManager
    tariffManager: {
      title: 'Gerenciamento de Tarifas',
      publicTariffs: 'Tarifas Públicas',
      newTariff: 'Nova Tarifa',
      noTariffsTitle: 'Você não tem tarifas criadas',
      noTariffsDescription: 'Crie sua primeira tarifa personalizada ou copie uma tarifa pública existente.',
      viewPublicTariffs: 'Ver Tarifas Públicas',
      createNewTariff: 'Criar Nova Tarifa',
      public: 'Pública',
      baseTariff: 'Tarifa Base',
      green: 'Verde',
      yellow: 'Amarela',
      red1: 'Vermelha 1',
      red2: 'Vermelha 2',
      additionalFees: 'Tarifas adicionais',
      publicLighting: 'Iluminação pública',
      selected: 'Selecionada',
      select: 'Selecionar',
      edit: 'Editar',
      delete: 'Excluir',
      deleting: 'Excluindo...',
      editTariff: 'Editar Tarifa',
      confirmSelection: 'Confirmar Seleção',
      confirmDeleteTitle: 'Confirmar exclusão',
      confirmDeleteMessage: 'Tem certeza de que deseja excluir esta tarifa? Esta ação não pode ser desfeita.',
      cancel: 'Cancelar',
      deleteError: 'Erro ao excluir a tarifa',
      copySuccess: 'Tarifa copiada com sucesso'
    },
    
    // Months
    january: 'janeiro',
    february: 'fevereiro',
    march: 'março',
    april: 'abril',
    may: 'maio',
    june: 'junho',
    july: 'julho',
    august: 'agosto',
    september: 'setembro',
    october: 'outubro',
    november: 'novembro',
    december: 'dezembro',
    
    // Units
    kwh: 'kWh',
    currency: 'R$',
    days: 'dias',
    
    // Section titles
    readings: 'Leituras',
    statistics: 'Estatísticas',
    costBreakdownTitle: 'Detalhamento de Custos',
    
    // General UI

    // SessionStatus
    sessionStatus: {
      title: 'Estado da Sessão',
      timeRemaining: 'Tempo restante:',
      extendSession: 'Estender Sessão',
      authenticatedUser: 'Usuário autenticado',
      onlyInDevelopment: 'Visível apenas em desenvolvimento',
      autoLogoutTooltip: 'Tempo até auto-logout'
    },

    // ConsumptionChart
    consumptionChart: {
      title: 'Gráfico de Consumo',
      noData: 'Não há dados para mostrar',
      addReadingsMessage: 'Adicione leituras para ver o gráfico',
      totalAccumulated: 'Consumo total acumulado:'
    },

    // PeriodNavigator
    periodNavigator: {
      period: 'Período:',
      current: '(Atual)',
      tariffAssigned: '✓ Tarifa atribuída',
      noTariff: '⚠ Sem tarifa',
      assignTariff: 'Atribuir tarifa',
      manageTariffs: 'Gerenciar Tarifas',
      newPeriodTitle: 'Iniciar Novo Período',
      importantNote: '📋 Importante:',
      importantMessage: 'Você vai iniciar um novo período de medições. Precisamos da leitura atual do seu medidor para começar.',
      initialReadingLabel: 'Leitura inicial do medidor (kWh):',
      placeholder: 'Ex: 65788',
      cancel: 'Cancelar',
      startPeriod: 'Iniciar Período',
      tariffManagementTitle: 'Gerenciamento de Tarifas',
      currentTariff: '✓ Tarifa atual:',
      noTariffAssigned: '⚠ Não há tarifa atribuída para este mês',
      confirmSelection: 'Confirmar Seleção',
      validationErrors: {
        invalidNumber: 'A leitura inicial deve ser um número válido maior que 0',
        tooHigh: 'A leitura inicial parece muito alta',
        validationError: 'Erro de validação'
      }
    },

    // Auth Components
    loginForm: {
      title: 'Fazer Login',
      email: 'E-mail',
      password: 'Senha',
      emailPlaceholder: 'seu@email.com',
      passwordPlaceholder: '••••••••',
      signingIn: 'Fazendo login...',
      signIn: 'Fazer Login',
      noAccount: 'Não tem uma conta?',
      signUpHere: 'Cadastre-se aqui'
    },

    signUpForm: {
      title: 'Criar Conta',
      email: 'E-mail',
      password: 'Senha',
      confirmPassword: 'Confirmar Senha',
      emailPlaceholder: 'seu@email.com',
      passwordPlaceholder: '••••••••',
      passwordMismatch: 'As senhas não coincidem',
      passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
      accountCreated: 'Conta criada com sucesso! Verifique seu e-mail para confirmar sua conta.',
      creatingAccount: 'Criando conta...',
      createAccount: 'Criar Conta',
      haveAccount: 'Já tem uma conta?',
      signInHere: 'Faça login aqui'
    },

    languageSelector: {
      selectLanguage: 'Selecionar idioma',
      chooseLanguage: 'Escolher idioma',
      active: 'Ativo / Activo'
    },

    // ConfirmationModal
    confirmationModal: {
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      processing: 'Processando...',
      tariffSelected: 'Tarifa Selecionada',
      tariffSelectedMessage: 'Você selecionou a tarifa de {city}, {state} - {company}. Deseja confirmar esta seleção?',
      tariffCreated: 'Tarifa Criada com Sucesso',
      tariffCreatedMessage: 'Sua nova tarifa para {city}, {state} - {company} foi criada com sucesso. Deseja usá-la agora?',
      useNow: 'Usar Agora',
      later: 'Mais Tarde'
    },

    // Exit confirmation
    confirmExit: 'Tem certeza?',
    confirmExitMessage: 'Tem certeza de que não quer carregar nenhum mês? Você será redirecionado para a página principal.',
    cancel: 'Cancelar',
    confirm: 'Confirmar',

    // Initial Month Modal
    initialMonthModal: {
      welcomeTitle: 'Bem-vindo ao Controle de Consumo!',
      welcomeSubtitle: 'Selecione o período que deseja gerenciar',
      selectYear: 'Selecione o ano',
      selectMonth: 'Selecione o mês',
      current: 'Atual',
      withData: 'Com dados',
      infoTitle: 'Informação:',
      monthsWithData: 'Meses com dados salvos - Serão carregados automaticamente',
      monthsWithoutData: 'Meses sem dados - Você poderá criar um novo período',
      createNewPeriod: 'Criar novo período',
      importantNote: 'Importante: Você precisa inserir a leitura inicial do medidor para este período.',
      measurementDay: 'Dia de medição',
      measurementDayHelp: 'Selecione o dia do mês em que foi realizada a medição de luz',
      dayLabel: 'Dia',
      back: 'Voltar',
      createPeriod: 'Criar período'
    },

    // CameraCapture
    cameraCapture: {
      title: 'Captura Automática',
      description: 'Tire uma foto do medidor para extrair a leitura',
      openCamera: '📷 Abrir Câmera',
      selectImage: '🖼️ Selecionar Imagem',
      capture: '📸 Capturar',
      cancel: '❌ Cancelar',
      close: '✕ Fechar',
      delete: '🗑️ Excluir',
      processing: 'Processando imagem...',
      capturedImage: 'Imagem capturada',
      cameraError: 'Não foi possível acessar a câmera. Verifique as permissões.',
      permissionDenied: 'Permissão de câmera negada. Permita o acesso nas configurações.',
      noCameraFound: 'Nenhuma câmera encontrada no dispositivo.',
      cameraNotSupported: 'A câmera não é compatível com este navegador.',
      cameraInUse: 'A câmera está sendo usada por outro aplicativo.',
      ocrError: 'Erro ao processar a imagem. Tente novamente.',
      noReadingDetected: 'Não foi possível detectar uma leitura válida na imagem. Tente com melhor iluminação ou ângulo.',
      invalidFileType: 'Tipo de arquivo inválido. Selecione uma imagem.',
      fileTooLarge: 'O arquivo é muito grande. Máximo 10MB.',
      imageTooSmall: 'A imagem é muito pequena. Mínimo 100x100 pixels.',
      imageTooLarge: 'A imagem é muito grande. Máximo 4000x4000 pixels.',
      invalidImage: 'Imagem inválida ou corrompida.',
      fileReadError: 'Erro ao ler o arquivo.',
      imageReadError: 'Erro ao ler a imagem para OCR.',
      networkError: 'Erro de conexão. Verifique sua internet.',
      memoryError: 'Erro de memória. Tente com uma imagem menor.',
      lowConfidence: 'Qualidade de imagem baixa. Tente com melhor iluminação.',
      tipsTitle: '💡 Dicas para melhores resultados:',
      tip1: '• Certifique-se de que os números estejam bem iluminados',
      tip2: '• Mantenha a câmera estável e focada',
      tip3: '• Os números devem estar claramente visíveis',
      tip4: '• Evite reflexos e sombras sobre o medidor'
    }
  }
};

// Provider del contexto
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  // Cargar idioma desde localStorage al inicializar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'pt-BR')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Guardar idioma en localStorage cuando cambie
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Función de traducción
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Retorna la clave original si no se encuentra
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook para usar el contexto
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}