import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Agendamento } from '@/context/AppointmentsContext';
import { useClients } from '@/context/ClientsContext'; // Para buscar nome se necessário
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card'; // Usando nosso novo Card

type Props = {
  appointment: Agendamento;
  onPress: () => void;
};

export function AppointmentListItem({ appointment, onPress }: Props) {
  const theme = useColorScheme() ?? 'light';
  const { getClientById } = useClients();

  // Resolver nome do cliente
  const clientName = appointment.clientId 
    ? getClientById(appointment.clientId)?.fullName 
    : appointment.name;

  // Formatar data
  const dateObj = new Date(appointment.date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
  const time = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Cor baseada no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return Colors[theme].success;
      case 'Cancelado': return Colors[theme].danger;
      case 'Concluído': return '#64748B'; // Cinza
      default: return Colors[theme].tint; // Marcado (Azul)
    }
  };

  const statusColor = getStatusColor(appointment.status);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.cardContainer}>
        {/* Barra lateral colorida */}
        <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />
        
        <View style={styles.contentContainer}>
            {/* Coluna da Data (Esquerda) */}
            <View style={styles.dateBox}>
                <ThemedText style={styles.dayText}>{day}</ThemedText>
                <ThemedText style={styles.monthText}>{month}</ThemedText>
            </View>

            {/* Coluna de Detalhes (Meio) */}
            <View style={styles.infoBox}>
                <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.clientName}>
                    {clientName || 'Cliente Desconhecido'}
                </ThemedText>
                
                <View style={styles.row}>
                    <IconSymbol name="clock" size={12} color={Colors[theme].icon} />
                    <ThemedText style={styles.detailText}>{time} • {appointment.tipo}</ThemedText>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                     <ThemedText style={[styles.statusText, { color: statusColor }]}>
                        {appointment.status.toUpperCase()}
                     </ThemedText>
                </View>
            </View>

            {/* Seta (Direita) */}
            <IconSymbol name="chevron.right" size={20} color={Colors[theme].icon} style={{ opacity: 0.5 }} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 0, // Remove padding padrão do Card para controlar layout interno
    flexDirection: 'row',
    overflow: 'hidden', // Para a barra lateral não sair do card
    alignItems: 'center',
  },
  statusStrip: {
    width: 6,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  dateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 10,
    minWidth: 50,
  },
  dayText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.6,
  },
  infoBox: {
    flex: 1,
    gap: 4,
  },
  clientName: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});