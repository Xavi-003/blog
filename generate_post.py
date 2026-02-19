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
CATEGORIES = ["AI", "Future", "Mobile", "Hardware", "Security"]
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
            for entry in feed.entries[:10]:
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
    return articles

def generate_blog_content(article):
    if not os.getenv("GEMINI_API_KEY"):
        return f"# {article['title']}\n\nAutomated analysis of the latest tech trends. This post explores the impact of this breakthrough.\n\nSource: {article['link']}"
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"""
    Write a high-quality, engaging blog post about: {article['title']}.
    Source context: {article['summary']}
    Link: {article['link']}

    Guidelines:
    - Use clear, professional, yet exciting language.
    - Use Markdown for structure: headers (##), bullet points, and bold text.
    - Make it easy to understand for tech enthusiasts.
    - Keep it around 300-400 words.
    - Start directly with a H1 header (# Title).
    - Include a final 'Why it Matters' section.

    Return ONLY raw Markdown.
    """
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

    # Duplicate check
    slug = title.lower().replace(' ', '-').replace(':', '').replace('?', '').strip('-')
    if any(p.get('slug') == slug for p in posts):
        print(f"Post already exists: {title}")
        return False

    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = content.strip().split('\n')
    generated_title = title
    body_content = content
    for i, line in enumerate(lines[:5]):
        if line.startswith("# "):
            generated_title = line.replace("# ", "").strip()
            body_content = "\n".join(lines[i+1:]).strip()
            break

    category = random.choice(CATEGORIES)
    
    # Fallback image if none provided
    if not image_url:
        image_url = f"https://source.unsplash.com/featured/1200x630?{category},tech"

    new_post = {
        "id": str(len(posts) + 1),
        "title": generated_title,
        "slug": slug,
        "content": body_content,
        "date": date_str,
        "original_link": original_link,
        "image": image_url,
        "category": category,
        "style": random.choice(STYLES),
        "format": random.choice(FORMATS),
        "color": random.choice(CATEGORY_COLORS),
        "source": original_link.split('/')[2].replace('www.', ''),
        "reading_time": f"{random.randint(2, 5)} min"
    }
    
    posts.insert(0, new_post)
    with open(posts_file, "w") as f:
        json.dump(posts, f, indent=2)
    return True

def main():
    articles = fetch_latest_news()
    if not articles:
        return

    # Try to find an article that hasn't been posted yet
    random.shuffle(articles)
    for article in articles:
        if save_post(article['title'], "", article['link']): # Quick check with empty content
            # If we found a new one, now generate the full content
            # First, remove the empty placeholder we just added for the check
            posts_file = "src/data/posts.json"
            with open(posts_file, "r") as f:
                posts = json.load(f)
            posts.pop(0)
            with open(posts_file, "w") as f:
                json.dump(posts, f, indent=2)

            # Now do the real generation and save
            content = generate_blog_content(article)
            if content:
                if save_post(article['title'], content, article['link'], article.get('image_url')):
                    print(f"Successfully generated and saved: {article['title']}")
                    break

if __name__ == "__main__":
    main()
