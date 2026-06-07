const express = require('express');
const router = express.Router();
const { TournamentManager } = require('../managers/TournamentManager');
const { MAPS } = require('../maps');

router.get('/', (req, res) => {
  const config = TournamentManager.loadConfig();
  const theme  = config.themeColor || '#FF0000';

  const mapOptions = MAPS.map(m =>
    `<option value="${m.name}" ${config.map === m.name ? 'selected' : ''}>${m.name.replace(/\b\w/g, c => c.toUpperCase())}</option>`
  ).join('');

  const mapOptionsCreate = MAPS.map(m =>
    `<option value="${m.name}">${m.name.replace(/\b\w/g, c => c.toUpperCase())}</option>`
  ).join('');

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>PastBackboneGztxx7</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;background:#0f0f0f;color:#eee;min-height:100vh}
    header{background:#1a1a1a;border-bottom:2px solid ${theme};padding:16px 32px;display:flex;align-items:center;justify-content:space-between}
    header h1{font-size:1.3rem;color:${theme}}
    nav{display:flex;gap:8px}
    nav button{background:transparent;border:1px solid #333;color:#aaa;padding:7px 16px;border-radius:6px;cursor:pointer;font-size:0.85rem}
    nav button.active,nav button:hover{border-color:${theme};color:${theme}}
    main{padding:28px 32px;max-width:1300px;margin:0 auto}
    .section{display:none}.section.active{display:block}
    h2{font-size:0.85rem;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px}
    .card{background:#1a1a1a;border-radius:10px;padding:24px;margin-bottom:24px;border:1px solid #242424}
    table{width:100%;border-collapse:collapse;font-size:0.88rem}
    th{text-align:left;padding:10px 14px;background:#1f1f1f;color:#666;font-size:0.75rem;text-transform:uppercase;letter-spacing:.5px}
    td{padding:11px 14px;border-bottom:1px solid #1f1f1f;vertical-align:middle}
    tr:last-child td{border:none}
    tr:hover td{background:#1d1d1d}
    .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600}
    .badge-active{background:#1a3a1a;color:#4caf50}
    .badge-pending{background:#3a3a1a;color:#ffc107}
    .badge-finished{background:#2a2a2a;color:#888}
    .badge-progress{background:#1a2a3a;color:#2196f3}
    .dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}
    .dot-live{background:#4caf50;animation:pulse 1.2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    label{display:block;font-size:0.8rem;color:#777;margin-bottom:6px}
    input,textarea,select{width:100%;background:#111;border:1px solid #2a2a2a;border-radius:6px;padding:9px 12px;color:#eee;font-size:0.88rem;outline:none}
    input:focus,textarea:focus,select:focus{border-color:${theme}}
    input[type=color]{height:38px;padding:2px 6px;cursor:pointer}
    input[type=number]{width:100%}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
    .btn{display:inline-block;padding:9px 22px;border-radius:6px;font-size:0.88rem;font-weight:600;cursor:pointer;border:none}
    .btn-primary{background:${theme};color:#fff}
    .btn-primary:hover{opacity:.85}
    .btn-outline{background:transparent;border:1px solid #333;color:#aaa}
    .btn-outline:hover{border-color:${theme};color:${theme}}
    .mt{margin-top:16px}
    .msg{display:none;margin-top:12px;padding:10px 14px;border-radius:6px;font-size:.85rem}
    .msg.ok{background:#1a3a1a;color:#4caf50;display:block}
    .msg.err{background:#3a1a1a;color:#f44336;display:block}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
    .stat{background:#1a1a1a;border-radius:10px;padding:20px;border:1px solid #242424;text-align:center}
    .stat-val{font-size:2rem;font-weight:700;color:${theme}}
    .stat-label{font-size:0.78rem;color:#555;margin-top:4px;text-transform:uppercase}
    .bracket{display:flex;gap:32px;overflow-x:auto;padding:8px 0}
    .bracket-round{display:flex;flex-direction:column;gap:12px;min-width:180px}
    .bracket-round h4{font-size:0.75rem;color:#555;text-transform:uppercase;margin-bottom:8px;text-align:center}
    .match{background:#111;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden}
    .match-player{padding:8px 12px;font-size:0.85rem;display:flex;justify-content:space-between;align-items:center}
    .match-player:first-child{border-bottom:1px solid #1a1a1a}
    .match-player.winner{color:${theme};font-weight:600}
    .match-player.loser{color:#444}
    .empty{color:#444;text-align:center;padding:32px;font-size:0.9rem}
    .map-tag{background:#222;border:1px solid #333;padding:2px 8px;border-radius:4px;font-size:0.78rem;color:#aaa}
  </style>
</head>
<body>
<header>
  <h1>🏆 PastBackboneGztxx7</h1>
  <nav>
    <button class="active" onclick="showSection('tournaments',this)">Torneios</button>
    <button onclick="showSection('bracket',this)">Bracket</button>
    <button onclick="showSection('config',this)">Configurar</button>
    <button onclick="showSection('create',this)">+ Novo</button>
  </nav>
  <span style="font-size:.75rem;color:#4caf50"><span class="dot dot-live"></span>ao vivo</span>
</header>
<main>

  <div class="stats">
    <div class="stat"><div class="stat-val" id="statTotal">-</div><div class="stat-label">Total</div></div>
    <div class="stat"><div class="stat-val" id="statActive">-</div><div class="stat-label">Ativos</div></div>
    <div class="stat"><div class="stat-val" id="statFinished">-</div><div class="stat-label">Finalizados</div></div>
    <div class="stat"><div class="stat-val" id="statPlayers">-</div><div class="stat-label">Jogadores</div></div>
  </div>

  <!-- TORNEIOS -->
  <div id="tournaments" class="section active">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2>Torneios</h2>
        <select id="filterStatus" style="width:auto" onchange="renderTable()">
          <option value="">Todos</option>
          <option value="6">Ativo</option>
          <option value="2">Em andamento</option>
          <option value="0">Agendado</option>
          <option value="3">Finalizado</option>
        </select>
      </div>
      <table>
        <thead>
          <tr><th>ID</th><th>Nome</th><th>Mapa</th><th>Rodadas</th><th>Cor</th><th>Data</th><th>Hora</th><th>Status</th><th>Jogadores</th><th></th></tr>
        </thead>
        <tbody id="tableBody"></tbody>
      </table>
    </div>
  </div>

  <!-- BRACKET -->
  <div id="bracket" class="section">
    <div class="card">
      <h2>Bracket</h2>
      <div style="margin-bottom:16px">
        <select id="bracketSelect" style="width:auto" onchange="loadBracket()">
          <option value="">Selecione um torneio</option>
        </select>
      </div>
      <div id="bracketView" class="bracket"><div class="empty">Selecione um torneio</div></div>
    </div>
  </div>

  <!-- CONFIG -->
  <div id="config" class="section">
    <div class="card">
      <h2>Customizar Torneio Padrão</h2>
      <form id="configForm">
        <div class="grid3">
          <div><label>Nome</label><input type="text" name="tournamentName" placeholder="Nome do torneio" /></div>
          <div><label>Cor do Tema</label><input type="color" name="themeColor" value="${theme}" /></div>
          <div><label>Descrição</label><input type="text" name="description" placeholder="Descrição" /></div>
          <div><label>Mapa</label><select name="map">${mapOptions}</select></div>
          <div><label>Número de Rodadas</label><input type="number" name="roundCount" min="1" max="10" value="${config.roundCount || 5}" /></div>
          <div><label>Image URL</label><input type="text" name="imageUrl" placeholder="https://..." /></div>
          <div><label>Icon URL</label><input type="text" name="iconUrl" placeholder="https://..." /></div>
          <div><label>Sponsor Image URL</label><input type="text" name="sponsorImageUrl" placeholder="https://..." /></div>
        </div>
        <button type="submit" class="btn btn-primary mt">Salvar</button>
        <div id="configMsg" class="msg"></div>
      </form>
    </div>
  </div>

  <!-- CRIAR -->
  <div id="create" class="section">
    <div class="card">
      <h2>Criar Novo Torneio</h2>
      <form id="createForm">
        <div class="grid3">
          <div><label>Nome *</label><input type="text" name="tournamentName" required placeholder="Nome do torneio" /></div>
          <div><label>Cor do Tema</label><input type="color" name="themeColor" value="${theme}" /></div>
          <div><label>Descrição</label><input type="text" name="description" placeholder="Descrição" /></div>
          <div><label>Mapa</label><select name="map">${mapOptionsCreate}</select></div>
          <div><label>Número de Rodadas</label><input type="number" name="roundCount" min="1" max="10" value="5" /></div>
          <div><label>Image URL</label><input type="text" name="imageUrl" placeholder="https://..." /></div>
          <div><label>Icon URL</label><input type="text" name="iconUrl" placeholder="https://..." /></div>
          <div><label>Sponsor Image URL</label><input type="text" name="sponsorImageUrl" placeholder="https://..." /></div>
        </div>
        <button type="submit" class="btn btn-primary mt">Criar Torneio</button>
        <div id="createMsg" class="msg"></div>
      </form>
    </div>
  </div>

</main>
<script>
  let TOKEN = '';
  const headers = { 'Content-Type': 'application/json', 'Authorization': '' };

  async function initToken() {
    try {
      const r = await fetch('/dashboard/token');
      const d = await r.json();
      TOKEN = d.token || '';
      headers['Authorization'] = 'Bearer ' + TOKEN;
    } catch {}
  }
  let allTournaments = [];

  const statusMap = { 0:'Agendado',1:'Inscrições',2:'Em andamento',3:'Finalizado',4:'Cancelado',6:'Ativo' };
  const badgeMap  = { 0:'badge-pending',1:'badge-pending',2:'badge-progress',3:'badge-finished',4:'badge-finished',6:'badge-active' };

  function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (btn) btn.classList.add('active');
  }

  async function fetchTournaments() {
    try {
      const res = await fetch('/api/tournaments', { headers });
      const data = await res.json();
      allTournaments = data.tournaments || [];
      renderTable();
      updateStats();
      updateBracketSelect();
    } catch {}
  }

  function renderTable() {
    const filter = document.getElementById('filterStatus').value;
    const list = filter ? allTournaments.filter(t => String(t.status) === filter) : allTournaments;
    const tbody = document.getElementById('tableBody');
    if (!list.length) { tbody.innerHTML = '<tr><td colspan="10" class="empty">Nenhum torneio</td></tr>'; return; }
    tbody.innerHTML = list.map(t => {
      const d = new Date(t.time);
      const dateStr = d.toLocaleDateString('pt-BR');
      const timeStr = d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
      const badge = badgeMap[t.status] || 'badge-finished';
      const label = statusMap[t.status] || t.status;
      const mapName = t.map ? t.map.replace(/\\b\\w/g, c => c.toUpperCase()) : '-';
      return \`<tr>
        <td>#\${t.id}</td>
        <td><b>\${t.tournamentName}</b></td>
        <td><span class="map-tag">🗺 \${mapName}</span></td>
        <td style="text-align:center">\${t.roundCount || '-'}</td>
        <td><span style="background:\${t.themeColor};padding:2px 10px;border-radius:4px;color:#fff;font-size:.8rem">\${t.themeColor}</span></td>
        <td>\${dateStr}</td>
        <td>\${timeStr}</td>
        <td><span class="badge \${badge}">\${label}</span></td>
        <td>\${t.participants?.length || 0}</td>
        <td><button class="btn btn-outline" style="padding:4px 12px;font-size:.8rem" onclick="viewBracket(\${t.id})">Bracket</button></td>
      </tr>\`;
    }).join('');
  }

  function updateStats() {
    document.getElementById('statTotal').textContent    = allTournaments.length;
    document.getElementById('statActive').textContent   = allTournaments.filter(t => t.status === 6 || t.status === 2).length;
    document.getElementById('statFinished').textContent = allTournaments.filter(t => t.status === 3).length;
    document.getElementById('statPlayers').textContent  = allTournaments.reduce((a, t) => a + (t.participants?.length || 0), 0);
  }

  function updateBracketSelect() {
    const sel = document.getElementById('bracketSelect');
    const cur = sel.value;
    sel.innerHTML = '<option value="">Selecione um torneio</option>' +
      allTournaments.map(t => \`<option value="\${t.id}" \${String(t.id)===cur?'selected':''}>\${t.tournamentName} (#\${t.id})</option>\`).join('');
    if (cur) loadBracket();
  }

  function viewBracket(id) {
    showSection('bracket', [...document.querySelectorAll('nav button')].find(b => b.textContent === 'Bracket'));
    document.getElementById('bracketSelect').value = id;
    loadBracket();
  }

  async function loadBracket() {
    const id = document.getElementById('bracketSelect').value;
    const view = document.getElementById('bracketView');
    if (!id) { view.innerHTML = '<div class="empty">Selecione um torneio</div>'; return; }
    try {
      const res = await fetch(\`/api/tournaments/\${id}/bracket\`, { headers });
      if (!res.ok) { view.innerHTML = '<div class="empty">Bracket não disponível</div>'; return; }
      const bracket = await res.json();
      if (!bracket.matches?.length) { view.innerHTML = '<div class="empty">Nenhuma partida ainda</div>'; return; }
      const rounds = {};
      bracket.matches.forEach(m => { if (!rounds[m.round]) rounds[m.round] = []; rounds[m.round].push(m); });
      view.innerHTML = Object.keys(rounds).map(r => \`
        <div class="bracket-round">
          <h4>Round \${r}</h4>
          \${rounds[r].map(m => \`
            <div class="match">
              <div class="match-player \${m.winnerId===m.player1?.id?'winner':m.winnerId?'loser':''}">
                <span>\${m.player1?.name||'TBD'}</span>\${m.winnerId===m.player1?.id?'🏆':''}
              </div>
              <div class="match-player \${m.winnerId===m.player2?.id?'winner':m.winnerId?'loser':''}">
                <span>\${m.player2?.name||'TBD'}</span>\${m.winnerId===m.player2?.id?'🏆':''}
              </div>
            </div>\`).join('')}
        </div>\`).join('');
    } catch { view.innerHTML = '<div class="empty">Erro ao carregar bracket</div>'; }
  }

  async function loadConfig() {
    try {
      const res = await fetch('/api/tournaments/config', { headers });
      const cfg = await res.json();
      const form = document.getElementById('configForm');
      Object.keys(cfg).forEach(k => { if (form[k]) form[k].value = cfg[k]; });
    } catch {}
  }

  document.getElementById('configForm').addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const msg = document.getElementById('configMsg');
    try {
      const res = await fetch('/api/tournaments/config', { method:'PATCH', headers, body: JSON.stringify(data) });
      if (res.ok) { msg.className='msg ok'; msg.textContent='Salvo!'; fetchTournaments(); }
      else throw new Error();
    } catch { msg.className='msg err'; msg.textContent='Erro ao salvar.'; }
  });

  document.getElementById('createForm').addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const msg = document.getElementById('createMsg');
    try {
      const res = await fetch('/api/tournaments', { method:'POST', headers, body: JSON.stringify(data) });
      if (res.ok) { msg.className='msg ok'; msg.textContent='Torneio criado!'; e.target.reset(); fetchTournaments(); }
      else throw new Error();
    } catch { msg.className='msg err'; msg.textContent='Erro ao criar.'; }
  });

  initToken().then(() => {
    fetchTournaments();
    loadConfig();
    setInterval(fetchTournaments, 5000);
  });
</script>
</body>
</html>`);
});

module.exports = router;
