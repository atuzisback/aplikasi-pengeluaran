import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ubahPengeluaran, usePengeluaran } from '../pengeluaran-store';

export default function UbahPengeluaran() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items } = usePengeluaran();
  const item = items.find((x) => x.id === Number(id));

  const [judul, setJudul] = useState(item?.judul ?? '');
  const [nominal, setNominal] = useState(item ? String(item.nominal) : '');
  const [catatan, setCatatan] = useState(item?.catatan ?? '');
  const [errorJudul, setErrorJudul] = useState(false);
  const [errorNominal, setErrorNominal] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);

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
          <View style={styles.stateCircle}>
            <Text style={styles.stateIcon}>⌕</Text>
          </View>
          <Text style={styles.stateTitle}>Data tidak ditemukan</Text>
          <Text style={styles.stateDesc}>
            Pengeluaran yang Anda cari tidak ditemukan{'\n'}atau sudah dihapus.
          </Text>
          <Pressable
            style={[styles.button, { alignSelf: 'stretch', marginTop: 28 }]}
            onPress={() => router.dismissAll()}
          >
            <Text style={styles.buttonText}>Kembali</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  async function simpan() {
    const judulKosong = judul.trim() === '';
    const angka = Number(nominal);
    const nominalSalah = nominal.trim() === '' || isNaN(angka) || angka <= 0;

    setErrorJudul(judulKosong);
    setErrorNominal(nominalSalah);
    if (judulKosong || nominalSalah) return;

    setMenyimpan(true);
    try {
      await ubahPengeluaran(item!.id, { judul, nominal: angka, catatan });
      router.dismissAll(); // -> 10 Daftar Diubah
    } catch (e) {
      setMenyimpan(false);
      // 'tidak-ada': data sudah dihapus di server -> layar 15 tampil otomatis
      if ((e as Error).message !== 'tidak-ada') {
        Alert.alert(
          'Gagal menyimpan',
          'Tidak dapat terhubung ke server. Pastikan backend berjalan.'
        );
      }
    }
  }

  // 09 - Ubah
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            disabled={menyimpan}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Ubah pengeluaran</Text>
        </View>

        <Text style={styles.hint}>Judul, nominal, dan catatan dapat diubah.</Text>

        <Text style={styles.label}>Judul</Text>
        <TextInput
          style={[styles.input, errorJudul && styles.inputError]}
          value={judul}
          editable={!menyimpan}
          placeholder="Contoh: Makan siang"
          placeholderTextColor="#94A3B8"
          onChangeText={(t) => {
            setJudul(t);
            if (t.trim() !== '') setErrorJudul(false);
          }}
        />
        {errorJudul && <Text style={styles.errorText}>Judul wajib diisi</Text>}

        <Text style={styles.label}>Nominal (Rp)</Text>
        <TextInput
          style={[styles.input, errorNominal && styles.inputError]}
          value={nominal}
          editable={!menyimpan}
          keyboardType="numeric"
          placeholder="Contoh: 20000"
          placeholderTextColor="#94A3B8"
          onChangeText={(t) => {
            setNominal(t);
            if (t.trim() !== '' && Number(t) > 0) setErrorNominal(false);
          }}
        />
        {errorNominal && (
          <Text style={styles.errorText}>Nominal harus positif</Text>
        )}

        <Text style={styles.label}>Catatan (opsional)</Text>
        <TextInput
          style={styles.catatanInput}
          value={catatan}
          editable={!menyimpan}
          multiline
          textAlignVertical="top"
          placeholder="Contoh: Makan di kantin kampus"
          placeholderTextColor="#94A3B8"
          onChangeText={setCatatan}
        />

        <Text style={styles.section}>Informasi hanya-baca</Text>

        <Text style={styles.label}>Kategori</Text>
        <View style={styles.readonly}>
          <Text style={styles.readonlyText}>{item.kategori}</Text>
        </View>

        <Text style={styles.label}>Tanggal</Text>
        <View style={styles.readonly}>
          <Text style={styles.readonlyText}>{item.tanggal}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Pressable
          style={[styles.button, { flex: 1 }]}
          disabled={menyimpan}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Kembali</Text>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            styles.buttonPrimary,
            menyimpan && styles.buttonSaving,
            { flex: 1 },
          ]}
          disabled={menyimpan}
          onPress={simpan}
        >
          <Text
            style={[
              styles.buttonText,
              { color: menyimpan ? '#94A3B8' : '#FFFFFF' },
            ]}
          >
            {menyimpan ? 'Menyimpan...' : 'Simpan'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 30 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
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
  hint: { fontSize: 12, color: '#667085', marginBottom: 16 },

  label: { fontSize: 13, fontWeight: '600', color: '#172033', marginBottom: 7 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172033',
    marginTop: 6,
    marginBottom: 12,
  },
  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#172033',
    marginBottom: 13,
  },
  inputError: { borderColor: '#DC2626', marginBottom: 5 },
  catatanInput: {
    minHeight: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: '#172033',
    marginBottom: 13,
  },
  errorText: { fontSize: 11, color: '#DC2626', marginBottom: 12 },

  readonly: {
    height: 52,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 13,
  },
  readonlyText: { fontSize: 15, color: '#172033' },

  bottom: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 8,
    backgroundColor: '#F7F9FC',
  },
  button: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  buttonSaving: { backgroundColor: '#E5E7EB', borderColor: '#E5E7EB' },
  buttonText: { fontSize: 14, fontWeight: '700', color: '#172033' },

  // Layar 15
  stateWrap: { alignItems: 'center', marginTop: 90, paddingHorizontal: 28 },
  stateCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateIcon: { fontSize: 30, fontWeight: '700', color: '#667085' },
  stateTitle: { fontSize: 19, fontWeight: '700', color: '#172033', marginTop: 26 },
  stateDesc: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
});
