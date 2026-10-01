import { useSyncExternalStore } from 'react';

import { BASE_URL } from './api-config';

export const daftarKategori = [
  'Tanpa kategori',
  'Pendidikan',
  'Makanan',
  'Transport',
  'Hiburan',
];

export type Pengeluaran = {
  id: number;
  judul: string;
  nominal: number;
  kategori: string;
  kategoriId: number;
  tanggal: string; // sudah diformat, contoh: "16 Sep 2026"
  catatan: string;
};

type Status = 'memuat' | 'siap' | 'gagal';
type State = { items: Pengeluaran[]; status: Status };

const BULAN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

function formatIso(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${BULAN[m - 1]} ${y}`;
}

export function formatRupiah(n: number) {
  return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* ---------- state bersama ---------- */

let state: State = { items: [], status: 'memuat' };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function usePengeluaran() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/* ---------- helper API ---------- */

async function panggil(path: string, opsi: RequestInit = {}) {
  const kontrol = new AbortController();
  const timer = setTimeout(() => kontrol.abort(), 8000); // batas waktu 8 detik
  try {
    return await fetch(BASE_URL + path, {
      ...opsi,
      signal: kontrol.signal,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    clearTimeout(timer);
  }
}

function dariApi(x: any): Pengeluaran {
  return {
    id: x.id,
    judul: x.judul,
    nominal: x.nominal,
    kategori: x.kategori,
    kategoriId: x.kategori_id,
    tanggal: formatIso(x.tanggal),
    catatan: x.catatan || '',
  };
}

function ganti(item: Pengeluaran) {
  const ada = state.items.some((x) => x.id === item.id);
  set({
    items: ada
      ? state.items.map((x) => (x.id === item.id ? item : x))
      : [item, ...state.items],
  });
}

function buang(id: number) {
  set({ items: state.items.filter((x) => x.id !== id) });
}

/* ---------- operasi ---------- */

/** GET /pengeluaran. paksaGagal=true untuk demo layar 14 (tekan lama "Muat ulang"). */
export async function muatUlang(paksaGagal = false) {
  set({ status: 'memuat' });

  if (paksaGagal) {
    setTimeout(() => set({ status: 'gagal' }), 600);
    return;
  }

  try {
    const res = await panggil('/pengeluaran');
    if (!res.ok) throw new Error('Gagal memuat');
    const data = await res.json();
    set({ items: data.map(dariApi), status: 'siap' });
  } catch {
    set({ status: 'gagal' });
  }
}

/** GET /pengeluaran/:id. 404 -> data dibuang dari daftar. */
export async function segarkanDetail(
  id: number
): Promise<'ada' | 'tidak-ada' | 'gagal'> {
  try {
    const res = await panggil(`/pengeluaran/${id}`);
    if (res.status === 404) {
      buang(id);
      return 'tidak-ada';
    }
    if (!res.ok) return 'gagal';
    ganti(dariApi(await res.json()));
    return 'ada';
  } catch {
    return 'gagal';
  }
}

/** POST /pengeluaran (tanggal diisi server). Melempar error jika gagal. */
export async function tambahPengeluaran(input: {
  judul: string;
  nominal: number;
  kategori: string;
  catatan?: string;
}) {
  const kategori_id = Math.max(0, daftarKategori.indexOf(input.kategori));
  const res = await panggil('/pengeluaran', {
    method: 'POST',
    body: JSON.stringify({
      judul: input.judul.trim(),
      nominal: input.nominal,
      kategori_id,
      catatan: (input.catatan ?? '').trim(),
    }),
  });
  if (!res.ok) throw new Error('Gagal menyimpan');
  const baru = dariApi(await res.json());
  set({ items: [baru, ...state.items] });
  return baru;
}

/** PUT /pengeluaran/:id (judul, nominal, dan catatan). */
export async function ubahPengeluaran(
  id: number,
  input: { judul: string; nominal: number; catatan?: string }
) {
  const res = await panggil(`/pengeluaran/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      judul: input.judul.trim(),
      nominal: input.nominal,
      catatan: (input.catatan ?? '').trim(),
    }),
  });
  if (res.status === 404) {
    buang(id);
    throw new Error('tidak-ada');
  }
  if (!res.ok) throw new Error('Gagal menyimpan');
  ganti(dariApi(await res.json()));
}

/** DELETE /pengeluaran/:id. 404 dianggap sudah terhapus. */
export async function hapusPengeluaran(id: number) {
  const res = await panggil(`/pengeluaran/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error('Gagal menghapus');
  buang(id);
}