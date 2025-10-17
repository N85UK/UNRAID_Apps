document.addEventListener('DOMContentLoaded', () => {
  // Credentials form
  const credForm = document.getElementById('credentials-form');
  const credStatus = document.getElementById('credentials-status');
  const awsAccessKey = document.getElementById('awsAccessKey');
  const awsSecretKey = document.getElementById('awsSecretKey');
  const awsRegion = document.getElementById('awsRegion');
  const saveCredentials = document.getElementById('saveCredentials');

  // Dry-run form
  const dryrunForm = document.getElementById('dryrun-form');
  const dryrunStatus = document.getElementById('dryrun-status');
  const testPhone = document.getElementById('testPhone');
  const testMessage = document.getElementById('testMessage');
  const testCharCount = document.getElementById('test-char-count');

  // Origination numbers
  const fetchOriginsBtn = document.getElementById('fetch-origins');
  const originsList = document.getElementById('origins-list');

  // 2FA elements
  const setup2faBtn = document.getElementById('setup-2fa');
  const disable2faBtn = document.getElementById('disable-2fa');
  const totpSetup = document.getElementById('totp-setup');
  const verify2faBtn = document.getElementById('verify-2fa');
  const verifyCode = document.getElementById('verify-code');
  const twoFaStatus = document.getElementById('2fa-status');

  // Test & save credentials
  if (credForm) {
    credForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      credStatus.textContent = 'Testing credentials...';
      credStatus.style.backgroundColor = '#e3f2fd';
      credStatus.style.color = '#1565c0';

      try {
        const res = await fetch('/api/test/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessKeyId: awsAccessKey.value.trim(),
            secretAccessKey: awsSecretKey.value.trim(),
            region: awsRegion.value.trim(),
            saveCredentials: saveCredentials.checked
          })
        });
        const json = await res.json();

        if (res.ok) {
          credStatus.textContent = `✓ Credentials valid! ${json.phoneNumbers || 0} phone numbers found. ${json.saved ? 'Saved to database.' : ''}`;
          credStatus.style.backgroundColor = '#d4edda';
          credStatus.style.color = '#155724';
          awsSecretKey.value = '';
        } else {
          credStatus.textContent = `✗ Error: ${json.error || 'Invalid credentials'}`;
          credStatus.style.backgroundColor = '#f8d7da';
          credStatus.style.color = '#721c24';
        }
      } catch (e) {
        credStatus.textContent = `✗ Error: ${e.message}`;
        credStatus.style.backgroundColor = '#f8d7da';
        credStatus.style.color = '#721c24';
      }
    });
  }

  // Character counter for dry-run
  if (testMessage && testCharCount) {
    testMessage.addEventListener('input', () => {
      const len = testMessage.value.length;
      const parts = Math.max(1, Math.ceil(len / 160));
      testCharCount.textContent = `${len} characters • ${parts} part${parts > 1 ? 's' : ''} (GSM-7)`;
    });
  }

  // Dry-run test
  if (dryrunForm) {
    dryrunForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      dryrunStatus.textContent = 'Running dry-run...';
      dryrunStatus.style.backgroundColor = '#e3f2fd';
      dryrunStatus.style.color = '#1565c0';

      try {
        const res = await fetch('/api/test/dry-run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            DestinationPhoneNumber: testPhone.value.trim(),
            MessageBody: testMessage.value.trim()
          })
        });
        const json = await res.json();

        if (res.ok) {
          dryrunStatus.textContent = `✓ Dry-run OK — Estimated parts: ${json.parts || 1} (${json.encoding || 'GSM-7'})`;
          dryrunStatus.style.backgroundColor = '#d4edda';
          dryrunStatus.style.color = '#155724';
        } else {
          dryrunStatus.textContent = `✗ Error: ${json.error || 'Dry-run failed'}`;
          dryrunStatus.style.backgroundColor = '#f8d7da';
          dryrunStatus.style.color = '#721c24';
        }
      } catch (e) {
        dryrunStatus.textContent = `✗ Error: ${e.message}`;
        dryrunStatus.style.backgroundColor = '#f8d7da';
        dryrunStatus.style.color = '#721c24';
      }
    });
  }

  // Fetch origination numbers from AWS
  if (fetchOriginsBtn) {
    fetchOriginsBtn.addEventListener('click', async () => {
      originsList.innerHTML = '<p>Loading...</p>';
      
      try {
        const res = await fetch('/api/origination-numbers');
        const json = await res.json();

        if (res.ok && json.numbers && json.numbers.length > 0) {
          originsList.innerHTML = '<h3>Available Numbers:</h3><ul>' +
            json.numbers.map(n => `<li><strong>${n.PhoneNumber}</strong> (${n.Status}) — ${n.PhoneNumberType || 'Unknown'}</li>`).join('') +
            '</ul>';
        } else if (res.ok) {
          originsList.innerHTML = '<p class="text-muted">No origination numbers found in AWS Pinpoint</p>';
        } else {
          originsList.innerHTML = `<p class="text-danger">Error: ${json.error || 'Failed to fetch numbers'}</p>`;
        }
      } catch (e) {
        originsList.innerHTML = `<p class="text-danger">Error: ${e.message}</p>`;
      }
    });
  }

  // Setup 2FA
  if (setup2faBtn && totpSetup) {
    setup2faBtn.addEventListener('click', async () => {
      twoFaStatus.textContent = 'Generating 2FA secret...';
      
      try {
        const res = await fetch('/auth/2fa/setup', { method: 'POST' });
        const json = await res.json();

        if (res.ok) {
          document.getElementById('totp-secret').textContent = json.secret;
          document.getElementById('qr-code').innerHTML = `<img src="${json.qrCode}" alt="QR Code" />`;
          totpSetup.style.display = 'block';
          setup2faBtn.style.display = 'none';
          twoFaStatus.textContent = '';
        } else {
          twoFaStatus.textContent = `Error: ${json.error || 'Failed to setup 2FA'}`;
        }
      } catch (e) {
        twoFaStatus.textContent = `Error: ${e.message}`;
      }
    });
  }

  // Verify and enable 2FA
  if (verify2faBtn) {
    verify2faBtn.addEventListener('click', async () => {
      const code = verifyCode.value.trim();
      if (!code || code.length !== 6) {
        twoFaStatus.textContent = 'Please enter a 6-digit code';
        return;
      }

      try {
        const res = await fetch('/auth/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: code })
        });
        const json = await res.json();

        if (res.ok) {
          twoFaStatus.textContent = '✓ 2FA enabled successfully! Reloading...';
          twoFaStatus.style.backgroundColor = '#d4edda';
          twoFaStatus.style.color = '#155724';
          setTimeout(() => window.location.reload(), 2000);
        } else {
          twoFaStatus.textContent = `✗ Error: ${json.error || 'Invalid code'}`;
          twoFaStatus.style.backgroundColor = '#f8d7da';
          twoFaStatus.style.color = '#721c24';
        }
      } catch (e) {
        twoFaStatus.textContent = `✗ Error: ${e.message}`;
      }
    });
  }

  // Disable 2FA
  if (disable2faBtn) {
    disable2faBtn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to disable 2FA? This will reduce security.')) return;

      try {
        const res = await fetch('/auth/2fa/disable', { method: 'POST' });
        const json = await res.json();

        if (res.ok) {
          twoFaStatus.textContent = '✓ 2FA disabled. Reloading...';
          setTimeout(() => window.location.reload(), 2000);
        } else {
          twoFaStatus.textContent = `Error: ${json.error || 'Failed to disable 2FA'}`;
        }
      } catch (e) {
        twoFaStatus.textContent = `Error: ${e.message}`;
      }
    });
  }
});
