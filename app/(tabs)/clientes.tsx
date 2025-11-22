import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TextInput, View, Platform, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useClients } from '@/context/ClientsContext';
import { ClientListItem } from '@/components/management/ClientListItem';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ModernButton } from '@/components/ui/ModernButton';

export default function ClientesScreen() {
  const { clients, isLoading, refreshClients } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();

  const handleClientPress = (clientId: string) => {
    router.push(`/client/${clientId}`);
  };

  // Função para lidar com o gesto de "puxar para atualizar"
  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshClients(); // Chama a função do contexto atualizado
    setIsRefreshing(false);
  };

  // Filtro de busca (Nome ou CPF)
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const lowerQuery = searchQuery.toLowerCase();
    
    return clients.filter((client) => 
      (client.fullName && client.fullName.toLowerCase().includes(lowerQuery)) ||
      (client.cpf && client.cpf.includes(lowerQuery))
    );
  }, [clients, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      
      {/* Header Moderno */}
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <View style={styles.titleRow}>
          <ThemedText type="title">Clientes</ThemedText>
          <ModernButton 
            title="+" 
            onPress={() => router.push('/add-client')} 
            style={{ width: 40, height: 40, borderRadius: 20, paddingHorizontal: 0 }}
          />
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9' }]}>
          <IconSymbol size={20} name="magnifyingglass" color={Colors[theme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Buscar por nome ou CPF..."
            placeholderTextColor={Colors[theme].icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ClientListItem
            client={item}
            onPress={() => handleClientPress(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        // Adiciona o controlo de refresh (puxar para baixo)
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh} 
            colors={[Colors[theme].tint]} 
            tintColor={Colors[theme].tint} 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
               <ActivityIndicator size="large" color={Colors[theme].tint} />
            ) : (
              <>
                <IconSymbol name="person.2.slash.fill" size={48} color={Colors[theme].icon} style={{ opacity: 0.3, marginBottom: 16 }} />
                <ThemedText style={{ opacity: 0.6 }}>
                  {searchQuery ? 'Nenhum cliente encontrado.' : 'Nenhum cliente registado.'}
                </ThemedText>
                {/* Mensagem de ajuda se a lista estiver vazia */}
                {!searchQuery && (
                   <ThemedText style={{ opacity: 0.4, fontSize: 12, marginTop: 10 }}>
                     Puxe a tela para baixo para recarregar
                   </ThemedText>
                )}
              </>
            )}
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
    gap: 4,
    flexGrow: 1, 
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
});