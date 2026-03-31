# NexLearn - Interactive Exam Platform

This project is a frontend implementation of the NexLearn Exam Platform, built for the Noviindus Technologies Level 1 Machine Test. It features a pixel-perfect, mobile-responsive UI with a robust, secure, and production-ready architectural foundation.

## 🚀 Tech Stack
* **Framework:** Next.js (App Router)
* **Language:** TypeScript (Strictly typed interfaces)
* **Styling:** Tailwind CSS (Custom gradients, responsive design)
* **State Management:** Redux Toolkit & React `useState`
* **Network:** Axios (with custom interceptors)

## ✨ Key Architectural Features

### 1. Enterprise-Grade Authentication Flow
* Implemented a "Soft Check" vs "Hard Check" architecture for route guarding.
* **Axios Interceptor:** Built a custom response interceptor that seamlessly catches `401 Unauthorized` errors, automatically requests a new access token using the `refresh_token`, and retries the failed request without disrupting the user experience.

### 2. Exam State Persistence (UX)
* Built a custom hydration hook using `sessionStorage`. 
* If a user accidentally refreshes the browser mid-exam, their timer, current question index, and selected answers are perfectly restored.

### 3. Defensive Data Handling
* Fully typed API responses and payload schemas to eliminate `any` types.
* Used safe fallbacks (`??` and `?.`) to ensure the UI never crashes, even if the backend returns missing or malformed data.
* Dynamically calculates missing exam statistics (e.g., total questions) mathematically to prevent UI bugs.

### 4. SEO & Performance Optimization
* Implemented Semantic HTML (`<header>`, `<main>`, `<article>`) for better accessibility.
* Replaced default metadata and favicons with NexLearn branding.
* Minimized unnecessary API calls by validating tokens locally before execution.

## 📦 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Abhinand-SD/nexlearn-frontend.git](https://github.com/Abhinand-SD/nexlearn-frontend.git)

2. **Navigate into the directory:**
   ```bash
   cd nexlearn-frontend
   ```
3. **Install dependencies:**
   ```bash
   npm install

4. Set up environment variables:
   Create a file named .env.local in the root directory of the project and add the following API base URL:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=[https://nexlearn.noviindusdemosites.in](https://nexlearn.noviindusdemosites.in)
   ```
5. **Run the development server:**
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000 in your browser to view the application.
  
***
Make sure you commit this final README to your main branch, check that your repository is public, and send that email! You have built a truly impressive application.