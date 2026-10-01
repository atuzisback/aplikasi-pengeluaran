import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import {
  formatRupiah,
  muatUlang,
  usePengeluaran,
} from '../pengeluaran-store';

export default function HomeScreen() {
  const { items, status } = usePengeluaran();

  // ambil data dari backend saat halaman pertama dibuka
  useEffect(() => {
    muatUlang();
  }, []);

  const keTambah = () => router.push('/tambah');

  // 14 - Gagal memuat
  if (status === 'gagal') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Daftar pengeluaran</Text>
          <View style={styles.stateWrap}>
            <View style={[styles.stateCircle, { backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.stateIcon, { color: '#DC2626' }]}>!</Text>
            </View>
            <Text style={styles.stateTitle}>Tidak dapat memuat data</Text>
            <Text style={styles.stateDesc}>
              Gagal memuat data pengeluaran.{'\n'}Periksa koneksi lalu coba kembali.
            </Text>
            <Pressable style={styles.stateButton} onPress={() => muatUlang()}>
              <Text style={styles.primaryButtonText}>Coba lagi</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // 13 - Daftar kosong
  if (status === 'siap' && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Daftar pengeluaran</Text>
          <View style={styles.stateWrap}>
            <View style={[styles.stateCircle, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.stateIcon, { color: '#2563EB' }]}>＋</Text>
            </View>
            <Text style={styles.stateTitle}>Belum ada pengeluaran</Text>
            <Text style={styles.stateDesc}>Belum ada data yang tercatat.</Text>
            <Pressable style={styles.stateButton} onPress={keTambah}>
              <Text style={styles.primaryButtonText}>Tambah pengeluaran</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // 01 / 07 / 10 / 12 - Daftar
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Daftar pengeluaran</Text>
        <Text style={styles.subtitle}>Catat dan kelola pengeluaran harian</Text>

        <Pressable style={styles.primaryButton} onPress={keTambah}>
          <Text style={styles.primaryButtonText}>+  Tambah pengeluaran</Text>
        </Pressable>

        {/* Tekan lama = simulasi gagal memuat (untuk demo layar 14) */}
        <Pressable
          style={styles.secondaryButton}
          disabled={status === 'memuat'}
          onPress={() => muatUlang()}
          onLongPress={() => muatUlang(true)}
        >
          <Text style={styles.secondaryButtonText}>↻  Muat ulang</Text>
        </Pressable>

        {status === 'memuat' ? (
          <ActivityIndicator
            style={{ marginTop: 40 }}
            size="large"
            color="#2563EB"
          />
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/detail',
                    params: { id: String(item.id) },
                  })
                }
              >
                <View style={styles.topRow}>
                  <View style={styles.icon}>
                    <Text style={styles.iconText}>Rp</Text>
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>{item.judul}</Text>
                    <Text style={styles.nominal}>{formatRupiah(item.nominal)}</Text>
                  </View>
                </View>

                <View style={styles.category}>
                  <Text style={styles.categoryText}>{item.kategori}</Text>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.date}>{item.tanggal}</Text>
                  <Text style={styles.detail}>Lihat detail  ›</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 20, paddingTop: 58, paddingBottom: 30 },
  title: { fontSize: 24, fontWeight: '700', color: '#172033' },
  subtitle: { fontSize: 13, color: '#667085', marginTop: 5, marginBottom: 17 },

  primaryButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  secondaryButton: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '700', color: '#172033' },

  list: { marginTop: 16 },
  card: {
    height: 128,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#172033' },
  nominal: { fontSize: 17, fontWeight: '700', color: '#1D4ED8', marginTop: 3 },
  category: {
    alignSelf: 'flex-start',
    height: 24,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 11,
    justifyContent: 'center',
    marginTop: 7,
  },
  categoryText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
  },
  date: { fontSize: 11, color: '#667085' },
  detail: { fontSize: 12, fontWeight: '700', color: '#2563EB' },

  // Empty / error state
  stateWrap: { alignItems: 'center', marginTop: 130, paddingHorizontal: 28 },
  stateCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateIcon: { fontSize: 30, fontWeight: '700' },
  stateTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#172033',
    marginTop: 26,
  },
  stateDesc: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
  stateButton: {
    alignSelf: 'stretch',
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
});
