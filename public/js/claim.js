/* ═══════════════════════════════════════════════════════════════
   AICE Lost & Found — Claim Flow
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const claimForm = document.getElementById('claim-form');

  // Pre-fill user info
  const user = getUser();
  if (user) {
    const nameInput = document.getElementById('claimant-name');
    const emailInput = document.getElementById('claimant-email');
    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
  }

  if (claimForm) {
    claimForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('claimant-name')?.value.trim();
      const email = document.getElementById('claimant-email')?.value.trim();
      const phone = document.getElementById('claimant-phone')?.value.trim();
      const proof = document.getElementById('claimant-proof')?.value.trim();

      if (!name || !email || !proof) {
        showToast('Required', 'Please fill in name, email, and proof description', 'error');
        return;
      }

      const submitBtn = claimForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Submitting...';
      }

      try {
        const item = window._currentItem;
        const result = await api.submitClaim(item.id, {
          claimant_name: name,
          claimant_email: email,
          claimant_phone: phone,
          proof_description: proof
        });

        closeModal('claim-modal');
        showToast('Claim Submitted!', result.message, 'success');

        // Save user
        setUser(name, email);

        // Reload page after a moment
        setTimeout(() => window.location.reload(), 2000);
      } catch (err) {
        showToast('Error', err.message, 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Claim'; }
      }
    });
  }
});
