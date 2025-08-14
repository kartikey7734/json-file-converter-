# Workflow Converter AI

![Logo](https://raw.githubusercontent.com/user-attachments/assets/05a1e2f7-0d55-468f-9d32-d11979b07172)

**A powerful, 100% browser-based developer tool that uses the Gemini AI API to seamlessly convert automation workflow files between Make.com and n8n formats.**

This tool is designed for developers and automation experts looking to migrate workflows or maintain parity between the two most popular automation platforms.

---

## ✨ Key Features

- **🤖 AI-Powered Conversion:** Leverages the Google Gemini Flash model to accurately translate complex workflow logic, nodes, parameters, and connections.
- **🔄 Bi-Directional:** Convert from **Make.com to n8n** and from **n8n to Make.com**.
- **🔒 100% Browser-Based:** All processing and API calls happen directly in your browser. No data is stored on any server, ensuring your workflow data remains private and secure.
- **📁 Versatile Input:** Easily upload your `.json` workflow files or paste the raw JSON content directly into the app.
- **🎨 Sleek, Modern UI:** A clean, responsive interface designed for developers, with a beautiful and functional dark mode and an aesthetic light mode.
- **👤 User Authentication:** A simple email-based system to manage users and provide free trial conversions.
- **🚀 Pro Plan:** A simple upgrade path for users who need unlimited conversions, supporting the project's development.
- **⚙️ Instant Settings:** Theme and API Key settings are saved instantly with no friction.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS for a utility-first, responsive design.
- **AI:** Google Gemini API (`@google/genai`) for the core conversion logic.
- **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Build:** No build step! The project uses modern ES Modules (`importmap`) to run directly in the browser.

## 🧠 How It Works

This application is architected to run entirely on the client-side. Here's a quick overview of the process:

1.  **Input:** The user uploads a `.json` file or pastes JSON text. The app parses this content and auto-detects the source platform.
2.  **Prompt Engineering:** Based on the desired conversion direction (e.g., Make -> n8n), a highly specific prompt is constructed around the user's JSON data. This prompt instructs the Gemini model on the exact schema and conventions it needs to follow for an accurate conversion.
3.  **Gemini API Call:** A `fetch` request is sent directly from the user's browser to the Google Gemini API endpoint with the engineered prompt.
4.  **Output:** The AI returns a clean JSON response, which is then parsed and beautifully formatted in the "Converted" panel, ready for the user to copy or download.
5.  **Local Persistence:** User data (email, pro status) and settings (theme, API key) are stored securely in the browser's `localStorage`, allowing for a persistent experience across sessions.

## 🚀 Getting Started (Local Setup)

To run this project locally, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/workflow-converter-ai.git
    cd workflow-converter-ai
    ```

2.  **Open `index.html`:**
    Since this is a vanilla React + TypeScript project with no build step, you can simply open the `index.html` file in your web browser. For the best experience, use a local server extension like **"Live Server" in VS Code** to avoid potential browser security restrictions.

3.  **Add Your API Key:**
    - Open the application in your browser.
    - Click the **Settings** icon in the top-right corner.
    - Paste your Google Gemini API key into the "API Key" field.
    - The key is saved automatically and instantly to your browser's `localStorage` and will be used for all subsequent conversion requests.

## ☁️ Deployment

You can easily deploy this application for free using a static hosting service like Vercel, Netlify, or GitHub Pages.

1.  **Push to GitHub:** Make sure your code is pushed to a GitHub repository.
2.  **Connect to Vercel/Netlify:**
    - Sign up for a Vercel or Netlify account.
    - Create a new project and import your GitHub repository.
3.  **Configure Build Settings:**
    - **Framework Preset:** Since there is no build step, you may need to override the default settings. Select `Other` or leave it blank.
    - **Build Command:** Leave this empty.
    - **Output/Publish Directory:** Leave this empty or set it to the root directory (`.`).
4.  **Deploy!** The service will deploy your `index.html` and associated files, making your app live on the internet.

---

*This project was developed with passion by [Your Name Here].*