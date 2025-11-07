// Mood Journal Data Management
class MoodJournal {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('moodEntries')) || [];
        this.initializeUI();
        this.setupEventListeners();
        this.loadCharts();
        this.updateDashboard();
    }

    initializeUI() {
        this.moodEntryModal = document.getElementById('moodEntryModal');
        this.moodInsightsModal = document.getElementById('moodInsightsModal');
        this.moodEntryForm = document.getElementById('moodEntryForm');
        this.journalEntriesContainer = document.getElementById('journalEntries');
        this.energySlider = document.getElementById('energyLevel');
        this.dateFilter = document.getElementById('dateFilter');
        this.moodFilter = document.getElementById('moodFilter');
        this.tagFilter = document.getElementById('tagFilter');
    }

    setupEventListeners() {
        // Modal Controls
        document.getElementById('addMoodBtn').addEventListener('click', () => this.openMoodEntryModal());
        document.getElementById('viewInsightsBtn').addEventListener('click', () => this.openInsightsModal());
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => this.closeModals());
        });

        // Form Submission
        this.moodEntryForm.addEventListener('submit', (e) => this.handleEntrySubmission(e));

        // Energy Slider
        this.energySlider.addEventListener('input', (e) => this.updateEnergyLabel(e.target.value));

        // Filters
        this.dateFilter.addEventListener('change', () => this.applyFilters());
        this.moodFilter.addEventListener('change', () => this.applyFilters());
        this.tagFilter.addEventListener('change', () => this.applyFilters());

        // Chart Period Controls
        document.querySelectorAll('.chart-period').forEach(button => {
            button.addEventListener('click', (e) => this.updateChartPeriod(e));
        });
    }

    openMoodEntryModal() {
        this.moodEntryModal.style.display = 'flex';
        this.resetForm();
    }

    openInsightsModal() {
        this.moodInsightsModal.style.display = 'flex';
        this.updateInsights();
    }

    closeModals() {
        this.moodEntryModal.style.display = 'none';
        this.moodInsightsModal.style.display = 'none';
    }

    resetForm() {
        this.moodEntryForm.reset();
        this.updateEnergyLabel(3);
    }

    updateEnergyLabel(value) {
        const labels = document.querySelectorAll('.energy-labels span');
        labels.forEach(label => label.classList.remove('active'));
        if (value <= 2) labels[0].classList.add('active');
        else if (value <= 4) labels[1].classList.add('active');
        else labels[2].classList.add('active');
    }

    handleEntrySubmission(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            mood: formData.get('mood'),
            energyLevel: parseInt(formData.get('energyLevel')),
            journalEntry: formData.get('journalEntry'),
            activities: formData.getAll('activities'),
            factors: formData.getAll('factors')
        };

        this.entries.unshift(entry);
        this.saveEntries();
        this.updateDashboard();
        this.closeModals();
        this.showNotification('Mood entry saved successfully!');
    }

    saveEntries() {
        localStorage.setItem('moodEntries', JSON.stringify(this.entries));
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'mood-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateDashboard() {
        this.updateOverviewStats();
        this.renderJournalEntries();
        this.loadCharts();
    }

    updateOverviewStats() {
        if (this.entries.length === 0) return;

        const recentEntries = this.entries.slice(0, 7);
        const avgMoodEl = document.getElementById('avgMood');
        const consistencyEl = document.getElementById('moodConsistency');
        const energyEl = document.getElementById('avgEnergy');

        // Calculate average mood
        const moodScores = {
            'happy': 4,
            'calm': 3,
            'anxious': 2,
            'sad': 1
        };
        const avgMoodScore = recentEntries.reduce((sum, entry) => 
            sum + moodScores[entry.mood], 0) / recentEntries.length;
        
        avgMoodEl.textContent = avgMoodScore >= 3 ? 'Positive' : 'Needs Attention';

        // Calculate mood consistency
        const moodCounts = {};
        recentEntries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });
        const consistency = (Math.max(...Object.values(moodCounts)) / recentEntries.length) * 100;
        consistencyEl.textContent = `${Math.round(consistency)}%`;

        // Calculate average energy
        const avgEnergy = recentEntries.reduce((sum, entry) => 
            sum + entry.energyLevel, 0) / recentEntries.length;
        energyEl.textContent = avgEnergy <= 2 ? 'Low' : avgEnergy >= 4 ? 'High' : 'Medium';
    }

    renderJournalEntries() {
        const filteredEntries = this.getFilteredEntries();
        this.journalEntriesContainer.innerHTML = filteredEntries.map(entry => this.createEntryHTML(entry)).join('');
        
        // Setup edit and delete handlers
        this.journalEntriesContainer.querySelectorAll('.edit-entry').forEach(button => {
            button.addEventListener('click', (e) => this.editEntry(e.target.dataset.id));
        });
        this.journalEntriesContainer.querySelectorAll('.delete-entry').forEach(button => {
            button.addEventListener('click', (e) => this.deleteEntry(e.target.dataset.id));
        });
    }

    getFilteredEntries() {
        let filtered = [...this.entries];
        
        const dateValue = this.dateFilter.value;
        const moodValue = this.moodFilter.value;
        const tagValue = this.tagFilter.value;

        if (dateValue) {
            filtered = filtered.filter(entry => 
                entry.date.startsWith(dateValue));
        }

        if (moodValue !== 'all') {
            filtered = filtered.filter(entry => 
                entry.mood === moodValue);
        }

        if (tagValue !== 'all') {
            filtered = filtered.filter(entry => 
                entry.activities.includes(tagValue) || 
                entry.factors.includes(tagValue));
        }

        return filtered;
    }

    createEntryHTML(entry) {
        const date = new Date(entry.date).toLocaleDateString();
        const moodEmojis = {
            'happy': '😊',
            'calm': '😌',
            'anxious': '😰',
            'sad': '😢'
        };

        return `
            <div class="journal-entry">
                <div class="entry-header">
                    <div class="entry-mood">
                        <span class="mood-emoji">${moodEmojis[entry.mood]}</span>
                        <span class="mood-label">${entry.mood}</span>
                    </div>
                    <span class="entry-date">${date}</span>
                </div>
                <div class="entry-content">
                    <p>${entry.journalEntry}</p>
                </div>
                <div class="entry-activities">
                    ${entry.activities.map(activity => 
                        `<span class="activity-tag">${activity}</span>`).join('')}
                </div>
                <div class="entry-factors">
                    ${entry.factors.map(factor => 
                        `<span class="factor-tag">${factor}</span>`).join('')}
                </div>
                <div class="entry-actions">
                    <button class="edit-entry" data-id="${entry.id}">Edit</button>
                    <button class="delete-entry" data-id="${entry.id}">Delete</button>
                </div>
            </div>
        `;
    }

    editEntry(id) {
        const entry = this.entries.find(e => e.id === parseInt(id));
        if (!entry) return;

        // Populate form with entry data
        document.querySelector(`input[name="mood"][value="${entry.mood}"]`).checked = true;
        document.getElementById('energyLevel').value = entry.energyLevel;
        document.getElementById('journalEntry').value = entry.journalEntry;

        entry.activities.forEach(activity => {
            document.querySelector(`input[name="activities"][value="${activity}"]`).checked = true;
        });
        entry.factors.forEach(factor => {
            document.querySelector(`input[name="factors"][value="${factor}"]`).checked = true;
        });

        // Update energy label
        this.updateEnergyLabel(entry.energyLevel);

        // Store entry ID for update
        this.moodEntryForm.dataset.editId = id;
        this.openMoodEntryModal();
    }

    deleteEntry(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries = this.entries.filter(e => e.id !== parseInt(id));
            this.saveEntries();
            this.updateDashboard();
            this.showNotification('Entry deleted successfully');
        }
    }

    loadCharts() {
        this.updateMoodTrendChart();
        this.updateEmotionDistributionChart();
    }

    updateMoodTrendChart() {
        const ctx = document.getElementById('moodTrendChart').getContext('2d');
        const moodScores = {
            'happy': 4,
            'calm': 3,
            'anxious': 2,
            'sad': 1
        };

        const data = this.entries.slice(0, 7).reverse().map(entry => ({
            x: new Date(entry.date),
            y: moodScores[entry.mood]
        }));

        if (this.moodTrendChart) {
            this.moodTrendChart.destroy();
        }

        this.moodTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Mood Score',
                    data: data,
                    borderColor: '#4C6FFF',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: 0,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return ['', 'Sad', 'Anxious', 'Calm', 'Happy'][value] || '';
                            }
                        }
                    },
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    }
                }
            }
        });
    }

    updateEmotionDistributionChart() {
        const ctx = document.getElementById('emotionChart').getContext('2d');
        const moodCounts = this.entries.reduce((acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            return acc;
        }, {});

        if (this.emotionChart) {
            this.emotionChart.destroy();
        }

        this.emotionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(moodCounts),
                datasets: [{
                    data: Object.values(moodCounts),
                    backgroundColor: [
                        '#4C6FFF', // happy
                        '#00C853', // calm
                        '#FFB300', // anxious
                        '#FF5252'  // sad
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateInsights() {
        this.updatePositiveTriggers();
        this.updateAttentionAreas();
        this.updateWeeklyGoals();
    }

    updatePositiveTriggers() {
        const positiveTriggers = document.getElementById('positiveTriggers');
        const happyEntries = this.entries.filter(entry => entry.mood === 'happy');
        
        // Count activities and factors that correlate with happy moods
        const triggerCounts = {};
        happyEntries.forEach(entry => {
            [...entry.activities, ...entry.factors].forEach(trigger => {
                triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
            });
        });

        // Sort triggers by frequency
        const sortedTriggers = Object.entries(triggerCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        positiveTriggers.innerHTML = sortedTriggers.map(([trigger, count]) => `
            <li>${trigger} (${count} times)</li>
        `).join('');
    }

    updateAttentionAreas() {
        const attentionAreas = document.getElementById('attentionAreas');
        const negativeEntries = this.entries.filter(entry => 
            entry.mood === 'sad' || entry.mood === 'anxious');
        
        // Count factors that correlate with negative moods
        const factorCounts = {};
        negativeEntries.forEach(entry => {
            entry.factors.forEach(factor => {
                factorCounts[factor] = (factorCounts[factor] || 0) + 1;
            });
        });

        // Sort factors by frequency
        const sortedFactors = Object.entries(factorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        attentionAreas.innerHTML = sortedFactors.map(([factor, count]) => `
            <li>${factor} (${count} times)</li>
        `).join('');
    }

    updateWeeklyGoals() {
        const weeklyGoals = document.getElementById('weeklyGoals');
        const recentEntries = this.entries.slice(0, 7);
        const moodScores = {
            'happy': 4,
            'calm': 3,
            'anxious': 2,
            'sad': 1
        };

        // Calculate average mood score
        const avgMoodScore = recentEntries.reduce((sum, entry) => 
            sum + moodScores[entry.mood], 0) / recentEntries.length;

        // Generate personalized goals based on recent patterns
        const goals = [];
        
        if (avgMoodScore < 3) {
            goals.push('Focus on activities that make you happy');
            goals.push('Practice stress management techniques');
        }

        const lowEnergyDays = recentEntries.filter(entry => entry.energyLevel <= 2).length;
        if (lowEnergyDays >= 3) {
            goals.push('Work on improving sleep quality');
            goals.push('Consider adding light exercise to your routine');
        }

        // Add general well-being goals
        goals.push('Record at least one positive moment each day');
        goals.push('Practice mindfulness or meditation');

        weeklyGoals.innerHTML = goals.map(goal => `
            <li>${goal}</li>
        `).join('');
    }

    updateChartPeriod(e) {
        const buttons = document.querySelectorAll('.chart-period');
        buttons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update chart data based on selected period
        this.loadCharts();
    }
}

// Initialize the Mood Journal
document.addEventListener('DOMContentLoaded', () => {
    window.moodJournal = new MoodJournal();
});