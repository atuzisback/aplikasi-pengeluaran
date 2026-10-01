import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import {
  formatRupiah,
  hapusPengeluaran,
  segarkanDetail,
  usePengeluaran,
} from '../pengeluaran-store';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items } = usePengeluaran();
  const item = items.find((x) => x.id === Number(id));

  const [konfirmasi, setKonfirmasi] = useState(false); // 11
  const [dihapus, setDihapus] = useState(false);
  const [cek, setCek] = useState(true); // sedang cek ke server

  // selalu cocokkan dengan server (404 -> layar 15)
  useEffect(() => {
    segarkanDetail(Number(id)).finally(() => setCek(false));
  }, [id]);

  // hindari kilasan layar 15 saat proses hapus
  if (dihapus) return null;

  // menunggu jawaban server
  if (!item && cek) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // 15 - Data tidak ditemukan
  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Data pengeluaran</Text>
        </View>

        <View style={styles.stateWrap}>
          <View style={[styles.stateCircle, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.stateIcon, { color: '#667085' }]}>⌕</Text>
          </View>
          <Text style={styles.stateTitle}>Data tidak ditemukan</Text>
          <Text style={styles.stateDesc}>
            Pengeluaran yang Anda cari tidak ditemukan{'\n'}atau sudah dihapus.
          </Text>
          <Pressable
            style={[styles.button, styles.stateButton]}
            onPress={() => router.dismissAll()}
          >
            <Text style={styles.buttonText}>Kembali</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  async function hapus() {
    try {
      await hapusPengeluaran(item!.id);
      setKonfirmasi(false);
      setDihapus(true);
      router.dismissAll(); // -> 12 Daftar Dihapus
    } catch {
      setKonfirmasi(false);
      Alert.alert(
        'Gagal menghapus',
        'Tidak dapat terhubung ke server. Pastikan backend berjalan.'
      );
    }
  }

  const baris: [string, string][] = [
    ['Judul', item.judul],
    ['Nominal', formatRupiah(item.nominal)],
    ['Tanggal', item.tanggal],
    ['ID kategori', String(item.kategoriId)],
    ['Catatan', item.catatan || 'Belum ada catatan'],
  ];

  // 08 - Detail
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Detail pengeluaran</Text>
        </View>

        <View style={styles.card}>
          {baris.map(([label, nilai], i) => (
            <View key={label}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue}>{nilai}</Text>
              </View>
              {i < baris.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ⓘ</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Detail hanya dapat dibaca.</Text>
            <Text style={styles.infoText}>
              Gunakan Ubah untuk memperbarui data.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.button, { flex: 104 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Kembali</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { flex: 104 }]}
            onPress={() =>
              router.push({ pathname: '/ubah', params: { id: String(item.id) } })
            }
          >
            <Text style={styles.buttonText}>✎  Ubah</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.buttonDanger, { flex: 126 }]}
            onPress={() => setKonfirmasi(true)}
          >
            <Text style={[styles.buttonText, { color: '#DC2626' }]}>⌫  Hapus</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 11 - Konfirmasi hapus */}
      <Modal
        visible={konfirmasi}
        transparent
        animationType="fade"
        onRequestClose={() => setKonfirmasi(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogIcon}>
              <Text style={styles.dialogIconText}>⌫</Text>
            </View>
            <Text style={styles.dialogTitle}>Hapus pengeluaran?</Text>
            <Text style={styles.dialogDesc}>
              Apakah Anda yakin ingin menghapus
            </Text>
            <Text style={styles.dialogName}>“{item.judul}”?</Text>

            <View style={styles.dialogActions}>
              <Pressable
                style={[styles.button, { flex: 1 }]}
                onPress={() => setKonfirmasi(false)}
              >
                <Text style={styles.buttonText}>Batal</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonDangerFill, { flex: 1 }]}
                onPress={hapus}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Hapus</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', paddingHorizontal: 20, paddingTop: 48 },
  content: { paddingBottom: 30 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backText: { fontSize: 28, lineHeight: 30, color: '#172033' },
  title: { fontSize: 20, fontWeight: '700', color: '#172033' },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { paddingVertical: 12 },
  rowLabel: { fontSize: 11, fontWeight: '500', color: '#667085' },
  rowValue: { fontSize: 15, fontWeight: '700', color: '#172033', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E2E8F0' },

  infoBox: {
    minHeight: 54,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  infoIcon: { fontSize: 14, fontWeight: '700', color: '#2563EB', marginRight: 10 },
  infoTitle: { fontSize: 12, fontWeight: '600', color: '#172033' },
  infoText: { fontSize: 11, color: '#667085', marginTop: 2 },

  actions: { flexDirection: 'row', gap: 8, marginTop: 22 },
  button: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 14, fontWeight: '700', color: '#172033' },
  buttonDanger: { borderColor: '#FCA5A5' },
  buttonDangerFill: { backgroundColor: '#DC2626', borderColor: '#DC2626' },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.46)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  dialogIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogIconText: { fontSize: 25, fontWeight: '700', color: '#DC2626' },
  dialogTitle: { fontSize: 20, fontWeight: '700', color: '#172033', marginTop: 20 },
  dialogDesc: { fontSize: 13, color: '#667085', marginTop: 12 },
  dialogName: { fontSize: 14, fontWeight: '700', color: '#172033', marginTop: 4 },
  dialogActions: { flexDirection: 'row', gap: 18, marginTop: 28, alignSelf: 'stretch' },

  // Layar 15
  stateWrap: { alignItems: 'center', marginTop: 90, paddingHorizontal: 8 },
  stateCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateIcon: { fontSize: 30, fontWeight: '700' },
  stateTitle: { fontSize: 19, fontWeight: '700', color: '#172033', marginTop: 26 },
  stateDesc: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
  stateButton: { alignSelf: 'stretch', marginTop: 28 },
});
