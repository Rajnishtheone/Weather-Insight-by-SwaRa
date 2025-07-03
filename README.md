# SwaRaWeather

SwaRaWeather is a modern, full-featured weather app built with Next.js and Tailwind CSS, featuring **SwaRa❤️**—your personal AI chatbot assistant. Instantly get accurate weather forecasts, world clocks, and time management tools, all in a beautiful, mobile-friendly interface. SwaRa❤️ answers your questions, provides weather insights, and remembers your chat history for a seamless experience. Secure API integration ensures your keys are never exposed. With dark mode, PWA support, and voice interaction, SwaRaWeather is the ultimate smart weather companion.

---

## 🚀 Features
- **Accurate Weather Forecasts** (current & 7-day)
- **World Clock, Stopwatch, Timer, Alarm, Calendar**
- **SwaRa❤️ AI Chatbot** (weather-aware, persistent chat, voice-ready)
- **Mobile-first, Responsive UI**
- **Dark/Light Mode**
- **PWA Support** (installable, offline-ready)
- **Secure API Integration** (no keys in frontend)

---

## 🛠️ Getting Started

### 1. Clone the Repository
```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your-openai-api-key-here
RAPIDAPI_KEY=your-rapidapi-key-here
```
> **Note:** Never commit `.env.local` to GitHub. It is already in `.gitignore`.

### 4. Run Locally
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view your app.

---

## 📦 Deploy to GitHub

1. **Initialize Git (if not already):**
   ```sh
   git init
   ```
2. **Add all files and commit:**
   ```sh
   git add .
   git commit -m "Initial commit: SwaRaWeather app with SwaRa❤️ chatbot"
   ```
3. **Create a new GitHub repo:**
   - Go to [github.com/new](https://github.com/new) and create a repo (no README).
4. **Add remote and push:**
   ```sh
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## ☁️ Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/) and log in.
2. Click **New Project** and import your GitHub repo.
3. During setup, add your environment variables (`OPENAI_API_KEY`, `RAPIDAPI_KEY`) in the Vercel dashboard.
4. Click **Deploy**. Your app will be live at a Vercel URL!

---

## 🙌 Credits
Made with ❤️ by Rajnish. Powered by Next.js, Tailwind CSS, and OpenAI. 