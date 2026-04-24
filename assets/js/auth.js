/* ===========================
   AUTH - websiteangkatanhtml
   login: pengurus / bd2025
=========================== */

function wha_isAdmin() {
  return sessionStorage.getItem('wha_admin') === '1';
}

function wha_login(user, pass) {
  if (user === 'pengurus' && pass === 'bd2025') {
    sessionStorage.setItem('wha_admin', '1');
    return true;
  }
  return false;
}

function wha_logout() {
  sessionStorage.removeItem('wha_admin');
  window.location.href = 'index.html';
}

/* Inject badge Login/Admin ke navbar */
function wha_injectAuthBadge() {
  const navRight = document.getElementById('navRight');
  if (!navRight) return;
  const a = document.createElement('a');
  if (wha_isAdmin()) {
    a.href = '#';
    a.onclick = (e) => { e.preventDefault(); wha_logout(); };
    a.style.cssText = 'font-size:0.7rem;color:rgba(255,180,50,0.95);border:1px solid rgba(255,180,50,0.35);padding:4px 10px;border-radius:16px;text-decoration:none;white-space:nowrap;background:rgba(255,180,50,0.08);';
    a.textContent = '🔓 Admin';
  } else {
    a.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
    a.style.cssText = 'font-size:0.7rem;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.15);padding:4px 10px;border-radius:16px;text-decoration:none;white-space:nowrap;';
    a.textContent = '🔐 Login';
  }
  navRight.prepend(a);
}

/* Init halaman: inject badge + apply bg + inject bg editor (jika admin) */
async function wha_initPage(bgKey) {
  wha_injectAuthBadge();

  const site = await WHAStorage.getSiteData();
  const bgVal = (site.backgrounds || {})[bgKey] || '';
  let bgSrc = null;

  if (bgVal.startsWith('ls:')) {
    bgSrc = WHAStorage.getImg(bgVal.slice(3));
  } else if (bgVal) {
    bgSrc = `../websiteangkatan/uploads/backgrounds/${bgVal}`;
  }

  if (bgSrc) {
    document.body.style.backgroundImage = `url('${bgSrc}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center top';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'scroll';
  }

  if (wha_isAdmin()) {
    _injectBgEditorUI(bgKey, bgSrc);
  }

  return wha_isAdmin();
}

/* Inject tombol float + modal background editor */
function _injectBgEditorUI(bgKey, currentBgSrc) {
  // Floating button
  const btn = document.createElement('button');
  btn.className = 'bg-float-edit-btn';
  btn.id = 'bgFloatBtn';
  btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Background`;
  btn.onclick = () => openModal('modalBgEditor');
  document.body.appendChild(btn);

  // Preview current bg
  const prevHtml = currentBgSrc
    ? `<div style="margin-bottom:1rem;border-radius:12px;overflow:hidden;border:1px solid var(--border);aspect-ratio:16/5;position:relative;">
        <img src="${currentBgSrc}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.display='none'">
        <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.5);padding:4px 10px;font-size:0.7rem;color:rgba(255,255,255,0.7);">Background saat ini</div>
       </div>` : '';

  const dangerBtn = currentBgSrc
    ? `<button type="button" class="btn btn-danger" onclick="wha_clearBg('${bgKey}')">🗑️ Hapus Background</button>` : '';

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modalBgEditor';
  modal.innerHTML = `
  <div class="modal">
    <div class="modal-close" onclick="closeModal('modalBgEditor')">&times;</div>
    <h2 class="modal-title">🎨 Edit Background</h2>
    ${prevHtml}
    <form id="formBgEditor">
      <div class="form-group">
        <label class="form-label">Upload Background Baru (JPG/PNG/WebP)</label>
        <div class="file-input-wrapper">
          <input type="file" id="bgFileInput" accept="image/jpeg,image/png,image/webp,image/gif">
        </div>
        <p style="font-size:0.72rem;color:var(--gray-mid);margin-top:0.4rem;">Gunakan gambar landscape. Maks ~2MB untuk performa terbaik.</p>
      </div>
      <div id="bgPreviewWrap" style="display:none;margin-bottom:1rem;border-radius:8px;overflow:hidden;aspect-ratio:16/5;">
        <img id="bgPreviewImg" style="width:100%;height:100%;object-fit:cover;" alt="preview">
      </div>
      <div style="display:flex;gap:0.5rem;justify-content:flex-end;flex-wrap:wrap;">
        ${dangerBtn}
        <button type="button" class="btn btn-outline" onclick="closeModal('modalBgEditor')">Batal</button>
        <button type="submit" class="btn btn-white" id="btnSaveBg">Simpan Background</button>
      </div>
    </form>
  </div>`;
  document.body.appendChild(modal);

  document.getElementById('bgFileInput').addEventListener('change', function () {
    if (!this.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('bgPreviewImg').src = e.target.result;
      document.getElementById('bgPreviewWrap').style.display = 'block';
    };
    reader.readAsDataURL(this.files[0]);
  });

  document.getElementById('formBgEditor').addEventListener('submit', async function (e) {
    e.preventDefault();
    const file = document.getElementById('bgFileInput').files[0];
    if (!file) { showToast('Pilih file gambar terlebih dahulu.', 'error'); return; }
    const btn = document.getElementById('btnSaveBg');
    btn.disabled = true; btn.textContent = 'Menyimpan...';
    try {
      const b64 = await WHAStorage.fileToB64(file);
      const imgKey = 'bg_' + bgKey;
      if (!WHAStorage.setImg(imgKey, b64)) {
        showToast('Gagal simpan: kapasitas penyimpanan browser penuh.', 'error');
        btn.disabled = false; btn.textContent = 'Simpan Background'; return;
      }
      await WHAStorage.saveSiteBackground(bgKey, 'ls:' + imgKey);
      document.body.style.backgroundImage = `url('${b64}')`;
      showToast('Background berhasil diperbarui!');
      closeModal('modalBgEditor');
      setTimeout(() => location.reload(), 900);
    } catch (err) { showToast('Gagal menyimpan gambar.', 'error'); }
    btn.disabled = false; btn.textContent = 'Simpan Background';
  });
}

async function wha_clearBg(bgKey) {
  if (!confirm('Hapus background halaman ini?')) return;
  await WHAStorage.clearSiteBackground(bgKey);
  WHAStorage.delImg('bg_' + bgKey);
  document.body.style.backgroundImage = '';
  showToast('Background dihapus!');
  closeModal('modalBgEditor');
  setTimeout(() => location.reload(), 800);
}

/* Helper encode HTML */
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
