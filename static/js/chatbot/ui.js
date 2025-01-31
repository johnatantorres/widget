export function createChatbox() {
    const chatbox = document.createElement('div');
    chatbox.id = 'chatbot-widget';
    chatbox.style.position = 'fixed';
    chatbox.style.bottom = '65px';
    chatbox.style.right = '20px';
    chatbox.style.width = '350px';
    chatbox.style.height = '500px';
    chatbox.style.zIndex = '9999';
    chatbox.style.display = 'none';
    chatbox.style.transition = 'all 0.3s ease-in-out';

    // ... create and append other UI elements

    document.body.appendChild(chatbox);
    return chatbox;
}

export function toggleChatboxVisibility(chatbox) {
    chatbox.style.display = chatbox.style.display === 'none' ? 'block' : 'none';
}
