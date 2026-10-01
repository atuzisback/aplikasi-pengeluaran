# Backend - Aplikasi Mobile Pengeluaran

REST API sederhana (Node.js + Express). Data disimpan di `data/pengeluaran.json`
(dibuat otomatis saat server pertama kali dijalankan).

## Menjalankan
```bash
cd backend
npm install
npm start
```
Server berjalan di `http://localhost:3000`.

## Endpoint
| Method | URL | Keterangan | Respons |
|---|---|---|---|
| GET | `/pengeluaran` | Daftar, terbaru di atas | 200 |
| GET | `/pengeluaran/:id` | Detail | 200 / 404 |
| POST | `/pengeluaran` | Tambah, tanggal diisi otomatis oleh server | 201 / 400 |
| PUT | `/pengeluaran/:id` | Ubah (hanya `judul` dan `nominal`) | 200 / 400 / 404 |
| DELETE | `/pengeluaran/:id` | Hapus | 200 / 404 |
| GET | `/kategori` | Daftar kategori | 200 |

### Contoh body POST / PUT
```json
{ "judul": "Makan siang", "nominal": 20000, "kategori_id": 2 }
```
`kategori_id` opsional (default 0 = Tanpa kategori) dan hanya dipakai saat POST.

### Validasi
- `judul` wajib diisi -> "Judul wajib diisi"
- `nominal` harus angka > 0 -> "Nominal harus positif"

## Pengujian dengan Postman
1. Postman > **Import** > pilih `postman/Pengeluaran.postman_collection.json`.
2. Pastikan server berjalan (`npm start`).
3. Jalankan request berurutan 01 - 08 (atau **Run collection**). Request 03 menyimpan `id`
   ke variabel koleksi, dipakai oleh request 05 - 08.
4. Jika dites dari HP fisik, ubah variabel `baseUrl` menjadi `http://<IP-laptop>:3000`.
