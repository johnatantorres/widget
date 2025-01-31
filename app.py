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
        "origins": ["https://s5t9scjt-5000.use2.devtunnels.ms"],  # Your tunnel URL
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
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
    temp_path = None
    try:
        audio_file = validate_audio_file(request)
        temp_path = save_audio_to_temp_file(audio_file)
        transcribed_text = perform_transcription(temp_path)
        return jsonify({'text': transcribed_text})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except sr.UnknownValueError:
        return jsonify({'error': 'Speech could not be understood'}), 400
    except sr.RequestError as e:
        return jsonify({'error': f'Speech service error: {str(e)}'}), 503
    except Exception as e:
        app.logger.error(f"Error in /transcribe: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cleanup_temp_file(temp_path)

def validate_audio_file(request):
    if 'audio' not in request.files:
        raise ValueError('No audio file provided')
    audio_file = request.files['audio']
    if not audio_file.filename:
        raise ValueError('No file selected')
    return audio_file

def save_audio_to_temp_file(audio_file):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        audio_file.save(tmp.name)
        return tmp.name

def perform_transcription(file_path):
    with sr.AudioFile(file_path) as source:
        audio_data = recognizer.record(source)
        return recognizer.recognize_google(audio_data)

def cleanup_temp_file(file_path):
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
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
