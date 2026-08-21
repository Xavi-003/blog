# AI Insights Pro — Automated Tech & Systems Intelligence

An executive-grade tech intelligence platform that automatically curates top-tier tech news from verified RSS feeds, synthesizes deep B2B insights using Google Gemini AI, and deploys statically optimized builds to GitHub Pages with full AEO (Answer Engine Optimization) pre-rendering.

## 🔒 Production Security & API Key Protection

To ensure the Gemini AI API Key is never exposed in client bundles or public repositories:

1. **GitHub Secrets Storage**:
   - The AI API key is configured strictly inside **GitHub Repository Settings → Secrets and variables → Actions**.
   - Secret Name: `GEMINI_API_KEY`
   - Value: Your Google AI Studio API key.

2. **Runner-Side Execution (Zero Client Exposure)**:
   - Content generation executes entirely runner-side during GitHub Actions cron/dispatch workflows via `generate_post.py`.
   - The key is injected into the runner's environment variables (`GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}`) and is **never** prefixed with `VITE_` or included in compiled frontend bundles.
   - The Python synthesis engine automatically sanitizes error traces to prevent key leakage in GitHub Actions logs.

3. **Local Development**:
   - For local content synthesis, place `GEMINI_API_KEY=your_key` in a `.env` file.
   - `.env`, `.env.local`, and `.env.*.local` are strictly protected in `.gitignore`.

---

## 🚀 CI/CD & GitHub Pages Deployment Pipeline

The workflow (`.github/workflows/deploy.yml`) is configured for reliable automated updates:

- **Automated Scheduling**: Runs on a cron schedule (`0 */5 * * *`) every 5 hours and on manual `workflow_dispatch`.
- **Content Synthesis**: Fetches news from TechCrunch, The Verge, Wired, Ars Technica, VentureBeat, and 9to5Mac. Synthesizes structured B2B intelligence and commits updates to `src/data/posts.json`.
- **Production Build & Pre-rendering**: Builds the Vite React SPA, pre-renders SEO/OpenGraph meta tags for all slugs (`scripts/prerender-meta.mjs`), and generates an updated `sitemap.xml` (`scripts/generate-sitemap.mjs`).
- **GitHub Pages Deployment**: Deploys the static distribution directly to GitHub Pages at `https://xavi-003.github.io/blog/`.

---

## 🛠️ Local Development & Testing

1. **Install Dependencies**:
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Generate a New Post Locally**:
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   python3 generate_post.py
   ```

4. **Verify Production Build**:
   ```bash
   npm run build
   ```
