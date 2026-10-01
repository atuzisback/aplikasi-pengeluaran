const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'pengeluaran.json');

app.use(cors());
app.use(express.json());

/* ---------- Kategori (sama dengan frontend) ---------- */
const KATEGORI = [
  { id: 0, nama: 'Tanpa kategori' },
  { id: 1, nama: 'Pendidikan' },
  { id: 2, nama: 'Makanan' },
  { id: 3, nama: 'Transport' },
  { id: 4, nama: 'Hiburan' },
];

/* ---------- Penyimpanan file JSON ---------- */
function bacaDB() {
  if (!fs.existsSync(DB_FILE)) {
    const awal = {
      nextId: 4,
      items: [
        { id: 3, judul: 'Buku catatan', nominal: 25000, kategori_id: 1, tanggal: '2026-09-16', catatan: '' },
        { id: 2, judul: 'Bensin', nominal: 15000, kategori_id: 3, tanggal: '2026-09-16', catatan: '' },
        { id: 1, judul: 'Makan siang', nominal: 20000, kategori_id: 2, tanggal: '2026-09-16', catatan: '' },
      ],
    };
    simpanDB(awal);
    return awal;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function simpanDB(db) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function denganKategori(item) {
  const k = KATEGORI.find((x) => x.id === item.kategori_id) || KATEGORI[0];
  return { ...item, kategori: k.nama };
}

function hariIni() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Ambil catatan dari body (opsional, selalu berupa string)
function ambilCatatan(body) {
  return typeof body.catatan === 'string' ? body.catatan.trim() : '';
}

/* ---------- Validasi ---------- */
function validasi({ judul, nominal }) {
  const errors = {};
  if (typeof judul !== 'string' || judul.trim() === '') {
    errors.judul = 'Judul wajib diisi';
  }
  const angka = Number(nominal);
  if (nominal === undefined || nominal === null || nominal === '' || isNaN(angka) || angka <= 0) {
    errors.nominal = 'Nominal harus positif';
  }
  return errors;
}

/* ---------- Routes ---------- */
app.get('/', (req, res) => {
  res.json({ pesan: 'API Pengeluaran berjalan', endpoint: ['/pengeluaran', '/kategori'] });
});

// GET /kategori
app.get('/kategori', (req, res) => {
  res.json(KATEGORI);
});

// GET /pengeluaran  (terbaru di atas)
app.get('/pengeluaran', (req, res) => {
  const db = bacaDB();
  const data = [...db.items].sort((a, b) => b.id - a.id).map(denganKategori);
  res.json(data);
});

// GET /pengeluaran/:id
app.get('/pengeluaran/:id', (req, res) => {
  const db = bacaDB();
  const item = db.items.find((x) => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ pesan: 'Data tidak ditemukan' });
  res.json(denganKategori(item));
});

// POST /pengeluaran  (tanggal diisi otomatis oleh server)
app.post('/pengeluaran', (req, res) => {
  const errors = validasi(req.body || {});
  if (Object.keys(errors).length) {
    return res.status(400).json({ pesan: 'Periksa kembali data yang dimasukkan', errors });
  }

  const kategoriId = Number(req.body.kategori_id ?? 0);
  if (!KATEGORI.some((k) => k.id === kategoriId)) {
    return res.status(400).json({
      pesan: 'Periksa kembali data yang dimasukkan',
      errors: { kategori_id: 'Kategori tidak valid' },
    });
  }

  const db = bacaDB();
  const baru = {
    id: db.nextId,
    judul: req.body.judul.trim(),
    nominal: Number(req.body.nominal),
    kategori_id: kategoriId,
    tanggal: hariIni(),
    catatan: ambilCatatan(req.body),
  };
  db.nextId += 1;
  db.items.push(baru);
  simpanDB(db);
  res.status(201).json(denganKategori(baru));
});

// PUT /pengeluaran/:id  (judul, nominal, dan catatan dapat diubah)
app.put('/pengeluaran/:id', (req, res) => {
  const db = bacaDB();
  const item = db.items.find((x) => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ pesan: 'Data tidak ditemukan' });

  const errors = validasi(req.body || {});
  if (Object.keys(errors).length) {
    return res.status(400).json({ pesan: 'Periksa kembali data yang dimasukkan', errors });
  }

  item.judul = req.body.judul.trim();
  item.nominal = Number(req.body.nominal);
  item.catatan = ambilCatatan(req.body);
  simpanDB(db);
  res.json(denganKategori(item));
});

// DELETE /pengeluaran/:id
app.delete('/pengeluaran/:id', (req, res) => {
  const db = bacaDB();
  const index = db.items.findIndex((x) => x.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ pesan: 'Data tidak ditemukan' });

  db.items.splice(index, 1);
  simpanDB(db);
  res.json({ pesan: 'Pengeluaran berhasil dihapus' });
});

// 404 untuk route lain
app.use((req, res) => res.status(404).json({ pesan: 'Endpoint tidak ditemukan' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});