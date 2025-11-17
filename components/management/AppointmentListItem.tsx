import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Agendamento } from '@/context/AppointmentsContext';
import { useClients } from '@/context/ClientsContext'; 

type AppointmentListItemProps = {
  appointment: Agendamento;
  onPress: () => void;
};

const formatDateTime = (date: Date) => {
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${time} - ${day}`;
};

export function AppointmentListItem({ appointment, onPress }: AppointmentListItemProps) {
  const theme = useColorScheme() ?? 'light';
  const iconColor = Colors[theme].icon;
  
  const { getClientById } = useClients();
  
  // --- AQUI ESTÁ A CORREÇÃO ---
  // 1. Tenta encontrar o cliente pelo clientId (para novos dados)
  const client = appointment.clientId ? getClientById(appointment.clientId) : null;
  
  // 2. Se encontrar, usa o client.fullName. 
  //    Senão, usa o appointment.name (para dados antigos do Mongo).
  const clientName = client ? client.fullName : (appointment.name || 'Cliente não encontrado');
  // --- FIM DA CORREÇÃO ---

  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.card}>
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
            {formatDateTime(appointment.date)} 
          </ThemedText>
        </View>
        
        <View style={styles.infoContainer}>
          <ThemedText type="defaultSemiBold">{appointment.tipo}</ThemedText>
          <ThemedText style={styles.clientText}>
            {clientName}
          </ThemedText>
          <ThemedText style={styles.statusText}>
            Status: {appointment.status}
          </ThemedText>
        </View>

        <View style={styles.chevronContainer}>
          <IconSymbol name="chevron.right" size={18} color={iconColor} />
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
  timeContainer: {
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 16,
    gap: 2,
  },
  clientText: {
    fontSize: 15,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  chevronContainer: {
    marginLeft: 'auto',
  },
});