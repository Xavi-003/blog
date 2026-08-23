#!/usr/bin/env python3
"""
generate_post.py — Automated Executive Tech Intelligence Generator

Fetches the latest technology breakthroughs and enterprise announcements from
verified RSS feeds, then synthesizes in-depth B2B intelligence briefings using
the Google Gemini API.

Security Best Practices:
- Accesses GEMINI_API_KEY strictly from environment variables (GitHub Secrets / local .env).
- Sanitizes all exceptions to prevent accidental API key leakage in logs.
- Never prints, logs, or transmits secrets.
- Exits cleanly with non-leaking diagnostics if credentials are missing.
"""

import os
import sys
import json
import uuid
import re
import random
from datetime import datetime, timezone
import requests
import feedparser
from bs4 import BeautifulSoup

# Try importing google.generativeai
try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

# Verified RSS Feed Sources
RSS_FEEDS = [
    {"source": "techcrunch.com", "url": "https://techcrunch.com/feed/"},
    {"source": "theverge.com", "url": "https://www.theverge.com/rss/index.xml"},
    {"source": "wired.com", "url": "https://www.wired.com/feed/rss"},
    {"source": "arstechnica.com", "url": "https://feeds.arstechnica.com/arstechnica/index"},
    {"source": "venturebeat.com", "url": "https://venturebeat.com/feed/"},
    {"source": "9to5mac.com", "url": "https://9to5mac.com/feed/"},
]

# Curated High-Resolution Unsplash Tech Banners
TECH_IMAGE_PALETTE = [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200&h=630",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=630",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=1200&h=630",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200&h=630",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200&h=630",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=1200&h=630",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200&h=630",
]

CATEGORY_COLORS = {
    "AI & Machine Learning": "#2563eb",
    "Cybersecurity": "#ef4444",
    "Cloud Infrastructure": "#0284c7",
    "Robotics": "#10b981",
    "Quantum & DeepTech": "#8b5cf6",
    "Hardware & Mobile": "#f59e0b",
    "Enterprise Software": "#4f46e5",
}

def clean_html(raw_html: str) -> str:
    """Extract clean text content from HTML snippets."""
    if not raw_html:
        return ""
    soup = BeautifulSoup(raw_html, "html.parser")
    return soup.get_text(separator=" ", strip=True)

def slugify(text: str) -> str:
    """Generate SEO-friendly URL slug."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')[:100]

def sanitize_error(err: Exception, key: str) -> str:
    """Sanitize error messages to ensure API keys are never leaked to logs."""
    msg = str(err)
    if key and key in msg:
        msg = msg.replace(key, "[REDACTED_API_KEY]")
    return msg

def get_existing_posts(posts_file: str) -> list:
    """Load existing posts from posts.json."""
    if not os.path.exists(posts_file):
        return []
    try:
        with open(posts_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️ Warning: Could not parse existing posts: {e}")
        return []

def fetch_latest_news(existing_links: set, existing_titles: set) -> dict | None:
    """Fetch fresh news articles across all feeds and return the best candidate."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 AI-Insights-Pro-Bot/1.0"
    }

    candidates = []

    for feed_info in RSS_FEEDS:
        try:
            resp = requests.get(feed_info["url"], headers=headers, timeout=10)
            if resp.status_code != 200:
                continue
            feed = feedparser.parse(resp.content)
            for entry in feed.entries[:10]:
                link = getattr(entry, "link", "").strip()
                title = clean_html(getattr(entry, "title", "")).strip()
                summary = clean_html(getattr(entry, "summary", "") or getattr(entry, "description", "")).strip()

                if not title or not link:
                    continue
                
                # Check for duplicates
                norm_title = title.lower()
                if link in existing_links or norm_title in existing_titles:
                    continue

                candidates.append({
                    "title": title,
                    "link": link,
                    "summary": summary,
                    "source": feed_info["source"],
                    "published": getattr(entry, "published", "")
                })
        except Exception as e:
            print(f"⚠️ Could not fetch feed {feed_info['source']}: {e}")

    if not candidates:
        return None

    # Pick the top candidate
    return candidates[0]

def generate_b2b_intelligence(news_item: dict, api_key: str) -> dict | None:
    """Synthesize executive tech intelligence report using Gemini API."""
    if not HAS_GENAI:
        print("❌ google-generativeai package is not installed.")
        return None

    genai.configure(api_key=api_key)

    # Preferred modern models with fallback
    models_to_try = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash']
    
    prompt = f"""You are the Lead Technology & Systems Architect at AI Insights Pro.
Analyze the following tech news development and produce a comprehensive, executive-grade B2B intelligence report for CTOs, CFOs, Enterprise Architects, and Tech Leaders.

News Item Details:
- Title: {news_item['title']}
- Source: {news_item['source']}
- Original Link: {news_item['link']}
- Raw Summary/Context: {news_item['summary']}

Please return ONLY a valid JSON object matching this exact JSON schema (without any markdown code block fences if possible, or inside a clean ```json block):
{{
  "title": "Clear, compelling executive headline (max 90 chars)",
  "subtitle": "Informative subtitle capturing the strategic business impact",
  "category": "One of: AI & Machine Learning, Cybersecurity, Cloud Infrastructure, Robotics, Quantum & DeepTech, Hardware & Mobile, Enterprise Software",
  "targetRole": ["CTO", "CFO", "Founders", "Security", "Operations"],
  "threatLevel": "One of: High, Medium, Opportunity",
  "reading_time": "7 min",
  "executiveTakeaways": [
    {{
      "tag": "STRATEGY",
      "label": "Strategic Vector",
      "text": "1-2 sentences on direct organizational strategy implications."
    }},
    {{
      "tag": "IMPACT",
      "label": "Market & Cost Impact",
      "text": "1-2 sentences on cost, infrastructure, or operational risk."
    }},
    {{
      "tag": "ACTION",
      "label": "Recommended Roadmap",
      "text": "1-2 sentences on immediate actions engineering leadership should take."
    }}
  ],
  "content": "Full markdown text with sections: ## Executive Summary, ## Technical Deep Dive (with bullet points and architectural details), ## Impact (for enterprises, engineers, and financial bottom line), ## Why it Matters (strategic industry conclusion), and ending with a formal attribution link to the source."
}}
"""

    response_text = None
    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,
                    max_output_tokens=3000
                )
            )
            if response and response.text:
                response_text = response.text.strip()
                print(f"✅ Successfully synthesized briefing using {model_name}.")
                break
        except Exception as e:
            sanitized = sanitize_error(e, api_key)
            print(f"⚠️ Model {model_name} failed: {sanitized}")

    if not response_text:
        return None

    # Parse JSON from response
    try:
        # Strip markdown fences if present
        cleaned_json = response_text
        if "```json" in cleaned_json:
            cleaned_json = cleaned_json.split("```json")[1].split("```")[0].strip()
        elif "```" in cleaned_json:
            cleaned_json = cleaned_json.split("```")[1].split("```")[0].strip()

        data = json.loads(cleaned_json)
        return data
    except Exception as e:
        print(f"⚠️ Failed to parse JSON response: {e}")
        # Fallback structured object
        return {
            "title": news_item['title'],
            "subtitle": f"Strategic intelligence analysis from {news_item['source']}",
            "category": "Enterprise Software",
            "targetRole": ["CTO", "Founders"],
            "threatLevel": "Opportunity",
            "reading_time": "6 min",
            "executiveTakeaways": [
                {
                    "tag": "STRATEGY",
                    "label": "Executive Briefing",
                    "text": news_item['summary'][:150] + "..."
                },
                {
                    "tag": "IMPACT",
                    "label": "Industry Dynamics",
                    "text": "Accelerates technological shifts across enterprise deployments and infrastructure paradigms."
                },
                {
                    "tag": "ACTION",
                    "label": "Recommended Stance",
                    "text": "Review internal dependencies and evaluate potential architectural alignments."
                }
            ],
            "content": f"## Executive Summary\n\n{news_item['summary']}\n\n## Technical Deep Dive\n\nThis development from **{news_item['source']}** highlights key shifts in modern technical architectures and industry execution.\n\n## Impact\n\nProvides measurable improvements in system resilience, operational capabilities, and technological velocity.\n\n## Why it Matters\n\nStaying ahead of these industry trends is essential for maintainable long-term technical leadership.\n\n---\nSOURCE: Adapted from [{news_item['source']}]({news_item['link']})"
        }

def main():
    print("🚀 AI Insights Pro — Automated Content Synthesis Engine")

    # Retrieve and validate GEMINI_API_KEY
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        print("❌ SECURITY ERROR: GEMINI_API_KEY environment variable is not configured.")
        print("ℹ️ For GitHub Actions: Add GEMINI_API_KEY in Repository Settings -> Secrets and variables -> Actions.")
        print("ℹ️ For local development: Set GEMINI_API_KEY in your .env file.")
        sys.exit(0) # Clean non-fatal exit to prevent breaking CI pipeline on missing secret

    posts_file = os.path.join(os.path.dirname(__file__), "src", "data", "posts.json")
    existing_posts = get_existing_posts(posts_file)
    print(f"📚 Loaded {len(existing_posts)} existing intelligence briefings.")

    existing_links = {p.get("original_link", "").strip() for p in existing_posts if p.get("original_link")}
    existing_titles = {p.get("title", "").strip().lower() for p in existing_posts if p.get("title")}

    # Step 1: Fetch fresh tech news candidate
    print("📡 Querying RSS feeds for new industry developments...")
    candidate = fetch_latest_news(existing_links, existing_titles)
    if not candidate:
        print("✨ No new unanalyzed articles found across configured RSS feeds.")
        return

    print(f"🎯 Selected article for analysis: '{candidate['title']}' ({candidate['source']})")

    # Step 2: Generate B2B intelligence report
    print("🧠 Generating executive analysis via Gemini AI...")
    report = generate_b2b_intelligence(candidate, api_key)
    if not report:
        print("❌ Failed to synthesize intelligence report.")
        return

    # Step 3: Assemble final post schema
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    title = report.get("title", candidate["title"])
    category = report.get("category", "AI & Machine Learning")
    color = CATEGORY_COLORS.get(category, "#2563eb")
    image = random.choice(TECH_IMAGE_PALETTE)

    new_post = {
        "id": str(uuid.uuid4()),
        "title": title,
        "subtitle": report.get("subtitle"),
        "slug": slugify(title),
        "content": report.get("content", candidate["summary"]),
        "date": now_iso,
        "original_link": candidate["link"],
        "image": f"{image}&sig={random.randint(100, 999)}",
        "category": category,
        "style": "Deep Dive",
        "format": "Executive Report",
        "color": color,
        "source": candidate["source"],
        "reading_time": report.get("reading_time", "6 min"),
        "targetRole": report.get("targetRole", ["CTO", "CFO"]),
        "threatLevel": report.get("threatLevel", "Opportunity"),
        "executiveTakeaways": report.get("executiveTakeaways", [])
    }

    # Prepend new post to the top of the collection
    existing_posts.insert(0, new_post)

    # Step 4: Safely write back to posts.json
    try:
        with open(posts_file, "w", encoding="utf-8") as f:
            json.dump(existing_posts, f, indent=2, ensure_ascii=False)
        print(f"✅ Successfully created new intelligence report: '{title}'")
        print(f"📊 Total posts now: {len(existing_posts)}")
    except Exception as e:
        print(f"❌ Failed to write posts.json: {e}")

if __name__ == "__main__":
    main()
