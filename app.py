"""
DecisionIQ v2 — Premium AI Business Intelligence
New features: Compare mode, History, Export PDF, Score breakdown, Sector benchmarks
No external API — 100% scikit-learn ML
"""
from flask import Flask, render_template, request, jsonify, session
import numpy as np, pickle, os, math, json, datetime, uuid

app = Flask(__name__)
app.secret_key = "decisioniq-secret-2025"
MODELS_DIR = "models"
_models = {}

def load_model(name):
    if name not in _models:
        path = os.path.join(MODELS_DIR, f"{name}.pkl")
        if os.path.exists(path):
            with open(path, "rb") as f:
                _models[name] = pickle.load(f)
    return _models.get(name)

# ── Feature helpers ──────────────────────────────────────────────────────────
def parse_money(s, default=0):
    if not s: return default
    s = str(s).lower().replace(",", "").strip()
    mult = 1
    if "cr" in s or "crore" in s: mult = 10_000_000
    elif "lakh" in s or "lac" in s: mult = 100_000
    elif "m usd" in s or "million" in s: mult = 1_000_000
    elif "k usd" in s or "k$" in s: mult = 1_000
    elif "m" in s and "usd" not in s: mult = 1_000_000
    elif "k" in s: mult = 1_000
    import re
    nums = re.findall(r"[\d.]+", s)
    if nums: return float(nums[0]) * mult
    return default

def safe_int(v, default=0):
    try: return int(str(v).replace(",","").split()[0])
    except: return default

def safe_float(v, default=0.0):
    try: return float(str(v).replace(",","").split()[0])
    except: return default

def log_money(v): return math.log1p(max(v, 0))

LOCATION_TIER = {
    "mumbai":2,"delhi":2,"bangalore":2,"bengaluru":2,"hyderabad":2,"chennai":2,"kolkata":2,"pune":2,
    "jaipur":1,"kota":1,"lucknow":1,"bhopal":1,"indore":1,"nagpur":1,"ahmedabad":1,"surat":1,
    "chandigarh":1,"coimbatore":1,"online":2,"pan india":2,"metro":2,"tier1":2,"tier 1":2,
}
def location_tier(loc):
    if not loc: return 1
    loc = loc.lower()
    for k, v in LOCATION_TIER.items():
        if k in loc: return v
    return 0

BIZ_MODEL_SCORE = {"saas":3,"subscription":3,"marketplace":2,"d2c":2,"b2b":2,"franchise":2,"service":1,"trading":0}
def biz_model_score(bm):
    if not bm: return 1
    bm = bm.lower()
    for k, v in BIZ_MODEL_SCORE.items():
        if k in bm: return v
    return 1

COMPETITION_SCORE = {"low":0,"minimal":0,"moderate":1,"medium":2,"high":3,"intense":3,"saturated":3}
def competition_score(c):
    if not c: return 2
    c = c.lower()
    for k, v in COMPETITION_SCORE.items():
        if k in c: return v
    return 2

CHANNEL_SCORE = {"shopify":3,"d2c":3,"instagram":3,"amazon":3,"fba":3,"omnichannel":4,"marketplace":2,"meesho":2,"flipkart":2,"offline":1}
def channel_score(ch):
    if not ch: return 1
    ch = ch.lower()
    for k, v in CHANNEL_SCORE.items():
        if k in ch: return v
    return 1

DELIVERY_SCORE = {"hybrid":3,"online":2,"live":2,"recorded":1,"offline":1,"classroom":1}
def delivery_score(d):
    if not d: return 1
    d = d.lower()
    for k, v in DELIVERY_SCORE.items():
        if k in d: return v
    return 1

REST_TYPE_SCORE = {"cloud kitchen":3,"qsr":3,"quick service":3,"cafe":2,"bistro":2,"dine":1,"fine dining":1,"dhaba":0}
def rest_type_score(rt):
    if not rt: return 1
    rt = rt.lower()
    for k, v in REST_TYPE_SCORE.items():
        if k in rt: return v
    return 1

# ── Feature Builders ─────────────────────────────────────────────────────────
def features_startup(d):
    return [
        log_money(parse_money(d.get("funding", d.get("investment","0")))),
        min(safe_int(d.get("team_size","5")), 60),
        log_money(parse_money(d.get("mrr","0"))),
        safe_int(d.get("market_size","2"), 2),
        safe_int(d.get("experience","3"), 3),
        1 if any(k in str(d).lower() for k in ["tech","iit","nit","engineer","developer"]) else 0,
        biz_model_score(d.get("biz_model","")),
        competition_score(d.get("competition","")),
    ]

def features_coaching(d):
    import re
    students = min(safe_int(d.get("student_count","100")), 3000)
    result_str = str(d.get("success_rate","30"))
    nums = [float(x) for x in re.findall(r"[\d.]+", result_str)]
    result = min(nums[0], 100) if nums else 30.0
    return [
        students, min(safe_int(d.get("faculty_count","5")), 50),
        log_money(parse_money(d.get("fee_per_student","50000"))),
        safe_int(d.get("experience","3")),
        location_tier(d.get("location","")),
        delivery_score(d.get("delivery_mode","offline")),
        result,
        safe_int(d.get("brand_strength","1"), 1),
    ]

def features_restaurant(d):
    return [
        log_money(parse_money(d.get("investment","500000"))),
        safe_int(d.get("footfall","2"), 2),
        safe_int(d.get("cuisine_popularity","2"), 2),
        rest_type_score(d.get("rest_type", d.get("restaurant_type",""))),
        safe_float(d.get("avg_order","350")),
        safe_int(d.get("seating","40")),
        safe_int(d.get("experience","2")),
        1 if any(k in str(d).lower() for k in ["zomato","swiggy","delivery","online"]) else 0,
    ]

def features_retail(d):
    return [
        log_money(parse_money(d.get("investment","200000"))),
        min(safe_int(d.get("monthly_orders","100")), 5000),
        safe_float(d.get("avg_price", d.get("avg_selling_price","500"))),
        channel_score(d.get("sales_channel","")),
        safe_int(d.get("niche_demand","2"), 2),
        min(safe_int(d.get("team_size","3")), 30),
        safe_int(d.get("experience","2")),
        safe_float(d.get("repeat_rate","25")),
    ]

def features_saas(d):
    return [
        log_money(parse_money(d.get("funding","0"))),
        log_money(parse_money(d.get("mrr","0"))),
        {"b2b":1,"enterprise":2,"b2c":0,"b2b2c":1}.get(str(d.get("saas_target","b2b")).lower()[:3], 1),
        min(safe_int(d.get("saas_users","10")), 500),
        safe_float(d.get("churn","5")),
        min(safe_int(d.get("team_size","5")), 30),
        safe_int(d.get("experience","3")),
        safe_int(d.get("market_size","2"), 2),
    ]

def features_healthcare(d):
    reg_map = {"licensed":2,"certified":2,"in progress":1,"not started":0,"not required":2}
    return [
        log_money(parse_money(d.get("investment", d.get("funding","0")))),
        reg_map.get(str(d.get("reg_status","")).lower(), 1),
        safe_int(d.get("segment_demand","2"), 2),
        min(safe_int(d.get("team_size","5")), 40),
        safe_int(d.get("experience","3")),
        1 if any(k in str(d).lower() for k in ["ai","ml","tech","app","digital","tele"]) else 0,
        safe_int(d.get("geo_reach","2"), 2),
        log_money(parse_money(d.get("revenue","0"))),
    ]

FEATURE_BUILDERS = {
    "startup":    features_startup,
    "coaching":   features_coaching,
    "restaurant": features_restaurant,
    "retail":     features_retail,
    "saas":       features_saas,
    "healthcare": features_healthcare,
    "ecommerce":  features_retail,
    "realestate": features_startup,
    "manufacturing": features_startup,
    "agriculture": features_startup,
}

# ── SWOT Rules ───────────────────────────────────────────────────────────────
SWOT_RULES = {
    "startup": {
        "strengths": [
            (lambda d: parse_money(d.get("funding","0")) > 500000, "Strong funding backing significantly reduces runway risk"),
            (lambda d: safe_int(d.get("team_size","0")) >= 8, "Well-sized core team capable of parallel execution tracks"),
            (lambda d: parse_money(d.get("mrr","0")) > 10000, "Existing MRR proves product-market fit beyond idea stage"),
            (lambda d: "iit" in str(d).lower() or "nit" in str(d).lower(), "Pedigreed founding team brings instant credibility and talent access"),
            (lambda d: biz_model_score(d.get("biz_model","")) >= 2, "Scalable business model with strong unit economics potential"),
            (lambda d: competition_score(d.get("competition","")) <= 1, "Low-competition environment allows rapid category capture"),
        ],
        "weaknesses": [
            (lambda d: parse_money(d.get("funding","0")) == 0, "Bootstrapped — limited runway may constrain aggressive growth"),
            (lambda d: safe_int(d.get("team_size","0")) < 3, "Thin team creates execution bandwidth and key-person risk"),
            (lambda d: parse_money(d.get("mrr","0")) == 0, "Pre-revenue — product-market fit still unproven in the market"),
            (lambda d: safe_int(d.get("experience","0")) < 2, "Limited domain experience increases operational learning curve"),
            (lambda d: competition_score(d.get("competition","")) >= 3, "Saturated market makes differentiation expensive and difficult"),
        ],
        "opportunities": [
            (lambda d: "india" in str(d).lower() or "tier" in str(d).lower(), "Massive untapped Indian market with growing digital adoption"),
            (lambda d: "ai" in str(d).lower() or "ml" in str(d).lower(), "AI wave creating defensible moats and premium pricing power"),
            (lambda d: biz_model_score(d.get("biz_model","")) >= 2, "SaaS/subscription models attract premium venture capital multiples"),
            (lambda d: True, "Post-COVID digital infrastructure is now mature for rapid scale"),
        ],
        "threats": [
            (lambda d: competition_score(d.get("competition","")) >= 2, "Well-funded incumbents can outspend on marketing and distribution"),
            (lambda d: True, "Global macro uncertainty continues to impact VC sentiment in 2025"),
            (lambda d: parse_money(d.get("funding","0")) < 200000, "Limited runway creates existential risk if next round is delayed"),
            (lambda d: True, "Talent war for top engineers drives compensation costs 40%+ above plan"),
        ],
    },
    "coaching": {
        "strengths": [
            (lambda d: safe_int(d.get("student_count","0")) > 200, "Strong enrollment validates demand and builds brand credibility"),
            (lambda d: safe_int(d.get("experience","0")) > 5, "Deep domain expertise and reputation drives organic word-of-mouth"),
            (lambda d: "iit" in str(d.get("success_rate","")).lower(), "Proven IIT selection track record — the strongest marketing asset"),
            (lambda d: delivery_score(d.get("delivery_mode","")) == 3, "Hybrid model maximises reach while maintaining quality standards"),
            (lambda d: safe_int(d.get("faculty_count","0")) > 10, "Strong faculty bench ensures low student-to-teacher ratio"),
        ],
        "weaknesses": [
            (lambda d: safe_int(d.get("student_count","0")) < 50, "Low enrollment creates cashflow vulnerability and fixed-cost pressure"),
            (lambda d: safe_int(d.get("experience","0")) < 2, "New brand requires 2-3 years to build trust in competitive market"),
            (lambda d: delivery_score(d.get("delivery_mode","")) == 1, "Offline-only model severely limits geographic reach and scalability"),
            (lambda d: safe_int(d.get("faculty_count","0")) < 3, "Thin faculty creates star-teacher dependency and key-person risk"),
            (lambda d: parse_money(d.get("fee_per_student","0")) < 10000, "Low fee structure compresses margins — difficult to scale profitably"),
        ],
        "opportunities": [
            (lambda d: True, "India's coaching industry is a ₹58,000 Cr market growing at 10% CAGR"),
            (lambda d: delivery_score(d.get("delivery_mode","")) <= 2, "Going hybrid can 10x student reach with minimal incremental cost"),
            (lambda d: True, "30M+ government exam aspirants creating massive underserved demand"),
            (lambda d: True, "AI-powered adaptive testing emerging as key competitive differentiator"),
        ],
        "threats": [
            (lambda d: True, "PhysicsWallah, Unacademy offer subsidised/free content undermining pricing"),
            (lambda d: delivery_score(d.get("delivery_mode","")) == 1, "Online-only competitors can undercut offline pricing by 60-70%"),
            (lambda d: True, "Star teacher exits can wipe out a significant student base overnight"),
            (lambda d: True, "Exam pattern changes can make existing study material obsolete quickly"),
        ],
    },
    "restaurant": {
        "strengths": [
            (lambda d: rest_type_score(d.get("rest_type","")) >= 3, "Cloud/QSR model offers lean ops and faster break-even period"),
            (lambda d: any(k in str(d).lower() for k in ["zomato","swiggy"]), "Aggregator presence gives immediate access to millions of hungry users"),
            (lambda d: safe_int(d.get("experience","0")) > 4, "F&B experience significantly reduces costly operational mistakes"),
            (lambda d: safe_float(d.get("avg_order","0")) > 400, "Premium AOV improves contribution margin per order meaningfully"),
        ],
        "weaknesses": [
            (lambda d: rest_type_score(d.get("rest_type","")) == 0, "High rental for dine-in compresses already razor-thin margins"),
            (lambda d: safe_int(d.get("experience","0")) < 2, "F&B is execution-heavy — learning curve is expensive in this business"),
            (lambda d: parse_money(d.get("investment","0")) < 300000, "Underfunded setup risks quality compromises that hurt early reviews"),
            (lambda d: True, "High dependency on aggregators eating 25-30% commission per order"),
        ],
        "opportunities": [
            (lambda d: True, "India food delivery market set to reach $21B by 2026 — huge runway"),
            (lambda d: any(k in str(d).lower() for k in ["healthy","organic","vegan"]), "Health-conscious consumers driving premium nutrition segment growth"),
            (lambda d: True, "Multi-brand cloud kitchens can test new concepts quickly with low risk"),
            (lambda d: True, "Tier 2 cities seeing 2x growth in food delivery adoption YoY"),
        ],
        "threats": [
            (lambda d: True, "Aggregator platforms delist or penalise restaurants with ratings below 4.0"),
            (lambda d: True, "Raw material cost volatility (oil, tomato, onion) can destroy margins overnight"),
            (lambda d: True, "High kitchen staff turnover is a persistent and costly operational challenge"),
            (lambda d: True, "New cloud kitchen competitors launching weekly in most urban pin codes"),
        ],
    },
}

# ── Key Factors ───────────────────────────────────────────────────────────────
def get_key_factors(venture_type, data):
    fm = {
        "startup": [
            ("Funding Strength",    min(10, log_money(parse_money(data.get("funding",data.get("investment","0")))) * 1.3)),
            ("Team Quality",        min(10, safe_int(data.get("team_size","5")) * 0.4 + 3)),
            ("Revenue Traction",    min(10, log_money(parse_money(data.get("mrr","0"))) * 1.5)),
            ("Market Size",         safe_int(data.get("market_size","2"), 2) * 2.5),
            ("Founder Experience",  min(10, safe_int(data.get("experience","3")) * 0.7 + 2)),
            ("Business Model",      biz_model_score(data.get("biz_model","")) * 2.5 + 1),
            ("Competitive Edge",    (3 - competition_score(data.get("competition",""))) * 2.5 + 1),
            ("Tech Advantage",      7 if any(k in str(data).lower() for k in ["ai","ml","tech"]) else 4),
        ],
        "coaching": [
            ("Student Enrollment",  min(10, min(safe_int(data.get("student_count","50")), 1000) / 100)),
            ("Faculty Strength",    min(10, safe_int(data.get("faculty_count","5")) * 0.5 + 2)),
            ("Fee Realisation",     min(10, log_money(parse_money(data.get("fee_per_student","50000"))) * 0.9)),
            ("Track Record",        min(10, 5 + safe_int(data.get("experience","3")) * 0.5)),
            ("Delivery Innovation", delivery_score(data.get("delivery_mode","")) * 2.5 + 1),
            ("Location Advantage",  location_tier(data.get("location","")) * 3 + 2),
            ("Brand Recognition",   min(10, safe_int(data.get("experience","3")) * 0.6 + 3)),
            ("Digital Presence",    7 if "online" in str(data.get("delivery_mode","")).lower() or "hybrid" in str(data.get("delivery_mode","")).lower() else 3),
        ],
        "restaurant": [
            ("Location Quality",    location_tier(data.get("location","")) * 3 + 2),
            ("Concept Viability",   rest_type_score(data.get("rest_type","")) * 2 + 2),
            ("Unit Economics",      min(10, safe_float(data.get("avg_order","300")) / 80)),
            ("Aggregator Presence", 8 if any(k in str(data).lower() for k in ["zomato","swiggy"]) else 3),
            ("F&B Experience",      min(10, safe_int(data.get("experience","2")) * 0.7 + 2)),
            ("Investment Level",    min(10, log_money(parse_money(data.get("investment","0"))) * 0.7)),
            ("Cuisine Popularity",  safe_int(data.get("cuisine_popularity","2"), 2) * 2 + 2),
            ("Operational Readiness", min(10, safe_int(data.get("team_size","3")) * 0.8 + 3)),
        ],
    }
    rows = fm.get(venture_type, fm.get("startup"))
    return [{"factor": n, "score": max(1, min(10, round(float(s), 1))),
             "impact": "positive" if s >= 6 else ("negative" if s < 4 else "neutral")}
            for n, s in rows]

# ── Sector Benchmarks ─────────────────────────────────────────────────────────
BENCHMARKS = {
    "startup":    {"avg_success": 62, "top_quartile": 78, "bottom_quartile": 42, "sector": "Tech Startups India 2024"},
    "coaching":   {"avg_success": 68, "top_quartile": 82, "bottom_quartile": 51, "sector": "Coaching Industry India 2024"},
    "restaurant": {"avg_success": 45, "top_quartile": 65, "bottom_quartile": 28, "sector": "F&B Industry India 2024"},
    "retail":     {"avg_success": 55, "top_quartile": 72, "bottom_quartile": 36, "sector": "D2C Retail India 2024"},
    "saas":       {"avg_success": 58, "top_quartile": 76, "bottom_quartile": 38, "sector": "SaaS Companies India 2024"},
    "healthcare": {"avg_success": 60, "top_quartile": 77, "bottom_quartile": 42, "sector": "HealthTech India 2024"},
    "ecommerce":  {"avg_success": 52, "top_quartile": 70, "bottom_quartile": 33, "sector": "E-Commerce India 2024"},
    "realestate": {"avg_success": 56, "top_quartile": 74, "bottom_quartile": 37, "sector": "Real Estate India 2024"},
}

# ── Risk Breakdown ────────────────────────────────────────────────────────────
def get_risk_breakdown(venture_type, data, prob):
    base = {
        "Market Risk":     max(10, min(90, 100 - prob + np.random.uniform(-8, 8))),
        "Execution Risk":  max(10, min(90, 100 - safe_int(data.get("experience","3")) * 5 - prob * 0.3 + np.random.uniform(-5, 10))),
        "Financial Risk":  max(10, min(90, 100 - log_money(parse_money(data.get("funding", data.get("investment","0")))) * 8 + np.random.uniform(-5, 10))),
        "Team Risk":       max(10, min(90, 100 - min(safe_int(data.get("team_size","3")), 20) * 2 - 30 + np.random.uniform(-5, 10))),
        "Competitive Risk":max(10, min(90, competition_score(data.get("competition","moderate")) * 20 + np.random.uniform(-5, 10))),
    }
    return [{"label": k, "value": round(v, 1)} for k, v in base.items()]

# ── SWOT & Recs ───────────────────────────────────────────────────────────────
def get_swot(vtype, data):
    rules = SWOT_RULES.get(vtype, SWOT_RULES["startup"])
    generics = {
        "strengths":["Clear target market identified and validated","Founder passion and deep commitment to solving the problem"],
        "weaknesses":["Customer acquisition cost needs careful optimisation","Execution requires disciplined cost management to reach profitability"],
        "opportunities":["Digital transformation unlocking new distribution channels","Growing Indian middle class expanding the total addressable market"],
        "threats":["Macroeconomic headwinds affecting consumer and enterprise spending","Regulatory environment for this sector is evolving rapidly"],
    }
    result = {}
    for key in ["strengths","weaknesses","opportunities","threats"]:
        matched = [txt for cond, txt in rules.get(key,[]) if cond(data)]
        g = generics[key][:]
        while len(matched) < 2: matched.append(g.pop(0))
        result[key] = matched[:4]
    return result

RECOMMENDATIONS = {
    "startup":["Focus on 3 pilot customers — achieve 10x value before scaling sales","Build repeatable CAC:LTV model; target LTV ≥ 3× CAC before investing in growth","Hire product + growth lead early; avoid over-indexing on engineering alone","Protect IP, structure cap table cleanly before approaching Series A investors","Run weekly OKR reviews — startups die from poor prioritisation not lack of ideas","Build content and community moats early; they compound and lower CAC over time"],
    "coaching":["Invest in a public results dashboard — publish selections prominently for trust","Launch a hybrid batch immediately even at small scale — 80% margin vs 40% offline","Create a student success team for daily check-ins — retention beats acquisition","Partner with schools for bulk admissions; B2B contracts reduce sales cycle","Record all live sessions to build a compounding content library asset","Offer EMI options — reduces fee barrier and improves enrollment 30-40%"],
    "restaurant":["Perfect 3-5 hero dishes before menu expansion — focus drives ratings","Target 4.4+ rating on Zomato and Swiggy from day 1 — below 4.0 kills discovery","Set up WhatsApp channel for direct orders — saves 25% commission per order","Track food cost weekly — above 35% will destroy profitability at any volume","Invest in professional food photography — images drive 40% of aggregator CTR","Build a loyal customer base through combo deals and loyalty rewards early"],
    "retail":["Prioritise contribution margin per SKU — kill underperformers quarterly","Build email + WhatsApp list from day 1; owned channels reduce CAC by 60%+","Test micro-influencers (10K-100K followers) — better ROI than mega-influencers","Aim for >30% repeat purchase in 90 days — subscription bundles drive this","List on Amazon and Flipkart within 6 months — marketplace builds trust for D2C","Use customer UGC in ads — real photos consistently outperform studio shots"],
    "saas":["Nail one ICP segment completely before expanding to adjacent markets","Build a customer success function from day 1 — churn kills SaaS faster than CAC","Invest in product-led growth loops; in-product virality compounds over time","Publish case studies and ROI calculators — B2B buyers need proof not demos","Set up annual billing option — improves cashflow and reduces monthly churn","Track NRR (Net Revenue Retention) weekly; >110% NRR is your growth engine"],
    "healthcare":["Obtain regulatory clearances early — delays can set back launch by 12-18 months","Build trust through doctor partnerships and clinical validation reports","Focus on one geography deeply before geographic expansion","Invest in data security and patient privacy infrastructure from day 1","Partner with insurance providers to improve patient payment convenience","Build a patient community — healthcare word-of-mouth is incredibly powerful"],
}

SUCCESS_STORIES = {
    "startup":["Zepto","Razorpay","Groww","CRED","Slice","Meesho","OfBusiness"],
    "coaching":["Vedantu","PhysicsWallah","Unacademy","FIITJEE","Allen","Aakash","Topper"],
    "restaurant":["Rebel Foods","Box8","EatFit","Biryani By Kilo","Wow Momo","Faasos"],
    "retail":["Mamaearth","Sugar Cosmetics","The Whole Truth","Boat","Pilgrim","mCaffeine"],
    "saas":["Zoho","Freshworks","CleverTap","Chargebee","Postman","BrowserStack"],
    "healthcare":["Practo","1mg","PharmEasy","Pristyn Care","Healthify Me","Doceree"],
    "ecommerce":["Nykaa","Meesho","DealShare","Dukaan","Dealshare","Shopify India"],
    "realestate":["NoBroker","PropTiger","Square Yards","Stanza Living","NestAway"],
}

RED_FLAGS = {
    "startup":[(lambda d: parse_money(d.get("funding","0"))==0 and parse_money(d.get("mrr","0"))==0,"No funding AND no revenue — high burn risk within 6 months"),(lambda d: safe_int(d.get("team_size","1"))==1,"Solo founder without co-founder — execution and resilience risk"),(lambda d: competition_score(d.get("competition",""))>=3 and parse_money(d.get("funding","0"))<1000000,"Highly competitive market entered without strong funding moat")],
    "coaching":[(lambda d: safe_int(d.get("student_count","0"))<30,"Very low enrollment — below break-even for most fixed-cost structures"),(lambda d: parse_money(d.get("fee_per_student","0"))<5000,"Extremely low fee won't cover operational and faculty expenses")],
    "restaurant":[(lambda d: parse_money(d.get("investment","0"))<150000,"Very low investment for F&B — quality compromise and review risk"),(lambda d: safe_int(d.get("experience","0"))==0,"Zero F&B experience is a major risk in a thin-margin industry")],
}

def get_red_flags(vtype, data):
    return [msg for cond, msg in RED_FLAGS.get(vtype,[]) if cond(data)]

TIMELINES = {
    "startup":   [(80,"12–18 months"),(60,"18–24 months"),(40,"24–36 months"),(0,"36+ months")],
    "coaching":  [(75,"6–12 months"),(55,"12–18 months"),(35,"18–30 months"),(0,"30+ months")],
    "restaurant":[(78,"4–8 months"),(55,"8–14 months"),(35,"14–24 months"),(0,"24+ months")],
    "retail":    [(75,"6–12 months"),(50,"12–18 months"),(30,"18–30 months"),(0,"30+ months")],
    "saas":      [(80,"12–20 months"),(60,"20–30 months"),(40,"30–42 months"),(0,"42+ months")],
    "healthcare":[(75,"18–24 months"),(55,"24–36 months"),(35,"36–48 months"),(0,"48+ months")],
}
def timeline(vt, prob):
    for t, l in TIMELINES.get(vt, TIMELINES["startup"]):
        if prob >= t: return l
    return "Uncertain"

MARKET_LABELS = [(85,"Very High"),(65,"High"),(45,"Medium"),(0,"Low")]
RISK_LABELS   = [(75,"Low"),(55,"Medium"),(35,"High"),(0,"Critical")]
def market_potential(p): return next(l for t,l in MARKET_LABELS if p>=t)
def risk_level(p):       return next(l for t,l in RISK_LABELS if p>=t)

# ── Score Breakdown Dimensions ────────────────────────────────────────────────
SCORE_DIMENSIONS = {
    "startup": ["Fundability","Scalability","Team Strength","Market Timing","Product Differentiation","Revenue Potential"],
    "coaching": ["Brand Trust","Faculty Quality","Student Outcomes","Market Reach","Pricing Power","Digital Readiness"],
    "restaurant": ["Location Score","Concept Strength","Operational Efficiency","Customer Experience","Financial Health","Growth Potential"],
}

def get_score_breakdown(vtype, data, prob):
    dims = SCORE_DIMENSIONS.get(vtype, SCORE_DIMENSIONS["startup"])
    scores = []
    base = prob / 10
    for d in dims:
        s = max(1, min(10, round(base + np.random.uniform(-1.5, 1.5), 1)))
        scores.append({"dimension": d, "score": s, "max": 10})
    return scores

# ── Main Predict ──────────────────────────────────────────────────────────────
def predict(venture_type, raw_data):
    model_key = venture_type if venture_type in FEATURE_BUILDERS else "startup"
    builder = FEATURE_BUILDERS[model_key]
    model = load_model(model_key)
    feats = builder(raw_data)
    feat_arr = np.array(feats, dtype=float).reshape(1,-1)
    if model:
        proba = model.predict_proba(feat_arr)[0]
        base_prob = proba[1] * 100
    else:
        base_prob = 55.0
    noise = np.random.uniform(-3, 3)
    prob = round(max(5, min(95, base_prob + noise)), 1)

    swot  = get_swot(venture_type, raw_data)
    kf    = get_key_factors(venture_type, raw_data)
    recs  = RECOMMENDATIONS.get(venture_type, RECOMMENDATIONS["startup"])[:5]
    flags = get_red_flags(venture_type, raw_data)
    stories = SUCCESS_STORIES.get(venture_type, [])[:4]
    bench = BENCHMARKS.get(venture_type, BENCHMARKS["startup"])
    risk_bd = get_risk_breakdown(venture_type, raw_data, prob)
    score_bd = get_score_breakdown(venture_type, raw_data, prob)

    verdicts_pos = ["Strong fundamentals with a clear path to market leadership.","Well-positioned venture with validated demand signals and solid upside.","Promising setup — execution discipline will be the key differentiator."]
    verdicts_neg = ["Several structural challenges need addressing before you scale.","Viable concept but core pillars require significant strengthening.","High-risk profile — a focused de-risking strategy is recommended."]
    verdict = np.random.choice(verdicts_pos if prob >= 55 else verdicts_neg)

    sector_position = "Top Quartile" if prob >= bench["top_quartile"] else ("Above Average" if prob >= bench["avg_success"] else ("Below Average" if prob >= bench["bottom_quartile"] else "Bottom Quartile"))

    summary_templates = {
        True:  f"This {venture_type} demonstrates a {prob:.0f}% success probability across {len(feats)} key dimensions. "
               f"Primary strength: {swot['strengths'][0].split('—')[0].strip()}. "
               f"Compared to sector average of {bench['avg_success']}%, this venture sits in the {sector_position} bracket.",
        False: f"This {venture_type} carries notable risk with a {prob:.0f}% success score vs sector average of {bench['avg_success']}%. "
               f"Key concern: {swot['weaknesses'][0].split('—')[0].strip()}. "
               f"Addressing the top 2 weaknesses could push probability above the sector average.",
    }
    summary = summary_templates[prob >= 55]

    return {
        "success_probability": prob,
        "risk_level": risk_level(prob),
        "market_potential": market_potential(prob),
        "confidence_level": round(max(60, min(92, prob * 0.6 + 40)), 1),
        "timeline_to_profitability": timeline(venture_type, prob),
        "verdict": verdict,
        "overall_summary": summary,
        "strengths": swot["strengths"],
        "weaknesses": swot["weaknesses"],
        "opportunities": swot["opportunities"],
        "threats": swot["threats"],
        "key_factors": kf,
        "recommendations": recs,
        "red_flags": flags,
        "similar_success_stories": stories,
        "benchmark": bench,
        "sector_position": sector_position,
        "risk_breakdown": risk_bd,
        "score_breakdown": score_bd,
        "analysis_id": str(uuid.uuid4())[:8].upper(),
        "analyzed_at": datetime.datetime.now().strftime("%d %b %Y, %I:%M %p"),
    }

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/analyze", methods=["POST"])
def analyze():
    body = request.json or {}
    venture_type = body.get("venture_type","startup")
    raw = {**body.get("venture_data",{})}
    raw["description"] = body.get("description","")
    try:
        result = predict(venture_type, raw)
        # Store in session history (last 5)
        history = session.get("history", [])
        history.insert(0, {
            "id": result["analysis_id"],
            "type": venture_type,
            "description": raw["description"][:60] + ("…" if len(raw["description"]) > 60 else ""),
            "probability": result["success_probability"],
            "risk": result["risk_level"],
            "time": result["analyzed_at"],
        })
        session["history"] = history[:5]
        return jsonify({"success": True, "analysis": result, "venture_type": venture_type})
    except Exception as e:
        import traceback
        return jsonify({"success": False, "error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/api/history")
def get_history():
    return jsonify(session.get("history", []))

@app.route("/api/clear_history", methods=["POST"])
def clear_history():
    session["history"] = []
    return jsonify({"success": True})

@app.route("/api/health")
def health():
    loaded = []
    for m in ["startup","coaching","restaurant","retail","saas","healthcare"]:
        if load_model(m): loaded.append(m)
    return jsonify({"status":"ok","models_loaded": loaded})

if __name__ == "__main__":
    for m in ["startup","coaching","restaurant","retail","saas","healthcare"]:
        load_model(m)
    print("✅ DecisionIQ v2 → http://localhost:5000")
    app.run(debug=True, port=5000)
