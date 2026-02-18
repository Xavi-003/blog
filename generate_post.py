import os
import requests
import feedparser
import google.generativeai as genai
from datetime import datetime
import random
import json

# Configuration
RSS_FEEDS = [
    "https://techcrunch.com/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://www.wired.com/feed/rss"
]

CATEGORY_COLORS = ["#a855f7", "#22d3ee", "#10b981", "#f59e0b", "#ef4444", "#6366f1"]
STYLES = ["Deep Dive", "News Flash", "Tech Opinion", "Briefing"]
FORMATS = ["Long Form", "Quick Summary", "Bullet Points"]

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def fetch_latest_news():
    articles = []
    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:5]:
                image_url = None
                if 'media_content' in entry: image_url = entry.media_content[0]['url']
                elif 'media_thumbnail' in entry: image_url = entry.media_thumbnail[0]['url']
                elif 'links' in entry:
                    for link in entry.links:
                        if link.type.startswith('image/'):
                            image_url = link.href
                            break
                articles.append({
                    "title": entry.title,
                    "link": entry.link,
                    "summary": getattr(entry, "summary", ""),
                    "published": getattr(entry, "published", str(datetime.now())),
                    "image_url": image_url
                })
        except Exception as e:
            print(f"Error fetching {feed_url}: {e}")
    return random.choice(articles) if articles else None

def generate_blog_content(article):
    if not os.getenv("GEMINI_API_KEY"):
        return f"# {article['title']}\n\nAutomated analysis of the latest tech trends. This post explores the impact of this breakthrough.\n\nSource: {article['link']}"
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"Write a catchy 300-word blog post based on: {article['title']}. Link: {article['link']}. Return ONLY raw Markdown."
    try:
        response = model.generate_content(prompt)
        return response.text
    except: return None

def save_post(title, content, original_link, image_url=None):
    data_dir = "src/data"
    os.makedirs(data_dir, exist_ok=True)
    posts_file = os.path.join(data_dir, "posts.json")
    posts = []
    if os.path.exists(posts_file):
        with open(posts_file, "r") as f:
            try: posts = json.load(f)
            except: posts = []

    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = content.strip().split('\n')
    generated_title = title
    body_content = content
    for i, line in enumerate(lines[:5]):
        if line.startswith("# "):
            generated_title = line.replace("# ", "").strip()
            body_content = "\n".join(lines[i+1:]).strip()
            break

    new_post = {
        "id": str(len(posts) + 1),
        "title": generated_title,
        "slug": generated_title.lower().replace(' ', '-').replace(':', '').replace('?', '').strip('-'),
        "content": body_content,
        "date": date_str,
        "original_link": original_link,
        "image": image_url,
        "category": random.choice(["AI", "Future", "Mobile", "Hardware", "Security"]),
        "style": random.choice(STYLES),
        "format": random.choice(FORMATS),
        "color": random.choice(CATEGORY_COLORS)
    }
    
    posts.insert(0, new_post)
    with open(posts_file, "w") as f:
        json.dump(posts, f, indent=2)

def main():
    article = fetch_latest_news()
    if article:
        content = generate_blog_content(article)
        if content:
            save_post(article['title'], content, article['link'], article.get('image_url'))

if __name__ == "__main__":
    main()
