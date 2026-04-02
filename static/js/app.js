/* ─── DecisionIQ v2 ─────────────────────────── */

let currentType = 'startup';
let lastResult = null;
let compareResults = [];

// ─── Canvas Background ──────────────────────────
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.r = Math.random() * 1.2 + 0.3;
    this.vx = (Math.random() - .5) * 0.3;
    this.vy = (Math.random() - .5) * 0.3;
    this.alpha = Math.random() * 0.4 + 0.1;
    this.color = Math.random() > .5 ? '59,130,246' : '139,92,246';
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
    ctx.fill();
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

// Connection lines
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(59,130,246,${0.06 * (1 - dist / 100)})`;
        ctx.lineWidth = .5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animateBG() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  particles.forEach(p => p.draw());
  requestAnimationFrame(animateBG);
}
animateBG();

// ─── Sidebar ────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
document.addEventListener('click', e => {
  const sb = document.getElementById('sidebar');
  if (sb.classList.contains('open') && !sb.contains(e.target) && !e.target.closest('.menu-btn')) {
    sb.classList.remove('open');
  }
});

// ─── Page Routing ───────────────────────────────
function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  document.getElementById(`page-${name}`)?.classList.add('active');
  if (el) el.classList.add('active');
  if (name === 'history') loadHistory();
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
}

// ─── Dynamic Fields ─────────────────────────────
const FIELDS = {
  startup: `
    <div class="form-row-2">
      <div class="form-group"><label class="label">Funding Raised</label><input id="f_funding" class="input" placeholder="e.g. 2M USD, 50 Lakh, Bootstrapped"></div>
      <div class="form-group"><label class="label">Monthly Revenue (MRR)</label><input id="f_mrr" class="input" placeholder="e.g. 50K INR, Pre-revenue"></div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Industry / Sector</label><input id="f_industry" class="input" placeholder="e.g. EdTech, FinTech"></div>
      <div class="form-group"><label class="label">Business Model</label>
        <select id="f_biz_model" class="input select"><option value="">Select</option><option>SaaS</option><option>Marketplace</option><option>D2C</option><option>B2B Service</option><option>Subscription</option><option>Trading</option></select>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Market Size</label>
        <select id="f_market_size" class="input select"><option value="2">Medium (₹500Cr–5000Cr)</option><option value="3">Large (₹5000Cr+)</option><option value="1">Small (₹100–500Cr)</option><option value="0">Niche</option></select>
      </div>
      <div class="form-group"><label class="label">Competition</label>
        <select id="f_competition" class="input select"><option value="">Select</option><option>Low</option><option>Moderate</option><option>High</option><option>Intense</option></select>
      </div>
    </div>`,
  coaching: `
    <div class="form-row-2">
      <div class="form-group"><label class="label">Exam / Subject Focus</label><input id="f_exam_focus" class="input" placeholder="e.g. IIT-JEE, UPSC, CAT"></div>
      <div class="form-group"><label class="label">Students Enrolled</label><input id="f_student_count" class="input" placeholder="e.g. 200"></div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Faculty Count</label><input id="f_faculty_count" class="input" placeholder="e.g. 12"></div>
      <div class="form-group"><label class="label">Annual Fee / Student</label><input id="f_fee_per_student" class="input" placeholder="e.g. 1,20,000 INR"></div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Delivery Mode</label>
        <select id="f_delivery_mode" class="input select"><option value="">Select</option><option>Offline (Classroom)</option><option>Online (Live)</option><option>Hybrid (Online + Offline)</option><option>Recorded + Live Doubt</option></select>
      </div>
      <div class="form-group"><label class="label">Past Results</label><input id="f_success_rate" class="input" placeholder="e.g. 45 IIT selections 2023"></div>
    </div>`,
  restaurant: `
    <div class="form-row-2">
      <div class="form-group"><label class="label">Cuisine Type</label><input id="f_cuisine" class="input" placeholder="e.g. North Indian, Multi-Cuisine"></div>
      <div class="form-group"><label class="label">Restaurant Type</label>
        <select id="f_rest_type" class="input select"><option value="">Select</option><option>Cloud Kitchen</option><option>Quick Service (QSR)</option><option>Cafe / Bistro</option><option>Dine-in Restaurant</option><option>Fine Dining</option></select>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Avg Order Value (₹)</label><input id="f_avg_order" class="input" placeholder="e.g. 350"></div>
      <div class="form-group"><label class="label">Footfall / Location</label>
        <select id="f_footfall" class="input select"><option value="2">High (Market area)</option><option value="3">Very High (CBD)</option><option value="1">Medium (Residential)</option><option value="0">Low</option></select>
      </div>
    </div>
    <div class="form-group"><label class="label">Delivery Platform</label>
      <select id="f_delivery_platform" class="input select"><option value="">Dine-in only</option><option>Zomato + Swiggy both</option><option>Zomato only</option><option>Swiggy only</option></select>
    </div>`,
  retail: `
    <div class="form-row-2">
      <div class="form-group"><label class="label">Product Category</label><input id="f_product_category" class="input" placeholder="e.g. Skincare, Fashion"></div>
      <div class="form-group"><label class="label">Sales Channel</label>
        <select id="f_sales_channel" class="input select"><option value="">Select</option><option>D2C Website (Shopify)</option><option>Amazon FBA</option><option>Omnichannel</option><option>Instagram Commerce</option><option>Meesho/Flipkart</option></select>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Monthly Orders</label><input id="f_monthly_orders" class="input" placeholder="e.g. 500"></div>
      <div class="form-group"><label class="label">Avg Selling Price (₹)</label><input id="f_avg_price" class="input" placeholder="e.g. 799"></div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Niche Demand</label>
        <select id="f_niche_demand" class="input select"><option value="2">Growing</option><option value="3">High demand</option><option value="1">Stable</option><option value="0">Declining</option></select>
      </div>
      <div class="form-group"><label class="label">Repeat Rate %</label><input id="f_repeat_rate" class="input" placeholder="e.g. 30"></div>
    </div>`,
  saas: `
    <div class="form-row-2">
      <div class="form-group"><label class="label">Funding Raised</label><input id="f_funding" class="input" placeholder="e.g. $2M Seed, Bootstrapped"></div>
      <div class="form-group"><label class="label">Monthly Recurring Revenue</label><input id="f_mrr" class="input" placeholder="e.g. $20K MRR"></div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Target Customer</label>
        <select id="f_saas_target" class="input select"><option value="b2b">B2B</option><option value="enterprise">Enterprise</option><option value="b2c">B2C</option></select>
      </div>
      <div class="form-group"><label class="label">Paying Customers</label><input id="f_saas_users" class="input" placeholder="e.g. 200"></div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Monthly Churn %</label><input id="f_churn" class="input" placeholder="e.g. 3"></div>
      <div class="form-group"><label class="label">Market Size</label>
        <select id="f_market_size" class="input select"><option value="2">Medium</option><option value="3">Large</option><option value="1">Small</option></select>
      </div>
    </div>`,
  healthcare: `
    <div class="form-row-2">
      <div class="form-group"><label class="label">Healthcare Segment</label><input id="f_health_segment" class="input" placeholder="e.g. Telemedicine, Diagnostics"></div>
      <div class="form-group"><label class="label">Regulatory Status</label>
        <select id="f_reg_status" class="input select"><option value="">Select</option><option>Licensed / Certified</option><option>In Progress</option><option>Not Started</option><option>Not Required</option></select>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Segment Demand</label>
        <select id="f_segment_demand" class="input select"><option value="2">Growing</option><option value="3">High</option><option value="1">Stable</option></select>
      </div>
      <div class="form-group"><label class="label">Annual Revenue</label><input id="f_revenue" class="input" placeholder="e.g. 50 Lakh, Pre-revenue"></div>
    </div>`,
  ecommerce: `
    <div class="form-row-2">
      <div class="form-group"><label class="label">Product Niche</label><input id="f_product_category" class="input" placeholder="e.g. Handmade Jewelry"></div>
      <div class="form-group"><label class="label">Platform</label>
        <select id="f_sales_channel" class="input select"><option value="">Select</option><option>Shopify D2C</option><option>Amazon FBA</option><option>Flipkart</option><option>Meesho</option></select>
      </div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Monthly Orders</label><input id="f_monthly_orders" class="input" placeholder="e.g. 300"></div>
      <div class="form-group"><label class="label">Avg Selling Price (₹)</label><input id="f_avg_price" class="input" placeholder="e.g. 599"></div>
    </div>`,
  realestate: `
    <div class="form-row-2">
      <div class="form-group"><label class="label">Property Type</label>
        <select id="f_biz_model" class="input select"><option value="">Select</option><option>Residential</option><option>Commercial</option><option>Co-Working</option><option>PropTech Platform</option></select>
      </div>
      <div class="form-group"><label class="label">Project Value</label><input id="f_funding" class="input" placeholder="e.g. 5 Cr, 50 units"></div>
    </div>`,
  manufacturing: `
    <div class="form-row-2">
      <div class="form-group"><label class="label">Product Type</label><input id="f_industry" class="input" placeholder="e.g. Garments, FMCG, Components"></div>
      <div class="form-group"><label class="label">Production Capacity</label><input id="f_mrr" class="input" placeholder="e.g. 5000 units/month"></div>
    </div>
    <div class="form-row-2">
      <div class="form-group"><label class="label">Market Size</label>
        <select id="f_market_size" class="input select"><option value="2">Medium</option><option value="3">Large Export Market</option><option value="1">Small Local</option></select>
      </div>
      <div class="form-group"><label class="label">Competition</label>
        <select id="f_competition" class="input select"><option value="">Select</option><option>Low</option><option>Moderate</option><option>High</option></select>
      </div>
    </div>`,
  agriculture: `
    <div class="form-row-2">
      <div class="form-group"><label class="label">AgriTech Focus</label><input id="f_industry" class="input" placeholder="e.g. Precision Farming, FPO, Supply Chain"></div>
      <div class="form-group"><label class="label">Farmer Network Size</label><input id="f_mrr" class="input" placeholder="e.g. 5000 farmers connected"></div>
    </div>
    <div class="form-group"><label class="label">Business Model</label>
      <select id="f_biz_model" class="input select"><option value="">Select</option><option>Marketplace</option><option>SaaS</option><option>B2B Service</option><option>D2C</option></select>
    </div>`,
};

function setType(type, btn) {
  currentType = type;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('dynFields').innerHTML = FIELDS[type] || FIELDS.startup;
}

// ─── EXAMPLES DATA ──────────────────────────────
const EXAMPLES = [
  {cat:'startup',name:'EdTech SaaS Platform',desc:'B2B SaaS for corporate training with AI personalization targeting mid-size companies',tags:['SaaS','B2B','EdTech','AI'],data:{f_description:'B2B SaaS platform for corporate training and skill development with AI-personalized learning paths',f_location:'Bangalore',f_experience:'6',f_team_size:'8',f_investment:'2M USD',f_funding:'2M USD Seed',f_mrr:'50K USD',f_industry:'Corporate EdTech',f_biz_model:'SaaS',f_market_size:'3',f_competition:'Moderate'}},
  {cat:'startup',name:'MSME FinTech Lending',desc:'Working capital loans for MSMEs with AI credit scoring — no collateral required',tags:['FinTech','MSME','BNPL','Lending'],data:{f_description:'BNPL and working capital for MSME inventory without collateral using AI underwriting',f_location:'Mumbai',f_experience:'8',f_team_size:'30',f_investment:'5M USD',f_funding:'5M USD Series A',f_mrr:'200K USD',f_industry:'MSME Finance',f_biz_model:'B2B Service',f_market_size:'3',f_competition:'High'}},
  {cat:'startup',name:'AgriTech Supply Chain',desc:'Farm-to-fork platform connecting 50,000+ farmers to urban retailers via mobile app',tags:['AgriTech','Marketplace','Rural','B2B'],data:{f_description:'Farm-to-fork supply chain marketplace connecting small farmers to urban retailers',f_location:'Pune (Pan India)',f_experience:'4',f_team_size:'12',f_investment:'1.5M USD',f_funding:'1.5M USD',f_mrr:'20K USD',f_industry:'AgriTech',f_biz_model:'Marketplace',f_market_size:'3',f_competition:'Moderate'}},
  {cat:'coaching',name:'IIT-JEE Kota Institute',desc:'Hybrid JEE coaching in Kota with IIT alumni faculty — 45+ selections in 2023',tags:['JEE','Kota','Hybrid','Engineering'],data:{f_description:'Hybrid coaching institute for IIT-JEE with classroom and online components, IIT alumni faculty',f_location:'Kota, Rajasthan',f_experience:'8',f_team_size:'20',f_investment:'50 Lakh',f_student_count:'500',f_faculty_count:'15',f_fee_per_student:'1,20,000',f_delivery_mode:'Hybrid (Online + Offline)',f_success_rate:'45 IIT selections 2023'}},
  {cat:'coaching',name:'UPSC Digital Academy',desc:'Pan-India UPSC coaching with live classes and mentorship from past IAS toppers',tags:['UPSC','Online','IAS','Digital'],data:{f_description:'Pan-India online coaching for UPSC CSE with live classes and past IAS topper mentorship',f_location:'Online (Pan India)',f_experience:'3',f_team_size:'25',f_investment:'80 Lakh',f_student_count:'2000',f_faculty_count:'20',f_fee_per_student:'45000',f_delivery_mode:'Online (Live)',f_success_rate:'12 IAS selections 2022-23'}},
  {cat:'coaching',name:'CAT MBA Coaching (Lucknow)',desc:'Affordable CAT coaching for Tier 2 city students targeting IIM conversions',tags:['CAT','MBA','Lucknow','IIM'],data:{f_description:'CAT and MBA entrance coaching for Tier 2 city students with affordable fee structure',f_location:'Lucknow',f_experience:'5',f_team_size:'10',f_investment:'25 Lakh',f_student_count:'150',f_faculty_count:'8',f_fee_per_student:'60000',f_delivery_mode:'Hybrid (Online + Offline)',f_success_rate:'20 IIM calls 2023'}},
  {cat:'coaching',name:'Spoken English Institute',desc:'Personality development institute for fresh graduates in Delhi NCR — 3 centers',tags:['Spoken English','Soft Skills','Delhi','Jobs'],data:{f_description:'Spoken English and personality development for fresh graduates and job seekers in Delhi',f_location:'Delhi NCR',f_experience:'2',f_team_size:'8',f_investment:'15 Lakh',f_student_count:'200',f_faculty_count:'5',f_fee_per_student:'15000',f_delivery_mode:'Offline (Classroom)',f_success_rate:'80 percent placed in 3 months'}},
  {cat:'coaching',name:'Coding Bootcamp (Offline)',desc:'6-month intensive coding bootcamp for career switchers — job guarantee model',tags:['Coding','Bootcamp','Tech','Jobs'],data:{f_description:'6-month intensive coding bootcamp for non-CS graduates transitioning to tech careers',f_location:'Bangalore (Hybrid)',f_experience:'4',f_team_size:'15',f_investment:'40 Lakh',f_student_count:'100',f_faculty_count:'10',f_fee_per_student:'1,50,000',f_delivery_mode:'Hybrid (Online + Offline)',f_success_rate:'90 percent placement rate'}},
  {cat:'restaurant',name:'Multi-Brand Cloud Kitchen',desc:'4 virtual restaurant brands on Zomato & Swiggy from a single Hyderabad kitchen',tags:['Cloud Kitchen','Zomato','Multi-brand','Delivery'],data:{f_description:'Multi-brand cloud kitchen with 4 virtual brands on Zomato and Swiggy in Hyderabad',f_location:'Hyderabad (Kondapur)',f_experience:'4',f_team_size:'8',f_investment:'8 Lakh',f_cuisine:'North Indian, Chinese, Burgers',f_rest_type:'Cloud Kitchen',f_avg_order:'320',f_footfall:'2',f_delivery_platform:'Zomato + Swiggy both'}},
  {cat:'retail',name:'Ayurvedic D2C Skincare',desc:'Ayurvedic skincare targeting urban millennials via Instagram and Shopify — 25 SKUs',tags:['D2C','Ayurvedic','Skincare','Shopify'],data:{f_description:'Ayurvedic skincare brand with 25 SKUs targeting urban millennials via Instagram and own website',f_location:'Jaipur (Pan India online)',f_experience:'2',f_team_size:'6',f_investment:'15 Lakh',f_product_category:'Natural Ayurvedic Skincare',f_sales_channel:'D2C Website (Shopify)',f_monthly_orders:'500',f_avg_price:'799',f_niche_demand:'3',f_repeat_rate:'32'}},
  {cat:'saas',name:'HR SaaS for Indian SMBs',desc:'HRMS and payroll automation SaaS — 200 customers, ₹3.5Cr ARR, Series A ready',tags:['SaaS','HR','SMB','B2B'],data:{f_description:'HR management and payroll automation SaaS for Indian SMBs under 500 employees',f_location:'Bengaluru (Remote)',f_experience:'7',f_team_size:'15',f_investment:'3M USD',f_funding:'3M USD Series A',f_mrr:'35000 USD',f_saas_target:'b2b',f_saas_users:'200',f_churn:'4',f_market_size:'3'}},
  {cat:'saas',name:'Legal SaaS for Law Firms',desc:'Contract review and legal document automation for mid-size law firms in India',tags:['LegalTech','SaaS','AI','B2B'],data:{f_description:'AI-powered contract review and legal document automation SaaS for mid-size Indian law firms',f_location:'Delhi (Pan India)',f_experience:'5',f_team_size:'10',f_investment:'1M USD',f_funding:'1M USD Seed',f_mrr:'15000 USD',f_saas_target:'b2b',f_saas_users:'80',f_churn:'3',f_market_size:'2'}},
];

function setType(type, btn) {
  currentType = type;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('dynFields').innerHTML = FIELDS[type] || FIELDS.startup;
}

function renderExamples(filter = 'all') {
  const grid = document.getElementById('exGrid');
  const list = filter === 'all' ? EXAMPLES : EXAMPLES.filter(e => e.cat === filter);
  grid.innerHTML = list.map(ex => {
    const idx = EXAMPLES.indexOf(ex);
    return `<div class="ex-card" data-cat="${ex.cat}">
      <div class="ec-cat">🏷️ ${ex.cat.toUpperCase()}</div>
      <div class="ec-name">${ex.name}</div>
      <div class="ec-desc">${ex.desc}</div>
      <div class="ec-tags">${ex.tags.map(t=>`<span class="ec-tag">${t}</span>`).join('')}</div>
      <button class="ec-btn" onclick="loadExample(${idx})">⚡ Load & Analyze →</button>
    </div>`;
  }).join('');
}

function filterEx(cat, btn) {
  document.querySelectorAll('.ex-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderExamples(cat);
}

function loadExample(idx) {
  const ex = EXAMPLES[idx];
  // Go to analyze page
  showPage('analyze', document.querySelector('.sb-item[onclick*="analyze"]'));
  setType(ex.cat, document.querySelector(`.type-btn[data-type="${ex.cat}"]`));
  setTimeout(() => {
    for (const [id, val] of Object.entries(ex.data)) {
      const el = document.getElementById(id);
      if (el) el.value = val;
    }
    document.getElementById('page-analyze').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => runAnalysis(), 300);
  }, 150);
}

// ─── ANALYSIS ───────────────────────────────────
async function runAnalysis() {
  const desc = (document.getElementById('f_description')?.value || '').trim();
  if (!desc) { shakeBtn(); return; }

  const data = {};
  document.querySelectorAll('[id^="f_"]').forEach(el => {
    if (el.value) data[el.id.replace('f_', '')] = el.value;
  });

  showLoading();
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venture_type: currentType, venture_data: data, description: desc })
    });
    const json = await res.json();
    if (json.success) {
      lastResult = json.analysis;
      renderResult(json.analysis, currentType);
      updateHistBadge();
    } else showError(json.error);
  } catch (e) { showError(e.message); }
}

function shakeBtn() {
  const btn = document.getElementById('analyzeBtn');
  btn.style.animation = 'shake .4s ease';
  setTimeout(() => btn.style.animation = '', 400);
  document.getElementById('f_description')?.focus();
}

const LOAD_LABELS = [
  'Extracting features…', 'Running Gradient Boosting model…',
  'Calculating SWOT & risk…', 'Benchmarking vs sector…', 'Building your report…'
];

function showLoading() {
  document.getElementById('rph').style.display = 'none';
  document.getElementById('rload').style.display = 'block';
  document.getElementById('rresult').style.display = 'none';
  document.getElementById('analyzeBtn').disabled = true;

  let step = 0;
  const fill = document.getElementById('loadFill');
  const label = document.getElementById('loadLabel');
  document.querySelectorAll('.ls').forEach(l => { l.classList.remove('active', 'done'); });

  const iv = setInterval(() => {
    if (step > 0) document.getElementById(`ls${step-1}`)?.classList.replace('active','done') || document.getElementById(`ls${step-1}`)?.classList.add('done');
    if (step < 5) {
      document.getElementById(`ls${step}`)?.classList.add('active');
      label.textContent = LOAD_LABELS[step];
      fill.style.width = ((step + 1) / 5 * 100) + '%';
    }
    step++;
    if (step > 5) clearInterval(iv);
  }, 400);
}

function showError(msg) {
  document.getElementById('rload').style.display = 'none';
  document.getElementById('analyzeBtn').disabled = false;
  const r = document.getElementById('rresult');
  r.style.display = 'block';
  r.innerHTML = `<div style="text-align:center;padding:40px 16px">
    <div style="font-size:2.5rem;margin-bottom:12px">⚠️</div>
    <h3 style="color:#ef4444;margin-bottom:8px;font-size:1rem">Analysis Failed</h3>
    <p style="color:var(--text2);font-size:.85rem">${msg}</p></div>`;
}

// ─── RENDER RESULT ──────────────────────────────
function renderResult(a, type) {
  document.getElementById('rload').style.display = 'none';
  document.getElementById('analyzeBtn').disabled = false;
  const r = document.getElementById('rresult');
  r.style.display = 'block';

  const prob = a.success_probability || 0;
  const color = prob >= 70 ? '#10b981' : prob >= 45 ? '#f59e0b' : '#ef4444';
  const circ = 2 * Math.PI * 52;
  const offset = circ - (prob / 100) * circ;
  const riskCls = {Low:'b-green',Medium:'b-orange',High:'b-red',Critical:'b-red'}[a.risk_level]||'b-orange';
  const mktCls  = {'Very High':'b-green',High:'b-green',Medium:'b-orange',Low:'b-red'}[a.market_potential]||'b-blue';

  // Benchmark bar
  const bench = a.benchmark || { avg_success: 60, top_quartile: 78, bottom_quartile: 42, sector: 'Industry' };
  const avgPct = bench.avg_success;
  const youPct = prob;
  const posCls = prob >= bench.top_quartile ? 'b-green' : prob >= bench.avg_success ? 'b-blue' : 'b-orange';

  // SWOT HTML
  const swotHtml = `
    <div class="swot-grid">
      <div class="swot-box s"><div class="swot-label">💪 Strengths</div>${(a.strengths||[]).map(s=>`<div class="swot-item">${s}</div>`).join('')}</div>
      <div class="swot-box w"><div class="swot-label">⚠️ Weaknesses</div>${(a.weaknesses||[]).map(s=>`<div class="swot-item">${s}</div>`).join('')}</div>
      <div class="swot-box o"><div class="swot-label">🚀 Opportunities</div>${(a.opportunities||[]).map(s=>`<div class="swot-item">${s}</div>`).join('')}</div>
      <div class="swot-box t"><div class="swot-label">🔺 Threats</div>${(a.threats||[]).map(s=>`<div class="swot-item">${s}</div>`).join('')}</div>
    </div>`;

  // Factors
  const factorsHtml = (a.key_factors||[]).map(f => {
    const fc = f.impact==='positive'?'#10b981':f.impact==='negative'?'#ef4444':'#f59e0b';
    return `<div class="frow"><div class="f-name">${f.factor}</div>
      <div class="f-wrap"><div class="f-bar" style="width:${f.score*10}%;background:${fc}"></div></div>
      <div class="f-val" style="color:${fc}">${f.score}</div></div>`;
  }).join('');

  // Risk breakdown
  const riskHtml = (a.risk_breakdown||[]).map(r => {
    const rc = r.value < 35 ? '#10b981' : r.value < 60 ? '#f59e0b' : '#ef4444';
    return `<div class="rbar-row"><div class="rbar-label">${r.label}</div>
      <div class="rbar-wrap"><div class="rbar-fill" style="width:${r.value}%;background:${rc}"></div></div>
      <div class="rbar-val" style="color:${rc}">${r.value.toFixed(0)}%</div></div>`;
  }).join('');

  // Score breakdown dims
  const dimHtml = (a.score_breakdown||[]).map(d => {
    const dc = d.score >= 7 ? '#10b981' : d.score >= 5 ? '#3b82f6' : '#ef4444';
    return `<div class="dim-card">
      <div class="dim-name">${d.dimension}</div>
      <div class="dim-bar-wrap"><div class="dim-bar" style="width:${d.score*10}%;background:${dc}"></div></div>
      <div class="dim-score" style="color:${dc}">${d.score}/10</div></div>`;
  }).join('');

  // Recs
  const recsHtml = (a.recommendations||[]).map((rec,i)=>
    `<div class="rec"><div class="rec-n">${String(i+1).padStart(2,'0')}</div><div class="rec-t">${rec}</div></div>`
  ).join('');

  // Flags
  const flagsHtml = (a.red_flags||[]).length
    ? `<div class="r-section"><div class="r-section-title">🚩 Red Flags</div><div class="flags">${a.red_flags.map(f=>`<div class="flag">⚠️ ${f}</div>`).join('')}</div></div>`
    : '';

  // Stories
  const storiesHtml = (a.similar_success_stories||[]).length
    ? `<div class="r-section"><div class="r-section-title">⭐ Similar Success Stories</div><div class="badges" style="flex-wrap:wrap">${a.similar_success_stories.map(s=>`<span class="badge b-purple">${s}</span>`).join('')}</div></div>`
    : '';

  r.innerHTML = `<div class="result-wrap">

    <!-- Export Bar -->
    <div class="export-bar">
      <button class="export-btn" onclick="window.print()">🖨️ Print Report</button>
      <button class="export-btn" onclick="exportJSON()">📥 Export JSON</button>
      <button class="export-btn" onclick="copyResult()">📋 Copy Summary</button>
      <span style="margin-left:auto;font-size:.72rem;color:var(--text3);align-self:center">ID: ${a.analysis_id} · ${a.analyzed_at}</span>
    </div>

    <!-- Score Hero -->
    <div class="score-hero">
      <div class="gauge-wrap">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle class="gauge-bg" cx="60" cy="60" r="52"/>
          <circle class="gauge-fill" cx="60" cy="60" r="52" stroke="${color}"
            stroke-dasharray="${circ}" stroke-dashoffset="${circ}" id="gaugeFill"/>
        </svg>
        <div class="gauge-num">
          <div class="g-val" style="color:${color}" id="gVal">0%</div>
          <div class="g-lbl">Success</div>
        </div>
      </div>
      <div class="score-info">
        <div class="score-id">Analysis #${a.analysis_id} · ${type.toUpperCase()}</div>
        <div class="score-verdict">${a.verdict}</div>
        <div class="badges">
          <span class="badge ${riskCls}">⚡ Risk: ${a.risk_level}</span>
          <span class="badge ${mktCls}">📈 Market: ${a.market_potential}</span>
          <span class="badge b-cyan">🎯 ${a.confidence_level}% Confident</span>
          <span class="badge b-purple">💰 Profit: ${a.timeline_to_profitability}</span>
          <span class="badge ${posCls}">🏆 ${a.sector_position}</span>
        </div>
      </div>
    </div>

    <!-- Result Tabs -->
    <div class="result-tabs">
      <button class="rt active" onclick="switchTab('swot',this)">📊 SWOT</button>
      <button class="rt" onclick="switchTab('factors',this)">📈 Factors</button>
      <button class="rt" onclick="switchTab('risk',this)">⚠️ Risk</button>
      <button class="rt" onclick="switchTab('benchmark',this)">🏆 Benchmark</button>
      <button class="rt" onclick="switchTab('recs',this)">🎯 Strategy</button>
    </div>

    <!-- Tab: SWOT -->
    <div class="r-tab-content active" id="tab-swot">
      ${swotHtml}
    </div>

    <!-- Tab: Factors -->
    <div class="r-tab-content" id="tab-factors">
      <div class="r-section-title">Key Success Factors (0–10)</div>
      <div class="factors">${factorsHtml}</div>
      <div class="divider"></div>
      <div class="r-section-title">Score Breakdown</div>
      <div class="score-dims">${dimHtml}</div>
    </div>

    <!-- Tab: Risk -->
    <div class="r-tab-content" id="tab-risk">
      <div class="r-section-title">Risk Breakdown by Category</div>
      <div class="risk-bars">${riskHtml}</div>
      ${flagsHtml}
    </div>

    <!-- Tab: Benchmark -->
    <div class="r-tab-content" id="tab-benchmark">
      <div class="r-section-title">Sector Benchmarking — ${bench.sector}</div>
      <div class="bench-box">
        <div class="bench-title">Your Score vs Industry</div>
        <div class="bench-bar-wrap">
          <div class="bench-bar" style="width:100%"></div>
          <div class="bench-marker bench-avg-marker" style="left:${avgPct}%" title="Sector avg: ${avgPct}%"></div>
          <div class="bench-marker bench-you-marker" id="youMarker" style="left:0%" title="You: ${youPct}%"></div>
        </div>
        <div class="bench-labels"><span>0%</span><span>50%</span><span>100%</span></div>
        <div class="bench-legend">
          <div class="bench-leg-item"><div class="bench-leg-dot" style="background:var(--text3)"></div>Sector Avg (${avgPct}%)</div>
          <div class="bench-leg-item"><div class="bench-leg-dot" style="background:var(--accent)"></div>Your Score (${youPct}%)</div>
          <div class="bench-leg-item"><div class="bench-leg-dot" style="background:var(--green)"></div>Top Quartile (${bench.top_quartile}%+)</div>
        </div>
        <div class="divider" style="margin:10px 0"></div>
        <div style="display:flex;gap:16px;flex-wrap:wrap">
          <div><div style="font-size:.7rem;color:var(--text3);margin-bottom:3px">SECTOR AVG</div><div class="bench-pos" style="color:var(--text2)">${avgPct}%</div></div>
          <div><div style="font-size:.7rem;color:var(--text3);margin-bottom:3px">TOP QUARTILE</div><div class="bench-pos" style="color:var(--green)">${bench.top_quartile}%+</div></div>
          <div><div style="font-size:.7rem;color:var(--text3);margin-bottom:3px">YOUR SCORE</div><div class="bench-pos" style="color:${color}">${youPct}%</div></div>
          <div><div style="font-size:.7rem;color:var(--text3);margin-bottom:3px">POSITION</div><div class="bench-pos ${posCls}">${a.sector_position}</div></div>
        </div>
      </div>
      ${storiesHtml}
    </div>

    <!-- Tab: Strategy -->
    <div class="r-tab-content" id="tab-recs">
      <div class="r-section-title">Strategic Recommendations</div>
      <div class="recs">${recsHtml}</div>
      <div class="divider"></div>
      <div class="r-section-title">Overall Summary</div>
      <div class="summary-box">${a.overall_summary}</div>
    </div>

  </div>`;

  // Animate gauge
  setTimeout(() => {
    document.getElementById('gaugeFill').style.strokeDashoffset = offset;
    let c = 0;
    const el = document.getElementById('gVal');
    const iv = setInterval(() => {
      c = Math.min(c + Math.ceil(prob / 40), prob);
      if (el) el.textContent = c + '%';
      if (c >= prob) clearInterval(iv);
    }, 28);
    // Animate benchmark marker
    const marker = document.getElementById('youMarker');
    if (marker) setTimeout(() => marker.style.left = youPct + '%', 200);
  }, 100);

  document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function switchTab(name, btn) {
  document.querySelectorAll('.rt').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.r-tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`tab-${name}`)?.classList.add('active');
}

// ─── COMPARE ────────────────────────────────────
async function runCompare() {
  const d1 = document.getElementById('c1_desc')?.value?.trim();
  const d2 = document.getElementById('c2_desc')?.value?.trim();
  if (!d1 || !d2) { alert('Please fill in both venture descriptions!'); return; }

  const build = (prefix) => {
    const type = document.getElementById(`${prefix}_type`)?.value || 'startup';
    const data = {
      description: document.getElementById(`${prefix}_desc`)?.value || '',
      investment: document.getElementById(`${prefix}_investment`)?.value || '',
      team_size: document.getElementById(`${prefix}_team`)?.value || '',
      experience: document.getElementById(`${prefix}_exp`)?.value || '',
      location: document.getElementById(`${prefix}_loc`)?.value || '',
      mrr: document.getElementById(`${prefix}_mrr`)?.value || '',
    };
    return { type, data };
  };

  const v1 = build('c1'), v2 = build('c2');
  const compareBtn = document.querySelector('#page-compare .analyze-btn');
  compareBtn.disabled = true;
  compareBtn.innerHTML = '<span>⏳</span><span>Analyzing both ventures…</span>';

  try {
    const [r1, r2] = await Promise.all([
      fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({venture_type:v1.type,venture_data:v1.data,description:v1.data.description})}).then(r=>r.json()),
      fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({venture_type:v2.type,venture_data:v2.data,description:v2.data.description})}).then(r=>r.json()),
    ]);
    compareBtn.disabled = false;
    compareBtn.innerHTML = '<span>⚖️</span><span>Compare Both Ventures</span><span>→</span>';
    if (r1.success && r2.success) renderCompare(r1.analysis, r2.analysis, v1, v2);
    else alert('Analysis failed: ' + (r1.error || r2.error));
  } catch(e) {
    compareBtn.disabled = false;
    compareBtn.innerHTML = '<span>⚖️</span><span>Compare Both Ventures</span><span>→</span>';
    alert('Error: ' + e.message);
  }
}

function renderCompare(a1, a2, v1, v2) {
  const winner = a1.success_probability >= a2.success_probability ? 'A' : 'B';
  const res = document.getElementById('compareResult');
  res.style.display = 'block';

  const card = (a, v, label, isWinner) => {
    const prob = a.success_probability;
    const color = prob >= 70 ? '#10b981' : prob >= 45 ? '#f59e0b' : '#ef4444';
    return `<div class="cmp-result-card ${isWinner ? 'cmp-winner' : ''}">
      ${isWinner ? '<div class="cmp-winner-badge">🏆 Winner — Higher Probability</div>' : ''}
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
        <div style="font-family:var(--mono);font-size:2rem;font-weight:900;color:${color}">${prob}%</div>
        <div>
          <div style="font-size:.7rem;font-weight:800;color:var(--accent2);text-transform:uppercase;letter-spacing:.08em">Venture ${label} · ${v.type.toUpperCase()}</div>
          <div style="font-size:.82rem;color:var(--text2);margin-top:2px">${a.verdict}</div>
        </div>
      </div>
      <div class="badges" style="margin-bottom:12px">
        <span class="badge ${prob>=70?'b-green':prob>=45?'b-orange':'b-red'}">${a.risk_level} Risk</span>
        <span class="badge b-cyan">${a.timeline_to_profitability}</span>
        <span class="badge b-purple">${a.market_potential} Market</span>
      </div>
      <div style="font-size:.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Top Strength</div>
      <div style="font-size:.8rem;color:var(--green);margin-bottom:10px">✓ ${(a.strengths||[])[0]||''}</div>
      <div style="font-size:.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Key Risk</div>
      <div style="font-size:.8rem;color:var(--red2)">⚠ ${(a.weaknesses||[])[0]||''}</div>
    </div>`;
  };

  res.innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:.75rem;color:var(--text3);margin-bottom:6px">COMPARISON RESULT</div>
      <div style="font-size:1.1rem;font-weight:700">Venture ${winner} has a higher success probability</div>
    </div>
    <div class="compare-result">
      ${card(a1, v1, 'A', winner==='A')}
      ${card(a2, v2, 'B', winner==='B')}
    </div>`;

  res.scrollIntoView({ behavior: 'smooth' });
}

// ─── HISTORY ────────────────────────────────────
async function loadHistory() {
  try {
    const res = await fetch('/api/history');
    const hist = await res.json();
    const container = document.getElementById('historyList');
    if (!hist.length) {
      container.innerHTML = `<div class="hist-empty"><div class="he-icon">🕐</div><p>No analyses yet. Run your first prediction!</p></div>`;
      return;
    }
    container.innerHTML = `<div class="hist-list">${hist.map(h => {
      const color = h.probability >= 70 ? '#10b981' : h.probability >= 45 ? '#f59e0b' : '#ef4444';
      const riskCls = {Low:'b-green',Medium:'b-orange',High:'b-red',Critical:'b-red'}[h.risk]||'b-orange';
      return `<div class="hist-item">
        <div class="hist-prob" style="color:${color}">${h.probability}%</div>
        <div class="hist-info">
          <div class="hist-type">${h.type.toUpperCase()} · #${h.id}</div>
          <div class="hist-desc">${h.description}</div>
          <div class="hist-time">🕐 ${h.time}</div>
        </div>
        <div class="hist-badges">
          <span class="badge ${riskCls}">${h.risk}</span>
        </div>
      </div>`;
    }).join('')}</div>`;
  } catch(e) { console.error(e); }
}

async function clearHistory() {
  await fetch('/api/clear_history', { method: 'POST' });
  loadHistory();
  updateHistBadge();
}

async function updateHistBadge() {
  try {
    const res = await fetch('/api/history');
    const hist = await res.json();
    const badge = document.getElementById('histBadge');
    if (hist.length > 0) { badge.style.display = 'inline'; badge.textContent = hist.length; }
    else badge.style.display = 'none';
  } catch(e) {}
}

// ─── EXPORT ─────────────────────────────────────
function exportJSON() {
  if (!lastResult) return;
  const blob = new Blob([JSON.stringify(lastResult, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `decisioniq-${lastResult.analysis_id}.json`;
  a.click(); URL.revokeObjectURL(url);
}

function copyResult() {
  if (!lastResult) return;
  const a = lastResult;
  const text = `DecisionIQ Analysis #${a.analysis_id}
Success Probability: ${a.success_probability}%
Risk Level: ${a.risk_level}
Market Potential: ${a.market_potential}
Timeline to Profit: ${a.timeline_to_profitability}
Sector Position: ${a.sector_position}

VERDICT: ${a.verdict}

KEY STRENGTHS:
${(a.strengths||[]).map((s,i)=>`${i+1}. ${s}`).join('\n')}

KEY RECOMMENDATIONS:
${(a.recommendations||[]).map((r,i)=>`${i+1}. ${r}`).join('\n')}

SUMMARY: ${a.overall_summary}

Analyzed by DecisionIQ — ${a.analyzed_at}`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('[onclick="copyResult()"]');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy Summary', 2000); }
  });
}

// ─── INIT ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setType('startup', document.querySelector('.type-btn[data-type="startup"]'));
  renderExamples();
  updateHistBadge();

  // Add shake animation
  const style = document.createElement('style');
  style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}';
  document.head.appendChild(style);
});
