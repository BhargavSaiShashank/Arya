/**
 * Theme handling and UI enhancements for AI Assistant
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeToggle();
    setupAnimations();
    setupAccessibility();
});

/**
 * Initialize theme based on user preference
 */
function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply dark mode if saved preference is dark or if system prefers dark and no saved preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
    }
    
    // Make sure transitions only happen after page load
    setTimeout(() => {
        document.body.style.transition = 'background-color var(--transition-speed), color var(--transition-speed)';
    }, 100);
}

/**
 * Set up the theme toggle functionality
 */
function setupThemeToggle() {
    // Get all theme toggle buttons
    const themeToggleButtons = document.querySelectorAll('.theme-button, [data-theme-toggle]');
    
    themeToggleButtons.forEach(button => {
        button.addEventListener('click', toggleTheme);
    });
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    });
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update UI elements indicating theme
    updateThemeIndicators(isDarkMode);
    
    // Dispatch a custom event that Alpine.js and other scripts can listen for
    document.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { isDarkMode } 
    }));
}

/**
 * Update UI elements that indicate theme status
 */
function updateThemeIndicators(isDarkMode) {
    const themeIcons = document.querySelectorAll('.theme-button i, [data-theme-icon]');
    
    themeIcons.forEach(icon => {
        // Update Font Awesome icons
        if (icon.classList.contains('fas') || icon.classList.contains('far')) {
            if (isDarkMode) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    });
    
    // Update text labels if present
    const themeLabels = document.querySelectorAll('[data-theme-label]');
    themeLabels.forEach(label => {
        label.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    });
}

/**
 * Setup subtle UI animations for a more polished experience
 */
function setupAnimations() {
    // Add appear animation to messages when they're added
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('message')) {
                        // Add animation class then remove it after animation completes
                        node.classList.add('message-appear');
                        setTimeout(() => {
                            node.classList.remove('message-appear');
                        }, 500);
                    }
                });
            }
        });
    });
    
    const messagesContainer = document.querySelector('.conversation-messages');
    if (messagesContainer) {
        observer.observe(messagesContainer, { childList: true });
    }
}

/**
 * Setup accessibility enhancements
 */
function setupAccessibility() {
    // Add appropriate aria attributes
    const toggleButtons = document.querySelectorAll('.toggle-button, .icon-button');
    toggleButtons.forEach(button => {
        if (!button.getAttribute('aria-label')) {
            const icon = button.querySelector('i');
            if (icon && icon.classList.contains('fa-bars')) {
                button.setAttribute('aria-label', 'Toggle sidebar');
            } else if (icon && icon.classList.contains('fa-info-circle')) {
                button.setAttribute('aria-label', 'Toggle context panel');
            } else if (icon && (icon.classList.contains('fa-sun') || icon.classList.contains('fa-moon'))) {
                button.setAttribute('aria-label', 'Toggle dark mode');
            }
        }
    });
    
    // Make Enter key work on buttons that aren't natively keyboard accessible
    document.querySelectorAll('.action-button, .suggestion-chip, .memory-item').forEach(element => {
        if (element.tagName !== 'BUTTON') {
            element.setAttribute('tabindex', '0');
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        }
    });
}

/**
 * Create ripple effect on buttons
 */
function createRipple(event) {
    const button = event.currentTarget;
    
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.querySelector('.ripple');
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
}

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.action-button, .send-button');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
}); 