import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Venda } from '@/context/SalesContext'; 
import { useClients } from '@/context/ClientsContext'; 

type SaleListItemProps = {
  sale: Venda;
  onPress: () => void;
};

const formatCurrency = (value: number) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export function SaleListItem({ sale, onPress }: SaleListItemProps) {
  const theme = useColorScheme() ?? 'light';
  const iconColor = Colors[theme].icon;

  // MUDANÇA: Buscamos o cliente pelo ID
  const { getClientById } = useClients();
  const client = getClientById(sale.clientId);

  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.card}>
        <View style={styles.iconContainer}>
          <IconSymbol name="cart.fill" size={24} color={iconColor} />
        </View>
        
        <View style={styles.infoContainer}>
          <ThemedText type="defaultSemiBold">
            {/* MUDANÇA: Usamos o fullName do cliente buscado */}
            {client ? client.fullName : 'Cliente não encontrado'}
          </ThemedText>
          <ThemedText style={styles.detailText}>
            {/* MUDANÇA: de itens.length para produtos.length */}
            {sale.dataVenda.toLocaleDateString('pt-BR')} - {sale.produtos.length} item(ns)
          </ThemedText>
        </View>

        <View style={styles.priceContainer}>
          <ThemedText type="defaultSemiBold">
            {formatCurrency(sale.valorTotal)}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

// ... (estilos não mudam)
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