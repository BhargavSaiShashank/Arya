/**
 * Voice Recognition and Text-to-Speech for AI Assistant
 * Enhanced with advanced visual effects and animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initVoiceFeatures();
});

/**
 * Setup voice input/output features
 */
function initVoiceFeatures() {
    // Check if browser supports speech recognition and synthesis
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    
    if (hasSpeechRecognition || hasSpeechSynthesis) {
        // Add voice buttons to UI
        addVoiceButtons();
        
        // Setup speech recognition if available
        if (hasSpeechRecognition) {
            setupSpeechRecognition();
        }
        
        // Setup speech synthesis if available
        if (hasSpeechSynthesis) {
            setupSpeechSynthesis();
        }
    }
}

/**
 * Add voice input and output buttons to the UI
 */
function addVoiceButtons() {
    const messageInputContainer = document.querySelector('.message-input-container');
    if (!messageInputContainer) return;
    
    // Check if buttons already exist
    if (messageInputContainer.querySelector('.voice-input-button')) return;
    
    // Create voice input button (microphone)
    const voiceInputButton = document.createElement('button');
    voiceInputButton.className = 'voice-input-button';
    voiceInputButton.setAttribute('aria-label', 'Voice Input');
    voiceInputButton.innerHTML = '<i class="fas fa-microphone"></i><span class="voice-status-indicator"></span>';
    voiceInputButton.setAttribute('data-enabled', 'true');
    
    // Create voice output button (speaker)
    const voiceOutputButton = document.createElement('button');
    voiceOutputButton.className = 'voice-output-button';
    voiceOutputButton.setAttribute('aria-label', 'Text to Speech');
    voiceOutputButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    voiceOutputButton.setAttribute('data-enabled', 'false');
    
    // Add auto-voice button (for continuous conversation)
    const autoVoiceButton = document.createElement('button');
    autoVoiceButton.className = 'auto-voice-button';
    autoVoiceButton.setAttribute('aria-label', 'Auto Voice Mode');
    autoVoiceButton.innerHTML = '<i class="fas fa-comment-dots"></i>';
    autoVoiceButton.setAttribute('data-enabled', 'false');
    
    // Add buttons to the container, before the send button
    const sendButton = messageInputContainer.querySelector('.send-button');
    if (sendButton) {
        messageInputContainer.insertBefore(voiceInputButton, sendButton);
        messageInputContainer.insertBefore(voiceOutputButton, sendButton);
        messageInputContainer.insertBefore(autoVoiceButton, sendButton);
    } else {
        messageInputContainer.appendChild(voiceInputButton);
        messageInputContainer.appendChild(voiceOutputButton);
        messageInputContainer.appendChild(autoVoiceButton);
    }
    
    // Add status bar for live feedback
    const statusBar = document.createElement('div');
    statusBar.className = 'status-bar';
    statusBar.innerHTML = '<i class="fas fa-microphone"></i> <span class="status-text">Listening...</span>';
    document.body.appendChild(statusBar);
    
    // Add click handlers
    voiceInputButton.addEventListener('click', toggleVoiceInput);
    voiceOutputButton.addEventListener('click', toggleVoiceOutput);
    autoVoiceButton.addEventListener('click', toggleAutoVoice);
    
    // Add styles for voice buttons if not already present
    if (!document.getElementById('voice-status-styles')) {
        const style = document.createElement('style');
        style.id = 'voice-status-styles';
        style.textContent = `
            .voice-status-indicator {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: #ccc;
                display: none;
            }
            
            .voice-input-button.listening .voice-status-indicator {
                display: block;
                background-color: #e74c3c;
                animation: pulse-small 1.5s infinite;
            }
            
            @keyframes pulse-small {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .voice-input-button, .voice-output-button, .auto-voice-button {
                position: relative;
            }
            
            .status-bar {
                position: fixed;
                bottom: 70px;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--bg-secondary);
                border-radius: 20px;
                padding: 5px 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                font-size: 14px;
                transition: opacity 0.3s, transform 0.3s;
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
                pointer-events: none;
            }
            
            .status-bar.visible {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            
            .status-bar i {
                color: var(--accent-color);
            }
            
            .status-bar.listening i {
                animation: pulse-listening 1s infinite;
            }
            
            @keyframes pulse-listening {
                0% { color: var(--accent-color); }
                50% { color: #e74c3c; }
                100% { color: var(--accent-color); }
            }
            
            .voice-waves {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                height: 100%;
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
            }
            
            .voice-wave {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                background: var(--accent-color);
                opacity: 0;
            }
            
            @keyframes voice-wave-animation {
                0% {
                    width: 60%;
                    height: 60%;
                    opacity: 0.5;
                }
                100% {
                    width: 180%;
                    height: 180%;
                    opacity: 0;
                }
            }
            
            .visualizer {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 3px;
                height: 20px;
                margin-left: 5px;
            }
            
            .visualizer-bar {
                width: 3px;
                background-color: var(--accent-color);
                height: 5px;
                border-radius: 1px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add notification container for voice alerts
    createNotificationContainer();
    
    // Make functions globally available
    window.toggleVoiceInput = toggleVoiceInput;
    window.toggleVoiceOutput = toggleVoiceOutput;
    window.toggleAutoVoice = toggleAutoVoice;
    window.speakText = speakText;
    window.stopSpeaking = stopSpeaking;
}

/**
 * Create notification container if it doesn't exist and add necessary styles
 */
function createNotificationContainer() {
    if (!document.getElementById('voice-notification-container')) {
        const container = document.createElement('div');
        container.id = 'voice-notification-container';
        document.body.appendChild(container);
        
        // Add styles if not already present
        if (!document.getElementById('voice-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'voice-notification-styles';
            style.textContent = `
            .modern-notification {
                position: fixed;
                bottom: 70px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                border-radius: 12px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                border-left: 4px solid #3498db;
                min-width: 280px;
                max-width: 80%;
                z-index: 1000;
                padding: 12px;
                transform: translateX(120%);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
                overflow: hidden;
            }
            
            .modern-notification.error {
                border-left-color: #e74c3c;
            }
            
            .modern-notification.listening {
                border-left-color: #e74c3c;
            }
            
            .modern-notification.listening-active .notification-icon i {
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); color: #e74c3c; }
                50% { transform: scale(1.2); color: #ff6b6b; }
                100% { transform: scale(1); color: #e74c3c; }
            }
            
            .modern-notification.show {
                transform: translateX(-50%);
                opacity: 1;
            }
            
            .notification-icon {
                margin-right: 12px;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-icon i {
                font-size: 14px;
                color: #3498db;
            }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 5px;
            }
            
            .notification-message {
                font-size: 12px;
                color: #666;
            }
            
            .notification-close {
                margin-left: 12px;
                color: #aaa;
                cursor: pointer;
                font-size: 14px;
            }
            
            .notification-close:hover {
                color: #666;
            }
            
            /* Darker style for dark mode */
            .dark-mode .modern-notification {
                background: rgba(26, 32, 44, 0.9);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            .dark-mode .notification-icon {
                background: #2d3748;
            }
            
            .dark-mode .notification-message {
                color: #cbd5e0;
            }
            
            .dark-mode .notification-close {
                color: #718096;
            }
            
            .dark-mode .notification-close:hover {
                color: #a0aec0;
            }
            
            /* Animation for voice visualizer */
            .visualizer-bar {
                animation: voice-visualizer 0.8s ease-in-out infinite;
            }
            
            @keyframes voice-visualizer {
                0%, 100% { height: 5px; }
                50% { height: 15px; }
            }
            `;
            document.head.appendChild(style);
        }
    }
    
    return document.getElementById('voice-notification-container');
}

/**
 * Show a modern-looking notification for voice interactions
 */
function showVoiceNotification(title, message, type = 'info') {
    const container = document.getElementById('voice-notification-container') || createNotificationContainer();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `modern-notification ${type}`;
    
    // Create icon based on type
    let iconClass = 'info-circle';
    if (type === 'error') iconClass = 'exclamation-circle';
    if (type === 'listening') iconClass = 'microphone';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${iconClass}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-close">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    // Add notification to container
    container.appendChild(notification);
    
    // Add click handler to close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide after delay, unless it's the listening notification
    if (type !== 'listening') {
        setTimeout(() => {
            // Only hide if still in DOM
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    return notification;
}

/**
 * Setup speech recognition with advanced visual feedback
 */
function setupSpeechRecognition() {
    // Create speech recognition object
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Store recognition instance globally
    window.speechRecognition = recognition;
    
    // Create visualizer elements
    const createVisualizer = () => {
        const visualizer = document.createElement('div');
        visualizer.className = 'visualizer';
        
        // Create bars
        for (let i = 0; i < 5; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.animationDelay = `${i * 0.1}s`;
            visualizer.appendChild(bar);
        }
        
        return visualizer;
    };
    
    // Add recognition event handlers
    recognition.onstart = function() {
        // Update UI to show we're listening
        const voiceButton = document.querySelector('.voice-input-button');
        if (voiceButton) {
            voiceButton.classList.add('listening');
            
            // Add animated voice waves
            const waves = document.createElement('div');
            waves.className = 'voice-waves';
            
            // Create multiple waves
            for (let i = 0; i < 3; i++) {
                const wave = document.createElement('div');
                wave.className = 'voice-wave';
                wave.style.animation = `voice-wave-animation ${1 + i * 0.4}s infinite ease-out`;
                wave.style.animationDelay = `${i * 0.2}s`;
                waves.appendChild(wave);
            }
            
            voiceButton.appendChild(waves);
        }
        
        // Show status bar with visualizer
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            // Add visualizer to status bar
            const visualizer = createVisualizer();
            const statusText = statusBar.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Listening...';
                statusText.parentNode.insertBefore(visualizer, statusText.nextSibling);
            }
            
            statusBar.classList.add('visible', 'listening');
            
            // Animate visualizer bars randomly
            const bars = statusBar.querySelectorAll('.visualizer-bar');
            bars.forEach(bar => {
                animateVisualizerBar(bar);
            });
        }
        
        // Show notification
        const notification = showVoiceNotification('Voice Input Active', 'Speak now...', 'listening');
        notification.classList.add('listening-active');
        
        // Store reference for later
        window.voiceNotification = notification;
    };
    
    recognition.onresult = function(event) {
        const statusBar = document.querySelector('.status-bar');
        const statusText = statusBar?.querySelector('.status-text');
        
        // Get transcript
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        
        // Update status text with live transcription
        if (statusText) {
            statusText.textContent = transcript || 'Listening...';
        }
        
        // Final result
        if (event.results[0].isFinal) {
            // Update status
            if (statusText) statusText.textContent = 'Processing...';
            
            // Hide visualizer
            const visualizer = statusBar?.querySelector('.visualizer');
            if (visualizer) {
                visualizer.style.display = 'none';
            }
            
            // Send voice input to message input
            const messageInput = document.querySelector('.message-input');
            if (messageInput && transcript) {
                messageInput.value = transcript;
                
                // Trigger input event to update UI
                messageInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Send message after a short delay
                setTimeout(() => {
                    const sendButton = document.querySelector('.send-button');
                    if (sendButton && !sendButton.disabled) {
                        sendButton.click();
                    }
                }, 500);
            }
            
            // Reset voice input UI
            const voiceButton = document.querySelector('.voice-input-button');
            if (voiceButton) {
                voiceButton.classList.remove('listening');
                
                // Remove waves
                const waves = voiceButton.querySelector('.voice-waves');
                if (waves) waves.remove();
            }
            
            // Hide status bar with animation
            if (statusBar) {
                statusBar.classList.remove('visible');
            }
            
            // Update notification
            const notification = window.voiceNotification;
            if (notification) {
                // Update notification content
                const title = notification.querySelector('.notification-title');
                const message = notification.querySelector('.notification-message');
                const icon = notification.querySelector('.notification-icon i');
                
                if (title) title.textContent = 'Voice Captured';
                if (message) message.textContent = transcript || 'No speech detected';
                if (icon) {
                    icon.className = 'fas fa-check-circle';
                    icon.style.color = '#10b981';
                }
                
                notification.classList.remove('listening-active');
                
                // Hide notification after delay
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        if (document.body.contains(notification)) {
                            notification.remove();
                        }
                    }, 300);
                }, 2000);
            }
        }
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error', event.error);
        
        // Reset voice input UI
        const voiceButton = document.querySelector('.voice-input-button');
        if (voiceButton) {
            voiceButton.classList.remove('listening');
            
            // Remove waves
            const waves = voiceButton.querySelector('.voice-waves');
            if (waves) waves.remove();
        }
        
        // Hide status bar
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            statusBar.classList.remove('visible');
        }
        
        // Show error notification
        const errorMessage = event.error === 'not-allowed' 
            ? 'Microphone access denied. Please check permissions.'
            : `Error: ${event.error}`;
        
        showVoiceNotification('Voice Input Error', errorMessage, 'error');
        
        // Remove previous notification if exists
        if (window.voiceNotification) {
            window.voiceNotification.remove();
        }
    };
    
    recognition.onend = function() {
        // This handles if recognition stops unexpectedly
        const voiceButton = document.querySelector('.voice-input-button.listening');
        
        if (voiceButton) {
            // If still in listening state but recognition ended, reset UI
            voiceButton.classList.remove('listening');
            
            // Remove waves
            const waves = voiceButton.querySelector('.voice-waves');
            if (waves) waves.remove();
            
            // Hide status bar
            const statusBar = document.querySelector('.status-bar');
            if (statusBar) {
                statusBar.classList.remove('visible');
            }
        }
    };
}

/**
 * Animate a visualizer bar with random heights
 */
function animateVisualizerBar(bar) {
    // Random height between 2px and 15px
    const setRandomHeight = () => {
        const height = Math.floor(Math.random() * 13) + 2;
        bar.style.height = `${height}px`;
        
        // Schedule next animation
        setTimeout(setRandomHeight, Math.random() * 300 + 200);
    };
    
    setRandomHeight();
}

/**
 * Toggle voice input on/off
 */
function toggleVoiceInput() {
    const recognition = window.speechRecognition;
    const voiceButton = document.querySelector('.voice-input-button');
    
    if (!recognition) {
        showVoiceNotification('Voice Input Unavailable', 'Your browser does not support speech recognition.', 'error');
        return;
    }
    
    try {
        if (voiceButton && voiceButton.classList.contains('listening')) {
            // Stop listening
            recognition.abort();
            voiceButton.classList.remove('listening');
            
            // Remove waves
            const waves = voiceButton.querySelector('.voice-waves');
            if (waves) waves.remove();
            
            // Hide status bar
            const statusBar = document.querySelector('.status-bar');
            if (statusBar) {
                statusBar.classList.remove('visible');
            }
            
            // Hide notification
            if (window.voiceNotification) {
                window.voiceNotification.classList.remove('show');
                setTimeout(() => {
                    if (window.voiceNotification && document.body.contains(window.voiceNotification)) {
                        window.voiceNotification.remove();
                    }
                }, 300);
            }
        } else {
            // Start listening
            recognition.start();
        }
    } catch (error) {
        console.error('Speech recognition error:', error);
        showVoiceNotification('Voice Input Error', 'Could not start speech recognition. Try again.', 'error');
    }
}

/**
 * Setup speech synthesis for text-to-speech
 */
function setupSpeechSynthesis() {
    // Set up speech options with better voice selection
    window.speechOptions = {
        voice: null,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
    };
    
    // Find best voice
    function findBestVoice() {
        return new Promise(resolve => {
            // Wait for voices to be loaded
            const voices = speechSynthesis.getVoices();
            
            if (voices.length > 0) {
                // Preferred voices (in order)
                const preferredVoices = [
                    // English US Google high-quality voices
                    { name: 'Google UK English Female', lang: 'en-GB' },
                    { name: 'Google UK English Male', lang: 'en-GB' },
                    { name: 'Google US English', lang: 'en-US' },
                    // English Microsoft voices
                    { name: 'Microsoft Zira', lang: 'en-US' },
                    { name: 'Microsoft David', lang: 'en-US' }
                ];
                
                // Try to find preferred voices
                for (const preferred of preferredVoices) {
                    const voice = voices.find(v => v.name === preferred.name && v.lang.includes(preferred.lang));
                    if (voice) {
                        return resolve(voice);
                    }
                }
                
                // Otherwise, find any English voice
                const englishVoice = voices.find(v => v.lang.includes('en-'));
                if (englishVoice) {
                    return resolve(englishVoice);
                }
                
                // Fall back to first available voice
                resolve(voices[0]);
            } else {
                resolve(null);
            }
        });
    }
    
    // Initialize voice
    window.speechSynthesis.onvoiceschanged = async function() {
        window.speechOptions.voice = await findBestVoice();
    };
    
    // Try to load voices immediately as well
    setTimeout(async () => {
        window.speechOptions.voice = await findBestVoice();
    }, 100);
}

/**
 * Toggle voice output on/off
 */
function toggleVoiceOutput() {
    const button = document.querySelector('.voice-output-button');
    if (!button) return;
    
    const isEnabled = button.getAttribute('data-enabled') === 'true';
    button.setAttribute('data-enabled', (!isEnabled).toString());
    button.classList.toggle('active', !isEnabled);
    
    // Notify user
    if (!isEnabled) {
        showVoiceNotification('Text-to-Speech Enabled', 'The assistant will speak its responses.', 'info');
        
        // Add subtle animation to button
        button.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.2)' },
            { transform: 'scale(1)' }
        ], {
            duration: 600,
            easing: 'ease-in-out'
        });
    } else {
        showVoiceNotification('Text-to-Speech Disabled', 'The assistant will no longer speak.', 'info');
        stopSpeaking();
    }
}

/**
 * Toggle auto voice mode on/off
 */
function toggleAutoVoice() {
    const button = document.querySelector('.auto-voice-button');
    if (!button) return;
    
    const isEnabled = button.getAttribute('data-enabled') === 'true';
    button.setAttribute('data-enabled', (!isEnabled).toString());
    button.classList.toggle('active', !isEnabled);
    
    // Sync TTS if enabling auto voice
    if (!isEnabled) {
        const ttsButton = document.querySelector('.voice-output-button');
        if (ttsButton) {
            ttsButton.setAttribute('data-enabled', 'true');
            ttsButton.classList.add('active');
        }
        
        showVoiceNotification('Auto Voice Mode Enabled', 'Voice input and output both enabled.', 'info');
        
        // Add ripple effect to button
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
            opacity: 0.3;
            animation: ripple-fade 1s forwards;
        `;
        
        button.appendChild(ripple);
        
        // Add ripple animation keyframes if not present
        if (!document.getElementById('ripple-fade-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-fade-keyframes';
            style.textContent = `
                @keyframes ripple-fade {
                    0% { transform: scale(0.5); opacity: 0.5; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    } else {
        showVoiceNotification('Auto Voice Mode Disabled', 'Continuous conversation mode off.', 'info');
    }
}

/**
 * Speak text with visual feedback
 */
function speakText(text) {
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
        console.error('Speech synthesis not supported');
        return;
    }
    
    // Check if text-to-speech is enabled
    const voiceOutputButton = document.querySelector('.voice-output-button');
    if (voiceOutputButton && voiceOutputButton.getAttribute('data-enabled') !== 'true') {
        return;
    }
    
    // Stop any current speech
    stopSpeaking();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    const options = window.speechOptions || {};
    if (options.voice) utterance.voice = options.voice;
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // Store utterance for later reference
    window.currentUtterance = utterance;
    
    // Add visual feedback for which message is being spoken
    const messages = document.querySelectorAll('.assistant-message');
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage) {
        const voiceAction = latestMessage.querySelector('.message-voice-action');
        if (voiceAction) {
            voiceAction.classList.add('speaking');
            
            // Add wave animation to show speaking
            const messageContent = latestMessage.querySelector('.message-content');
            if (messageContent) {
                messageContent.style.borderLeft = '2px solid var(--accent-color)';
                messageContent.style.paddingLeft = '10px';
                messageContent.style.transition = 'all 0.3s';
            }
            
            // Reset when done speaking
            utterance.onend = function() {
                voiceAction.classList.remove('speaking');
                
                if (messageContent) {
                    messageContent.style.borderLeft = '';
                    messageContent.style.paddingLeft = '';
                }
                
                // Check if auto voice mode is enabled to start listening again
                const autoVoiceButton = document.querySelector('.auto-voice-button');
                if (autoVoiceButton && autoVoiceButton.getAttribute('data-enabled') === 'true') {
                    setTimeout(toggleVoiceInput, 500);
                }
            };
        }
    }
    
    // Speak
    window.speechSynthesis.speak(utterance);
}

/**
 * Stop current speech
 */
function stopSpeaking() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        // Remove speaking class from any message
        const speakingActions = document.querySelectorAll('.message-voice-action.speaking');
        speakingActions.forEach(action => {
            action.classList.remove('speaking');
            
            // Find containing message and reset styles
            const message = action.closest('.assistant-message');
            if (message) {
                const messageContent = message.querySelector('.message-content');
                if (messageContent) {
                    messageContent.style.borderLeft = '';
                    messageContent.style.paddingLeft = '';
                }
            }
        });
    }
}