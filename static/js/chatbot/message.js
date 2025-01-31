export function addMessage(sender, content) {
    const chatMessages = document.querySelector('.chatbox__messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender.toLowerCase()}-message`;

    if (content instanceof HTMLElement) {
        messageDiv.innerHTML = '<strong>' + sender + ':</strong> ';
        messageDiv.appendChild(content);
    } else {
        messageDiv.innerHTML = '<strong>' + sender + ': </strong>' + content;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}