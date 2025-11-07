export class TimerManager {
    constructor(options = {}) {
        this.timeLeft = 25 * 60;
        this.isRunning = false;
        this.interval = null;
        this.onTick = options.onTick || null;
        this.onComplete = options.onComplete || null;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.interval = setInterval(() => {
            if (this.timeLeft <= 0) {
                this.complete();
                return;
            }
            this.timeLeft--;
            if (this.onTick) this.onTick(this.timeLeft);
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
    }

    reset(duration) {
        this.pause();
        this.timeLeft = (duration || 25) * 60;
        if (this.onTick) this.onTick(this.timeLeft);
    }

    complete() {
        this.pause();
        if (this.onComplete) this.onComplete();
    }

    formatTime() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}
