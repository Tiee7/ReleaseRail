export const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0c0e0d" />
    <title>ReleaseRail — Audit Console</title>
    <link rel="stylesheet" href="/assets/app.css" />
  </head>
  <body>
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/" aria-label="ReleaseRail home">
          <span class="brand-mark" aria-hidden="true">R</span>
          <span class="brand-copy"><strong>ReleaseRail</strong><small>LOCAL AUDIT CONSOLE</small></span>
        </a>
        <div class="topbar-actions">
          <span class="readonly"><span class="status-dot"></span> READ ONLY</span>
          <button class="refresh-button" id="refresh" type="button">Refresh <span class="shortcut">⌘ R</span></button>
        </div>
      </header>

      <main>
        <section class="intro">
          <div class="intro-copy">
            <p class="eyebrow">RELEASE EVIDENCE → PAYOUT PROOF</p>
            <h1>Ship the release.<br /><em>Verify the payout.</em></h1>
            <p class="lede">A local, read-only view of the evidence chain from GitHub contribution to KeeperHub execution and on-chain receipt.</p>
          </div>
          <div class="intro-aside">
            <span class="aside-label">CONTROL PLANE</span>
            <strong>Human approval stays<br />in the loop.</strong>
            <span class="aside-line"></span>
            <span class="aside-meta">No private keys<br />No silent broadcasts</span>
          </div>
        </section>

        <section class="metrics" id="metrics" aria-label="Payout summary">
          <div class="metric"><span class="metric-label">TOTAL INTENTS</span><strong data-metric="total">—</strong><span class="metric-note">tracked locally</span></div>
          <div class="metric"><span class="metric-label">SETTLED</span><strong class="metric-green" data-metric="settled">—</strong><span class="metric-note">state reached</span></div>
          <div class="metric"><span class="metric-label">RECEIPTS VERIFIED</span><strong class="metric-green" data-metric="verified">—</strong><span class="metric-note">independent RPC check</span></div>
          <div class="metric"><span class="metric-label">NEEDS ATTENTION</span><strong class="metric-warn" data-metric="attention">—</strong><span class="metric-note">pending or blocked</span></div>
        </section>

        <section class="console-grid">
          <div class="list-column">
            <div class="section-heading"><div><p class="eyebrow">RELEASE LEDGER</p><h2>All verified versions</h2></div><span class="updated" id="updated">Waiting for state…</span></div>
            <div class="payout-list" id="payout-list" aria-live="polite"><div class="loading-row"><span></span><span></span><span></span></div><div class="loading-row"><span></span><span></span><span></span></div></div>
          </div>
          <aside class="detail-column" id="detail-column" aria-live="polite">
            <div class="detail-empty"><span class="empty-mark">＋</span><h3>Select an intent</h3><p>Choose a payout from the ledger to inspect its evidence and settlement proof.</p></div>
          </aside>
        </section>
      </main>

      <footer class="footer"><span>ReleaseRail / evidence-first payout rail</span><span id="connection">CONNECTING</span></footer>
    </div>
    <script type="module" src="/assets/app.js"></script>
  </body>
</html>`

export const css = `:root {
  color-scheme: dark;
  --bg: #0c0e0d;
  --panel: #121614;
  --panel-raised: #171c19;
  --line: #28302b;
  --line-soft: #1e2521;
  --text: #e8eee9;
  --muted: #8c9990;
  --faint: #536058;
  --green: #b7f36b;
  --green-deep: #6ca83a;
  --warn: #f3be68;
  --danger: #ee8b7e;
  --radius: 14px;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }
html { background: var(--bg); }
body { margin: 0; min-width: 320px; background: var(--bg); color: var(--text); }
button, a { font: inherit; }
a { color: inherit; }
.shell { min-height: 100dvh; max-width: 1480px; margin: 0 auto; padding: 0 44px 28px; }
.topbar { min-height: 76px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line-soft); }
.brand { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; }
.brand-mark { display: grid; place-items: center; width: 31px; height: 31px; border: 1px solid var(--green); color: var(--green); border-radius: 9px; font: 700 16px/1 ui-monospace, SFMono-Regular, Menlo, monospace; }
.brand-copy { display: grid; gap: 3px; }
.brand-copy strong { font-size: 15px; letter-spacing: -.02em; }
.brand-copy small, .eyebrow, .metric-label, .aside-label, .readonly, .footer, .detail-label { color: var(--muted); font: 600 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .13em; }
.brand-copy small { color: var(--faint); font-size: 8px; letter-spacing: .16em; }
.topbar-actions { display: flex; align-items: center; gap: 18px; }
.readonly { display: inline-flex; align-items: center; gap: 8px; color: var(--green); }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 4px #b7f36b18; }
.refresh-button { border: 1px solid var(--line); background: transparent; color: var(--text); border-radius: 8px; padding: 9px 11px; cursor: pointer; font-size: 12px; transition: border-color .18s, background .18s, transform .18s; }
.refresh-button:hover { border-color: var(--green-deep); background: var(--panel); }
.refresh-button:active { transform: translateY(1px); }
.shortcut { color: var(--faint); margin-left: 10px; font: 10px ui-monospace, SFMono-Regular, Menlo, monospace; }
.intro { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 64px; padding: 78px 0 68px; }
.eyebrow { margin: 0 0 18px; color: var(--green); }
h1, h2, h3, p { margin-top: 0; }
h1 { max-width: 730px; margin-bottom: 22px; font-size: clamp(44px, 6vw, 82px); line-height: .98; letter-spacing: -.065em; font-weight: 600; }
h1 em { color: var(--green); font-style: normal; }
.lede { max-width: 560px; margin-bottom: 0; color: var(--muted); font-size: 16px; line-height: 1.65; }
.intro-aside { align-self: end; display: grid; gap: 14px; padding: 18px 0 0 20px; border-left: 1px solid var(--line); }
.aside-label { color: var(--faint); }
.intro-aside strong { font-size: 17px; line-height: 1.35; font-weight: 500; }
.aside-line { display: block; width: 48px; height: 1px; background: var(--green); }
.aside-meta { color: var(--muted); font: 12px/1.65 ui-monospace, SFMono-Regular, Menlo, monospace; }
.metrics { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.metric { min-height: 130px; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 18px 22px; border-right: 1px solid var(--line); }
.metric:first-child { padding-left: 0; }
.metric:last-child { border-right: 0; }
.metric-label { color: var(--faint); }
.metric strong { font-size: 34px; line-height: 1; letter-spacing: -.05em; font-weight: 500; }
.metric-green { color: var(--green); }
.metric-warn { color: var(--warn); }
.metric-note { color: var(--muted); font-size: 12px; }
.console-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(360px, .95fr); gap: 28px; padding-top: 62px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
.section-heading .eyebrow { margin-bottom: 10px; color: var(--faint); }
h2 { margin-bottom: 0; font-size: 27px; letter-spacing: -.04em; font-weight: 500; }
.updated { color: var(--faint); font: 10px ui-monospace, SFMono-Regular, Menlo, monospace; }
.payout-list { display: grid; gap: 8px; }
.payout-row { width: 100%; display: grid; grid-template-columns: 8px minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 17px 18px; border: 1px solid var(--line-soft); border-radius: var(--radius); background: var(--panel); color: var(--text); text-align: left; cursor: pointer; transition: border-color .18s, background .18s, transform .18s; }
.payout-row:hover { border-color: #405046; background: var(--panel-raised); }
.payout-row:active { transform: translateY(1px); }
.payout-row.selected { border-color: var(--green-deep); background: #171e17; }
.row-status { width: 8px; height: 8px; border-radius: 50%; background: var(--faint); }
.row-status.settled { background: var(--green); box-shadow: 0 0 0 4px #b7f36b12; }
.row-status.blocked { background: var(--danger); }
.row-status.pending { background: var(--warn); }
.row-status.ready { background: transparent; border: 1px solid var(--green); }
.row-main { min-width: 0; display: grid; gap: 7px; }
.row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 500; }
.row-meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted); font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; }
.row-right { display: grid; gap: 7px; justify-items: end; }
.row-amount { font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; }
.row-status-label { color: var(--muted); font: 10px ui-monospace, SFMono-Regular, Menlo, monospace; text-transform: uppercase; letter-spacing: .08em; }
.detail-column { min-height: 480px; padding: 26px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); }
.detail-empty { min-height: 420px; display: grid; align-content: center; justify-items: start; gap: 13px; padding: 26px; }
.empty-mark { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid var(--line); border-radius: 50%; color: var(--green); font-size: 25px; font-weight: 300; }
.detail-empty h3 { margin-bottom: -4px; font-size: 20px; font-weight: 500; }
.detail-empty p { max-width: 260px; margin-bottom: 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
.detail-header { display: flex; justify-content: space-between; gap: 16px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
.detail-header h3 { margin: 7px 0 0; font-size: 21px; font-weight: 500; letter-spacing: -.03em; }
.detail-status { align-self: start; padding: 6px 8px; border-radius: 5px; background: #b7f36b16; color: var(--green); font: 10px ui-monospace, SFMono-Regular, Menlo, monospace; text-transform: uppercase; letter-spacing: .09em; }
.detail-status.blocked { color: var(--danger); background: #ee8b7e15; }
.detail-status.pending { color: var(--warn); background: #f3be6815; }
.detail-status.ready { color: var(--green); background: #b7f36b12; }
.detail-section { padding: 20px 0; border-bottom: 1px solid var(--line-soft); }
.detail-section:last-child { border-bottom: 0; padding-bottom: 0; }
.detail-label { display: block; margin-bottom: 10px; color: var(--faint); }
.detail-value { margin: 0; font-size: 13px; line-height: 1.55; }
.mono { overflow-wrap: anywhere; color: #c4d1c7; font: 11px/1.65 ui-monospace, SFMono-Regular, Menlo, monospace; }
.detail-links { display: flex; flex-wrap: wrap; gap: 8px; }
.detail-link { display: inline-flex; align-items: center; gap: 6px; color: var(--green); font-size: 12px; text-decoration: none; }
.detail-link:hover { text-decoration: underline; }
.control-box { display: grid; gap: 14px; padding-top: 20px; }
.control-copy { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.55; }
.action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.action-button { min-height: 38px; border: 1px solid var(--line); border-radius: 8px; background: #1a211c; color: var(--text); cursor: pointer; font-size: 11px; transition: border-color .18s, background .18s, transform .18s; }
.action-button:hover:not(:disabled) { border-color: var(--green-deep); background: #223021; }
.action-button:active:not(:disabled) { transform: translateY(1px); }
.action-button.primary { border-color: var(--green-deep); color: var(--green); }
.action-button:disabled { cursor: not-allowed; opacity: .38; }
.confirm-line { display: flex; align-items: flex-start; gap: 8px; color: var(--muted); font-size: 11px; line-height: 1.45; }
.confirm-line input { accent-color: var(--green); margin-top: 2px; }
.action-message { min-height: 16px; margin: 0; color: var(--green); font: 11px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace; }
.action-message.error { color: var(--danger); }
.source-note { margin: 7px 0 0; color: var(--faint); font-size: 11px; line-height: 1.5; }
.prepare-box { display: grid; gap: 9px; padding-top: 20px; }
.prepare-box .detail-label { margin-bottom: 2px; }
.field-label { margin-top: 5px; color: var(--faint); font: 600 9px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .13em; }
.field-control { width: 100%; min-height: 38px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 8px; background: #0f1310; color: var(--text); outline: none; font-size: 12px; }
.field-control:focus { border-color: var(--green-deep); box-shadow: 0 0 0 3px #b7f36b16; }
.field-control[readonly] { color: var(--muted); }
.proof-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.proof-cell { display: grid; gap: 6px; }
.proof-cell .detail-label { margin-bottom: 0; }
.proof-value { color: var(--text); font-size: 13px; }
.proof-value.good { color: var(--green); }
.proof-value.warn { color: var(--warn); }
.loading-row { height: 76px; display: grid; align-content: center; gap: 8px; padding: 17px 18px; border: 1px solid var(--line-soft); border-radius: var(--radius); background: var(--panel); }
.loading-row span { display: block; height: 8px; width: 60%; border-radius: 4px; background: #222b25; animation: pulse 1.4s ease-in-out infinite; }
.loading-row span:nth-child(2) { width: 38%; animation-delay: .12s; }
.loading-row span:nth-child(3) { width: 22%; animation-delay: .24s; }
@keyframes pulse { 50% { opacity: .38; } }
.empty-list { padding: 44px 20px; border: 1px dashed var(--line); border-radius: var(--radius); color: var(--muted); text-align: center; font-size: 13px; line-height: 1.6; }
.error-banner { padding: 15px 17px; border: 1px solid #ee8b7e55; border-radius: var(--radius); background: #ee8b7e0d; color: var(--danger); font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
.footer { display: flex; justify-content: space-between; gap: 20px; padding-top: 40px; color: var(--faint); letter-spacing: .06em; }
#connection { color: var(--green); }
#connection.error { color: var(--danger); }
@media (max-width: 860px) {
  .shell { padding: 0 22px 22px; }
  .intro { grid-template-columns: 1fr; gap: 34px; padding: 56px 0 48px; }
  .intro-aside { max-width: 320px; }
  .metrics { grid-template-columns: repeat(2, 1fr); }
  .metric:nth-child(2) { border-right: 0; }
  .metric:nth-child(-n+2) { border-bottom: 1px solid var(--line); }
  .console-grid { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .topbar { min-height: 68px; }
  .topbar-actions { gap: 9px; }
  .readonly { font-size: 0; }
  .readonly .status-dot { width: 8px; height: 8px; }
  .shortcut { display: none; }
  h1 { font-size: 48px; }
  .lede { font-size: 14px; }
  .metric { min-height: 110px; padding: 15px 13px; }
  .metric:first-child { padding-left: 0; }
  .metric strong { font-size: 28px; }
  .console-grid { padding-top: 48px; }
  .section-heading { display: grid; gap: 9px; }
  .payout-row { grid-template-columns: 8px minmax(0, 1fr); }
  .row-right { display: none; }
  .detail-column { padding: 18px; }
  .proof-grid { grid-template-columns: 1fr; }
  .action-grid { grid-template-columns: 1fr; }
  .footer { display: grid; gap: 8px; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
`

export const javascript = `const state = { snapshot: null, selectedId: window.location.hash.slice(1) || null }

const $ = (selector) => document.querySelector(selector)
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character])
const short = (value, start = 10, end = 8) => value.length > start + end + 3 ? value.slice(0, start) + '…' + value.slice(-end) : value
const date = (value) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
const amount = (baseUnits) => { try { const value = BigInt(baseUnits); const whole = value / 1000000000000000000n; const fraction = (value % 1000000000000000000n).toString().padStart(18, '0').replace(/0+$/, ''); return fraction ? whole + '.' + fraction.slice(0, 6) + ' ETH' : whole + ' ETH' } catch { return baseUnits + ' wei' } }
const statusClass = (status) => status === 'settled' ? 'settled' : status === 'blocked' ? 'blocked' : status === 'ready' ? 'ready' : 'pending'
const statusLabel = (status) => status === 'settled' ? 'SETTLED' : status === 'blocked' ? 'BLOCKED' : status.toUpperCase()

function renderMetrics(summary) {
  document.querySelector('[data-metric="total"]').textContent = summary.total
  document.querySelector('[data-metric="settled"]').textContent = summary.settled
  document.querySelector('[data-metric="verified"]').textContent = summary.verified
  document.querySelector('[data-metric="attention"]').textContent = summary.pending + summary.blocked
}

function renderList(releases) {
  const list = $('#payout-list')
  if (releases.length === 0) { list.innerHTML = '<div class="empty-list">No verified releases yet.<br />Run release_candidate through the CLI or MCP server.</div>'; return }
  list.innerHTML = releases.map((release) => {
    const intent = release.payout?.intent
    const selected = state.selectedId === release.candidate.candidateId || (intent && state.selectedId === intent.intentId) ? ' selected' : ''
    const status = intent?.status || 'ready'
    return '<button class="payout-row' + selected + '" data-release="' + escapeHtml(release.candidate.candidateId) + '" type="button">' +
      '<span class="row-status ' + statusClass(status) + '"></span>' +
      '<span class="row-main"><span class="row-title">' + escapeHtml(release.candidate.repository) + '</span><span class="row-meta">' + escapeHtml(release.candidate.tag) + ' · ' + escapeHtml(short(release.candidate.candidateId, 14, 7)) + '</span></span>' +
      '<span class="row-right"><span class="row-amount">' + escapeHtml(intent ? amount(intent.amountBaseUnits) : 'NOT PREPARED') + '</span><span class="row-status-label">' + (intent ? statusLabel(status) : 'READY') + '</span></span>' +
      '</button>'
  }).join('')
  document.querySelectorAll('[data-release]').forEach((button) => button.addEventListener('click', () => { state.selectedId = button.dataset.release; history.replaceState(null, '', '#' + state.selectedId); render() }))
}

function matchingPolicy(release) {
  return state.snapshot.policies.find((policy) => policy.recipients[release.candidate.expectedContributor]) || null
}

function recipientFor(policy, release) {
  return policy?.recipients[release.candidate.expectedContributor] || 'No allowlisted recipient'
}

function renderPrepareDetail(release) {
  const panel = $('#detail-column')
  const policy = matchingPolicy(release)
  const options = state.snapshot.policies.map((entry) => '<option value="' + escapeHtml(entry.policyId) + '"' + (policy?.policyId === entry.policyId ? ' selected' : '') + '>' + escapeHtml(entry.policyId) + ' · Base ' + escapeHtml(String(entry.chainId)) + '</option>').join('')
  panel.innerHTML = '<div class="detail-header"><div><span class="detail-label">HISTORICAL RELEASE</span><h3>' + escapeHtml(release.candidate.tag) + '</h3></div><span class="detail-status ready">READY</span></div>' +
    '<div class="detail-section"><span class="detail-label">RELEASE EVIDENCE</span><p class="detail-value">' + escapeHtml(release.candidate.repository) + '</p><div class="detail-links"><a class="detail-link" href="' + escapeHtml(release.candidate.releaseUrl) + '" target="_blank" rel="noopener noreferrer">GitHub release ↗</a><a class="detail-link" href="' + escapeHtml(release.candidate.commitUrl) + '" target="_blank" rel="noopener noreferrer">Contribution ↗</a></div></div>' +
    '<div class="detail-section"><span class="detail-label">EVIDENCE HASH</span><p class="detail-value mono">' + escapeHtml(release.candidate.evidenceHash) + '</p></div>' +
    '<div class="prepare-box"><span class="detail-label">PREPARE PAYOUT</span><p class="control-copy">Create one deterministic intent for this release. The recipient is resolved from the selected policy allowlist.</p>' +
    (policy ? '<label class="field-label" for="prepare-policy">POLICY</label><select class="field-control" id="prepare-policy">' + options + '</select><label class="field-label" for="prepare-recipient">RECIPIENT ACCOUNT</label><input class="field-control mono" id="prepare-recipient" value="' + escapeHtml(recipientFor(policy, release)) + '" readonly /><label class="field-label" for="prepare-amount">AMOUNT (BASE UNITS)</label><input class="field-control mono" id="prepare-amount" inputmode="numeric" value="1000000" /><label class="field-label" for="prepare-reason">REASON</label><input class="field-control" id="prepare-reason" value="Contribution shipped in ' + escapeHtml(release.candidate.tag) + '" /><button class="action-button primary" data-action="prepare" type="button">Prepare payout</button><p class="action-message" id="prepare-message"></p>' : '<p class="action-message error">No policy allowlists this contributor yet.</p>') + '</div>'
  const policySelect = panel.querySelector('#prepare-policy')
  policySelect?.addEventListener('change', () => { const nextPolicy = state.snapshot.policies.find((entry) => entry.policyId === policySelect.value); const recipient = panel.querySelector('#prepare-recipient'); if (recipient) recipient.value = recipientFor(nextPolicy, release) })
  panel.querySelector('[data-action="prepare"]')?.addEventListener('click', (button) => triggerPrepare(release, button))
}

async function triggerPrepare(release, button) {
  const message = $('#prepare-message')
  const policy = state.snapshot.policies.find((entry) => entry.policyId === $('#prepare-policy').value)
  const recipient = recipientFor(policy, release)
  const amountValue = $('#prepare-amount').value.trim()
  const reason = $('#prepare-reason').value.trim()
  if (!policy || recipient === 'No allowlisted recipient') { message.textContent = 'Select a policy that allowlists this contributor.'; message.classList.add('error'); return }
  if (!amountValue || !reason) { message.textContent = 'Amount and reason are required.'; message.classList.add('error'); return }
  button.disabled = true
  message.classList.remove('error')
  message.textContent = 'Creating deterministic intent…'
  try {
    const response = await fetch('/api/candidates/' + encodeURIComponent(release.candidate.candidateId) + '/prepare', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-ReleaseRail-Action': 'confirm' }, body: JSON.stringify({ policyId: policy.policyId, recipientAddress: recipient, amountBaseUnits: amountValue, reason }) })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'prepare failed')
    state.selectedId = release.candidate.candidateId
    await load()
  } catch (error) {
    message.classList.add('error')
    message.textContent = error instanceof Error ? error.message : 'prepare failed'
    button.disabled = false
  }
}

function renderActions(payout) {
  const intent = payout.intent
  if (intent.status === 'settled') return '<div class="control-box"><span class="detail-label">CONTROLLED ACTION</span><p class="control-copy">Settlement is final. Replaying this intent reuses its existing execution identity and cannot create a second transfer.</p><p class="action-message">SETTLED · NO SECOND PAYMENT</p></div>'
  if (intent.status === 'blocked') return '<div class="control-box"><span class="detail-label">CONTROLLED ACTION</span><p class="control-copy">This intent is blocked. Resolve the recorded reason or reconcile the existing execution; do not create a new payment.</p></div>'
  const approveDisabled = intent.status !== 'prepared' ? ' disabled' : ''
  const simulateDisabled = intent.status !== 'approved' ? ' disabled' : ''
  const executeDisabled = intent.status !== 'simulated' ? ' disabled' : ''
  const confirmation = intent.status === 'simulated' ? '<label class="confirm-line"><input id="confirm-payment" type="checkbox" /> I reviewed the canonical hash and approve this KeeperHub broadcast.</label>' : ''
  return '<div class="control-box"><span class="detail-label">CONTROLLED ACTION</span><p class="control-copy">Actions are state-gated. The final payment stays behind an explicit confirmation and uses the stored canonical hash.</p><div class="action-grid"><button class="action-button" data-action="approve" type="button"' + approveDisabled + '>Approve hash</button><button class="action-button" data-action="simulate" type="button"' + simulateDisabled + '>Simulate</button><button class="action-button primary" data-action="execute" type="button"' + executeDisabled + '>Pay via KeeperHub</button></div>' + confirmation + '<p class="action-message" id="action-message"></p></div>'
}

async function triggerAction(action, payout, button) {
  const intent = payout.intent
  const message = $('#action-message')
  if (action === 'execute') {
    if (!$('#confirm-payment')?.checked) { message.textContent = 'Check the confirmation box after reviewing the hash.'; message.classList.add('error'); return }
    if (!window.confirm('KeeperHub will broadcast this payout using the approved canonical hash. Continue?')) return
  }
  button.disabled = true
  message.classList.remove('error')
  message.textContent = action === 'execute' ? 'Requesting KeeperHub…' : action === 'simulate' ? 'Simulating without broadcast…' : 'Recording approval…'
  const body = action === 'simulate' ? {} : { expectedIntentHash: intent.canonicalPayloadHash }
  try {
    const response = await fetch('/api/payouts/' + encodeURIComponent(intent.intentId) + '/' + action, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-ReleaseRail-Action': 'confirm' }, body: JSON.stringify(body) })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'action failed')
    await load()
  } catch (error) {
    message.classList.add('error')
    message.textContent = error instanceof Error ? error.message : 'action failed'
    button.disabled = false
  }
}

function renderDetail(payout) {
  const panel = $('#detail-column')
  if (!payout) { panel.innerHTML = '<div class="detail-empty"><span class="empty-mark">＋</span><h3>Select an intent</h3><p>Choose a payout from the ledger to inspect its evidence and settlement proof.</p></div>'; return }
  const intent = payout.intent
  const proof = payout.proof
  const candidate = payout.candidate
  const txLink = proof?.transactionLink || intent.transactionLink
  const txHash = proof?.transactionHash || intent.transactionHash
  const sourceAddress = proof?.sourceAddress
  const verified = proof?.receiptVerified === true
  panel.innerHTML = '<div class="detail-header"><div><span class="detail-label">SELECTED INTENT</span><h3>' + escapeHtml(short(intent.intentId, 18, 8)) + '</h3></div><span class="detail-status ' + statusClass(intent.status) + '">' + statusLabel(intent.status) + '</span></div>' +
    '<div class="detail-section"><span class="detail-label">RELEASE EVIDENCE</span><p class="detail-value">' + escapeHtml(candidate?.repository || 'Candidate unavailable') + ' · ' + escapeHtml(candidate?.tag || '—') + '</p><div class="detail-links">' + (candidate?.releaseUrl ? '<a class="detail-link" href="' + escapeHtml(candidate.releaseUrl) + '" target="_blank" rel="noopener noreferrer">GitHub release ↗</a>' : '') + (candidate?.commitUrl ? '<a class="detail-link" href="' + escapeHtml(candidate.commitUrl) + '" target="_blank" rel="noopener noreferrer">Contribution ↗</a>' : '') + '</div></div>' +
    '<div class="detail-section"><span class="detail-label">CANONICAL PAYLOAD HASH</span><p class="detail-value mono">' + escapeHtml(intent.canonicalPayloadHash) + '</p></div>' +
    '<div class="detail-section proof-grid"><div class="proof-cell"><span class="detail-label">CHAIN</span><span class="proof-value">Base ' + escapeHtml(String(intent.chainId)) + '</span></div><div class="proof-cell"><span class="detail-label">AMOUNT</span><span class="proof-value">' + escapeHtml(amount(intent.amountBaseUnits)) + '</span></div><div class="proof-cell"><span class="detail-label">SOURCE ACCOUNT</span><span class="proof-value mono">' + escapeHtml(sourceAddress ? short(sourceAddress, 10, 8) : 'KeeperHub org signer') + '</span></div><div class="proof-cell"><span class="detail-label">RECIPIENT ACCOUNT</span><span class="proof-value mono">' + escapeHtml(short(intent.recipientAddress, 10, 8)) + '</span></div><div class="proof-cell"><span class="detail-label">RECEIPT</span><span class="proof-value ' + (verified ? 'good' : 'warn') + '">' + (verified ? 'VERIFIED' : 'NOT VERIFIED') + '</span></div><div class="proof-cell"><span class="detail-label">UPDATED</span><span class="proof-value">' + escapeHtml(date(intent.updatedAt)) + '</span></div></div>' +
    '<div class="detail-section"><span class="detail-label">KEEPERHUB EXECUTION</span><p class="detail-value mono">' + escapeHtml(intent.executionId || 'Not executed') + '</p>' + (txHash ? '<p class="detail-value mono">' + escapeHtml(short(txHash, 18, 10)) + '</p>' : '') + (txLink ? '<div class="detail-links"><a class="detail-link" href="' + escapeHtml(txLink) + '" target="_blank" rel="noopener noreferrer">Open BaseScan transaction ↗</a></div>' : '') + '</div>' +
    '<div class="detail-section"><span class="detail-label">AUDIT NOTE</span><p class="detail-value">' + (proof?.duplicateReplay ? 'Idempotent replay confirmed — no second transfer was broadcast.' : verified ? 'Independent receipt verification matched the expected recipient and amount.' : escapeHtml(intent.blockedReason || 'Awaiting the next controlled state transition.')) + '</p></div>' + renderActions(payout)
  panel.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => triggerAction(button.dataset.action, payout, button)))
}

function render() {
  if (!state.snapshot) return
  renderMetrics(state.snapshot.summary)
  renderList(state.snapshot.releases)
  const selected = state.snapshot.releases.find((release) => release.candidate.candidateId === state.selectedId || release.payout?.intent.intentId === state.selectedId) || state.snapshot.releases[0]
  if (selected && state.selectedId !== selected.candidate.candidateId && state.selectedId !== selected.payout?.intent.intentId) state.selectedId = selected.candidate.candidateId
  if (selected?.payout) renderDetail(selected.payout)
  else if (selected) renderPrepareDetail(selected)
  $('#updated').textContent = 'Updated ' + date(state.snapshot.generatedAt)
}

async function load() {
  const connection = $('#connection')
  try {
    const response = await fetch('/api/dashboard', { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error('dashboard returned ' + response.status)
    state.snapshot = await response.json()
    connection.textContent = 'LIVE · AUTO REFRESH 10S'
    connection.classList.remove('error')
    render()
  } catch (error) {
    connection.textContent = 'OFFLINE'
    connection.classList.add('error')
    $('#payout-list').innerHTML = '<div class="error-banner">Unable to load local state. Start the Web console from the ReleaseRail project root and check the terminal for details.</div>'
  }
}

$('#refresh').addEventListener('click', load)
window.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'r') { event.preventDefault(); load() } })
load()
setInterval(load, 10000)
`
