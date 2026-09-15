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
        <div class="timeline">${d.items.map((it,i)=>`<div class="time-item"><i>${String(i+1).padStart(2,'0')}</i><div><b>${it[0]}</b><span>${it[1]}</span><small>${it[2]}</small></div></div>`).join('')}</div>
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
  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
})();
