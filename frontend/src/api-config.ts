import Constants from 'expo-constants';

/**
 * Alamat backend.
 * - Otomatis memakai IP laptop yang dipakai Expo (HP fisik & laptop harus satu Wi-Fi).
 * - Kalau otomatis tidak jalan (mis. Expo mode tunnel), isi IP_MANUAL,
 *   contoh: '192.168.1.10'  (cek dengan perintah `ipconfig` di Windows).
 */
const IP_MANUAL = '192.168.110.231';
const PORT = 3000;

const hostExpo = Constants.expoConfig?.hostUri?.split(':')[0];
const host = IP_MANUAL || hostExpo || 'localhost';

export const BASE_URL = `http://${host}:${PORT}`;