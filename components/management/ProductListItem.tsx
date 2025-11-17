import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
  const iconColor = Colors[theme].icon;

  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.card}>
        <View style={styles.iconContainer}>
          <IconSymbol name="eyeglasses" size={24} color={iconColor} />
        </View>
        
        <View style={styles.infoContainer}>
          <ThemedText type="defaultSemiBold">{product.nome}</ThemedText>
          {/* CÓDIGO DO PRODUTO ADICIONADO AQUI */}
          <ThemedText style={styles.detailText}>
            Cód: {product.codigo} | {product.marca} - {product.tipo}
          </ThemedText>
          <ThemedText style={styles.detailText}>
            Estoque: {product.estoque}
          </ThemedText>
        </View>

        <View style={styles.priceContainer}>
          <ThemedText type="defaultSemiBold">{formatCurrency(product.precoVenda)}</ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  iconContainer: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    gap: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    marginLeft: 'auto',
    paddingLeft: 10,
  },
});