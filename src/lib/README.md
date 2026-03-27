<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/194f9d0a-e4f7-4e87-b00d-85405a637fe5

## Deploy to Vercel

1. **Push your code to GitHub.**
2. **Connect your GitHub repository to Vercel.**
3. **Set Environment Variables:**
   - Go to **Settings** > **Environment Variables** in your Vercel project.
   - Add `GEMINI_API_KEY` with your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. **Build Settings:**
   - Framework Preset: **Vite** (should be auto-detected).
   - Build Command: `npm run build`.
   - Output Directory: `dist`.
5. **Deploy!**

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
