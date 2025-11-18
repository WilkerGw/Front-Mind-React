import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TextInput, View, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSales } from '@/context/SalesContext';
import { SaleListItem } from '@/components/management/SaleListItem';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ModernButton } from '@/components/ui/ModernButton';

export default function VendasScreen() {
  const { sales, isLoading } = useSales();
  const [searchQuery, setSearchQuery] = useState('');
  
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();

  const handleSalePress = (saleId: string) => {
    router.push(`/sale/${saleId}`);
  };

  // Filtro de Busca (Nome do Cliente)
  const filteredSales = useMemo(() => {
    if (!searchQuery.trim()) return sales;
    const lowerQuery = searchQuery.toLowerCase();
    
    return sales.filter((sale) => {
        // Tratamento seguro para caso o cliente não esteja populado
        const clientName = typeof sale.cliente === 'object' ? sale.cliente?.fullName : '';
        return clientName?.toLowerCase().includes(lowerQuery);
    });
  }, [sales, searchQuery]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[theme].background }]}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      
      {/* Header Fixo Moderno */}
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <View style={styles.titleRow}>
          <ThemedText type="title">Vendas</ThemedText>
          <ModernButton 
            title="+" 
            onPress={() => router.push('/add-sale')} 
            style={{ width: 42, height: 42, borderRadius: 21, paddingHorizontal: 0 }}
          />
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9' }]}>
          <IconSymbol size={20} name="magnifyingglass" color={Colors[theme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Buscar por nome do cliente..."
            placeholderTextColor={Colors[theme].icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SaleListItem
            sale={item}
            onPress={() => handleSalePress(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="paperclip" size={48} color={Colors[theme].icon} style={{ opacity: 0.3, marginBottom: 16 }} />
            <ThemedText style={{ opacity: 0.6 }}>Nenhuma venda encontrada.</ThemedText>
          </View>
        }
      />
    </View>
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    height: '100%',
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
    gap: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
});