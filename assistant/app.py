from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import os
from dotenv import load_dotenv
from models.groq_client import GroqClient
from models.memory import Memory
from config import Config
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config.from_object(Config)

# Initialize services
groq_client = GroqClient()
memory = Memory(db_path=os.path.join(os.path.dirname(__file__), "assistant.db"))

@app.route('/')
def index():
    """Main page route"""
    return render_template('index.html')

@app.route('/api/send_message', methods=['POST'])
def send_message():
    """API endpoint to process user messages"""
    data = request.get_json()
    user_message = data.get('message', '')
    
    # Get context from memory if available
    context = None
    recent_memories = memory.get_memories(limit=3)
    if recent_memories:
        context_items = [mem["content"] for mem in recent_memories]
        context = "Here are some things to remember about our conversation: " + " ".join(context_items)
    
    try:
        # Send message to Groq API
        response = groq_client.send_message(user_message, context=context)
        
        # Extract response from Groq
        assistant_message = response.get('message', "I'm sorry, I couldn't process your request.")
        
        # Generate suggestions based on the conversation context
        suggestions = generate_suggestions(user_message, assistant_message)
        
        # Store the conversation exchange in memory
        memory.store_conversation([
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": assistant_message}
        ])
        
        return jsonify({
            "message": assistant_message,
            "suggestions": suggestions
        })
    except Exception as e:
        print(f"Error in message processing: {str(e)}")
        return jsonify({
            "message": "I'm having trouble connecting to my language model. Please try again later.",
            "suggestions": ["Try again", "Help me with something else"]
        })

@app.route('/api/remember', methods=['POST'])
def remember():
    """Endpoint to store important information"""
    data = request.get_json()
    memory_content = data.get('content', '')
    
    if not memory_content:
        return jsonify({"status": "error", "message": "No content provided"})
    
    try:
        # Store memory with medium importance (2)
        memory_id = memory.store_memory(memory_content, importance=2)
        return jsonify({"status": "success", "message": "Memory stored", "id": memory_id})
    except Exception as e:
        print(f"Error storing memory: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to store memory"})

@app.route('/api/search', methods=['POST'])
def search():
    """Endpoint for web search functionality"""
    data = request.get_json()
    query = data.get('query', '')
    
    if not query:
        return jsonify({"results": []})
    
    try:
        # For now, we'll use mock results
        # In a production system, integrate with a search API
        mock_results = [
            {"title": f"Search result for '{query}' - 1", "snippet": f"This is information about {query} from a web search.", "url": f"https://example.com/search/{query}/1"},
            {"title": f"More about '{query}'", "snippet": f"Additional information and resources about {query} and related topics.", "url": f"https://example.com/search/{query}/2"}
        ]
        
        return jsonify({"results": mock_results})
    except Exception as e:
        print(f"Error performing search: {str(e)}")
        return jsonify({"results": [], "error": "Failed to perform search"})

@app.route('/api/memories', methods=['GET'])
def get_memories():
    """API endpoint to retrieve stored memories"""
    try:
        limit = int(request.args.get('limit', 10))
        memories_list = memory.get_memories(limit=limit)
        return jsonify({"memories": memories_list})
    except Exception as e:
        print(f"Error retrieving memories: {str(e)}")
        return jsonify({"memories": [], "error": "Failed to retrieve memories"})

@app.route('/api/search_memories', methods=['POST'])
def search_memories():
    """API endpoint to search stored memories"""
    data = request.get_json()
    query = data.get('query', '')
    
    if not query:
        return jsonify({"results": []})
    
    try:
        results = memory.search_memories(query)
        return jsonify({"results": results})
    except Exception as e:
        print(f"Error searching memories: {str(e)}")
        return jsonify({"results": [], "error": "Failed to search memories"})

def generate_suggestions(user_message, assistant_response):
    """Generate contextual suggestions based on the conversation"""
    # Simple rule-based suggestion generation
    # In a production system, this could use ML or the LLM itself
    
    suggestions = []
    
    # Check for common topics in the message
    user_lower = user_message.lower()
    
    if 'search' in user_lower or 'find' in user_lower or 'look' in user_lower:
        suggestions.append("Search for more information")
    
    if 'recommend' in user_lower or 'suggest' in user_lower:
        suggestions.append("Get recommendations")
    
    if 'remember' in user_lower or 'note' in user_lower:
        suggestions.append("Remember this information")
    
    if 'help' in user_lower:
        suggestions.append("What can you do?")
    
    # Add a follow-up question if no contextual suggestions
    if len(suggestions) < 2:
        suggestions.append("Tell me more")
        suggestions.append("How else can I help?")
    
    # Limit to 3 suggestions
    return suggestions[:3]

if __name__ == '__main__':
    # Create the database directory if it doesn't exist
    db_dir = os.path.dirname(os.path.join(os.path.dirname(__file__), "assistant.db"))
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
        
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 