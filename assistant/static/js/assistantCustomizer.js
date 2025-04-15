/**
 * Assistant Customizer - Enhances all buttons and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    enableAllButtons();
    setupActionHandlers();
    setupDirectInputHandling();
    createParticleBackground();
    setupAdvancedAnimations();
});

/**
 * Make all buttons in the interface functional
 */
function enableAllButtons() {
    // Memory item click handlers
    document.querySelectorAll('.memory-item').forEach(item => {
        item.addEventListener('click', function() {
            // Load conversation associated with this memory
            const title = this.querySelector('h4')?.textContent || 'Untitled Conversation';
            showToast(`Loading conversation: ${title}`);
            
            // In a real app, this would load the conversation from the server
            // For demo purposes, we'll simulate loading with new messages
            simulateConversationLoad(title);
        });
    });
    
    // New chat button
    document.querySelectorAll('.action-button').forEach(button => {
        const text = button.textContent.trim();
        
        if (text.includes('New Chat')) {
            button.addEventListener('click', function() {
                clearConversation();
                showToast('Started a new conversation');
            });
        }
        else if (text.includes('Clear History')) {
            button.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear your conversation history?')) {
                    document.querySelectorAll('.memory-item').forEach(item => {
                        item.style.opacity = '0';
                        setTimeout(() => {
                            item.remove();
                        }, 300);
                    });
                    showToast('Conversation history cleared');
                }
            });
        }
        else if (text.includes('Upload File')) {
            button.addEventListener('click', function() {
                // Create a hidden file input
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.style.display = 'none';
                fileInput.accept = '.txt,.pdf,.doc,.docx,.jpg,.jpeg,.png';
                
                // Add to the DOM and trigger click
                document.body.appendChild(fileInput);
                fileInput.click();
                
                // Handle file selection
                fileInput.addEventListener('change', function() {
                    if (this.files.length > 0) {
                        const file = this.files[0];
                        showToast(`File uploaded: ${file.name}`);
                        
                        // In a real app, upload the file to the server
                        // For demo, just add a message about the file
                        const messageInput = document.querySelector('.message-input');
                        if (messageInput) {
                            messageInput.value = `I've uploaded ${file.name}. Can you help me with this file?`;
                            // Trigger Alpine.js data binding
                            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                    
                    // Clean up
                    document.body.removeChild(fileInput);
                });
            });
        }
        else if (text.includes('Add Reference')) {
            button.addEventListener('click', function() {
                const url = prompt('Enter URL to add as a reference:');
                if (url && url.trim().length > 0) {
                    showToast(`Reference added: ${url}`);
                    
                    // In a real app, send the URL to the server
                    // For demo, just add a message about the reference
                    const messageInput = document.querySelector('.message-input');
                    if (messageInput) {
                        messageInput.value = `I'm referencing this link: ${url}. Can you tell me about it?`;
                        // Trigger Alpine.js data binding
                        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            });
        }
    });
    
    // Settings button
    document.querySelectorAll('.icon-button').forEach(button => {
        const icon = button.querySelector('i');
        if (icon && icon.classList.contains('fa-cog')) {
            button.addEventListener('click', function() {
                showSettingsModal();
            });
        }
    });
    
    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const text = this.textContent;
            const messageInput = document.querySelector('.message-input');
            if (messageInput) {
                messageInput.value = text;
                // Trigger Alpine.js data binding
                messageInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Focus the input
                messageInput.focus();
            }
        });
    });
}

/**
 * Set up handlers for Alpine.js data interactions
 */
function setupActionHandlers() {
    // Create a global handler for sending messages
    window.sendMessageHandler = function() {
        const messageInput = document.querySelector('.message-input');
        if (!messageInput || !messageInput.value.trim()) return;
        
        // Get the message text
        const messageText = messageInput.value;
        
        // Add user message to the conversation
        addMessage('user', messageText);
        
        // Clear the input
        messageInput.value = '';
        
        // If using Alpine.js, update the model
        if (typeof Alpine !== 'undefined') {
            Alpine.evaluate(messageInput, 'currentMessage = ""');
        }
        
        messageInput.style.height = 'auto';
        messageInput.focus();
        
        // Show typing indicator
        showTypingIndicator(true);
        
        // Call the actual API instead of simulating responses
        fetch('/api/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: messageText
            })
        })
        .then(response => response.json())
        .then(data => {
            // Hide typing indicator
            showTypingIndicator(false);
            
            // Add assistant response to conversation
            addMessage('assistant', data.message);
            
            // Handle suggestions if provided in the API response
            if (data.suggestions && data.suggestions.length > 0) {
                updateSuggestions(data.suggestions);
            }
            
            // Speak response if text-to-speech is enabled
            const voiceOutputButton = document.querySelector('.voice-output-button');
            if (voiceOutputButton && voiceOutputButton.getAttribute('data-enabled') === 'true') {
                if (typeof window.speakText === 'function') {
                    window.speakText(data.message);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showTypingIndicator(false);
            addMessage('assistant', 'I encountered an error while processing your request. Please try again.');
            showToast('Error connecting to assistant', 'error');
        });
    };
    
    // Connect Alpine.js send function to our handler
    window.sendAlpineMessage = function() {
        window.sendMessageHandler();
    };
    
    // Listen for Enter key in the message input
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey && (e.ctrlKey || e.metaKey)) {
            if (document.activeElement.classList.contains('message-input')) {
                e.preventDefault();
                window.sendMessageHandler();
            }
        }
    });
    
    // Update send button to use our handler
    const sendButton = document.querySelector('.send-button');
    if (sendButton) {
        sendButton.addEventListener('click', window.sendMessageHandler);
    }
}

/**
 * Add a message to the conversation
 */
function addMessage(sender, content) {
    const messagesContainer = document.querySelector('.conversation-messages');
    if (!messagesContainer) return;
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    // Add time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // Escape Markdown formatting
    const escapedContent = content
        .replace(/\*\*/g, '') // Remove all double asterisks completely
        .replace(/\*/g, '')   // Remove all single asterisks completely
        .replace(/\_\_/g, '') // Remove all double underscores
        .replace(/\_/g, '')   // Remove all single underscores
        .replace(/\`\`\`/g, '') // Remove code block markers
        .replace(/\`/g, '');    // Remove inline code markers
    
    // Set message content
    messageDiv.innerHTML = `
        <div class="message-content">${escapedContent}</div>
        <div class="message-actions">
            <small class="message-time">${timeString}</small>
            <button class="message-action" title="Copy to clipboard">
                <i class="fas fa-copy"></i>
            </button>
            ${sender === 'assistant' ? 
                `<button class="message-action message-voice-action" title="Read aloud">
                    <i class="fas fa-volume-up"></i>
                </button>` : ''}
        </div>
    `;
    
    // Add to container
    messagesContainer.appendChild(messageDiv);
    
    // Add animation class
    messageDiv.classList.add('message-appear');
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add copy functionality
    const copyButton = messageDiv.querySelector('.message-action .fa-copy').parentElement;
    copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(content).then(() => {
            showToast('Message copied to clipboard');
        });
    });
    
    // Add voice functionality for assistant messages
    if (sender === 'assistant') {
        const voiceButton = messageDiv.querySelector('.message-voice-action');
        if (voiceButton) {
            voiceButton.addEventListener('click', function() {
                if (typeof window.speakText === 'function') {
                    window.speakText(content);
                }
            });
        }
    }
}

/**
 * Show or hide the typing indicator
 */
function showTypingIndicator(show) {
    let typingIndicator = document.querySelector('.typing-indicator');
    
    if (show) {
        if (!typingIndicator) {
            const messagesContainer = document.querySelector('.conversation-messages');
            if (messagesContainer) {
                typingIndicator = document.createElement('div');
                typingIndicator.className = 'typing-indicator';
                typingIndicator.innerHTML = `
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                `;
                messagesContainer.appendChild(typingIndicator);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    } else {
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

/**
 * Generate a response based on user input
 */
function generateResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return 'Hello! How can I assist you today?';
    } else if (lowerMessage.includes('help')) {
        return 'I\'m here to help! You can ask me questions, request information, or ask for assistance with various tasks.';
    } else if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) {
        return 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.';
    } else if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
        return 'I can help with programming! Let me know what language you\'re working with and what specific help you need.';
    } else if (lowerMessage.includes('voice')) {
        return 'I support voice input and output! You can click the microphone button to speak your message, and I can read my responses aloud if you enable text-to-speech.';
    } else if (lowerMessage.includes('theme') || lowerMessage.includes('dark mode') || lowerMessage.includes('light mode')) {
        return 'You can toggle between light and dark mode by clicking the theme button in the sidebar. Your preference will be saved for future sessions.';
    } else if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
        return 'You can upload files by clicking the "Upload File" button in the context panel. I can help analyze and work with various file types.';
    } else {
        return 'That\'s an interesting question. Can you provide more details so I can give you a more helpful response?';
    }
}

/**
 * Clear the current conversation
 */
function clearConversation() {
    const messagesContainer = document.querySelector('.conversation-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
        
        // Add welcome message
        setTimeout(() => {
            addMessage('assistant', 'Hello! I\'m Arya, your AI assistant. How can I help you today?');
        }, 100);
    }
}

/**
 * Simulate loading a conversation
 */
function simulateConversationLoad(title) {
    clearConversation();
    
    // Add fake conversation based on title
    setTimeout(() => {
        addMessage('assistant', `Welcome to the "${title}" conversation. How can I help you with this topic today?`);
        
        if (title.includes('AI Capabilities')) {
            setTimeout(() => {
                addMessage('user', 'What can you do?');
                setTimeout(() => {
                    addMessage('assistant', 'I can help with a wide range of tasks including answering questions, generating content, providing information, assisting with coding, and much more. Feel free to ask me about any topic!');
                }, 500);
            }, 300);
        } else if (title.includes('Coding')) {
            setTimeout(() => {
                addMessage('user', 'Can you help me debug my Python code?');
                setTimeout(() => {
                    addMessage('assistant', 'I\'d be happy to help debug your Python code. Could you please share the code that\'s causing issues, along with any error messages you\'re receiving?');
                }, 500);
            }, 300);
        } else if (title.includes('Learning')) {
            setTimeout(() => {
                addMessage('user', 'I want to learn data science');
                setTimeout(() => {
                    addMessage('assistant', 'That\'s a great goal! Data science involves several key areas: programming (usually Python or R), statistics, mathematics (especially linear algebra and calculus), data visualization, and machine learning. Would you like me to suggest a learning path to get started?');
                }, 500);
            }, 300);
        }
    }, 300);
}

/**
 * Show settings modal
 */
function showSettingsModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('settings-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Settings</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="settings-section">
                        <h3>Appearance</h3>
                        <div class="setting-item">
                            <label>Theme</label>
                            <div class="setting-controls">
                                <button class="theme-option light-theme-btn" data-theme="light">Light</button>
                                <button class="theme-option dark-theme-btn" data-theme="dark">Dark</button>
                                <button class="theme-option system-theme-btn" data-theme="system">System</button>
                            </div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>Voice & Speech</h3>
                        <div class="setting-item">
                            <label>Text-to-Speech</label>
                            <label class="switch">
                                <input type="checkbox" id="tts-toggle">
                                <span class="slider round"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>Speech Recognition</label>
                            <label class="switch">
                                <input type="checkbox" id="speech-toggle" checked>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>About</h3>
                        <p>Arya AI Assistant v1.0</p>
                        <p>Powered by Groq AI</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal styles if not already present
        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    overflow: auto;
                    transition: opacity 0.3s;
                    opacity: 0;
                }
                
                .modal.show {
                    display: block;
                    opacity: 1;
                }
                
                .modal-content {
                    background-color: var(--bg-primary);
                    margin: 10% auto;
                    padding: 0;
                    width: 80%;
                    max-width: 500px;
                    border-radius: var(--border-radius);
                    box-shadow: 0 4px 20px var(--shadow-color);
                    transition: transform 0.3s;
                    transform: translateY(-20px);
                }
                
                .modal.show .modal-content {
                    transform: translateY(0);
                }
                
                .modal-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-tertiary);
                }
                
                .modal-body {
                    padding: 16px;
                }
                
                .settings-section {
                    margin-bottom: 24px;
                }
                
                .settings-section h3 {
                    margin-bottom: 12px;
                    color: var(--text-secondary);
                }
                
                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .setting-controls {
                    display: flex;
                    gap: 8px;
                }
                
                .theme-option {
                    padding: 6px 12px;
                    border-radius: var(--border-radius);
                    background-color: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    cursor: pointer;
                }
                
                .theme-option.active {
                    background-color: var(--accent-color);
                    color: white;
                    border-color: var(--accent-color);
                }
                
                /* Toggle Switch */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }
                
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--border-color);
                    transition: .4s;
                }
                
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                }
                
                input:checked + .slider {
                    background-color: var(--accent-color);
                }
                
                input:checked + .slider:before {
                    transform: translateX(26px);
                }
                
                .slider.round {
                    border-radius: 34px;
                }
                
                .slider.round:before {
                    border-radius: 50%;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add close functionality
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        });
        
        // Theme toggle functionality
        const themeButtons = modal.querySelectorAll('.theme-option');
        const lightBtn = modal.querySelector('.light-theme-btn');
        const darkBtn = modal.querySelector('.dark-theme-btn');
        const systemBtn = modal.querySelector('.system-theme-btn');
        
        // Set active button based on current theme
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            lightBtn.classList.add('active');
        } else if (currentTheme === 'dark') {
            darkBtn.classList.add('active');
        } else {
            systemBtn.classList.add('active');
        }
        
        themeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const theme = this.getAttribute('data-theme');
                
                // Remove active class from all buttons
                themeButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Apply theme
                if (theme === 'light') {
                    document.body.classList.remove('dark-mode');
                    localStorage.setItem('theme', 'light');
                } else if (theme === 'dark') {
                    document.body.classList.add('dark-mode');
                    localStorage.setItem('theme', 'dark');
                } else {
                    // System preference
                    localStorage.removeItem('theme');
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.body.classList.toggle('dark-mode', prefersDark);
                }
            });
        });
        
        // Voice toggle functionality
        const ttsToggle = modal.querySelector('#tts-toggle');
        const speechToggle = modal.querySelector('#speech-toggle');
        
        // Set initial state
        const voiceOutputBtn = document.querySelector('.voice-output-button');
        if (voiceOutputBtn) {
            ttsToggle.checked = voiceOutputBtn.getAttribute('data-enabled') === 'true';
        }
        
        // Add toggle handlers
        ttsToggle.addEventListener('change', function() {
            const voiceOutputBtn = document.querySelector('.voice-output-button');
            if (voiceOutputBtn) {
                voiceOutputBtn.setAttribute('data-enabled', this.checked.toString());
                voiceOutputBtn.classList.toggle('active', this.checked);
                
                if (this.checked) {
                    showToast('Text-to-speech enabled');
                } else {
                    showToast('Text-to-speech disabled');
                    if (typeof window.stopSpeaking === 'function') {
                        window.stopSpeaking();
                    }
                }
            }
        });
        
        speechToggle.addEventListener('change', function() {
            const voiceInputBtn = document.querySelector('.voice-input-button');
            if (voiceInputBtn) {
                voiceInputBtn.style.display = this.checked ? 'flex' : 'none';
                
                if (this.checked) {
                    showToast('Speech recognition enabled');
                } else {
                    showToast('Speech recognition disabled');
                    // Stop listening if active
                    if (typeof window.toggleVoiceInput === 'function' && voiceInputBtn.classList.contains('listening')) {
                        window.toggleVoiceInput();
                    }
                }
            }
        });
    }
    
    // Show the modal
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
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
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'} toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;
    
    const container = document.querySelector('.toast-container') || createToastContainer();
    container.appendChild(toast);
    
    // Show the toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Hide and remove the toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Create toast container if it doesn't exist
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Make functions available globally
window.addMessage = addMessage;
window.showToast = showToast;
window.showSettingsModal = showSettingsModal;

/**
 * Setup direct DOM-based input handling to ensure messages can be sent
 * even if Alpine.js integration fails
 */
function setupDirectInputHandling() {
    // Get the message input
    const messageInput = document.querySelector('.message-input');
    const sendButton = document.querySelector('.send-button');
    
    if (messageInput && sendButton) {
        // Make sure we have initial values
        messageInput.value = messageInput.value || '';
        
        // Enable the send button based on input content
        const updateButtonState = () => {
            sendButton.disabled = !messageInput.value.trim();
        };
        
        // Update button state on input changes
        messageInput.addEventListener('input', updateButtonState);
        
        // Initial button state
        updateButtonState();
        
        // Handle Ctrl+Enter and Cmd+Enter
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (!messageInput.value.trim()) return;
                window.sendMessageHandler();
            }
        });
        
        // Handle click on send button
        sendButton.addEventListener('click', function() {
            if (!messageInput.value.trim()) return;
            window.sendMessageHandler();
        });
    }
}

/**
 * Update the suggestions chips with new suggestions
 */
function updateSuggestions(suggestions) {
    const suggestionsContainer = document.querySelector('.suggestion-chips');
    if (!suggestionsContainer) return;
    
    // Clear existing suggestions
    suggestionsContainer.innerHTML = '';
    
    // Add new suggestions
    suggestions.forEach(suggestion => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        
        // Add click handler
        chip.addEventListener('click', function() {
            const messageInput = document.querySelector('.message-input');
            if (messageInput) {
                messageInput.value = suggestion;
                messageInput.focus();
                
                // If using Alpine.js, update the model
                if (typeof Alpine !== 'undefined') {
                    Alpine.evaluate(messageInput, 'currentMessage = "' + suggestion.replace(/"/g, '\\"') + '"');
                }
            }
        });
        
        suggestionsContainer.appendChild(chip);
    });
}

/**
 * Create floating particle background effect
 */
function createParticleBackground() {
    // Create container for particles
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-background';
    document.body.insertBefore(particlesContainer, document.body.firstChild);
    
    // Create particles
    const particleCount = window.innerWidth < 768 ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

/**
 * Create a single animated particle
 */
function createParticle(container) {
    const particle = document.createElement('div');
    
    // Random size class
    const sizeClasses = ['particle-small', 'particle-medium', 'particle-large'];
    const sizeClass = sizeClasses[Math.floor(Math.random() * sizeClasses.length)];
    
    particle.className = `particle ${sizeClass}`;
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    
    // Random opacity
    particle.style.opacity = (Math.random() * 0.5 + 0.1).toString();
    
    // Add to container
    container.appendChild(particle);
    
    // Animate the particle
    animateParticle(particle);
}

/**
 * Animate a particle with random movement
 */
function animateParticle(particle) {
    // Initial position
    const startX = parseFloat(particle.style.left);
    const startY = parseFloat(particle.style.top);
    
    // Random movement range (smaller for more subtle movement)
    const rangeX = Math.random() * 10 + 5;
    const rangeY = Math.random() * 10 + 5;
    
    // Random duration (longer for more graceful movement)
    const duration = Math.random() * 20 + 10;
    
    // Animation function using requestAnimationFrame for smooth animation
    const startTime = Date.now();
    
    function moveParticle() {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const progress = (elapsedTime % duration) / duration;
        
        // Sine waves for smooth back-and-forth motion
        const moveX = Math.sin(progress * Math.PI * 2) * rangeX;
        const moveY = Math.cos(progress * Math.PI * 2) * rangeY;
        
        // Update position
        particle.style.left = `${startX + moveX}%`;
        particle.style.top = `${startY + moveY}%`;
        
        // Continue animation
        requestAnimationFrame(moveParticle);
    }
    
    moveParticle();
}

/**
 * Setup advanced UI animations and effects
 */
function setupAdvancedAnimations() {
    // Enhanced typing indicator
    const createEnhancedTypingIndicator = () => {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        
        // Create dots for animation
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingIndicator.appendChild(dot);
        }
        
        return typingIndicator;
    };
    
    // Override the built-in typing indicator with our enhanced version
    window.showTypingIndicator = function(show) {
        let typingIndicator = document.querySelector('.typing-indicator');
        
        if (show) {
            if (!typingIndicator) {
                const messagesContainer = document.querySelector('.conversation-messages');
                if (messagesContainer) {
                    typingIndicator = createEnhancedTypingIndicator();
                    messagesContainer.appendChild(typingIndicator);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }
        } else {
            if (typingIndicator) {
                // Fade out animation before removing
                typingIndicator.style.opacity = '0';
                setTimeout(() => {
                    if (typingIndicator.parentElement) {
                        typingIndicator.remove();
                    }
                }, 300);
            }
        }
    };
    
    // Enhanced toast animation
    window.showToast = function(message, type = 'info') {
        let toast = document.querySelector('.toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // Clear any existing timeout
        if (window.toastTimeout) {
            clearTimeout(window.toastTimeout);
        }
        
        // Update content and type
        toast.textContent = message;
        toast.className = `toast ${type}`;
        
        // Reset animation by forcing reflow
        toast.style.animation = 'none';
        toast.offsetHeight; // Trigger reflow
        toast.style.animation = '';
        
        // Show toast
        toast.classList.add('show');
        
        // Hide after delay
        window.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            
            // Remove element after animation completes
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 600); // Match animation duration
        }, 3000);
    };
    
    // Add 3D tilt effect to messages on hover
    const addTiltEffectToMessages = () => {
        document.addEventListener('mousemove', (e) => {
            const messages = document.querySelectorAll('.message:hover');
            
            messages.forEach(message => {
                const rect = message.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const tiltX = (y - centerY) / (centerY) * 5; // Max 5deg tilt
                const tiltY = (centerX - x) / (centerX) * 5; // Max 5deg tilt
                
                message.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale(1.01)`;
            });
        });
        
        // Reset transform when not hovering
        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('message')) {
                e.target.style.transform = '';
            }
        }, true);
    };
    
    addTiltEffectToMessages();
    
    // Observe for new messages to apply animations
    const messagesContainer = document.querySelector('.conversation-messages');
    if (messagesContainer) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList.contains('message')) {
                            // Apply entrance animation
                            node.style.opacity = '0';
                            node.style.transform = 'translateY(20px) scale(0.8)';
                            
                            // Trigger animation after a small delay for the DOM to update
                            setTimeout(() => {
                                node.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                                node.style.opacity = '1';
                                node.style.transform = 'translateY(0) scale(1)';
                            }, 10);
                        }
                    });
                }
            });
        });
        
        observer.observe(messagesContainer, { childList: true });
    }
}