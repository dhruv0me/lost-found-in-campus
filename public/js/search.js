/* ═══════════════════════════════════════════════════════════════
   AICE Lost & Found — Browse/Search Page (SVG-based)
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('items-grid');
  const countEl = document.getElementById('browse-count');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const loadMoreBtn = document.getElementById('load-more-btn');

  let currentPage = 1;
  let currentFilters = { type: '', category: '', location: '', search: '', sort: 'newest' };
  let totalPages = 1;
  let isLoading = false;

  // ── Dynamically populate category and location filter chips ──
  const categoryContainer = document.getElementById('category-filters');
  const locationContainer = document.getElementById('location-filters');

  if (categoryContainer) {
    CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.dataset.group = 'category';
      btn.dataset.value = cat.id;
      btn.innerHTML = `${icon(cat.icon, 'icon-sm')} ${cat.label}`;
      categoryContainer.appendChild(btn);
    });
  }

  if (locationContainer) {
    LOCATIONS.filter(l => l.id !== 'other').forEach(loc => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.dataset.group = 'location';
      btn.dataset.value = loc.id;
      btn.innerHTML = `${icon(loc.icon, 'icon-sm')} ${loc.label}`;
      locationContainer.appendChild(btn);
    });
  }

  // ── Filter Chips ──
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.group;
      const value = chip.dataset.value;
      document.querySelectorAll(`.filter-chip[data-group="${group}"]`).forEach(c => {
        if (c === chip) c.classList.toggle('active');
        else c.classList.remove('active');
      });
      currentFilters[group] = chip.classList.contains('active') ? value : '';
      currentPage = 1;
      loadItems(false);
    });
  });

  // ── Search ──
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilters.search = searchInput.value.trim();
        currentPage = 1;
        loadItems(false);
      }, 350);
    });
  }

  // Check URL params for pre-filled filters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('type')) {
    currentFilters.type = urlParams.get('type');
    document.querySelector(`.filter-chip[data-group="type"][data-value="${currentFilters.type}"]`)?.classList.add('active');
  }
  if (urlParams.get('location')) {
    currentFilters.location = urlParams.get('location');
    document.querySelector(`.filter-chip[data-group="location"][data-value="${currentFilters.location}"]`)?.classList.add('active');
  }
  if (urlParams.get('category')) {
    currentFilters.category = urlParams.get('category');
    document.querySelector(`.filter-chip[data-group="category"][data-value="${currentFilters.category}"]`)?.classList.add('active');
  }
  if (urlParams.get('search')) {
    currentFilters.search = urlParams.get('search');
    if (searchInput) searchInput.value = currentFilters.search;
  }

  // ── Sort ──
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilters.sort = sortSelect.value;
      currentPage = 1;
      loadItems(false);
    });
  }

  // ── Load More ──
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      loadItems(true);
    });
  }

  // ── Load Items ──
  async function loadItems(append = false) {
    if (isLoading) return;
    isLoading = true;

    if (!append && grid) grid.innerHTML = createSkeletonCards(6);

    try {
      const params = { page: currentPage, limit: 12, sort: currentFilters.sort };
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.category) params.category = currentFilters.category;
      if (currentFilters.location) params.location = currentFilters.location;
      if (currentFilters.search) params.search = currentFilters.search;

      const data = await api.getItems(params);
      totalPages = data.pagination.totalPages;

      if (!append) grid.innerHTML = '';

      if (data.items.length === 0 && !append) {
        grid.innerHTML = createEmptyState('search', 'No Items Found', 'Try adjusting your filters or search terms.', 'Post an Item', 'post.html');
      } else {
        data.items.forEach(item => {
          const card = createItemCard(item);
          card.style.opacity = '0';
          card.style.animation = 'fadeInUp 0.5s ease-out forwards';
          grid.appendChild(card);
        });
      }

      if (countEl) countEl.textContent = `${data.pagination.total} item${data.pagination.total !== 1 ? 's' : ''} found`;
      if (loadMoreBtn) loadMoreBtn.style.display = currentPage < totalPages ? 'block' : 'none';
    } catch (e) {
      console.error('Failed to load items:', e);
      if (!append) grid.innerHTML = createEmptyState('alertCircle', 'Error Loading Items', 'Please try again later.');
    } finally {
      isLoading = false;
    }
  }

  loadItems(false);
});
