// FloSparc Achievement System
export class AchievementSystem {
    static ACHIEVEMENTS = {
        // Task Achievements
        task_master: {
            id: 'task_master',
            title: 'Task Master',
            description: 'Complete 50 tasks',
            icon: '🏆',
            type: 'tasks',
            condition: (stats) => stats.totalTasksCompleted >= 50,
            rarity: 'rare'
        },
        productivity_streak: {
            id: 'productivity_streak',
            title: 'Productivity Streak',
            description: 'Complete at least 3 tasks daily for 7 days',
            icon: '🔥',
            type: 'tasks',
            condition: (stats) => stats.taskStreak >= 7,
            rarity: 'epic'
        },
        
        // Sleep Achievements
        sleep_regular: {
            id: 'sleep_regular',
            title: 'Sleep Regular',
            description: 'Maintain consistent sleep schedule for 5 days',
            icon: '🌙',
            type: 'sleep',
            condition: (stats) => stats.consistentSleepDays >= 5,
            rarity: 'rare'
        },
        perfect_rest: {
            id: 'perfect_rest',
            title: 'Perfect Rest',
            description: 'Achieve 90+ sleep score for 3 consecutive days',
            icon: '✨',
            type: 'sleep',
            condition: (stats) => stats.highSleepScoreDays >= 3,
            rarity: 'epic'
        },
        
        // Mood Achievements
        mood_master: {
            id: 'mood_master',
            title: 'Mood Master',
            description: 'Share your mood daily for 10 days',
            icon: '😊',
            type: 'mood',
            condition: (stats) => stats.moodStreak >= 10,
            rarity: 'rare'
        },
        community_star: {
            id: 'community_star',
            title: 'Community Star',
            description: 'Receive 50 reactions on your mood entries',
            icon: '⭐',
            type: 'mood',
            condition: (stats) => stats.totalMoodReactions >= 50,
            rarity: 'epic'
        },
        
        // Cross-Feature Achievements
        wellness_warrior: {
            id: 'wellness_warrior',
            title: 'Wellness Warrior',
            description: 'Maintain good sleep, complete tasks, and share moods for 5 days',
            icon: '👑',
            type: 'special',
            condition: (stats) => (
                stats.taskStreak >= 5 && 
                stats.consistentSleepDays >= 5 && 
                stats.moodStreak >= 5
            ),
            rarity: 'legendary'
        }
    };

    static async checkAchievements() {
        const stats = await this.calculateUserStats();
        const currentAchievements = this.getUserAchievements();
        const newAchievements = [];

        Object.values(this.ACHIEVEMENTS).forEach(achievement => {
            if (!currentAchievements.includes(achievement.id) && achievement.condition(stats)) {
                newAchievements.push(achievement);
                currentAchievements.push(achievement.id);
            }
        });

        if (newAchievements.length) {
            this.saveAchievements(currentAchievements);
            this.notifyNewAchievements(newAchievements);
        }

        return {
            earned: currentAchievements,
            new: newAchievements,
            stats: stats
        };
    }

    static async calculateUserStats() {
        const tasks = JSON.parse(localStorage.getItem('flosparc_tasks') || '[]');
        const sleep = JSON.parse(localStorage.getItem('flosparc_sleep') || '[]');
        const moods = JSON.parse(localStorage.getItem('moods') || '[]');

        // Calculate task stats
        const completedTasks = tasks.filter(t => t.completed);
        const tasksByDay = this.groupByDay(completedTasks);
        const taskStreak = this.calculateStreak(tasksByDay, 3); // 3 tasks per day minimum

        // Calculate sleep stats
        const recentSleep = sleep.slice(-14);
        const sleepScores = recentSleep.map(s => this.calculateSleepScore(s));
        const consistentSleepDays = this.getConsistentSleepDays(recentSleep);
        const highSleepScoreDays = this.getConsecutiveDays(sleepScores, 90);

        // Calculate mood stats
        const moodsByDay = this.groupByDay(moods);
        const moodStreak = this.calculateStreak(moodsByDay, 1);
        const totalReactions = moods.reduce((sum, m) => 
            sum + Object.values(m.reactions || {}).reduce((a, b) => a + b, 0), 0);

        return {
            totalTasksCompleted: completedTasks.length,
            taskStreak,
            consistentSleepDays,
            highSleepScoreDays,
            moodStreak,
            totalMoodReactions: totalReactions
        };
    }

    static getUserAchievements() {
        return JSON.parse(localStorage.getItem('flosparc_achievements') || '[]');
    }

    static saveAchievements(achievements) {
        localStorage.setItem('flosparc_achievements', JSON.stringify(achievements));
    }

    static notifyNewAchievements(achievements) {
        achievements.forEach(achievement => {
            const event = new CustomEvent('achievementUnlocked', {
                detail: achievement
            });
            window.dispatchEvent(event);
        });
    }

    // Helper methods
    static groupByDay(items) {
        return items.reduce((acc, item) => {
            const day = item.date || item.created?.split('T')[0];
            if (!acc[day]) acc[day] = [];
            acc[day].push(item);
            return acc;
        }, {});
    }

    static calculateStreak(groupedByDay, minimum = 1) {
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        let currentDate = new Date(today);

        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayItems = groupedByDay[dateStr] || [];
            
            if (dayItems.length < minimum) break;
            
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        }

        return streak;
    }

    static calculateSleepScore(sleep) {
        const optimalDuration = 8;
        const durationScore = Math.min(100, (sleep.hours / optimalDuration) * 100);
        return Math.round(durationScore);
    }

    static getConsistentSleepDays(sleepLogs) {
        if (sleepLogs.length < 2) return 0;
        
        let consistentDays = 0;
        const threshold = 30; // 30 minutes variance allowed

        for (let i = 1; i < sleepLogs.length; i++) {
            const prevBedtime = this.timeToMinutes(sleepLogs[i-1].bedtime);
            const currentBedtime = this.timeToMinutes(sleepLogs[i].bedtime);
            
            if (Math.abs(prevBedtime - currentBedtime) <= threshold) {
                consistentDays++;
            } else {
                consistentDays = 0;
            }
        }

        return consistentDays;
    }

    static timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    static getConsecutiveDays(scores, threshold) {
        let consecutive = 0;
        let maxConsecutive = 0;

        scores.forEach(score => {
            if (score >= threshold) {
                consecutive++;
                maxConsecutive = Math.max(maxConsecutive, consecutive);
            } else {
                consecutive = 0;
            }
        });

        return maxConsecutive;
    }
}