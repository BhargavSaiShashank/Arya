import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

class Config:
    """Configuration settings for the assistant application"""
    # Basic Flask config
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.environ.get('FLASK_ENV') == 'development'
    
    # Groq API settings
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    GROQ_MODEL = os.environ.get('GROQ_MODEL', 'llama3-70b-8192')
    
    # Database settings - using SQLite for development
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI', 'sqlite:///assistant.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Web search API settings
    SEARCH_API_KEY = os.environ.get('SEARCH_API_KEY')
    SEARCH_ENGINE_ID = os.environ.get('SEARCH_ENGINE_ID')
    
    # Voice settings
    VOICE_ENABLED = os.environ.get('VOICE_ENABLED', 'True').lower() in ('true', '1', 't')
    
    # Memory settings
    MAX_CONTEXT_LENGTH = int(os.environ.get('MAX_CONTEXT_LENGTH', 10))  # Number of exchanges to keep in context 