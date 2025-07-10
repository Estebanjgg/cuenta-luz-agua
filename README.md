
# ⚡ Gestor de Consumo Energético Inteligente 💧

Aplicación web moderna y completa para monitorear, analizar y controlar tu consumo de energía eléctrica. Desarrollada con Next.js, TypeScript, Tailwind CSS y Supabase, esta herramienta te ofrece un control total sobre tus gastos energéticos.

## ✨ Características Principales

La aplicación ha evolucionado para convertirse en una solución integral de gestión energética, con funcionalidades avanzadas que van más allá del simple seguimiento.

### **📊 Control de Consumo y Análisis**

- **Registro Diario de Lecturas**: Añade lecturas del medidor con fecha personalizada y validación automática para garantizar la coherencia de los datos.
- **Cálculos Automáticos**: El sistema calcula el consumo acumulado, el promedio diario y los costos estimados en tiempo real.
- **Gráficos Visuales**: Visualiza la evolución de tu consumo con gráficos interactivos generados con Canvas.
- **Proyecciones Mensuales**: Obtén estimaciones precisas de tu consumo y costo total para el mes en curso.
- **Navegación por Períodos**: Cambia fácilmente entre diferentes meses y años para consultar tu historial.
- **Captura por Cámara (OCR)**: Utiliza la cámara de tu dispositivo para capturar la lectura del medidor automáticamente.

### **🔌 Sistema Avanzado de Tarifas**

- **Gestión de Tarifas Personalizadas**: Crea y guarda múltiples perfiles de tarifas para diferentes ciudades, estados o compañías eléctricas.
- **Tarifas Públicas Comunitarias**: Accede a una base de datos de tarifas creadas por otros usuarios, y comparte las tuyas.
- **Asignación Mensual de Tarifas**: Asigna una tarifa específica a cada mes, ideal para gestionar cambios de precios o mudanzas.
- **Soporte para Banderas Tarifarias de Brasil**: El sistema integra las banderas Verde, Amarilla y Roja (Nivel 1 y 2), recalculando los costos según la selección.

### **🌍 Internacionalización (i18n)**

- **Soporte Multilenguaje**: La interfaz está disponible en **Español** y **Portugués (BR)**.
- **Selector de Idioma Persistente**: Cambia de idioma fácilmente desde la barra de navegación; tu preferencia se guardará localmente.

### **🔐 Autenticación y Seguridad**

- **Sistema de Autenticación Completo**: Incluye registro de nuevos usuarios, inicio de sesión y gestión de sesiones con Supabase.
- **Login Animado**: Una experiencia de inicio de sesión atractiva y moderna.
- **Auto-Logout por Inactividad**: La sesión se cierra automáticamente tras un período de inactividad para mayor seguridad.

### **💡 Utilidades Adicionales**

- **Calculadora de Electrodomésticos**: Estima el consumo individual de tus aparatos para identificar a los mayores consumidores.
- **Almacenamiento en la Nube**: Tus datos se guardan de forma segura y persistente en Supabase.
- **Interfaz Moderna y Responsiva**: Diseño limpio, fácil de usar y adaptable a cualquier dispositivo.

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 15+ (con Turbopack)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Backend y Base de Datos**: Supabase
- **Animaciones**: GSAP (GreenSock Animation Platform)
- **Gráficos**: HTML5 Canvas
- **OCR**: Tesseract.js

## 🚀 Instalación y Uso

### **Prerrequisitos**

- Node.js 18+ instalado
- npm o yarn

### **Instalación**

1. Clona el repositorio:

   ```bash
   git clone https://github.com/estebanjgg/cuenta-luz-agua.git
   ```
2. Instala las dependencias:

   ```bash
   npm install
   ```
3. Configura las variables de entorno. Renombra el archivo `.env.example` a `.env.local` y añade tus claves de Supabase.
4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```
5. Abre [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) en tu navegador.

## 📈 Próximas Mejoras

- [ ] Exportar datos a Excel/CSV.
- [ ] Comparación visual entre diferentes meses.
- [ ] Alertas y notificaciones de consumo alto.
- [ ] Soporte para múltiples medidores (ej. agua, gas).
- [ ] Backup de datos en la nube para usuarios no registrados.
- [ ] Notificaciones push para recordar registrar la lectura.

## 🤝 Contribuciones

Este proyecto fue desarrollado para un control de consumo eléctrico detallado y personal. Si tienes sugerencias o mejoras, ¡son bienvenidas\!

## 📄 Licencia

Proyecto de uso personal para control de consumo eléctrico.

---

**¡Controla tu consumo, controla tus gastos\! ⚡💰**
