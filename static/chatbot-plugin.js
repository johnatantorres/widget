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

    // Create chatbox button container
    var buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.bottom = '20px';
    buttonContainer.style.right = '20px';
    buttonContainer.style.zIndex = '10000';

    // Create toggle button (using the original icon)
    var toggleButton = document.createElement('button');
    toggleButton.innerHTML = '<img src="http://localhost:5000/static/images/chatbox-icon.svg" />';
    toggleButton.style.padding = '10px';
    toggleButton.style.background = 'none';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';

    // Add elements to the page
    buttonContainer.appendChild(toggleButton);
    document.body.appendChild(iframe);
    document.body.appendChild(buttonContainer);

    // Hide iframe initially
    iframe.style.display = 'none';

    // Toggle iframe visibility
    toggleButton.addEventListener('click', function() {
        if (iframe.style.display === 'none') {
            iframe.style.display = 'block';
            buttonContainer.style.display = 'none';
        } else {
            iframe.style.display = 'none';
            buttonContainer.style.display = 'block';
        }
    });

    // Create a close button inside the iframe
    iframe.onload = function() {
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        var closeButton = iframeDocument.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.fontSize = '20px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.cursor = 'pointer';
        closeButton.style.color = '#333';
        closeButton.onclick = function() {
            iframe.style.display = 'none';
            buttonContainer.style.display = 'block';
        };
        iframeDocument.body.appendChild(closeButton);
    };
})();