// FloSparc Wellness Features
export class WellnessSystem {
    static MEDITATION_PROGRAMS = {
        focus: {
            id: 'focus',
            title: 'Deep Focus',
            duration: 10,
            description: 'Enhance your concentration with guided breathing',
            background: 'ocean-waves.mp3',
            steps: [
                { duration: 60, instruction: 'Find a comfortable position...' },
                { duration: 120, instruction: 'Focus on your breath...' },
                { duration: 180, instruction: 'Let thoughts pass by...' },
                { duration: 180, instruction: 'Maintain steady breathing...' },
                { duration: 60, instruction: 'Slowly return to awareness...' }
            ]
        },
        sleep: {
            id: 'sleep',
            title: 'Sleep Well',
            duration: 15,
            description: 'Calm your mind before sleep',
            background: 'night-sounds.mp3',
            steps: [
                { duration: 60, instruction: 'Lie down comfortably...' },
                { duration: 180, instruction: 'Release tension...' },
                { duration: 240, instruction: 'Follow your breath...' },
                { duration: 300, instruction: 'Feel heaviness...' },
                { duration: 120, instruction: 'Drift into sleep...' }
            ]
        },
        mood: {
            id: 'mood',
            title: 'Mood Lift',
            duration: 8,
            description: 'Elevate your mood with mindful practice',
            background: 'gentle-stream.mp3',
            steps: [
                { duration: 60, instruction: 'Sit or lie comfortably...' },
                { duration: 120, instruction: 'Notice your feelings...' },
                { duration: 180, instruction: 'Accept without judgment...' },
                { duration: 120, instruction: 'Cultivate gratitude...' }
            ]
        }
    };

    static MUSIC_MOODS = {
        happy: {
            title: 'Upbeat & Energetic',
            description: 'Joyful tunes to maintain your great mood',
            playlists: [
                { name: 'Morning Energy', duration: '45:00' },
                { name: 'Happy Focus', duration: '1:30:00' },
                { name: 'Positive Vibes', duration: '1:00:00' }
            ]
        },
        calm: {
            title: 'Peaceful & Serene',
            description: 'Gentle melodies for relaxation',
            playlists: [
                { name: 'Calm Waters', duration: '1:00:00' },
                { name: 'Gentle Focus', duration: '2:00:00' },
                { name: 'Evening Peace', duration: '45:00' }
            ]
        },
        stressed: {
            title: 'Stress Relief',
            description: 'Soothing sounds to help you unwind',
            playlists: [
                { name: 'Anxiety Relief', duration: '30:00' },
                { name: 'Calming Focus', duration: '1:00:00' },
                { name: 'Stress Melt', duration: '45:00' }
            ]
        }
    };

    static async startMeditation(programId) {
        const program = this.MEDITATION_PROGRAMS[programId];
        if (!program) throw new Error('Meditation program not found');

        const audio = new Audio(`/assets/sounds/${program.background}`);
        audio.loop = true;
        audio.volume = 0.3;

        return {
            program,
            audio,
            start: () => {
                audio.play();
                this.trackWellnessActivity('meditation', programId);
            },
            stop: () => {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }

    static getMoodBasedRecommendations(currentMood) {
        const recommendations = {
            meditation: null,
            music: null,
            activity: null
        };

        // Select appropriate meditation
        switch(currentMood) {
            case 'stressed':
                recommendations.meditation = this.MEDITATION_PROGRAMS.mood;
                recommendations.activity = 'Take a short break and practice mindfulness';
                break;
            case 'tired':
                recommendations.meditation = this.MEDITATION_PROGRAMS.focus;
                recommendations.activity = 'Try a quick energizing meditation';
                break;
            case 'sad':
                recommendations.meditation = this.MEDITATION_PROGRAMS.mood;
                recommendations.activity = 'Express your feelings in the mood journal';
                break;
        }

        // Get mood-based music
        recommendations.music = this.MUSIC_MOODS[currentMood] || this.MUSIC_MOODS.calm;

        return recommendations;
    }

    static trackWellnessActivity(type, id) {
        const activities = JSON.parse(localStorage.getItem('flosparc_wellness') || '[]');
        activities.push({
            type,
            id,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('flosparc_wellness', JSON.stringify(activities));
    }

    static getWellnessStats() {
        const activities = JSON.parse(localStorage.getItem('flosparc_wellness') || '[]');
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const stats = {
            totalMeditations: 0,
            weeklyMeditations: 0,
            favoriteProgram: null,
            totalMinutes: 0
        };

        // Calculate statistics
        const programCounts = {};
        activities.forEach(activity => {
            if (activity.type === 'meditation') {
                stats.totalMeditations++;
                if (new Date(activity.timestamp) > lastWeek) {
                    stats.weeklyMeditations++;
                }
                programCounts[activity.id] = (programCounts[activity.id] || 0) + 1;
                stats.totalMinutes += this.MEDITATION_PROGRAMS[activity.id]?.duration || 0;
            }
        });

        // Find favorite program
        if (Object.keys(programCounts).length) {
            stats.favoriteProgram = Object.entries(programCounts)
                .sort(([,a], [,b]) => b - a)[0][0];
        }

        return stats;
    }
}