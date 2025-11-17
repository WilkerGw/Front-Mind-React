import { StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSales } from '@/context/SalesContext';
import { SaleListItem } from '@/components/management/SaleListItem'; 
import { useRouter } from 'expo-router';
import { useClients } from '@/context/ClientsContext'; // 1. Importar useClients

export default function VendasScreen() {
  const { sales, isLoading: salesLoading } = useSales();
  const { isLoading: clientsLoading } = useClients(); // 2. Obter o isLoading dos Clientes
  
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();
  
  const handleSalePress = (saleId: string) => {
    router.push(`/sale/${saleId}`);
  };

  // 3. Mostrar loading se QUALQUER UM dos contextos estiver a carregar
  if (salesLoading || clientsLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sales}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SaleListItem
            sale={item}
            onPress={() => handleSalePress(item._id)}
          />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});