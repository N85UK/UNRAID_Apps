// AWS End User Messaging - Client-side JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const smsForm = document.getElementById('smsForm');
    const sendBtn = document.getElementById('sendBtn');
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');

    // Character counter
    messageTextarea.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = `${count}/160 characters`;

        if (count > 160) {
            charCount.style.color = '#dc3545';
        } else {
            charCount.style.color = '#666';
        }
    });

    // Form submission
    smsForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(smsForm);
        const data = {
            originator: formData.get('originator'),
            phoneNumber: formData.get('phoneNumber'),
            message: formData.get('message')
        };

        // Basic validation
        if (!data.originator || !data.phoneNumber || !data.message) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (data.message.length > 160) {
            showMessage('Message must be 160 characters or less', 'error');
            return;
        }

        // Disable button and show loading
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        try {
            const response = await fetch('/send-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showMessage(`SMS sent successfully! Message ID: ${result.messageId}`, 'success');
                smsForm.reset();
                charCount.textContent = '0/160 characters';
                charCount.style.color = '#666';

                // Refresh history
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                showMessage(result.error || 'Failed to send SMS', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Network error. Please try again.', 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send SMS';
        }
    });

    // Utility function to show messages
    function showMessage(text, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;

        // Insert after the form
        smsForm.parentNode.insertBefore(messageDiv, smsForm.nextSibling);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Phone number formatting
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput.addEventListener('input', function() {
        // Remove all non-digit characters except +
        let value = this.value.replace(/[^\d+]/g, '');

        // Ensure it starts with +
        if (value && !value.startsWith('+')) {
            value = '+' + value;
        }

        this.value = value;
    });
});