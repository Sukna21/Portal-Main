(() => {
  const D = window.SUKNA_DATA;
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];

  // Mobile menu
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

  // Countdown / status
  const start = new Date('2026-09-17T00:00:00+08:00');
  const end = new Date('2026-09-21T00:00:00+08:00');
  function tick(){
    const now = new Date();
    const status = $('#eventStatus');
    let diff = start - now;
    if(now >= start && now < end){
      status.textContent = 'SUKNA21 sedang berlangsung!';
      diff = end - now;
    } else if(now >= end){
      status.textContent = 'SUKNA21 Selangor 2026 telah tamat.';
      diff = 0;
    } else {
      status.textContent = 'Menuju SUKNA21 Selangor 2026';
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    $('#cdDays').textContent = String(Math.max(0,days)).padStart(2,'0');
    $('#cdHours').textContent = String(Math.max(0,hours)).padStart(2,'0');
    $('#cdMinutes').textContent = String(Math.max(0,mins)).padStart(2,'0');
    const secEl = $('#cdSeconds'); if(secEl) secEl.textContent = String(Math.max(0,secs)).padStart(2,'0');
  }
  tick(); setInterval(tick, 1000);

  // Zone bars
  const maxZone = Math.max(...D.zones.map(z=>z.total));
  $('#zoneBars').innerHTML = D.zones.map(z => `
    <div class="zone-row">
      <div class="zone-label"><b>${z.name}</b><span>${z.total} peserta</span></div>
      <div class="bar"><i style="width:${(z.total/maxZone)*100}%"></i></div>
      <div class="gender-split"><span>♂ ${z.male}</span><span>♀ ${z.female}</span></div>
    </div>`).join('');

  // Daily schedule
  const tabs = $('#dayTabs'), dayContent = $('#dayContent');
  function renderDay(id){
    const d = D.days.find(x=>x.id===id) || D.days[0];
    $$('.day-tab', tabs).forEach(b => b.classList.toggle('active', b.dataset.id===d.id));
    dayContent.innerHTML = `
      <div class="day-card">
        <div class="day-card-head"><span>${d.date}</span><div><b>${d.day}</b><h3>${d.title}</h3></div></div>
        <div class="timeline">${d.items.map((it,i)=>`<div class="time-item"><i>${String(i+1).padStart(2,'0')}</i><div><b>${it[0]}</b><span>${it[1]}</span><small class="event-time">⏱ ${it[2]}</small></div></div>`).join('')}</div>
      </div>`;
  }
  tabs.innerHTML = D.days.map((d,i)=>`<button class="day-tab ${i===0?'active':''}" data-id="${d.id}" role="tab"><b>${d.date}</b><span>${d.day}</span></button>`).join('');
  tabs.addEventListener('click', e => { const b=e.target.closest('.day-tab'); if(b) renderDay(b.dataset.id); });
  renderDay('16');

  // Sports
  const grid = $('#sportsGrid');
  function renderIcon(icon, extraClass=''){
    return /\.(svg|png|webp|jpg|jpeg)$/i.test(icon)
      ? `<img class="sport-icon-img ${extraClass}" src="${icon}" alt="" aria-hidden="true">`
      : icon;
  }
  function renderSports(q=''){
    q=q.trim().toLowerCase();
    const rows = D.sports.filter(s => `${s.name} ${s.cat} ${s.venue}`.toLowerCase().includes(q));
    grid.innerHTML = rows.map((s,i)=>`<button class="sport-card" data-name="${s.name}"><span class="sport-icon">${renderIcon(s.icon)}</span><div><h3>${s.name}</h3><p>${s.cat}</p><small>${s.venue}</small></div><b>→</b></button>`).join('') || '<p class="empty">Tiada acara dijumpai.</p>';
  }
  renderSports();
  $('#sportSearch').addEventListener('input', e => renderSports(e.target.value));

  // Sport modal
  const modal = $('#sportModal'), modalBody = $('#modalBody');
  grid.addEventListener('click', e => {
    const card=e.target.closest('.sport-card'); if(!card) return;
    const s=D.sports.find(x=>x.name===card.dataset.name); if(!s) return;
    modalBody.innerHTML=`<div class="modal-sport-icon">${renderIcon(s.icon,'modal-icon-img')}</div><span class="kicker">FORMAT PERTANDINGAN</span><h2 id="modalTitle">${s.name}</h2><p class="modal-cat">${s.cat}</p><div class="modal-facts"><div><small>Pendaftaran</small><b>${s.reg}</b></div><div><small>Beraksi</small><b>${s.play}</b></div></div><div class="modal-section"><small>Venue</small><p>${s.venue}</p></div><div class="modal-section"><small>Format ringkas</small><p>${s.rule}</p></div><p class="modal-note">Rujuk dokumen rasmi untuk syarat kategori pemain dan peraturan penuh.</p>`;
    modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
  });
  $$('[data-close-modal]').forEach(x=>x.addEventListener('click', closeModal));
  document.addEventListener('keydown', e=>{if(e.key==='Escape') closeModal();});
  function closeModal(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }

  // Venues
  $('#venueList').innerHTML = D.venues.map(v=>{
    const url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(v.query);
    return `<div class="venue-card"><span class="pin">${v.code}</span><div><h3>${v.name}</h3><p>${v.use}</p></div><a href="${url}" target="_blank" rel="noopener">Arah ↗</a></div>`;
  }).join('');

  // Emergency
  $('#emergencyGrid').innerHTML = D.emergencies.map(e=>`<a class="emergency-card" href="tel:${e.phone.replace(/[^0-9+]/g,'')}"><span>${e.icon}</span><div><b>${e.name}</b><p>${e.phone}</p></div><small>${e.distance}</small></a>`).join('');

  // Protocol gallery
  $('#protocolGallery').innerHTML = D.protocol.map(([name,src])=>`<a href="${src}" target="_blank" rel="noopener"><img loading="lazy" src="${src}" alt="${name}"><span>${name}</span></a>`).join('');


  // Live Google Sheet results rendered as portal cards
  const SHEET_ID = '1qiRF16JhUlDBV9ZvoO6YhA5JnCbjqFcs';
  const SHEET_GID = '1303193966';
  const sheetLoading = $('#sheetLoading');
  const resultsRefresh = $('#resultsRefresh');
  const resultsCards = $('#resultsCards');
  const resultsTableBody = $('#resultsTable tbody');
  const resultsError = $('#resultsError');
  const resultsUpdated = $('#resultsUpdated');
  const resultsSummaryGrid = $('#resultsSummaryGrid');
  const filterSport = $('#filterSport');
  const filterDate = $('#filterDate');
  const filterStatus = $('#filterStatus');
  const filterSearch = $('#filterSearch');
  let liveResults = [];

  const stripHtml = s => String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const norm = s => stripHtml(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const uniq = arr => [...new Set(arr.filter(Boolean))];
  const formatDateObj = d => d instanceof Date && !isNaN(d) ? d.toLocaleDateString('ms-MY',{day:'2-digit',month:'short',year:'numeric'}) : '';
  const formatTimeObj = d => d instanceof Date && !isNaN(d) ? d.toLocaleTimeString('ms-MY',{hour:'numeric',minute:'2-digit'}) : '';
  const cellText = c => {
    if(!c) return '';
    if(c.f) return stripHtml(c.f);
    if(c.v == null) return '';
    if(c.v instanceof Date) {
      const dt = formatDateObj(c.v), tm = formatTimeObj(c.v);
      return [dt, tm].filter(Boolean).join(' ');
    }
    return stripHtml(c.v);
  };
  const findHeader = (headers, patterns, {all=false}={}) => {
    const arr=[];
    headers.forEach((h,i)=>{
      const n=norm(h);
      if(patterns.some(rx=>rx.test(n))) arr.push(i);
    });
    return all ? arr : (arr[0] ?? -1);
  };
  const buildStatus = (statusRaw, scoreRaw='') => {
    const s=norm(statusRaw);
    const score = stripHtml(scoreRaw);
    if(/live|sedang|berlangsung|in progress|ongoing|on going/.test(s)) return ['live','LIVE'];
    if(/tamat|selesai|final|completed|full time|habis/.test(s)) return ['done','SELESAI'];
    if(/ditunda|postpone|tangguh/.test(s)) return ['upcoming','DITUNDA'];
    if(score && /\d/.test(score)) return ['done','SELESAI'];
    return ['upcoming', statusRaw ? statusRaw.toUpperCase() : 'JADUAL'];
  };

  function buildRecords(table){
    const headers=(table.cols||[]).map((c,i)=> stripHtml(c.label || c.id || `Kolum ${i+1}`));
    const idxSport = findHeader(headers,[/sukan/,/acara/,/event/,/sport/]);
    const idxStage = findHeader(headers,[/peringkat/,/kategori/,/round/,/stage/,/game/,/match/,/pusingan/]);
    const idxDate = findHeader(headers,[/tarikh/,/date/,/^hari$/]);
    const idxTime = findHeader(headers,[/masa/,/time/,/jam/]);
    const idxVenue = findHeader(headers,[/venue/,/lokasi/,/tempat/,/gelanggang/,/padang/,/dewan/]);
    const idxStatus = findHeader(headers,[/status/,/live/,/keadaan/]);
    const idxScore = findHeader(headers,[/^skor$/,/^score$/,/^keputusan$/,/^result$/,/^mata$/]);
    const idxNotes = findHeader(headers,[/catatan/,/nota/,/remarks/,/keterangan/]);
    const teamCols = findHeader(headers,[/pasukan/,/team/,/kontinjen/,/peserta/,/player/,/regu/],{all:true});
    const scoreCols = findHeader(headers,[/skor 1/,/score 1/,/mata 1/,/skor a/,/score a/,/home score/,/pasukan 1 skor/,/keputusan 1/,/skor 2/,/score 2/,/mata 2/,/skor b/,/score b/,/away score/,/pasukan 2 skor/,/keputusan 2/],{all:true});

    return (table.rows||[]).map((row,ri)=>{
      const cells = row.c || [];
      const values = cells.map(cellText);
      if(values.every(v=>!stripHtml(v))) return null;
      const pick = idx => idx >= 0 ? values[idx] || '' : '';
      let sport = pick(idxSport);
      let stage = pick(idxStage);
      let date = pick(idxDate);
      let time = pick(idxTime);
      let venue = pick(idxVenue);
      let statusRaw = pick(idxStatus);
      let notes = pick(idxNotes);

      const teams = teamCols.map(i=>values[i]).filter(Boolean);
      let teamA = teams[0] || '';
      let teamB = teams[1] || '';
      let score = '';
      if(scoreCols.length >= 2){
        const s1 = values[scoreCols[0]], s2 = values[scoreCols[1]];
        if(s1 || s2) score = `${s1 || '0'} - ${s2 || '0'}`;
      }
      if(!score) score = pick(idxScore);

      const genericCols = headers.map((h,i)=>({h:norm(h),v:values[i]}));
      if(!teamA){
        const matchup = genericCols.find(x=>/(matchup|perlawanan|vs|lawan)/.test(x.h) && x.v);
        if(matchup && /vs|\slwn\s|\slawan\s|\s-\s/.test(matchup.v.toLowerCase())){
          const parts = matchup.v.split(/vs|\slwn\s|\slawan\s|\s-\s/i).map(s=>s.trim()).filter(Boolean);
          teamA = parts[0] || ''; teamB = parts[1] || '';
        }
      }
      if(!sport){
        const maybe = genericCols.find(x=>/(bola|badminton|ping pong|karom|dart|olahraga|takraw|futsal|tarik tali|bowling|tampar)/.test(x.v.toLowerCase()));
        if(maybe) sport = maybe.v;
      }
      if(!venue){
        const maybe = genericCols.find(x=>/(stadium|padang|dewan|gelanggang|akademi|upm)/.test(x.v.toLowerCase()));
        if(maybe) venue = maybe.v;
      }
      if(!date || !time){
        const dt = genericCols.find(x=>/sep|okt|nov|dis|jan|feb|mac|apr|mei|jun|jul|ogo|aug|2026|pagi|petang|malam/.test(x.v.toLowerCase()));
        if(dt){
          if(!date) date = dt.v;
        }
      }

      const [statusKey, statusLabel] = buildStatus(statusRaw, score);
      const title = [sport, stage].filter(Boolean).join(' · ') || (teamA && teamB ? 'Perlawanan' : `Rekod ${ri+1}`);
      const sub = [date, time].filter(Boolean).join(' • ');
      if(!notes){
        const known = new Set([sport,stage,date,time,venue,statusRaw,score,teamA,teamB].map(x=>stripHtml(x)));
        notes = values.filter(v=>v && !known.has(stripHtml(v))).slice(0,2).join(' • ');
      }
      return {
        id: ri+1,
        sport: sport || 'Lain-lain',
        stage, date, time, venue,
        title, sub,
        teamA, teamB,
        score,
        statusKey, statusLabel,
        notes,
        search: [title, sport, stage, date, time, venue, teamA, teamB, score, statusLabel, notes].join(' ').toLowerCase()
      };
    }).filter(Boolean);
  }

  function setSummary(rows){
    const live = rows.filter(r=>r.statusKey==='live').length;
    const done = rows.filter(r=>r.statusKey==='done').length;
    const sports = uniq(rows.map(r=>r.sport)).length;
    resultsSummaryGrid.innerHTML = `
      <article><small>Perlawanan / Rekod</small><b>${rows.length}</b></article>
      <article><small>Sedang berlangsung</small><b>${live}</b></article>
      <article><small>Selesai</small><b>${done}</b></article>
      <article><small>Acara / sukan</small><b>${sports}</b></article>`;
  }

  function fillFilters(rows){
    const sports = uniq(rows.map(r=>r.sport)).sort((a,b)=>a.localeCompare(b,'ms'));
    const dates = uniq(rows.map(r=>r.date));
    filterSport.innerHTML = '<option value="">Semua sukan</option>' + sports.map(v=>`<option value="${v}">${v}</option>`).join('');
    filterDate.innerHTML = '<option value="">Semua tarikh</option>' + dates.map(v=>`<option value="${v}">${v}</option>`).join('');
  }

  function rowBadge(key, label){ return `<span class="result-status-badge ${key}">${label}</span>`; }
  function inlineBadge(key, label){ return `<span class="results-inline-badge result-status-badge ${key}">${label}</span>`; }

  function filteredRows(){
    const sport = filterSport?.value || '';
    const date = filterDate?.value || '';
    const status = filterStatus?.value || '';
    const search = (filterSearch?.value || '').trim().toLowerCase();
    return liveResults.filter(r =>
      (!sport || r.sport === sport) &&
      (!date || r.date === date) &&
      (!status || r.statusKey === status) &&
      (!search || r.search.includes(search))
    );
  }

  function renderResults(){
    const rows = filteredRows();
    if(!rows.length){
      resultsCards.innerHTML = '<div class="results-empty">Tiada rekod ditemui untuk tapisan semasa.</div>';
      resultsTableBody.innerHTML = '<tr><td colspan="6"><div class="results-empty">Tiada rekod ditemui untuk tapisan semasa.</div></td></tr>';
      return;
    }
    resultsCards.innerHTML = rows.slice(0,12).map(r=>`<article class="result-card ${r.statusKey}">
      <div class="result-card-top">${rowBadge(r.statusKey,r.statusLabel)}<small>${[r.date,r.time].filter(Boolean).join(' • ') || 'Jadual rasmi'}</small></div>
      <div><h3>${r.title}</h3>${r.sub ? `<div class="result-sub">${r.sub}</div>` : ''}</div>
      ${r.teamA || r.teamB ? `<div class="result-versus"><div class="result-team"><b>${r.teamA || '—'}</b>${r.teamA && r.teamB ? '<span>Pasukan A</span>' : ''}</div><div class="result-score ${r.score ? '' : 'dim'}">${r.score || 'VS'}</div><div class="result-team"><b>${r.teamB || '—'}</b>${r.teamA && r.teamB ? '<span>Pasukan B</span>' : ''}</div></div>` : `<div class="result-score dim">${r.score || 'Maklumat jadual'}</div>`}
      ${r.notes ? `<div class="result-note">${r.notes}</div>` : ''}
      <div class="result-extra"><span>${r.venue || 'Venue akan dimaklumkan'}</span><span>${r.sport}</span></div>
    </article>`).join('');

    resultsTableBody.innerHTML = rows.map(r=>`<tr>
      <td><b>${r.sport}</b>${r.stage ? `<small>${r.stage}</small>` : ''}</td>
      <td><div class="results-table-team">${r.teamA || r.teamB ? [r.teamA,r.teamB].filter(Boolean).join(' vs ') : r.title}</div>${r.notes ? `<small>${r.notes}</small>` : ''}</td>
      <td>${[r.date,r.time].filter(Boolean).join('<br>') || '—'}</td>
      <td>${r.venue || '—'}</td>
      <td>${r.score || '—'}</td>
      <td>${inlineBadge(r.statusKey,r.statusLabel)}</td>
    </tr>`).join('');
  }

  function loadLiveResults(){
    if(!resultsCards) return;
    sheetLoading?.classList.remove('hide');
    resultsError.hidden = true;
    const cbName = '__suknaSheetCallback' + Date.now();
    const oldScript = document.getElementById('suknaSheetScript'); if(oldScript) oldScript.remove();
    return new Promise((resolve, reject)=>{
      const timer = setTimeout(()=>{
        delete window[cbName];
        reject(new Error('timeout'));
      }, 15000);
      window[cbName] = (resp) => {
        clearTimeout(timer);
        delete window[cbName];
        resolve(resp);
      };
      const script = document.createElement('script');
      script.id = 'suknaSheetScript';
      script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&headers=1&tqx=responseHandler:${cbName};reqId:${Date.now()}`;
      script.onerror = () => { clearTimeout(timer); delete window[cbName]; reject(new Error('script')); };
      document.body.appendChild(script);
    }).then(resp=>{
      if(!resp || resp.status === 'error' || !resp.table) throw new Error('gviz');
      liveResults = buildRecords(resp.table);
      setSummary(liveResults);
      fillFilters(liveResults);
      renderResults();
      resultsUpdated.textContent = 'Kemaskini terakhir: ' + new Date().toLocaleTimeString('ms-MY',{hour:'numeric',minute:'2-digit',second:'2-digit'});
      sheetLoading?.classList.add('hide');
    }).catch(err=>{
      console.warn('Live results load failed', err);
      sheetLoading?.classList.add('hide');
      resultsError.hidden = false;
      if(!liveResults.length){
        resultsCards.innerHTML = '<div class="results-empty">Paparan custom belum dapat dimuatkan. Gunakan butang <b>Buka Paparan Penuh</b> sementara waktu.</div>';
        resultsTableBody.innerHTML = '<tr><td colspan="6"><div class="results-empty">Data tidak dapat dimuatkan.</div></td></tr>';
      }
      resultsUpdated.textContent = 'Gagal memuatkan data live';
    });
  }

  ;[filterSport, filterDate, filterStatus].forEach(el=>el?.addEventListener('change', renderResults));
  filterSearch?.addEventListener('input', renderResults);
  resultsRefresh?.addEventListener('click', loadLiveResults);
  if(resultsCards){
    loadLiveResults();
    setInterval(loadLiveResults, 120000);
  }

  // PWA install
  let deferredPrompt;
  const installBtn=$('#installBtn');
  window.addEventListener('beforeinstallprompt', e=>{e.preventDefault(); deferredPrompt=e; installBtn.hidden=false;});
  installBtn?.addEventListener('click', async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; installBtn.hidden=true; });

  // SW
  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{})); }
})();
