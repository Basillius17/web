/* ===========================
   STORAGE - websiteangkatanhtml
   Simpan semua data ke localStorage
   Gambar disimpan sebagai base64
=========================== */
const WHAStorage = {
  PFX: 'wha_',

  /* ---- INTERNAL ---- */
  _get(k) { try { return JSON.parse(localStorage.getItem(this.PFX + k)); } catch (e) { return null; } },
  _set(k, v) { try { localStorage.setItem(this.PFX + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  _del(k) { localStorage.removeItem(this.PFX + k); },

  /* ---- GAMBAR (base64) ---- */
  getImg(key) { return localStorage.getItem(this.PFX + 'img_' + key) || null; },
  setImg(key, b64) {
    try { localStorage.setItem(this.PFX + 'img_' + key, b64); return true; }
    catch (e) { return false; }
  },
  delImg(key) { localStorage.removeItem(this.PFX + 'img_' + key); },

  /* ---- FILE -> BASE64 ---- */
  fileToB64(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  },

  /* ---- RESOLVE IMAGE PATH ----
     path bisa: 'ls:keyname' (localStorage) atau 'filename.jpg' (uploads original)
  ---- */
  resolveImg(path, uploadSubdir) {
    if (!path) return null;
    if (path.startsWith('ls:')) return this.getImg(path.slice(3)) || null;
    return `../websiteangkatan/uploads/${uploadSubdir}/${path}`;
  },

  /* ---- SITE DATA ---- */
  async getSiteData() {
    return this._get('site') || await fetch('data/site.json').then(r => r.json()).catch(() => ({}));
  },
  async saveSiteData(data) { return this._set('site', data); },
  async patchSiteData(patch) {
    const d = await this.getSiteData();
    Object.assign(d, patch);
    return this._set('site', d);
  },
  async patchSiteField(field, value) {
    const d = await this.getSiteData();
    d[field] = value;
    return this._set('site', d);
  },
  async saveSiteBackground(bgKey, value) {
    const d = await this.getSiteData();
    if (!d.backgrounds) d.backgrounds = {};
    d.backgrounds[bgKey] = value;
    return this._set('site', d);
  },
  async clearSiteBackground(bgKey) {
    const d = await this.getSiteData();
    if (d.backgrounds) delete d.backgrounds[bgKey];
    return this._set('site', d);
  },
  async addSiteDescription(title, content) {
    const d = await this.getSiteData();
    if (!d.descriptions) d.descriptions = [];
    const newId = d.descriptions.length ? Math.max(...d.descriptions.map(x => x.id || 0)) + 1 : 1;
    d.descriptions.push({ id: newId, title, content });
    return this._set('site', d);
  },
  async editSiteDescription(id, title, content) {
    const d = await this.getSiteData();
    const idx = (d.descriptions || []).findIndex(x => x.id == id);
    if (idx !== -1) { d.descriptions[idx].title = title; d.descriptions[idx].content = content; }
    return this._set('site', d);
  },
  async deleteSiteDescription(id) {
    const d = await this.getSiteData();
    d.descriptions = (d.descriptions || []).filter(x => x.id != id);
    return this._set('site', d);
  },

  /* ---- PENGURUS ---- */
  async getPengurus() {
    return this._get('pengurus') || await fetch('data/pengurus.json').then(r => r.json()).catch(() => []);
  },
  async savePengurus(arr) { return this._set('pengurus', arr); },
  async nextPengurusId() {
    const a = await this.getPengurus();
    return a.length ? Math.max(...a.map(x => x.id || 0)) + 1 : 1;
  },

  /* ---- ANGGOTA ---- */
  async getAnggota(gol) {
    const g = gol.toLowerCase();
    return this._get('anggota_' + g) || await fetch('data/anggota_' + g + '.json').then(r => r.json()).catch(() => []);
  },
  async saveAnggota(gol, arr) { return this._set('anggota_' + gol.toLowerCase(), arr); },
  async nextAnggotaId(gol) {
    const a = await this.getAnggota(gol);
    return a.length ? Math.max(...a.map(x => x.id || 0)) + 1 : 1;
  },

  /* ---- FOTO FOLDERS ---- */
  async getFotoFolders() {
    return this._get('foto_folders') || await fetch('data/foto_folders.json').then(r => r.json()).catch(() => []);
  },
  async saveFotoFolders(arr) { return this._set('foto_folders', arr); },
  async nextFotoFolderId() {
    const a = await this.getFotoFolders();
    return a.length ? Math.max(...a.map(x => x.id || 0)) + 1 : 1;
  },

  /* ---- PROJEK FOLDERS ---- */
  async getProjekFolders() {
    return this._get('projek_folders') || await fetch('data/projek_folders.json').then(r => r.json()).catch(() => []);
  },
  async saveProjekFolders(arr) { return this._set('projek_folders', arr); },
  async nextProjekFolderId() {
    const a = await this.getProjekFolders();
    return a.length ? Math.max(...a.map(x => x.id || 0)) + 1 : 1;
  },

  /* ---- GALLERY ITEM HELPERS ---- */
  normFoto(item) {
    if (typeof item === 'string') return { nama: item, judul: '' };
    return item;
  },
  resolveGalleryImg(nama, type, folderId) {
    if (!nama) return null;
    if (nama.startsWith('ls:')) return this.getImg(nama.slice(3)) || null;
    return `../websiteangkatan/uploads/${type}/${folderId}/${nama}`;
  },
};
