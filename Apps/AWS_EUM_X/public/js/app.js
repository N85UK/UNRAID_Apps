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
});
