/* CampusConnect prototype. All data is sample data; state lives in localStorage.
   BACKEND NEEDED for real use: auth, user profiles DB, messaging, notifications, moderation queue. */
const $ = (s, e = document) => e.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S;
try { S = JSON.parse(localStorage.getItem('cc')) || {}; } catch { S = {}; }
S = Object.assign({ act: {}, blocked: [], incoming: ['p2', 'p5'], prof: {}, priv: { prog: true, inst: true, req: true }, asks: [], wall: [], chal: [], posts: [], checkin: '', msgs: {}, theme: '' }, S);
const save = () => { try { localStorage.setItem('cc', JSON.stringify(S)); } catch {} };
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2800); };
const DEMO = ' (Demo only: nothing was sent to a real person.)';
const COL = ['#9fdcd3', '#f2b544', '#c9b8f0', '#f4a99a', '#a8d0f5'];
const av = n => `<span class="av" style="background:${COL[n.charCodeAt(0) % 5]}" aria-hidden="true">${esc(n[0])}</span>`;

/* ---- Sample data: id, title, subtitle, description, category, tags ---- */
const D = {
 people: { title: 'Find your people', intro: 'Discover students by programme, interests and availability. You control what others see (Dashboard > Privacy).', act: 'Connect', done: 'Request sent', cat: 'Programme', sort: 'Name',
  items: [['p1','Thandi','Sample University A · Cybersecurity · Year 3','Loves CTFs and explaining networking. Happy to chat on weekday evenings.','Cybersecurity',['Python','Networks']],
  ['p2','Kabelo','Sample College B · Business · Year 1','New to campus and keen to meet people from other programmes.','Business',['Excel','Football']],
  ['p3','Amina','Sample University A · Biology · Year 2','Lab partner wanted. I draw study diagrams for fun.','Biology',['Design','Hiking']],
  ['p4','Lerato','Sample College B · Law · Year 4','Mooting, debating and tea. Available weekends.','Law',['Public speaking','Writing']],
  ['p5','Tom','Sample University C · Computer Science · Year 2','Building a small web app. Looking for a design-minded teammate.','Computer Science',['JavaScript','Chess']],
  ['p6','Naledi','Sample University C · Education · Year 3','Peer tutor. Calm explanations, no judgement.','Education',['Tutoring','Music']]] },
 mentors: { title: 'MentorMatch', intro: 'Peer, professional and group mentors. Choose a format that fits your time.', act: 'Request mentorship', done: 'Request sent', cat: 'Type', sort: 'Name',
  items: [['m1','Dr. Mpho','Researcher · Sample University A · 12 yrs','Research methods, postgraduate study. English, Setswana. Format: 20-minute monthly check-in.','Professional',['Research','Postgrad']],
  ['m2','Sipho','Alumnus, Software Engineer · 6 yrs','Breaking into tech. Voice-note mentorship, replies within 48h.','Professional',['Careers','Tech']],
  ['m3','Grace','3rd-year Business student · Peer mentor','Helps first-years settle in. 10-minute guidance sessions.','Peer',['First year','Budgeting']],
  ['m4','Yusuf','3rd-year Cybersecurity student · Peer mentor','Module help for networks and security fundamentals. Async messaging.','Peer',['Cybersecurity','Modules']],
  ['m5','Ms. Kagiso','Entrepreneur · Founder, 9 yrs','Small group mentorship for student founders (max 5 per cohort).','Group',['Startups','Pitching']]] },
 study: { title: 'Study together', intro: 'Join a group, or start your own with the form below.', act: 'Join group', done: 'Joined', cat: 'Module', sort: 'Name',
  items: [['s1','Calculus survivors','Sample University A · 14 members','Past papers every Tuesday 18:00, Library room 2.','Mathematics',['Exam prep']],
  ['s2','Networking labs','Sample University A · 8 members','Virtual study room, Thursdays 20:00.','Networks',['Virtual']],
  ['s3','Accounting basics','Sample College B · 11 members','Weekly Q&A and shared summaries.','Accounting',['Resources']],
  ['s4','Anatomy flashcards','Sample University C · 19 members','Quiz nights, Sundays 17:00.','Biology',['Exam prep']]] },
 skills: { title: 'Skill exchange', intro: 'Everyone has something to teach. Swap skills instead of paying for tutoring.', act: 'Request exchange', done: 'Requested', cat: 'Skill', sort: 'Name',
  items: [['k1','Thandi','Teaches Python · Wants mathematics','Complementary match with Kabelo? Check below.','Programming',['Python','Maths']],
  ['k2','Amina','Teaches graphic design · Wants photography','45 minutes, twice a month.','Design',['Design','Photography']],
  ['k3','Lerato','Teaches public speaking · Wants research skills','Online or in person.','Communication',['Speaking','Research']],
  ['k4','Naledi','Teaches French · Wants English practice','Café chats, 30 minutes.','Languages',['French','English']],
  ['k5','Kabelo','Teaches Excel · Wants PowerPoint','Evenings only.','Office',['Excel','PowerPoint']]] },
 events: { title: 'Events', intro: 'RSVP to events across campuses. Create your own below.', act: 'RSVP', done: 'Going', cat: 'Category', sort: 'Name',
  items: [['e1','Career fair','Sample University A · 12 Nov','Meet employers and alumni.','Career',['In person']],
  ['e2','Mentorship mixer','Online · 14 Nov','Meet mentors in 10-minute rounds.','Mentorship',['Webinar']],
  ['e3','Disability inclusion awareness day','Sample College B · 20 Nov','Talks, accessible campus walk, open discussion.','Inclusion',['In person']],
  ['e4','Inter-campus 5-a-side','Sample University C · 22 Nov','Mixed-institution teams.','Sports',['Social']],
  ['e5','Cultural evening','Sample University A · 27 Nov','Food, music and stories.','Culture',['Social']]] },
 quick: { title: '15-minute connections', intro: 'Just 15 minutes. Always optional. Pick one when you have a gap.', act: 'Book 15 min', done: 'Booked', cat: 'Type', sort: 'Name',
  items: [['q1','Mentor conversation','Today 16:00 · with Sipho','Ask one career question.','Mentor',['Online']],
  ['q2','Virtual coffee','Tomorrow 10:30 · with Naledi','Chat about anything but assignments.','Social',['Online']],
  ['q3','Peer check-in','Today 19:00 · with Tom','How is semester going?','Check-in',['Online']],
  ['q4','Skill-share','Friday 12:00 · with Amina','Learn one design trick.','Skill',['In person']]] }
};
const toId = Object.fromEntries(Object.entries(D).flatMap(([k, v]) => v.items.map(i => [i[0], [k, i]])));

/* ---- Router ---- */
const PAGES = { home: 'Home', people: 'People', mentors: 'Mentors', study: 'Study', skills: 'Skills', kindness: 'Kindness', lounge: 'Lounge', events: 'Events', quick: '15 min', wellbeing: 'Wellbeing', messages: 'Messages', dash: 'Dashboard', rules: 'Safety', about: 'About' };
function nav(cur) {
  $('#nav').innerHTML = Object.entries(PAGES).map(([k, v]) => `<a href="#${k}" class="${k === cur ? 'on' : ''}" ${k === cur ? 'aria-current="page"' : ''}>${v}${k === 'dash' && S.incoming.length ? `<span class="n">${S.incoming.length}</span>` : ''}</a>`).join('');
}
function route() {
  const k = (location.hash.slice(1) in PAGES) ? location.hash.slice(1) : 'home';
  nav(k); $('#nav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false');
  $('#app').innerHTML = (D[k] ? list(k) : V[k]());
  document.title = PAGES[k] + ' · CampusConnect'; window.scrollTo(0, 0);
  if (k === 'home') counters();
  wire(k);
}

/* ---- Generic list view with search, filter, sort, simulated action ---- */
function list(k, f = {}) {
  const d = D[k], cats = [...new Set(d.items.map(i => i[4]))];
  return `<h1 style="font-size:2.6rem">${d.title}</h1><p>${d.intro}</p>
  <div class="tool"><input type="search" id="q" placeholder="Search" aria-label="Search" value="${esc(f.q || '')}">
  <select id="c" aria-label="Filter by ${d.cat}"><option value="">All ${d.cat.toLowerCase()}s</option>${cats.map(c => `<option ${f.c === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
  <select id="o" aria-label="Sort"><option>Sort: ${d.sort} A–Z</option><option ${f.o ? 'selected' : ''}>Sort: ${d.sort} Z–A</option></select></div>
  <div class="grid" id="res">${cards(k, f)}</div>${extra(k)}`;
}
function cards(k, f) {
  const q = (f.q || '').toLowerCase();
  let r = D[k].items.filter(i => !S.blocked.includes(i[0]) && (!f.c || i[4] === f.c) && (!q || i.flat().join(' ').toLowerCase().includes(q)));
  r.sort((a, b) => a[1].localeCompare(b[1]) * (f.o ? -1 : 1));
  if (!r.length) return `<p class="card">No results. Clear your search or choose another filter.</p>`;
  const on = id => S.act[id];
  return r.map(i => `<article class="card"><div class="head">${av(i[1])}<div><h3>${esc(i[1])}</h3><small>${esc(i[2])}</small></div></div><p>${esc(i[3])}</p>
  <div>${i[5].map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
  <div class="row"><button class="btn ghost" data-view="${i[0]}">View</button><button class="btn ${on(i[0]) ? 'done' : ''}" data-act="${i[0]}" aria-pressed="${!!on(i[0])}">${on(i[0]) ? D[k].done + ' · undo' : D[k].act}</button></div></article>`).join('');
}
function extra(k) {
  if (k === 'mentors') return `<div class="band"><h2>Ask a mentor</h2><p class="note">Anonymous questions are public without your name. Private mentorship conversations are separate and only visible to you and your mentor.</p>
  <form id="ask" novalidate><label for="aq">Your question</label><textarea id="aq"></textarea><label><input type="checkbox" id="an"> Ask anonymously</label><span class="err" id="ae"></span><br><button class="btn">Submit question</button></form>
  <div class="grid" style="margin-top:14px">${S.asks.map(a => `<div class="card"><small>${a.an ? 'Anonymous' : 'You'} asked:</small><p>${esc(a.q)}</p><small>Mentor reply: pending (a real backend would route this to mentors)</small></div>`).join('') || '<p>No questions yet. Ask the first one.</p>'}</div></div>`;
  if (k === 'study') return `<div class="band"><h2>Create a study group</h2><form id="sg" novalidate><label for="gn">Group name</label><input id="gn"><label for="gm">Module</label><input id="gm"><span class="err" id="ge"></span><br><button class="btn" style="margin-top:10px">Create group</button></form></div>`;
  if (k === 'skills') return `<div class="band"><h2>Suggested matches for you</h2><p>${S.prof.teach && S.prof.learn ? `You teach ${esc(S.prof.teach)} and want ${esc(S.prof.learn)}. Look for cards that teach what you want.` : 'Add skills you teach and want to learn on your Dashboard to see matches.'}</p></div>`;
  if (k === 'events') return `<div class="band"><h2>Create a student-led event</h2><form id="ev" novalidate><label for="en">Event name</label><input id="en"><span class="err" id="ee"></span><br><button class="btn" style="margin-top:10px">Create event</button></form></div>`;
  return '';
}

/* ---- Other views ---- */
const V = {
 home() { return `<section class="hero"><div><h1>You're not meant to navigate university alone.</h1>
  <p>Find your people, exchange knowledge, discover mentors and build meaningful connections, one interaction at a time.</p>
  <div class="cta"><a class="btn" href="#dash">Join the community</a><a class="btn ghost" href="#mentors">Find a mentor</a><a class="btn ghost" href="#people">Explore communities</a></div></div>
  <div class="faces" aria-hidden="true"><i style="background:#9fdcd3;width:110px;height:110px;left:10%;top:10%">T</i><i style="background:#f2b544;width:140px;height:140px;left:40%;top:0;animation-delay:.1s">K</i><i style="background:#c9b8f0;width:100px;height:100px;left:65%;top:42%;animation-delay:.2s">A</i><i style="background:#f4a99a;width:120px;height:120px;left:20%;top:52%;animation-delay:.3s">L</i></div></section>
  <p>University is more than lectures, assignments and examinations. It is about people, opportunities, shared experiences and growing together.</p>
  <div class="band"><h2>Community at a glance</h2><div class="stats">${[['Students connected', 1280], ['Mentors available', 96], ['Study groups', 214], ['Acts of kindness', 3410], ['Communities', 38]].map(s => `<div><b data-n="${s[1]}">0</b>${s[0]}</div>`).join('')}</div><p class="note">Demonstration statistics. They will show real numbers once a backend is connected.</p></div>
  <h2>How it works</h2><ol><li>Create your student profile.</li><li>Discover people with shared interests and goals.</li><li>Connect at your own convenience.</li><li>Learn, grow and support one another.</li></ol>
  <h2>Explore</h2><div class="grid">${[['people', 'Student communities', 'Find students by programme and interests.'], ['mentors', 'Available mentors', 'Peer, professional and group mentors.'], ['study', 'Study groups', 'Study with others on your modules.'], ['events', 'Upcoming events', 'Workshops, fairs and social gatherings.'], ['kindness', 'Acts of kindness', 'Appreciate someone today.'], ['skills', 'Skill exchange', 'Teach one skill, learn another.']].map(c => `<a class="card" href="#${c[0]}" style="text-decoration:none;color:inherit"><h3>${c[1]}</h3><p>${c[2]}</p></a>`).join('')}</div>`; },
 dash() { const p = S.prof, f = ['name', 'inst', 'prog', 'bio', 'teach', 'learn'], pc = Math.round(f.filter(x => p[x]).length / f.length * 100), pending = S.incoming.map(id => toId[id][1]);
  return `<h1 style="font-size:2.6rem">${p.name ? 'Welcome, ' + esc(p.name) : 'Welcome'}</h1>
  <div class="grid"><div class="card"><h3>Profile ${pc}% complete</h3><div class="bar"><i style="width:${pc}%"></i></div>
  <form id="pf">${[['name', 'First name'], ['inst', 'Institution'], ['prog', 'Programme'], ['bio', 'Short bio'], ['teach', 'Skill you can teach'], ['learn', 'Skill you want to learn']].map(x => `<label for="f_${x[0]}">${x[1]}</label><input id="f_${x[0]}" value="${esc(p[x[0]] || '')}">`).join('')}<br><button class="btn" style="margin-top:10px">Save profile</button></form></div>
  <div class="card"><h3>Pending connection requests</h3>${pending.length ? pending.map(i => `<div class="head">${av(i[1])}<div><b>${i[1]}</b><small>${i[2]}</small></div></div><div class="row"><button class="btn" data-acc="${i[0]}">Accept</button><button class="btn ghost" data-dec="${i[0]}">Decline</button></div>`).join('') : '<p>No pending requests.</p>'}</div>
  <div class="card"><h3>Your activity</h3><p>${['study', 'events', 'mentors', 'quick'].map(k => `${D[k].items.filter(i => S.act[i[0]]).length} ${PAGES[k].toLowerCase()}`).join(' · ')}</p><p class="note">Saved and joined items appear here.</p></div>
  <div class="card"><h3>Privacy</h3>${[['prog', 'Show my programme'], ['inst', 'Show my institution'], ['req', 'Allow connection requests']].map(x => `<label><input type="checkbox" data-priv="${x[0]}" ${S.priv[x[0]] ? 'checked' : ''}> ${x[1]}</label>`).join('')}<p class="note">Saved on this device. A real app would enforce this on the server.</p></div></div>`; },
 kindness() { const n = S.wall.length + S.chal.length, B = [['Welcoming Student', 1], ['Helpful Peer', 3], ['Community Contributor', 6]];
  return `<h1 style="font-size:2.6rem">Kindness corner</h1><p>Say thanks. Try a weekly challenge. No rankings, no popularity contest.</p>
  <div class="band"><h2>Appreciation wall</h2><form id="kf" novalidate><label for="kt">Thank someone</label><textarea id="kt" placeholder="Thank you to the student who helped me find my lecture room."></textarea><span class="err" id="ke"></span><br><button class="btn">Post appreciation</button></form></div>
  <div class="grid">${[...S.wall, 'Thank you to everyone who makes new students feel welcome.', 'I appreciate my study group for helping me understand mathematics.'].map(w => `<div class="card"><p>${esc(w)}</p></div>`).join('')}</div>
  <h2 style="margin-top:28px">This week's optional challenges</h2><div class="grid">${['Help someone understand a concept', 'Invite someone to your study group', 'Share a useful resource', 'Check on a classmate', 'Help someone find their way', 'Encourage someone'].map(c => `<label class="card"><span><input type="checkbox" data-ch="${c}" ${S.chal.includes(c) ? 'checked' : ''}> ${c}</span></label>`).join('')}</div>
  <h2 style="margin-top:28px">Your badges (private to you)</h2><p>${B.filter(b => n >= b[1]).map(b => `<span class="tag">${b[0]}</span>`).join('') || 'Post a thank-you or finish a challenge to earn your first badge.'}</p>`; },
 lounge() { const sp = ['General', 'Technology', 'Entrepreneurship', 'Wellbeing', 'Faith', 'Arts', 'Sports', 'Careers', 'International'], all = [...S.posts, { s: 'General', t: 'What helped you settle in during your first month?', r: 4 }, { s: 'Careers', t: 'Any tips for a first internship interview?', r: 7 }];
  return `<h1 style="font-size:2.6rem">Virtual lounge</h1><p>Reply whenever you like. Nobody expects an instant answer.</p>
  <div class="tool"><select id="ls" aria-label="Space"><option value="">All spaces</option>${sp.map(s => `<option>${s}</option>`).join('')}</select><input type="search" id="lq" placeholder="Search posts" aria-label="Search posts"></div>
  <form id="lf" class="card" novalidate><label for="lt">Start a discussion</label><select id="lp">${sp.map(s => `<option>${s}</option>`).join('')}</select><textarea id="lt"></textarea><span class="err" id="le"></span><button class="btn">Post</button></form>
  <div class="grid" id="lres" style="margin-top:16px">${all.map(p => `<div class="card" data-s="${p.s}"><span class="tag">${p.s}</span><p>${esc(p.t)}</p><div class="row"><button class="btn ghost" data-like>♥ ${p.r}</button><button class="btn ghost" data-rep>Report</button></div></div>`).join('')}</div>`; },
 wellbeing() { return `<h1 style="font-size:2.6rem">Wellbeing check-in</h1><p>Optional and private. How is your day?</p>
  <div class="cta">${['Doing well', 'Feeling busy', 'Need some encouragement', 'Looking for support'].map(c => `<button class="btn ${S.checkin === c ? '' : 'ghost'}" data-ci="${c}">${c}</button>`).join('')}</div>
  <p aria-live="polite">${S.checkin ? { 'Doing well': 'Great. Why not thank someone today?', 'Feeling busy': 'Try a 15-minute connection: short and optional.', 'Need some encouragement': 'You are doing better than you think. Send a friend a message.', 'Looking for support': 'Please reach out to your institution’s student support or counselling service.' }[S.checkin] : ''}</p>
  <div class="band"><b>CampusConnect is not a replacement for professional mental health support.</b> If you are in crisis, contact local emergency services or your campus counselling service. Add your institution's real contacts here.</div>`; },
 messages() { return `<h1 style="font-size:2.6rem">Messages</h1><p class="note">Demo: messages are stored only in your browser. Replies are simulated.</p><div class="chat"><div id="cl"></div><div class="card"><div class="msgs" id="ml" aria-live="polite"></div><form id="mf" style="display:flex;gap:8px"><input id="mi" aria-label="Message" style="flex:1"><button class="btn">Send</button></form></div></div>`; },
 rules() { return `<h1 style="font-size:2.6rem">Safety and guidelines</h1><ul>${['Respect everyone regardless of background.', 'No harassment, bullying or discrimination.', 'No unsolicited inappropriate messages. Respect boundaries.', 'Never share another student’s private information.', 'No academic dishonesty or impersonation.', 'Never exploit a mentorship relationship.'].map(r => `<li>${r}</li>`).join('')}</ul>
  <p>Use <b>Report</b> or <b>Block</b> on any profile (View). Manage visibility under Dashboard > Privacy. Need help? Contact your institution's student support.</p>`; },
 about() { return `<h1 style="font-size:2.6rem">About CampusConnect</h1><p>Many students struggle to make genuine friends, feel isolated in crowds, lack mentors or academic help, and have little time to connect across programmes and institutions.</p><div class="band"><b>Mission:</b> To create a kinder, more inclusive and connected tertiary education environment where every student has an opportunity to belong, contribute, learn and grow.</div><p>Nobody should have to figure it out alone.</p>`; }
};

/* ---- Behaviour ---- */
function counters() {
  document.querySelectorAll('[data-n]').forEach(e => { const t = +e.dataset.n, s = performance.now(); const go = n => { const p = Math.min((n - s) / 1200, 1); e.textContent = Math.round(t * p).toLocaleString(); if (p < 1) requestAnimationFrame(go); }; requestAnimationFrame(go); });
}
const refresh = k => { $('#app').innerHTML = list(k, { q: $('#q')?.value, c: $('#c')?.value, o: $('#o')?.selectedIndex }); wire(k); const q = $('#q'); };
function modal(html) { $('#mBody').innerHTML = html; const m = $('#modal'); if (!m.open) m.showModal(); }
function ask(el, id, msg) { const e = $('#' + id); e.textContent = msg; el.focus(); }
function wire(k) {
  const A = $('#app');
  if (D[k]) {
    const upd = () => { const f = { q: $('#q').value, c: $('#c').value, o: $('#o').selectedIndex }; $('#res').innerHTML = cards(k, f); wireCards(k); };
    ['#q', '#c', '#o'].forEach(s => $(s).addEventListener('input', upd)); wireCards(k);
  }
  const on = (s, ev, fn) => { const e = $(s, A); if (e) e.addEventListener(ev, fn); };
  on('#ask', 'submit', e => { e.preventDefault(); const q = $('#aq').value.trim(); if (q.length < 10) return ask($('#aq'), 'ae', 'Write at least 10 characters.'); S.asks.unshift({ q, an: $('#an').checked }); save(); toast('Question saved.' + DEMO); route(); });
  on('#sg', 'submit', e => { e.preventDefault(); const n = $('#gn').value.trim(), m = $('#gm').value.trim(); if (!n || !m) return ask($('#gn'), 'ge', 'Enter both a group name and a module.'); D.study.items.unshift(['s' + Date.now(), n, 'Your group · 1 member', 'Created by you. Add meeting details in the real app.', m, ['New']]); toast('Group created.'); route(); });
  on('#ev', 'submit', e => { e.preventDefault(); const n = $('#en').value.trim(); if (!n) return ask($('#en'), 'ee', 'Enter an event name.'); D.events.items.unshift(['e' + Date.now(), n, 'Student-led · date TBC', 'Created by you.', 'Social', ['Student-led']]); toast('Event created.'); route(); });
  on('#pf', 'submit', e => { e.preventDefault(); ['name', 'inst', 'prog', 'bio', 'teach', 'learn'].forEach(x => S.prof[x] = $('#f_' + x).value.trim()); save(); toast('Profile saved.'); route(); });
  A.querySelectorAll('[data-priv]').forEach(c => c.onchange = () => { S.priv[c.dataset.priv] = c.checked; save(); toast('Privacy updated.'); });
  A.querySelectorAll('[data-acc],[data-dec]').forEach(b => b.onclick = () => { const id = b.dataset.acc || b.dataset.dec; S.incoming = S.incoming.filter(x => x !== id); if (b.dataset.acc) S.act[id] = 1; save(); toast(b.dataset.acc ? 'Connection accepted.' : 'Request declined.'); route(); });
  on('#kf', 'submit', e => { e.preventDefault(); const t = $('#kt').value.trim(); if (t.length < 5) return ask($('#kt'), 'ke', 'Write a short message first.'); S.wall.unshift(t); save(); toast('Posted to the wall.'); route(); });
  A.querySelectorAll('[data-ch]').forEach(c => c.onchange = () => { const v = c.dataset.ch; S.chal = c.checked ? [...S.chal, v] : S.chal.filter(x => x !== v); save(); toast(c.checked ? 'Nice work.' : 'Challenge unchecked.'); });
  on('#lf', 'submit', e => { e.preventDefault(); const t = $('#lt').value.trim(); if (t.length < 5) return ask($('#lt'), 'le', 'Write a few words first.'); S.posts.unshift({ s: $('#lp').value, t, r: 0 }); save(); route(); toast('Posted.'); });
  const lf = () => { const s = $('#ls').value, q = $('#lq').value.toLowerCase(); A.querySelectorAll('#lres .card').forEach(c => c.hidden = (s && c.dataset.s !== s) || (q && !c.textContent.toLowerCase().includes(q))); };
  on('#ls', 'input', lf); on('#lq', 'input', lf);
  A.querySelectorAll('[data-like]').forEach(b => b.onclick = () => { b.textContent = '♥ ' + (parseInt(b.textContent.slice(2)) + 1); b.disabled = true; });
  A.querySelectorAll('[data-rep]').forEach(b => b.onclick = () => toast('Reported locally. A real app needs a moderation queue.'));
  A.querySelectorAll('[data-ci]').forEach(b => b.onclick = () => { S.checkin = b.dataset.ci; save(); route(); });
  if (k === 'messages') chat();
}
function wireCards(k) {
  document.querySelectorAll('[data-act]').forEach(b => b.onclick = () => { const id = b.dataset.act; S.act[id] = S.act[id] ? 0 : 1; save(); toast(S.act[id] ? D[k].done + '.' + DEMO : 'Undone.'); const f = { q: $('#q').value, c: $('#c').value, o: $('#o').selectedIndex }; $('#res').innerHTML = cards(k, f); wireCards(k); });
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { const i = toId[b.dataset.view][1], hide = (k === 'people' && !S.priv.inst) ? '' : i[2]; modal(`<h2 id="mTitle">${esc(i[1])}</h2><p><b>${esc(hide)}</b></p><p>${esc(i[3])}</p>
  <button class="btn ghost" id="rp">Report</button> <button class="btn ghost" id="bl">Block</button>`); $('#rp').onclick = () => { $('#modal').close(); toast('Report recorded locally.' + DEMO); }; $('#bl').onclick = () => { S.blocked.push(i[0]); save(); $('#modal').close(); toast(i[1] + ' blocked. Hidden from your results.'); refresh(k); }; });
}
function chat() {
  const C = ['Thandi', 'Sipho', 'Study group'], cur = chat.cur || 0, hist = n => S.msgs[n] || (S.msgs[n] = [{ me: 0, t: n === 'Study group' ? 'Session moved to 18:30.' : 'Hi! Happy to help with your question.', ts: '09:12', u: 1 }]);
  $('#cl').innerHTML = C.map((n, i) => `<button class="conv ${i === cur ? 'on' : ''}" data-c="${i}">${n} ${hist(n).some(m => m.u) && i !== cur ? '<span class="dot" aria-label="unread">●</span>' : ''}</button>`).join('');
  const h = hist(C[cur]); h.forEach(m => m.u = 0); save();
  $('#ml').innerHTML = h.map(m => `<div class="m ${m.me ? 'me' : ''}">${esc(m.t)}<small>${m.ts}</small></div>`).join('');
  document.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { chat.cur = +b.dataset.c; chat(); });
  $('#mf').onsubmit = e => { e.preventDefault(); const v = $('#mi').value.trim(); if (!v) return; const ts = new Date().toTimeString().slice(0, 5); h.push({ me: 1, t: v, ts }); save(); $('#mi').value = ''; chat(); setTimeout(() => { h.push({ me: 0, t: 'Simulated reply: thanks for your message!', ts, u: 0 }); save(); if (location.hash === '#messages') chat(); }, 1200); };
}

/* ---- Init ---- */
const setTheme = t => { document.documentElement.dataset.theme = t; S.theme = t; save(); };
setTheme(S.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('#themeBtn').onclick = () => setTheme(S.theme === 'dark' ? 'light' : 'dark');
$('#menuBtn').onclick = e => { const o = $('#nav').classList.toggle('open'); e.target.setAttribute('aria-expanded', o); };
$('#mClose').onclick = () => $('#modal').close();
addEventListener('hashchange', route); route();
