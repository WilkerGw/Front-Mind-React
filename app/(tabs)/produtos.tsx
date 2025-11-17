import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProducts } from '@/context/ProductsContext'; 
import { ProductListItem } from '@/components/management/ProductListItem'; 
import { useRouter } from 'expo-router';

export default function ProdutosScreen() {
  const { products, isLoading } = useProducts(); 
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();
  
  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id} // MUDANÇA: de id para _id
        renderItem={({ item }) => (
          <ProductListItem
            product={item}
            onPress={() => handleProductPress(item._id)} // MUDANÇA: de id para _id
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