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
     * Renderiza el gráfico de asistencias con Highcharts
     */
    renderChart() {
        const chartContainer = document.getElementById('attendanceChart');
        if (!chartContainer) return;

        // Preparar datos para el gráfico (última semana)
        const chartData = this.prepareChartData();
        
        // Crear gráfico con Highcharts
        this.createHighchart(chartContainer, chartData);
    }

    /**
     * Prepara datos para el gráfico de la última semana
     * @returns {Object} Datos formateados para Highcharts
     */
    prepareChartData() {
        const labels = [];
        const presentData = [];
        const absentData = [];
        const lateData = [];
        const today = new Date();
        
        // Generar datos para los últimos 7 días
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = DateUtils.formatDateForInput(date);
            
            // Contar asistencias por estado
            const dayAttendance = this.attendance.filter(record => record.date === dateStr);
            const present = dayAttendance.filter(record => record.status === ATTENDANCE_STATUS.PRESENT).length;
            const absent = dayAttendance.filter(record => record.status === ATTENDANCE_STATUS.ABSENT).length;
            const late = dayAttendance.filter(record => record.status === ATTENDANCE_STATUS.LATE).length;
            
            labels.push(DateUtils.getDayName(date).substring(0, 3));
            presentData.push(present);
            absentData.push(absent);
            lateData.push(late);
        }
        
        return {
            labels: labels,
            present: presentData,
            absent: absentData,
            late: lateData
        };
    }

    /**
     * Crea el gráfico con Highcharts
     * @param {HTMLElement} container - Contenedor del gráfico
     * @param {Object} data - Datos del gráfico
     */
    createHighchart(container, data) {
        if (typeof Highcharts === 'undefined') {
            console.warn('Highcharts no está disponible');
            return;
        }

        // Configuración del gráfico
        const chartConfig = {
            chart: {
                type: 'line',
                height: 300,
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Asistencias por Día (Última Semana)',
                style: {
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                }
            },
            subtitle: {
                text: 'Seguimiento de asistencias, ausencias y tardanzas de los últimos 7 días'
            },
            xAxis: {
                categories: data.labels,
                title: {
                    text: 'Días de la Semana'
                },
                accessibility: {
                    description: 'Días de la semana de domingo a sábado'
                }
            },
            yAxis: {
                title: {
                    text: 'Número de Estudiantes'
                },
                min: 0,
                accessibility: {
                    description: 'Número de estudiantes por categoría de asistencia'
                }
            },
            series: [{
                name: 'Presente',
                data: data.present,
                color: '#10b981',
                marker: {
                    symbol: 'circle'
                },
                accessibility: {
                    description: 'Línea que muestra el número de estudiantes presentes cada día. Color verde.',
                    pointDescriptionFormatter: function(point) {
                        return point.category + ': ' + point.y + ' estudiantes presentes.';
                    }
                }
            }, {
                name: 'Ausente',
                data: data.absent,
                color: '#ef4444',
                marker: {
                    symbol: 'square'
                },
                accessibility: {
                    description: 'Línea que muestra el número de estudiantes ausentes cada día. Color rojo.',
                    pointDescriptionFormatter: function(point) {
                        return point.category + ': ' + point.y + ' estudiantes ausentes.';
                    }
                }
            }, {
                name: 'Tardanza',
                data: data.late,
                color: '#f59e0b',
                marker: {
                    symbol: 'triangle'
                },
                accessibility: {
                    description: 'Línea que muestra el número de estudiantes con tardanza cada día. Color amarillo.',
                    pointDescriptionFormatter: function(point) {
                        return point.category + ': ' + point.y + ' estudiantes con tardanza.';
                    }
                }
            }],
            tooltip: {
                shared: true,
                crosshairs: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e5e7eb',
                borderRadius: 8,
                shadow: true
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: true,
                    marker: {
                        radius: 4,
                        states: {
                            hover: {
                                radius: 6
                            }
                        }
                    }
                }
            },
            accessibility: {
                description: 'Gráfico de líneas que muestra las estadísticas de asistencia de los últimos 7 días, incluyendo estudiantes presentes, ausentes y con tardanza. Use las teclas de flecha para navegar entre los puntos de datos.',
                keyboardNavigation: {
                    seriesNavigation: {
                        mode: 'serialize'
                    }
                }
            },
            credits: {
                enabled: false
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        };

        // Crear el gráfico
        const chart = Highcharts.chart(container, chartConfig);
        
        // Guardar referencia para posibles actualizaciones
        this.chart = chart;
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