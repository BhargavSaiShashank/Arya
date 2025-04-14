import os
import json
import sys
from pathlib import Path
import groq

# Add parent directory to path to allow importing the Config
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

class GroqClient:
    """Client for interacting with the Groq API"""
    
    def __init__(self):
        """Initialize the Groq client"""
        self.api_key = Config.GROQ_API_KEY
        self.model = Config.GROQ_MODEL
        self.conversation_history = []
        
        # Add a system message to identify the assistant as Arya
        self.add_message("system", "You are Arya, an AI assistant built to be helpful, harmless, and honest. Your name is Arya. Never identify yourself as any other AI model (like LLaMA, Claude, GPT, etc). Always respond as Arya.")
        
        # Create the client with only the API key
        self.client = groq.Client(api_key=self.api_key)
        print(f"Initializing Groq client with model: {self.model}")
        
    def add_message(self, role, content):
        """Add a message to the conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content
        })
        
        # Keep conversation history within limits
        if len(self.conversation_history) > Config.MAX_CONTEXT_LENGTH * 2:  # *2 for user/assistant pairs
            # Remove oldest messages but keep system messages
            system_messages = [msg for msg in self.conversation_history if msg["role"] == "system"]
            other_messages = [msg for msg in self.conversation_history if msg["role"] != "system"]
            other_messages = other_messages[-(Config.MAX_CONTEXT_LENGTH * 2):]  # Keep the most recent messages
            self.conversation_history = system_messages + other_messages
    
    def send_message(self, message, context=None):
        """Send a message to the Groq AI and get a response"""
        # Add user message to conversation
        self.add_message("user", message)
        
        try:
            # Prepare messages with system message always first
            messages = list(self.conversation_history)
            
            # Add additional context if provided
            if context:
                # Find the first non-system message
                first_non_system_idx = next((i for i, msg in enumerate(messages) if msg["role"] != "system"), 0)
                
                # Insert context just after system messages
                messages.insert(first_non_system_idx, {
                    "role": "system",
                    "content": f"Context information: {context}"
                })
            
            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
            )
            
            # Extract and save response
            assistant_response = response.choices[0].message.content
            self.add_message("assistant", assistant_response)
            
            return {
                "status": "success",
                "message": assistant_response
            }
            
        except Exception as e:
            print(f"Error calling Groq API: {str(e)}")
            error_message = "I encountered an error while processing your request. Please check your API key and try again."
            self.add_message("assistant", error_message)
            return {
                "status": "error",
                "message": error_message
            }
    
    def stream_message(self, message, context=None):
        """Stream a response from the Groq API"""
        # Add user message to conversation
        self.add_message("user", message)
        
        try:
            # Prepare messages with system message always first
            messages = list(self.conversation_history)
            
            # Add additional context if provided
            if context:
                # Find the first non-system message
                first_non_system_idx = next((i for i, msg in enumerate(messages) if msg["role"] != "system"), 0)
                
                # Insert context just after system messages
                messages.insert(first_non_system_idx, {
                    "role": "system",
                    "content": f"Context information: {context}"
                })
            
            # Call Groq API with streaming
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
                stream=True,
            )
            
            # Initialize response
            full_response = ""
            
            # Yield each chunk as it arrives
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    yield full_response
            
            # Add the complete response to history
            self.add_message("assistant", full_response)
            
        except Exception as e:
            print(f"Error in streaming from Groq API: {str(e)}")
            error_message = "I encountered an error while streaming your response. Please check your API key and try again."
            yield error_message
            self.add_message("assistant", error_message) 