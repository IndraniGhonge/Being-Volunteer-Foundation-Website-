const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICON={cal:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',pin:'<svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>'};
const EMO={Environment:'🌱',Education:'📚',Engagement:'🤝',Enablement:'🛠️'};
let ev=[],admin=false,editId=null,q='',flt='all',pageSize=6,pg=0,loaded=false;
async function api(url,opt={}){const r=await fetch(url,Object.assign({credentials:'same-origin'},opt));let d=null;try{d=await r.json()}catch(e){}if(!r.ok)throw new Error((d&&d.error)||'Something went wrong');return d}
async function loadEvents(){try{ev=await api('/api/events')}catch(e){ev=[]}loaded=true}
async function loadMe(){try{admin=!!(await api('/api/auth/me')).admin}catch(e){admin=false}}
const fmt=d=>{try{return new Date(d+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}catch(e){return d}};
const hue={Environment:'#d9efc8',Education:'#dbe8f7',Engagement:'#fde6c8',Enablement:'#f5d9e3'};
const imgOf=e=>e.img?`style="background-image:url('${esc(e.img)}')"`:`style="background:${hue[e.cat]||'#dadada'}"`;

function nav(r){const L=[['home','Home'],['about','About Us'],['4es',"4E's"],['upcoming','Upcoming Events'],['past','Past Events'],['admin','Admin Login']];
 $('#nav').innerHTML=L.map(([k,t])=>`<a href="#${k}" class="${r===k?'on':''}">${t}</a>`).join('')}

function home(){return `
<div class="pills"><a class="pill o" href="#upcoming">⚑ Upcoming Events</a><a class="pill g" href="#past">⚑ Previous Events</a></div>
<section class="hero"><div class="img"><img src="/images/hero.png" alt="BVF volunteers" style="width:100%;height:100%;object-fit:cover;display:block;"></div><div class="q"><small>WELCOME TO BEING VOLUNTEER FOUNDATION</small><h1>“Together, we make volunteering a way of life.”</h1></div></section>
<div class="cta"><a class="btn o" href="#upcoming">📅 Upcoming Events</a><a class="btn g" href="#past">🕘 Previous Events</a></div>

<div class="wrap">
  <section class="hero" style="display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:36px;padding:40px 0;max-width:1200px;margin:0 auto;">
    
    <div class="img" style="height:360px;border-radius:16px;overflow:hidden;">
      <img src="/images/hello.png" alt="BVF volunteers" style="width:100%;height:100%;object-fit:cover;display:block;">
    </div>

    <div style="padding:10px 20px;">
      <small style="color:#72a843;font-weight:700;letter-spacing:2px;font-size:12px;">WHO WE ARE</small>
      <h2 style="font-size:36px;line-height:1.2;color:#fff;margin:14px 0 18px;">Welcome to Being Volunteer</h2>
      <p style="font-size:16px;line-height:1.8;color:#e0e5ee;margin:0;">
        Being Volunteer Foundation (BVF), based in Pune, has been nurturing the spirit of volunteering for a decade. Through its 4E model — Environment, Education, Engagement, and Enablement — BVF connects individuals, corporates, and communities to create meaningful impact.
      </p>
      <a href="#past" style="display:inline-block;margin-top:24px;padding:12px 22px;background:#78b747;color:#fff;border-radius:7px;text-decoration:none;font-weight:600;">Explore Our Work →</a>
    </div>

  </section>
</div>
<section class="stats">
 <div class="stat"><h3>Volunteering | Engagement</h3><div class="row"><div><div class="num">2,00,000+</div><div class="lab">Volunteers Engaged</div></div><div><div class="num">5,00,000+</div><div class="lab">Volunteer Hours Contributed</div></div></div></div>
 <div class="stat"><h3>Tree Plantation &amp; Nurturing | Environment</h3><div class="num">10,000+</div><div class="lab">Trees Planted</div></div>
 <div class="stat"><h3>Sponsoring &amp; Mentoring Children | Education</h3><div class="num">10,000+</div><div class="lab">Children Benefited under School Adoption Program (SAP)</div></div>
 <div class="stat"><h3>Livelihood Generation | Enablement</h3><div class="row"><div><div class="num">200+</div><div class="lab">Women Supported through Livelihood Programs</div></div><div><div class="num">50,000+</div><div class="lab">Meals Served under Feeding the Hungry</div></div></div></div></section></div>
<div class="wrap"><section class="pvm"><div><h3>Philosophy</h3><p>Being Volunteer believes that, “Every human being has an innate desire to do something for another being.” Some people call it Individual Social Responsibility. And this is the core of BVF’s philosophy.</p></div><div><h3>Vision</h3><p>To build a nation where both the extremes of our society, the ‘haves’ and the ‘have-nots’ work together to make a beautiful world to live in.</p></div><div><h3>Mission</h3><p>To develop a culture of volunteering through innovative platforms · To initiate long-term and short-term projects focusing on specific social needs · To contribute towards achieving SDGs 2030.</p></div></section>
<section class="about" id="about"><div class="t"><h2>About Being Volunteer</h2><p>Being Volunteer Foundation, a Pune-based NGO and a champion in the volunteering realm, is a one-stop solution for everything related to volunteering. Fueled by a wonderful years, BVF has been steadily growing and nurturing the spirit of volunteering in the community. With dedication as its pulse, BVF has earned the confidence of CSRs, NGOs, and individuals who have transformed into passionate volunteers.</p><p>BVF enthusiastically embraces numerous projects, sustainably assessing their sustainability and ensuring volunteer engagement. Whether you’re a seasoned volunteer or just taking your first steps, BVF welcomes you with open arms.</p><p>Through these initiatives, BVF fosters a sense of individual social responsibility and nurtures lasting change.</p></div>

<div class="lg">
  <img src="/images/bvf-logo.png"
       alt="Being Volunteer Foundation logo"
       style="width:260px;max-width:100%;height:auto;display:block;margin:auto;">
</div>
</section>
<section class="fes" id="4es"><h2>Our Work – The 4Es</h2><div class="fg">${[['Environment','Tree plantation drives, waste management initiatives, climate action campaigns, and awareness sessions on sustainability.'],['Education','School Adoption Program (SAP), digital literacy, child mentorship, and remedial education support.'],['Engagement','Volunteer Kitchen, cultural events, awareness drives, community festivals, and campaigns.'],['Enablement','Livelihood programs, micro-enterprise support, women empowerment initiatives, and skill development workshops.']].map(([t,d])=>`<div class="fe"><div class="im">
  <img src="/images/${t.toLowerCase()}.jpg"
       alt="${t}"
       style="width:100%;height:100%;object-fit:cover;display:block;">
</div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></section></div>
<section class="contact"><div class="t"><h2>Contact Us</h2><b>Better yet, see us in person!</b><p>We love our volunteers, so feel free to visit during normal business hours.</p><a class="wa" href="https://wa.me/919604533919">Message us on WhatsApp</a><p><b>Being Volunteer</b><br>Being Volunteer Foundation, Pashan – Sus Road, behind Audi Showroom, Baner, Pune, Maharashtra, India<br>+91 9604533919</p></div>


<div class="map" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px;text-align:center;box-sizing:border-box;color:#000;background:#f5f5f5;">
  <div style="font-size:26px;">📍</div>
  <h3 style="font-size:17px;color:#000;margin:0;font-weight:700;">Visit Being Volunteer Foundation</h3>
  <p style="font-size:13px;color:#000;margin:0;font-weight:500;">Pashan–Sus Road, behind Audi Showroom, Baner, Pune</p>
  <a
    href="https://www.google.com/maps/search/?api=1&query=Being+Volunteer+Foundation+Pashan+Sus+Road+Pune"
    target="_blank"
    rel="noopener noreferrer"
    style="display:inline-block;padding:8px 14px;background:#2f7d43;color:#fff;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;">
    Open Location in Google Maps ↗
  </a>
</div>


</section>
<footer>BEING VOLUNTEER FOUNDATION, PASHAN – SUS ROAD, PUNE, MAHARASHTRA, INDIA<br>COPYRIGHT © 2026 BEING VOLUNTEER. ALL RIGHTS RESERVED.</footer>`}

function upcoming(){const l=ev.filter(e=>e.status==='upcoming').sort((a,b)=>a.date.localeCompare(b.date));
 return `<div class="pg"><h2>Upcoming Events</h2><p>Find a volunteering opportunity and register in a minute.</p><div class="grid">${l.map(e=>`<article class="ev"><div class="im" ${imgOf(e)}>${e.img?'':EMO[e.cat]||'🌍'}<span class="bdg">${esc(e.cat)}</span></div><div class="d"><h3>${esc(e.name)}</h3><div class="meta">${ICON.cal}${fmt(e.date)} • ${esc(e.time)}</div><div class="meta">${ICON.pin}${esc(e.loc)}</div><hr><div class="ds">${esc(e.desc)}</div>${e.ins?`<div class="ins"><b>Important Instructions:</b>${esc(e.ins)}</div>`:''}</div><a class="reg" href="${esc(e.link||'#')}" target="_blank" rel="noopener">Register Now →</a></article>`).join('')||'<div class="empty">No upcoming events right now. Check back soon!</div>'}</div></div>`}

function past(){const l=ev.filter(e=>e.status==='past').sort((a,b)=>b.date.localeCompare(a.date));
 return `<div class="pg"><h2>Past Events</h2><p>An organized record of BVF’s previous initiatives.</p><div class="grid">${l.map((e,i)=>`<article class="ev"><div class="im" ${imgOf(e)}>${e.img?'':EMO[e.cat]||'🌍'}<span class="bdg">✓ Completed</span></div><div class="d"><h3>${esc(e.name)}</h3><div class="meta">${ICON.cal}${fmt(e.date)}</div><div class="meta">${ICON.pin}${esc(e.loc)}</div><hr><div class="ds">${esc(e.desc)}</div><div class="sp"><div>👥 ${e.vol} Volunteers Participated</div><div style="margin-top:6px"><small>Measured Impact:</small>${esc(e.impact||'—')}</div></div></div><button class="vm" onclick="document.getElementById('g${i}').classList.toggle('open')">View More Images →</button><div class="gal" id="g${i}"><span style="background:${hue[e.cat]}">${EMO[e.cat]}</span><span style="background:#eee">📷</span><span style="background:#e8eef6">📷</span></div></article>`).join('')||'<div class="empty">No past events recorded yet.</div>'}</div></div>`}

function login(){return `<form class="login" onsubmit="doLogin(event)"><h2>Admin Login</h2><p style="color:var(--mut);font-size:12px;margin:0">Authorized BVF members only.</p><label>Username</label><input id="u" autocomplete="username" required><label>Password</label><input id="p" type="password" autocomplete="current-password" required><div id="le" style="color:#ef4444;font-size:12px;margin-top:8px"></div><button class="btn o" style="width:100%;justify-content:center;margin-top:14px">Login</button></form>`}
async function doLogin(e){e.preventDefault();try{await api('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:$('#u').value,password:$('#p').value})});admin=true;await loadEvents();render()}catch(x){$('#le').textContent=x.message}}
async function logout(){try{await api('/api/auth/logout',{method:'POST'})}catch(e){}admin=false;location.hash='home';render()}

function dash(){const up=ev.filter(e=>e.status==='upcoming').length,pa=ev.length-up,vols=ev.reduce((s,e)=>s+(+e.vol||0),0);
 let rows=ev.filter(e=>(flt==='all'||e.status===flt)&&(e.name+e.loc).toLowerCase().includes(q.toLowerCase()));
 const tot=rows.length;rows=rows.slice(pg*pageSize,pg*pageSize+pageSize);
 const f=editId?ev.find(e=>e.id===editId):{};
 return `<div class="adm"><div class="anav"><div><a class="on">Dashboard</a><a href="#upcoming">Upcoming Events</a><a href="#past">Past Events</a><a>Settings</a></div><div class="r"><span class="av"></span>Admin Portal<button class="lo" onclick="logout()">Logout</button></div></div>
<div class="ah"><h2>Admin Event Management</h2><p>Create, update, and monitor volunteering drives across communities.</p></div>
<div class="kpi">${[['Total Events',ev.length,'📅','#eef2f6'],['Upcoming Events',up,'🕒','#fff1de'],['Past Events',pa,'✅','#e5f4da'],['Total Volunteers',vols,'👥','#e1effa']].map(([a,b,c,d])=>`<div class="k"><div><small>${a}</small><b>${b}</b></div><i style="background:${d}">${c}</i></div>`).join('')}</div>
<div class="split"><div class="tc"><div class="th"><h3>All Events</h3><div><input id="sq" placeholder="Search drives..." value="${esc(q)}" oninput="q=this.value;pg=0;rer()"><select onchange="flt=this.value;pg=0;rer()"><option value="all">All Events</option><option value="upcoming" ${flt==='upcoming'?'selected':''}>Upcoming</option><option value="past" ${flt==='past'?'selected':''}>Completed</option></select><button class="add" onclick="editId=null;rer()">+ Add New Event</button></div></div>
<div class="tw"><table><tr><th>Event Name</th><th>Date</th><th>Location</th><th>Status</th><th>Volunteers</th><th style="text-align:right">Actions</th></tr>${rows.map(e=>`<tr><td><b>${esc(e.name)}</b></td><td>${fmt(e.date)}</td><td>${esc(e.loc)}</td><td><span class="st ${e.status==='upcoming'?'u':'c'}">${e.status==='upcoming'?'UPCOMING':'COMPLETED'}</span></td><td>👥 ${e.status==='upcoming'?e.vol+'/'+e.max:e.vol}</td><td class="ac" style="text-align:right"><button class="e" onclick="editId=${e.id};rer()">✎ Edit</button>${e.status==='upcoming'?`<button class="x" onclick="del(${e.id})">🗑 Delete</button><button class="mv" onclick="toPast(${e.id})">To Past</button>`:`<button class="x" onclick="del(${e.id})">🗑</button><a class="mv" style="padding:3px 8px;font:600 11px Inter" href="#past">View</a>`}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">No events found.</td></tr>'}</table></div>
<div class="pag"><span>Showing ${tot?pg*pageSize+1:0}-${Math.min(tot,pg*pageSize+pageSize)} of ${tot} events</span><span><button onclick="if(pg>0){pg--;rer()}" class="add" style="background:var(--panel);color:var(--ink)">‹</button> <button onclick="if((pg+1)*pageSize<${tot}){pg++;rer()}" class="add" style="background:var(--panel);color:var(--ink)">›</button></span></div></div>
<form class="fp" onsubmit="saveEv(event)"><h3>${editId?'Edit Event':'Add New Event'}</h3><p>Fill in the details to publish a new volunteering drive.</p>
<label>Event Name <i>*</i></label><input id="fn" required placeholder="e.g. Tree Plantation Drive" value="${esc(f.name)}">
<div class="two"><div><label>Event Date <i>*</i></label><input id="fd" type="date" required value="${esc(f.date)}"></div><div><label>Max Volunteers</label><input id="fm" type="number" min="0" placeholder="e.g. 50" value="${esc(f.max)}"></div></div>
<div class="two"><div><label>Time</label><input id="ft" placeholder="7:30 AM" value="${esc(f.time)}"></div><div><label>Category</label><select id="fc">${Object.keys(EMO).map(c=>`<option ${f.cat===c?'selected':''}>${c}</option>`).join('')}</select></div></div>
<label>Event Location <i>*</i></label><input id="fl" required placeholder="e.g. Sinhagad Fort, Pune" value="${esc(f.loc)}">
<label>Description</label><textarea id="fx" rows="3" placeholder="Provide details about the event...">${esc(f.desc)}</textarea>
<label>Important Instructions</label><input id="fi" value="${esc(f.ins)}">
<label>Google Form Registration Link</label><input id="fk" type="url" placeholder="https://forms.gle/..." value="${esc(f.link)}">
<label>Upload Event Image</label><label class="up">☁️<br><b>Click to upload image</b><br>PNG, JPG up to 5MB<input id="fimg" type="file" accept="image/png,image/jpeg" hidden onchange="this.parentNode.querySelector('b').textContent=this.files[0]?.name||'Click to upload image'"></label>
<div class="fb"><button type="button" onclick="editId=null;rer()">Cancel</button><button class="sv">Save Event</button></div></form></div></div>`}

async function saveEv(e){e.preventDefault();
 const fd=new FormData();
 [['name','fn'],['date','fd'],['max','fm'],['time','ft'],['cat','fc'],['loc','fl'],['desc','fx'],['ins','fi'],['link','fk']].forEach(([k,id])=>fd.append(k,$('#'+id).value));
 const file=$('#fimg').files[0];
 if(file){if(file.size>5e6){alert('Image must be under 5MB');return}fd.append('image',file)}
 try{await api(editId?'/api/events/'+editId:'/api/events',{method:editId?'PUT':'POST',body:fd});await loadEvents();editId=null;rer()}catch(x){alert(x.message)}}
async function del(id){if(confirm('Delete this event?')){try{await api('/api/events/'+id,{method:'DELETE'});await loadEvents();rer()}catch(x){alert(x.message)}}}
async function toPast(id){const e=ev.find(x=>x.id===id);const v=prompt('Volunteers who participated?',e.vol);if(v===null)return;const im=prompt('Measured impact / outcome?',e.impact||'');
 try{await api('/api/events/'+id+'/complete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vol:+v||0,impact:im||''})});await loadEvents();rer()}catch(x){alert(x.message)}}

function rer(){$('#app').innerHTML=dash();const s=$('#sq');if(s&&document.activeElement===document.body&&q){s.focus();s.setSelectionRange(q.length,q.length)}}
function render(){const h=(location.hash||'#home').slice(1)||'home';nav(h);const a=$('#app');
 if(h==='upcoming')a.innerHTML=upcoming();else if(h==='past')a.innerHTML=past();else if(h==='admin')a.innerHTML=admin?dash():login();
 else{a.innerHTML=home();if(h==='about'||h==='4es')setTimeout(()=>document.getElementById(h)?.scrollIntoView(),30);else scrollTo(0,0);return}
 scrollTo(0,0)}
addEventListener('hashchange',render);
Promise.all([loadMe(),loadEvents()]).then(render);
