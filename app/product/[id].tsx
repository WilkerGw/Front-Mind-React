import { StyleSheet, Pressable, Alert, Button, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useProducts } from '@/context/ProductsContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const formatCurrency = (value: number) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

// Componente InfoRow (atualizado para aceitar 'number')
const InfoRow = ({ label, value }: { label: string; value?: string | number }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <ThemedView style={styles.infoRow}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </ThemedView>
  );
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); 
  const { getProductById, deleteProduct } = useProducts();
  const theme = useColorScheme() ?? 'light';
  const tintColor = Colors[theme].tint;

  const product = getProductById(id);

  const handleEdit = () => {
    router.push({ pathname: '/edit-product', params: { id: id } });
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Produto",
      `Tem a certeza que deseja eliminar ${product?.nome}? Esta ação não pode ser revertida.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive", 
          onPress: () => {
            deleteProduct(id);
            router.back(); 
          },
        },
      ]
    );
  };

  if (!product) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Produto não encontrado.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: product.nome,
          headerRight: () => (
            <Pressable onPress={handleEdit} style={{ paddingRight: 8 }}>
              <IconSymbol size={24} name="pencil" color={tintColor} />
            </Pressable>
          ),
        }} 
      />
      <ScrollView>
        <InfoRow label="Código" value={product.codigo} />
        <InfoRow label="Nome" value={product.nome} />
        <InfoRow label="Marca" value={product.marca} />
        <InfoRow label="Tipo" value={product.tipo} />
        {/* Adicionado precoCusto (só aparece se existir) */}
        <InfoRow label="Preço de Custo" value={product.precoCusto ? formatCurrency(product.precoCusto) : undefined} />
        <InfoRow label="Preço de Venda" value={formatCurrency(product.precoVenda)} />
        <InfoRow label="Estoque" value={product.estoque} />
        
        <View style={styles.deleteButtonContainer}>
          <Button 
            title="Eliminar Produto" 
            color={Colors.light.icon}
            onPress={handleDelete} 
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  infoRow: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 18 },
  deleteButtonContainer: {
    marginTop: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    paddingTop: 16,
  }
});