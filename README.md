# Leaderboard GitPage

A GitHub Pages project that demonstrates JavaScript usage in static HTML sites.

## Features

- ✅ Full JavaScript support (ES6+)
- ✅ Async/await for API calls
- ✅ Fetch API integration
- ✅ Responsive design with CSS
- ✅ Jekyll-based static site generation

## Getting Started

### Prerequisites

- A GitHub account
- Git installed on your machine

### Setup

1. **Fork this repository** to your GitHub account

2. **Clone it locally:**
   ```bash
   git clone https://github.com/your-username/leaderboard-gitpage.git
   cd leaderboard-gitpage
   ```

3. **Customize the site:**
   - Edit `_config.yml` to set your site title and base URL
   - Modify `index.html` for your content
   - Update `js/app.js` with your JavaScript logic
   - Style further in `css/style.css`

4. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

5. **Enable GitHub Pages:**
   Go to your repository on GitHub → Settings → Pages → Select source as `main` branch → Click Save

Your site will be live at: `https://your-username.github.io/leaderboard-gitpage/`

## JavaScript Features Demonstrated

This project showcases several JavaScript capabilities available on GitHub Pages:

1. **DOM manipulation** - Manipulate HTML elements dynamically
2. **Async/await with fetch()** - Make API calls to external services
3. **Event listeners** - Respond to user interactions
4. **Modern ES6+ syntax** - Arrow functions, template literals, destructuring

## Using the GitHub API

You can use `fetch()` to call public APIs directly from your JavaScript:

```javascript
// Fetch repository information
const response = await fetch('https://api.github.com/repos/your-username/leaderboard-gitpage');
const data = await response.json();
console.log(data);
```

## Project Structure

```
leaderboard-gitpage/
├── _config.yml          # Jekyll configuration
├── index.html           # Main page (entry point)
├── css/
│   └── style.css        # Stylesheet
├── js/
│   └── app.js           # Main JavaScript file
└── README.md            # This file
```

## Notes

- GitHub Pages is a **static site host** — all JavaScript runs in the browser
- No server-side execution (no Node.js, no backend)
- External API calls work via `fetch()` but may be subject to CORS restrictions
- For private APIs or custom backends, use a proxy service like [cors-anywhere](https://github.com/Rob--W/cors-anywhere)
