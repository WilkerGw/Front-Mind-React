import { StyleSheet, FlatList, ActivityIndicator, View, TextInput, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ProductListItem } from '@/components/management/ProductListItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProducts } from '@/context/ProductsContext';
import { useRouter } from 'expo-router'; 
import { useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProdutosScreen() {
  const { products, isLoading } = useProducts();
  const theme = useColorScheme() ?? 'light';
  const router = useRouter(); 

  // Estado para a busca
  const [searchQuery, setSearchQuery] = useState('');

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  // Lógica de Filtragem
  const filteredProducts = products.filter((product) => 
    product.codigo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.nome.toLowerCase().includes(searchQuery.toLowerCase()) // (Opcional) Também busca por nome
  );

  // Estilos dinâmicos para o input
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
      
      {/* BARRA DE PESQUISA */}
      <View style={[styles.searchBarContainer, searchContainerStyle]}>
        <IconSymbol name="magnifyingglass" size={20} color={placeholderColor} />
        
        <TextInput
          style={[styles.searchInput, { color: inputColor }]}
          placeholder="Pesquisar por código ou nome..."
          placeholderTextColor={placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Botão limpar busca */}
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={18} color={placeholderColor} />
          </Pressable>
        )}
      </View>
      {/* FIM DA BARRA DE PESQUISA */}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProductListItem
            product={item}
            onPress={() => handleProductPress(item._id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={{ opacity: 0.6 }}>Nenhum produto encontrado.</ThemedText>
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
    borderWidth: 1, // Borda fina opcional
    borderColor: 'transparent', // Pode mudar se quiser borda visível
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