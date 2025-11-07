// FloSparc Insights Engine
export class InsightsEngine {
    static async getProductivityInsights() {
        const tasks = JSON.parse(localStorage.getItem('flosparc_tasks') || '[]');
        const sleep = JSON.parse(localStorage.getItem('flosparc_sleep') || '[]');
        const moods = JSON.parse(localStorage.getItem('moods') || '[]');

        const insights = [];
        
        // Analyze sleep impact on productivity
        const recentSleep = sleep.slice(-7);
        const recentTasks = tasks.filter(t => t.completed).slice(-14);
        
        if (recentSleep.length && recentTasks.length) {
            const avgSleep = recentSleep.reduce((sum, s) => sum + s.hours, 0) / recentSleep.length;
            const highProdDays = this.getHighProductivityDays(recentTasks);
            const avgSleepOnProdDays = this.getAverageSleepForDays(sleep, highProdDays);
            
            if (avgSleepOnProdDays > avgSleep) {
                insights.push({
                    type: 'sleep_productivity',
                    icon: '💡',
                    title: 'Sleep-Productivity Link',
                    text: `You're most productive after sleeping ${avgSleepOnProdDays.toFixed(1)} hours. Currently averaging ${avgSleep.toFixed(1)} hours.`,
                    action: 'Adjust sleep schedule',
                    priority: 'high'
                });
            }
        }

        // Analyze mood impact
        const recentMoods = moods.slice(-7);
        if (recentMoods.length) {
            const moodProductivityCorrelation = this.analyzeMoodProductivity(recentMoods, recentTasks);
            if (moodProductivityCorrelation.correlation > 0.7) {
                insights.push({
                    type: 'mood_productivity',
                    icon: '🎯',
                    title: 'Mood-Productivity Pattern',
                    text: `You complete ${moodProductivityCorrelation.increase}% more tasks when in a ${moodProductivityCorrelation.mood} mood.`,
                    action: 'Schedule important tasks during high-mood periods',
                    priority: 'medium'
                });
            }
        }

        return insights;
    }

    static async getSleepOptimizationInsights() {
        const sleep = JSON.parse(localStorage.getItem('flosparc_sleep') || '[]');
        const tasks = JSON.parse(localStorage.getItem('flosparc_tasks') || '[]');
        
        const insights = [];
        
        // Analyze optimal sleep window
        const recentSleep = sleep.slice(-14);
        if (recentSleep.length) {
            const optimalWindow = this.findOptimalSleepWindow(recentSleep, tasks);
            insights.push({
                type: 'sleep_window',
                icon: '🌙',
                title: 'Optimal Sleep Window',
                text: `Your most refreshing sleep typically starts at ${optimalWindow.start} and ends at ${optimalWindow.end}`,
                action: 'Adjust sleep schedule to match optimal window',
                priority: 'high'
            });
        }

        return insights;
    }

    static async getMoodInsights() {
        const moods = JSON.parse(localStorage.getItem('moods') || '[]');
        const sleep = JSON.parse(localStorage.getItem('flosparc_sleep') || '[]');
        
        const insights = [];
        
        // Analyze sleep impact on mood
        const recentMoods = moods.slice(-7);
        const recentSleep = sleep.slice(-7);
        
        if (recentMoods.length && recentSleep.length) {
            const moodSleepCorrelation = this.analyzeMoodSleepCorrelation(recentMoods, recentSleep);
            if (moodSleepCorrelation.correlation > 0.6) {
                insights.push({
                    type: 'sleep_mood',
                    icon: '✨',
                    title: 'Sleep-Mood Connection',
                    text: `Your mood tends to be ${moodSleepCorrelation.improvement} after ${moodSleepCorrelation.hours} hours of sleep`,
                    action: 'Maintain consistent sleep duration',
                    priority: 'medium'
                });
            }
        }

        return insights;
    }

    // Helper methods
    static getHighProductivityDays(tasks) {
        const tasksByDay = tasks.reduce((acc, task) => {
            const day = task.completedAt.split('T')[0];
            if (!acc[day]) acc[day] = [];
            acc[day].push(task);
            return acc;
        }, {});

        const avgTasksPerDay = tasks.length / Object.keys(tasksByDay).length;
        return Object.entries(tasksByDay)
            .filter(([_, dayTasks]) => dayTasks.length > avgTasksPerDay)
            .map(([day]) => day);
    }

    static getAverageSleepForDays(sleepLogs, days) {
        const relevantLogs = sleepLogs.filter(s => days.includes(s.date));
        return relevantLogs.reduce((sum, s) => sum + s.hours, 0) / relevantLogs.length;
    }

    static analyzeMoodProductivity(moods, tasks) {
        // Simplified analysis - can be made more sophisticated
        const moodTypes = ['happy', 'calm', 'neutral', 'stressed', 'sad'];
        const productivity = {};
        
        moodTypes.forEach(mood => {
            const moodDays = moods.filter(m => m.type === mood).map(m => m.date);
            const tasksOnMoodDays = tasks.filter(t => moodDays.includes(t.date));
            productivity[mood] = tasksOnMoodDays.length / moodDays.length;
        });

        const bestMood = Object.entries(productivity)
            .sort(([,a], [,b]) => b - a)[0];
        
        const avgProductivity = Object.values(productivity).reduce((a,b) => a + b) / Object.keys(productivity).length;
        
        return {
            mood: bestMood[0],
            correlation: bestMood[1] / avgProductivity,
            increase: Math.round((bestMood[1] / avgProductivity - 1) * 100)
        };
    }

    static analyzeMoodSleepCorrelation(moods, sleep) {
        const moodScores = {
            'happy': 5,
            'calm': 4,
            'neutral': 3,
            'stressed': 2,
            'sad': 1
        };

        const data = [];
        moods.forEach(mood => {
            const sleepEntry = sleep.find(s => s.date === mood.date);
            if (sleepEntry) {
                data.push({
                    hours: sleepEntry.hours,
                    score: moodScores[mood.type] || 3
                });
            }
        });

        // Find optimal sleep duration for mood
        const groupedScores = data.reduce((acc, d) => {
            const hourRounded = Math.round(d.hours);
            if (!acc[hourRounded]) acc[hourRounded] = [];
            acc[hourRounded].push(d.score);
            return acc;
        }, {});

        const avgScores = Object.entries(groupedScores).map(([hours, scores]) => ({
            hours: parseInt(hours),
            avgScore: scores.reduce((a,b) => a + b) / scores.length
        }));

        const bestSleep = avgScores.sort((a,b) => b.avgScore - a.avgScore)[0];

        return {
            hours: bestSleep.hours,
            improvement: bestSleep.avgScore > 4 ? 'significantly better' : 'better',
            correlation: bestSleep.avgScore / 3
        };
    }

    static findOptimalSleepWindow(sleepLogs, tasks) {
        // Find sleep windows with highest next-day task completion
        const windows = sleepLogs.map(log => ({
            start: log.bedtime,
            end: log.waketime,
            date: log.date
        }));

        // For simplicity, return most common window
        // This could be made more sophisticated by analyzing task completion
        const mostCommonStart = this.getMostCommonTime(windows.map(w => w.start));
        const mostCommonEnd = this.getMostCommonTime(windows.map(w => w.end));

        return {
            start: mostCommonStart,
            end: mostCommonEnd
        };
    }

    static getMostCommonTime(times) {
        const counts = times.reduce((acc, time) => {
            acc[time] = (acc[time] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0];
    }
}