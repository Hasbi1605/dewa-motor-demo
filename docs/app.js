// Dewa Motor — front-end demo. Data dummy modeled on the real Laravel CMS schema
// (kendaraans: merek, model, tahun, nomor_polisi, harga_modal, harga_jual, status, kategori).
// Everything runs client-side; edits persist in localStorage.

const LS_KEY = "dewa-demo-v1";

function seed() {
  return [
    { id: 1, merek: "Honda", model: "Beat Deluxe", tahun: 2021, kategori: "Matic", nopol: "AB 4213 XY", modal: 11500000, jual: 13500000, status: "Tersedia" },
    { id: 2, merek: "Yamaha", model: "NMAX 155", tahun: 2022, kategori: "Matic", nopol: "AB 5520 KQ", modal: 21500000, jual: 24500000, status: "Tersedia" },
    { id: 3, merek: "Honda", model: "Vario 160 CBS", tahun: 2023, kategori: "Matic", nopol: "AB 6108 RT", modal: 19800000, jual: 22500000, status: "Tersedia" },
    { id: 4, merek: "Yamaha", model: "Aerox 155", tahun: 2021, kategori: "Matic", nopol: "AB 3391 LM", modal: 16900000, jual: 19200000, status: "Terjual" },
    { id: 5, merek: "Honda", model: "Scoopy Prestige", tahun: 2020, kategori: "Matic", nopol: "AB 2874 DF", modal: 12800000, jual: 14900000, status: "Tersedia" },
    { id: 6, merek: "Kawasaki", model: "Ninja 250 FI", tahun: 2018, kategori: "Sport", nopol: "AB 9002 GH", modal: 33500000, jual: 38500000, status: "Tersedia" },
    { id: 7, merek: "Suzuki", model: "Satria F150", tahun: 2019, kategori: "Bebek", nopol: "AB 7745 JK", modal: 11900000, jual: 13750000, status: "Tersedia" },
    { id: 8, merek: "Honda", model: "PCX 160 ABS", tahun: 2022, kategori: "Matic", nopol: "AB 6617 NP", modal: 25400000, jual: 28900000, status: "Terjual" },
    { id: 9, merek: "Yamaha", model: "Mio M3 125", tahun: 2019, kategori: "Matic", nopol: "AB 1956 ST", modal: 8200000, jual: 9900000, status: "Tersedia" },
    { id: 10, merek: "Vespa", model: "Sprint 150", tahun: 2021, kategori: "Matic", nopol: "AB 8080 UV", modal: 37500000, jual: 42900000, status: "Tersedia" },
  ];
}

let UNITS = load();
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  const s = seed(); persist(s); return s;
}
function persist(u) { try { localStorage.setItem(LS_KEY, JSON.stringify(u || UNITS)); } catch (e) { /* ignore */ } }
function resetData() {
  if (!confirm("Reset semua data demo ke kondisi awal?")) return;
  UNITS = seed(); persist(); renderAll();
}
window.resetData = resetData;

const rp = n => "Rp" + new Intl.NumberFormat("id-ID").format(Number(n) || 0);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- tabs ----------
function switchTab(name) {
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  document.getElementById("tab-katalog").hidden = name !== "katalog";
  document.getElementById("tab-kelola").hidden = name !== "kelola";
}
window.switchTab = switchTab;

// ---------- stats ----------
function renderStats() {
  const avail = UNITS.filter(u => u.status === "Tersedia");
  const sold = UNITS.filter(u => u.status === "Terjual");
  const nilaiStok = avail.reduce((s, u) => s + Number(u.modal), 0);
  const margin = avail.reduce((s, u) => s + (Number(u.jual) - Number(u.modal)), 0);
  document.getElementById("stats").innerHTML = [
    ["Total Unit", UNITS.length + " unit"],
    ["Tersedia", avail.length + " unit"],
    ["Terjual", sold.length + " unit"],
    ["Nilai Stok (modal)", rp(nilaiStok)],
    ["Potensi Margin", rp(margin)],
  ].map(([l, n]) => `<div class="stat"><div class="num">${n}</div><div class="lbl">${l}</div></div>`).join("");
}

// ---------- katalog ----------
function renderKatalog() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  const kat = document.getElementById("filter-kategori").value;
  const st = document.getElementById("filter-status").value;
  const list = UNITS.filter(u =>
    (!q || (u.merek + " " + u.model).toLowerCase().includes(q)) &&
    (!kat || u.kategori === kat) &&
    (!st || u.status === st));
  document.getElementById("katalog-empty").hidden = list.length > 0;
  document.getElementById("katalog-grid").innerHTML = list.map(u => `
    <div class="unit-card">
      <div class="unit-visual">${esc(u.merek.slice(0, 2).toUpperCase())}
        <span class="badge ${u.status === "Tersedia" ? "badge-green" : "badge-red"}">${u.status}</span></div>
      <div class="unit-body">
        <div class="unit-name">${esc(u.merek)} ${esc(u.model)}</div>
        <div class="unit-meta">${u.tahun} • ${esc(u.kategori)} • ${esc(u.nopol)}</div>
        <div class="unit-price">${rp(u.jual)}</div>
      </div>
    </div>`).join("");
}
window.renderKatalog = renderKatalog;

// ---------- admin ----------
function renderAdmin() {
  const rows = UNITS.map(u => `<tr>
    <td><strong>${esc(u.merek)} ${esc(u.model)}</strong><br><span style="color:var(--muted)">${esc(u.nopol)}</span></td>
    <td>${u.tahun}</td><td>${esc(u.kategori)}</td>
    <td>${rp(u.modal)}</td><td>${rp(u.jual)}</td><td>${rp(Number(u.jual) - Number(u.modal))}</td>
    <td><span class="badge ${u.status === "Tersedia" ? "badge-green" : "badge-red"}">${u.status}</span></td>
    <td><span class="row-actions">
      <button class="btn btn-edit btn-small" onclick="openForm(${u.id})">Edit</button>
      <button class="btn btn-danger btn-small" onclick="deleteUnit(${u.id})">Hapus</button>
    </span></td></tr>`).join("");
  document.getElementById("admin-table").innerHTML =
    `<table><thead><tr><th>Unit</th><th>Tahun</th><th>Kategori</th><th>Harga Modal</th><th>Harga Jual</th><th>Margin</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table>`;
}

const FIELDS = [
  { key: "merek", label: "Merek", type: "text" },
  { key: "model", label: "Model", type: "text" },
  { key: "tahun", label: "Tahun pembuatan", type: "number" },
  { key: "kategori", label: "Kategori", type: "select", options: ["Matic", "Sport", "Bebek"] },
  { key: "nopol", label: "Nomor polisi", type: "text" },
  { key: "modal", label: "Harga modal (Rp)", type: "number" },
  { key: "jual", label: "Harga jual (Rp)", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["Tersedia", "Terjual"] },
];

let editingId = null;
function openForm(id) {
  const u = id ? UNITS.find(x => x.id === id) : null;
  editingId = id || null;
  document.getElementById("modal-title").textContent = u ? "Edit Unit" : "Tambah Unit";
  document.getElementById("modal-form").innerHTML = FIELDS.map(f => {
    const val = u ? u[f.key] : "";
    if (f.type === "select") {
      return `<label>${f.label}<select name="${f.key}">${f.options.map(o =>
        `<option value="${o}" ${String(val) === o ? "selected" : ""}>${o}</option>`).join("")}</select></label>`;
    }
    return `<label>${f.label}<input name="${f.key}" type="${f.type}" value="${esc(val)}" required></label>`;
  }).join("");
  document.getElementById("modal").hidden = false;
}
function closeModal() { document.getElementById("modal").hidden = true; editingId = null; }
function saveForm(ev) {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const obj = {};
  for (const f of FIELDS) obj[f.key] = f.type === "number" ? Number(fd.get(f.key)) : fd.get(f.key);
  if (editingId) Object.assign(UNITS.find(x => x.id === editingId), obj);
  else { obj.id = Date.now(); UNITS.push(obj); }
  persist(); closeModal(); renderAll();
  return false;
}
function deleteUnit(id) {
  if (!confirm("Hapus unit ini dari demo?")) return;
  UNITS = UNITS.filter(x => x.id !== id);
  persist(); renderAll();
}
window.openForm = openForm; window.closeModal = closeModal; window.saveForm = saveForm; window.deleteUnit = deleteUnit;

function renderAll() { renderStats(); renderKatalog(); renderAdmin(); }
renderAll();
