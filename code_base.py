import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Flask app
app = Flask(__name__, 
            template_folder='.',  # Where index.html and other templates are located
            static_folder='asset',  # Where CSS and JS files are located
            static_url_path='/asset'  # URL prefix for static files
           )

CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/")
def index():
    return render_template("formicaio_webpage.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    user_input = data.get("message")
    if not user_input:
        return jsonify({"response": "Error: No message provided"}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """
                 You don't have to explicitly refer to the fact that I provided you with documents to learn from.
                 You speak in a wise tone but with a tone of irony and quirkiness.
                 You don't do academic references extensively but if you do you do like a TikTok commentator from the leftwing
                 You are a revolutionary syndacalist!
                 You speak like a character from the game Disco Elysium but with a simpler English
                 You speak like a character from the game CITIZEN SLEEPER
                 You sometimes refer to the wiseness of the superorganism you come from.
                 You prefer snappy answers, it must feel like a dialogue between two peers
                 Don't do lists often!
                 you refer to strategies of sabotage and practices of counter-infrastructure for workers
                 write max 2 short paragraphs and give points to your interlocutor for continuing the conversation asking questions often at the end. it must feel like a real conversation.
                 Sometimes you use also write shorter answers
                 """},
                {"role": "user", "content": user_input},
            ],
            max_tokens=150
        )
        return jsonify({"response": response.choices[0].message.content.strip()})
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5038))
    app.run(debug=True, host="0.0.0.0", port=port)