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
            <div class="section-heading"><div><p class="eyebrow">PAYOUT LEDGER</p><h2>Recent intents</h2></div><span class="updated" id="updated">Waiting for state…</span></div>
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
.detail-section { padding: 20px 0; border-bottom: 1px solid var(--line-soft); }
.detail-section:last-child { border-bottom: 0; padding-bottom: 0; }
.detail-label { display: block; margin-bottom: 10px; color: var(--faint); }
.detail-value { margin: 0; font-size: 13px; line-height: 1.55; }
.mono { overflow-wrap: anywhere; color: #c4d1c7; font: 11px/1.65 ui-monospace, SFMono-Regular, Menlo, monospace; }
.detail-links { display: flex; flex-wrap: wrap; gap: 8px; }
.detail-link { display: inline-flex; align-items: center; gap: 6px; color: var(--green); font-size: 12px; text-decoration: none; }
.detail-link:hover { text-decoration: underline; }
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
  .footer { display: grid; gap: 8px; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
`

export const javascript = `const state = { snapshot: null, selectedIntentId: window.location.hash.slice(1) || null }

const $ = (selector) => document.querySelector(selector)
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character])
const short = (value, start = 10, end = 8) => value.length > start + end + 3 ? value.slice(0, start) + '…' + value.slice(-end) : value
const date = (value) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
const amount = (baseUnits) => { try { const value = BigInt(baseUnits); const whole = value / 1000000000000000000n; const fraction = (value % 1000000000000000000n).toString().padStart(18, '0').replace(/0+$/, ''); return fraction ? whole + '.' + fraction.slice(0, 6) + ' ETH' : whole + ' ETH' } catch { return baseUnits + ' wei' } }
const statusClass = (status) => status === 'settled' ? 'settled' : status === 'blocked' ? 'blocked' : 'pending'
const statusLabel = (status) => status === 'settled' ? 'SETTLED' : status === 'blocked' ? 'BLOCKED' : status.toUpperCase()

function renderMetrics(summary) {
  document.querySelector('[data-metric="total"]').textContent = summary.total
  document.querySelector('[data-metric="settled"]').textContent = summary.settled
  document.querySelector('[data-metric="verified"]').textContent = summary.verified
  document.querySelector('[data-metric="attention"]').textContent = summary.pending + summary.blocked
}

function renderList(payouts) {
  const list = $('#payout-list')
  if (payouts.length === 0) { list.innerHTML = '<div class="empty-list">No payout intents yet.<br />Create one through the CLI or MCP server.</div>'; return }
  list.innerHTML = payouts.map((payout) => {
    const intent = payout.intent
    const selected = state.selectedIntentId === intent.intentId ? ' selected' : ''
    return '<button class="payout-row' + selected + '" data-intent="' + escapeHtml(intent.intentId) + '" type="button">' +
      '<span class="row-status ' + statusClass(intent.status) + '"></span>' +
      '<span class="row-main"><span class="row-title">' + escapeHtml(payout.candidate?.repository || intent.intentId) + '</span><span class="row-meta">' + escapeHtml(payout.candidate?.tag || intent.policyId) + ' · ' + escapeHtml(short(intent.intentId, 14, 7)) + '</span></span>' +
      '<span class="row-right"><span class="row-amount">' + escapeHtml(amount(intent.amountBaseUnits)) + '</span><span class="row-status-label">' + statusLabel(intent.status) + '</span></span>' +
      '</button>'
  }).join('')
  document.querySelectorAll('[data-intent]').forEach((button) => button.addEventListener('click', () => { state.selectedIntentId = button.dataset.intent; history.replaceState(null, '', '#' + state.selectedIntentId); render() }))
}

function renderDetail(payout) {
  const panel = $('#detail-column')
  if (!payout) { panel.innerHTML = '<div class="detail-empty"><span class="empty-mark">＋</span><h3>Select an intent</h3><p>Choose a payout from the ledger to inspect its evidence and settlement proof.</p></div>'; return }
  const intent = payout.intent
  const proof = payout.proof
  const candidate = payout.candidate
  const txLink = proof?.transactionLink || intent.transactionLink
  const txHash = proof?.transactionHash || intent.transactionHash
  const verified = proof?.receiptVerified === true
  panel.innerHTML = '<div class="detail-header"><div><span class="detail-label">SELECTED INTENT</span><h3>' + escapeHtml(short(intent.intentId, 18, 8)) + '</h3></div><span class="detail-status ' + statusClass(intent.status) + '">' + statusLabel(intent.status) + '</span></div>' +
    '<div class="detail-section"><span class="detail-label">RELEASE EVIDENCE</span><p class="detail-value">' + escapeHtml(candidate?.repository || 'Candidate unavailable') + ' · ' + escapeHtml(candidate?.tag || '—') + '</p><div class="detail-links">' + (candidate?.releaseUrl ? '<a class="detail-link" href="' + escapeHtml(candidate.releaseUrl) + '" target="_blank" rel="noopener noreferrer">GitHub release ↗</a>' : '') + (candidate?.commitUrl ? '<a class="detail-link" href="' + escapeHtml(candidate.commitUrl) + '" target="_blank" rel="noopener noreferrer">Contribution ↗</a>' : '') + '</div></div>' +
    '<div class="detail-section"><span class="detail-label">CANONICAL PAYLOAD HASH</span><p class="detail-value mono">' + escapeHtml(intent.canonicalPayloadHash) + '</p></div>' +
    '<div class="detail-section proof-grid"><div class="proof-cell"><span class="detail-label">CHAIN</span><span class="proof-value">Base ' + escapeHtml(String(intent.chainId)) + '</span></div><div class="proof-cell"><span class="detail-label">AMOUNT</span><span class="proof-value">' + escapeHtml(amount(intent.amountBaseUnits)) + '</span></div><div class="proof-cell"><span class="detail-label">RECEIPT</span><span class="proof-value ' + (verified ? 'good' : 'warn') + '">' + (verified ? 'VERIFIED' : 'NOT VERIFIED') + '</span></div><div class="proof-cell"><span class="detail-label">UPDATED</span><span class="proof-value">' + escapeHtml(date(intent.updatedAt)) + '</span></div></div>' +
    '<div class="detail-section"><span class="detail-label">KEEPERHUB EXECUTION</span><p class="detail-value mono">' + escapeHtml(intent.executionId || 'Not executed') + '</p>' + (txHash ? '<p class="detail-value mono">' + escapeHtml(short(txHash, 18, 10)) + '</p>' : '') + (txLink ? '<div class="detail-links"><a class="detail-link" href="' + escapeHtml(txLink) + '" target="_blank" rel="noopener noreferrer">Open BaseScan transaction ↗</a></div>' : '') + '</div>' +
    '<div class="detail-section"><span class="detail-label">AUDIT NOTE</span><p class="detail-value">' + (proof?.duplicateReplay ? 'Idempotent replay confirmed — no second transfer was broadcast.' : verified ? 'Independent receipt verification matched the expected recipient and amount.' : escapeHtml(intent.blockedReason || 'Awaiting the next controlled state transition.')) + '</p></div>'
}

function render() {
  if (!state.snapshot) return
  renderMetrics(state.snapshot.summary)
  renderList(state.snapshot.payouts)
  const selected = state.snapshot.payouts.find((payout) => payout.intent.intentId === state.selectedIntentId) || state.snapshot.payouts[0]
  if (selected && state.selectedIntentId !== selected.intent.intentId) state.selectedIntentId = selected.intent.intentId
  renderDetail(selected)
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
