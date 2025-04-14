/**
 * Voice features for AI Assistant
 * Handles speech recognition and text-to-speech functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    initVoiceFeatures();
});

// Global voice objects
let speechRecognition = null;
let speechSynthesis = window.speechSynthesis;
let isListening = false;
let selectedVoice = null;
let isAutoVoiceEnabled = false; // Flag for automatic voice-to-voice mode

/**
 * Initialize voice features if browser supports them
 */
function initVoiceFeatures() {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Speech recognition not supported in this browser');
        document.querySelectorAll('.voice-input-button').forEach(btn => {
            btn.style.display = 'none';
        });
    } else {
        setupSpeechRecognition();
    }

    if (!window.speechSynthesis) {
        console.warn('Speech synthesis not supported in this browser');
        document.querySelectorAll('.voice-output-button').forEach(btn => {
            btn.style.display = 'none';
        });
    } else {
        setupSpeechSynthesis();
    }

    // Add voice buttons to the UI
    addVoiceButtons();
}

/**
 * Set up speech recognition
 */
function setupSpeechRecognition() {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition = new SpeechRecognition();
    
    // Configure speech recognition
    speechRecognition.continuous = false;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-US';
    
    // Handle speech recognition results
    speechRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
        
        // Update the message input field with the transcript
        const messageInput = document.querySelector('.message-input');
        if (messageInput) {
            messageInput.value = transcript;
            // Trigger Alpine.js data binding
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };
    
    // Handle speech recognition end
    speechRecognition.onend = () => {
        const voiceButton = document.querySelector('.voice-input-button');
        if (voiceButton) {
            voiceButton.classList.remove('listening');
            voiceButton.querySelector('i').className = 'fas fa-microphone';
        }
        isListening = false;
        
        // In auto voice mode, automatically send the message if there's content
        if (isAutoVoiceEnabled) {
            const messageInput = document.querySelector('.message-input');
            if (messageInput && messageInput.value.trim()) {
                // Slight delay to allow the UI to update with the full transcript
                setTimeout(() => {
                    // Send the message
                    if (window.sendMessageHandler) {
                        window.sendMessageHandler();
                    }
                }, 500);
            } else {
                // If no input was detected but auto mode is on, start listening again
                setTimeout(() => {
                    if (isAutoVoiceEnabled) startListening();
                }, 1000);
            }
        }
    };
    
    // Handle speech recognition errors
    speechRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        const voiceButton = document.querySelector('.voice-input-button');
        if (voiceButton) {
            voiceButton.classList.remove('listening');
            voiceButton.querySelector('i').className = 'fas fa-microphone';
        }
        
        // Show error toast
        if (event.error === 'not-allowed') {
            showVoiceErrorToast('Microphone access denied. Please check your browser permissions.');
            // Disable auto voice mode on permission errors
            isAutoVoiceEnabled = false;
            updateAutoVoiceButton();
        } else {
            showVoiceErrorToast('Speech recognition error. Please try again.');
            // Try again in auto mode after a delay
            if (isAutoVoiceEnabled) {
                setTimeout(() => {
                    if (isAutoVoiceEnabled) startListening();
                }, 2000);
            }
        }
    };
}

/**
 * Set up speech synthesis
 */
function setupSpeechSynthesis() {
    // Get available voices when they're loaded
    speechSynthesis.onvoiceschanged = () => {
        const voices = speechSynthesis.getVoices();
        
        // Prefer a natural sounding en-US voice
        selectedVoice = voices.find(voice => 
            voice.name.includes('Google') && 
            voice.name.includes('US') && 
            voice.name.includes('Female')
        );
        
        // Fallback to any US English voice
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.includes('en-US'));
        }
        
        // Fallback to any English voice
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.includes('en'));
        }
        
        // Last resort: use the first available voice
        if (!selectedVoice && voices.length > 0) {
            selectedVoice = voices[0];
        }
    };
    
    // Trigger the voices loaded event (needed for some browsers)
    speechSynthesis.getVoices();
}

/**
 * Add voice input and output buttons to the UI
 */
function addVoiceButtons() {
    // Only add buttons if they don't already exist
    if (document.querySelector('.voice-input-button')) return;
    
    const inputContainer = document.querySelector('.message-input-container');
    if (inputContainer) {
        // Add voice input button
        const voiceInputButton = document.createElement('button');
        voiceInputButton.className = 'voice-input-button';
        voiceInputButton.setAttribute('aria-label', 'Voice input');
        voiceInputButton.innerHTML = '<i class="fas fa-microphone"></i><span class="voice-status-indicator"></span>';
        voiceInputButton.addEventListener('click', toggleVoiceInput);
        
        // Add voice output toggle button (for reading messages aloud)
        const voiceOutputButton = document.createElement('button');
        voiceOutputButton.className = 'voice-output-button';
        voiceOutputButton.setAttribute('aria-label', 'Toggle text-to-speech');
        voiceOutputButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        voiceOutputButton.setAttribute('data-enabled', 'false');
        voiceOutputButton.addEventListener('click', toggleVoiceOutput);
        
        // Add auto voice mode toggle button
        const autoVoiceButton = document.createElement('button');
        autoVoiceButton.className = 'auto-voice-button';
        autoVoiceButton.setAttribute('aria-label', 'Toggle automatic voice conversation');
        autoVoiceButton.innerHTML = '<i class="fas fa-comments"></i>';
        autoVoiceButton.setAttribute('data-enabled', 'false');
        autoVoiceButton.addEventListener('click', toggleAutoVoice);
        
        // Insert buttons before the send button
        const sendButton = inputContainer.querySelector('.send-button');
        if (sendButton) {
            inputContainer.insertBefore(autoVoiceButton, sendButton);
            inputContainer.insertBefore(voiceInputButton, sendButton);
            inputContainer.insertBefore(voiceOutputButton, sendButton);
        } else {
            inputContainer.appendChild(autoVoiceButton);
            inputContainer.appendChild(voiceInputButton);
            inputContainer.appendChild(voiceOutputButton);
        }
        
        // Add voice status styles
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
                
                .status-bar .status-icon {
                    color: #e74c3c;
                    animation: pulse-small 1.5s infinite;
                }
                
                .status-bar.speaking .status-icon {
                    color: var(--accent-color);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create status bar for voice feedback
        if (!document.querySelector('.status-bar')) {
            const statusBar = document.createElement('div');
            statusBar.className = 'status-bar';
            statusBar.innerHTML = `
                <i class="fas fa-microphone status-icon"></i>
                <span class="status-text">Listening...</span>
            `;
            document.body.appendChild(statusBar);
        }
    }
    
    // Add voice action buttons to each assistant message
    const addVoiceActionsToMessages = () => {
        document.querySelectorAll('.assistant-message').forEach(message => {
            // Only add if it doesn't already have a voice action
            if (!message.querySelector('.message-voice-action')) {
                const actionsDiv = message.querySelector('.message-actions');
                if (actionsDiv) {
                    const voiceAction = document.createElement('button');
                    voiceAction.className = 'message-action message-voice-action';
                    voiceAction.setAttribute('aria-label', 'Read aloud');
                    voiceAction.innerHTML = '<i class="fas fa-volume-up"></i>';
                    voiceAction.addEventListener('click', () => {
                        const content = message.querySelector('.message-content').textContent;
                        speakText(content);
                    });
                    actionsDiv.prepend(voiceAction);
                }
            }
        });
    };
    
    // Initial addition
    addVoiceActionsToMessages();
    
    // Watch for new messages
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                addVoiceActionsToMessages();
                
                // If auto voice mode is enabled, detect when a new assistant message arrives
                if (isAutoVoiceEnabled) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('assistant-message')) {
                            // Get the message content
                            const content = node.querySelector('.message-content')?.textContent;
                            if (content) {
                                // Stop listening while the assistant speaks
                                stopListening();
                                
                                // Speak the assistant's response
                                speakText(content);
                            }
                        }
                    });
                }
            }
        });
    });
    
    const messagesContainer = document.querySelector('.conversation-messages');
    if (messagesContainer) {
        observer.observe(messagesContainer, { childList: true, subtree: true });
    }
}

/**
 * Toggle voice input
 */
function toggleVoiceInput() {
    if (!speechRecognition) return;
    
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

/**
 * Start the speech recognition
 */
function startListening() {
    // Don't start listening if AI is currently speaking
    if (!speechRecognition || isListening || window.aiIsSpeaking) return;
    
    const voiceButton = document.querySelector('.voice-input-button');
    
    try {
        speechRecognition.start();
        isListening = true;
        if (voiceButton) {
            voiceButton.classList.add('listening');
            voiceButton.querySelector('i').className = 'fas fa-microphone-slash';
        }
        
        // Update status bar instead of showing a notification
        updateVoiceStatusBar('listening');
    } catch (error) {
        console.error('Speech recognition error:', error);
        showVoiceErrorToast('Could not start voice recognition. Please try again.');
        isListening = false;
        if (voiceButton) {
            voiceButton.classList.remove('listening');
            voiceButton.querySelector('i').className = 'fas fa-microphone';
        }
    }
}

/**
 * Stop the speech recognition
 */
function stopListening() {
    if (!speechRecognition || !isListening) return;
    
    speechRecognition.stop();
    isListening = false;
    
    const voiceButton = document.querySelector('.voice-input-button');
    if (voiceButton) {
        voiceButton.classList.remove('listening');
        voiceButton.querySelector('i').className = 'fas fa-microphone';
    }
    
    // Hide the status bar
    updateVoiceStatusBar('inactive');
}

/**
 * Toggle voice output for all assistant messages
 */
function toggleVoiceOutput() {
    const voiceOutputButton = document.querySelector('.voice-output-button');
    const isEnabled = voiceOutputButton.getAttribute('data-enabled') === 'true';
    
    // Toggle state
    voiceOutputButton.setAttribute('data-enabled', (!isEnabled).toString());
    
    if (isEnabled) {
        // Turning off
        voiceOutputButton.classList.remove('active');
        stopSpeaking();
        showToast('Text-to-speech disabled');
    } else {
        // Turning on
        voiceOutputButton.classList.add('active');
        showToast('Text-to-speech enabled');
        
        // Read the last assistant message if available
        const lastMessage = document.querySelector('.assistant-message:last-child .message-content');
        if (lastMessage) {
            speakText(lastMessage.textContent);
        }
    }
}

/**
 * Toggle automatic voice conversation mode
 */
function toggleAutoVoice() {
    isAutoVoiceEnabled = !isAutoVoiceEnabled;
    updateAutoVoiceButton();
    
    if (isAutoVoiceEnabled) {
        // Turn on text-to-speech if it's not already on
        const voiceOutputButton = document.querySelector('.voice-output-button');
        if (voiceOutputButton && voiceOutputButton.getAttribute('data-enabled') !== 'true') {
            toggleVoiceOutput();
        }
        
        showNotification('Voice conversation mode enabled', 'Arya will listen and speak automatically');
        
        // Start listening immediately
        startListening();
    } else {
        showNotification('Voice conversation mode disabled', '');
        stopListening();
    }
}

/**
 * Update the auto voice button state
 */
function updateAutoVoiceButton() {
    const autoVoiceButton = document.querySelector('.auto-voice-button');
    if (autoVoiceButton) {
        autoVoiceButton.setAttribute('data-enabled', isAutoVoiceEnabled.toString());
        
        if (isAutoVoiceEnabled) {
            autoVoiceButton.classList.add('active');
        } else {
            autoVoiceButton.classList.remove('active');
        }
    }
}

/**
 * Speak the given text using speech synthesis
 */
function speakText(text) {
    if (!speechSynthesis) return;
    
    // Stop any ongoing speech
    stopSpeaking();
    
    // Filter out emojis from the text
    const textWithoutEmojis = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(textWithoutEmojis);
    
    // Set voice if available
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    
    // Configure speech parameters
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Track global speaking state
    window.aiIsSpeaking = true;
    
    // Update status bar to show speaking
    updateVoiceStatusBar('speaking');
    
    // Set event handlers
    utterance.onend = () => {
        window.aiIsSpeaking = false;
        
        // Remove speaking class from voice action button
        if (window.currentSpeakingButton) {
            window.currentSpeakingButton.classList.remove('speaking');
            window.currentSpeakingButton = null;
        }
        
        // Hide the status bar if no longer in voice conversation
        updateVoiceStatusBar('inactive');
        
        // If auto voice mode is enabled, wait before starting to listen again
        if (isAutoVoiceEnabled && !isListening) {
            // Additional delay to ensure system doesn't pick up its own voice
            setTimeout(() => {
                if (isAutoVoiceEnabled && !isListening && !window.aiIsSpeaking) {
                    startListening();
                }
            }, 1500);
        }
    };
    
    utterance.onerror = () => {
        window.aiIsSpeaking = false;
        if (window.currentSpeakingButton) {
            window.currentSpeakingButton.classList.remove('speaking');
            window.currentSpeakingButton = null;
        }
        updateVoiceStatusBar('inactive');
    };
    
    // Speak the text
    speechSynthesis.speak(utterance);
    
    // Show visual indicator
    document.querySelectorAll('.message-voice-action').forEach(btn => {
        btn.classList.remove('speaking');
    });
    
    // Find the message element that contains this text
    // Instead of using :contains selector which is not standard,
    // we'll iterate through the message content elements
    let matchingMessageContent = null;
    const textStart = text.substring(0, 30);
    
    document.querySelectorAll('.assistant-message .message-content').forEach(element => {
        if (element.textContent.includes(textStart)) {
            matchingMessageContent = element;
        }
    });
    
    if (matchingMessageContent) {
        const voiceAction = matchingMessageContent.closest('.assistant-message').querySelector('.message-voice-action');
        if (voiceAction) {
            voiceAction.classList.add('speaking');
            window.currentSpeakingButton = voiceAction;
        }
    }
}

/**
 * Stop any ongoing speech
 */
function stopSpeaking() {
    if (speechSynthesis) {
        speechSynthesis.cancel();
    }
    
    // Update speaking state
    window.aiIsSpeaking = false;
    
    // Remove speaking class from all buttons
    document.querySelectorAll('.message-voice-action').forEach(btn => {
        btn.classList.remove('speaking');
    });
    window.currentSpeakingButton = null;
    
    // Update status bar
    updateVoiceStatusBar('inactive');
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
    // Check for the window.showToast that is NOT this function
    if (typeof window.showToast === 'function' && window.showToast !== showToast) {
        window.showToast(message, type);
        return;
    }
    
    // Use our modern notification
    showNotification(message, '', type);
}

/**
 * Show a modern notification 
 */
function showNotification(title, message = '', type = 'info') {
    const notification = document.createElement('div');
    notification.className = `modern-notification ${type}`;
    
    const icon = type === 'error' ? 'exclamation-circle' : 
                type === 'listening' ? 'microphone' : 'info-circle';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            ${message ? `<div class="notification-message">${message}</div>` : ''}
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add animation classes based on type
    if (type === 'listening') {
        notification.classList.add('listening-active');
    }
    
    const container = document.querySelector('.notification-container') || createNotificationContainer();
    container.appendChild(notification);
    
    // Add dismiss functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('hiding');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Show the notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-hide normal notifications (but not listening ones)
    if (type !== 'listening') {
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    return notification;
}

/**
 * Create notification container if it doesn't exist and add necessary styles
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
    
    // Add styles for modern notifications if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 320px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .modern-notification {
                display: flex;
                align-items: center;
                background-color: var(--bg-secondary);
                border-left: 4px solid var(--accent-color);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
                transform: translateX(0);
                opacity: 1;
            }
            
            .modern-notification.hiding {
                transform: translateX(120%);
                opacity: 0;
            }
            
            .notification-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                flex-shrink: 0;
            }
            
            .notification-icon i {
                font-size: 18px;
                color: var(--accent-color);
            }
            
            .modern-notification.error .notification-icon i {
                color: #e74c3c;
            }
            
            .notification-content {
                flex-grow: 1;
            }
            
            .notification-title {
                font-weight: 600;
                margin-bottom: 2px;
                color: var(--text-primary);
            }
            
            .notification-message {
                font-size: 0.85em;
                color: var(--text-secondary);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-tertiary);
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 8px;
                transition: background-color 0.2s;
            }
            
            .notification-close:hover {
                background-color: var(--bg-tertiary);
            }
        `;
        document.head.appendChild(style);
    }
    
    return container;
}

/**
 * Show a voice-specific error toast
 */
function showVoiceErrorToast(message) {
    showNotification('Voice Recognition Error', message, 'error');
}

/**
 * Update the voice status bar
 */
function updateVoiceStatusBar(status) {
    const statusBar = document.querySelector('.status-bar');
    if (!statusBar) return;
    
    const statusIcon = statusBar.querySelector('.status-icon');
    const statusText = statusBar.querySelector('.status-text');
    
    if (status === 'inactive') {
        statusBar.classList.remove('visible');
        setTimeout(() => {
            if (!isListening && !window.aiIsSpeaking) {
                statusBar.classList.remove('speaking');
                statusIcon.className = 'fas fa-microphone status-icon';
            }
        }, 300);
    } else if (status === 'listening') {
        statusBar.classList.remove('speaking');
        statusBar.classList.add('visible');
        statusIcon.className = 'fas fa-microphone status-icon';
        statusText.textContent = 'Listening...';
    } else if (status === 'speaking') {
        statusBar.classList.add('visible', 'speaking');
        statusIcon.className = 'fas fa-volume-up status-icon';
        statusText.textContent = 'Speaking...';
    }
}

// Make functions available globally
window.toggleVoiceInput = toggleVoiceInput;
window.toggleVoiceOutput = toggleVoiceOutput;
window.toggleAutoVoice = toggleAutoVoice;
window.speakText = speakText;
window.stopSpeaking = stopSpeaking;
window.startListening = startListening;
window.stopListening = stopListening;