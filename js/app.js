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

  const PAGE_SIZE = 6;

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

  // Raw 0-1 win rate, used for sorting (calculateWinRate below returns a
  // display string like "62.5%", which isn't safely comparable with `-`).
  function winRateValue(wins, losses) {
    const total = wins + losses;
    return total === 0 ? 0 : wins / total;
  }

  function calculateWinRate(wins, losses) {
    return (winRateValue(wins, losses) * 100).toFixed(1) + '%';
  }

  function initials(name) {
    return name.trim().charAt(0).toUpperCase();
  }

  const tierIcon = '<svg class="tier-icon" aria-hidden="true"><use href="#icon-shield"></use></svg>';
  const spIcon   = '<svg class="sp-icon" aria-hidden="true"><use href="#icon-star"></use></svg>';

  function medalIcon(rank) {
    return `<span class="podium-medal">
      <svg class="medal-icon" viewBox="0 0 64 80" aria-hidden="true"><use href="#icon-medal-${rank}"></use></svg>
      <span class="medal-number">${rank}</span>
    </span>`;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- State for the searchable/paginated part of the table (ranks 4+) ---
  let rankedRest = [];
  let filteredRest = [];
  let currentPage = 1;

  // --- Stat cards, derived entirely from data.json (no fabricated fields) ---
  function renderStatCards(entries) {
    const container = document.getElementById('stat-cards');
    if (!container) return;

    const players = entries.length;
    const gamesPlayed = entries.reduce((sum, e) => sum + e.wins + e.losses, 0);
    const avgWinRate = players
      ? entries.reduce((sum, e) => sum + winRateValue(e.wins, e.losses), 0) / players * 100
      : 0;

    container.innerHTML = `
      <div class="stat-card stat-card--players">
        <span class="stat-icon"><svg aria-hidden="true"><use href="#icon-users"></use></svg></span>
        <div>
          <div class="stat-value">${players}</div>
          <div class="stat-label">Players</div>
        </div>
      </div>
      <div class="stat-card stat-card--matches">
        <span class="stat-icon"><svg aria-hidden="true"><use href="#icon-swords"></use></svg></span>
        <div>
          <div class="stat-value">${gamesPlayed}</div>
          <div class="stat-label">Games Played</div>
        </div>
      </div>
      <div class="stat-card stat-card--winrate">
        <span class="stat-icon"><svg aria-hidden="true"><use href="#icon-target"></use></svg></span>
        <div>
          <div class="stat-value">${avgWinRate.toFixed(0)}%</div>
          <div class="stat-label">Avg Win Rate</div>
        </div>
      </div>
    `;
  }

  function populateTierFilter() {
    const select = document.getElementById('tier-filter');
    if (!select) return;
    select.innerHTML = '<option value="">All Tiers</option>' +
      TIERS.map(t => `<option value="${t.label}">${t.label}</option>`).join('');
  }

  // --- Render top-3 as podium cards ---
  function renderPodium(top3) {
    const container = document.getElementById('podium');
    if (!container || !top3.length) return;

    // Display order: 2nd, 1st, 3rd (1st raised in the middle)
    const order = [top3[1], top3[0], top3[2]].filter(Boolean);

    container.innerHTML = order.map(entry => {
      const tierClass = `tier-${entry.tier.toLowerCase().replace(/\s+/g, '-')}`;
      return `<div class="podium-card podium-rank-${entry.rank}">
        <span class="electric-bg-glow" aria-hidden="true"></span>
        <span class="electric-border" aria-hidden="true"></span>
        <span class="electric-glow-1" aria-hidden="true"></span>
        <span class="electric-glow-2" aria-hidden="true"></span>
        <div class="podium-card-inner">
          ${medalIcon(entry.rank)}
          <span class="podium-avatar">${escapeHtml(initials(entry.name))}</span>
          <span class="podium-name">${escapeHtml(entry.name)}</span>
          <span class="tier ${tierClass}">${tierIcon}${entry.tier}</span>
          <span class="podium-sp">${spIcon}${entry.sp} SP</span>
          <span class="podium-wr">Win Rate ${entry.wrDisplay}</span>
        </div>
      </div>`;
    }).join('');
  }

  function buildRow(entry) {
    const tierClass = `tier-${entry.tier.toLowerCase().replace(/\s+/g, '-')}`;
    return `<tr data-rank="${entry.rank}" tabindex="0">
      <td class="rank" data-label="Rank">#${entry.rank}</td>
      <td class="name" data-label="Name"><span class="avatar">${escapeHtml(initials(entry.name))}</span>${escapeHtml(entry.name)}</td>
      <td class="tier-cell" data-label="Tier"><span class="tier ${tierClass}">${tierIcon}${entry.tier}</span></td>
      <td class="score" data-label="SP">${spIcon}${entry.sp} SP</td>
      <td class="winrate" data-label="Win Rate">
        <span class="wr-value">${entry.wrDisplay}</span>
        <span class="wr-bar"><span class="wr-bar-fill" data-target-width="${entry.wrDisplay}"></span></span>
      </td>
      <td class="wins" data-label="Wins">${entry.wins}</td>
      <td class="losses" data-label="Losses">${entry.losses}</td>
    </tr>`;
  }

  // 1 3 4 ... 8 9 10-style page list with ellipses
  function paginationRange(current, total) {
    const delta = 1;
    const range = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  }

  function renderPagination(totalPages) {
    const nav = document.getElementById('pagination');
    if (!nav) return;

    if (totalPages <= 1) {
      nav.innerHTML = '';
      return;
    }

    let html = `<button type="button" class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
      <svg aria-hidden="true"><use href="#icon-arrow-left"></use></svg>
    </button>`;

    paginationRange(currentPage, totalPages).forEach(p => {
      if (p === '...') {
        html += `<span class="page-ellipsis">&hellip;</span>`;
      } else {
        html += `<button type="button" class="page-btn ${p === currentPage ? 'is-active' : ''}" data-page="${p}" aria-current="${p === currentPage ? 'page' : 'false'}">${p}</button>`;
      }
    });

    html += `<button type="button" class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">
      <svg aria-hidden="true"><use href="#icon-arrow-right"></use></svg>
    </button>`;

    nav.innerHTML = html;
    nav.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = Number(btn.dataset.page);
        if (!target || target < 1 || target > totalPages || target === currentPage) return;
        currentPage = target;
        renderTablePage();
      });
    });
  }

  // --- Render the current page of the table (ranks 4+, after search/tier filter) ---
  function renderTablePage() {
    const container = document.getElementById('entries');
    if (!container) return;

    let html = '<thead><tr>';
    html += `<th>Rank</th><th>Name</th><th>Tier</th>`;
    html += `<th>SP</th><th data-abbr="WR">Win Rate</th><th data-abbr="W">Wins</th><th data-abbr="L">Losses</th>`;
    html += '</tr></thead><tbody>';

    const totalPages = Math.max(1, Math.ceil(filteredRest.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filteredRest.slice(start, start + PAGE_SIZE);

    if (!pageItems.length) {
      html += `<tr class="is-empty"><td colspan="7" class="empty-state">No players match your search.</td></tr>`;
    } else {
      pageItems.forEach(entry => { html += buildRow(entry); });
    }

    html += '</tbody>';
    container.innerHTML = html;

    // Animate win-rate bars from 0 to their target width.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.querySelectorAll('.wr-bar-fill').forEach(el => {
          el.style.width = el.dataset.targetWidth;
        });
      });
    });

    // Click/keyboard select a row (visual only - no backing data for it).
    container.querySelectorAll('tbody tr[data-rank]').forEach(row => {
      const toggle = () => {
        const wasSelected = row.classList.contains('is-selected');
        container.querySelectorAll('tr.is-selected').forEach(r => r.classList.remove('is-selected'));
        if (!wasSelected) row.classList.add('is-selected');
      };
      row.addEventListener('click', toggle);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });

    renderPagination(totalPages);
  }

  function applyFilters(pool) {
    const searchTerm = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
    const tierValue = document.getElementById('tier-filter')?.value || '';
    return pool.filter(entry => {
      const matchesSearch = !searchTerm || entry.name.toLowerCase().includes(searchTerm);
      const matchesTier = !tierValue || entry.tier === tierValue;
      return matchesSearch && matchesTier;
    });
  }

  // --- Render leaderboard entries: stat cards, podium (top 3), and the paginated table ---
  function renderLeaderboard(entries) {
    const sorted = [...entries].sort(
      (a, b) => winRateValue(b.wins, b.losses) - winRateValue(a.wins, a.losses) || (b.wins + b.losses) - (a.wins + a.losses)
    );

    const ranked = sorted.map((entry, index) => {
      const sp = calculateSP(entry.wins, entry.losses);
      return {
        ...entry,
        rank: index + 1,
        sp,
        tier: getTier(sp),
        wrDisplay: calculateWinRate(entry.wins, entry.losses)
      };
    });

    renderStatCards(entries);
    renderPodium(ranked.slice(0, 3));

    rankedRest = ranked.slice(3);
    currentPage = 1;
    filteredRest = applyFilters(rankedRest);
    renderTablePage();
  }

  populateTierFilter();

  document.getElementById('search-input')?.addEventListener('input', () => {
    currentPage = 1;
    filteredRest = applyFilters(rankedRest);
    renderTablePage();
  });

  document.getElementById('tier-filter')?.addEventListener('change', () => {
    currentPage = 1;
    filteredRest = applyFilters(rankedRest);
    renderTablePage();
  });

  document.querySelector('.search-btn')?.addEventListener('click', () => {
    document.getElementById('search-input')?.focus();
  });

  // Sidebar items other than Leaderboard have no page behind them yet.
  document.querySelectorAll('.nav-item[aria-disabled="true"]').forEach(link => {
    link.addEventListener('click', (e) => e.preventDefault());
  });

  // --- Electric border animation ---
  // Drives the podium's SVG filter feOffset dx/dy via requestAnimationFrame instead of SMIL
  // <animate>. SMIL-animated filters referenced from an HTML element via CSS `filter: url(#...)`
  // get restarted by some browsers whenever that element repaints for an unrelated reason (a
  // hover elsewhere, a layout shift, etc.), which showed up as a periodic stutter no amount of
  // tuning the <animate> values fixed. A plain rAF loop we own has no such restart condition.
  function startElectricBorderLoop() {
    const offsets = [];
    for (let f = 1; f <= 3; f++) {
      for (let o = 1; o <= 4; o++) {
        const el = document.getElementById(`eb${f}-off${o}`);
        if (el) offsets.push(el);
      }
    }
    if (!offsets.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const PERIOD_MS = 12000;
    const STAGGER_MS = [0, 2000, 4000]; // one per podium rank, so they don't move in lockstep
    const AMPLITUDE = { dy: 350, dx: 245 };

    function tick(now) {
      offsets.forEach((el, i) => {
        const filterIndex = Math.floor(i / 4); // 0, 1, 2 -> which podium rank
        const offsetIndex = i % 4;             // 0..3 within that filter
        const axis = offsetIndex < 2 ? 'dy' : 'dx';
        const sign = offsetIndex % 2 === 0 ? 1 : -1;
        const amplitude = AMPLITUDE[axis];
        const t = (now + STAGGER_MS[filterIndex]) / PERIOD_MS * Math.PI * 2;
        const phase = offsetIndex * (Math.PI / 2);
        const value = sign * (amplitude + amplitude * Math.sin(t + phase));
        el.setAttribute(axis, value.toFixed(1));
      });
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  startElectricBorderLoop();

  // --- Bootstrap ---
  try {
    const data = await fetchLeaderboardData();
    renderLeaderboard(data);
  } catch (error) {
    console.error('Error loading leaderboard:', error.message);
    document.getElementById('entries').innerHTML =
      '<tbody><tr><td colspan="7" class="empty-state">Failed to load leaderboard data.</td></tr></tbody>';
    const statCards = document.getElementById('stat-cards');
    if (statCards) statCards.innerHTML = '';
  }
});
