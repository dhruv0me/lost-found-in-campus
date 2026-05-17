/* ═══════════════════════════════════════════════════════════════
   AICE Lost & Found — Core App (SVG-based, Light Theme)
   ═══════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: 'electronics' },
  { id: 'documents', label: 'Documents', icon: 'documents' },
  { id: 'clothing', label: 'Clothing', icon: 'clothing' },
  { id: 'accessories', label: 'Accessories', icon: 'accessories' },
  { id: 'books', label: 'Books', icon: 'books' },
  { id: 'keys', label: 'Keys', icon: 'keys' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  { id: 'bottles', label: 'Bottles', icon: 'bottles' },
  { id: 'sports', label: 'Sports', icon: 'sports' },
  { id: 'other', label: 'Other', icon: 'other' }
];

const LOCATIONS = [
  { id: 'library', label: 'Central Library', icon: 'library' },
  { id: 'canteen', label: 'Canteen', icon: 'canteen' },
  { id: 'cs-block', label: 'CS Block', icon: 'building' },
  { id: 'mech-block', label: 'Mech Block', icon: 'building' },
  { id: 'civil-block', label: 'Civil Block', icon: 'building' },
  { id: 'ee-block', label: 'EE Block', icon: 'building' },
  { id: 'ece-block', label: 'ECE Block', icon: 'building' },
  { id: 'admin-block', label: 'Admin Block', icon: 'building' },
  { id: 'hostel-a', label: 'Hostel A', icon: 'home' },
  { id: 'hostel-b', label: 'Hostel B', icon: 'home' },
  { id: 'hostel-c', label: 'Hostel C', icon: 'home' },
  { id: 'girls-hostel', label: 'Girls Hostel', icon: 'home' },
  { id: 'sports-complex', label: 'Sports Complex', icon: 'stadium' },
  { id: 'auditorium', label: 'Auditorium', icon: 'theater' },
  { id: 'parking', label: 'Parking Area', icon: 'parking' },
  { id: 'main-gate', label: 'Main Gate', icon: 'gate' },
  { id: 'labs', label: 'Laboratories', icon: 'lab' },
  { id: 'other', label: 'Other', icon: 'mapPin' }
];

function getUser() {
  const user = localStorage.getItem('aice_lf_user');
  return user ? JSON.parse(user) : null;
}

function setUser(name, email) {
  localStorage.setItem('aice_lf_user', JSON.stringify({ name, email }));
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getCategoryInfo(id) {
  return CATEGORIES.find(c => c.id === id) || { id, label: id, icon: 'other' };
}

function getLocationInfo(id) {
  return LOCATIONS.find(l => l.id === id) || { id, label: id, icon: 'mapPin' };
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Navbar ──
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 20));
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  const toggle = document.querySelector('.navbar-toggle');
  const links = document.querySelector('.navbar-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => { toggle.classList.toggle('open'); links.classList.toggle('open'); });
    links.querySelectorAll('.navbar-link').forEach(link => {
      link.addEventListener('click', () => { toggle.classList.remove('open'); links.classList.remove('open'); });
    });
  }

  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));
  }
});
