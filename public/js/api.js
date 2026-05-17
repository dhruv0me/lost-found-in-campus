/* ═══════════════════════════════════════════════════════════════
   AICE Lost & Found — API Client
   ═══════════════════════════════════════════════════════════════ */

const API_BASE = '/api';

const api = {
  // ── Items ──
  async getItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/items?${query}`);
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },

  async getItem(id) {
    const res = await fetch(`${API_BASE}/items/${id}`);
    if (!res.ok) throw new Error('Item not found');
    return res.json();
  },

  async createItem(formData) {
    const res = await fetch(`${API_BASE}/items`, { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create item');
    }
    return res.json();
  },

  async updateItem(id, data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  },

  async deleteItem(id) {
    const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete item');
    return res.json();
  },

  // ── Claims ──
  async submitClaim(itemId, data) {
    const res = await fetch(`${API_BASE}/items/${itemId}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit claim');
    }
    return res.json();
  },

  async getClaims(itemId) {
    const res = await fetch(`${API_BASE}/items/${itemId}/claims`);
    if (!res.ok) throw new Error('Failed to fetch claims');
    return res.json();
  },

  // ── Stats ──
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }
};
