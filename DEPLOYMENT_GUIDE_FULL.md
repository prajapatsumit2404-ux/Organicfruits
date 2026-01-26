# Full Deployment Guide for Organic Fruits 🚀

This guide will help you deploy your application to the web.

## 🛑 Critical Warning: Data Storage
On Cloud Hosting, files can be ephemeral. Use **MongoDB Atlas** for permanent data storage.
*   **Solution**: You MUST use **MongoDB Atlas** for permanent data storage.

---

## Phase 1: Push Code to GitHub
1.  Create a new repository on [GitHub.com](https://github.com/new) (e.g., `organic-fruits`).
2.  Open your terminal in VS Code (`Ctrl + ~`) and run these commands:
    ```bash
    git add .
    git commit -m "Ready for deploy"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/organic-fruits.git
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` with your actual GitHub username)*

---

## Phase 2: Set up MongoDB (Database)
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2.  Create a free **Shared Cluster**.
3.  Create a **Database User** (username/password).
4.  In "Network Access", allow access from **Anywhere (0.0.0.0/0)**.
5.  Get your **Connection String** (it looks like `mongodb+srv://user:pass@cluster.mongodb.net/...`).
6.  **Save this string!** You will need it in Phase 3.

---

## Phase 3: Deploy

### Option A: Vercel (Recommended)
*Best for speed and valid for this project structure.*
1.  Go to [Vercel.com](https://vercel.com) and login with GitHub.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `organic-fruits` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Other (default is fine).
    *   **Root Directory**: `./` (default).
5.  **Environment Variables** (Click to expand):
    *   Add `MONGODB_URI` -> Paste your connection string.
    *   Add `JWT_SECRET` -> Type a random secure code (e.g., `my-secret-key-123`).
6.  Click **Deploy**.

### Option B: Railway (Alternative)
*Uses the Dockerfile we fixed.*
1.  Go to [Railway.app](https://railway.app) and login with GitHub.
2.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
3.  Select your `organic-fruits` repo.
4.  Once created, go to **Settings** -> **Variables**.
5.  Add `MONGODB_URI` and `JWT_SECRET`.
6.  Railway will automatically detect the `Dockerfile` and build.

---

## Phase 4: Final Check
1.  Open your new website URL.
2.  Register a new account (this confirms the Database connection).
3.  Add items to the cart and checkout.

### Troubleshooting
*   **"Connection Failed"**: Check your `MONGODB_URI` in the dashboard settings. Ensure you allowed "Anywhere 0.0.0.0/0" in MongoDB Network Access.
*   **Images missing?**: Vercel serves `frontend/` automatically, but ensure your image paths are correct (e.g., `assets/images/apple.jpg`).

**Good luck!** 🍎
