from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import tempfile
from gtts import gTTS
import base64
import io
import speech_recognition as sr
import os

recognizer = sr.Recognizer()

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": ['*'],  # Your tunnel URL
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["*"],
        "supports_credentials": True
    }
})



@app.route('/')
def home():
    return render_template('base.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')


@app.route('/chatbot-widget.js')
def chatbot_widget():
    return send_from_directory('static', 'chatbot-widget.js')



@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        audio_file = request.files['audio']
        if not audio_file.filename:
            return jsonify({'error': 'No file selected'}), 400
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            audio_file.save(tmp.name)
            temp_path = tmp.name
        with sr.AudioFile(temp_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            return jsonify({'text': text})
    except sr.UnknownValueError:
        return jsonify({'error': 'Speech could not be understood'}), 400
    except sr.RequestError as e:
        return jsonify({'error': f'Speech service error: {str(e)}'}), 503
    except Exception as e:
        app.logger.error(f"Error in /transcribe: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError as e:
                app.logger.error(f"Error removing temporary file: {e}")    
    
@app.route('/talk', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data.get('text')
    
    # Create TTS audio
    tts = gTTS(text=text, lang='es')
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    
    # Encode to base64
    audio_base64 = base64.b64encode(fp.read()).decode()
    return jsonify({'audio': audio_base64})

if __name__ == '__main__':
    app.run(debug=True)
