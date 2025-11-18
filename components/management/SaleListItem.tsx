import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Venda } from '@/context/SalesContext'; // Certifique-se que este import está correto
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';

type Props = {
  sale: Venda;
  onPress: () => void;
};

// Função de formatação segura
function formatCurrency(value: number | string | undefined) {
  if (value === undefined || value === null) return 'R$ 0,00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'R$ 0,00';

  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  } catch (error) {
    return 'R$ ' + numValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}

export function SaleListItem({ sale, onPress }: Props) {
  const theme = useColorScheme() ?? 'light';

  const dateObj = new Date(sale.dataVenda);
  const dateStr = isNaN(dateObj.getTime()) 
    ? 'Data inválida' 
    : dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  
  // CORREÇÃO AQUI: Mudamos de sale.total para sale.valorTotal
  const formattedValue = formatCurrency(sale.valorTotal);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Entregue': return Colors[theme].success; 
      case 'Disponível para Retirada': return '#2563EB'; 
      case 'Aguardando Laboratório': return '#F59E0B'; 
      default: return '#64748B'; 
    }
  };

  const statusColor = getStatusColor(sale.ordemServico?.status);

  const clientName = typeof sale.cliente === 'object' && sale.cliente 
    ? sale.cliente.fullName 
    : 'Cliente (Removido)';

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.cardContent}>
        
        <View style={[styles.iconContainer, { backgroundColor: Colors[theme].tint + '15' }]}>
          <IconSymbol name="paperclip" size={24} color={Colors[theme].tint} />
        </View>

        <View style={styles.infoContainer}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.clientName}>
            {clientName}
          </ThemedText>
          
          <View style={styles.dateRow}>
            <IconSymbol name="calendar" size={12} color={Colors[theme].icon} />
            <ThemedText style={styles.dateText}>{dateStr}</ThemedText>
          </View>
        </View>

        <View style={styles.rightContainer}>
            <ThemedText type="defaultSemiBold" style={[styles.valueText, { color: Colors[theme].tint }]}>
                {formattedValue}
            </ThemedText>

            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                <ThemedText style={[styles.statusText, { color: statusColor }]}>
                    {sale.ordemServico?.status || 'Pendente'}
                </ThemedText>
            </View>
        </View>

        <IconSymbol name="chevron.right" size={20} color={Colors[theme].icon} style={{ opacity: 0.4, marginLeft: 4 }} />
      
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  clientName: {
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
  },
  rightContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  valueText: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});