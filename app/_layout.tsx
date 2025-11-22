import 'react-native-get-random-values';

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClientsProvider } from '@/context/ClientsContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { AppointmentsProvider } from '@/context/AppointmentsContext';
import { SalesProvider } from '@/context/SalesContext';
import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <CustomThemeProvider>
        <SalesProvider>
          <AppointmentsProvider>
            <ProductsProvider>
              <ClientsProvider>
                <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <AuthGuard>
                    <Stack>
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="login" options={{ headerShown: false }} />

                      {/* Rotas de Cliente */}
                      <Stack.Screen name="client/[id]" options={{ title: 'Detalhes do Cliente' }} />
                      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                      <Stack.Screen name="add-client" options={{ presentation: 'modal', title: 'Adicionar Cliente' }} />
                      <Stack.Screen name="edit-client" options={{ presentation: 'modal', title: 'Editar Cliente' }} />

                      {/* Rotas de Produto */}
                      <Stack.Screen name="product/[id]" options={{ title: 'Detalhes do Produto' }} />
                      <Stack.Screen name="add-product" options={{ presentation: 'modal', title: 'Adicionar Produto' }} />
                      <Stack.Screen name="edit-product" options={{ presentation: 'modal', title: 'Editar Produto' }} />

                      {/* Rotas de Agendamento */}
                      <Stack.Screen name="add-appointment" options={{ presentation: 'modal', title: 'Novo Agendamento' }} />
                      <Stack.Screen name="appointment/[id]" options={{ title: 'Detalhes do Agendamento' }} />
                      <Stack.Screen name="edit-appointment" options={{ presentation: 'modal', title: 'Editar Agendamento' }} />

                      {/* Rotas de Vendas */}
                      <Stack.Screen
                        name="add-sale"
                        options={{ presentation: 'modal', title: 'Nova Venda' }}
                      />
                      <Stack.Screen
                        name="sale/[id]"
                        options={{ title: 'Detalhes da Venda' }}
                      />

                    </Stack>
                    <StatusBar style="auto" />
                  </AuthGuard>
                </NavigationThemeProvider>
              </ClientsProvider>
            </ProductsProvider>
          </AppointmentsProvider>
        </SalesProvider>
      </CustomThemeProvider>
    </AuthProvider>
  );
}