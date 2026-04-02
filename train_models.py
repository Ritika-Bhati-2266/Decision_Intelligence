"""
DecisionIQ — ML Model Trainer
Trains Random Forest models for each business category.
Run once: python train_models.py
"""
import numpy as np
import pickle, os

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

np.random.seed(42)
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

def synthetic(n, feat_fn, label_fn):
    X, y = [], []
    for _ in range(n):
        f = feat_fn()
        X.append(f)
        y.append(label_fn(f))
    return np.array(X, dtype=float), np.array(y)

# ─── STARTUP ────────────────────────────────────────────────────────────────
# Features: [funding_log, team_size, mrr_log, market_size(0-3),
#            experience_yrs, has_tech_cofounder, biz_model(0-3), competition(0-3)]
def startup_feat():
    return [
        np.random.uniform(0, 8),   # funding log(USD) 0=bootstrapped 8=series B
        np.random.randint(1, 60),  # team size
        np.random.uniform(0, 7),   # MRR log
        np.random.randint(0, 4),   # market size
        np.random.randint(0, 15),  # founder experience
        np.random.randint(0, 2),   # tech cofounder
        np.random.randint(0, 4),   # biz model strength
        np.random.randint(0, 4),   # competition level (lower=better)
    ]

def startup_label(f):
    score = (
        f[0] * 0.18 +
        min(f[1], 20) * 0.05 +
        f[2] * 0.20 +
        f[3] * 0.12 +
        f[4] * 0.10 +
        f[5] * 1.5 +
        f[6] * 0.8 +
        (3 - f[7]) * 0.5
    )
    thresh = np.random.normal(4.5, 0.8)
    return int(score > thresh)

X_s, y_s = synthetic(4000, startup_feat, startup_label)

# ─── COACHING ───────────────────────────────────────────────────────────────
# Features: [students, faculty, fee_per_student_log, experience_yrs,
#            location_tier(0-2), delivery_mode(0-3), result_rate, brand_strength(0-3)]
def coaching_feat():
    return [
        np.random.randint(20, 3000),
        np.random.randint(1, 50),
        np.random.uniform(3, 12),
        np.random.randint(0, 20),
        np.random.randint(0, 3),
        np.random.randint(0, 4),
        np.random.uniform(0, 80),
        np.random.randint(0, 4),
    ]

def coaching_label(f):
    score = (
        min(f[0], 1000) / 1000 * 2.5 +
        min(f[1], 20) / 20 * 1.5 +
        f[2] * 0.15 +
        f[3] * 0.12 +
        f[4] * 0.4 +
        f[5] * 0.3 +
        f[6] * 0.04 +
        f[7] * 0.5
    )
    return int(score > np.random.normal(4.0, 0.7))

X_c, y_c = synthetic(4000, coaching_feat, coaching_label)

# ─── RESTAURANT ─────────────────────────────────────────────────────────────
# Features: [investment_log, location_footfall(0-3), cuisine_popularity(0-3),
#            rest_type(0-4), avg_order_value, seating, experience_yrs, delivery_presence]
def restaurant_feat():
    return [
        np.random.uniform(3, 8),
        np.random.randint(0, 4),
        np.random.randint(0, 4),
        np.random.randint(0, 5),
        np.random.uniform(100, 1500),
        np.random.randint(0, 150),
        np.random.randint(0, 20),
        np.random.randint(0, 2),
    ]

def restaurant_label(f):
    score = (
        f[0] * 0.2 +
        f[1] * 0.8 +
        f[2] * 0.6 +
        f[3] * 0.3 +
        min(f[4], 800) / 800 * 1.5 +
        min(f[5], 80) / 80 * 0.8 +
        f[6] * 0.12 +
        f[7] * 0.7
    )
    return int(score > np.random.normal(4.2, 0.8))

X_r, y_r = synthetic(4000, restaurant_feat, restaurant_label)

# ─── RETAIL / D2C ───────────────────────────────────────────────────────────
# Features: [investment_log, monthly_orders, avg_price, channel(0-4),
#            niche_demand(0-3), team_size, experience_yrs, repeat_rate(0-100)]
def retail_feat():
    return [
        np.random.uniform(3, 8),
        np.random.randint(10, 5000),
        np.random.uniform(100, 5000),
        np.random.randint(0, 5),
        np.random.randint(0, 4),
        np.random.randint(1, 30),
        np.random.randint(0, 15),
        np.random.uniform(5, 70),
    ]

def retail_label(f):
    score = (
        f[0] * 0.15 +
        min(f[1], 2000) / 2000 * 2.5 +
        min(f[2], 2000) / 2000 * 1.0 +
        f[3] * 0.4 +
        f[4] * 0.6 +
        min(f[5], 15) / 15 * 0.5 +
        f[6] * 0.08 +
        f[7] * 0.03
    )
    return int(score > np.random.normal(4.0, 0.75))

X_rt, y_rt = synthetic(4000, retail_feat, retail_label)

# ─── SAAS ───────────────────────────────────────────────────────────────────
def saas_feat():
    return [
        np.random.uniform(0, 8),   # funding
        np.random.uniform(0, 7),   # mrr log
        np.random.randint(0, 3),   # target (b2b/b2c/enterprise)
        np.random.randint(0, 500), # paying customers
        np.random.uniform(0, 15),  # churn %
        np.random.randint(1, 30),  # team
        np.random.randint(0, 15),  # experience
        np.random.randint(0, 4),   # market size
    ]

def saas_label(f):
    score = (
        f[0] * 0.18 +
        f[1] * 0.22 +
        f[2] * 0.5 +
        min(f[3], 200) / 200 * 2.0 +
        (15 - min(f[4], 15)) * 0.15 +
        min(f[5], 20) / 20 * 0.8 +
        f[6] * 0.08 +
        f[7] * 0.4
    )
    return int(score > np.random.normal(4.5, 0.8))

X_sa, y_sa = synthetic(4000, saas_feat, saas_label)

# ─── HEALTHCARE ─────────────────────────────────────────────────────────────
def health_feat():
    return [
        np.random.uniform(3, 8),  # funding
        np.random.randint(0, 3),  # regulatory status
        np.random.randint(0, 4),  # segment demand
        np.random.randint(1, 40), # team
        np.random.randint(0, 15), # experience
        np.random.randint(0, 3),  # tech enabled
        np.random.randint(0, 4),  # geographic reach
        np.random.uniform(0, 7),  # revenue log
    ]

def health_label(f):
    score = (
        f[0] * 0.18 +
        f[1] * 1.2 +
        f[2] * 0.8 +
        min(f[3], 20) / 20 * 1.0 +
        f[4] * 0.12 +
        f[5] * 0.8 +
        f[6] * 0.4 +
        f[7] * 0.18
    )
    return int(score > np.random.normal(4.3, 0.8))

X_h, y_h = synthetic(4000, health_feat, health_label)

# ─── TRAIN & SAVE ───────────────────────────────────────────────────────────
DATASETS = {
    "startup":    (X_s,  y_s),
    "coaching":   (X_c,  y_c),
    "restaurant": (X_r,  y_r),
    "retail":     (X_rt, y_rt),
    "saas":       (X_sa, y_sa),
    "healthcare": (X_h,  y_h),
}

for name, (X, y) in DATASETS.items():
    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", GradientBoostingClassifier(n_estimators=200, max_depth=4, learning_rate=0.1, random_state=42))
    ])
    pipe.fit(X, y)
    path = os.path.join(MODELS_DIR, f"{name}.pkl")
    with open(path, "wb") as f:
        pickle.dump(pipe, f)
    acc = pipe.score(X, y)
    print(f"✓ {name:<12} — accuracy {acc:.3f}  |  saved → {path}")

print("\n✅ All models trained and saved!")
