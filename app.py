from flask import Flask, render_template, request, jsonify
import json
import re

app = Flask(__name__)

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

SYSTEM_PROMPT = """You are an elite Decision Intelligence AI with expertise in business analysis, market research, and predictive analytics. You analyze ventures and predict their success probability with deep reasoning.

When analyzing any business/venture, you MUST respond ONLY in valid JSON format like this:
{
  "success_probability": <number 0-100>,
  "risk_level": "<Low|Medium|High|Critical>",
  "verdict": "<one compelling sentence verdict>",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "opportunities": ["opportunity1", "opportunity2"],
  "threats": ["threat1", "threat2"],
  "key_factors": [
    {"factor": "Factor Name", "score": <0-10>, "impact": "<positive|negative|neutral>", "description": "brief explanation"}
  ],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "timeline_to_profitability": "<estimated timeline>",
  "market_potential": "<Low|Medium|High|Very High>",
  "confidence_level": <number 60-95>,
  "similar_success_stories": ["example1", "example2"],
  "red_flags": ["red flag if any, or empty array"],
  "overall_summary": "2-3 sentence detailed analysis summary"
}

Be realistic, data-driven, and insightful. Vary your success_probability based on actual analysis of the inputs provided."""

EXAMPLE_ANALYSES = {
    "startup": [
        {
            "name": "EdTech SaaS Platform",
            "description": "B2B SaaS for corporate training with AI personalization",
            "category": "startup",
            "inputs": {"funding": "2M USD Seed", "team_size": 8, "market": "Corporate Learning", "revenue": "50K MRR", "location": "Bangalore"}
        },
        {
            "name": "HealthTech App",
            "description": "Telemedicine + AI diagnostics for Tier 2/3 cities",
            "category": "startup",
            "inputs": {"funding": "500K USD Angel", "team_size": 5, "market": "Healthcare", "revenue": "10K MRR", "location": "Pune"}
        },
        {
            "name": "FinTech BNPL Startup",
            "description": "Buy Now Pay Later for SME inventory purchase",
            "category": "startup",
            "inputs": {"funding": "5M USD Series A", "team_size": 30, "market": "MSME Finance", "revenue": "200K MRR", "location": "Mumbai"}
        }
    ],
    "coaching": [
        {
            "name": "IIT-JEE Coaching Institute",
            "description": "Offline + Online hybrid coaching for JEE preparation",
            "category": "coaching",
            "inputs": {"location": "Kota, Rajasthan", "faculty_count": 15, "students": 500, "fee_per_year": "120000 INR", "experience_years": 8}
        },
        {
            "name": "UPSC Online Academy",
            "description": "Digital-first UPSC coaching with live classes and mentorship",
            "category": "coaching",
            "inputs": {"location": "Online (Pan India)", "faculty_count": 20, "students": 2000, "fee_per_year": "45000 INR", "experience_years": 3}
        },
        {
            "name": "Spoken English Institute",
            "description": "Personality development and spoken English for job seekers",
            "category": "coaching",
            "inputs": {"location": "Delhi NCR", "faculty_count": 5, "students": 200, "fee_per_year": "15000 INR", "experience_years": 2}
        }
    ],
    "restaurant": [
        {
            "name": "Cloud Kitchen Startup",
            "description": "Multi-brand cloud kitchen with Zomato/Swiggy delivery",
            "category": "restaurant",
            "inputs": {"location": "Hyderabad", "cuisine": "North Indian + Chinese", "investment": "800K INR", "team_size": 8, "experience_years": 4}
        }
    ],
    "retail": [
        {
            "name": "D2C Organic Skincare Brand",
            "description": "Ayurvedic skincare targeting urban millennials via Instagram commerce",
            "category": "retail",
            "inputs": {"location": "Jaipur", "product_range": 25, "investment": "1.5M INR", "monthly_orders": 500, "team_size": 6}
        }
    ]
}


@app.route('/')
def index():
    return render_template('index.html', examples=EXAMPLE_ANALYSES)


@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    venture_type = data.get('venture_type', 'startup')
    venture_data = data.get('venture_data', {})
    custom_description = data.get('description', '')

    prompt = build_prompt(venture_type, venture_data, custom_description)

    try:
        import urllib.request
        payload = json.dumps({
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 1500,
            "system": SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": prompt}]
        }).encode('utf-8')

        req = urllib.request.Request(
            ANTHROPIC_API_URL,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01"
            },
            method='POST'
        )

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            ai_text = result['content'][0]['text']

            json_match = re.search(r'\{.*\}', ai_text, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group())
                return jsonify({"success": True, "analysis": analysis, "venture_type": venture_type})
            else:
                return jsonify({"success": False, "error": "Could not parse AI response"}), 500

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/example/<category>/<int:index>', methods=['GET'])
def get_example(category, index):
    examples = EXAMPLE_ANALYSES.get(category, [])
    if 0 <= index < len(examples):
        return jsonify({"success": True, "example": examples[index]})
    return jsonify({"success": False, "error": "Example not found"}), 404


def build_prompt(venture_type, data, description):
    base = f"Analyze this {venture_type} and predict its success probability:\n\n"
    base += f"Description: {description}\n\n"
    base += "Key Data:\n"
    for k, v in data.items():
        base += f"- {k.replace('_', ' ').title()}: {v}\n"
    base += "\nProvide a comprehensive analysis in the exact JSON format specified. Be realistic and specific."
    return base


if __name__ == '__main__':
    app.run(debug=True, port=5000)
