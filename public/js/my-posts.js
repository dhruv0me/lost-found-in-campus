/* ═══════════════════════════════════════════════════════════════
   AICE Lost & Found — My Posts Management (SVG-based)
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const authSection = document.getElementById('my-posts-auth');
  const postsSection = document.getElementById('my-posts-list');
  const authForm = document.getElementById('auth-form');
  const postsContainer = document.getElementById('posts-container');
  const userNameEl = document.getElementById('user-name-display');

  const user = getUser();
  if (user) showPosts(user.email, user.name);

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email')?.value.trim();
      const name = document.getElementById('auth-name')?.value.trim();
      if (!email || !name) { showToast('Required', 'Please enter your name and email', 'error'); return; }
      setUser(name, email);
      showPosts(email, name);
    });
  }

  async function showPosts(email, name) {
    if (authSection) authSection.style.display = 'none';
    if (postsSection) postsSection.style.display = 'block';
    if (userNameEl) userNameEl.textContent = name;

    try {
      const { items } = await api.getItems({ email, limit: 50 });

      if (items.length === 0) {
        postsContainer.innerHTML = createEmptyState('edit', 'No Posts Yet', 'You haven\'t posted any items yet.', 'Post an Item', 'post.html');
        return;
      }

      postsContainer.innerHTML = '';
      for (const item of items) {
        const cat = getCategoryInfo(item.category);
        const loc = getLocationInfo(item.location);

        const el = document.createElement('div');
        el.className = 'my-post-item';
        el.innerHTML = `
          ${item.image_url
            ? `<img src="${item.image_url}" alt="${item.title}" class="my-post-image">`
            : `<div class="my-post-image" style="display:flex;align-items:center;justify-content:center;color:var(--color-text-placeholder);">${ICONS[cat.icon] || ICONS.other}</div>`
          }
          <div class="my-post-info">
            <div class="my-post-title">${item.title}</div>
            <div class="my-post-meta">
              <span class="badge badge-${item.type}" style="font-size:10px;"><span class="badge-dot badge-dot-${item.type}"></span> ${item.type}</span>
              <span class="badge badge-${item.status}" style="font-size:10px;">${item.status}</span>
              <span>${loc.label}</span>
              <span>${timeAgo(item.created_at)}</span>
            </div>
            <div id="claims-${item.id}"></div>
          </div>
          <div class="my-post-actions">
            <a href="item.html?id=${item.id}" class="btn btn-sm btn-secondary">${icon('eye', 'icon-sm')} View</a>
            ${item.status === 'active' ? `<button class="btn btn-sm btn-outline" onclick="markResolved('${item.id}')">${icon('check', 'icon-sm')} Resolve</button>` : ''}
            <button class="btn btn-sm btn-danger" onclick="deletePost('${item.id}')">${icon('trash', 'icon-sm')} Delete</button>
          </div>
        `;
        postsContainer.appendChild(el);
        loadClaims(item.id);
      }
    } catch (e) {
      postsContainer.innerHTML = createEmptyState('alertCircle', 'Error', 'Could not load your posts.');
    }
  }

  async function loadClaims(itemId) {
    const container = document.getElementById(`claims-${itemId}`);
    if (!container) return;
    try {
      const claims = await api.getClaims(itemId);
      if (claims.length === 0) return;
      container.innerHTML = `<div style="margin-top:8px;font-size:12px;font-weight:600;color:var(--color-gold-dark);">${icon('mail', 'icon-sm')} ${claims.length} claim(s)</div>`;
      claims.forEach(c => {
        container.innerHTML += `
          <div class="claim-item">
            <div class="claim-item-header">
              <span class="claim-item-name">${c.claimant_name}</span>
              <span class="claim-item-date">${timeAgo(c.created_at)}</span>
            </div>
            <div class="claim-item-proof">"${c.proof_description}"</div>
            <div class="claim-item-contact">${c.claimant_email}${c.claimant_phone ? ` · ${c.claimant_phone}` : ''}</div>
          </div>
        `;
      });
    } catch (e) { /* ignore */ }
  }

  window.markResolved = async function(id) {
    if (!confirm('Mark this item as resolved?')) return;
    try {
      await api.updateItem(id, { status: 'resolved' });
      showToast('Done', 'Item marked as resolved', 'success');
      const user = getUser();
      if (user) showPosts(user.email, user.name);
    } catch (e) { showToast('Error', e.message, 'error'); }
  };

  window.deletePost = async function(id) {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    try {
      await api.deleteItem(id);
      showToast('Deleted', 'Item has been removed', 'success');
      const user = getUser();
      if (user) showPosts(user.email, user.name);
    } catch (e) { showToast('Error', e.message, 'error'); }
  };

  window.logout = function() {
    localStorage.removeItem('aice_lf_user');
    if (authSection) authSection.style.display = 'block';
    if (postsSection) postsSection.style.display = 'none';
  };
});
