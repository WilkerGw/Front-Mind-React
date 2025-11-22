import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { GlassView } from '@/components/ui/GlassView';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Produto } from '@/context/ProductsContext';

type ProductListItemProps = {
  product: Produto;
  onPress: () => void;
};

// Função para formatar o preço
const formatCurrency = (value: number) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export function ProductListItem({ product, onPress }: ProductListItemProps) {
  const theme = useColorScheme() ?? 'light';
  const iconColor = Colors[theme].tint; // Usando a cor de destaque (azul)

  return (
    <Pressable onPress={onPress} style={{ marginBottom: 8 }}>
      <GlassView style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <IconSymbol name="eyeglasses" size={20} color={iconColor} />
        </View>

        <View style={styles.infoContainer}>
          <ThemedText type="defaultSemiBold">{product.nome}</ThemedText>
          {/* CÓDIGO DO PRODUTO ADICIONADO AQUI */}
          <ThemedText style={[styles.detailText, { color: Colors[theme].icon }]}>
            Cód: {product.codigo} | {product.marca}
          </ThemedText>
          <ThemedText style={[styles.detailText, { color: Colors[theme].icon }]}>
            Estoque: {product.estoque} • {product.tipo}
          </ThemedText>
        </View>

        <View style={styles.priceContainer}>
          <ThemedText type="defaultSemiBold" style={{ color: Colors[theme].tint }}>
            {formatCurrency(product.precoVenda)}
          </ThemedText>
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    opacity: 0.8,
  },
  priceContainer: {
    marginLeft: 8,
    alignItems: 'flex-end',
  },
});