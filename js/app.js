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


  // Medal tally - live from Google Sheet
  const MEDAL_SHEET_ID = '15FW6RAQQLHWqPFdHlhjtQrhpB5GoyiAiETumjpOWvoY';
  const MEDAL_SHEET_URL = `https://docs.google.com/spreadsheets/d/${MEDAL_SHEET_ID}/edit?usp=sharing`;
  const MEDAL_REFRESH_MS = 60000;
  const medalFallback = (D.medals || []).map(m => ({...m}));
  let medalRefreshTimer = null;

  const medalNameAliases = new Map([
    ['zon hq','Zon Ibu Pejabat'],
    ['hq','Zon Ibu Pejabat'],
    ['zon ibu pejabat','Zon Ibu Pejabat'],
    ['ibu pejabat','Zon Ibu Pejabat'],
    ['zon tengah','Zon Tengah'],
    ['tengah','Zon Tengah'],
    ['zon utara','Zon Utara'],
    ['utara','Zon Utara'],
    ['zon timur','Zon Timur'],
    ['timur','Zon Timur'],
    ['zon selatan','Zon Selatan'],
    ['selatan','Zon Selatan'],
    ['zon sabah','Zon Sabah'],
    ['sabah','Zon Sabah']
  ]);

  const cleanMedalText = v => String(v ?? '').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
  const normMedal = v => cleanMedalText(v).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const medalNum = v => {
    const n = Number(String(v ?? '').replace(/[^0-9.-]/g,''));
    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
  };
  const canonicalMedalName = name => medalNameAliases.get(normMedal(name)) || cleanMedalText(name);

  function renderMedals(input, meta={}){
    const byName = new Map((input || []).filter(Boolean).map(m => [canonicalMedalName(m.name), {
      name: canonicalMedalName(m.name),
      gold: medalNum(m.gold),
      silver: medalNum(m.silver),
      bronze: medalNum(m.bronze)
    }]));

    const medals = medalFallback.map(base => {
      const live = byName.get(canonicalMedalName(base.name));
      const m = live || {...base};
      return {...m, total:(medalNum(m.gold)+medalNum(m.silver)+medalNum(m.bronze))};
    });

    // Include any additional contingents that may exist in the sheet.
    byName.forEach((m,name) => {
      if(!medals.some(x => canonicalMedalName(x.name) === name)) medals.push({...m, total:m.gold+m.silver+m.bronze});
    });

    const medalHasData = medals.some(m => m.total > 0);
    const medalSorted = [...medals].sort((a,b) => (b.gold-a.gold) || (b.silver-a.silver) || (b.bronze-a.bronze) || a.name.localeCompare(b.name,'ms'));
    const totals = medals.reduce((acc,m) => { acc.gold += m.gold; acc.silver += m.silver; acc.bronze += m.bronze; acc.total += m.total; return acc; }, {gold:0,silver:0,bronze:0,total:0});
    const setText = (id, value) => { const el=$(id); if(el) el.textContent=value; };
    setText('#medalGoldTotal', totals.gold);
    setText('#medalSilverTotal', totals.silver);
    setText('#medalBronzeTotal', totals.bronze);
    setText('#medalGrandTotal', totals.total);

    const medalStandings = $('#medalStandings');
    if(medalStandings){
      medalStandings.innerHTML = medalSorted.map((m,i) => `
        <div class="medal-row ${m.total>0?'has-medals':'empty-medals'}">
          <span class="medal-rank">${medalHasData ? i+1 : '–'}</span>
          <div class="medal-team"><b>${m.name}</b><small>${m.total>0 ? `${m.total} pingat` : 'Belum ada pingat disahkan'}</small></div>
          <span class="medal-count gold"><i></i><b>${m.gold}</b></span>
          <span class="medal-count silver"><i></i><b>${m.silver}</b></span>
          <span class="medal-count bronze"><i></i><b>${m.bronze}</b></span>
          <span class="medal-total"><b>${m.total}</b></span>
        </div>`).join('');
    }

    const when = meta.updatedAt || new Date();
    if(!meta.loading && !meta.error){
      setText('#medalUpdatedAt', `Dikemas kini ${when.toLocaleDateString('ms-MY',{day:'2-digit',month:'short'})} · ${when.toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`);
    }
  }

  function parseMedalTable(table){
    if(!table || !Array.isArray(table.rows)) return [];

    const cellText = c => {
      if(!c) return '';
      const value = c.f ?? c.v ?? '';
      return cleanMedalText(value);
    };

    const rawRows = table.rows.map((row, rowIndex) => ({
      rowIndex,
      values: (row.c || []).map(cellText)
    }));

    // DEBUG STRATEGY:
    // Do not trust GViz column labels. Instead, locate the ACTUAL header row
    // inside the sheet itself. This supports title rows / merged cells above
    // the table and prevents "Perak" / "Gangsa" from pointing to the wrong
    // columns.
    let header = null;

    for(const row of rawRows){
      const normalized = row.values.map(normMedal);

      const findIndex = regs => normalized.findIndex(v => regs.some(re => re.test(v)));
      const iName = findIndex([/^(kontinjen|zon|pasukan|team)$/, /kontinjen/, /^zon$/]);
      const iGold = findIndex([/^emas$/, /^gold$/, /emas/]);
      const iSilver = findIndex([/^perak$/, /^silver$/, /perak/]);
      const iBronze = findIndex([/^gangsa$/, /^bronze$/, /gangsa/]);

      if(iName >= 0 && iGold >= 0 && iSilver >= 0 && iBronze >= 0){
        header = { rowIndex:row.rowIndex, iName, iGold, iSilver, iBronze, values:row.values };
        break;
      }
    }

    // Fallback: some GViz responses still expose correct column labels.
    if(!header && Array.isArray(table.cols)){
      const labels = table.cols.map((c,i) => cleanMedalText(c.label || c.id || `kolum ${i+1}`));
      const findCol = regs => labels.findIndex(label => regs.some(re => re.test(normMedal(label))));
      const iName = findCol([/kontinjen/,/^zon$/, /pasukan/,/team/]);
      const iGold = findCol([/emas/,/gold/]);
      const iSilver = findCol([/perak/,/silver/]);
      const iBronze = findCol([/gangsa/,/bronze/]);
      if(iName >= 0 && iGold >= 0 && iSilver >= 0 && iBronze >= 0){
        header = { rowIndex:-1, iName, iGold, iSilver, iBronze, values:labels };
      }
    }

    if(!header){
      console.warn('Medal parser: header row not found', rawRows);
      throw new Error('Header Kontinjen / Emas / Perak / Gangsa tidak dijumpai');
    }

    const knownZones = new Set([
      'Zon Ibu Pejabat','Zon Tengah','Zon Utara',
      'Zon Timur','Zon Selatan','Zon Sabah'
    ]);

    const parsed = [];
    const startAt = header.rowIndex >= 0 ? header.rowIndex + 1 : 0;

    for(const row of rawRows){
      if(row.rowIndex < startAt) continue;

      const nameRaw = row.values[header.iName] || '';
      const canonical = canonicalMedalName(nameRaw);

      // If the expected name column is blank or decorated oddly,
      // scan the entire row for one of the 6 official zones.
      let zoneName = knownZones.has(canonical) ? canonical : '';
      if(!zoneName){
        for(const value of row.values){
          const maybe = canonicalMedalName(value);
          if(knownZones.has(maybe)){
            zoneName = maybe;
            break;
          }
        }
      }

      if(!zoneName) continue;

      const goldRaw = row.values[header.iGold] ?? '';
      const silverRaw = row.values[header.iSilver] ?? '';
      const bronzeRaw = row.values[header.iBronze] ?? '';

      const parsedRow = {
        name: zoneName,
        gold: medalNum(goldRaw),
        silver: medalNum(silverRaw),
        bronze: medalNum(bronzeRaw)
      };

      // Keep a clear console audit so each row can be checked one-by-one
      // without showing technical messages on the public portal.
      console.debug('[SUKNA medal row]', {
        sheetRow: row.rowIndex + 1,
        zone: zoneName,
        raw: { gold:goldRaw, silver:silverRaw, bronze:bronzeRaw },
        parsed: parsedRow
      });

      parsed.push(parsedRow);
    }

    // Deduplicate by zone, preferring the row with the larger tally.
    const byZone = new Map();
    for(const row of parsed){
      const prev = byZone.get(row.name);
      const score = row.gold + row.silver + row.bronze;
      const prevScore = prev ? prev.gold + prev.silver + prev.bronze : -1;
      if(!prev || score >= prevScore) byZone.set(row.name, row);
    }

    return [...byZone.values()];
  }

  let medalLastGoodRows = null;
  let medalRequestSerial = 0;

  function fetchMedalSheetOnce(){
    return new Promise((resolve,reject) => {
      const cb = '__suknaMedals_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      let settled = false;
      const cleanup = () => { script.remove(); try{ delete window[cb]; }catch(_){} };
      const timer = setTimeout(() => {
        if(settled) return;
        settled = true; cleanup(); reject(new Error('Google Sheet timeout'));
      }, 15000);

      window[cb] = payload => {
        if(settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        try{
          if(!payload || payload.status === 'error' || !payload.table){
            throw new Error('Google Sheet response invalid');
          }
          const rows = parseMedalTable(payload.table);
          if(!rows.length) throw new Error('Tiada rekod pingat dijumpai');
          resolve(rows);
        }catch(err){
          reject(err);
        }
      };

      script.onerror = () => {
        if(settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        reject(new Error('Google Sheet tidak dapat dimuatkan'));
      };

      // Cache-buster keeps the live medal tally fresh after sheet edits.
      const bust = Date.now() + '-' + Math.random().toString(36).slice(2);
      script.src = `https://docs.google.com/spreadsheets/d/${MEDAL_SHEET_ID}/gviz/tq?headers=0&tqx=responseHandler:${cb};reqId:${bust}`;
      document.body.appendChild(script);
    });
  }

  async function loadMedalSheet(){
    const requestId = ++medalRequestSerial;

    // IMPORTANT: never clear the current medal table while refreshing.
    // The previous code rendered the all-zero fallback before every request.
    // If Google Sheets was momentarily slow after an edit, the page stayed at zero.
    for(let attempt=0; attempt<3; attempt++){
      try{
        const rows = await fetchMedalSheetOnce();

        // Ignore an older response if a newer refresh has already started.
        if(requestId !== medalRequestSerial) return rows;

        medalLastGoodRows = rows;
        renderMedals(rows,{updatedAt:new Date()});
        return rows;
      }catch(err){
        console.warn(`Medal sheet sync attempt ${attempt+1} failed:`, err);
        if(attempt < 2){
          await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
          continue;
        }

        // Keep the last valid tally on screen. Never replace it with zeros.
        if(medalLastGoodRows){
          return medalLastGoodRows;
        }
        throw err;
      }
    }
  }

  const medalRefreshBtn = $('#medalRefreshBtn');
  medalRefreshBtn?.addEventListener('click', () => {
    medalRefreshBtn.disabled = true;
    loadMedalSheet().catch(()=>{}).finally(() => { medalRefreshBtn.disabled = false; });
  });
  renderMedals(medalFallback,{loading:true});
  loadMedalSheet().catch(()=>{});
  medalRefreshTimer = setInterval(() => loadMedalSheet().catch(()=>{}), MEDAL_REFRESH_MS);

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

  // PWA install
  let deferredPrompt;
  const installBtn=$('#installBtn');
  window.addEventListener('beforeinstallprompt', e=>{e.preventDefault(); deferredPrompt=e; installBtn.hidden=false;});
  installBtn?.addEventListener('click', async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; installBtn.hidden=true; });

  // SW
  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{})); }
})();
