/* ===========================
   GLOBAL JS - Website Angkatan
=========================== */

// ---- NAVBAR ----
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('open'));
  }

  // Mark active nav link
  const links = document.querySelectorAll('.navbar nav a');
  links.forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
  });

  // Init fade-in elements
  document.querySelectorAll('.fade-in').forEach((el, i) => {
    el.style.animationDelay = (i * 0.08) + 's';
  });
});

// ---- TOAST ----
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}

// ---- MODAL ----
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}
// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});
// Close modal on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// ---- LIGHTBOX ----
function openLightbox(src) {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.innerHTML = `<button class="lightbox-close" onclick="closeLightbox()">&times;</button><img id="lightbox-img" src="" alt="">`;
    lb.addEventListener('click', function(e){ if(e.target === lb) closeLightbox(); });
    document.body.appendChild(lb);
  }
  document.getElementById('lightbox-img').src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) { lb.classList.remove('open'); document.body.style.overflow = ''; }
}

// ---- IMAGE PREVIEW ----
function previewImage(input, previewId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

// ---- CONFIRM DELETE ----
function confirmDelete(msg, callback) {
  if (confirm(msg || 'Yakin ingin menghapus?')) {
    callback();
  }
}

// ---- FETCH HELPER ----
async function postForm(url, formData) {
  try {
    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json();
    return data;
  } catch(err) {
    return { success: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

async function fetchGet(url) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch(err) {
    return null;
  }
}

// ---- NUMBER FORMAT ----
function fmtNum(n) {
  return parseInt(n).toLocaleString('id-ID');
}
