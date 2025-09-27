# 🎓 Academia de Idiomas - Sistema de Control de Asistencias

<div align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status">
</div>

<p align="center">
  <strong>Un sistema moderno y elegante para el control de asistencias en academias de idiomas</strong>
</p>

---

## ✨ Características Principales

### 🎯 **Dashboard Interactivo**
- Visualización de estadísticas en tiempo real
- Gráficos modernos y tarjetas informativas
- Resumen de actividades del día

### 👨‍🎓 **Gestión de Estudiantes**
- Registro completo de estudiantes
- Información de contacto y curso asignado
- Niveles de competencia y fechas de inscripción

### ✅ **Control de Asistencias**
- Marcado rápido de asistencia
- Historial completo por estudiante
- Filtrado por fechas y cursos

### 📊 **Reportes Avanzados**
- Estadísticas de asistencia por curso
- Exportación de datos
- Análisis de tendencias

## 🚀 Demo en Vivo

[Ver Demo](https://yamicueto.github.io/academy-ia) *(¡Próximamente!)*

## 📸 Screenshots

<details>
<summary>🖼️ Ver capturas de pantalla</summary>

### Dashboard Principal
![Dashboard](https://via.placeholder.com/800x400/6366f1/ffffff?text=Dashboard+Principal)

### Gestión de Estudiantes  
![Estudiantes](https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Gestión+de+Estudiantes)

### Control de Asistencias
![Asistencias](https://via.placeholder.com/800x400/10b981/ffffff?text=Control+de+Asistencias)

</details>

## 🛠️ Tecnologías Utilizadas

| Tecnología | Descripción |
|------------|-------------|
| **HTML5** | Estructura semántica y moderna |
| **CSS3** | Estilos avanzados con variables CSS y gradientes |
| **JavaScript ES6+** | Lógica de aplicación con clases y módulos |
| **Font Awesome** | Iconos profesionales |
| **Google Fonts** | Tipografía Inter para mejor legibilidad |
| **LocalStorage** | Persistencia de datos del lado del cliente |

## 🎨 Características de Diseño

- **🌈 Tema Moderno**: Diseño con gradientes y colores vibrantes
- **📱 Responsive**: Adaptable a todos los dispositivos
- **🎭 Animaciones**: Transiciones suaves y efectos hover
- **🎯 UX/UI**: Interfaz intuitiva y fácil de usar
- **🌙 Sidebar Fijo**: Navegación lateral para mejor organización

## 📋 Instalación y Uso

### Instalación Rápida

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/YamiCueto/academy-ia.git
   cd academy-ia
   ```

2. **Abre el proyecto**
   - Simplemente abre `index.html` en tu navegador favorito
   - O usa un servidor local para mejor experiencia:

   ```bash
   # Con Python
   python -m http.server 3000
   
   # Con Node.js (usando npx)
   npx serve .
   
   # Con VS Code Live Server
   # Clic derecho en index.html -> Open with Live Server
   ```

3. **¡Listo!** 🎉
   - Navega a `http://localhost:3000`
   - Comienza a usar el sistema

### Primeros Pasos

1. **Explora el Dashboard** - Revisa las estadísticas generales
2. **Agrega Estudiantes** - Ve a la sección "Estudiantes" 
3. **Marca Asistencias** - Usa el botón "Marcar Asistencia"
4. **Revisa Reportes** - Analiza las tendencias de asistencia

## 🏗️ Estructura del Proyecto

```
academy-ia/
│
├── 📄 index.html                    # Página principal (mantienes tu versión actual)
├── 📄 index-new.html                # Nueva versión modular mejorada
├── 📁 assets/                       # Recursos organizados
│   ├── 📁 css/                     # Estilos modulares
│   │   ├── main.css                # Variables, reset y utilidades
│   │   ├── layout.css              # Estructura y layout
│   │   ├── components.css          # Componentes UI reutilizables
│   │   └── responsive.css          # Media queries y mobile
│   ├── 📁 js/                      # JavaScript modular
│   │   ├── app.js                  # Aplicación principal
│   │   ├── components/             # Controladores de secciones
│   │   │   ├── dashboard.js        # Lógica del dashboard
│   │   │   ├── students.js         # Gestión de estudiantes
│   │   │   ├── attendance.js       # Control de asistencias
│   │   │   └── reports.js          # Sistema de reportes
│   │   ├── utils/                  # Utilidades reutilizables
│   │   │   ├── storage.js          # Gestión de LocalStorage
│   │   │   ├── date-utils.js       # Utilidades de fechas
│   │   │   └── validators.js       # Sistema de validaciones
│   │   └── config/                 # Configuración
│   │       └── constants.js        # Constantes de la aplicación
│   └── 📁 images/                  # Imágenes y assets
├── 📁 components/                   # [Preparado para] Componentes HTML
├── 🎨 styles.css                   # Estilos originales (mantienes)
├── ⚡ script.js                    # JavaScript original (mantienes)  
└── 📖 README.md                    # Esta documentación
```

### 🆕 **Ventajas de la Nueva Estructura:**

- **🔧 Modularidad**: Cada funcionalidad en su propio archivo
- **📱 Responsive mejorado**: Media queries organizadas
- **♿ Accesibilidad**: ARIA labels y navegación por teclado
- **🎨 CSS Variables**: Fácil personalización de temas
- **📦 ES6 Modules**: Imports/exports nativos del navegador
- **🏗️ Arquitectura MVC**: Separación clara de responsabilidades
- **🔍 SEO optimizado**: Meta tags y estructura semántica
- **⚡ Performance**: Código optimizado y lazy loading

### 🚀 **Cómo Usar la Nueva Estructura:**

1. **Mantén tu versión actual** (`index.html`) funcionando
2. **Prueba la nueva versión** abriendo `index-new.html`  
3. **Sin instalaciones**: Todo sigue siendo HTML/CSS/JS puro
4. **Desarrollo incremental**: Migra funciones gradualmente

## 📊 Cursos Disponibles

El sistema incluye soporte para múltiples cursos de idiomas:

- 🟢 **Inglés Básico** (A1-A2)
- 🟡 **Inglés Intermedio** (B1-B2) 
- 🔴 **Inglés Avanzado** (C1-C2)
- 💬 **Inglés Conversación**
- 🎯 **Preparación TOEFL**

## 💡 Funcionalidades Clave

### Para Administradores
- ✅ Gestión completa de estudiantes
- ✅ Registro de asistencias en tiempo real
- ✅ Generación de reportes automáticos
- ✅ Estadísticas visuales interactivas

### Para Profesores  
- ✅ Marcado rápido de asistencia
- ✅ Visualización del historial de estudiantes
- ✅ Filtros por fecha y curso
- ✅ Interfaz intuitiva y fácil de usar

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar el proyecto:

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

### Ideas para Contribuir
- 🌐 Agregar más idiomas (francés, alemán, etc.)
- 📧 Sistema de notificaciones por email
- 📱 App móvil complementaria
- 🔐 Sistema de autenticación
- 📈 Más tipos de reportes y gráficos

## 🐛 Reportar Issues

¿Encontraste un bug? ¿Tienes una sugerencia?

1. Revisa si ya existe un [issue similar](../../issues)
2. Si no existe, [crea uno nuevo](../../issues/new)
3. Incluye toda la información posible:
   - Navegador y versión
   - Pasos para reproducir el problema
   - Screenshots si es necesario

## 📝 Changelog

### v1.0.0 (2024-01-15)
- 🎉 Lanzamiento inicial
- ✅ Dashboard completo
- ✅ Gestión de estudiantes
- ✅ Control de asistencias
- ✅ Sistema de reportes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**YamiCueto**
- GitHub: [@YamiCueto](https://github.com/YamiCueto)
- Email: [yamicueto@email.com](mailto:yamidcuetomazo@gmail.com)

---

<div align="center">
  <p>⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub! ⭐</p>
  
  **Hecho con ❤️ y mucho ☕ en Colombia**
  
  <img src="https://img.shields.io/github/stars/YamiCueto/academy-ia?style=social" alt="GitHub stars">
  <img src="https://img.shields.io/github/forks/YamiCueto/academy-ia?style=social" alt="GitHub forks">
</div>

## 🏆 Agradecimientos

- Font Awesome por los iconos increíbles
- Google Fonts por la tipografía Inter
- La comunidad de desarrolladores por la inspiración constante

---

*¿Te resultó útil este proyecto? ¡Compártelo con otros desarrolladores!* 🚀