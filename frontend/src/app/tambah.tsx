import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';

import { router } from 'expo-router';
import { useState } from 'react';

import { tambahPengeluaran } from '../pengeluaran-store';

export default function TambahPengeluaran() {
  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState('');
  const [kategori, setKategori] = useState('');
  const [catatan, setCatatan] = useState('');

  const [pilihKategori, setPilihKategori] =
    useState(false);

  const [errorJudul, setErrorJudul] =
    useState(false);

  const [errorNominal, setErrorNominal] =
    useState(false);

  const [formError, setFormError] =
    useState(false);

  // 06 - Menyimpan
  const [menyimpan, setMenyimpan] =
    useState(false);

  const daftarKategori = [
    'Tanpa kategori',
    'Pendidikan',
    'Makanan',
    'Transport',
    'Hiburan',
  ];

  function pilih(item: string) {
    setKategori(item);
    setPilihKategori(false);
  }

  function simpanPengeluaran() {
    const judulKosong =
      judul.trim() === '';

    const nominalAngka =
      Number(nominal);

    const nominalSalah =
      nominal.trim() === '' ||
      isNaN(nominalAngka) ||
      nominalAngka <= 0;

    setErrorJudul(judulKosong);
    setErrorNominal(nominalSalah);

    // 05 - Form Error
    if (judulKosong || nominalSalah) {
      setFormError(true);
      return;
    }

    setFormError(false);

    // 06 - Menyimpan
    setMenyimpan(true);

    setTimeout(() => {
      // selesai menyimpan
      setMenyimpan(false);

      // 07 - Daftar Baru: simpan ke store lalu kembali ke daftar
      tambahPengeluaran({
      judul,
      nominal: nominalAngka,
      kategori: kategori || 'Tanpa kategori',
      catatan,
    });

      router.dismissAll();
    }, 600);
  }

  /*
  =================================
  HALAMAN 03 - PILIH KATEGORI
  =================================
  */

  if (pilihKategori) {
    return (
      <View style={styles.categoryPage}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              setPilihKategori(false)
            }
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </Pressable>

          <Text style={styles.title}>
            Pilih kategori
          </Text>
        </View>

        <Text style={styles.categorySubtitle}>
          Pilih satu kategori
        </Text>

        <View style={styles.categoryList}>
          {daftarKategori.map((item) => {
            const aktif =
              kategori === item;

            return (
              <Pressable
                key={item}
                style={[
                  styles.categoryOption,
                  aktif &&
                    styles.categoryOptionActive,
                ]}
                onPress={() => pilih(item)}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    aktif &&
                      styles.categoryOptionTextActive,
                  ]}
                >
                  {item}
                </Text>

                <View
                  style={[
                    styles.radio,
                    aktif &&
                      styles.radioActive,
                  ]}
                >
                  {aktif && (
                    <View
                      style={styles.radioDot}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  /*
  =================================
  HALAMAN 02 / 04 / 05 / 06
  =================================
  */

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            disabled={menyimpan}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </Pressable>

          <Text style={styles.title}>
            Tambah pengeluaran
          </Text>
        </View>

        {/* JUDUL */}
        <Text style={styles.label}>
          Judul
        </Text>

        <TextInput
          style={[
            styles.input,
            errorJudul &&
              styles.inputError,
          ]}
          placeholder="Contoh: Makan siang"
          placeholderTextColor="#94A3B8"
          value={judul}
          editable={!menyimpan}
          onChangeText={(text) => {
            setJudul(text);

            if (text.trim() !== '') {
              setErrorJudul(false);
            }
          }}
        />

        {errorJudul && (
          <Text style={styles.errorText}>
            Judul wajib diisi
          </Text>
        )}

        {/* NOMINAL */}
        <Text style={styles.label}>
          Nominal (Rp)
        </Text>

        <TextInput
          style={[
            styles.input,
            errorNominal &&
              styles.inputError,
          ]}
          placeholder="Contoh: 20000"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={nominal}
          editable={!menyimpan}
          onChangeText={(text) => {
            setNominal(text);

            if (
              text.trim() !== '' &&
              Number(text) > 0
            ) {
              setErrorNominal(false);
            }
          }}
        />

        {errorNominal && (
          <Text style={styles.errorText}>
            Nominal harus positif
          </Text>
        )}

        {/* KATEGORI */}
        <Text style={styles.label}>
          Kategori (opsional)
        </Text>

        <Pressable
          style={styles.categoryInput}
          disabled={menyimpan}
          onPress={() =>
            setPilihKategori(true)
          }
        >
          <Text
            style={
              kategori
                ? styles.categorySelected
                : styles.categoryPlaceholder
            }
          >
            {kategori ||
              'Pilih kategori'}
          </Text>

          <Text style={styles.arrow}>
            ⌄
          </Text>
        </Pressable>

        {/* CATATAN */}
<Text style={styles.label}>
  Catatan (opsional)
</Text>

<TextInput
  style={styles.catatanInput}
  placeholder="Contoh: Makan di kantin kampus"
  placeholderTextColor="#94A3B8"
  value={catatan}
  editable={!menyimpan}
  multiline
  textAlignVertical="top"
  onChangeText={setCatatan}
/>

        {/* INFO */}
        {!formError && (
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>
              ⓘ
            </Text>

            <Text style={styles.infoText}>
              Tanggal diisi otomatis oleh
              server
            </Text>
          </View>
        )}

        {/* ERROR */}
        {formError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>
              !
            </Text>

            <Text
              style={styles.errorBoxText}
            >
              Periksa kembali data yang
              dimasukkan
            </Text>
          </View>
        )}
      </ScrollView>

      {/* TOMBOL SIMPAN */}
      <View
        style={styles.bottomContainer}
      >
        <Pressable
          disabled={menyimpan}
          style={[
            styles.saveButton,
            menyimpan &&
              styles.savingButton,
          ]}
          onPress={
            simpanPengeluaran
          }
        >
          <Text
            style={[
              styles.saveButtonText,
              menyimpan &&
                styles.savingText,
            ]}
          >
            {menyimpan
              ? 'Menyimpan...'
              : 'Simpan'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 30,
  },

  categoryPage: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 20,
    paddingTop: 48,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  backText: {
    fontSize: 28,
    lineHeight: 30,
    color: '#172033',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#172033',
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#172033',
    marginBottom: 7,
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

  inputError: {
    borderColor: '#DC2626',
    marginBottom: 5,
  },

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
  marginBottom: 16,
},

  errorText: {
    fontSize: 11,
    color: '#DC2626',
    marginBottom: 12,
  },

  categoryInput: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  categoryPlaceholder: {
    fontSize: 15,
    color: '#94A3B8',
  },

  categorySelected: {
    fontSize: 15,
    color: '#172033',
  },

  arrow: {
    fontSize: 15,
    color: '#64748B',
  },

  infoBox: {
    height: 50,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginRight: 8,
  },

  infoText: {
    fontSize: 12,
    color: '#64748B',
  },

  errorBox: {
    minHeight: 50,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },

  errorBoxText: {
    fontSize: 12,
    color: '#B91C1C',
  },

  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    backgroundColor: '#F7F9FC',
  },

  saveButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  savingButton: {
    backgroundColor: '#E5E7EB',
  },

  savingText: {
    color: '#94A3B8',
  },

  /* KATEGORI */

  categorySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: -8,
    marginBottom: 12,
  },

  categoryList: {
    gap: 8,
  },

  categoryOption: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },

  categoryOptionText: {
    fontSize: 14,
    color: '#172033',
  },

  categoryOptionTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioActive: {
    borderColor: '#2563EB',
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
});