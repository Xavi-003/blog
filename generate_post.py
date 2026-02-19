import os
import requests
import feedparser
import google.generativeai as genai
from datetime import datetime
import random
import json
import re

# Configuration
RSS_FEEDS = [
    "https://techcrunch.com/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://www.wired.com/feed/rss",
    "https://9to5mac.com/feed/",
    "https://gizmodo.com/feed",
    "https://engadget.com/rss.xml",
    "https://arstechnica.com/feed/",
    "https://www.theatlantic.com/feed/channel/technology/",
    "https://www.zdnet.com/news/rss.xml"
]

CATEGORY_COLORS = ["#a855f7", "#22d3ee", "#10b981", "#f59e0b", "#ef4444", "#6366f1"]
CATEGORIES = ["AI", "Future", "Mobile", "Hardware", "Security", "Computing", "Space", "Robotics"]
STYLES = ["Deep Dive", "News Flash", "Tech Opinion", "Briefing"]
FORMATS = ["Long Form", "Quick Summary", "Bullet Points"]

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("WARNING: GEMINI_API_KEY not found in environment.")

def fetch_latest_news():
    articles = []
    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:10]:
                image_url = None
                if 'media_content' in entry and entry.media_content:
                    image_url = entry.media_content[0].get('url')
                if not image_url and 'media_thumbnail' in entry and entry.media_thumbnail:
                    image_url = entry.media_thumbnail[0].get('url')
                if not image_url and 'links' in entry:
                    for link in entry.links:
                        if link.get('type', '').startswith('image/'):
                            image_url = link.get('href')
                            break
                
                summary = getattr(entry, "summary", "")
                if not summary and "content" in entry:
                    summary = entry.content[0].value

                articles.append({
                    "title": entry.title,
                    "link": entry.link,
                    "summary": summary,
                    "source": feed_url.split('/')[2].replace('www.', ''),
                    "image_url": image_url
                })
        except Exception as e:
            print(f"Error fetching {feed_url}: {e}")
    return articles

def generate_content(article=None):
    if not os.getenv("GEMINI_API_KEY"):
        return None, None
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    if article:
        prompt = f"""
        Write a comprehensive technical blog post about: {article['title']}.
        Context: {article['summary']}
        Link: {article['link']}

        STRICT GUIDELINES:
        1. Focus on technical specifications and industry impact.
        2. Write 600-800 words.
        3. Use Markdown: # Title, ## Executive Summary, ## Technical Deep Dive, ## Impact, ## Why it Matters.
        4. End with: "--- SOURCE: Adapted from {article['source']}"
        5. Use bold text and bullet points.
        """
    else:
        # AI Insight Mode - No news found, generate original content
        topic = random.choice([
            "The Quantum Computing Breakthrough of 2026",
            "Next-Gen Solid State Battery Technology",
            "The Rise of Local LLMs on Mobile Hardware",
            "Neuralink and the Future of Brain-Computer Interfaces",
            "Sustainable Semi-Conductor Manufacturing",
            "The Evolution of Generative Video Models"
        ])
        prompt = f"""
        Generate a deep-dive technical "AI Insight" post about {topic}.
        
        STRICT GUIDELINES:
        1. Write a 700-word visionary analysis.
        2. Use Markdown: # Title, ## Overview, ## The Core Technology, ## Future Outlook, ## Strategic Importance.
        3. End with: "--- SOURCE: AI Intelligence Synthesis"
        """

    try:
        response = model.generate_content(prompt)
        return response.text, (article['source'] if article else "AI Synthesis")
    except Exception as e:
        print(f"Gemini error: {e}")
        return None, None

def save_post(title, content, original_link, source, image_url=None):
    data_dir = "src/data"
    os.makedirs(data_dir, exist_ok=True)
    posts_file = os.path.join(data_dir, "posts.json")
    posts = []
    if os.path.exists(posts_file):
        with open(posts_file, "r") as f:
            try: posts = json.load(f)
            except: posts = []

    # Clean title and generate slug
    generated_title = title
    lines = content.strip().split('\n')
    for i, line in enumerate(lines[:5]):
        if line.startswith("# "):
            generated_title = line.replace("# ", "").strip()
            content = "\n".join(lines[i+1:]).strip()
            break

    slug = re.sub(r'[^a-z0-9]+', '-', generated_title.lower()).strip('-')
    
    # Final check for duplicate slug
    if any(p.get('slug') == slug for p in posts):
        return False

    category = random.choice(CATEGORIES)
    if not image_url:
        # High quality tech image fallback with unique seeds
        seed = random.randint(1, 1000)
        image_url = f"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200&h=630&sig={seed}"

    new_post = {
        "id": str(len(posts) + 1),
        "title": generated_title,
        "slug": slug,
        "content": content,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "original_link": original_link,
        "image": image_url,
        "category": category,
        "style": random.choice(STYLES),
        "format": random.choice(FORMATS),
        "color": random.choice(CATEGORY_COLORS),
        "source": source,
        "reading_time": f"{random.randint(5, 10)} min"
    }
    
    posts.insert(0, new_post)
    with open(posts_file, "w") as f:
        json.dump(posts, f, indent=2)
    return True

def main():
    articles = fetch_latest_news()
    random.shuffle(articles)
    
    posts_file = "src/data/posts.json"
    existing_slugs = []
    if os.path.exists(posts_file):
        with open(posts_file, "r") as f:
            try: existing_slugs = [p.get('slug') for p in json.load(f)]
            except: pass

    # 1. Try to find a NEW news article
    for article in articles:
        slug = re.sub(r'[^a-z0-9]+', '-', article['title'].lower()).strip('-')
        if slug not in existing_slugs:
            print(f"Found new news: {article['title']}")
            content, source = generate_content(article)
            if content:
                if save_post(article['title'], content, article['link'], source, article.get('image_url')):
                    print("Successfully saved news post.")
                    return

    # 2. If no new news, trigger "AI Insight Mode" to guarantee a post
    print("No new news found. Generating original AI Insight...")
    content, source = generate_content()
    if content:
        # Title is the first # header
        title = "The Future of Computing"
        match = re.search(r'^# (.*)', content)
        if match: title = match.group(1)
        
        if save_post(title, content, "https://github.com/Xavi-003/blog", source):
            print("Successfully saved AI Insight post.")

if __name__ == "__main__":
    main()
