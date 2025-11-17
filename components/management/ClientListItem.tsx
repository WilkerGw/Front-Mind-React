import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Cliente } from '@/context/ClientsContext'; // Importar o tipo

type ClientListItemProps = {
  client: Cliente; // Recebe o objeto cliente completo
  onPress: () => void; // Função para quando o item for clicado
};

export function ClientListItem({ client, onPress }: ClientListItemProps) {
  const theme = useColorScheme() ?? 'light';
  const iconColor = Colors[theme].icon;

  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.card}>
        <View style={styles.iconContainer}>
          <IconSymbol name="person.2.fill" size={24} color={iconColor} />
        </View>
        <View style={styles.infoContainer}>
          {/* MUDANÇA: de name para fullName */}
          <ThemedText type="defaultSemiBold">{client.fullName}</ThemedText>
          
          {/* MUDANÇA: Exibindo o telefone (campo principal) */}
          <ThemedText style={styles.detailText}>{client.phone}</ThemedText>
          
          {/* Exibe o CPF se existir */}
          {client.cpf && (
            <ThemedText style={styles.detailText}>{client.cpf}</ThemedText>
          )}
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