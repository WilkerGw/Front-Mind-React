import { StyleSheet, FlatList, ActivityIndicator, View, TextInput, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ClientListItem } from '@/components/management/ClientListItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useClients } from '@/context/ClientsContext';
import { useRouter } from 'expo-router'; 
import { useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ClientesScreen() {
  const { clients, isLoading } = useClients();
  const theme = useColorScheme() ?? 'light';
  const router = useRouter(); 

  // 1. Estado para a busca
  const [searchQuery, setSearchQuery] = useState('');

  const handleClientPress = (clientId: string) => {
    router.push(`/client/${clientId}`);
  };

  // 2. Lógica de Filtragem (Busca por Nome ou Telefone)
  const filteredClients = clients.filter((client) => 
    client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) // Bónus: Também busca por telefone!
  );

  // Estilos dinâmicos
  const searchContainerStyle = {
    backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
    borderColor: Colors[theme].icon,
  };
  const inputColor = Colors[theme].text;
  const placeholderColor = Colors[theme].icon;

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      
      {/* 3. BARRA DE PESQUISA */}
      <View style={[styles.searchBarContainer, searchContainerStyle]}>
        <IconSymbol name="magnifyingglass" size={20} color={placeholderColor} />
        
        <TextInput
          style={[styles.searchInput, { color: inputColor }]}
          placeholder="Pesquisar cliente..."
          placeholderTextColor={placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="words" 
          autoCorrect={false}
        />

        {/* Botão limpar busca */}
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={18} color={placeholderColor} />
          </Pressable>
        )}
      </View>
      
      {/* LISTA FILTRADA */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ClientListItem
            client={item}
            onPress={() => handleClientPress(item._id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={{ opacity: 0.6 }}>Nenhum cliente encontrado.</ThemedText>
          </View>
        }
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
  // Estilos da Barra de Pesquisa
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent', 
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: '100%',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  }
});