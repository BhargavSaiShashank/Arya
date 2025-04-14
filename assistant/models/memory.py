import sqlite3
import json
import datetime
from pathlib import Path
import os

class Memory:
    """Memory management for the assistant"""
    
    def __init__(self, db_path="assistant.db"):
        """Initialize the memory system with SQLite database"""
        self.db_path = db_path
        self._init_db()
        
    def _init_db(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create conversations table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY,
            timestamp TEXT,
            content TEXT,
            metadata TEXT
        )
        ''')
        
        # Create memories table (for explicitly remembered items)
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY,
            timestamp TEXT,
            content TEXT,
            importance INTEGER,
            metadata TEXT
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def store_conversation(self, messages, metadata=None):
        """Store a conversation exchange in the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        timestamp = datetime.datetime.now().isoformat()
        content_json = json.dumps(messages)
        metadata_json = json.dumps(metadata) if metadata else '{}'
        
        cursor.execute(
            "INSERT INTO conversations (timestamp, content, metadata) VALUES (?, ?, ?)",
            (timestamp, content_json, metadata_json)
        )
        
        conn.commit()
        conn.close()
    
    def store_memory(self, content, importance=1, metadata=None):
        """Store a specific memory item with importance level"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        timestamp = datetime.datetime.now().isoformat()
        metadata_json = json.dumps(metadata) if metadata else '{}'
        
        cursor.execute(
            "INSERT INTO memories (timestamp, content, importance, metadata) VALUES (?, ?, ?, ?)",
            (timestamp, content, importance, metadata_json)
        )
        
        conn.commit()
        conn.close()
        return cursor.lastrowid
        
    def get_memories(self, limit=10):
        """Retrieve the most recent memories"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, timestamp, content, importance FROM memories ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        )
        
        memories = []
        for row in cursor.fetchall():
            memories.append({
                "id": row[0],
                "timestamp": row[1],
                "content": row[2],
                "importance": row[3]
            })
        
        conn.close()
        return memories
        
    def search_memories(self, query, limit=5):
        """Simple keyword search in memories"""
        conn = sqlite3.connect(self.db_path)
        conn.create_function("LOWER", 1, lambda x: x.lower() if x else None)
        cursor = conn.cursor()
        
        # Simple keyword search
        cursor.execute(
            "SELECT id, timestamp, content, importance FROM memories WHERE LOWER(content) LIKE ? ORDER BY importance DESC, timestamp DESC LIMIT ?",
            (f"%{query.lower()}%", limit)
        )
        
        results = []
        for row in cursor.fetchall():
            results.append({
                "id": row[0],
                "timestamp": row[1],
                "content": row[2],
                "importance": row[3]
            })
        
        conn.close()
        return results
        
    def get_recent_conversations(self, limit=5):
        """Retrieve recent conversation history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, timestamp, content FROM conversations ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        )
        
        conversations = []
        for row in cursor.fetchall():
            conversations.append({
                "id": row[0],
                "timestamp": row[1],
                "content": json.loads(row[2])
            })
        
        conn.close()
        return conversations 