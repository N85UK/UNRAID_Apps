document.addEventListener('DOMContentLoaded', () => {
  const readyEl = document.getElementById('ready-status');
  const awsEl = document.getElementById('aws-probe');
  const qDepthEl = document.getElementById('queue-depth');
  const qTableBody = document.querySelector('#queue-table tbody');
  const mpsList = document.getElementById('mps-list');
  const mpsForm = document.getElementById('mps-form');
  const mpsOrigin = document.getElementById('mps-origin');
  const mpsValue = document.getElementById('mps-value');
  const mpsStatus = document.getElementById('mps-status');

  function fmtTs(ms) { try { return new Date(ms).toLocaleString(); } catch (e) { return String(ms); } }

  async function refreshQueue() {
    try {
      const res = await fetch('/api/queue');
      const json = await res.json();
      if (!json.ok) return;
      const stats = json.stats || {};
      qDepthEl.textContent = String(stats.queueDepth || 0);
      // populate table
      qTableBody.innerHTML = '';
      const items = json.items || [];
      for (const it of items) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${it.id}</td><td>${it.origin || ''}</td><td>${it.phoneNumber || ''}</td><td>${it.attempts || 0}</td><td>${it.nextAttemptAt ? fmtTs(it.nextAttemptAt) : '-'}</td><td>${it.createdAt ? fmtTs(it.createdAt) : '-'}</td><td><button data-id="${it.id}" class="resend">Resend</button></td>`;
        qTableBody.appendChild(tr);
      }
      // wire up resend buttons
      qTableBody.querySelectorAll('button.resend').forEach(b => b.addEventListener('click', async (ev) => {
        const id = ev.currentTarget.getAttribute('data-id');
        try {
          await fetch(`/api/queue/${id}/resend`, { method: 'POST' });
          await refreshQueue();
        } catch (e) { /* ignore */ }
      }));
    } catch (e) { /* ignore */ }
  }

  async function refreshProbeAndMps() {
    try {
      const readyRes = await fetch('/ready');
      const readyJson = await readyRes.json();
      readyEl.textContent = readyJson.ready ? 'OK' : 'Not ready';
    } catch (e) { readyEl.textContent = 'Error'; }
    try {
      const awsRes = await fetch('/probe/aws');
      if (awsRes.ok) {
        const j = await awsRes.json(); awsEl.textContent = `OK — ${j.phoneNumbers || 0} phone numbers`; 
      } else { const j = await awsRes.json(); awsEl.textContent = `Error: ${j.reason || 'unknown'}`; }
    } catch (e) { awsEl.textContent = 'Error'; }
    try {
      const mpsRes = await fetch('/api/settings/mps');
      const jm = await mpsRes.json();
      const overrides = (jm && jm.mps_overrides) || {};
      if (!Object.keys(overrides).length) {
        mpsList.innerHTML = '<div>No overrides set</div>';
      } else {
        mpsList.innerHTML = Object.entries(overrides).map(([k,v]) => `<div><strong>${k}</strong>: ${v} <button data-origin="${k}" class="mps-remove">Remove</button></div>`).join('');
        mpsList.querySelectorAll('button.mps-remove').forEach(btn => btn.addEventListener('click', async (ev) => {
          const origin = ev.currentTarget.getAttribute('data-origin');
          try {
            await fetch(`/api/settings/mps/${encodeURIComponent(origin)}`, { method: 'DELETE' });
            await refreshProbeAndMps();
          } catch (e) { /* ignore */ }
        }));
      }
    } catch (e) { mpsList.textContent = 'Error loading overrides'; }
  }

  mpsForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    mpsStatus.textContent = 'Saving…';
    const origin = mpsOrigin.value.trim();
    const mps = parseFloat(mpsValue.value);
    try {
      const res = await fetch('/api/settings/mps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origin, mps }) });
      const j = await res.json();
      if (res.ok) { mpsStatus.textContent = 'Saved'; await refreshProbeAndMps(); } else { mpsStatus.textContent = `Error: ${j.error || 'unknown'}`; }
    } catch (e) { mpsStatus.textContent = `Error: ${e.message}`; }
  });

  // initial load and polling
  refreshQueue();
  refreshProbeAndMps();
  setInterval(refreshQueue, 5000);
  setInterval(refreshProbeAndMps, 10000);
});
