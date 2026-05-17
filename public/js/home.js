/* ═══════════════════════════════════════════════════════════════
   AICE Lost & Found — Home Page (SVG-based)
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  // Load stats
  try {
    const stats = await api.getStats();
    const counters = {
      'stat-total': stats.total,
      'stat-active': stats.active,
      'stat-reunited': stats.reunited
    };
    Object.entries(counters).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) animateCounter(el, val);
    });
  } catch (e) {
    console.error('Failed to load stats:', e);
  }

  // Load recent items
  const carousel = document.getElementById('recent-items-track');
  if (carousel) {
    try {
      const { items } = await api.getItems({ limit: 8, sort: 'newest' });
      carousel.innerHTML = '';
      if (items.length === 0) {
        carousel.innerHTML = `<div style="text-align:center; padding: 40px; width:100%; color: var(--color-text-muted);">No items posted yet. Be the first to post!</div>`;
      } else {
        items.forEach(item => {
          carousel.appendChild(createItemCard(item));
        });
      }
    } catch (e) {
      carousel.innerHTML = '<div style="text-align:center; padding:40px; color: var(--color-text-muted);">Could not load recent items.</div>';
    }
  }
});
