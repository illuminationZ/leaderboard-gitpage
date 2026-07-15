// Leaderboard GitPage - Main Application Script
// This demonstrates JavaScript usage on GitHub Pages

document.addEventListener('DOMContentLoaded', function() {
  console.log('App initialized');

  // Example: Fetch data from an API (GitHub's public API works without CORS issues)
  async function fetchLeaderboardData() {
    try {
      const response = await fetch('https://api.github.com/repos/leaderboard-gitpage');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log('Repo info:', data);
      return data;
    } catch (error) {
      console.error('Error fetching data:', error.message);
      return null;
    }
  }

  // Example: Render leaderboard entries dynamically
  function renderLeaderboard(entries) {
    const container = document.getElementById('entries');
    if (!container || !entries.length) return;

    let html = '';
    entries.forEach((entry, index) => {
      html += `<div class="entry">
        <span class="rank">#${index + 1}</span>
        <span class="name">${entry.name}</span>
        <span class="score">${entry.score || entry.points || 'N/A'}</span>
      </div>`;
    });

    container.innerHTML = html;
  }

  // Example: Use async/await with fetch for API calls
  function searchUsers(query) {
    const url = `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=5`;
    return fetch(url).then(response => response.json()).then(data => data.items || []);
  }

  // Example: Use modern JavaScript features
  const leaderboard = [
    { name: 'Alice', score: 100 },
    { name: 'Bob', score: 85 },
    { name: 'Charlie', score: 72 },
  ];

  console.log('Leaderboard data:', leaderboard);
  // renderLeaderboard(leaderboard); // Uncomment to test rendering
});
