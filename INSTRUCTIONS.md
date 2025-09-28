# 📋 INSTRUCCIONES DE DESARROLLO - ACADEMY IA

> **🚨 LEER OBLIGATORIAMENTE ANTES DE AGREGAR FEATURES O MODIFICAR CÓDIGO**

## 🎯 FILOSOFÍA DEL PROYECTO

**SIMPLE, FUNCIONAL, VANILLA** - Este proyecto usa **HTML puro + CSS modular + Vanilla JavaScript** sin frameworks, sin módulos ES6, sin complicaciones.

## 🏗️ ARQUITECTURA ACTUAL

### **Estructura de archivos:**
```
academy-ia/
├── index.html                    # Entrada principal
├── assets/
│   ├── css/
│   │   ├── main.css             # Estilos base
│   │   ├── layout.css           # Layout y estructura
│   │   ├── components.css       # Componentes UI
│   │   └── responsive.css       # Media queries
│   ├── js/
│   │   └── app.js              # ⭐ ARCHIVO PRINCIPAL - TODO EN UNO
│   └── images/
├── .github/workflows/           # CI/CD pipelines
└── README.md
```

### **Librerías externas (CDN):**
- Chart.js v4.4.0 - Para gráficos
- SweetAlert2 v11.12.4 - Para notificaciones
- Font Awesome - Para iconos

## 🚨 REGLAS CRÍTICAS

### ❌ **LO QUE NO SE DEBE HACER:**
1. **NO usar módulos ES6** (`import/export`) - Causa errores de carga
2. **NO crear múltiples archivos JS** - Todo va en `app.js`
3. **NO usar frameworks** (React, Vue, Angular)
4. **NO complicar la arquitectura** - Mantener simple
5. **NO usar bundlers** (Webpack, Vite, etc.)
6. **NO usar TypeScript** - Solo JavaScript vanilla

### ✅ **LO QUE SÍ SE DEBE HACER:**
1. **Usar vanilla JavaScript puro** - Funciones globales simples
2. **Un solo archivo JS** - `assets/js/app.js`
3. **localStorage** para persistencia de datos
4. **Funciones nombradas** para eventos y acciones
5. **Código legible y comentado**
6. **CSS modular** pero sin preprocesadores

## 📂 FUNCIONALIDADES PRINCIPALES

### **1. Gestión de Estudiantes**
- Agregar estudiante: `addStudent()`
- Renderizar lista: `renderStudents()`
- Eliminar estudiante: `deleteStudent(id)`
- Poblar select: `populateStudentSelect()`

### **2. Control de Asistencias**
- Marcar asistencia: `markAttendance()`
- Renderizar registros: `renderAttendance()`
- Eliminar registro: `deleteAttendance(id)`

### **3. Dashboard**
- Actualizar estadísticas: `updateDashboard()`
- Mostrar métricas en tiempo real

### **4. Navegación**
- Cambiar sección: `showSection(sectionName)`
- Cerrar sidebar: `closeSidebar()`
- Navegación responsive

## 💾 ESTRUCTURA DE DATOS

### **Estudiantes (localStorage: 'students')**
```javascript
{
  id: 1234567890,           // timestamp
  name: "Juan Pérez",       // string
  email: "juan@email.com",  // string
  course: "JavaScript",     // string
  phone: "123456789",       // string (opcional)
  dateAdded: "2025-09-27T..."// ISO string
}
```

### **Asistencias (localStorage: 'attendance')**
```javascript
{
  id: 1234567890,           // timestamp
  studentId: 1234567890,    // referencia a student.id
  date: "2025-09-27",       // YYYY-MM-DD
  status: "presente",       // "presente" | "ausente"
  timestamp: "2025-09-27T..."// ISO string
}
```

## 🎨 ESTILOS CSS

### **Variables CSS principales:**
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --dark-color: #1f2937;
  --light-color: #f9fafb;
}
```

### **Clases importantes:**
- `.section` - Contenedores principales
- `.btn`, `.btn-primary`, `.btn-danger` - Botones
- `.card` - Tarjetas de contenido
- `.sidebar`, `.main-content` - Layout principal
- `.empty-state` - Estados vacíos

## 🚀 CÓMO AGREGAR NUEVAS FEATURES

### **1. Para nueva funcionalidad:**
1. Crear función en `app.js`
2. Agregar HTML necesario en `index.html`
3. Agregar estilos en CSS correspondiente
4. Registrar event listeners en `DOMContentLoaded`

### **2. Para nueva sección:**
1. Agregar HTML con `id="nueva-seccion"` y clase `section`
2. Agregar item en sidebar con `data-section="nueva-seccion"`
3. Agregar título en objeto `titles` de `showSection()`
4. Crear funciones render específicas

### **3. Para nueva validación:**
1. Agregar función `validateNuevaFeature()`
2. Llamar antes de procesar datos
3. Mostrar mensajes con `alert()` (simple) o SweetAlert2

## 🐛 DEBUGGING COMÚN

### **Errores típicos y soluciones:**
1. **"Cannot use import outside module"**
   - Solución: No usar `import/export`, usar funciones globales

2. **"Chart is not defined"**
   - Solución: Verificar que CDN de Chart.js esté cargado

3. **"Function not defined"**
   - Solución: Declarar funciones antes de usarlas

4. **LocalStorage no funciona**
   - Solución: Verificar `JSON.parse()` y `JSON.stringify()`

## 📱 RESPONSIVE DESIGN

### **Breakpoints:**
```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

### **Patrón de sidebar:**
- Mobile: Overlay con toggle
- Desktop: Sidebar fijo

## 🔄 CI/CD

### **GitHub Actions configurado:**
- `deploy.yml` - Deploy automático a GitHub Pages
- `pr-validation.yml` - Validación de PRs
- `dependabot.yml` - Actualizaciones automáticas

## ⚡ MEJORES PRÁCTICAS

### **JavaScript:**
- Usar `const` y `let`, nunca `var`
- Funciones arrow para callbacks simples
- Template literals para HTML
- Manejo de errores con `try/catch`

### **HTML:**
- Semántico y accesible
- ARIA labels cuando sea necesario
- IDs únicos y descriptivos

### **CSS:**
- Mobile-first approach
- Variables CSS para colores
- BEM methodology opcional pero recomendado

## 🚨 ANTES DE HACER CAMBIOS

**SIEMPRE:**
1. Leer estas instrucciones completas
2. Verificar que el proyecto funcione actualmente
3. Hacer backup o commit antes de cambios grandes
4. Probar en navegador real (no solo dev tools)
5. Verificar responsive design
6. Comprobar localStorage persistence

## 📋 CHECKLIST ANTES DE COMMIT

- [ ] ✅ Navegación entre secciones funciona
- [ ] ✅ Agregar estudiante funciona
- [ ] ✅ Marcar asistencia funciona
- [ ] ✅ Dashboard se actualiza
- [ ] ✅ Responsive design OK
- [ ] ✅ No hay errores en consola
- [ ] ✅ LocalStorage persiste datos
- [ ] ✅ Formularios se resetean después de submit

## 🎯 PRÓXIMAS FEATURES PERMITIDAS

**Solo agregar features que mantengan la simplicidad:**
- Exportar datos a CSV
- Filtros básicos por fecha/curso
- Gráficos simples con Chart.js
- Notificaciones con SweetAlert2
- Búsqueda simple con JavaScript
- Impresión de reportes

**❌ NO agregar:**
- Autenticación compleja
- Base de datos real
- APIs externas complejas
- Frameworks de JavaScript
- Bundlers o compiladores

---

## 🏆 MANTRA FINAL

> **"SI NO ES SIMPLE, NO VA EN ESTE PROYECTO"**
> 
> Mantener siempre la filosofía: **HTML + CSS + Vanilla JS = FUNCIONAL**

---

**📅 Última actualización:** 27/09/2025  
**👨‍💻 Desarrollador:** Academy IA Team  
**🎯 Objetivo:** Sistema de asistencias simple y efectivo