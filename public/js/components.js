/* ═══════════════════════════════════════════════════════════════
   AICE Lost & Found — Components (SVG-based, Light Theme)
   ═══════════════════════════════════════════════════════════════ */

// ── Toast System ──
function showToast(title, message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }

  const toastIcons = { success: ICONS.checkCircle, error: ICONS.alertCircle, info: ICONS.info, warning: ICONS.alertCircle };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${toastIcons[type] || toastIcons.info}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 4000);
}

// ── Item Card ──
function createItemCard(item) {
  const cat = getCategoryInfo(item.category);
  const loc = getLocationInfo(item.location);
  const statusBadge = item.status === 'claimed' ? '<span class="badge badge-claimed">Claimed</span>' :
                       item.status === 'resolved' ? '<span class="badge badge-resolved">Resolved</span>' : '';

  const card = document.createElement('a');
  card.href = `item.html?id=${item.id}`;
  card.className = 'item-card';
  card.innerHTML = `
    <div class="item-card-image">
      ${item.image_url
        ? `<img src="${item.image_url}" alt="${item.title}" loading="lazy">`
        : `<div class="item-card-placeholder">${ICONS[cat.icon] || ICONS.other}</div>`
      }
    </div>
    <div class="item-card-body">
      <div class="item-card-header">
        <h3 class="item-card-title">${item.title}</h3>
        <span class="badge badge-${item.type}"><span class="badge-dot badge-dot-${item.type}"></span> ${item.type === 'lost' ? 'Lost' : 'Found'}</span>
      </div>
      <p class="item-card-desc">${item.description}</p>
      <div class="item-card-meta">
        <span class="item-card-meta-item">${ICONS.mapPin} ${loc.label}</span>
        <span class="item-card-meta-item">${ICONS.clock} ${timeAgo(item.created_at)}</span>
        <span class="badge badge-category">${cat.label}</span>
        ${statusBadge}
      </div>
    </div>
  `;
  return card;
}

function createSkeletonCards(count = 6) {
  let html = '';
  for (let i = 0; i < count; i++) html += '<div class="skeleton skeleton-card"></div>';
  return html;
}

function createEmptyState(iconName, title, message, actionText, actionHref) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${ICONS[iconName] || ICONS.search}</div>
      <h3>${title}</h3>
      <p>${message}</p>
      ${actionText ? `<a href="${actionHref}" class="btn btn-primary">${actionText}</a>` : ''}
    </div>
  `;
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) { e.target.classList.remove('active'); document.body.style.overflow = ''; }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')); document.body.style.overflow = ''; }
});

function animateCounter(element, target) {
  const duration = 1200;
  const startTime = performance.now();
  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
