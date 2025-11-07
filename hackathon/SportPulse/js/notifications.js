class NotificationManager {
    constructor() {
        this.notifications = [];
        this.subscribers = new Set();
        this.initializeNotifications();
    }

    initializeNotifications() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(this.container);
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notify(subscribers) {
        subscribers.forEach(callback => callback(this.notifications));
    }

    async createNotification({ type, message, duration = 5000, data = {} }) {
        const notification = {
            id: Date.now(),
            type,
            message,
            data,
            timestamp: new Date(),
            read: false
        };

        this.notifications.unshift(notification);
        this.notify(this.subscribers);
        
        // Create and show toast notification
        const toast = this.createToastElement(notification);
        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('notification-enter');
        });

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast, notification.id);
            }, duration);
        }

        // Store in localStorage
        this.saveNotifications();
        
        return notification;
    }

    createToastElement(notification) {
        const toast = document.createElement('div');
        toast.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm w-full transform transition-all duration-300 ease-out opacity-0 translate-x-full';
        toast.dataset.notificationId = notification.id;

        const content = document.createElement('div');
        content.className = 'flex items-start';

        // Icon based on type
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'flex-shrink-0';
        const icon = this.getNotificationIcon(notification.type);
        iconWrapper.innerHTML = icon;
        content.appendChild(iconWrapper);

        // Message
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'ml-3 w-0 flex-1';
        const message = document.createElement('p');
        message.className = 'text-sm font-medium text-gray-900 dark:text-white';
        message.textContent = notification.message;
        messageWrapper.appendChild(message);
        content.appendChild(messageWrapper);

        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'ml-4 flex-shrink-0 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';
        closeButton.innerHTML = '<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>';
        closeButton.onclick = () => this.removeToast(toast, notification.id);
        content.appendChild(closeButton);

        toast.appendChild(content);
        return toast;
    }

    getNotificationIcon(type) {
        const iconClasses = 'h-6 w-6';
        switch (type) {
            case 'success':
                return `<svg class="${iconClasses} text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
            case 'error':
                return `<svg class="${iconClasses} text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
            case 'warning':
                return `<svg class="${iconClasses} text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
            case 'info':
                return `<svg class="${iconClasses} text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
            case 'achievement':
                return `<svg class="${iconClasses} text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`;
            default:
                return `<svg class="${iconClasses} text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>`;
        }
    }

    async removeToast(toast, notificationId) {
        toast.classList.add('notification-exit');
        
        await new Promise(resolve => {
            toast.addEventListener('animationend', () => {
                toast.remove();
                resolve();
            }, { once: true });
        });

        // Mark notification as read
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.notify(this.subscribers);
            this.saveNotifications();
        }
    }

    saveNotifications() {
        const notificationsToSave = this.notifications.map(({ id, type, message, timestamp, read, data }) => ({
            id, type, message, timestamp, read, data
        }));
        localStorage.setItem('notifications', JSON.stringify(notificationsToSave));
    }

    loadNotifications() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.notifications = parsed.map(n => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                }));
                this.notify(this.subscribers);
            } catch (error) {
                console.error('Error loading notifications:', error);
            }
        }
    }

    clearAll() {
        this.notifications = [];
        this.notify(this.subscribers);
        this.saveNotifications();
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.notify(this.subscribers);
        this.saveNotifications();
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }
}

// Create global instance
const notificationManager = new NotificationManager();

// Example usage:
// notificationManager.createNotification({
//     type: 'success',
//     message: 'Your mood entry was saved successfully!',
//     data: { moodId: '123' }
// });

export default notificationManager;