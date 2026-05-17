/* ═══════════════════════════════════════════════════════════════
   AICE Lost & Found — Item Detail Page (SVG-based)
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('id');

  if (!itemId) {
    document.getElementById('item-detail-content').innerHTML = createEmptyState('search', 'Item Not Found', 'The item you are looking for does not exist.', 'Browse Items', 'browse.html');
    return;
  }

  const container = document.getElementById('item-detail-content');

  try {
    const item = await api.getItem(itemId);
    const cat = getCategoryInfo(item.category);
    const loc = getLocationInfo(item.location);

    document.title = `${item.title} — AICE Lost & Found`;

    container.innerHTML = `
      <div class="item-detail">
        <div class="item-detail-image">
          ${item.image_url
            ? `<img src="${item.image_url}" alt="${item.title}">`
            : `<div class="item-detail-image-placeholder">${ICONS[cat.icon] || ICONS.other}</div>`
          }
        </div>
        <div class="item-detail-info">
          <div class="item-detail-badges">
            <span class="badge badge-${item.type}"><span class="badge-dot badge-dot-${item.type}"></span> ${item.type === 'lost' ? 'Lost' : 'Found'}</span>
            <span class="badge badge-category">${cat.label}</span>
            ${item.status === 'claimed' ? '<span class="badge badge-claimed">Claim Pending</span>' : ''}
            ${item.status === 'resolved' ? '<span class="badge badge-resolved">Resolved</span>' : ''}
          </div>

          <h1 class="item-detail-title">${item.title}</h1>
          <p class="item-detail-desc">${item.description}</p>

          <div class="item-detail-meta">
            <div class="item-detail-meta-row">
              ${ICONS.mapPin}
              <span class="item-detail-meta-label">Location</span>
              <span class="item-detail-meta-value">${loc.label}</span>
            </div>
            <div class="item-detail-meta-row">
              ${ICONS.calendar}
              <span class="item-detail-meta-label">Date</span>
              <span class="item-detail-meta-value">${formatDate(item.date_occurred)}</span>
            </div>
            <div class="item-detail-meta-row">
              ${ICONS.clock}
              <span class="item-detail-meta-label">Posted</span>
              <span class="item-detail-meta-value">${timeAgo(item.created_at)}</span>
            </div>
            <div class="item-detail-meta-row">
              ${ICONS.user}
              <span class="item-detail-meta-label">By</span>
              <span class="item-detail-meta-value">${item.poster_name}</span>
            </div>
          </div>

          <div class="item-detail-actions">
            ${item.status === 'active' ? `<button class="btn btn-primary btn-lg" onclick="openModal('claim-modal')">${ICONS.hand} Claim This Item</button>` : ''}
            <button class="btn btn-secondary" onclick="shareItem()">${ICONS.share} Share Link</button>
          </div>
        </div>
      </div>
    `;

    window._currentItem = item;
    loadSimilarItems(item);
  } catch (e) {
    container.innerHTML = createEmptyState('alertCircle', 'Item Not Found', 'This item may have been removed.', 'Browse Items', 'browse.html');
  }
});

async function loadSimilarItems(item) {
  const container = document.getElementById('similar-items');
  if (!container) return;

  try {
    const { items } = await api.getItems({ category: item.category, limit: 4 });
    const filtered = items.filter(i => i.id !== item.id);
    if (filtered.length === 0) {
      container.closest('.section')?.remove();
      return;
    }
    container.innerHTML = '';
    filtered.forEach(i => container.appendChild(createItemCard(i)));
  } catch (e) {
    container.closest('.section')?.remove();
  }
}

function shareItem() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast('Copied!', 'Link copied to clipboard', 'success');
  }).catch(() => {
    showToast('Share', window.location.href, 'info');
  });
}
