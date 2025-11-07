class SleepTracker {
    constructor() {
        this.sleepLogs = this.loadSleepLogs();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDashboard();
    }

    loadSleepLogs() {
        return JSON.parse(localStorage.getItem('flosparc_sleep_logs')) || [];
    }

    saveSleepLogs() {
        localStorage.setItem('flosparc_sleep_logs', JSON.stringify(this.sleepLogs));
        this.updateDashboard();
    }

    setupEventListeners() {
        // Modal controls
        document.getElementById('addSleepBtn')?.addEventListener('click', () => this.showSleepLogModal());
        document.getElementById('viewInsightsBtn')?.addEventListener('click', () => this.showInsightsModal());
        
        // Form handling
        document.getElementById('sleepLogForm')?.addEventListener('submit', (e) => this.handleSleepLogSubmit(e));
        
        // Chart period controls
        document.querySelectorAll('.chart-period').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chart-period').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateCharts(btn.dataset.period);
            });
        });

        // Filters
        document.getElementById('dateFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('qualityFilter')?.addEventListener('change', () => this.applyFilters());

        // Modal closing
        document.querySelectorAll('.close-modal, [data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    initializeCharts() {
        // Sleep Trend Chart
        const trendCtx = document.getElementById('sleepTrendChart')?.getContext('2d');
        if (trendCtx) {
            this.trendChart = new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Sleep Duration (hours)',
                        data: [],
                        borderColor: '#4C6FFF',
                        backgroundColor: 'rgba(76, 111, 255, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 12,
                            ticks: {
                                callback: value => `${value}h`
                            }
                        }
                    }
                }
            });
        }

        // Sleep Pattern Chart
        const patternCtx = document.getElementById('sleepPatternChart')?.getContext('2d');
        if (patternCtx) {
            this.patternChart = new Chart(patternCtx, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: 'Bedtime',
                            data: [],
                            backgroundColor: 'rgba(138, 92, 255, 0.7)',
                            pointRadius: 6
                        },
                        {
                            label: 'Wake time',
                            data: [],
                            backgroundColor: 'rgba(76, 111, 255, 0.7)',
                            pointRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            type: 'time',
                            time: {
                                unit: 'hour',
                                displayFormats: {
                                    hour: 'HH:mm'
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    updateDashboard() {
        this.updateStats();
        this.updateCharts();
        this.updateSleepLogs();
    }

    updateStats() {
        const recentLogs = this.getRecentLogs(7); // Last 7 days
        const previousLogs = this.getRecentLogs(14, 7); // Previous 7 days

        // Calculate average sleep duration
        const avgDuration = this.calculateAverageDuration(recentLogs);
        const prevAvgDuration = this.calculateAverageDuration(previousLogs);
        
        document.getElementById('avgSleepTime').textContent = this.formatDuration(avgDuration);
        
        // Calculate average sleep quality
        const avgQuality = this.calculateAverageQuality(recentLogs);
        const prevAvgQuality = this.calculateAverageQuality(previousLogs);
        
        const qualityChange = avgQuality - prevAvgQuality;
        document.getElementById('avgSleepQuality').textContent = `${Math.round(avgQuality)}%`;
        
        // Calculate bedtime consistency
        const consistency = this.calculateBedtimeConsistency(recentLogs);
        const prevConsistency = this.calculateBedtimeConsistency(previousLogs);
        
        const consistencyChange = consistency - prevConsistency;
        document.getElementById('bedtimeConsistency').textContent = `${Math.round(consistency)}%`;

        // Update change indicators
        this.updateChangeIndicator('avgSleepTime', avgDuration - prevAvgDuration);
        this.updateChangeIndicator('avgSleepQuality', qualityChange);
        this.updateChangeIndicator('bedtimeConsistency', consistencyChange);
    }

    updateCharts(period = 'week') {
        const dates = this.getDateRange(period);
        const logs = this.sleepLogs.filter(log => 
            new Date(log.bedtime) >= dates.start && new Date(log.bedtime) <= dates.end
        );

        // Update trend chart
        if (this.trendChart) {
            this.trendChart.data.labels = dates.labels;
            this.trendChart.data.datasets[0].data = dates.labels.map(date => {
                const dayLogs = logs.filter(log => 
                    new Date(log.bedtime).toLocaleDateString() === new Date(date).toLocaleDateString()
                );
                return dayLogs.length ? this.calculateSleepDuration(dayLogs[0]) : null;
            });
            this.trendChart.update();
        }

        // Update pattern chart
        if (this.patternChart) {
            this.patternChart.data.datasets[0].data = logs.map(log => ({
                x: new Date(log.bedtime).toLocaleDateString(),
                y: new Date(log.bedtime).toLocaleTimeString()
            }));
            this.patternChart.data.datasets[1].data = logs.map(log => ({
                x: new Date(log.waketime).toLocaleDateString(),
                y: new Date(log.waketime).toLocaleTimeString()
            }));
            this.patternChart.update();
        }
    }

    updateSleepLogs() {
        const container = document.getElementById('sleepLogsList');
        if (!container) return;

        const filteredLogs = this.getFilteredLogs();
        container.innerHTML = '';

        filteredLogs.forEach(log => {
            const duration = this.calculateSleepDuration(log);
            const logElement = document.createElement('div');
            logElement.className = 'sleep-log-item';
            logElement.innerHTML = `
                <div class="log-header">
                    <div class="log-date">${new Date(log.bedtime).toLocaleDateString()}</div>
                    <div class="log-quality ${log.quality}">${log.quality}</div>
                </div>
                <div class="log-details">
                    <div class="log-time">
                        <span>${new Date(log.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span class="separator">→</span>
                        <span>${new Date(log.waketime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="log-duration">${this.formatDuration(duration)}</div>
                </div>
                ${log.notes ? `<div class="log-notes">${log.notes}</div>` : ''}
                ${log.factors?.length ? `
                    <div class="log-factors">
                        ${log.factors.map(factor => `<span class="factor-tag">${factor}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="log-actions">
                    <button onclick="sleepTracker.editSleepLog('${log.id}')" class="edit-log">Edit</button>
                    <button onclick="sleepTracker.deleteSleepLog('${log.id}')" class="delete-log">Delete</button>
                </div>
            `;
            container.appendChild(logElement);
        });
    }

    getFilteredLogs() {
        const dateFilter = document.getElementById('dateFilter')?.value;
        const qualityFilter = document.getElementById('qualityFilter')?.value;

        return this.sleepLogs.filter(log => {
            const matchesDate = !dateFilter || new Date(log.bedtime).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
            const matchesQuality = qualityFilter === 'all' || log.quality === qualityFilter;
            return matchesDate && matchesQuality;
        }).sort((a, b) => new Date(b.bedtime) - new Date(a.bedtime));
    }

    showSleepLogModal(logData = null) {
        const modal = document.getElementById('sleepLogModal');
        const form = document.getElementById('sleepLogForm');
        
        if (logData) {
            // Edit mode
            form.dataset.editId = logData.id;
            Object.keys(logData).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    if (key === 'sleepFactors') {
                        logData[key].forEach(factor => {
                            document.querySelector(`input[name="sleepFactors"][value="${factor}"]`).checked = true;
                        });
                    } else if (input.type === 'radio') {
                        document.querySelector(`input[name="sleepQuality"][value="${logData[key]}"]`).checked = true;
                    } else {
                        input.value = logData[key];
                    }
                }
            });
        } else {
            // New log mode
            form.reset();
            delete form.dataset.editId;
            // Set default date/time values
            const now = new Date();
            document.getElementById('waketime').value = now.toISOString().slice(0, 16);
            now.setHours(now.getHours() - 8); // Assume 8 hours of sleep
            document.getElementById('bedtime').value = now.toISOString().slice(0, 16);
        }

        modal.style.display = 'block';
    }

    showInsightsModal() {
        const modal = document.getElementById('sleepInsightsModal');
        this.updateInsights();
        modal.style.display = 'block';
    }

    updateInsights() {
        const recentLogs = this.getRecentLogs(30); // Last 30 days
        
        // Update sleep score
        const sleepScore = this.calculateSleepScore(recentLogs);
        document.getElementById('scoreProgress').style.strokeDasharray = `${sleepScore}, 100`;
        document.querySelector('.score-value').textContent = Math.round(sleepScore);

        // Generate recommendations
        const recommendations = this.generateRecommendations(recentLogs);
        // Update recommendations in the modal...
    }

    calculateSleepScore(logs) {
        if (!logs.length) return 0;

        const durationScore = this.calculateAverageDuration(logs) / 8 * 100; // Assuming 8 hours is ideal
        const qualityScore = this.calculateAverageQuality(logs);
        const consistencyScore = this.calculateBedtimeConsistency(logs);

        return (durationScore * 0.4 + qualityScore * 0.3 + consistencyScore * 0.3);
    }

    generateRecommendations(logs) {
        const recommendations = [];
        const avgDuration = this.calculateAverageDuration(logs);
        const consistency = this.calculateBedtimeConsistency(logs);

        if (avgDuration < 7) {
            recommendations.push({
                title: 'Increase Sleep Duration',
                description: 'Try to get at least 7 hours of sleep per night for optimal health.'
            });
        }

        if (consistency < 70) {
            recommendations.push({
                title: 'Improve Sleep Schedule',
                description: 'Maintain a consistent sleep schedule, even on weekends.'
            });
        }

        // Analyze sleep factors
        const factors = this.analyzeSleepFactors(logs);
        Object.entries(factors).forEach(([factor, impact]) => {
            if (impact < 0) {
                recommendations.push({
                    title: `Reduce ${factor}`,
                    description: `${factor} appears to negatively impact your sleep quality.`
                });
            }
        });

        return recommendations;
    }

    analyzeSleepFactors(logs) {
        const factors = {};
        logs.forEach(log => {
            log.factors?.forEach(factor => {
                if (!factors[factor]) {
                    factors[factor] = {
                        count: 0,
                        qualitySum: 0
                    };
                }
                factors[factor].count++;
                factors[factor].qualitySum += this.getQualityScore(log.quality);
            });
        });

        return Object.fromEntries(
            Object.entries(factors).map(([factor, data]) => [
                factor,
                data.qualitySum / data.count - this.calculateAverageQuality(logs)
            ])
        );
    }

    handleSleepLogSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const sleepLog = {
            id: form.dataset.editId || `sleep-${Date.now()}`,
            bedtime: formData.get('bedtime'),
            waketime: formData.get('waketime'),
            quality: formData.get('sleepQuality'),
            notes: formData.get('sleepNotes'),
            factors: Array.from(formData.getAll('sleepFactors'))
        };

        const existingLogIndex = this.sleepLogs.findIndex(log => log.id === sleepLog.id);
        if (existingLogIndex >= 0) {
            this.sleepLogs[existingLogIndex] = sleepLog;
        } else {
            this.sleepLogs.push(sleepLog);
        }

        this.saveSleepLogs();
        this.closeModals();
        this.showNotification(`Sleep log ${existingLogIndex >= 0 ? 'updated' : 'added'} successfully`);
    }

    editSleepLog(logId) {
        const log = this.sleepLogs.find(l => l.id === logId);
        if (log) {
            this.showSleepLogModal(log);
        }
    }

    deleteSleepLog(logId) {
        if (confirm('Are you sure you want to delete this sleep log?')) {
            this.sleepLogs = this.sleepLogs.filter(log => log.id !== logId);
            this.saveSleepLogs();
            this.showNotification('Sleep log deleted successfully');
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    getRecentLogs(days, offset = 0) {
        const end = new Date();
        end.setDate(end.getDate() - offset);
        const start = new Date(end);
        start.setDate(start.getDate() - days);

        return this.sleepLogs.filter(log => {
            const date = new Date(log.bedtime);
            return date >= start && date <= end;
        });
    }

    getDateRange(period) {
        const dates = {
            labels: [],
            start: new Date(),
            end: new Date()
        };

        switch (period) {
            case 'week':
                dates.start.setDate(dates.end.getDate() - 7);
                break;
            case 'month':
                dates.start.setMonth(dates.end.getMonth() - 1);
                break;
            case 'year':
                dates.start.setFullYear(dates.end.getFullYear() - 1);
                break;
        }

        let current = new Date(dates.start);
        while (current <= dates.end) {
            dates.labels.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }

    calculateSleepDuration(log) {
        return (new Date(log.waketime) - new Date(log.bedtime)) / (1000 * 60 * 60);
    }

    calculateAverageDuration(logs) {
        if (!logs.length) return 0;
        return logs.reduce((sum, log) => sum + this.calculateSleepDuration(log), 0) / logs.length;
    }

    calculateAverageQuality(logs) {
        if (!logs.length) return 0;
        return logs.reduce((sum, log) => sum + this.getQualityScore(log.quality), 0) / logs.length;
    }

    calculateBedtimeConsistency(logs) {
        if (logs.length < 2) return 100;

        const bedtimes = logs.map(log => {
            const date = new Date(log.bedtime);
            return date.getHours() * 60 + date.getMinutes();
        });

        const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
        const variance = bedtimes.reduce((sum, time) => {
            const diff = time - avgBedtime;
            return sum + (diff * diff);
        }, 0) / bedtimes.length;

        const standardDeviation = Math.sqrt(variance);
        // Convert to percentage (lower deviation = higher consistency)
        return Math.max(0, 100 - (standardDeviation / 30)); // 30 minutes deviation = 0%
    }

    getQualityScore(quality) {
        const scores = {
            poor: 25,
            fair: 50,
            good: 75,
            excellent: 100
        };
        return scores[quality] || 0;
    }

    formatDuration(hours) {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    }

    updateChangeIndicator(elementId, change) {
        const element = document.querySelector(`#${elementId}`).nextElementSibling;
        if (element) {
            element.className = `stat-change ${change >= 0 ? 'positive' : 'negative'}`;
            element.textContent = `${change >= 0 ? '+' : ''}${this.formatDuration(change)} from last week`;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'sleep-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 2000);
        }, 100);
    }
}

// Initialize Sleep Tracker
document.addEventListener('DOMContentLoaded', () => {
    window.sleepTracker = new SleepTracker();
});