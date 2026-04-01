# DecisionIQ — AI-Powered Decision Intelligence System

A beautiful, responsive Flask web app that uses Claude AI to predict the success probability of any business venture.

## Features
- 🚀 **8 Business Categories**: Startup, Coaching, Restaurant, Retail, SaaS, Healthcare, E-Commerce, Real Estate
- 📊 **Detailed Analysis**: Success probability, SWOT, key factors, risk rating, recommendations
- 🎓 **8 Pre-built Examples**: IIT-JEE coaching, UPSC academy, EdTech SaaS, FinTech, Cloud Kitchen, Skincare D2C & more
- 📱 **Fully Responsive**: Works on mobile, tablet, and desktop
- ⚡ **Powered by Claude AI** — No API key needed in UI (handled server-side)

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Your Anthropic API Key
```bash
# Linux/Mac
export ANTHROPIC_API_KEY="your-api-key-here"

# Windows CMD
set ANTHROPIC_API_KEY=your-api-key-here

# Windows PowerShell
$env:ANTHROPIC_API_KEY="your-api-key-here"
```

Get your API key from: https://console.anthropic.com

### 3. Run the App
```bash
python app.py
```

Open your browser at: **http://localhost:5000**

## Project Structure
```
decision-intelligence/
├── app.py                  # Flask backend + API routes
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Main HTML page
└── static/
    ├── css/
    │   └── style.css       # Styles & animations
    └── js/
        └── app.js          # Frontend logic
```

## How It Works
1. User selects business type and fills in details
2. Flask sends data to Anthropic Claude API
3. Claude analyzes 20+ factors and returns structured JSON
4. Frontend renders animated success gauge, SWOT, factors, recommendations

## Business Categories Supported
| Category | Examples |
|----------|---------|
| 🚀 Startup | EdTech, FinTech, HealthTech |
| 🎓 Coaching | IIT-JEE, UPSC, Spoken English |
| 🍽️ Restaurant | Cloud Kitchen, Dine-in, QSR |
| 🛍️ Retail | D2C, Marketplace, Omnichannel |
| 💻 SaaS | B2B, B2C, Enterprise SaaS |
| 🏥 Healthcare | Telemedicine, Diagnostics |
| 📦 E-Commerce | Shopify, Amazon FBA, Social Commerce |
| 🏗️ Real Estate | Residential, Commercial, PropTech |
