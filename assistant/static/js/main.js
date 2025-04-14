/**
 * Main JavaScript for the Intelligent Assistant application
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Intelligent Assistant application initialized');
    
    // Initialize resize handler for textareas
    initializeTextareaResize();
    
    // Handle dark mode toggle if needed
    setupThemeToggle();
});

/**
 * Makes textareas auto-resize based on content
 */
function initializeTextareaResize() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            // Reset height to auto to get the correct scrollHeight
            this.style.height = 'auto';
            // Set new height based on scrollHeight
            this.style.height = (this.scrollHeight) + 'px';
        });
        
        // Initial resize
        textarea.dispatchEvent(new Event('input'));
    });
}

/**
 * Sets up theme toggle functionality
 */
function setupThemeToggle() {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    }
    
    // Add theme toggle functionality to a button if it exists
    const themeToggleBtn = document.getElementById('themeToggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            // Toggle theme class on root element
            if (document.documentElement.classList.contains('dark-theme')) {
                document.documentElement.classList.remove('dark-theme');
                document.documentElement.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.remove('light-theme');
                document.documentElement.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
}

/**
 * Helper function to format dates relative to now
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted relative time string
 */
function formatRelativeTime(date) {
    const now = new Date();
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now - inputDate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
        return 'just now';
    } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
        // For older dates, return the actual date
        return inputDate.toLocaleDateString();
    }
}

/**
 * Safely parse JSON with error handling
 * @param {string} str - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed object or fallback
 */
function safeJSONParse(str, fallback = {}) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('JSON parse error:', e);
        return fallback;
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text:', err);
        return false;
    }
}

/**
 * Add a notification/toast message
 * @param {string} message - Message to display
 * @param {'success'|'error'|'info'|'warning'} type - Type of notification
 * @param {number} duration - Duration in ms before auto-hide
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notificationContainer') || 
        (() => {
            const div = document.createElement('div');
            div.id = 'notificationContainer';
            div.className = 'notification-container';
            document.body.appendChild(div);
            return div;
        })();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide after duration
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300); // Match the CSS transition time
    }, duration);
    
    // Allow dismiss on click
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    });
} 