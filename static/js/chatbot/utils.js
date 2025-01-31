export function generateSenderId() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

export function getSessionSenderId() {
    let senderId = sessionStorage.getItem('chatSenderId');
    if (!senderId) {
        senderId = generateSenderId().toString();
        sessionStorage.setItem('chatSenderId', senderId);
    }
    return senderId;
}