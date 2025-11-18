import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Venda } from '@/context/SalesContext'; 
// REMOVIDO: Não precisamos mais do useClients
// import { useClients } from '@/context/ClientsContext'; 

type SaleListItemProps = {
  sale: Venda; // Recebe a Venda POPULADA
  onPress: () => void;
};

export function SaleListItem({ sale, onPress }: SaleListItemProps) {
  const theme = useColorScheme() ?? 'light';
  const iconColor = Colors[theme].icon;

  // REMOVIDO: A lógica de procurar o cliente não é mais necessária
  // const { clients } = useClients();
  // const client = clients.find((c) => c._id === sale.cliente);

  // ATUALIZADO: Acedemos ao nome diretamente do objeto populado
  // Adicionamos '?' para o caso de um cliente ter sido eliminado
  const clientName = sale.cliente?.fullName ?? 'Cliente não encontrado';

  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.card}>
        <View style={styles.iconContainer}>
          <IconSymbol name="cart.fill" size={24} color={iconColor} />
        </View>
        <View style={styles.infoContainer}>
          {/* ATUALIZADO: Usamos a variável clientName */}
          <ThemedText type="defaultSemiBold">{clientName}</ThemedText>
          
          <ThemedText style={styles.detailText}>
            {new Date(sale.dataVenda).toLocaleDateString('pt-BR')}
          </ThemedText>
          
          <ThemedText style={styles.detailText}>
            Total: R$ {sale.valorTotal.toFixed(2)}
          </ThemedText>
        </View>
        <View style={styles.chevronContainer}>
          <IconSymbol name="chevron.right" size={18} color={iconColor} />
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
  chevronContainer: {
    marginLeft: 'auto',
  },
});