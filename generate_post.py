import os
import time
import requests
import feedparser
import google.generativeai as genai
from datetime import datetime
import random
import json
import re
import concurrent.futures
import uuid
import logging
from bs4 import BeautifulSoup

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

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    logger.warning("GEMINI_API_KEY not found in environment. Content generation will be limited.")

def sanitize_text(text):
    """Sanitize text by removing HTML tags and excessive whitespace."""
    if not text:
        return ""
    try:
        soup = BeautifulSoup(text, "html.parser")
        text = soup.get_text(separator=" ")
        return " ".join(text.split())
    except Exception as e:
        logger.error(f"Error sanitizing text: {e}")
        return text

def fetch_feed(feed_url):
    """Fetch and parse a single RSS feed."""
    try:
        feed = feedparser.parse(feed_url)
        feed_articles = []
        for entry in feed.entries[:5]:
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

            feed_articles.append({
                "title": sanitize_text(entry.title),
                "link": entry.link,
                "summary": sanitize_text(summary),
                "source": feed_url.split('/')[2].replace('www.', ''),
                "image_url": image_url
            })
        return feed_articles
    except Exception as e:
        logger.error(f"Error fetching {feed_url}: {e}")
        return []

def fetch_latest_news():
    """Fetch news from all feeds concurrently."""
    articles = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_url = {executor.submit(fetch_feed, url): url for url in RSS_FEEDS}
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                data = future.result()
                articles.extend(data)
            except Exception as e:
                logger.error(f"Feed processing error for {url}: {e}")
    return articles

def generate_content(article=None):
    if not os.getenv("GEMINI_API_KEY"):
        logger.error("Skipping content generation: No API Key")
        return None, None
    
    models_to_try = [
        'models/gemini-2.0-flash-lite',
        'models/gemini-2.0-flash',
        'models/gemini-1.5-flash'
    ]
    
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
        # AI Insight Mode - Dynamic Topic Selection
        prompt = """
        Act as a visionary tech journalist.
        Select a specific, cutting-edge, niche topic related to AI, Quantum Computing, Space, Biotechnology, or Cybernetics. 
        Choose a topic that is highly specific (e.g., instead of "AI in 2026", use "Liquid Neural Networks replacing Transformers").
        
        Generate a breaking news style technical blog post about it.
        
        STRICT GUIDELINES:
        1. Write a 700-word visionary analysis.
        2. START with a valid Markdown Title like: # [Your Unique Title Here]
        3. Use Markdown structure: ## The Breakthrough, ## How It Works, ## Industry Impact, ## Future Outlook.
        4. End with: "--- SOURCE: AI Intelligence Synthesis"
        5. Tone: Professional, Excited, Technical.
        6. DO NOT repeat common topics. Be creative and unique.
        """

    for model_name in models_to_try:
        try:
            logger.info(f"Trying model: {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return response.text, (article['source'] if article else "AI Synthesis")

        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                logger.warning(f"Rate limited on {model_name}. Waiting 45s...")
                time.sleep(45)
            else:
                logger.warning(f"Model {model_name} failed: {e}")
            continue
            
    return None, None

def save_post(title, content, original_link, source, image_url=None):
    data_dir = "src/data"
    os.makedirs(data_dir, exist_ok=True)
    posts_file = os.path.join(data_dir, "posts.json")
    posts = []
    
    if os.path.exists(posts_file):
        try:
            with open(posts_file, "r") as f:
                posts = json.load(f)
        except json.JSONDecodeError:
            logger.warning("posts.json is corrupted or empty. Starting fresh.")
            posts = []

    # Clean title and extract from content if needed
    generated_title = title
    lines = content.strip().split('\n')
    for i, line in enumerate(lines[:5]):
        if line.startswith("# "):
            generated_title = line.replace("# ", "").strip()
            content = "\n".join(lines[i+1:]).strip()
            break

    slug = re.sub(r'[^a-z0-9]+', '-', generated_title.lower()).strip('-')
    
    # Check for duplicate slug
    if any(p.get('slug') == slug for p in posts):
        logger.info(f"Skipping duplicate post: {slug}")
        return False

    category = random.choice(CATEGORIES)
    if not image_url:
        seed = random.randint(1, 1000)
        image_url = f"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200&h=630&sig={seed}"

    new_post = {
        "id": str(uuid.uuid4()),
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
    
    # Keep only latest 100 posts
    if len(posts) > 100:
        posts = posts[:100]

    with open(posts_file, "w") as f:
        json.dump(posts, f, indent=2)
    
    logger.info(f"Saved new post: {generated_title}")
    return True

def main():
    logger.info("Starting AI Blog Generator...")
    articles = fetch_latest_news()
    logger.info(f"Fetched {len(articles)} articles from RSS feeds.")
    
    random.shuffle(articles)
    
    posts_file = "src/data/posts.json"
    existing_slugs = []
    if os.path.exists(posts_file):
        try:
            with open(posts_file, "r") as f:
                existing_slugs = [p.get('slug') for p in json.load(f)]
        except:
            pass

    # 1. Try to find a NEW news article
    for article in articles:
        slug = re.sub(r'[^a-z0-9]+', '-', article['title'].lower()).strip('-')
        if slug not in existing_slugs:
            logger.info(f"Processing: {article['title']}")
            content, source = generate_content(article)
            if content:
                if save_post(article['title'], content, article['link'], source, article.get('image_url')):
                    logger.info("✅ New post saved from news!")
                    return

    # 2. Fallback: generate AI Insight
    logger.info("No new news. Generating AI Insight...")
    for attempt in range(3):
        content, source = generate_content()
        if content:
            title = "AI Insight"
            match = re.search(r'^# (.*)', content)
            if match:
                title = match.group(1)
            if save_post(title, content, "https://github.com/Xavi-003/blog", source):
                logger.info("✅ AI Insight post saved!")
                return
            logger.warning(f"Duplicate, retry {attempt+1}/3...")

    logger.info("No new post generated this run.")

if __name__ == "__main__":
    main()

