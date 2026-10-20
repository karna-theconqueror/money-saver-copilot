// MoneySaver Copilot — app logic (i18n, persistence, share links, WhatsApp, analytics)

/* ---------------- storage helpers ---------------- */
const LS = {
  get(k,f){ try{ const v=localStorage.getItem('msc_'+k); return v==null?f:JSON.parse(v); }catch(e){ return f; } },
  set(k,v){ try{ localStorage.setItem('msc_'+k, JSON.stringify(v)); }catch(e){} }
};

function track(ev){
  const evs = LS.get('events',[]);
  evs.push({e:ev, t:Date.now()});
  if(evs.length>500) evs.splice(0, evs.length-500);
  LS.set('events', evs);
  // forward to real analytics (GA4 / Plausible) if configured in config.js
  if (typeof window.mscTrack === 'function') window.mscTrack(ev);
}

/* ---------------- language ---------------- */
let lang = LS.get('lang','en');
const T = ()=>LANGS[lang] || LANGS.en;
function t(key, vars){
  let s = (T()[key] !== undefined) ? T()[key] : LANGS.en[key] || key;
  if(vars) Object.keys(vars).forEach(k=> s = s.replace('{'+k+'}', vars[k]));
  return s;
}
const sName = m => (lang==='hi' && m.hi && m.hi.name) ? m.hi.name : m.name;
const sWhy  = m => (lang==='hi' && m.hi && m.hi.why)  ? m.hi.why  : m.why;

function toggleLang(){
  lang = lang==='en' ? 'hi' : 'en';
  LS.set('lang', lang);
  track('lang_'+lang);
  applyLang();
}

function applyLang(){
  document.documentElement.lang = lang;
  document.getElementById('langbtn').textContent = lang==='en' ? 'हिन्दी' : 'English';
  document.getElementById('aboutbtn').textContent = t('about_btn');
  document.getElementById('hero-title').innerHTML = t('hero_title');
  document.getElementById('hero-sub').textContent = t('hero_sub');
  document.getElementById('startbtn').textContent = t('start');
  document.getElementById('how-t').textContent = t('how_title');
  document.getElementById('how-list').innerHTML = [t('how_1'),t('how_2'),t('how_3')].map(x=>`<li>${x}</li>`).join('');
  document.getElementById('ex-t').textContent = t('examples_title');
  document.getElementById('ex1').textContent = t('ex1');
  document.getElementById('ex2').textContent = t('ex2');
  document.getElementById('ex3').textContent = t('ex3');
  document.getElementById('ex-note').textContent = t('examples_note');
  document.getElementById('tot-lbl').textContent = t('yearly_value');
  document.getElementById('details-t').textContent = t('your_details');
  document.getElementById('draft-t').textContent = t('draft_title');
  document.getElementById('draft-sub').textContent = t('draft_sub');
  document.getElementById('copybtn').textContent = t('copy_draft');
  document.getElementById('wabtn').textContent = t('wa_share');
  document.getElementById('cardbtn').textContent = t('share_card');
  document.getElementById('restartbtn').textContent = t('restart');
  document.getElementById('disclaimer').textContent = t('disclaimer');
  document.getElementById('footer-note').textContent = t('footer_note') + ' · ';
  document.getElementById('qback').textContent = t('back');
  // detail field placeholders
  document.getElementById('f_name').placeholder = t('ph_name');
  document.getElementById('f_father').placeholder = t('ph_father');
  document.getElementById('f_addr').placeholder = t('ph_addr');
  document.getElementById('f_mob').placeholder = t('ph_mob');
  document.getElementById('pin').placeholder = t('q_pin_ph');
  // about modal
  document.getElementById('about-t').textContent = t('about_title');
  document.getElementById('about-b').innerHTML = t('about_body', {d:VERIFIED});
  document.getElementById('about-close').textContent = t('close');
  renderStats();
  // re-render active view
  if(!document.getElementById('quiz').classList.contains('hidden')) renderStep();
  if(!document.getElementById('results').classList.contains('hidden')) renderAll();
}

/* ---------------- questions ---------------- */
const STATES = ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha",
  "Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal",
  "Other / UT"];

const QUESTIONS = [
  { key:'income', q:'q_income',
    options:[{v:'1',l:'o_below15',s:'o_below15_s'},{v:'2',l:'o_bpl',s:'o_bpl_s'},
             {v:'4',l:'o_2_5',s:'o_2_5_s'},{v:'7',l:'o_5_8',s:'o_5_8_s'},{v:'12',l:'o_above8',s:'o_above8_s'}] },
  { key:'age', q:'q_age',
    options:[{v:'15',l:'o_below18',s:'o_school'},{v:'22',l:'o_18_25',s:'o_early'},
             {v:'33',l:'o_26_40'},{v:'50',l:'o_41_59'},{v:'68',l:'o_60',s:'o_senior'}] },
  { key:'gender', q:'q_gender',
    options:[{v:'female',l:'o_female'},{v:'male',l:'o_male'},{v:'other',l:'o_other'}] },
  { key:'work', q:'q_work',
    options:[{v:'student',l:'o_student'},{v:'farmer',l:'o_farmer',s:'o_farmer_s'},
             {v:'salaried',l:'o_salaried',s:'o_salaried_s'},{v:'business',l:'o_business',s:'o_business_s'},
             {v:'homemaker',l:'o_homemaker'},{v:'unemployed',l:'o_unemployed'},{v:'retired',l:'o_retired'}] },
  { key:'state', q:'q_state', pin:true,
    options: STATES.map(s=>({v:s, l:null, raw:s})) },
  { key:'area', q:'q_area',
    options:[{v:'urban',l:'o_urban'},{v:'rural',l:'o_rural'}] },
  { key:'flags', q:'q_flags', multi:true, note:'flags_note',
    options:[{v:'girl',l:'f_girl',s:'f_girl_s'},{v:'nopucca',l:'f_nopucca',s:'f_nopucca_s'},
             {v:'vendor',l:'f_vendor',s:'f_vendor_s'},{v:'land',l:'f_land',s:'f_land_s'},
             {v:'unorg',l:'f_unorg',s:'f_unorg_s'},{v:'ration',l:'f_ration',s:'f_ration_s'},
             {v:'divyang',l:'f_divyang',s:'f_divyang_s'}] }
];

let step = 0;
const answers = LS.get('answers', {});
if(!(answers.flags instanceof Set)) answers.flags = new Set(answers.flags || []);
function persist(){ LS.set('answers', {...answers, flags:[...answers.flags]}); }

/* ---------------- share link ---------------- */
function encodeState(){
  const o = {...answers, flags:[...answers.flags]};
  return btoa(unescape(encodeURIComponent(JSON.stringify(o))));
}
function decodeState(h){
  try{ return JSON.parse(decodeURIComponent(escape(atob(h)))); }catch(e){ return null; }
}
const APP_URL = ()=> location.origin + location.pathname;

/* ---------------- wizard ---------------- */
function startQuiz(){
  step = 0;
  track('quiz_start');
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('results').classList.add('hidden');
  document.getElementById('quiz').classList.remove('hidden');
  renderStep();
  window.scrollTo({top:0, behavior:'smooth'});
}

function goBack(){ if(step>0){ step--; renderStep(); } }

function renderStep(){
  const q = QUESTIONS[step];
  document.getElementById('progress').style.width = (step/QUESTIONS.length*100)+'%';
  document.getElementById('qnum').textContent = t('of', {n:step+1, t:QUESTIONS.length});
  document.getElementById('qtitle').textContent = t(q.q);

  const pinEl = document.getElementById('pin');
  const pinOk = document.getElementById('pinok');
  pinEl.classList.toggle('hidden', !q.pin);
  pinOk.classList.add('hidden');
  pinEl.value = answers.pin || '';

  const box = document.getElementById('qopts');
  box.innerHTML = '';
  box.className = 'opts' + (q.options.length<=4 ? ' two' : '');
  if(q.note){
    const n = document.createElement('div');
    n.className='multi-note'; n.textContent=t(q.note);
    box.appendChild(n);
  }

  q.options.forEach(o=>{
    const b = document.createElement('button');
    b.className='opt';
    b.innerHTML = (o.raw || t(o.l)) + (o.s ? `<small>${t(o.s)}</small>` : '');
    if(q.multi){
      if(answers[q.key].has(o.v)) b.classList.add('sel');
      b.onclick = ()=>{
        const s = answers[q.key];
        s.has(o.v) ? s.delete(o.v) : s.add(o.v);
        persist(); renderStep();
      };
    } else {
      if(answers[q.key]===o.v) b.classList.add('sel');
      b.onclick = ()=>{ answers[q.key]=o.v; persist(); renderStep(); next(); };
    }
    box.appendChild(b);
  });

  const actions = document.getElementById('qactions');
  actions.innerHTML='';
  if(q.multi){
    const n = document.createElement('button');
    n.className='btn'; n.textContent=t('see_results');
    n.onclick = ()=>next();
    actions.appendChild(n);
  }
  document.getElementById('qback').style.visibility = step>0 ? 'visible':'hidden';
}

// PIN code autofill
document.addEventListener('DOMContentLoaded', ()=>{
  const pinEl = document.getElementById('pin');
  pinEl.addEventListener('input', ()=>{
    pinEl.value = pinEl.value.replace(/\D/g,'').slice(0,6);
    answers.pin = pinEl.value;
    const pinOk = document.getElementById('pinok');
    if(pinEl.value.length===6){
      const st = PIN_CIRCLE[pinEl.value.slice(0,2)];
      if(st){
        answers.state = st; persist();
        pinOk.textContent = '✓ ' + st;
        pinOk.classList.remove('hidden');
        renderStep(); // highlight selected state
        document.getElementById('pinok').classList.remove('hidden');
      }
    } else pinOk.classList.add('hidden');
    persist();
  });
});

function next(){
  step++;
  if(step < QUESTIONS.length) renderStep();
  else showResults();
}

function buildProfile(){
  return {
    incomeLakh: parseFloat(answers.income),
    age: parseInt(answers.age),
    gender: answers.gender,
    work: answers.work,
    state: answers.state,
    flags: answers.flags
  };
}

function inr(n){ return '₹' + Number(n).toLocaleString('en-IN'); }

function matchesFor(p){
  return SCHEMES.filter(s=>{ try{ return s.match(p); }catch(e){ return false; }})
                .sort((a,b)=>b.value-a.value);
}

function isClaimed(id){ return LS.get('claimed',[]).includes(id); }

/* ---------------- results ---------------- */
function showResults(){
  history.replaceState(null,'','#s='+encodeState());
  track('quiz_complete');
  LS.set('completed', (LS.get('completed',0))+1);
  document.getElementById('quiz').classList.add('hidden');
  document.getElementById('results').classList.remove('hidden');
  renderAll();
  window.scrollTo({top:0, behavior:'smooth'});
}

function renderAll(){
  const p = buildProfile();
  const matches = matchesFor(p);

  // total excluding already-claimed
  const cash = matches.filter(s=>(s.tag==='cash'||s.tag==='subsidy') && !isClaimed(s.id));
  const cashTotal = cash.reduce((t,s)=>t+s.value,0);
  const covers = matches.filter(s=>s.tag==='cover');
  const others = matches.filter(s=>s.tag==='loan'||s.tag==='training'||s.tag==='savings');

  const totalEl = document.getElementById('total');
  const t0 = performance.now();
  (function tick(now){
    const k = Math.min(1,(now-t0)/900);
    totalEl.textContent = inr(Math.round(cashTotal * (1-Math.pow(1-k,3))));
    if(k<1) requestAnimationFrame(tick);
  })(t0);

  const bits=[];
  if(covers.length) bits.push(t('plus_covers'));
  if(others.length) bits.push(t('plus_others', {n:others.length}));
  document.getElementById('totalnote').textContent =
    t('matched', {n:matches.length}) + (bits.length? ' · '+bits.join(' · ') : '');

  const list = document.getElementById('resultlist');
  list.innerHTML='';
  if(!matches.length){
    list.innerHTML = `<div class="card" style="text-align:center"><p>${t('no_match')}</p></div>`;
  }
  matches.forEach((m,i)=>{
    const claimed = isClaimed(m.id);
    const d = document.createElement('div');
    d.className = 'result' + (claimed ? ' claimed' : '');
    d.innerHTML = `
      <div class="head">
        <div>
          <h3><a href="schemes/${m.id}.html" style="color:inherit;text-decoration:none">${sName(m)}</a></h3>
          <div class="agency">${m.agency}</div>
        </div>
        <span class="pill ${m.tag}">${m.worth}</span>
      </div>
      <p class="why">${sWhy(m)}</p>
      <div class="meta-row"><span class="verified">${t('verified',{d:VERIFIED})}</span></div>
      ${claimed?`<div class="why" style="margin:6px 0 0;font-size:.8rem;color:var(--green);font-weight:600">✓ ${t('claimed_excluded')}</div>`:''}
      <label class="claim">
        <input type="checkbox" ${claimed?'checked':''} data-id="${m.id}" onchange="toggleClaim(this)"/>
        ${t('claimed_label')}
      </label>
      <details ontoggle="if(this.open) track('scheme_details_${m.id}')">
        <summary>${t('checklist',{n:m.steps.length})}</summary>
        <ol>${m.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
        <a class="official" href="${m.url}" target="_blank" rel="noopener" onclick="track('official_${m.id}')">${t('official')}</a>
      </details>`;
    list.appendChild(d);
    track('scheme_view_'+m.id);
  });

  document.getElementById('draft').textContent = makeDraft(p, matches);
}

function toggleClaim(cb){
  const id = cb.dataset.id;
  let c = LS.get('claimed',[]);
  if(cb.checked){ if(!c.includes(id)) c.push(id); }
  else c = c.filter(x=>x!==id);
  LS.set('claimed', c);
  renderAll();
}

/* ---------------- application draft ---------------- */
function makeDraft(p, matches){
  const name = document.getElementById('f_name').value || '[Your Name]';
  const father = document.getElementById('f_father').value || "[Father's / Spouse's Name]";
  const addr = document.getElementById('f_addr').value || '[Your Full Address]';
  const mob = document.getElementById('f_mob').value || '[Mobile Number]';
  const top = matches.filter(m=>(m.tag==='cash'||m.tag==='subsidy') && !isClaimed(m.id)).slice(0,3);
  const use = top.length ? top : matches.slice(0,3);
  const flagText = {
    girl:'girl child under 10 in the family', nopucca:'family does not own a pucca house',
    vendor:'runs a small shop / street stall', land:'owns cultivable farm land',
    unorg:'works in the unorganised sector without PF/pension', ration:'holds a BPL / ration card',
    divyang:'a differently-abled member in the family', urban:'resides in an urban area',
    rural:'resides in a rural area'
  };
  return `To,
The Concerned Officer / Sir or Madam,

Subject: Application for government benefits under ${use.map(sName).join(', ') || 'eligible schemes'}

Respected Sir or Madam,

I, ${name}, son/daughter/wife of ${father}, residing at ${addr}, respectfully submit this application.

I wish to apply for the following government benefits, for which my household appears to be eligible as per the scheme rules:

${use.map((m,i)=>`${i+1}. ${sName(m)} — ${m.worth} (${m.agency})`).join('\n')}

About my household:
- Annual household income: approximately ${inr(Math.round(p.incomeLakh*100000))}
- Age of applicant: ${p.age} years
- Occupation: ${p.work}
- State / Union Territory: ${p.state}
${[...p.flags].filter(f=>flagText[f]).length ? '- Additional details: ' + [...p.flags].filter(f=>flagText[f]).map(f=>flagText[f]).join('; ') : ''}

I request you to kindly process my application and extend the benefits I am entitled to. All supporting documents (Aadhaar, income certificate, bank passbook and other scheme-specific papers) are enclosed / available on request.

Thanking you,
Yours faithfully,
${name}
${mob}
${new Date().toLocaleDateString('en-IN')}

Enclosures: Aadhaar card · Bank passbook · Income / BPL certificate · Passport photos · Other scheme-specific documents`;
}

['f_name','f_father','f_addr','f_mob'].forEach(id=>{
  document.addEventListener('DOMContentLoaded', ()=>{
    const el = document.getElementById(id);
    el.value = LS.get('details',{})[id] || '';
    el.addEventListener('input', ()=>{
      const d = LS.get('details',{}); d[id]=el.value; LS.set('details',d);
      const p = buildProfile();
      document.getElementById('draft').textContent = makeDraft(p, matchesFor(p));
    });
  });
});

/* ---------------- sharing ---------------- */
function copyDraft(){
  navigator.clipboard.writeText(document.getElementById('draft').textContent)
    .then(()=>toast(lang==='en' ? 'Draft copied — paste into WhatsApp, email or print it' : 'आवेदन कॉपी हो गया — व्हाट्सएप, ईमेल या प्रिंट करें'))
    .catch(()=>toast('Press Ctrl+C to copy'));
}

function shareWhatsApp(){
  track('share_whatsapp');
  const p = buildProfile();
  const total = matchesFor(p).filter(s=>(s.tag==='cash'||s.tag==='subsidy') && !isClaimed(s.id))
                             .reduce((t,s)=>t+s.value,0);
  const url = APP_URL() + '#s=' + encodeState();
  const text = t('wa_text', {total:inr(total), url});
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2800);
}

function shareResult(){
  track('share_card');
  const p = buildProfile();
  const matches = matchesFor(p).filter(s=>!isClaimed(s.id));
  const total = matches.filter(s=>s.tag==='cash'||s.tag==='subsidy').reduce((t,s)=>t+s.value,0);
  const url = APP_URL();

  const c = document.createElement('canvas');
  c.width=1080; c.height=1080;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0,0,1080,1080);
  g.addColorStop(0,'#0E7A55'); g.addColorStop(1,'#0A5C40');
  x.fillStyle=g; x.fillRect(0,0,1080,1080);

  x.fillStyle='rgba(255,255,255,.9)'; x.font='600 34px Inter, sans-serif'; x.textAlign='center';
  x.fillText('MoneySaver Copilot', 540, 130);

  const L = lang==='hi';
  x.fillStyle='#fff'; x.font='800 58px Inter, sans-serif';
  x.fillText(L?'मुझे मिले':'I found', 540, 300);
  x.font='800 130px Inter, sans-serif'; x.fillStyle='#FFD37A';
  x.fillText(inr(total) + (L?'/वर्ष':'/yr'), 540, 430);
  x.font='800 50px Inter, sans-serif'; x.fillStyle='#fff';
  x.fillText(L?'अप्राप्त सरकारी लाभ':'in unclaimed benefits', 540, 510);

  x.font='400 32px Inter, sans-serif'; x.fillStyle='rgba(255,255,255,.92)';
  matches.slice(0,3).forEach((m,i)=> x.fillText('✓  '+sName(m), 540, 620+i*56));
  if(matches.length>3) x.fillText(L?'और '+(matches.length-3)+' योजनाएँ…':'and '+(matches.length-3)+' more…', 540, 620+3*56);

  x.font='600 30px Inter, sans-serif'; x.fillStyle='rgba(255,255,255,.8)';
  x.fillText(L?'60 सेकंड में जाँचें · कोई लॉगिन नहीं':'60-second check · no login, fully private', 540, 940);
  x.font='700 34px Inter, sans-serif'; x.fillStyle='#FFD37A';
  x.fillText(url.replace(/^https?:\/\//,''), 540, 1000);

  const a=document.createElement('a');
  a.download='my-benefits.png'; a.href=c.toDataURL('image/png'); a.click();
  toast(L?'परिणाम कार्ड सेव हो गया — कहीं भी साझा करें!':'Result card saved — post it anywhere!');
}

/* ---------------- about / stats ---------------- */
function openAbout(){
  renderStats();
  const m = document.getElementById('aboutmodal');
  m.classList.remove('hidden');
  m.style.display = 'flex';   // inline style beats any cached stylesheet
}
function closeAbout(){
  const m = document.getElementById('aboutmodal');
  m.classList.add('hidden');
  m.style.display = 'none';   // inline style beats any cached stylesheet
}
document.addEventListener('click', e=>{
  if(e.target.id==='aboutmodal') closeAbout();
});
document.addEventListener('keydown', e=>{
  if(e.key==='Escape') closeAbout();
});
// belt-and-suspenders: bind close button directly too
document.addEventListener('DOMContentLoaded', ()=>{
  const cb = document.getElementById('about-close');
  if(cb) cb.addEventListener('click', closeAbout);
});

function renderStats(){
  const evs = LS.get('events',[]);
  const box = document.getElementById('statsbox');
  if(!box) return;
  box.innerHTML = `
    <div>👁 ${t('stat_visits')}: <b>${LS.get('visits',0)}</b></div>
    <div>✅ ${t('stat_completed')}: <b>${LS.get('completed',0)}</b></div>
    <div> schemes viewed: <b>${evs.filter(e=>e.e.startsWith('scheme_view')).length}</b></div>
    <div>🌐 ${t('stat_lang')}: <b>${T()._label}</b></div>`;
}

function restart(){
  Object.keys(answers).forEach(k=>delete answers[k]);
  answers.flags = new Set();
  persist();
  history.replaceState(null,'',location.pathname);
  startQuiz();
}

/* ---------------- boot ---------------- */
(function init(){
  LS.set('visits', LS.get('visits',0)+1);
  track('visit');

  // restore from shared link
  const m = location.hash.match(/#s=(.+)$/);
  if(m){
    const st = decodeState(m[1]);
    if(st){
      Object.assign(answers, st);
      answers.flags = new Set(st.flags||[]);
      persist();
      applyLang();
      showResults();
      return;
    }
  }
  // restore from previous session (jump straight to results if completed before)
  const hasAll = ['income','age','gender','work','state'].every(k=>answers[k]);
  applyLang();
  if(hasAll && LS.get('completed',0)>0 && location.hash!=='#quiz'){
    showResults();
  }
})();
