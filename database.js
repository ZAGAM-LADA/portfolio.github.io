// database.js — ZAGFORGE persistence layer with SQLite-first storage and JSON fallback.
const fs = require('fs');
const path = require('path');
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'zagforge.sqlite');
const JSON_FILE = path.join(DB_DIR, 'zagforge.json');
const now = () => new Date().toISOString();
let sqlite = null;
let memory = null;

function ensureStorage() { fs.mkdirSync(DB_DIR, { recursive: true }); }
function openSqlite() {
  try {
    const { DatabaseSync } = require('node:sqlite');
    sqlite = new DatabaseSync(DB_FILE);
    sqlite.exec('PRAGMA foreign_keys = ON;');
    sqlite.exec('PRAGMA journal_mode = WAL;');
    return true;
  } catch { sqlite = null; return false; }
}

const defaultProjects = [
  { title:'Music Streaming Interface', category:'WEB APP CONCEPT', description:'A polished media interface concept with clear navigation, player states, visual hierarchy, and responsive behavior.', tags:['HTML','CSS','JavaScript'], status:'Concept / portfolio build', preview_style:'music', demo_url:'#', featured:1, sort_order:1, role:'Frontend developer', duration:'2 weeks', outcome:'Responsive media UI with reusable interaction patterns', case_study:'Designed a responsive streaming experience around strong navigation, player states, and mobile-first component behavior.' },
  { title:'Conversion-focused Landing Page', category:'BUSINESS WEBSITE', description:'A visual system for a service brand with strong hierarchy, focused messaging, and clear CTA placement.', tags:['Responsive','UI Design','CSS'], status:'Concept / portfolio build', preview_style:'business', demo_url:'#', featured:0, sort_order:2, role:'UI + frontend developer', duration:'1 week', outcome:'Clearer hierarchy and stronger conversion path', case_study:'Structured the page around message hierarchy, proof, and a focused call-to-action so a visitor can understand the offer quickly.' },
  { title:'Analytics Dashboard Interface', category:'DASHBOARD UI', description:'A dashboard concept focused on data hierarchy, compact components, and a responsive layout ready for backend integration.', tags:['JavaScript','Components','UX'], status:'Concept / portfolio build', preview_style:'dashboard', demo_url:'#', featured:0, sort_order:3, role:'Frontend developer', duration:'2 weeks', outcome:'Reusable dashboard component system', case_study:'Built a compact analytics visual language with reusable stat cards, chart placeholders, state labels, and responsive behavior.' }
];

const defaultServices = [
  { title:'Responsive websites', description:'Modern layouts that adapt cleanly across phones, tablets, laptops, and large displays.', cta:'Discuss a site', sort_order:1 },
  { title:'Landing pages', description:'Focused pages with visual hierarchy, persuasive structure, and obvious calls to action.', cta:'Build a landing page', sort_order:2 },
  { title:'JavaScript interaction', description:'Menus, filters, forms, dynamic states, motion, and practical frontend functionality.', cta:'Add interaction', sort_order:3 },
  { title:'Frontend refinement', description:'Responsiveness fixes, UI cleanup, polish, and component-level improvements for existing sites.', cta:'Improve an interface', sort_order:4 }
];

const defaultTestimonials = [
  { name:'Portfolio placeholder', role:'Replace before publishing', company:'Client proof', quote:'Add a real client result here once you have permission to publish it. Real evidence is more valuable than invented praise.', initials:'ZF', featured:0, sort_order:1 }
];
const defaultFaqs = [
  { question:'What kind of work is a good fit?', answer:'Landing pages, business websites, frontend improvements, interactive UI, and focused dashboard interfaces are the strongest current fits.', sort_order:1 },
  { question:'How does a project start?', answer:'Send a short brief with your goal, pages or screens, references, timing, and budget range. The brief is stored privately so it can be reviewed and followed up.', sort_order:2 },
  { question:'Do you work with an existing design?', answer:'Yes. Existing Figma, screenshots, brand rules, or a live site can be used as the starting point for frontend implementation or refinement.', sort_order:3 },
  { question:'Can the site connect to a backend later?', answer:'Yes. The portfolio itself uses a Node.js backend and database layer, so the same approach can be extended for forms, dashboards, content, and other application features.', sort_order:4 }
];
const defaultSettings = {
  contact_email:'hello@yourdomain.com', hero_status:'Open for selected work', availability:'Selected client work',
  response_time:'Usually within 1 business day', location:'Pakistan · Remote', social_github:'https://github.com/',
  social_linkedin:'https://www.linkedin.com/', social_upwork:'https://www.upwork.com/', theme_default:'forge',
  site_title:'ZAGFORGE — Modern web development', site_description:'A premium software engineering portfolio focused on responsive websites, interactive interfaces, and practical full-stack foundations.',
  meta_title:'ZAGFORGE — Modern web development', meta_description:'Responsive websites, landing pages, JavaScript interfaces, and practical full-stack foundations.',
  announcement:'Now building selected portfolio projects and client-ready web experiences.', show_announcement:'true', show_availability:'true',
  calendly_url:'', profile_name:'Zaigham Shehzad', profile_title:'Software Engineering Student · Web Developer', profile_bio:'I build useful, polished web experiences with a focus on responsive design, clear user journeys, and clean code.', profile_image:'', social_links:''
};

const schemaSql = `
CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, admin_user_id INTEGER NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL, tags_json TEXT NOT NULL, status TEXT NOT NULL, preview_style TEXT NOT NULL DEFAULT 'dashboard', demo_url TEXT NOT NULL DEFAULT '#', featured INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, role TEXT NOT NULL DEFAULT '', duration TEXT NOT NULL DEFAULT '', outcome TEXT NOT NULL DEFAULT '', case_study TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, cta TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS inquiries (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', budget TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', priority TEXT NOT NULL DEFAULT 'normal', notes TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT 'portfolio', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS testimonials (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, company TEXT NOT NULL, quote TEXT NOT NULL, initials TEXT NOT NULL DEFAULT '', featured INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS faqs (id INTEGER PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS daily_metrics (metric_date TEXT PRIMARY KEY, page_views INTEGER NOT NULL DEFAULT 0, contact_starts INTEGER NOT NULL DEFAULT 0, contact_submits INTEGER NOT NULL DEFAULT 0, project_opens INTEGER NOT NULL DEFAULT 0, theme_switches INTEGER NOT NULL DEFAULT 0);
`;

function saveJson() { const temp=`${JSON_FILE}.tmp`; fs.writeFileSync(temp, JSON.stringify(memory,null,2),'utf8'); fs.renameSync(temp,JSON_FILE); }
function normalizeMemory() {
  if (!memory) memory = {};
  const defaults={admins:[],sessions:[],projects:[],services:[],inquiries:[],testimonials:[],faqs:[],settings:{},metrics:{}};
  for (const [k,v] of Object.entries(defaults)) if (!memory[k]) memory[k]=v;
}
function seedJson() {
  normalizeMemory();
  if (!memory.projects.length) memory.projects=defaultProjects.map((p,i)=>({...p,id:i+1,tags_json:JSON.stringify(p.tags),created_at:now(),updated_at:now()}));
  if (!memory.services.length) memory.services=defaultServices.map((s,i)=>({...s,id:i+1,created_at:now(),updated_at:now()}));
  if (!memory.testimonials.length) memory.testimonials=defaultTestimonials.map((t,i)=>({...t,id:i+1,created_at:now(),updated_at:now()}));
  if (!memory.faqs.length) memory.faqs=defaultFaqs.map((f,i)=>({...f,id:i+1,created_at:now(),updated_at:now()}));
  Object.entries(defaultSettings).forEach(([key,value])=>{if(!Object.prototype.hasOwnProperty.call(memory.settings,key)) memory.settings[key]=value;});
  saveJson();
}
function hasColumn(table,column){ return sqlite.prepare(`PRAGMA table_info(${table})`).all().some(r=>r.name===column); }
function addColumn(table,column,type){ if(!hasColumn(table,column)) sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`); }
function migrateSqlite(){
  addColumn('projects','role',"TEXT NOT NULL DEFAULT ''"); addColumn('projects','duration',"TEXT NOT NULL DEFAULT ''"); addColumn('projects','outcome',"TEXT NOT NULL DEFAULT ''"); addColumn('projects','case_study',"TEXT NOT NULL DEFAULT ''");
  addColumn('inquiries','priority',"TEXT NOT NULL DEFAULT 'normal'"); addColumn('inquiries','notes',"TEXT NOT NULL DEFAULT ''"); addColumn('inquiries','source',"TEXT NOT NULL DEFAULT 'portfolio'");
}
function initDatabase(){
  ensureStorage();
  if(openSqlite()) { sqlite.exec(schemaSql); migrateSqlite(); const c=sqlite.prepare('SELECT COUNT(*) AS count FROM projects').get().count; if(!c) seedSqlite(); ensureSqliteDefaults(); }
  else { if(fs.existsSync(JSON_FILE)) memory=JSON.parse(fs.readFileSync(JSON_FILE,'utf8')); seedJson(); }
}
function ensureSqliteDefaults(){ const stamp=now(); const insert=sqlite.prepare('INSERT OR IGNORE INTO settings (key,value,updated_at) VALUES (?,?,?)'); Object.entries(defaultSettings).forEach(([k,v])=>insert.run(k,v,stamp)); const tc=sqlite.prepare('SELECT COUNT(*) AS count FROM testimonials').get().count; if(!tc){const add=sqlite.prepare('INSERT INTO testimonials (name,role,company,quote,initials,featured,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)'); defaultTestimonials.forEach(x=>add.run(x.name,x.role,x.company,x.quote,x.initials,x.featured,x.sort_order,stamp,stamp));} const fc=sqlite.prepare('SELECT COUNT(*) AS count FROM faqs').get().count; if(!fc){const add=sqlite.prepare('INSERT INTO faqs (question,answer,sort_order,created_at,updated_at) VALUES (?,?,?,?,?)'); defaultFaqs.forEach(x=>add.run(x.question,x.answer,x.sort_order,stamp,stamp));} }
function seedSqlite(){
  const t=now();
  const p=sqlite.prepare('INSERT INTO projects (title,category,description,tags_json,status,preview_style,demo_url,featured,sort_order,role,duration,outcome,case_study,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  defaultProjects.forEach(x=>p.run(x.title,x.category,x.description,JSON.stringify(x.tags),x.status,x.preview_style,x.demo_url,x.featured,x.sort_order,x.role,x.duration,x.outcome,x.case_study,t,t));
  const s=sqlite.prepare('INSERT INTO services (title,description,cta,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?)'); defaultServices.forEach(x=>s.run(x.title,x.description,x.cta,x.sort_order,t,t));
  const tt=sqlite.prepare('INSERT INTO testimonials (name,role,company,quote,initials,featured,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)'); defaultTestimonials.forEach(x=>tt.run(x.name,x.role,x.company,x.quote,x.initials,x.featured,x.sort_order,t,t));
  const f=sqlite.prepare('INSERT INTO faqs (question,answer,sort_order,created_at,updated_at) VALUES (?,?,?,?,?)'); defaultFaqs.forEach(x=>f.run(x.question,x.answer,x.sort_order,t,t));
  const set=sqlite.prepare('INSERT INTO settings (key,value,updated_at) VALUES (?,?,?)'); Object.entries(defaultSettings).forEach(([k,v])=>set.run(k,v,t));
}
function parseProject(row){ return {...row,tags:JSON.parse(row.tags_json||'[]'),featured:Boolean(row.featured)}; }
function getProjects(){ if(sqlite) return sqlite.prepare('SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, id ASC').all().map(parseProject); return [...memory.projects].sort((a,b)=>(Number(b.featured)-Number(a.featured))||(Number(a.sort_order)-Number(b.sort_order))||(a.id-b.id)).map(parseProject); }
function getServices(){ if(sqlite) return sqlite.prepare('SELECT * FROM services ORDER BY sort_order ASC,id ASC').all(); return [...memory.services].sort((a,b)=>(a.sort_order-b.sort_order)||(a.id-b.id)); }
function listProjectsAdmin(){return getProjects();} function listServicesAdmin(){return getServices();}
function getTestimonials(){ if(sqlite) return sqlite.prepare('SELECT * FROM testimonials ORDER BY featured DESC,sort_order ASC,id ASC').all().map(x=>({...x,featured:Boolean(x.featured)})); return [...memory.testimonials].sort((a,b)=>(Number(b.featured)-Number(a.featured))||(a.sort_order-b.sort_order)||(a.id-b.id)).map(x=>({...x,featured:Boolean(x.featured)})); }
function getFaqs(){ if(sqlite) return sqlite.prepare('SELECT * FROM faqs ORDER BY sort_order ASC,id ASC').all(); return [...memory.faqs].sort((a,b)=>(a.sort_order-b.sort_order)||(a.id-b.id)); }
function getSettings(){ if(sqlite) return Object.fromEntries(sqlite.prepare('SELECT key,value FROM settings').all().map(r=>[r.key,r.value])); return {...memory.settings}; }
function setSettings(values){ const stamp=now(); const allowed=Object.keys(defaultSettings); allowed.filter(k=>Object.hasOwn(values,k)).forEach(k=>{const maxLength=k==='social_links'?6000:(k==='profile_bio'?1200:1500); const v=String(values[k]??'').trim().slice(0,maxLength); if(sqlite) sqlite.prepare('INSERT INTO settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at').run(k,v,stamp); else memory.settings[k]=v;}); if(!sqlite)saveJson(); }
function listInquiries(status=''){ if(sqlite) return status?sqlite.prepare('SELECT * FROM inquiries WHERE status=? ORDER BY id DESC').all(status):sqlite.prepare('SELECT * FROM inquiries ORDER BY id DESC').all(); return [...memory.inquiries].filter(x=>!status||x.status===status).sort((a,b)=>b.id-a.id); }
function createInquiry(input){ const stamp=now(); if(sqlite){const r=sqlite.prepare('INSERT INTO inquiries (name,email,company,budget,message,status,priority,notes,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(input.name,input.email,input.company,input.budget,input.message,'new','normal','',input.source||'portfolio',stamp,stamp); return Number(r.lastInsertRowid);} const id=(memory.inquiries.at(-1)?.id||0)+1; memory.inquiries.push({id,...input,status:'new',priority:'normal',notes:'',source:input.source||'portfolio',created_at:stamp,updated_at:stamp}); saveJson(); return id; }
function updateInquiry(id,patch){ const stamp=now(); const allowed=['status','priority','notes']; if(sqlite){ const parts=[],args=[]; for(const k of allowed) if(Object.hasOwn(patch,k)){parts.push(`${k}=?`);args.push(String(patch[k]).slice(0,3000));} if(!parts.length)return; args.push(stamp,id); sqlite.prepare(`UPDATE inquiries SET ${parts.join(',')},updated_at=? WHERE id=?`).run(...args); return;} const row=memory.inquiries.find(x=>x.id===id); if(row){for(const k of allowed)if(Object.hasOwn(patch,k))row[k]=String(patch[k]).slice(0,3000);row.updated_at=stamp;saveJson();}}
function deleteInquiry(id){ if(sqlite)sqlite.prepare('DELETE FROM inquiries WHERE id=?').run(id); else {memory.inquiries=memory.inquiries.filter(x=>x.id!==id);saveJson();} }
function projectPayload(input){return {title:input.title,category:input.category,description:input.description,tags:Array.isArray(input.tags)?input.tags.slice(0,8).map(String):[],status:input.status,preview_style:input.preview_style,demo_url:input.demo_url,featured:Number(Boolean(input.featured)),sort_order:Number(input.sort_order)||0,role:input.role||'',duration:input.duration||'',outcome:input.outcome||'',case_study:input.case_study||''};}
function createProject(input){const x=projectPayload(input),t=now();if(sqlite){const r=sqlite.prepare('INSERT INTO projects (title,category,description,tags_json,status,preview_style,demo_url,featured,sort_order,role,duration,outcome,case_study,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(x.title,x.category,x.description,JSON.stringify(x.tags),x.status,x.preview_style,x.demo_url,x.featured,x.sort_order,x.role,x.duration,x.outcome,x.case_study,t,t);return Number(r.lastInsertRowid);} const id=(memory.projects.at(-1)?.id||0)+1;memory.projects.push({id,...x,tags_json:JSON.stringify(x.tags),created_at:t,updated_at:t});saveJson();return id;}
function updateProject(id,input){const x=projectPayload(input),t=now();if(sqlite){sqlite.prepare('UPDATE projects SET title=?,category=?,description=?,tags_json=?,status=?,preview_style=?,demo_url=?,featured=?,sort_order=?,role=?,duration=?,outcome=?,case_study=?,updated_at=? WHERE id=?').run(x.title,x.category,x.description,JSON.stringify(x.tags),x.status,x.preview_style,x.demo_url,x.featured,x.sort_order,x.role,x.duration,x.outcome,x.case_study,t,id);return;}const row=memory.projects.find(p=>p.id===id);if(row){Object.assign(row,{...x,tags_json:JSON.stringify(x.tags),updated_at:t});saveJson();}}
function deleteProject(id){if(sqlite)sqlite.prepare('DELETE FROM projects WHERE id=?').run(id);else{memory.projects=memory.projects.filter(p=>p.id!==id);saveJson();}}
function createService(input){const t=now();if(sqlite){const r=sqlite.prepare('INSERT INTO services (title,description,cta,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?)').run(input.title,input.description,input.cta,Number(input.sort_order)||0,t,t);return Number(r.lastInsertRowid);}const id=(memory.services.at(-1)?.id||0)+1;memory.services.push({id,...input,sort_order:Number(input.sort_order)||0,created_at:t,updated_at:t});saveJson();return id;}
function updateService(id,input){const t=now();if(sqlite){sqlite.prepare('UPDATE services SET title=?,description=?,cta=?,sort_order=?,updated_at=? WHERE id=?').run(input.title,input.description,input.cta,Number(input.sort_order)||0,t,id);return;}const row=memory.services.find(s=>s.id===id);if(row){Object.assign(row,{...input,sort_order:Number(input.sort_order)||0,updated_at:t});saveJson();}}
function deleteService(id){if(sqlite)sqlite.prepare('DELETE FROM services WHERE id=?').run(id);else{memory.services=memory.services.filter(s=>s.id!==id);saveJson();}}
function listTestimonialsAdmin(){return getTestimonials();}
function createTestimonial(input){const t=now();if(sqlite){const r=sqlite.prepare('INSERT INTO testimonials (name,role,company,quote,initials,featured,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').run(input.name,input.role,input.company,input.quote,input.initials,input.featured?1:0,Number(input.sort_order)||0,t,t);return Number(r.lastInsertRowid);}const id=(memory.testimonials.at(-1)?.id||0)+1;memory.testimonials.push({id,...input,featured:Number(Boolean(input.featured)),sort_order:Number(input.sort_order)||0,created_at:t,updated_at:t});saveJson();return id;}
function updateTestimonial(id,input){const t=now();if(sqlite){sqlite.prepare('UPDATE testimonials SET name=?,role=?,company=?,quote=?,initials=?,featured=?,sort_order=?,updated_at=? WHERE id=?').run(input.name,input.role,input.company,input.quote,input.initials,input.featured?1:0,Number(input.sort_order)||0,t,id);return;}const row=memory.testimonials.find(x=>x.id===id);if(row){Object.assign(row,{...input,featured:Number(Boolean(input.featured)),sort_order:Number(input.sort_order)||0,updated_at:t});saveJson();}}
function deleteTestimonial(id){if(sqlite)sqlite.prepare('DELETE FROM testimonials WHERE id=?').run(id);else{memory.testimonials=memory.testimonials.filter(x=>x.id!==id);saveJson();}}
function listFaqsAdmin(){return getFaqs();}
function createFaq(input){const t=now();if(sqlite){const r=sqlite.prepare('INSERT INTO faqs (question,answer,sort_order,created_at,updated_at) VALUES (?,?,?,?,?)').run(input.question,input.answer,Number(input.sort_order)||0,t,t);return Number(r.lastInsertRowid);}const id=(memory.faqs.at(-1)?.id||0)+1;memory.faqs.push({id,...input,sort_order:Number(input.sort_order)||0,created_at:t,updated_at:t});saveJson();return id;}
function updateFaq(id,input){const t=now();if(sqlite){sqlite.prepare('UPDATE faqs SET question=?,answer=?,sort_order=?,updated_at=? WHERE id=?').run(input.question,input.answer,Number(input.sort_order)||0,t,id);return;}const row=memory.faqs.find(x=>x.id===id);if(row){Object.assign(row,{...input,sort_order:Number(input.sort_order)||0,updated_at:t});saveJson();}}
function deleteFaq(id){if(sqlite)sqlite.prepare('DELETE FROM faqs WHERE id=?').run(id);else{memory.faqs=memory.faqs.filter(x=>x.id!==id);saveJson();}}
function bumpMetric(metric){const date=new Date().toISOString().slice(0,10);const allowed=['page_views','contact_starts','contact_submits','project_opens','theme_switches'];if(!allowed.includes(metric))return;if(sqlite){sqlite.prepare('INSERT INTO daily_metrics(metric_date) VALUES (?) ON CONFLICT(metric_date) DO NOTHING').run(date);sqlite.prepare(`UPDATE daily_metrics SET ${metric}=${metric}+1 WHERE metric_date=?`).run(date);return;}if(!memory.metrics[date])memory.metrics[date]={page_views:0,contact_starts:0,contact_submits:0,project_opens:0,theme_switches:0};memory.metrics[date][metric]=(memory.metrics[date][metric]||0)+1;saveJson();}
function getAnalytics(days=30){const safe=Math.max(1,Math.min(90,Number(days)||30));const start=new Date(Date.now()-(safe-1)*86400000).toISOString().slice(0,10);if(sqlite)return sqlite.prepare('SELECT * FROM daily_metrics WHERE metric_date>=? ORDER BY metric_date ASC').all(start);return Object.entries(memory.metrics).filter(([date])=>date>=start).sort((a,b)=>a[0].localeCompare(b[0])).map(([metric_date,data])=>({metric_date,...data}));}
function getAnalyticsTotals(days=30){return getAnalytics(days).reduce((a,r)=>{for(const k of ['page_views','contact_starts','contact_submits','project_opens','theme_switches'])a[k]+=(Number(r[k])||0);return a;},{page_views:0,contact_starts:0,contact_submits:0,project_opens:0,theme_switches:0});}
function getStats(){const inquiries=listInquiries();return {inquiries:inquiries.length,newInquiries:inquiries.filter(i=>i.status==='new').length,projects:listProjectsAdmin().length,services:listServicesAdmin().length,testimonials:getTestimonials().length,faqs:getFaqs().length};}
function exportData(){const settings=getSettings();return {version:'4.1.0',exported_at:now(),settings,projects:getProjects(),services:getServices(),inquiries:listInquiries(),testimonials:getTestimonials(),faqs:getFaqs(),analytics:getAnalytics(90)};}
function getAdminByEmail(email){if(sqlite)return sqlite.prepare('SELECT * FROM admin_users WHERE email=?').get(email)||null;return memory.admins.find(a=>a.email===email)||null;}
function createAdmin(email,passwordHash){const t=now();if(sqlite){const r=sqlite.prepare('INSERT OR IGNORE INTO admin_users (email,password_hash,created_at) VALUES (?,?,?)').run(email,passwordHash,t);return Number(r.lastInsertRowid||0);}if(!memory.admins.some(a=>a.email===email))memory.admins.push({id:1,email,password_hash:passwordHash,created_at:t});saveJson();return 1;}
function updateAdminPassword(id,passwordHash){if(sqlite)sqlite.prepare('UPDATE admin_users SET password_hash=? WHERE id=?').run(passwordHash,id);else{const r=memory.admins.find(a=>a.id===id);if(r){r.password_hash=passwordHash;saveJson();}}}
function createSession(adminUserId,tokenHash,expiresAt){const t=now();if(sqlite){const r=sqlite.prepare('INSERT INTO sessions (token_hash,admin_user_id,expires_at,created_at) VALUES (?,?,?,?)').run(tokenHash,adminUserId,expiresAt,t);return Number(r.lastInsertRowid);}const id=(memory.sessions.at(-1)?.id||0)+1;memory.sessions.push({id,token_hash:tokenHash,admin_user_id:adminUserId,expires_at:expiresAt,created_at:t});saveJson();return id;}
function getSession(tokenHash){if(sqlite)return sqlite.prepare('SELECT s.*,a.email FROM sessions s JOIN admin_users a ON a.id=s.admin_user_id WHERE s.token_hash=? AND s.expires_at>?').get(tokenHash,now())||null;const s=memory.sessions.find(x=>x.token_hash===tokenHash&&x.expires_at>now());if(!s)return null;const a=memory.admins.find(x=>x.id===s.admin_user_id);return a?{...s,email:a.email}:null;}
function deleteSession(tokenHash){if(sqlite)sqlite.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash);else{memory.sessions=memory.sessions.filter(s=>s.token_hash!==tokenHash);saveJson();}}
function cleanupSessions(){const t=now();if(sqlite)sqlite.prepare('DELETE FROM sessions WHERE expires_at<=?').run(t);else{memory.sessions=memory.sessions.filter(s=>s.expires_at>t);saveJson();}}
module.exports={initDatabase,getProjects,getServices,getTestimonials,getFaqs,getSettings,setSettings,listInquiries,createInquiry,updateInquiry,deleteInquiry,listProjectsAdmin,listServicesAdmin,createProject,updateProject,deleteProject,createService,updateService,deleteService,listTestimonialsAdmin,createTestimonial,updateTestimonial,deleteTestimonial,listFaqsAdmin,createFaq,updateFaq,deleteFaq,bumpMetric,getAnalytics,getAnalyticsTotals,getStats,exportData,getAdminByEmail,createAdmin,updateAdminPassword,createSession,getSession,deleteSession,cleanupSessions};
