document.addEventListener('alpine:init', () => {
    Alpine.data('assistant', () => ({
        // UI State
        isDarkMode: false,
        showDashboard: true,
        showContext: true,
        isTyping: false,
        
        // Message data
        messages: [],
        currentMessage: '',
        
        // Suggestions
        suggestions: [
            'Tell me about machine learning',
            'How can I improve my code?',
            'Explain quantum computing',
            'Write a creative story',
            'Help me debug my error'
            
        ],
        
        // Memory items
        memoryItems: [
            {
                icon: 'fas fa-robot',
                title: 'AI Capabilities',
                preview: 'Discussion about what the AI can do',
                time: '2 hrs ago'
            },
            {
                icon: 'fas fa-code',
                title: 'Coding Project',
                preview: 'Python script development help',
                time: '5 hrs ago'
            },
            {
                icon: 'fas fa-brain',
                title: 'Learning Path',
                preview: 'Creating a study plan for data science',
                time: 'Yesterday'
            }
        ],
        
        // Context information
        currentTopics: [
            { title: 'Machine Learning', description: 'Discussion about ML algorithms and applications' },
            { title: 'Python Programming', description: 'Help with Python coding and best practices' }
        ],
        
        relatedInfo: [
            { title: 'Data Visualization', description: 'Techniques for creating effective visual representations of data' },
            { title: 'Neural Networks', description: 'Understanding the fundamentals of neural network architecture' }
        ],
        
        // Initialize
        init() {
            // Check for saved theme preference
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                this.toggleDarkMode();
            }
            
            // Add welcome message
            this.addMessage('assistant', 'Hello! I\'m Arya, your AI assistant. How can I help you today?');
            
            // Responsive behavior
            this.handleResponsiveLayout();
            window.addEventListener('resize', () => this.handleResponsiveLayout());
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
        },
        
        // Toggle dark mode
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.body.classList.toggle('dark-mode', this.isDarkMode);
            localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        },
        
        // Toggle dashboard visibility
        toggleDashboard() {
            this.showDashboard = !this.showDashboard;
        },
        
        // Toggle context panel visibility
        toggleContext() {
            this.showContext = !this.showContext;
        },
        
        // Add a message to the conversation
        addMessage(sender, content) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            
            const messageObj = {
                id: Date.now(),
                sender: sender,
                content: content,
                time: `${hours}:${minutes}`
            };
            
            this.messages.push(messageObj);
            
            // Scroll to bottom of messages
            this.$nextTick(() => {
                const messagesContainer = document.querySelector('.conversation-messages');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Add voice button to assistant messages
                if (sender === 'assistant') {
                    const messageElements = document.querySelectorAll('.message.assistant-message');
                    const latestMessage = messageElements[messageElements.length - 1];
                    
                    if (latestMessage) {
                        const actionsContainer = latestMessage.querySelector('.message-actions');
                        
                        if (actionsContainer && !actionsContainer.querySelector('.message-voice-action')) {
                            const voiceButton = document.createElement('button');
                            voiceButton.className = 'message-action-button message-voice-action';
                            voiceButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                            voiceButton.setAttribute('aria-label', 'Speak message');
                            voiceButton.addEventListener('click', () => {
                                if (window.speakText) {
                                    window.speakText(content);
                                }
                            });
                            
                            actionsContainer.appendChild(voiceButton);
                        }
                    }
                }
            });
        },
        
        // Send a message
        sendMessage() {
            if (!this.currentMessage.trim()) return;
            
            // If our custom handler exists, use it instead
            if (window.sendMessageHandler) {
                window.sendMessageHandler();
                return;
            }
            
            // Add user message
            this.addMessage('user', this.currentMessage);
            const userMessage = this.currentMessage;
            this.currentMessage = '';
            
            // Show typing indicator
            this.isTyping = true;
            
            // Simulate AI response (replace with actual API call)
            setTimeout(() => {
                this.isTyping = false;
                
                // Generate a response based on user input (mock response)
                let response = this.generateResponse(userMessage);
                this.addMessage('assistant', response);
            }, 1500);
        },
        
        // Generate mock response (replace with actual API integration)
        generateResponse(userMessage) {
            const lowerMessage = userMessage.toLowerCase();
            
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                return 'Hello! How can I assist you today?';
            } else if (lowerMessage.includes('help')) {
                return 'I\'m here to help! You can ask me questions, request information, or ask for assistance with various tasks.';
            } else if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) {
                return 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.';
            } else if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
                return 'I can help with programming! Let me know what language you\'re working with and what specific help you need.';
            } else {
                return 'That\'s an interesting question. Can you provide more details so I can give you a more helpful response?';
            }
        },
        
        // Use a suggestion
        useSuggestion(suggestion) {
            this.currentMessage = suggestion;
            this.$refs.messageInput.focus();
        },
        
        // Copy message to clipboard
        copyMessage(content) {
            navigator.clipboard.writeText(content).then(() => {
                this.showToast('Message copied to clipboard!');
            });
        },
        
        // Show toast notification
        showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = `
                <i class="fas fa-check-circle toast-icon"></i>
                <span class="toast-message">${message}</span>
            `;
            
            const container = document.querySelector('.toast-container') || this.createToastContainer();
            container.appendChild(toast);
            
            // Show the toast
            setTimeout(() => toast.classList.add('show'), 10);
            
            // Hide and remove the toast
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },
        
        // Create toast container if it doesn't exist
        createToastContainer() {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
            return container;
        },
        
        // Handle responsive layout
        handleResponsiveLayout() {
            if (window.innerWidth < 768) {
                this.showDashboard = false;
                this.showContext = false;
            } else {
                this.showDashboard = true;
                this.showContext = true;
            }
        },
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + Enter to send message
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    this.sendMessage();
                }
                
                // Esc to close panels on mobile
                if (e.key === 'Escape' && window.innerWidth < 768) {
                    this.showDashboard = false;
                    this.showContext = false;
                }
                
                // Ctrl/Cmd + / to toggle dark mode
                if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                    e.preventDefault();
                    this.toggleDarkMode();
                }
                
                // Ctrl/Cmd + D to toggle dashboard
                if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                    e.preventDefault();
                    this.toggleDashboard();
                }
                
                // Ctrl/Cmd + K to toggle context panel
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.toggleContext();
                }
            });
        }
    }));
});