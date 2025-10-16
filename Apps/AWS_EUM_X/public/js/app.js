document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('credentials-form');
  if (!form) return;

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const accessKey = document.getElementById('awsAccessKey').value.trim();
    const secretKey = document.getElementById('awsSecretKey').value.trim();
    const region = document.getElementById('awsRegion').value.trim() || 'eu-west-2';

    const status = document.getElementById('test-status');
    status.textContent = 'Testing...';

    try {
      const res = await fetch('/api/test/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKeyId: accessKey, secretAccessKey: secretKey, region })
      });
      const json = await res.json();
      if (res.ok) {
        status.textContent = `OK — ${json.phoneNumbers || 0} phone numbers visible`;
      } else {
        status.textContent = `Error: ${json.error || 'unknown'}`;
      }
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
    }
  });

  // Test message form (Dry-run)
  const testForm = document.getElementById('test-message-form');
  if (testForm) {
    testForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const dest = document.getElementById('testDestination').value.trim();
      const body = document.getElementById('testMessage').value.trim();
      const status = document.getElementById('test-message-status');
      status.textContent = 'Running dry-run...';

      const e164 = /^\+[1-9]\d{6,14}$/;
      if (!e164.test(dest)) {
        status.textContent = 'Invalid destination phone number (must be E.164)';
        return;
      }

      try {
        const res = await fetch('/api/test/dry-run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ DestinationPhoneNumber: dest, MessageBody: body })
        });
        const json = await res.json();
        if (res.ok) {
          status.textContent = `Dry-run OK: ${json.message || 'No errors'}`;
        } else {
          status.textContent = `Error: ${json.error || 'unknown'}`;
        }
      } catch (err) {
        status.textContent = `Error: ${err.message}`;
      }
    });
  }
});
