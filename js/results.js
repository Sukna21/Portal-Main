(() => {
  const D = window.SUKNA_DATA || {};
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];

  // mobile menu
  const menuBtn = $('#menuBtn');
  const mainNav = $('#mainNav');
  menuBtn?.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }));

  // PWA install
  let deferredPrompt;
  const installBtn = $('#installBtn');
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; installBtn.hidden = false; });
  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', { updateViaCache:'none' }).then(r => r.update()).catch(() => {}));
  }

  const SPREADSHEET_ID = '1qiRF16JhUlDBV9ZvoO6YhA5JnCbjqFcs';
  const SHEET_META = [
    { title:'Jadual Umum', gid:'1766800443', icon:'▦', short:'Umum' },
    { title:'Bola Sepak', gid:'1303193966', icon:'⚽', short:'Bola Sepak' },
    { title:'Bola Jaring', gid:'903650058', icon:'🥅', short:'Bola Jaring' },
    { title:'Bola Tampar Lelaki', gid:'979601248', icon:'🏐', short:'Tampar L' },
    { title:'Bola Tampar Wanita', gid:'1738590806', icon:'🏐', short:'Tampar W' },
    { title:'Futsal Lelaki', gid:'1041379431', icon:'⚽', short:'Futsal L' },
    { title:'Futsal Wanita', gid:'897313832', icon:'⚽', short:'Futsal W' },
    { title:'Badminton Berpasukan', gid:'1105793258', icon:'🏸', short:'Badminton' },
    { title:'Karom Berpasukan', gid:'91010045', icon:'♟', short:'Karom' },
    { title:'Dart Berpasukan', gid:'1631672342', icon:'🎯', short:'Dart' },
    { title:'Sepak Takraw Regu', gid:'1526261777', icon:'◉', short:'Takraw' },
    { title:'Ping Pong Berpasukan', gid:'251106998', icon:'🏓', short:'Ping Pong' },
    { title:'Tarik Tali (680KG)', gid:'303215215', icon:'🪢', short:'Tarik Tali 680' },
    { title:'Tarik Tali (Freeweight)', gid:'475871147', icon:'🪢', short:'Freeweight' }
  ];
  const FALLBACK_SHEETS = SHEET_META;
  const MANUAL_SHEETS = SHEET_META;

  const els = {
    docName: $('#docName'),
    activeSheetName: $('#activeSheetName'),
    sheetLastUpdate: $('#sheetLastUpdate'),
    sheetTabs: $('#sheetTabs'),
    sheetTabsInfo: $('#sheetTabsInfo'),
    sportChipBar: $('#sportChipBar'),
    dateChipBar: $('#dateChipBar'),
    featuredMatchGrid: $('#featuredMatchGrid'),
    resultsCardWall: $('#resultsCardWall'),
    resultsCountInfo: $('#resultsCountInfo'),
    resultsMiniStats: $('#resultsMiniStats'),
    resultsSearch: $('#resultsSearch'),
    statusFilter: $('#statusFilter'),
    reloadSheetBtn: $('#reloadSheetBtn'),
    sheetLoadingPanel: $('#sheetLoadingPanel'),
    sheetErrorPanel: $('#sheetErrorPanel'),
    resultsEmptyState: $('#resultsEmptyState')
  };

  let workbookSheets = [];
  let activeSheet = null;
  let activeSport = '';
  let activeDate = '';
  let allRecords = [];

  const stripHtml = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const norm = s => stripHtml(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const uniq = arr => [...new Set(arr.filter(Boolean))];
  const titleCase = s => String(s || '').replace(/(^|\s)\S/g, x => x.toUpperCase());
  const mapUrl = query => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
  const knownVenues = (D.venues || []).map(v => ({...v, key:norm(v.name)}));

  function showLoading(show=true){
    if (els.sheetLoadingPanel) els.sheetLoadingPanel.hidden = !show;
    if (show) els.sheetErrorPanel.hidden = true;
  }
  function showError(show=true){
    if (els.sheetErrorPanel) els.sheetErrorPanel.hidden = !show;
  }

  function jsonp(url, callbackParam='callback') {
    return new Promise((resolve, reject) => {
      const cb = '__jsonp_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const cleanup = () => { script.remove(); delete window[cb]; };
      const timer = setTimeout(() => { cleanup(); reject(new Error('timeout')); }, 15000);
      window[cb] = payload => { clearTimeout(timer); cleanup(); resolve(payload); };
      script.onerror = () => { clearTimeout(timer); cleanup(); reject(new Error('load error')); };
      script.src = url + (url.includes('?') ? '&' : '?') + callbackParam + '=' + cb;
      document.body.appendChild(script);
    });
  }

  function gvizJsonp(gid) {
    return new Promise((resolve, reject) => {
      const cb = '__gviz_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const cleanup = () => { script.remove(); delete window[cb]; };
      const timer = setTimeout(() => { cleanup(); reject(new Error('timeout')); }, 15000);
      window[cb] = payload => { clearTimeout(timer); cleanup(); resolve(payload); };
      script.onerror = () => { clearTimeout(timer); cleanup(); reject(new Error('load error')); };
      script.src = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=${gid}&headers=1&tqx=responseHandler:${cb};reqId:${Date.now()}`;
      document.body.appendChild(script);
    });
  }

  async function discoverSheets(){
    try {
      const feed = await jsonp(`https://spreadsheets.google.com/feeds/worksheets/${SPREADSHEET_ID}/public/full?alt=json-in-script`);
      const entries = feed?.feed?.entry || [];
      const autoSheets = entries.map(entry => {
        const title = entry?.title?.$t || 'Tab';
        const links = entry?.link || [];
        let gid = '';
        for (const l of links) {
          const href = l?.href || '';
          const match = href.match(/[#?&]gid=(\d+)/i);
          if (match) { gid = match[1]; break; }
        }
        return gid ? { title, gid } : null;
      }).filter(Boolean);
      if (autoSheets.length) return autoSheets;
    } catch (err) {
      console.warn('Worksheet metadata not available, using fallback.', err);
    }
    return uniqSheets([...FALLBACK_SHEETS, ...MANUAL_SHEETS]);
  }

  function uniqSheets(arr){
    const seen = new Set();
    return arr.filter(item => item && item.gid && !seen.has(item.gid) && (seen.add(item.gid), true));
  }

  function renderSheetTabs(){
    els.sheetTabs.innerHTML = workbookSheets.map((sheet, i) => `<button class="sheet-tab-btn ${activeSheet?.gid === sheet.gid ? 'active' : ''}" data-gid="${sheet.gid}" data-title="${sheet.title}"><span class="sheet-sport-icon">${sheet.icon || '●'}</span><span><b>${sheet.short || sheet.title}</b><small>${sheet.title}</small></span></button>`).join('');
    els.sheetTabsInfo.textContent = `${workbookSheets.length} kategori pertandingan dipautkan terus ke dokumen rasmi.`;
  }

  function renderSportChips(rows){
    const sports = uniq(rows.map(r => r.sport)).sort((a,b) => a.localeCompare(b,'ms'));
    els.sportChipBar.innerHTML = `<button class="sport-chip ${activeSport === '' ? 'active' : ''}" data-sport="">Semua</button>` + sports.map(s => `<button class="sport-chip ${activeSport === s ? 'active' : ''}" data-sport="${s}">${s}</button>`).join('');
  }

  function renderDateChips(rows){
    const dates = uniq(rows.map(r => r.date)).filter(Boolean);
    els.dateChipBar.innerHTML = `<button class="date-chip ${activeDate === '' ? 'active' : ''}" data-date="">Semua Tarikh</button>` + dates.map(d => `<button class="date-chip ${activeDate === d ? 'active' : ''}" data-date="${d}">${d}</button>`).join('');
    els.dateChipBar.hidden = dates.length === 0;
  }

  function findHeader(headers, patterns, opts={}){
    const found = [];
    headers.forEach((h,i) => {
      const n = norm(h);
      if (patterns.some(rx => rx.test(n))) found.push(i);
    });
    return opts.all ? found : (found[0] ?? -1);
  }

  function buildStatus(statusRaw, scoreRaw=''){
    const s = norm(statusRaw);
    const score = stripHtml(scoreRaw);
    if (/live|sedang|berlangsung|in progress|ongoing/.test(s)) return ['live','Sedang Berlangsung'];
    if (/tamat|selesai|final|completed|full time|habis/.test(s)) return ['done','Selesai'];
    if (/tunda|ditunda|postpone/.test(s)) return ['upcoming','Ditunda'];
    if (score && /\d/.test(score)) return ['done','Selesai'];
    return ['upcoming', statusRaw ? titleCase(statusRaw) : 'Akan Datang'];
  }

  function isGenericSheetTitle(title=''){
    return /keseluruhan|overall|utama|master|semua|jadual|keputusan|sheet/i.test(title);
  }

  function buildRecords(table, sheetTitle){
    const headers = (table.cols || []).map((c, i) => stripHtml(c.label || c.id || `Kolum ${i+1}`));
    const idxSport = findHeader(headers, [/sukan/,/acara/,/event/,/sport/]);
    const idxStage = findHeader(headers, [/peringkat/,/kategori/,/round/,/stage/,/game/,/match/,/pusingan/]);
    const idxDate = findHeader(headers, [/tarikh/,/^date$/,/^hari$/]);
    const idxTime = findHeader(headers, [/masa/,/^time$/, /jam/, /waktu/]);
    const idxVenue = findHeader(headers, [/venue/,/lokasi/,/tempat/,/gelanggang/,/padang/,/dewan/]);
    const idxStatus = findHeader(headers, [/status/,/live/,/keadaan/]);
    const idxScore = findHeader(headers, [/^skor$/, /^score$/, /^keputusan$/, /^result$/, /^mata$/]);
    const idxNotes = findHeader(headers, [/catatan/,/nota/,/remarks/,/keterangan/]);
    const idxVs = findHeader(headers, [/perlawanan/,/match/,/vs/,/lawan/]);
    const teamCols = findHeader(headers, [/pasukan/,/team/,/kontinjen/,/peserta/,/player/,/regu/,/zon/], {all:true});
    const scoreCols = findHeader(headers, [/skor 1/,/score 1/,/mata 1/,/home score/,/skor a/,/score a/,/pasukan 1/,/team 1/,/skor 2/,/score 2/,/mata 2/,/away score/,/skor b/,/score b/,/pasukan 2/,/team 2/], {all:true});

    const rows = (table.rows || []).map((row, ri) => {
      const cells = row.c || [];
      const values = cells.map(c => {
        if (!c) return '';
        if (c.f) return stripHtml(c.f);
        if (c.v == null) return '';
        return stripHtml(c.v);
      });
      if (values.every(v => !v)) return null;

      const pick = idx => idx >= 0 ? values[idx] || '' : '';
      let sport = pick(idxSport);
      let stage = pick(idxStage);
      let date = pick(idxDate);
      let time = pick(idxTime);
      let venue = pick(idxVenue);
      let statusRaw = pick(idxStatus);
      let notes = pick(idxNotes);
      let title = '';
      let teamA = '';
      let teamB = '';
      let score = '';

      if (teamCols.length >= 2) {
        teamA = values[teamCols[0]] || '';
        teamB = values[teamCols[1]] || '';
      }
      if (scoreCols.length >= 2) {
        const s1 = values[scoreCols[0]] || '';
        const s2 = values[scoreCols[1]] || '';
        if (s1 || s2) score = `${s1 || '0'} - ${s2 || '0'}`;
      }
      if (!score) score = pick(idxScore);

      const vsText = pick(idxVs);
      if ((!teamA || !teamB) && vsText && /\bvs\b|\slwn\s|\slawan\s|\s-\s/i.test(vsText.toLowerCase())) {
        const parts = vsText.split(/\bvs\b|\slwn\s|\slawan\s|\s-\s/i).map(s => s.trim()).filter(Boolean);
        teamA = teamA || parts[0] || '';
        teamB = teamB || parts[1] || '';
      }

      if (!sport && !isGenericSheetTitle(sheetTitle)) sport = sheetTitle;
      if (!sport) {
        const maybeSport = values.find(v => /bola sepak|bola jaring|futsal|badminton|olahraga|tenpin|bowling|ping pong|karom|dart|takraw|bola tampar|tarik tali/i.test(v.toLowerCase()));
        if (maybeSport) sport = maybeSport;
      }
      if (!venue) {
        const maybeVenue = values.find(v => /stadium|padang|dewan|gelanggang|akademi|upm|putrajaya|arena/i.test(v.toLowerCase()));
        if (maybeVenue) venue = maybeVenue;
      }
      if (!date) {
        const maybeDate = values.find(v => /sep|okt|nov|dis|jan|feb|mac|apr|mei|jun|jul|ogo|aug|2026/i.test(v.toLowerCase()));
        if (maybeDate) date = maybeDate;
      }
      if (!time) {
        const maybeTime = values.find(v => /pagi|petang|malam|am|pm|:/i.test(v.toLowerCase()));
        if (maybeTime) time = maybeTime;
      }
      if (!title) title = [sport, stage].filter(Boolean).join(' · ');
      if (!title) title = teamA && teamB ? `${teamA} vs ${teamB}` : `Rekod ${ri+1}`;

      if (!notes) {
        const known = new Set([sport, stage, date, time, venue, statusRaw, score, teamA, teamB, title].map(stripHtml));
        const extras = values.filter(v => v && !known.has(stripHtml(v)));
        notes = extras.slice(0,2).join(' • ');
      }

      const [statusKey, statusLabel] = buildStatus(statusRaw, score);
      let venueQuery = venue;
      if (venue) {
        const match = knownVenues.find(v => v.key && (norm(venue).includes(v.key) || v.key.includes(norm(venue))));
        if (match) venueQuery = match.query;
      }

      return {
        id: `${sheetTitle}-${ri+1}`,
        sheetTitle,
        title,
        sport: sport || 'Lain-lain',
        stage,
        date,
        time,
        venue,
        venueUrl: venue ? mapUrl(venueQuery || venue) : '',
        statusKey,
        statusLabel,
        teamA,
        teamB,
        score,
        notes,
        searchBlob: [sheetTitle, title, sport, stage, date, time, venue, statusLabel, teamA, teamB, score, notes].join(' ').toLowerCase()
      };
    }).filter(Boolean);

    return rows;
  }

  function renderSummary(rows){
    const counts = {
      total: rows.length,
      live: rows.filter(r => r.statusKey === 'live').length,
      done: rows.filter(r => r.statusKey === 'done').length,
      upcoming: rows.filter(r => r.statusKey === 'upcoming').length,
    };
    els.resultsMiniStats.innerHTML = `
      <article><small>Jumlah rekod</small><b>${counts.total}</b></article>
      <article><small>Sedang berlangsung</small><b>${counts.live}</b></article>
      <article><small>Selesai</small><b>${counts.done}</b></article>
      <article><small>Akan datang</small><b>${counts.upcoming}</b></article>`;
  }

  function filterRows(){
    const q = (els.resultsSearch.value || '').trim().toLowerCase();
    const status = els.statusFilter.value || '';
    return allRecords.filter(r =>
      (!activeSport || r.sport === activeSport) &&
      (!activeDate || r.date === activeDate) &&
      (!status || r.statusKey === status) &&
      (!q || r.searchBlob.includes(q))
    );
  }

  function renderRows(){
    const rows = filterRows();
    renderSummary(rows);
    els.resultsCountInfo.textContent = `${rows.length} rekod dipaparkan`;
    els.resultsEmptyState.hidden = rows.length !== 0;

    const featured = [...rows].sort((a, b) => {
      const order = {live:0, done:1, upcoming:2};
      return (order[a.statusKey] ?? 9) - (order[b.statusKey] ?? 9);
    }).slice(0, 4);

    els.featuredMatchGrid.innerHTML = featured.map(r => `
      <article class="featured-match-card ${r.statusKey}">
        <div class="featured-topline">
          <span class="status-badge ${r.statusKey}">${r.statusLabel}</span>
          <small>${r.sheetTitle}</small>
        </div>
        <h3>${r.title}</h3>
        ${r.teamA || r.teamB ? `
          <div class="versus-line">
            <div><b>${r.teamA || 'Pasukan A'}</b></div>
            <strong>${r.score || 'VS'}</strong>
            <div><b>${r.teamB || 'Pasukan B'}</b></div>
          </div>` : `
          <div class="single-info-pill">${r.score || r.notes || 'Maklumat jadual'}</div>`}
        <div class="match-meta-line">
          <span>🗓 ${[r.date, r.time].filter(Boolean).join(' · ') || 'Rujuk helaian rasmi'}</span>
          <span>${r.sport}</span>
        </div>
        ${r.venue ? `<a class="venue-mini-link" href="${r.venueUrl}" target="_blank" rel="noopener">📍 ${r.venue} ↗</a>` : ''}
      </article>
    `).join('') || '<div class="results-empty-state-card">Tiada highlight untuk dipaparkan buat masa ini.</div>';

    els.resultsCardWall.innerHTML = rows.map(r => `
      <article class="portal-result-card ${r.statusKey}">
        <div class="portal-result-head">
          <div>
            <small>${r.sheetTitle}</small>
            <h3>${r.title}</h3>
          </div>
          <span class="status-badge ${r.statusKey}">${r.statusLabel}</span>
        </div>
        ${r.teamA || r.teamB ? `
          <div class="portal-result-main">
            <div class="team-side">
              <span class="team-tag">A</span>
              <b>${r.teamA || 'Pasukan A'}</b>
            </div>
            <div class="score-box">${r.score || 'VS'}</div>
            <div class="team-side alt">
              <span class="team-tag">B</span>
              <b>${r.teamB || 'Pasukan B'}</b>
            </div>
          </div>` : `
          <div class="portal-result-main single">
            <div class="single-info-pill wide">${r.score || r.notes || 'Maklumat jadual / keputusan'}</div>
          </div>`}
        <div class="portal-result-meta">
          <span>🏷 ${r.sport}</span>
          ${r.stage ? `<span>• ${r.stage}</span>` : ''}
        </div>
        <div class="portal-result-info">
          <span>🗓 ${[r.date, r.time].filter(Boolean).join(' · ') || 'Masa dirujuk pada helaian rasmi'}</span>
          ${r.venue ? `<a href="${r.venueUrl}" target="_blank" rel="noopener">📍 ${r.venue} ↗</a>` : '<span>📍 Venue akan dikemas kini</span>'}
        </div>
        ${r.notes ? `<p class="portal-result-note">${r.notes}</p>` : ''}
      </article>
    `).join('');
  }

  async function loadSheet(sheet){
    activeSheet = sheet;
    allRecords = [];
    activeSport = '';
    activeDate = '';
    showLoading(true);
    showError(false);
    els.activeSheetName.textContent = sheet.title;
    renderSheetTabs();
    try {
      const resp = await gvizJsonp(sheet.gid);
      if (!resp || resp.status === 'error' || !resp.table) throw new Error('Invalid gviz response');
      allRecords = buildRecords(resp.table, sheet.title);
      renderSportChips(allRecords);
      renderDateChips(allRecords);
      renderRows();
      els.sheetLastUpdate.textContent = 'Dikemas kini ' + new Date().toLocaleTimeString('ms-MY', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
      showLoading(false);
      showError(false);
    } catch (err) {
      console.warn('Failed loading sheet', sheet, err);
      showLoading(false);
      showError(true);
      allRecords = [];
      renderSportChips([]);
      renderDateChips([]);
      renderRows();
      els.sheetLastUpdate.textContent = 'Gagal memuatkan data';
    }
  }

  els.sheetTabs.addEventListener('click', e => {
    const btn = e.target.closest('.sheet-tab-btn');
    if (!btn) return;
    const next = workbookSheets.find(s => s.gid === btn.dataset.gid);
    if (next) loadSheet(next);
  });
  els.sportChipBar.addEventListener('click', e => {
    const btn = e.target.closest('.sport-chip');
    if (!btn) return;
    activeSport = btn.dataset.sport || '';
    renderSportChips(allRecords);
    renderRows();
  });
  els.dateChipBar.addEventListener('click', e => {
    const btn = e.target.closest('.date-chip');
    if (!btn) return;
    activeDate = btn.dataset.date || '';
    renderDateChips(allRecords);
    renderRows();
  });
  els.resultsSearch.addEventListener('input', renderRows);
  els.statusFilter.addEventListener('change', renderRows);
  els.reloadSheetBtn.addEventListener('click', () => activeSheet && loadSheet(activeSheet));

  (async function init(){
    workbookSheets = uniqSheets([...MANUAL_SHEETS]);
    if (!workbookSheets.length) workbookSheets = [...FALLBACK_SHEETS];
    els.docName.textContent = 'SUKNA XXI Selangor 2026';
    renderSheetTabs();
    loadSheet(workbookSheets[0]);
  })();
})();
