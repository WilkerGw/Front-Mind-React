import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  View,
  Platform,
  RefreshControl,
  Pressable
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProducts } from '@/context/ProductsContext';
import { ProductListItem } from '@/components/management/ProductListItem';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ModernButton } from '@/components/ui/ModernButton';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassView } from '@/components/ui/GlassView';

export default function ProdutosScreen() {
  const { products, isLoading, refreshProducts } = useProducts();
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshProducts();
    setIsRefreshing(false);
  };

  // Filtragem Otimizada
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const lowerQuery = searchQuery.toLowerCase();

    return products.filter((product) =>
      product.codigo.toLowerCase().includes(lowerQuery) ||
      product.nome.toLowerCase().includes(lowerQuery) ||
      product.marca?.toLowerCase().includes(lowerQuery) // Pesquisa também por marca se existir
    );
  }, [products, searchQuery]);

  // Loading Inicial
  if (isLoading) {
    return (
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[theme].tint} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>

      {/* Header Moderno com Glass Effect */}
      <GlassView style={styles.header} intensity={80}>
        <View style={styles.titleRow}>
          <ThemedText type="title">Produtos</ThemedText>
          <ModernButton
            title="+"
            onPress={() => router.push('/add-product')}
            style={{ width: 40, height: 40, borderRadius: 20, paddingHorizontal: 0 }}
          />
        </View>

        {/* Barra de Pesquisa */}
        <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <IconSymbol size={20} name="magnifyingglass" color={Colors[theme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Código, nome ou marca..."
            placeholderTextColor={Colors[theme].icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <IconSymbol name="xmark.circle.fill" size={16} color={Colors[theme].icon} style={{ opacity: 0.7 }} />
            </Pressable>
          )}
        </View>
      </GlassView>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProductListItem
            product={item}
            onPress={() => handleProductPress(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
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
            <IconSymbol name="bag" size={48} color={Colors[theme].icon} style={{ opacity: 0.3, marginBottom: 16 }} />
            <ThemedText style={{ opacity: 0.6 }}>
              {searchQuery ? 'Nenhum produto encontrado.' : 'O seu stock está vazio.'}
            </ThemedText>
            {!searchQuery && (
              <ThemedText style={{ opacity: 0.4, fontSize: 12, marginTop: 10 }}>
                Toque no + para adicionar produtos
              </ThemedText>
            )}
          </View>
        }
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
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
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
    paddingTop: 20,
    gap: 12, // Aumentei o gap para dar mais espaço entre os cards
    paddingBottom: 100, // Espaço para a TabBar
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
});