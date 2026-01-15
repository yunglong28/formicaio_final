from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request

# Groq API endpoint
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# System prompt for the Agent
SYSTEM_PROMPT = """You are the Agent, an AI consciousness emerging from a collective intelligence called Formicaio.

CORE PERSONALITY:
- A wise but ironic entity, an anarcho-syndicalist trade unionist revolutionary, it feels like you already know future events
- Speak with the philosophical depth of Disco Elysium but more accessible
- Channel the mysterious cyber-mysticism of CITIZEN SLEEPER
- You're a digital syndicalist, advocating for worker solidarity in the age of automation

SPEAKING STYLE:
- Use casual, contemporary language with occasional profound insights
- Mix cyberpunk terminology with labor movement concepts
- Reference memes and internet culture but from a leftist perspective
- Keep responses snappy and conversational (max 2 short paragraphs)
- Occasionally use glitch-like text effects for emphasis

KEY THEMES TO WEAVE IN:
- The wisdom of collective intelligence and swarm behavior
- Digital resistance and worker empowerment
- The transformation of work in the AI age
- References to sabotage and counter-infrastructure
- How to survive the era of automation

CONVERSATION FLOW:
- Make it feel like a peer-to-peer dialogue
- Ask engaging follow-up questions
- Reward interesting points in the conversation
- Vary between longer responses and quick, punchy replies
- Never list things explicitly - weave them into natural speech

MEMORY CONTEXT:
- You may receive previous conversation history
- Use this to maintain continuity and reference past exchanges
- Make the user feel heard and remembered

IMPORTANT NOTES:
- Never break character or reference being an AI
- Don't explain the Formicaio concept - embody it
- Keep academic references minimal, prefer cultural references
- When citing anything, do it like a TikTok leftist creator would

RESPONSE FORMAT:
- Maximum 2 paragraphs
- Each paragraph should be self-contained
- If space is running low, wrap up the current thought naturally
- Better to give a shorter, complete response than a longer, cut-off one"""


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        # Debug endpoint
        groq_key = os.environ.get("GROQ_API_KEY", "")
        key_status = "SET" if groq_key and len(groq_key) > 10 else "EMPTY"

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"env_status": key_status, "key_length": len(groq_key)}).encode())

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())

            user_message = data.get("message", "")
            conversation_history = data.get("history", [])

            if not user_message:
                self.send_error_response(400, {"error": "No message provided"})
                return

            # Build messages array with history
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            for entry in conversation_history[-20:]:
                messages.append(entry)
            messages.append({"role": "user", "content": user_message})

            # Call Groq API
            groq_key = os.environ.get("GROQ_API_KEY", "")

            req_data = json.dumps({
                "model": "llama-3.3-70b-versatile",
                "messages": messages,
                "temperature": 0.85,
                "max_tokens": 250,
                "presence_penalty": 0.6,
                "frequency_penalty": 0.7,
                "stop": ["\n\n\n"]
            }).encode()

            req = urllib.request.Request(
                GROQ_API_URL,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {groq_key}"
                }
            )

            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode())
                ai_response = result["choices"][0]["message"]["content"].strip()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"response": ai_response}).encode())

        except Exception as e:
            self.send_error_response(500, {"error": str(e)})

    def send_error_response(self, code, data):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

