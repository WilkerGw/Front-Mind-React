import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Cliente } from '@/context/ClientsContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';

type Props = {
  client: Cliente;
  onPress: () => void;
};

export function ClientListItem({ client, onPress }: Props) {
  const theme = useColorScheme() ?? 'light';

  // Formatar telefone simples para visualização (opcional)
  // Ex: 11999999999 -> (11) 99999-9999 (Implementação básica apenas visual)
  const formattedPhone = client.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.cardContent}>
        
        {/* Avatar Placeholder */}
        <View style={[styles.avatarContainer, { backgroundColor: Colors[theme].tint + '15' }]}>
          <IconSymbol name="person.fill" size={24} color={Colors[theme].tint} />
        </View>

        {/* Informações Principais */}
        <View style={styles.infoContainer}>
          <ThemedText type="defaultSemiBold" style={styles.nameText} numberOfLines={1}>
            {client.fullName}
          </ThemedText>
          
          <View style={styles.row}>
            <IconSymbol name="phone.fill" size={12} color={Colors[theme].icon} />
            <ThemedText style={styles.phoneText}>{formattedPhone || client.phone}</ThemedText>
          </View>
        </View>

        {/* Ícone de Seta */}
        <IconSymbol name="chevron.right" size={20} color={Colors[theme].icon} style={{ opacity: 0.5 }} />
      
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12, // Padding interno do card levemente ajustado
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25, // Círculo perfeito
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  nameText: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneText: {
    fontSize: 14,
    color: '#64748B',
  },
});