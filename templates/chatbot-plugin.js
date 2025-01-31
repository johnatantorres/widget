(function() {
    // Create iframe element
    var iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:5000/chatbot';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '20px';
    iframe.style.right = '20px';
    iframe.style.width = '350px';
    iframe.style.height = '500px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '10px';
    iframe.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    iframe.style.zIndex = '9999';

    // Create toggle button
    var toggleButton = document.createElement('button');
    toggleButton.innerHTML = 'Chat';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '20px';
    toggleButton.style.right = '20px';
    toggleButton.style.zIndex = '10000';
    toggleButton.style.padding = '10px 20px';
    toggleButton.style.backgroundColor = '#007bff';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.cursor = 'pointer';

    // Add elements to the page
    document.body.appendChild(iframe);
    document.body.appendChild(toggleButton);

    // Hide iframe initially
    iframe.style.display = 'none';

    // Toggle iframe visibility
    toggleButton.addEventListener('click', function() {
        if (iframe.style.display === 'none') {
            iframe.style.display = 'block';
            toggleButton.innerHTML = 'Close';
        } else {
            iframe.style.display = 'none';
            toggleButton.innerHTML = 'Chat';
        }
    });
})();