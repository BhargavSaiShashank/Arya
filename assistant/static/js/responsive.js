/**
 * Responsive behavior handler for AI Assistant
 */

document.addEventListener('DOMContentLoaded', () => {
    setupResponsiveLayout();
    setupMobileNavigation();
    setupResizeHandlers();
});

/**
 * Set up responsive layout based on screen size
 */
function setupResponsiveLayout() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // Add appropriate classes to body
    if (isMobile) {
        document.body.classList.add('mobile-view');
        document.body.classList.remove('tablet-view', 'desktop-view');
    } else if (isTablet) {
        document.body.classList.add('tablet-view');
        document.body.classList.remove('mobile-view', 'desktop-view');
    } else {
        document.body.classList.add('desktop-view');
        document.body.classList.remove('mobile-view', 'tablet-view');
    }
    
    // Adjust sidebar visibility
    const dashboardPanel = document.querySelector('.dashboard-panel');
    const contextPanel = document.querySelector('.context-panel');
    
    if (isMobile) {
        // On mobile, hide both sidebars initially
        dashboardPanel?.classList.remove('visible');
        contextPanel?.classList.remove('visible');
    } else {
        // On larger screens, show sidebars by default
        dashboardPanel?.classList.add('visible');
        
        // Only show context panel on desktop
        if (!isTablet) {
            contextPanel?.classList.add('visible');
        }
    }
}

/**
 * Handle mobile navigation 
 */
function setupMobileNavigation() {
    // Add backdrop for mobile views
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-backdrop';
    backdrop.style.display = 'none';
    backdrop.addEventListener('click', closeMobilePanels);
    document.body.appendChild(backdrop);
    
    // Setup toggle handlers
    document.querySelectorAll('[data-toggle="dashboard"]').forEach(button => {
        button.addEventListener('click', toggleDashboard);
    });
    
    document.querySelectorAll('[data-toggle="context"]').forEach(button => {
        button.addEventListener('click', toggleContext);
    });
    
    // Setup close handlers
    document.querySelectorAll('.mobile-close').forEach(button => {
        button.addEventListener('click', () => {
            const panel = button.closest('.dashboard-panel, .context-panel');
            if (panel) {
                panel.classList.remove('visible');
                hideBackdrop();
            }
        });
    });
}

/**
 * Toggle dashboard panel
 */
function toggleDashboard() {
    const dashboard = document.querySelector('.dashboard-panel');
    const isVisible = dashboard.classList.toggle('visible');
    
    if (isVisible && window.innerWidth < 768) {
        document.querySelector('.context-panel')?.classList.remove('visible');
        showBackdrop();
    } else if (!isVisible) {
        hideBackdrop();
    }
}

/**
 * Toggle context panel
 */
function toggleContext() {
    const context = document.querySelector('.context-panel');
    const isVisible = context.classList.toggle('visible');
    
    if (isVisible && window.innerWidth < 768) {
        document.querySelector('.dashboard-panel')?.classList.remove('visible');
        showBackdrop();
    } else if (!isVisible) {
        hideBackdrop();
    }
}

/**
 * Close all mobile panels
 */
function closeMobilePanels() {
    document.querySelector('.dashboard-panel')?.classList.remove('visible');
    document.querySelector('.context-panel')?.classList.remove('visible');
    hideBackdrop();
}

/**
 * Show backdrop for mobile views
 */
function showBackdrop() {
    const backdrop = document.querySelector('.mobile-backdrop');
    if (backdrop) {
        backdrop.style.display = 'block';
        setTimeout(() => backdrop.classList.add('visible'), 10);
    }
}

/**
 * Hide backdrop for mobile views
 */
function hideBackdrop() {
    const backdrop = document.querySelector('.mobile-backdrop');
    if (backdrop) {
        backdrop.classList.remove('visible');
        setTimeout(() => backdrop.style.display = 'none', 300);
    }
}

/**
 * Handle window resize events
 */
function setupResizeHandlers() {
    let resizeTimer;
    
    window.addEventListener('resize', () => {
        // Debounce resize events
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setupResponsiveLayout();
        }, 250);
    });
    
    // Initialize textarea auto-resize
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', autoResizeTextarea);
        
        // Initial resize
        autoResizeTextarea.call(textarea);
    });
}

/**
 * Auto-resize textarea based on content
 */
function autoResizeTextarea() {
    this.style.height = 'auto';
    const newHeight = Math.min(this.scrollHeight, 200);
    this.style.height = newHeight + 'px';
} 