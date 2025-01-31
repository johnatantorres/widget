import { createChatbox, toggleChatboxVisibility } from './ui.js';
import { sendMessage, startRecording, stopRecording } from './audio.js';

(function() {
    const chatbox = createChatbox();
    const toggleButton = document.querySelector('#toggleButton');

    toggleButton.addEventListener('click', () => toggleChatboxVisibility(chatbox));
    document.querySelector('#sendButton').addEventListener('click', sendMessage);
    document.querySelector('#inputField').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    let isRecording = false;
    document.querySelector('#micButton').addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
            isRecording = true;
        } else {
            stopRecording();
            isRecording = false;
        }
    });
})();