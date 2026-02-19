# AI Blog - Automated Tech Insights

An automated blog system that fetches the latest tech news from RSS feeds and generates insightful blog posts using Google's Gemini AI.

## ℹ️ About
This project is a modern, responsive blog application built with React, TypeScript, and Vite. It features:
- **Automated Content Generation:** A Python script fetches news from TechCrunch, The Verge, and Wired.
- **AI-Powered Summaries:** Uses Gemini 1.5 Flash to generate catchy, markdown-formatted blog posts.
- **Dynamic UI:** A fluid, interactive interface with theme customization (Light/Dark) and accent colors.
- **CI/CD Integration:** Automatically updates and deploys to GitHub Pages daily via GitHub Actions.

## 🚀 Releases

### v1.0.0 (2026-02-19)
- Initial release of the automated AI blog.
- Integrated RSS feed fetching and Gemini AI generation.
- Implemented responsive React frontend with Framer Motion animations.
- Set up GitHub Actions for daily automated deployments.

---

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Framer Motion, Lucide React
- **Backend:** Python (Feedparser, Google Generative AI)
- **Deployment:** GitHub Actions, GitHub Pages

## 📦 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Run Locally:**
   ```bash
   npm run dev
   ```

3. **Generate a Post:**
   ```bash
   export GEMINI_API_KEY=your_api_key
   python generate_post.py
   ```
