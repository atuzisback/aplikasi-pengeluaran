import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

type FormContextType = {
  judul: string;
  setJudul: (value: string) => void;

  nominal: string;
  setNominal: (value: string) => void;

  kategori: string;
  setKategori: (value: string) => void;

  resetForm: () => void;
};

const FormContext = createContext<FormContextType | undefined>(
  undefined
);

export function FormProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState('');
  const [kategori, setKategori] = useState('');

  function resetForm() {
    setJudul('');
    setNominal('');
    setKategori('');
  }

  return (
    <FormContext.Provider
      value={{
        judul,
        setJudul,
        nominal,
        setNominal,
        kategori,
        setKategori,
        resetForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormPengeluaran() {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error(
      'useFormPengeluaran harus digunakan di dalam FormProvider'
    );
  }

  return context;
}