/**
 * Theme handling and UI enhancements for AI Assistant
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeToggle();
    setupAnimations();
    setupAccessibility();
    setupAdvancedEffects();
});

/**
 * Initialize theme based on user preference
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply saved theme or use system preference
    if (savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark)) {
        document.body.classList.add('dark-mode');
        updateThemeIndicators(true);
    } else {
        document.body.classList.remove('dark-mode');
        updateThemeIndicators(false);
    }
    
    // Add transition delay to prevent flash during page load
    setTimeout(() => {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }, 100);
}

/**
 * Set up the theme toggle functionality
 */
function setupThemeToggle() {
    const themeButtons = document.querySelectorAll('[data-toggle="theme"]');
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Only auto-switch if no theme is explicitly set
        if (!localStorage.getItem('theme')) {
            document.body.classList.toggle('dark-mode', e.matches);
            updateThemeIndicators(e.matches);
        }
    });
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    // Save preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update UI indicators
    updateThemeIndicators(isDarkMode);
    
    // Show toast notification
    if (window.showToast) {
        window.showToast(`${isDarkMode ? 'Dark' : 'Light'} mode activated`);
    }
    
    // Apply special animation for theme change
    animateThemeTransition(isDarkMode);
}

/**
 * Update UI elements that indicate theme status
 */
function updateThemeIndicators(isDarkMode) {
    // Update icon buttons if they exist
    document.querySelectorAll('[data-toggle="theme"] i').forEach(icon => {
        if (isDarkMode) {
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    });
    
    // Update text indicators if they exist
    document.querySelectorAll('[data-theme-text]').forEach(element => {
        element.textContent = isDarkMode ? 'Dark Mode' : 'Light Mode';
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
    
    // Remove ripple after animation completes
    setTimeout(() => {
        if (circle.parentElement) {
            circle.remove();
        }
    }, 600);
}

/**
 * Setup advanced UI effects and animations
 */
function setupAdvancedEffects() {
    // Add parallax effect to background elements
    setupParallaxEffect();
    
    // Add 3D hover effects
    setupHoverEffects();
    
    // Add smooth scrolling for conversation
    setupSmoothScrolling();
    
    // Add motion trail effect to cursor
    setupCursorEffects();
    
    // Add typewriter effect for initial greeting
    setupTypewriterEffect();
    
    // Add magnetic effect to buttons
    setupMagneticButtons();
    
    // Add enhanced ripple effects
    setupAdvancedRipple();
}

/**
 * Setup parallax effect for background elements
 */
function setupParallaxEffect() {
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) / 20;
        const moveY = (e.clientY - window.innerHeight / 2) / 20;
        
        // Apply subtle parallax to particles
        document.querySelectorAll('.particle').forEach(particle => {
            const speed = parseFloat(particle.getAttribute('data-speed') || Math.random() * 0.5);
            particle.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
        });
        
        // Apply subtle parallax to background gradients
        const bg = document.querySelector('body::before, body::after');
        if (bg) {
            bg.style.transform = `translate(${moveX * 0.1}px, ${moveY * 0.1}px)`;
        }
    });
}

/**
 * Setup enhanced hover effects for interactive elements
 */
function setupHoverEffects() {
    // Add data attributes for z-transform speeds
    document.querySelectorAll('.action-button, .suggestion-chip, .memory-item, .context-item').forEach(element => {
        element.setAttribute('data-z-speed', Math.random() * 0.5 + 0.5);
        
        // Add hover listener for 3D effect
        element.addEventListener('mouseenter', function() {
            const zSpeed = parseFloat(this.getAttribute('data-z-speed'));
            this.style.transform = `translateZ(${10 * zSpeed}px) translateY(-${4 * zSpeed}px)`;
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

/**
 * Setup smooth scrolling with easing for conversation area
 */
function setupSmoothScrolling() {
    const conversationArea = document.querySelector('.conversation-messages');
    if (conversationArea) {
        // Enhanced scroll to bottom function
        window.scrollToBottom = function(smooth = true) {
            const target = conversationArea.scrollHeight;
            if (smooth) {
                // Use smooth scroll with custom easing
                const start = conversationArea.scrollTop;
                const change = target - start;
                const duration = 500;
                let startTime = null;
                
                function animateScroll(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    
                    // Easing function: easeInOutQuad
                    const progress = elapsed / duration;
                    const easing = progress < 0.5
                        ? 2 * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                    
                    conversationArea.scrollTop = start + change * easing;
                    
                    if (elapsed < duration) {
                        requestAnimationFrame(animateScroll);
                    }
                }
                
                requestAnimationFrame(animateScroll);
            } else {
                conversationArea.scrollTop = target;
            }
        };
    }
}

/**
 * Setup cursor motion trail effect
 */
function setupCursorEffects() {
    const trailCount = 5;
    const trails = [];
    
    // Create trail elements
    for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--accent-color);
            opacity: ${0.7 - (i * 0.1)};
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%) scale(${1 - (i * 0.15)});
            transition: opacity 0.2s;
            box-shadow: 0 0 10px var(--accent-color);
            mix-blend-mode: screen;
            display: none;
        `;
        document.body.appendChild(trail);
        trails.push({ 
            element: trail, 
            x: 0, 
            y: 0 
        });
    }
    
    // Track cursor position
    document.addEventListener('mousemove', (e) => {
        // Show trails when mouse moves
        trails.forEach(trail => {
            trail.element.style.display = 'block';
        });
        
        // Update position of first trail
        trails[0].x = e.clientX;
        trails[0].y = e.clientY;
    });
    
    // Hide trails when cursor leaves window
    document.addEventListener('mouseout', (e) => {
        if (e.relatedTarget === null) {
            trails.forEach(trail => {
                trail.element.style.display = 'none';
            });
        }
    });
    
    // Animate trails
    function animateTrails() {
        for (let i = trails.length - 1; i > 0; i--) {
            const currentTrail = trails[i];
            const prevTrail = trails[i - 1];
            
            // Smooth follow with easing
            currentTrail.x += (prevTrail.x - currentTrail.x) * 0.3;
            currentTrail.y += (prevTrail.y - currentTrail.y) * 0.3;
            
            // Update position
            currentTrail.element.style.left = `${currentTrail.x}px`;
            currentTrail.element.style.top = `${currentTrail.y}px`;
        }
        
        // Update first trail immediately
        trails[0].element.style.left = `${trails[0].x}px`;
        trails[0].element.style.top = `${trails[0].y}px`;
        
        requestAnimationFrame(animateTrails);
    }
    
    animateTrails();
}

/**
 * Setup typewriter effect for initial greeting
 */
function setupTypewriterEffect() {
    const assistantMessages = document.querySelectorAll('.assistant-message .message-content');
    const firstMessage = assistantMessages.length > 0 ? assistantMessages[0] : null;
    
    if (firstMessage) {
        const text = firstMessage.textContent;
        const typingSpeed = 20; // ms per character
        
        // Only apply to the first message if it hasn't been seen yet
        if (!localStorage.getItem('initial-greeting-shown')) {
            firstMessage.textContent = '';
            
            let i = 0;
            function typeCharacter() {
                if (i < text.length) {
                    firstMessage.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeCharacter, typingSpeed);
                } else {
                    // Mark as shown
                    localStorage.setItem('initial-greeting-shown', 'true');
                }
            }
            
            typeCharacter();
        }
    }
}

/**
 * Setup magnetic effect for buttons
 */
function setupMagneticButtons() {
    document.querySelectorAll('.send-button, .voice-input-button, .voice-output-button').forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate distance from center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate magnetic pull (stronger when closer to the center)
            const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const pull = 1 - Math.min(distance / maxDistance, 1); // 0 to 1
            
            // Calculate magnetic movement (max 5px)
            const moveX = ((x - centerX) / centerX) * pull * 5;
            const moveY = ((y - centerY) / centerY) * pull * 5;
            
            button.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            // Return to original position
            button.style.transform = '';
        });
    });
}

/**
 * Setup advanced ripple effect with gradient and particles
 */
function setupAdvancedRipple() {
    document.querySelectorAll('.action-button, .send-button, .suggestion-chip').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Create advanced ripple with gradient
            ripple.style.cssText = `
                position: absolute;
                background-image: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
                width: ${rect.width * 3}px;
                height: ${rect.width * 3}px;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%) scale(0);
                border-radius: 50%;
                opacity: 0.6;
                pointer-events: none;
                animation: advancedRipple 0.8s cubic-bezier(0.3, 0.6, 0.8, 0.15);
            `;
            
            this.appendChild(ripple);
            
            // Create particle explosion
            createParticleExplosion(x, y, this);
            
            setTimeout(() => {
                ripple.remove();
            }, 800);
        });
    });
    
    // Add keyframes for advanced ripple if not already present
    if (!document.getElementById('advanced-animation-keyframes')) {
        const style = document.createElement('style');
        style.id = 'advanced-animation-keyframes';
        style.textContent = `
            @keyframes advancedRipple {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 0.6;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0;
                }
            }
            
            @keyframes particleFade {
                0% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Create particle explosion effect for button clicks
 */
function createParticleExplosion(x, y, parent) {
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        
        // Random particle properties
        const size = Math.random() * 6 + 3;
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = Math.random() * 30 + 20;
        const duration = Math.random() * 0.4 + 0.6;
        
        // Calculate ending position
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;
        
        // Set particle styles
        particle.style.cssText = `
            position: absolute;
            background-color: var(--accent-color);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 100;
            box-shadow: 0 0 ${size}px var(--accent-color);
            animation: particleFade ${duration}s forwards ease-out;
        `;
        
        parent.appendChild(particle);
        
        // Animate particle movement
        particle.animate([
            { transform: 'translate(-50%, -50%) scale(1)', left: `${x}px`, top: `${y}px` },
            { transform: 'translate(-50%, -50%) scale(0)', left: `${endX}px`, top: `${endY}px` }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.17, 0.67, 0.83, 0.67)'
        });
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }
}

/**
 * Create special animation for theme transition
 */
function animateThemeTransition(isDarkMode) {
    // Create overlay for transition effect
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'};
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    
    document.body.appendChild(overlay);
    
    // Trigger animation
    setTimeout(() => {
        overlay.style.opacity = '1';
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }, 300);
    }, 10);
}

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.action-button, .send-button');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
});