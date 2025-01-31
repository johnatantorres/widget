let mediaRecorder;
let audioChunks = [];

export async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('audio', audioBlob);

            try {
                const response = await fetch('http://localhost:5000/transcribe', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                sendMessage(data.text);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        mediaRecorder.start();
        document.querySelector('#micButton').style.backgroundColor = 'red';
    } catch (err) {
        console.error('Error accessing microphone:', err);
    }
}

export function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
        document.querySelector('#micButton').style.backgroundColor = '';
    }
}

export async function sendMessage(transcription = null) {
    const inputField = document.querySelector('#inputField');
    const message = inputField.value.trim() || transcription;
    if (!message) return;

    inputField.value = '';
    addMessage('User', message);

    // ... existing sendMessage logic
}