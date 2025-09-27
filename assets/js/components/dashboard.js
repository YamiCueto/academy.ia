/* ===================================
   DASHBOARD.JS - Controlador Dashboard
   =================================== */

import { StorageManager } from '../utils/storage.js';
import { DateUtils } from '../utils/date-utils.js';
import { COURSES, ATTENDANCE_STATUS } from '../config/constants.js';

/**
 * Controlador para el dashboard
 */
export class DashboardController {
    
    constructor() {
        this.students = [];
        this.attendance = [];
        this.chart = null;
        
        this.init();
    }

    /**
     * Inicializa el controlador
     */
    init() {
        this.loadData();
        this.setupEventListeners();
        // Actualizar datos iniciales si ya estamos en la sección dashboard
        setTimeout(() => {
            if (document.getElementById('dashboard-section')?.classList.contains('active')) {
                this.updateStats();
                this.updateRecentActivity();
                this.renderChart();
            }
        }, 100);
    }

    /**
     * Configura event listeners específicos del dashboard
     */
    setupEventListeners() {
        // Actualizar stats cuando se muestren datos
        document.addEventListener('data-updated', () => {
            this.loadData();
            this.updateStats();
            this.updateRecentActivity();
        });

        // Actualizar cuando se modifiquen estudiantes
        document.addEventListener('student-added', () => {
            this.loadData();
            this.updateStats();
            this.updateRecentActivity();
        });

        document.addEventListener('student-updated', () => {
            this.loadData();
            this.updateStats();
            this.updateRecentActivity();
        });

        document.addEventListener('student-deleted', () => {
            this.loadData();
            this.updateStats();
            this.updateRecentActivity();
        });

        // Actualizar cuando se modifique asistencia
        document.addEventListener('attendance-updated', () => {
            this.loadData();
            this.updateStats();
            this.updateRecentActivity();
        });
    }

    /**
     * Se ejecuta cuando se muestra la sección
     */
    onSectionShow() {
        this.loadData();
        this.updateStats();
        this.updateRecentActivity();
        this.renderChart();
    }

    /**
     * Carga datos desde localStorage
     */
    loadData() {
        this.students = StorageManager.getStudents();
        this.attendance = StorageManager.getAttendance();
    }

    /**
     * Actualiza las estadísticas del dashboard
     */
    updateStats() {
        this.updateTotalStudents();
        this.updateTodayAttendance();
        this.updateAttendanceRate();
        this.updateActiveClasses();
    }

    /**
     * Actualiza total de estudiantes
     */
    updateTotalStudents() {
        const totalElement = document.getElementById('total-students');
        if (totalElement) {
            totalElement.textContent = this.students.length;
        }
    }

    /**
     * Actualiza asistencias de hoy
     */
    updateTodayAttendance() {
        const todayElement = document.getElementById('today-attendance');
        if (todayElement) {
            const today = DateUtils.formatDateForInput(new Date());
            const todayAttendance = this.attendance.filter(record => 
                record.date === today && record.status === ATTENDANCE_STATUS.PRESENT
            );
            
            todayElement.textContent = todayAttendance.length;
        }
    }

    /**
     * Actualiza tasa de asistencia
     */
    updateAttendanceRate() {
        const rateElement = document.getElementById('attendance-rate');
        if (rateElement) {
            const rate = this.calculateAttendanceRate();
            rateElement.textContent = `${rate}%`;
        }
    }

    /**
     * Actualiza clases activas
     */
    updateActiveClasses() {
        const activeElement = document.getElementById('active-classes');
        if (activeElement) {
            const activeCourses = new Set(this.students.map(student => student.course));
            activeElement.textContent = activeCourses.size;
        }
    }

    /**
     * Calcula la tasa de asistencia general
     * @returns {number} Porcentaje de asistencia
     */
    calculateAttendanceRate() {
        if (this.attendance.length === 0) return 0;
        
        const presentRecords = this.attendance.filter(record => 
            record.status === ATTENDANCE_STATUS.PRESENT
        );
        
        return Math.round((presentRecords.length / this.attendance.length) * 100);
    }

    /**
     * Actualiza la actividad reciente
     */
    updateRecentActivity() {
        const activityList = document.getElementById('recent-activity-list');
        if (!activityList) return;

        // Obtener registros recientes (últimos 10)
        const recentAttendance = [...this.attendance]
            .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
            .slice(0, 10);

        // Limpiar lista
        activityList.innerHTML = '';

        if (recentAttendance.length === 0) {
            activityList.innerHTML = '<li class="no-activity">No hay actividad reciente</li>';
            return;
        }

        // Generar elementos de actividad
        recentAttendance.forEach(record => {
            const student = this.students.find(s => s.id == record.studentId);
            if (!student) return;

            const listItem = document.createElement('li');
            listItem.className = 'activity-item';
            
            const statusClass = this.getStatusClass(record.status);
            const statusLabel = this.getStatusLabel(record.status);
            const timeAgo = DateUtils.getRelativeTime(record.timestamp || record.date);

            listItem.innerHTML = `
                <div class="activity-content">
                    <div class="activity-main">
                        <strong>${student.name}</strong>
                        <span class="badge ${statusClass}">${statusLabel}</span>
                    </div>
                    <div class="activity-details">
                        <span class="course">${COURSES[student.course] || student.course}</span>
                        <span class="time">${timeAgo}</span>
                    </div>
                </div>
            `;

            activityList.appendChild(listItem);
        });
    }

    /**
     * Obtiene la clase CSS para el estado de asistencia
     * @param {string} status - Estado de asistencia
     * @returns {string} Clase CSS
     */
    getStatusClass(status) {
        const statusClasses = {
            [ATTENDANCE_STATUS.PRESENT]: 'badge-success',
            [ATTENDANCE_STATUS.ABSENT]: 'badge-danger',
            [ATTENDANCE_STATUS.LATE]: 'badge-warning',
            [ATTENDANCE_STATUS.EXCUSED]: 'badge-primary'
        };
        
        return statusClasses[status] || 'badge-primary';
    }

    /**
     * Obtiene la etiqueta para el estado de asistencia
     * @param {string} status - Estado de asistencia
     * @returns {string} Etiqueta
     */
    getStatusLabel(status) {
        const statusLabels = {
            [ATTENDANCE_STATUS.PRESENT]: 'Presente',
            [ATTENDANCE_STATUS.ABSENT]: 'Ausente',
            [ATTENDANCE_STATUS.LATE]: 'Tardanza',
            [ATTENDANCE_STATUS.EXCUSED]: 'Justificado'
        };
        
        return statusLabels[status] || status;
    }

    /**
     * Renderiza el gráfico de asistencias
     */
    renderChart() {
        const canvas = document.getElementById('attendanceChart');
        if (!canvas) return;

        // Preparar datos para el gráfico (última semana)
        const chartData = this.prepareChartData();
        
        // Implementar gráfico simple con Canvas API
        this.drawChart(canvas, chartData);
    }

    /**
     * Prepara datos para el gráfico de la última semana
     * @returns {Array} Datos del gráfico
     */
    prepareChartData() {
        const data = [];
        const today = new Date();
        
        // Generar datos para los últimos 7 días
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = DateUtils.formatDateForInput(date);
            
            const dayAttendance = this.attendance.filter(record => 
                record.date === dateStr && record.status === ATTENDANCE_STATUS.PRESENT
            );
            
            data.push({
                date: dateStr,
                label: DateUtils.getDayName(date).substring(0, 3),
                value: dayAttendance.length
            });
        }
        
        return data;
    }

    /**
     * Dibuja el gráfico en el canvas
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Array} data - Datos del gráfico
     */
    drawChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Configuración
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        
        // Encontrar valor máximo
        const maxValue = Math.max(...data.map(d => d.value), 1);
        
        // Dibujar fondo
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(padding, padding, chartWidth, chartHeight);
        
        // Dibujar líneas de grilla
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        // Líneas horizontales
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        
        // Líneas verticales
        const barWidth = chartWidth / data.length;
        for (let i = 0; i <= data.length; i++) {
            const x = padding + barWidth * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
        }
        
        // Dibujar barras
        ctx.fillStyle = '#6366f1';
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = padding + (barWidth * index) + (barWidth * 0.1);
            const y = padding + chartHeight - barHeight;
            const width = barWidth * 0.8;
            
            ctx.fillRect(x, y, width, barHeight);
            
            // Etiquetas del día
            ctx.fillStyle = '#64748b';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + width/2, height - 10);
            
            // Valores
            if (item.value > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px Inter';
                ctx.fillText(item.value, x + width/2, y + barHeight/2 + 5);
            }
            
            ctx.fillStyle = '#6366f1';
        });
        
        // Título del gráfico
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Asistencias Diarias', padding, 25);
    }

    /**
     * Exporta datos del dashboard
     * @returns {Object} Datos del dashboard
     */
    exportDashboardData() {
        return {
            stats: {
                totalStudents: this.students.length,
                todayAttendance: this.getTodayAttendanceCount(),
                attendanceRate: this.calculateAttendanceRate(),
                activeClasses: new Set(this.students.map(s => s.course)).size
            },
            recentActivity: [...this.attendance]
                .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
                .slice(0, 10),
            chartData: this.prepareChartData(),
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Obtiene el conteo de asistencias de hoy
     * @returns {number} Número de asistencias de hoy
     */
    getTodayAttendanceCount() {
        const today = DateUtils.formatDateForInput(new Date());
        return this.attendance.filter(record => 
            record.date === today && record.status === ATTENDANCE_STATUS.PRESENT
        ).length;
    }
}