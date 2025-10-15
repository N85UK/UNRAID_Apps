document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('credentials-form');
  if (form) {
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
  }

  // Dry-run message estimator and submitter
  const dryForm = document.getElementById('dryrun-form');
  const messageBody = document.getElementById('messageBody');
  const charCount = document.getElementById('char-count');
  const partCount = document.getElementById('part-count');
  const encodingEl = document.getElementById('encoding');
  const destInput = document.getElementById('destNumber');
  const dryStatus = document.getElementById('dryrun-status');

  function estimateParts(text) {
    const chars = text.length;
    const isUcs2 = /[^\x00-\x7F]/.test(text);
    const encoding = isUcs2 ? 'UCS-2' : 'GSM-7';
    const singleLimit = isUcs2 ? 70 : 160;
    const perPart = isUcs2 ? 67 : 153;
    const parts = chars <= singleLimit ? 1 : Math.ceil(chars / perPart);
    return { encoding, chars, parts, perPart, singleLimit };
  }

  if (messageBody) {
    const update = () => {
      const est = estimateParts(messageBody.value || '');
      charCount.textContent = String(est.chars);
      partCount.textContent = String(est.parts);
      encodingEl.textContent = est.encoding;
    };
    messageBody.addEventListener('input', update);
    update();
  }

  if (dryForm) {
    dryForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      dryStatus.textContent = 'Running dry-run...';
      const dest = destInput.value.trim();
      const body = messageBody.value || '';
      try {
        const res = await fetch('/api/test/dry-run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ DestinationPhoneNumber: dest, MessageBody: body })
        });
        const json = await res.json();
        if (res.ok) {
          dryStatus.textContent = `DryRun OK — Estimated parts: ${json.estimate.parts} (${json.estimate.encoding})`;
        } else {
          dryStatus.textContent = `DryRun error: ${json.error || 'unknown'}`;
        }
      } catch (err) {
        dryStatus.textContent = `DryRun error: ${err.message}`;
      }
    });
  }
});
