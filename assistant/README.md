# Intelligent Assistant

A modern web-based intelligent assistant application powered by Groq's LLM API with memory capabilities, voice input, and a beautiful dashboard interface.

## Features

- **Modern Dashboard Interface**: A clean, card-based dashboard with quick actions
- **Conversational UI**: Natural chat interface with message history
- **Groq LLM Integration**: Powered by Groq's fast LLM models
- **Memory System**: Long-term memory storage for important information
- **Voice Input/Output**: Speak to your assistant using speech recognition
- **Web Search**: Search the web for real-time information
- **Context-Aware**: Assistant maintains context across conversations
- **Mobile-Responsive**: Works well on all device sizes

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Setup

1. Clone the repository or download the source code

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows: 
```bash
venv\Scripts\activate
```
- macOS/Linux: 
```bash
source venv/bin/activate
```

4. Install the requirements:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the project root (copy from `.env.example`):
```bash
cp .env.example .env
```

6. Update the `.env` file with your API keys and settings:
   - Add your Groq API key (get one from [Groq's website](https://console.groq.com))
   - Generate a random secret key for Flask
   - Configure other settings as needed

## Running the Application

1. Make sure your virtual environment is activated

2. Start the Flask development server:
```bash
python app.py
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
assistant/
├── app.py                  # Main Flask application
├── config.py               # Configuration manager
├── requirements.txt        # Python dependencies
├── .env.example            # Example environment variables
├── static/                 # Static assets
│   ├── css/                # CSS stylesheets
│   │   ├── style.css       # Base styles
│   │   └── assistant.css   # Assistant-specific styles
│   ├── js/                 # JavaScript files
│   │   ├── main.js         # Main JavaScript functions
│   │   └── assistant.js    # Assistant-specific JavaScript
│   └── images/             # Image assets
├── templates/              # HTML templates
│   ├── base.html           # Base template
│   └── index.html          # Main assistant interface
└── models/                 # Application models
    ├── groq_client.py      # Groq API client
    └── memory.py           # Memory management system
```

## Usage

- **Text Communication**: Type in the input area and press Enter or click the send button
- **Voice Input**: Click the microphone icon to start voice input
- **Remember Information**: Click the bookmark icon on any assistant message to store it
- **Quick Actions**: Use the dashboard buttons for common actions
- **Context Panel**: View and manage conversation context in the right panel

## Customization

- **Theme**: The application supports both light and dark mode based on system preference
- **Groq Model**: Change the model in `.env` file to use different Groq models
- **UI**: Modify the CSS files to customize the appearance

## License

MIT License 