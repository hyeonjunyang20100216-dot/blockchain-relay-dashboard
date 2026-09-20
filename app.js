const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const state = {
  paused: false,
  network: 'Ethereum',
  blockHeight: 23418721,
  txs: [],
  chartData: [],
};

const networks = {
  Ethereum: { relays: 128, throughput: 14.8, latency: 42, regions: 8, peers: 742 },
  Polygon:  { relays: 94,  throughput: 21.3, latency: 35, regions: 7, peers: 514 },
  Arbitrum: { relays: 76,  throughput: 11.6, latency: 31, regions: 6, peers: 388 },
  Base:     { relays: 68,  throughput: 9.4,  latency: 37, regions: 6, peers: 331 },
};

const hex = (n = 10) => Array.from({length:n}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join('');
const rnd = (min, max, d = 0) => +(Math.random()*(max-min)+min).toFixed(d);
const formatK = v => `${v.toFixed(1)}K`;

function initTxs() {
  state.txs = Array.from({length: 7}, createTx);
  renderTxs();
}

function createTx() {
  const pending = Math.random() < .08;
  return {
    hash: `0x${hex(8)}…${hex(6)}`,
    value: `${rnd(.002, 4.8, 3)} ETH`,
    fee: `${rnd(.25, 4.7, 2)} gwei`,
    latency: `${rnd(18, 91)} ms`,
    status: pending ? 'Pending' : 'Relayed'
  };
}

function renderTxs() {
  const body = $('#txTable');
  body.innerHTML = state.txs.map((t,i) => `
    <tr class="${i === 0 ? 'tx-flash' : ''}">
      <td>${t.hash}</td>
      <td>${t.value}</td>
      <td>${t.fee}</td>
      <td>${t.latency}</td>
      <td><span class="badge ${t.status === 'Relayed' ? 'success' : 'pending'}">${t.status === 'Relayed' ? '●' : '◌'} ${t.status}</span></td>
    </tr>`).join('');
}

function renderSparks() {
  $$('.spark').forEach((el, idx) => {
    const points = Array.from({length: 18}, (_,i) => {
      const base = [18,20,14,19][idx];
      return [i, base + Math.sin(i*.65 + idx)*5 + Math.random()*6];
    });
    const path = points.map(([x,y],i)=>`${i?'L':'M'} ${(x/17)*100} ${36-y}`).join(' ');
    el.innerHTML = `<svg viewBox="0 0 100 38" preserveAspectRatio="none">
      <defs><linearGradient id="sg${idx}" x1="0" x2="1"><stop stop-color="#6d6bff"/><stop offset="1" stop-color="#31d7ff"/></linearGradient></defs>
      <path d="${path}" fill="none" stroke="url(#sg${idx})" stroke-width="1.8" vector-effect="non-scaling-stroke" opacity=".9"/>
      <path d="${path} L 100 38 L 0 38 Z" fill="url(#sg${idx})" opacity=".06"/>
    </svg>`;
  });
}

function renderNetwork() {
  const svg = $('#networkSvg');
  const nodes = [
    [360,180,'core'],[185,85,'edge'],[520,72,'edge'],[105,205,'normal'],
    [596,215,'normal'],[244,262,'normal'],[463,274,'sync'],[333,78,'normal'],
    [443,120,'normal'],[155,290,'edge'],[650,108,'normal'],[65,105,'normal'],
  ];
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[1,3],[1,7],[1,11],[2,8],[2,10],[4,10],[4,6],[5,9],[5,6],[7,8],[3,9],[8,4]];
  svg.innerHTML = edges.map((e,i)=>{
    const a=nodes[e[0]], b=nodes[e[1]];
    return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="node-line ${i%4===0?'hot':''}"/>`;
  }).join('') + nodes.map((n,i)=>{
    const cls = n[2]==='core'?'core-node':n[2]==='edge'?'edge-node':n[2]==='sync'?'sync-node':'';
    const r = n[2]==='core'?12:n[2]==='edge'?7:5.5;
    return `<circle cx="${n[0]}" cy="${n[1]}" r="${r}" class="node ${cls}">
      <title>${n[2]==='core'?'Primary relay':n[2]==='edge'?'Edge relay':n[2]==='sync'?'Syncing node':'Peer node'} ${i+1}</title>
    </circle>`;
  }).join('');
}

function generateChart(range='1h') {
  const count = range === '1h' ? 34 : range === '24h' ? 48 : 56;
  const network = networks[state.network];
  const base = network.throughput;
  state.chartData = Array.from({length:count}, (_,i) => {
    const wave = Math.sin(i*.34) * (base*.12) + Math.sin(i*.11) * (base*.08);
    return Math.max(2, base + wave + rnd(-1.1,1.1,2));
  });
  renderChart();
}

function renderChart() {
  const svg = $('#lineChart');
  const w = 640, h = 280, padY = 20;
  const max = Math.max(22, Math.max(...state.chartData) * 1.08);
  const pts = state.chartData.map((v,i)=>[
    (i/(state.chartData.length-1))*w,
    h-padY-(v/max)*(h-padY*2)
  ]);
  const path = pts.map(([x,y],i)=>`${i?'L':'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  svg.innerHTML = `
    <defs>
      <linearGradient id="lineGradient" x1="0" x2="1"><stop stop-color="#776fff"/><stop offset="1" stop-color="#31d7ff"/></linearGradient>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#31d7ff" stop-opacity=".22"/><stop offset="1" stop-color="#31d7ff" stop-opacity="0"/></linearGradient>
    </defs>
    ${[.2,.4,.6,.8].map(p=>`<line x1="0" y1="${h*p}" x2="${w}" y2="${h*p}" class="chart-grid"/>`).join('')}
    <path d="${area}" class="chart-area"/>
    <path d="${path}" class="chart-line"/>
    <circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="4" fill="#31d7ff"><animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/></circle>`;
  const peak = Math.max(...state.chartData);
  const avg = state.chartData.reduce((a,b)=>a+b,0)/state.chartData.length;
  $('#peakValue').textContent = `${peak.toFixed(1)}K tx/s`;
  $('#avgValue').textContent = `${avg.toFixed(1)}K tx/s`;
}

function renderBlocks() {
  const grid = $('#blocksGrid');
  const now = Date.now();
  grid.innerHTML = Array.from({length:5},(_,i)=>{
    const n = state.blockHeight - i;
    return `<div class="block-card">
      <span class="block-no">#${n.toLocaleString()}</span>
      <span class="block-hash">0x${hex(12)}…${hex(8)}</span>
      <div class="block-meta">
        <span>TXS<strong>${rnd(118, 324)}</strong></span>
        <span>AGE<strong>${i===0?'now':`${i*12}s`}</strong></span>
        <span>PROPAGATION<strong>${rnd(86, 214)} ms</strong></span>
        <span>SIZE<strong>${rnd(.31,1.42,2)} MB</strong></span>
      </div>
    </div>`;
  }).join('');
}

function applyNetwork() {
  const n = networks[state.network];
  $('#activeRelays').textContent = n.relays;
  $('#throughput').textContent = formatK(n.throughput);
  $('#latency').textContent = n.latency;
  $('#meshNodes').textContent = n.relays;
  $('#meshRegions').textContent = n.regions;
  $('#meshPeers').textContent = n.peers;
  generateChart($('.range-btn.active').dataset.range);
}

function tick() {
  if (state.paused) return;
  const n = networks[state.network];
  const tx = createTx();
  state.txs.unshift(tx);
  state.txs = state.txs.slice(0,7);
  renderTxs();

  const t = n.throughput + rnd(-.7,.7,1);
  const l = Math.max(20, n.latency + rnd(-5,5));
  $('#throughput').textContent = formatK(t);
  $('#latency').textContent = l;

  if (Math.random() < .35) {
    state.blockHeight += 1;
    $('#blockHeight').textContent = state.blockHeight.toLocaleString();
    renderBlocks();
  }

  const pct = rnd(78,94);
  $('#queuePercent').textContent = `${pct}%`;
  $('#queueDonut').style.background = `conic-gradient(var(--accent-2) 0 ${pct}%, rgba(255,255,255,.06) ${pct}% 100%)`;
}

$('#networkSelect').addEventListener('change', e => {
  state.network = e.target.value;
  applyNetwork();
});

$('#pauseBtn').addEventListener('click', e => {
  state.paused = !state.paused;
  e.currentTarget.textContent = state.paused ? '▶' : 'Ⅱ';
  e.currentTarget.title = state.paused ? '실시간 업데이트 재개' : '실시간 업데이트 일시정지';
});

$$('.range-btn').forEach(btn => btn.addEventListener('click', () => {
  $$('.range-btn').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  generateChart(btn.dataset.range);
}));

$$('.nav-item').forEach(btn => btn.addEventListener('click', () => {
  $$('.nav-item').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.section)?.scrollIntoView({behavior:'smooth', block:'start'});
  $('#sidebar').classList.remove('open');
}));

$('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#refreshBlocks').addEventListener('click', () => {
  state.blockHeight += rnd(0,2);
  $('#blockHeight').textContent = state.blockHeight.toLocaleString();
  renderBlocks();
});

document.addEventListener('click', (e) => {
  if (innerWidth <= 820 && !$('#sidebar').contains(e.target) && !$('#menuBtn').contains(e.target)) {
    $('#sidebar').classList.remove('open');
  }
});

renderSparks();
renderNetwork();
generateChart();
initTxs();
renderBlocks();
applyNetwork();
setInterval(tick, 1700);
