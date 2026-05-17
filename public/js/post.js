/* ═══════════════════════════════════════════════════════════════
   AICE Lost & Found — Post Item Form (SVG-based, Dynamic)
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  let currentStep = 1;
  const totalSteps = 4;
  let formData = { type: '', title: '', description: '', category: '', location: '', date_occurred: '', image: null };

  // ── Dynamically populate category grid ──
  const categoryGrid = document.getElementById('category-grid');
  if (categoryGrid) {
    CATEGORIES.forEach(cat => {
      const div = document.createElement('div');
      div.className = 'category-option';
      div.dataset.category = cat.id;
      div.innerHTML = `<div class="category-option-icon">${ICONS[cat.icon] || ICONS.other}</div><div class="category-option-label">${cat.label}</div>`;
      div.addEventListener('click', () => {
        document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
        div.classList.add('selected');
        formData.category = cat.id;
      });
      categoryGrid.appendChild(div);
    });
  }

  // ── Dynamically populate location select ──
  const locationSelect = document.getElementById('item-location');
  if (locationSelect) {
    LOCATIONS.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc.id;
      opt.textContent = loc.label;
      locationSelect.appendChild(opt);
    });
  }

  // ── Step Navigation ──
  function showStep(step) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`step-${step}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.step').forEach((s, i) => {
      s.classList.remove('active', 'completed');
      if (i + 1 < step) s.classList.add('completed');
      if (i + 1 === step) s.classList.add('active');
    });
    document.querySelectorAll('.step-line').forEach((l, i) => {
      l.classList.toggle('completed', i + 1 < step);
    });

    currentStep = step;
  }

  window.nextStep = function() {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) showStep(currentStep + 1);
    if (currentStep === totalSteps) populateReview();
  };

  window.prevStep = function() {
    if (currentStep > 1) showStep(currentStep - 1);
  };

  // ── Type Selection ──
  document.querySelectorAll('.type-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.type-option').forEach(o => {
        o.classList.remove('selected-lost', 'selected-found');
      });
      const type = opt.dataset.type;
      formData.type = type;
      opt.classList.add(type === 'lost' ? 'selected-lost' : 'selected-found');
    });
  });

  // ── Image Upload ──
  const uploader = document.getElementById('image-uploader');
  const fileInput = document.getElementById('image-input');
  const previewContainer = document.getElementById('image-preview-container');

  if (uploader && fileInput) {
    uploader.addEventListener('click', () => fileInput.click());
    uploader.addEventListener('dragover', (e) => { e.preventDefault(); uploader.classList.add('dragover'); });
    uploader.addEventListener('dragleave', () => uploader.classList.remove('dragover'));
    uploader.addEventListener('drop', (e) => {
      e.preventDefault();
      uploader.classList.remove('dragover');
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) handleFile(fileInput.files[0]);
    });
  }

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please upload an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Max file size is 5MB', 'error');
      return;
    }
    formData.image = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (previewContainer) {
        previewContainer.innerHTML = `
          <div class="image-preview-container">
            <img src="${e.target.result}" class="image-preview" alt="Preview">
            <button class="image-preview-remove" onclick="removeImage()" type="button">${ICONS.x}</button>
          </div>
        `;
      }
      if (uploader) uploader.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  window.removeImage = function() {
    formData.image = null;
    if (previewContainer) previewContainer.innerHTML = '';
    if (uploader) uploader.style.display = 'block';
    if (fileInput) fileInput.value = '';
  };

  // ── Validation ──
  function validateStep(step) {
    clearErrors();
    let valid = true;

    if (step === 1) {
      if (!formData.type) { showToast('Required', 'Please select Lost or Found', 'error'); valid = false; }
      const title = document.getElementById('item-title')?.value.trim();
      const desc = document.getElementById('item-description')?.value.trim();
      if (!title) { setError('item-title', 'Title is required'); valid = false; }
      else { formData.title = title; }
      if (!desc) { setError('item-description', 'Description is required'); valid = false; }
      else { formData.description = desc; }
    }
    if (step === 2) {
      if (!formData.category) { showToast('Required', 'Please select a category', 'error'); valid = false; }
      const loc = document.getElementById('item-location')?.value;
      if (!loc) { setError('item-location', 'Location is required'); valid = false; }
      else { formData.location = loc; }
    }
    if (step === 3) {
      const date = document.getElementById('item-date')?.value;
      if (!date) { setError('item-date', 'Date is required'); valid = false; }
      else { formData.date_occurred = date; }
    }
    return valid;
  }

  function setError(inputId, message) {
    const group = document.getElementById(inputId)?.closest('.form-group');
    if (group) {
      group.classList.add('has-error');
      const errorEl = group.querySelector('.form-error');
      if (errorEl) errorEl.textContent = message;
    }
  }

  function clearErrors() {
    document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
  }

  // ── Review ──
  function populateReview() {
    const cat = getCategoryInfo(formData.category);
    const loc = getLocationInfo(formData.location);
    const reviewEl = document.getElementById('review-content');
    if (reviewEl) {
      reviewEl.innerHTML = `
        <div style="display:grid; gap: 12px;">
          <div><strong>Type:</strong> <span class="badge badge-${formData.type}"><span class="badge-dot badge-dot-${formData.type}"></span> ${formData.type === 'lost' ? 'Lost' : 'Found'}</span></div>
          <div><strong>Title:</strong> ${formData.title}</div>
          <div><strong>Description:</strong> ${formData.description}</div>
          <div><strong>Category:</strong> ${cat.label}</div>
          <div><strong>Location:</strong> ${loc.label}</div>
          <div><strong>Date:</strong> ${formatDate(formData.date_occurred)}</div>
          <div><strong>Image:</strong> ${formData.image ? 'Uploaded' : 'No image'}</div>
        </div>
      `;
    }
  }

  // ── Submit ──
  const form = document.getElementById('post-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('poster-name')?.value.trim();
      const email = document.getElementById('poster-email')?.value.trim();
      const phone = document.getElementById('poster-phone')?.value.trim();

      if (!name || !email) {
        showToast('Required', 'Name and email are required', 'error');
        return;
      }

      setUser(name, email);

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> Posting...';
      }

      try {
        const fd = new FormData();
        fd.append('type', formData.type);
        fd.append('title', formData.title);
        fd.append('description', formData.description);
        fd.append('category', formData.category);
        fd.append('location', formData.location);
        fd.append('date_occurred', formData.date_occurred);
        fd.append('poster_name', name);
        fd.append('poster_email', email);
        fd.append('poster_phone', phone);
        if (formData.image) fd.append('image', formData.image);

        const item = await api.createItem(fd);
        showToast('Success!', 'Your item has been posted', 'success');

        document.getElementById('post-form-wrapper').style.display = 'none';
        const successEl = document.getElementById('success-screen');
        if (successEl) {
          successEl.style.display = 'block';
          document.getElementById('success-link')?.setAttribute('href', `item.html?id=${item.id}`);
        }
      } catch (err) {
        showToast('Error', err.message, 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Post Item'; }
      }
    });
  }

  // Pre-fill user info
  const user = getUser();
  if (user) {
    const nameInput = document.getElementById('poster-name');
    const emailInput = document.getElementById('poster-email');
    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
  }

  const dateInput = document.getElementById('item-date');
  if (dateInput) dateInput.max = new Date().toISOString().split('T')[0];

  showStep(1);
});
