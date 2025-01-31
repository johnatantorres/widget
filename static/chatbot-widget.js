(function () {
    // Locate the <script> tag that loaded this file
    var scriptElement = document.currentScript || (function () {
        // fallback for older browsers
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    // Read data attributes from the script element
    var companyId = scriptElement.getAttribute('data-company-id');
    console.log('companyId: ', companyId);

    // Create chatbox container
    var chatbox = document.createElement('div');
    chatbox.id = 'chatbot-widget';
    chatbox.style.position = 'fixed';
    chatbox.style.bottom = '65px';
    chatbox.style.right = '20px';
    chatbox.style.width = '350px';
    chatbox.style.height = '500px';
    chatbox.style.zIndex = '9999';
    chatbox.style.display = 'none';
    chatbox.style.transition = 'all 0.3s ease-in-out';

    // Create chat interface
    var chatInterface = document.createElement('div');
    chatInterface.style.width = '100%';
    chatInterface.style.height = '100%';
    chatInterface.style.border = '1px solid #ccc';
    chatInterface.style.borderRadius = '10px';
    chatInterface.style.overflow = 'hidden';
    chatInterface.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

    // Create chat header
    var chatHeader = document.createElement('div');
    chatHeader.style.padding = '10px';
    chatHeader.style.backgroundColor = '#f1f1f1';
    chatHeader.style.borderBottom = '1px solid #ccc';
    chatHeader.innerHTML = '<h3 style="margin: 0;">Chat Support</h3>';

    // Create chat messages area
    var chatMessages = document.createElement('div');
    chatMessages.style.height = 'calc(100% - 100px)';
    chatMessages.style.overflowY = 'auto';
    chatMessages.style.padding = '10px';
    chatMessages.style.backgroundColor = '#fff';

    // Create chat input area
    var chatInput = document.createElement('div');
    chatInput.style.display = 'flex';
    chatInput.style.alignItems = 'center';
    chatInput.style.padding = '10px';
    chatInput.style.borderTop = '1px solid #ccc';
    chatInput.style.backgroundColor = '#f1f1f1';

    var inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Type your message...';
    inputField.style.width = 'calc(100% - 70px)';
    inputField.style.padding = '5px';
    inputField.style.marginRight = '10px';

    var micButton = document.createElement('button');
    micButton.innerHTML = '<img src="http://localhost:5000/static/images/mic-solid-svgrepo-com.svg" alt="Mic" style="width: 20px; height: 20px;">';
    micButton.style.padding = '5px 10px';


    var sendButton = document.createElement('button');
    sendButton.innerHTML = 'Send';
    sendButton.style.padding = '5px 10px';
    sendButton.style.backgroundColor = '#007bff';
    sendButton.style.color = 'white';
    sendButton.style.border = 'left 1px solid #ccc';

    chatInput.appendChild(inputField);
    chatInput.appendChild(micButton);
    chatInput.appendChild(sendButton);

    // Assemble chat interface
    chatInterface.appendChild(chatHeader);
    chatInterface.appendChild(chatMessages);
    chatInterface.appendChild(chatInput);
    chatbox.appendChild(chatInterface);

    // Create toggle button
    var toggleButton = document.createElement('button');
    toggleButton.innerHTML = '<img src="http://localhost:5000/static/images/chatbox-icon.svg" alt="Chat" style="width: 24px; height: 24px;">';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '20px';
    toggleButton.style.right = '20px';
    toggleButton.style.zIndex = '10000';
    toggleButton.style.padding = '10px';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

    // Add elements to the page
    document.body.appendChild(chatbox);
    document.body.appendChild(toggleButton);

    // Toggle chatbox visibility
    toggleButton.addEventListener('click', function () {
        if (chatbox.style.display === 'none') {
            chatbox.style.display = 'block';
            toggleButton.style.display = 'block';
        } else {
            chatbox.style.display = 'none';
            toggleButton.style.display = 'block';
        }
    });

    // Handle sending messages
    sendButton.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    micButton.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Create an AudioContext to handle the conversion
            const audioContext = new AudioContext();
            const mediaStreamSource = audioContext.createMediaStreamSource(stream);

            // Create a MediaRecorder with uncompressed audio
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
                audioBitsPerSecond: 16000, // Match common speech recognition sample rate
            });

            audioChunks = [];
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

                // Convert to WAV format
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioContext = new AudioContext();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                // Create WAV file
                const wavBlob = await convertToWav(audioBuffer);

                // Send to server
                const formData = new FormData();
                formData.append('audio', wavBlob, 'recording.wav');

                try {
                    const response = await fetch('http://localhost:5000/transcribe', {
                        method: 'POST',
                        body: formData,
                        mode: 'cors',
                    });
                    const data = await response.json();
                    sendMessage(data.text);
                } catch (error) {
                    console.error('Error:', error);
                }
            };

            mediaRecorder.start();
            isRecording = true;
            micButton.style.backgroundColor = 'red';
            micButton.style.border = 'none';
            micButton.style.borderRadius = '10px';
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    }

    // Helper function to convert AudioBuffer to WAV
    function convertToWav(audioBuffer) {
        const numOfChan = audioBuffer.numberOfChannels;
        const length = audioBuffer.length * numOfChan * 2;
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);
        const channels = [];
        let offset = 0;
        let pos = 0;

        // Write WAV header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numOfChan, true);
        view.setUint32(24, audioBuffer.sampleRate, true);
        view.setUint32(28, audioBuffer.sampleRate * 2, true);
        view.setUint16(32, numOfChan * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, length, true);

        // Write PCM data
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }

        while (pos < audioBuffer.length) {
            for (let i = 0; i < numOfChan; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][pos]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                view.setInt16(44 + offset, sample, true);
                offset += 2;
            }
            pos++;
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            micButton.style.backgroundColor = '';
        }
    }

    // Function to generate a 10-digit random number
    function generateSenderId() {
        // Generate a number between 1000000000 and 9999999999
        return Math.floor(1000000000 + Math.random() * 9000000000);
    }

    // Function to get or create sender ID for the session
    function getSessionSenderId() {
        let senderId = sessionStorage.getItem('chatSenderId');
        if (!senderId) {
            senderId = generateSenderId().toString();
            sessionStorage.setItem('chatSenderId', senderId);
        }
        return senderId;
    }

    async function sendMessage(transcription = null) {
        const message = inputField.value.trim() || transcription;
        console.log("message:", message);
        if (!message) return; // Exit if message is empty

        inputField.value = ''; // Clear input right away
        addMessage('User', message);

        try {
            // Get the session sender ID
            const senderId = getSessionSenderId();
            console.log('random number:', senderId);

            // Send the chat message
            const chatResponse = await fetch(`http://127.0.0.1:8000/api/assistant/widget/message/${companyId}`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin, // here we set the origin to the current window location
                },
                //credentials: 'include',
                mode: 'cors',
                body: JSON.stringify({
                    "sender": senderId,
                    "content": message
                })
            });

            if (!chatResponse.ok) {
                const errorText = await chatResponse.text();
                console.error('Chat request failed:', errorText);
                throw new Error(`HTTP error! status: ${chatResponse.status}`);
            }

            const chatData = await chatResponse.json();
            const botMessage = chatData.reply.response;

            // Send the chat message to the TTS server
            const ttsResponse = await fetch('http://localhost:5000/talk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: botMessage }),
                mode: 'cors',
            });

            const ttsData = await ttsResponse.json();

            // Create message content
            const messageContent = document.createElement('div');

            // Add text
            const textDiv = document.createElement('div');
            textDiv.className = 'message-text';
            textDiv.textContent = botMessage;
            messageContent.appendChild(textDiv);

            // Add audio player
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = `data:audio/mp3;base64,${ttsData.audio}`;
            messageContent.appendChild(audio);

            addMessage('Bot', messageContent);

        } catch (error) {
            console.error('Error:', error);
            addMessage('Bot', 'Sorry, there was an error processing your request.');
        }
    }

    // function addMessage(sender, message) {
    //     var messageElement = document.createElement('div');
    //     messageElement.innerHTML = '<strong>' + sender + ':</strong> ' + message;
    //     messageElement.style.marginBottom = '10px';
    //     chatMessages.appendChild(messageElement);
    //     chatMessages.scrollTop = chatMessages.scrollHeight;
    // }

    function addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender.toLowerCase()}-message`;
        if (content instanceof HTMLElement) {
            messageDiv.innerHTML = '<strong>' + sender + ':</strong> ';
            const textDiv = document.createElement('div');
            messageDiv.appendChild(content);
        } else {
            messageDiv.innerHTML = '<strong>' + sender + ': </strong>' + content;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
})();