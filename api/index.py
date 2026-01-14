from flask import Flask, request, jsonify
import json
import os
import urllib.request

app = Flask(__name__)

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


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    # Handle CORS preflight
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response

    try:
        data = request.get_json()
        user_message = data.get("message", "")
        conversation_history = data.get("history", [])

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Build messages array with history
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add conversation history (last 10 exchanges to stay within context)
        for entry in conversation_history[-20:]:
            messages.append(entry)

        # Add current user message
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

        resp = jsonify({"response": ai_response})
        resp.headers.add("Access-Control-Allow-Origin", "*")
        return resp

    except Exception as e:
        resp = jsonify({"error": str(e)})
        resp.headers.add("Access-Control-Allow-Origin", "*")
        return resp, 500
