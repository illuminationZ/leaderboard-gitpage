// Leaderboard GitPage - Main Application Script
document.addEventListener('DOMContentLoaded', async function() {
  // --- Tier definitions (highest → lowest) ---
  const TIERS = [
    { label: 'Challenger', minSP: 700 },
    { label: 'Grand Master', minSP: 500 },
    { label: 'Master',       minSP: 200 },
    { label: 'Diamond',      minSP: 100 },
    { label: 'Platinum',     minSP:   50 },
    { label: 'Gold',         minSP:   25 },
    { label: 'Silver',       minSP:   10 },
    { label: 'Bronze',       minSP:    0 }
  ];

  // --- Fetch & compute leaderboard from data.json ---
  async function fetchLeaderboardData() {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  // --- Calculate SP from wins/losses (fixed formula) ---
  // Win: +5 SP, Loss: -2.5 SP
  function calculateSP(wins, losses) {
    let sp = wins * 5 - losses * 2.5;
    if (sp < 0) sp = 0;
    return sp;
  }

  function getTier(sp) {
    for (const tier of TIERS) {
      if (sp >= tier.minSP) return tier.label;
    }
    return 'Bronze';
  }

  function calculateWinRate(wins, losses) {
    const total = wins + losses;
    if (total === 0) return '0.0%';
    return ((wins / total) * 100).toFixed(1) + '%';
  }

  // --- Render leaderboard entries as table rows ---
  function renderLeaderboard(entries) {
    const container = document.getElementById('entries');
    if (!container || !entries.length) return;

    // Sort by win rate descending, then assign rank
    const sorted = [...entries].sort(
      (a, b) => calculateWinRate(b.wins, b.losses) - calculateWinRate(a.wins, a.losses) || (b.wins + b.losses) - (a.wins + a.losses)
    );

    let html = '<thead><tr>';
    html += `<th>Rank</th><th>Name</th><th>Tier</th>`;
    html += `<th>SP</th><th>Win Rate</th><th>Wins</th><th>Losses</th>`;
    html += '</tr></thead><tbody>';

    sorted.forEach((entry, index) => {
      const sp     = calculateSP(entry.wins, entry.losses);
      const tier   = getTier(sp);
      const wr     = calculateWinRate(entry.wins, entry.losses);
      const rank   = index + 1;
      const tierClass = `tier-${tier.toLowerCase().replace(/\s+/g, '-')}`;

      html += `<tr>
        <td class="rank" data-label="Rank">#${rank}</td>
        <td class="name" data-label="Name">${escapeHtml(entry.name)}</td>
        <td class="tier-cell" data-label="Tier"><span class="tier ${tierClass}">${tier}</span></td>
        <td class="score" data-label="SP">${sp} SP</td>
        <td class="winrate" data-label="Win Rate">${wr}</td>
        <td class="wins" data-label="Wins">${entry.wins}</td>
        <td class="losses" data-label="Losses">${entry.losses}</td>
      </tr>`;
    });

    html += '</tbody>';
    container.innerHTML = html;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- Bootstrap ---
  try {
    const data = await fetchLeaderboardData();
    renderLeaderboard(data);
  } catch (error) {
    console.error('Error loading leaderboard:', error.message);
    document.getElementById('entries').innerHTML =
      '<div class="entry"><span class="rank">—</span><span class="name">Failed to load data</span></div>';
  }
});
