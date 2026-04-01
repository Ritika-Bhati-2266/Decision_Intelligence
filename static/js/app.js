// DecisionIQ - AI-Powered Business Intelligence

let currentVentureType = 'startup';

const DYNAMIC_FIELDS = {
  startup: `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Funding Raised</label>
        <input id="funding" type="text" class="form-input" placeholder="e.g. 2M USD Seed, Bootstrapped">
      </div>
      <div class="form-group">
        <label class="form-label">Monthly Revenue (MRR)</label>
        <input id="mrr" type="text" class="form-input" placeholder="e.g. 50K INR, Pre-revenue">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Industry / Sector</label>
        <input id="industry" type="text" class="form-input" placeholder="e.g. EdTech, FinTech, HealthTech">
      </div>
      <div class="form-group">
        <label class="form-label">Business Model</label>
        <input id="biz_model" type="text" class="form-input" placeholder="e.g. SaaS, D2C, Marketplace">
      </div>
    </div>`,
  coaching: `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Exam / Subject Focus</label>
        <input id="exam_focus" type="text" class="form-input" placeholder="e.g. IIT-JEE, UPSC, CAT, Spoken English">
      </div>
      <div class="form-group">
        <label class="form-label">Number of Students</label>
        <input id="student_count" type="text" class="form-input" placeholder="e.g. 200 enrolled">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Faculty Count</label>
        <input id="faculty_count" type="text" class="form-input" placeholder="e.g. 10 full-time faculty">
      </div>
      <div class="form-group">
        <label class="form-label">Annual Fee Per Student</label>
        <input id="fee_per_student" type="text" class="form-input" placeholder="e.g. 80,000 INR">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Delivery Mode</label>
        <select id="delivery_mode" class="form-select">
          <option value="">Select mode</option>
          <option>Offline (Classroom)</option>
          <option>Online (Live)</option>
          <option>Hybrid (Online + Offline)</option>
          <option>Recorded Videos + Live Doubt</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Past Results / Success Rate</label>
        <input id="success_rate" type="text" class="form-input" placeholder="e.g. 45 selections in IIT 2023">
      </div>
    </div>`,
  restaurant: `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Cuisine Type</label>
        <input id="cuisine" type="text" class="form-input" placeholder="e.g. North Indian, Italian, Multi-Cuisine">
      </div>
      <div class="form-group">
        <label class="form-label">Restaurant Type</label>
        <select id="rest_type" class="form-select">
          <option value="">Select type</option>
          <option>Dine-in Restaurant</option>
          <option>Cloud Kitchen</option>
          <option>Quick Service (QSR)</option>
          <option>Cafe / Bistro</option>
          <option>Dhaba / Street Food</option>
          <option>Fine Dining</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Seating Capacity</label>
        <input id="seating" type="text" class="form-input" placeholder="e.g. 40 covers, Cloud Kitchen">
      </div>
      <div class="form-group">
        <label class="form-label">Avg Order Value</label>
        <input id="avg_order" type="text" class="form-input" placeholder="e.g. 350 INR per person">
      </div>
    </div>`,
  retail: `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Product Category</label>
        <input id="product_category" type="text" class="form-input" placeholder="e.g. Skincare, Fashion, Electronics">
      </div>
      <div class="form-group">
        <label class="form-label">Sales Channel</label>
        <select id="sales_channel" class="form-select">
          <option value="">Select channel</option>
          <option>D2C Website Only</option>
          <option>Amazon / Flipkart Marketplace</option>
          <option>Physical Retail Store</option>
          <option>Omnichannel (Online + Offline)</option>
          <option>Social Commerce (Instagram/WhatsApp)</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Monthly Orders</label>
        <input id="monthly_orders" type="text" class="form-input" placeholder="e.g. 500 orders/month">
      </div>
      <div class="form-group">
        <label class="form-label">Avg Selling Price</label>
        <input id="avg_price" type="text" class="form-input" placeholder="e.g. 999 INR per unit">
      </div>
    </div>`,
  saas: `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Target Customer</label>
        <select id="saas_target" class="form-select">
          <option value="">Select</option>
          <option>B2B (Businesses)</option>
          <option>B2C (Consumers)</option>
          <option>B2B2C</option>
          <option>Enterprise</option>
          <option>SMBs</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Monthly Recurring Revenue</label>
        <input id="saas_mrr" type="text" class="form-input" placeholder="e.g. $20K MRR, Pre-revenue">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Active Users / Customers</label>
        <input id="saas_users" type="text" class="form-input" placeholder="e.g. 200 paying customers">
      </div>
      <div class="form-group">
        <label class="form-label">Churn Rate</label>
        <input id="churn" type="text" class="form-input" placeholder="e.g. 3% monthly churn">
      </div>
    </div>`,
  healthcare: `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Healthcare Segment</label>
        <input id="health_segment" type="text" class="form-input" placeholder="e.g. Telemedicine, Diagnostics, Pharmacy">
      </div>
      <div class="form-group">
        <label class="form-label">Regulatory Status</label>
        <select id="reg_status" class="form-select">
          <option value="">Select</option>
          <option>Licensed / Certified</option>
          <option>In Progress</option>
          <option>Not Started</option>
          <option>Not Required</option>
        </select>
      </div>
    </div>`,
  ecommerce: `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Product Niche</label>
        <input id="niche" type="text" class="form-input" placeholder="e.g. Handmade Jewelry, Pet Accessories">
      </div>
      <div class="form-group">
        <label class="form-label">Platform</label>
        <select id="platform" class="form-select">
          <option value="">Select</option>
          <option>Shopify D2C</option>
          <option>Amazon FBA</option>
          <option>Meesho / Flipkart Seller</option>
          <option>WooCommerce</option>
          <option>Instagram Commerce</option>
        </select>
      </div>
    </div>`,
  realestate: `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Property Type</label>
        <select id="prop_type" class="form-select">
          <option value="">Select</option>
          <option>Residential Development</option>
          <option>Commercial Spaces</option>
          <option>Co-Working Spaces</option>
          <option>Property Management</option>
          <option>Real Estate Tech (PropTech)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Project Value</label>
        <input id="proj_value" type="text" class="form-input" placeholder="e.g. 5 Cr project, 50 units">
      </div>
    </div>`
};

const EXAMPLE_DATA = [
  { category: 'startup', name: 'EdTech SaaS Platform', desc: 'B2B SaaS for corporate training with AI personalization, targeting mid-size companies', tags: ['SaaS', 'B2B', 'EdTech', 'AI'], data: { description: 'B2B SaaS platform for corporate training and skill development using AI personalization', location: 'Bangalore', experience: '6 years (ex-Byju\'s founders)', team_size: '8 people', investment: '$2M USD Seed Round', revenue_goal: '10x MRR in 18 months', funding: '$2M USD Seed', mrr: '$50K MRR', industry: 'Corporate EdTech', biz_model: 'SaaS Subscription' } },
  { category: 'startup', name: 'HealthTech Telemedicine App', desc: 'Telemedicine + AI diagnostics targeting Tier 2 & Tier 3 cities with vernacular support', tags: ['HealthTech', 'AI', 'Tier 2', 'Mobile'], data: { description: 'Telemedicine app with AI-assisted preliminary diagnostics in Hindi and regional languages for underserved markets', location: 'Pune (Tier 2/3 focus)', experience: '3 years', team_size: '5 people', investment: '₹40 Lakh Angel', revenue_goal: '1 Lakh users in Year 1', funding: '₹40L Angel', mrr: '₹8L MRR', industry: 'Healthcare Tech', biz_model: 'Freemium + Subscription' } },
  { category: 'startup', name: 'MSME FinTech Platform', desc: 'Buy Now Pay Later and working capital for small businesses and inventory financing', tags: ['FinTech', 'MSME', 'BNPL', 'Lending'], data: { description: 'BNPL and working capital financing platform for MSME inventory purchase and supply chain finance', location: 'Mumbai', experience: '8 years (ex-NBFC background)', team_size: '30 people', investment: '$5M USD Series A', revenue_goal: '$1M ARR in 12 months', funding: '$5M Series A', mrr: '$200K MRR', industry: 'MSME Finance', biz_model: 'Transaction Fee + Interest Spread' } },
  { category: 'coaching', name: 'IIT-JEE Hybrid Coaching', desc: 'Offline + Online hybrid coaching in Kota for JEE Mains & Advanced preparation', tags: ['JEE', 'Kota', 'Hybrid', 'Engineering'], data: { description: 'Hybrid coaching institute for IIT-JEE preparation with both classroom and online components, faculty from IITs', location: 'Kota, Rajasthan', experience: '8 years in coaching', team_size: '20 staff', investment: '₹50 Lakh setup', revenue_goal: '800 students by Year 2', exam_focus: 'IIT-JEE Mains & Advanced', student_count: '500 enrolled', faculty_count: '15 faculty (IIT alumni)', fee_per_student: '₹1,20,000 per year', delivery_mode: 'Hybrid (Online + Offline)', success_rate: '45 IIT selections in 2023' } },
  { category: 'coaching', name: 'UPSC Digital Academy', desc: 'Digital-first UPSC coaching with live mentorship, test series, and community learning', tags: ['UPSC', 'Online', 'Digital', 'IAS'], data: { description: 'Pan-India online coaching for UPSC Civil Services with live classes, mentorship from past toppers, and comprehensive test series', location: 'Online (Pan India)', experience: '3 years online focus', team_size: '25 staff', investment: '₹80 Lakh', revenue_goal: '5000 subscribers in 18 months', exam_focus: 'UPSC CSE (Prelims + Mains + Interview)', student_count: '2000 active subscribers', faculty_count: '20 educators + guest faculty', fee_per_student: '₹45,000 per year', delivery_mode: 'Online (Live)', success_rate: '12 IAS selections 2022-23' } },
  { category: 'coaching', name: 'Personality & English Institute', desc: 'Spoken English and personality development for fresh graduates and job seekers', tags: ['Spoken English', 'Soft Skills', 'Delhi', 'Job Seekers'], data: { description: 'Spoken English and personality development institute targeting college graduates and job seekers in Delhi NCR', location: 'Delhi NCR (3 centers)', experience: '2 years', team_size: '8 people', investment: '₹15 Lakh', revenue_goal: '500 students by end of Year 1', exam_focus: 'Spoken English, Personality Development, Interview Skills', student_count: '200 students', faculty_count: '5 trainers', fee_per_student: '₹15,000 per course', delivery_mode: 'Offline (Classroom)', success_rate: '80% students got placed within 3 months' } },
  { category: 'restaurant', name: 'Multi-Brand Cloud Kitchen', desc: 'Cloud kitchen running 4 virtual restaurant brands on Zomato and Swiggy in Hyderabad', tags: ['Cloud Kitchen', 'Zomato', 'Multi-brand', 'Delivery'], data: { description: 'Multi-brand cloud kitchen with 4 virtual restaurants (North Indian, Chinese, Burger, Healthy Bowl) operating on Zomato and Swiggy', location: 'Hyderabad (Kondapur & Gachibowli)', experience: '4 years in F&B', team_size: '8 kitchen staff', investment: '₹8 Lakh', revenue_goal: '500 orders/day in 6 months', cuisine: 'North Indian, Chinese, Burgers, Healthy', rest_type: 'Cloud Kitchen', seating: 'No seating (delivery only)', avg_order: '₹320 per order' } },
  { category: 'retail', name: 'Ayurvedic Skincare D2C Brand', desc: 'Organic skincare targeting urban millennials via Instagram and own D2C website', tags: ['D2C', 'Ayurvedic', 'Skincare', 'Instagram'], data: { description: 'Ayurvedic skincare brand with 25 SKUs targeting urban millennials, sold via Instagram commerce and own Shopify store', location: 'Jaipur (sourcing) + Pan India (online)', experience: '2.5 years', team_size: '6 people', investment: '₹15 Lakh', revenue_goal: '1 Cr revenue in Year 2', product_category: 'Natural/Ayurvedic Skincare', sales_channel: 'D2C Website Only', monthly_orders: '500 orders/month', avg_price: '₹799 avg selling price' } }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setVentureType('startup', document.querySelector('.venture-btn[data-type="startup"]'));
  renderExamples();
});

function setVentureType(type, btn) {
  currentVentureType = type;
  document.querySelectorAll('.venture-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('dynamic-fields').innerHTML = DYNAMIC_FIELDS[type] || '';
}

function renderExamples(filter = 'all') {
  const grid = document.getElementById('examplesGrid');
  const filtered = filter === 'all' ? EXAMPLE_DATA : EXAMPLE_DATA.filter(e => e.category === filter);

  grid.innerHTML = filtered.map((ex, i) => `
    <div class="example-card" data-category="${ex.category}">
      <div class="ec-category">🏷️ ${ex.category.toUpperCase()}</div>
      <div class="ec-name">${ex.name}</div>
      <div class="ec-desc">${ex.desc}</div>
      <div class="ec-tags">${ex.tags.map(t => `<span class="ec-tag">${t}</span>`).join('')}</div>
      <button class="ec-btn" onclick="loadExample(${EXAMPLE_DATA.indexOf(ex)})">
        ⚡ Analyze This Example →
      </button>
    </div>
  `).join('');
}

function filterExamples(cat, btn) {
  document.querySelectorAll('.ex-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderExamples(cat);
}

function loadExample(idx) {
  const ex = EXAMPLE_DATA[idx];
  setVentureType(ex.category, document.querySelector(`.venture-btn[data-type="${ex.category}"]`));
  document.getElementById('description').value = ex.data.description || '';
  document.getElementById('location').value = ex.data.location || '';
  document.getElementById('experience').value = ex.data.experience || '';
  document.getElementById('team_size').value = ex.data.team_size || '';
  document.getElementById('investment').value = ex.data.investment || '';
  document.getElementById('revenue_goal').value = ex.data.revenue_goal || '';
  setTimeout(() => {
    const fields = ex.data;
    for (const [k, v] of Object.entries(fields)) {
      const el = document.getElementById(k);
      if (el && k !== 'description') el.value = v;
    }
  }, 100);
  document.getElementById('analyze').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => analyzeVenture(), 500);
}

async function analyzeVenture() {
  const description = document.getElementById('description').value.trim();
  if (!description) { alert('Please describe your business!'); return; }

  const ventureData = {};
  document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
    if (el.id && el.value && el.id !== 'description') {
      ventureData[el.id] = el.value;
    }
  });
  ['location', 'experience', 'team_size', 'investment', 'revenue_goal'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value) ventureData[id] = el.value;
  });

  showLoading();
  animateLoaderSteps();

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venture_type: currentVentureType, venture_data: ventureData, description })
    });
    const data = await res.json();
    if (data.success) renderResult(data.analysis, currentVentureType);
    else showError(data.error);
  } catch (e) {
    showError('Network error: ' + e.message);
  }
}

function animateLoaderSteps() {
  const steps = document.querySelectorAll('.ls');
  let current = 0;
  steps.forEach(s => s.classList.remove('active'));
  steps[0].classList.add('active');
  const interval = setInterval(() => {
    current++;
    if (current >= steps.length) { clearInterval(interval); return; }
    steps.forEach(s => s.classList.remove('active'));
    steps[current].classList.add('active');
  }, 1800);
}

function showLoading() {
  document.getElementById('resultsPlaceholder').style.display = 'none';
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('analysisResult').style.display = 'none';
  document.getElementById('analyzeBtn').disabled = true;
}

function showError(msg) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('analyzeBtn').disabled = false;
  document.getElementById('analysisResult').style.display = 'block';
  document.getElementById('analysisResult').innerHTML = `
    <div style="text-align:center;padding:40px 20px;">
      <div style="font-size:2.5rem;margin-bottom:16px;">⚠️</div>
      <h3 style="color:#ef4444;font-family:var(--font-head);margin-bottom:8px;">Analysis Failed</h3>
      <p style="color:var(--text2);font-size:0.9rem;">${msg}</p>
      <p style="color:var(--text3);font-size:0.8rem;margin-top:12px;">Make sure your Flask server is running and the Anthropic API key is configured.</p>
    </div>`;
}

function renderResult(a, type) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('analysisResult').style.display = 'block';
  document.getElementById('analyzeBtn').disabled = false;

  const prob = a.success_probability || 0;
  const color = prob >= 70 ? '#10b981' : prob >= 45 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (prob / 100) * circumference;

  const riskBadge = { Low: 'green', Medium: 'orange', High: 'red', Critical: 'red' }[a.risk_level] || 'orange';
  const marketBadge = { Low: 'red', Medium: 'orange', High: 'green', 'Very High': 'green' }[a.market_potential] || 'blue';

  const swot = `
    <div class="ar-section-title">SWOT Analysis</div>
    <div class="swot-grid">
      <div class="swot-box s"><div class="swot-label">💪 Strengths</div>${(a.strengths||[]).map(s=>`<div class="swot-item">• ${s}</div>`).join('')}</div>
      <div class="swot-box w"><div class="swot-label">⚠️ Weaknesses</div>${(a.weaknesses||[]).map(s=>`<div class="swot-item">• ${s}</div>`).join('')}</div>
      <div class="swot-box o"><div class="swot-label">🚀 Opportunities</div>${(a.opportunities||[]).map(s=>`<div class="swot-item">• ${s}</div>`).join('')}</div>
      <div class="swot-box t"><div class="swot-label">🔺 Threats</div>${(a.threats||[]).map(s=>`<div class="swot-item">• ${s}</div>`).join('')}</div>
    </div>`;

  const factors = (a.key_factors || []).slice(0, 6).map(f => {
    const fc = f.impact === 'positive' ? '#10b981' : f.impact === 'negative' ? '#ef4444' : '#f59e0b';
    return `<div class="factor-row">
      <div class="factor-name">${f.factor}</div>
      <div class="factor-bar-wrap"><div class="factor-bar" style="width:${f.score*10}%;background:${fc}"></div></div>
      <div class="factor-score" style="color:${fc}">${f.score}</div>
    </div>`;
  }).join('');

  const recs = (a.recommendations || []).map((r, i) =>
    `<div class="rec-item"><div class="rec-num">${String(i+1).padStart(2,'0')}</div><div class="rec-text">${r}</div></div>`
  ).join('');

  const redFlags = (a.red_flags || []).length
    ? `<div class="ar-divider"></div>
       <div class="ar-section-title">🚩 Red Flags</div>
       <div class="red-flags-list">${a.red_flags.map(f=>`<div class="flag-item">⚠️ ${f}</div>`).join('')}</div>`
    : '';

  const similarStories = (a.similar_success_stories || []).length
    ? `<div class="ar-divider"></div>
       <div class="ar-section-title">⭐ Similar Success Stories</div>
       <div style="display:flex;flex-wrap:wrap;gap:6px">${a.similar_success_stories.map(s=>`<span class="badge badge-purple">${s}</span>`).join('')}</div>`
    : '';

  document.getElementById('analysisResult').innerHTML = `
    <div class="ar-header">
      <div class="ar-venture-type">${type.toUpperCase()} ANALYSIS</div>
      <div class="ar-verdict">${a.verdict || ''}</div>
    </div>

    <div class="probability-block">
      <div class="prob-gauge">
        <svg viewBox="0 0 120 120" width="140" height="140">
          <circle class="gauge-bg" cx="60" cy="60" r="54"/>
          <circle class="gauge-fill" cx="60" cy="60" r="54"
            stroke="${color}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            id="gaugeFill"/>
        </svg>
        <div class="prob-num">
          <div class="prob-value" style="color:${color}" id="probCounter">0%</div>
          <div class="prob-label">Success</div>
        </div>
      </div>
      <div class="badges-row">
        <span class="badge badge-${riskBadge}">Risk: ${a.risk_level}</span>
        <span class="badge badge-${marketBadge}">Market: ${a.market_potential}</span>
        <span class="badge badge-cyan">Confidence: ${a.confidence_level}%</span>
        <span class="badge badge-purple">Profit: ${a.timeline_to_profitability || 'N/A'}</span>
      </div>
    </div>

    <div class="ar-divider"></div>
    ${swot}

    <div class="ar-divider"></div>
    <div class="ar-section-title">📊 Key Success Factors (0–10)</div>
    <div class="factors-list">${factors}</div>

    <div class="ar-divider"></div>
    <div class="ar-section-title">🎯 Strategic Recommendations</div>
    <div class="recs-list">${recs}</div>

    ${redFlags}
    ${similarStories}

    <div class="ar-divider"></div>
    <div class="ar-section-title">📝 Overall Summary</div>
    <div class="summary-box">${a.overall_summary || ''}</div>
  `;

  // Animate counter
  let count = 0;
  const target = prob;
  const step = Math.ceil(target / 40);
  const counter = document.getElementById('probCounter');
  const timer = setInterval(() => {
    count = Math.min(count + step, target);
    if (counter) counter.textContent = count + '%';
    if (count >= target) clearInterval(timer);
  }, 30);

  document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
