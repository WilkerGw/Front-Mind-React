// 1. ADICIONE ESTA LINHA NO TOPO ABSOLUTO DO FICHEIRO
import 'react-native-get-random-values';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClientsProvider } from '@/context/ClientsContext';
import { ProductsProvider } from '@/context/ProductsContext'; 
import { AppointmentsProvider } from '@/context/AppointmentsContext'; 
import { SalesProvider } from '@/context/SalesContext'; 

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SalesProvider>
      <AppointmentsProvider>
        <ProductsProvider>
          <ClientsProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                
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
            </ThemeProvider>
          </ClientsProvider>
        </ProductsProvider>
      </AppointmentsProvider>
    </SalesProvider>
  );
}