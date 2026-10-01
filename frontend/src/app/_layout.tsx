import { Stack } from 'expo-router';

import { FormProvider } from '../form-context';

export default function RootLayout() {
  return (
    <FormProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="tambah" />
        <Stack.Screen name="kategori" />
        <Stack.Screen name="detail" />
        <Stack.Screen name="ubah" />
      </Stack>
    </FormProvider>
  );
}
