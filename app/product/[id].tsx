import { StyleSheet, Platform, Alert, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useProducts } from '@/context/ProductsContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassView } from '@/components/ui/GlassView';
import { ModernButton } from '@/components/ui/ModernButton';

const formatCurrency = (value: number) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById, deleteProduct } = useProducts();
  const theme = useColorScheme() ?? 'light';

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
      <ScreenBackground>
        <View style={styles.notFoundContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={Colors[theme].icon} />
          <ThemedText style={{ marginTop: 16 }}>Produto não encontrado.</ThemedText>
          <ModernButton title="Voltar" onPress={() => router.back()} style={{ marginTop: 24 }} />
        </View>
      </ScreenBackground>
    );
  }

  const margemLucro = product.precoVenda > 0 && (product.precoCusto || 0) > 0
    ? ((product.precoVenda - (product.precoCusto || 0)) / (product.precoCusto || 1) * 100).toFixed(1)
    : '0';

  return (
    <ScreenBackground>
      <Stack.Screen options={{ title: product.nome, headerShown: false }} />

      {/* Header */}
      <GlassView style={styles.header} intensity={80}>
        <View style={styles.headerContent}>
          <ModernButton
            title=""
            onPress={() => router.back()}
            style={styles.backButton}
            icon={<IconSymbol name="chevron.left" size={20} color={Colors[theme].tint} />}
          />
          <ThemedText type="title" numberOfLines={1} style={{ flex: 1, textAlign: 'center', marginHorizontal: 8 }}>
            {product.nome}
          </ThemedText>
          <ModernButton
            title=""
            onPress={handleEdit}
            style={styles.backButton}
            icon={<IconSymbol name="pencil" size={20} color={Colors[theme].tint} />}
          />
        </View>
      </GlassView>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Informações Básicas */}
        <GlassView style={styles.section} delay={50}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Código</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.infoValue}>{product.codigo}</ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Tipo</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.infoValue}>{product.tipo}</ThemedText>
            </View>
          </View>
        </GlassView>

        {/* Detalhes do Produto */}
        <GlassView style={styles.section} delay={75}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <IconSymbol name="cube.fill" size={20} color={Colors[theme].tint} /> Detalhes do Produto
          </ThemedText>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Nome</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{product.nome}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Marca</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{product.marca || '-'}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Tipo</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{product.tipo}</ThemedText>
          </View>
        </GlassView>

        {/* Preços */}
        <GlassView style={styles.section} delay={100}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <IconSymbol name="dollarsign.circle.fill" size={20} color={Colors[theme].tint} /> Preços
          </ThemedText>

          <View style={styles.priceGrid}>
            <View style={styles.priceCard}>
              <ThemedText style={styles.priceLabel}>Preço de Custo</ThemedText>
              <ThemedText type="title" style={styles.priceValue}>
                {formatCurrency(product.precoCusto || 0)}
              </ThemedText>
            </View>

            <View style={styles.priceCard}>
              <ThemedText style={styles.priceLabel}>Preço de Venda</ThemedText>
              <ThemedText type="title" style={[styles.priceValue, { color: '#10B981' }]}>
                {formatCurrency(product.precoVenda)}
              </ThemedText>
            </View>
          </View>

          <View style={[
            styles.margemCard,
            { backgroundColor: parseFloat(margemLucro) > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
          ]}>
            <IconSymbol
              name={parseFloat(margemLucro) > 0 ? "arrow.up.right" : "arrow.down.right"}
              size={20}
              color={parseFloat(margemLucro) > 0 ? '#10B981' : '#EF4444'}
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Margem de Lucro</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: parseFloat(margemLucro) > 0 ? '#10B981' : '#EF4444' }}>
                {margemLucro}%
              </ThemedText>
            </View>
          </View>
        </GlassView>

        {/* Estoque */}
        <GlassView style={styles.section} delay={125}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <IconSymbol name="cube.box.fill" size={20} color={Colors[theme].tint} /> Estoque
          </ThemedText>

          <View style={styles.estoqueCard}>
            <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>Quantidade Disponível</ThemedText>
            <ThemedText type="title" style={{ fontSize: 32, marginTop: 8 }}>
              {product.estoque}
            </ThemedText>
          </View>
        </GlassView>

        {/* Botão Eliminar */}
        <ModernButton
          title="Eliminar Produto"
          onPress={handleDelete}
          style={[styles.deleteButton, { backgroundColor: 'rgba(107, 114, 128, 0.5)' }]}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 0,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.1)',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 16,
  },
  priceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  priceCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
  },
  priceLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
  },
  margemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  estoqueCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: 8,
  },
});