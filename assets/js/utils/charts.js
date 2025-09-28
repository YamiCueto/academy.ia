/* ===================================
   CHARTS.JS - Highcharts Integration
   =================================== */

/**
 * Clase para manejar gráficos con Highcharts
 */
export class ChartManager {
    
    constructor() {
        this.charts = new Map();
        this.initDefaults();
    }

    /**
     * Inicializa configuraciones por defecto de Highcharts
     */
    initDefaults() {
        if (typeof Highcharts !== 'undefined') {
            // Configuración global de Highcharts
            Highcharts.setOptions({
                colors: [
                    '#667eea', '#764ba2', '#10b981', '#f59e0b', 
                    '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'
                ],
                chart: {
                    backgroundColor: 'transparent',
                    style: {
                        fontFamily: 'Inter, sans-serif'
                    }
                },
                title: {
                    style: {
                        color: '#1f2937',
                        fontSize: '18px',
                        fontWeight: '600'
                    }
                },
                legend: {
                    itemStyle: {
                        color: '#6b7280',
                        fontSize: '14px'
                    }
                },
                credits: {
                    enabled: false
                }
            });
            
            console.log('✅ Highcharts initialized with custom defaults');
        } else {
            console.warn('⚠️ Highcharts not loaded');
        }
    }

    /**
     * Crea un gráfico de líneas para asistencias por día
     * @param {string} containerId - ID del contenedor
     * @param {Array} data - Datos del gráfico
     * @param {Object} options - Opciones adicionales
     */
    createAttendanceLineChart(containerId, data, options = {}) {
        const chartConfig = {
            chart: {
                type: 'line',
                height: options.height || 300
            },
            title: {
                text: options.title || 'Asistencias por Día'
            },
            xAxis: {
                categories: data.labels || [],
                title: {
                    text: 'Días'
                }
            },
            yAxis: {
                title: {
                    text: 'Número de Asistencias'
                },
                min: 0
            },
            series: [{
                name: 'Presente',
                data: data.present || [],
                color: '#10b981'
            }, {
                name: 'Ausente',
                data: data.absent || [],
                color: '#ef4444'
            }, {
                name: 'Tardanza',
                data: data.late || [],
                color: '#f59e0b'
            }],
            tooltip: {
                shared: true,
                crosshairs: true
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: true
                }
            }
        };

        const chart = Highcharts.chart(containerId, chartConfig);
        this.charts.set(containerId, chart);
        return chart;
    }

    /**
     * Crea un gráfico de barras para estadísticas por curso
     * @param {string} containerId - ID del contenedor
     * @param {Array} data - Datos del gráfico
     * @param {Object} options - Opciones adicionales
     */
    createCourseBarChart(containerId, data, options = {}) {
        const chartConfig = {
            chart: {
                type: 'column',
                height: options.height || 350
            },
            title: {
                text: options.title || 'Estadísticas por Curso'
            },
            xAxis: {
                categories: data.courses || [],
                title: {
                    text: 'Cursos'
                }
            },
            yAxis: {
                title: {
                    text: 'Número de Estudiantes'
                },
                min: 0
            },
            series: [{
                name: 'Total Estudiantes',
                data: data.totalStudents || [],
                color: '#667eea'
            }, {
                name: 'Asistencias Promedio',
                data: data.avgAttendance || [],
                color: '#10b981'
            }],
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            tooltip: {
                shared: true
            }
        };

        const chart = Highcharts.chart(containerId, chartConfig);
        this.charts.set(containerId, chart);
        return chart;
    }

    /**
     * Crea un gráfico de dona para distribución de asistencias
     * @param {string} containerId - ID del contenedor
     * @param {Array} data - Datos del gráfico
     * @param {Object} options - Opciones adicionales
     */
    createAttendancePieChart(containerId, data, options = {}) {
        const chartConfig = {
            chart: {
                type: 'pie',
                height: options.height || 300
            },
            title: {
                text: options.title || 'Distribución de Asistencias'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br/>Total: <b>{point.y}</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Asistencias',
                colorByPoint: true,
                data: data.map(item => ({
                    name: item.name,
                    y: item.value,
                    color: this.getStatusColor(item.status)
                }))
            }]
        };

        const chart = Highcharts.chart(containerId, chartConfig);
        this.charts.set(containerId, chart);
        return chart;
    }

    /**
     * Crea un gráfico de área para tendencias mensuales
     * @param {string} containerId - ID del contenedor
     * @param {Array} data - Datos del gráfico
     * @param {Object} options - Opciones adicionales
     */
    createMonthlyTrendChart(containerId, data, options = {}) {
        const chartConfig = {
            chart: {
                type: 'area',
                height: options.height || 350
            },
            title: {
                text: options.title || 'Tendencia Mensual de Asistencias'
            },
            xAxis: {
                categories: data.months || [],
                title: {
                    text: 'Meses'
                }
            },
            yAxis: {
                title: {
                    text: 'Porcentaje de Asistencia'
                },
                min: 0,
                max: 100,
                labels: {
                    format: '{value}%'
                }
            },
            series: [{
                name: 'Asistencia (%)',
                data: data.attendance || [],
                fillOpacity: 0.3,
                color: '#667eea'
            }],
            tooltip: {
                valueSuffix: '%'
            },
            plotOptions: {
                area: {
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            }
        };

        const chart = Highcharts.chart(containerId, chartConfig);
        this.charts.set(containerId, chart);
        return chart;
    }

    /**
     * Actualiza un gráfico existente con nuevos datos
     * @param {string} containerId - ID del contenedor
     * @param {Array} newData - Nuevos datos
     */
    updateChart(containerId, newData) {
        const chart = this.charts.get(containerId);
        if (chart) {
            chart.series.forEach((serie, index) => {
                if (newData[index]) {
                    serie.setData(newData[index], false);
                }
            });
            chart.redraw();
        }
    }

    /**
     * Destruye un gráfico específico
     * @param {string} containerId - ID del contenedor
     */
    destroyChart(containerId) {
        const chart = this.charts.get(containerId);
        if (chart) {
            chart.destroy();
            this.charts.delete(containerId);
        }
    }

    /**
     * Destruye todos los gráficos
     */
    destroyAllCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    /**
     * Redimensiona todos los gráficos
     */
    resizeAllCharts() {
        this.charts.forEach(chart => {
            if (chart.reflow) {
                chart.reflow();
            }
        });
    }

    /**
     * Obtiene el color según el estado de asistencia
     * @param {string} status - Estado de asistencia
     * @returns {string} Color hexadecimal
     */
    getStatusColor(status) {
        const colors = {
            present: '#10b981',  // Verde
            absent: '#ef4444',   // Rojo
            late: '#f59e0b',     // Amarillo
            excused: '#8b5cf6'   // Púrpura
        };
        return colors[status] || '#6b7280';
    }

    /**
     * Verifica si Highcharts está disponible
     * @returns {boolean}
     */
    static isAvailable() {
        return typeof Highcharts !== 'undefined';
    }
}

// Instancia global del gestor de gráficos
export const chartManager = new ChartManager();

// Función para inicializar Highcharts (compatibilidad)
export function initializeChartDefaults() {
    if (ChartManager.isAvailable()) {
        const manager = new ChartManager();
        console.log('✅ Highcharts defaults initialized');
        return manager;
    } else {
        console.error('❌ Highcharts not available');
        return null;
    }
}