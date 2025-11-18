import { StyleSheet, ScrollView, View, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSales, Venda } from '@/context/SalesContext'; // Importamos apenas o necessário
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useEffect } from 'react';

const OS_STATUS = ['Aguardando Laboratório', 'Disponível para Retirada', 'Entregue'];

export default function SaleDetailsScreen() {
  const { id } = useLocalSearchParams();
  
  // Importamos a nova função updateSaleStatus
  const { getSaleById, sales, updateSaleStatus } = useSales(); 
  
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  
  const [sale, setSale] = useState<Venda | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sincroniza o estado local com o Contexto Global
  useEffect(() => {
    if (typeof id === 'string') {
      const foundSale = getSaleById(id);
      setSale(foundSale);
    }
  }, [id, sales]); // Quando 'sales' mudar no contexto, atualiza aqui!

  if (!sale) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Venda não encontrada.</ThemedText>
      </ThemedView>
    );
  }

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      // Usamos a função do Contexto agora!
      if (typeof id === 'string') {
        await updateSaleStatus(id, newStatus);
        Alert.alert('Sucesso', `Status atualizado para: ${newStatus}`);
      }
    } catch (error) {
      // O alerta de erro já é tratado no contexto, mas podemos manter logs
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregue': return '#4CAF50'; 
      case 'Disponível para Retirada': return '#2196F3'; 
      default: return '#FF9800'; 
    }
  };

  const currentStatus = sale.ordemServico?.status || 'Aguardando Laboratório';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Detalhes da Venda' }} />
      <ScrollView>
        
        <View style={styles.header}>
          <IconSymbol name="cart.fill" size={40} color={Colors[theme].tint} />
          <View style={{ flex: 1 }}>
            <ThemedText type="title">Venda</ThemedText>
            <ThemedText style={styles.date}>
              {new Date(sale.dataVenda).toLocaleString('pt-BR')}
            </ThemedText>
          </View>
          <View style={styles.priceTag}>
             <ThemedText type="subtitle" style={{ color: '#fff' }}>
               R$ {sale.valorTotal.toFixed(2).replace('.', ',')}
             </ThemedText>
          </View>
        </View>

        <View style={[styles.card, { borderColor: getStatusColor(currentStatus) }]}>
          <ThemedText type="subtitle" style={{ marginBottom: 10 }}>Ordem de Serviço</ThemedText>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
            <ThemedText style={styles.statusText}>{currentStatus}</ThemedText>
          </View>

          <ThemedText style={styles.label}>Alterar Status:</ThemedText>
          <View style={styles.statusButtons}>
            {OS_STATUS.map((status) => (
              <Pressable
                key={status}
                style={[
                   styles.actionButton, 
                   { 
                     backgroundColor: status === currentStatus ? getStatusColor(status) : '#ddd',
                     opacity: isUpdating ? 0.5 : 1 
                   }
                ]}
                onPress={() => status !== currentStatus && handleUpdateStatus(status)}
                disabled={status === currentStatus || isUpdating}
              >
                <ThemedText style={{ fontSize: 12, color: status === currentStatus ? '#fff' : '#000' }}>
                  {status === 'Aguardando Laboratório' ? 'Laboratório' : status === 'Disponível para Retirada' ? 'Disponível' : 'Entregue'}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Cliente</ThemedText>
          <ThemedText style={styles.infoText}>
            {sale.cliente?.fullName ?? 'Cliente Removido'}
          </ThemedText>
          {sale.cliente?.phone && <ThemedText>{sale.cliente.phone}</ThemedText>}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Itens</ThemedText>
          {sale.produtos.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <ThemedText style={{ flex: 1 }}>
                {item.produto?.nome ?? 'Produto Removido'}
              </ThemedText>
              <ThemedText>
                {item.quantidade}x R$ {item.valorUnitario.toFixed(2).replace('.', ',')}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Pagamento</ThemedText>
          <View style={styles.row}>
            <ThemedText>Método:</ThemedText>
            <ThemedText>{sale.pagamento.metodoPagamento}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText>Condição:</ThemedText>
            <ThemedText>{sale.pagamento.condicaoPagamento} ({sale.pagamento.parcelas}x)</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText>Entrada:</ThemedText>
            <ThemedText style={{ color: 'green' }}>R$ {sale.pagamento.valorEntrada.toFixed(2).replace('.', ',')}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText>Restante:</ThemedText>
            <ThemedText style={{ color: 'red' }}>R$ {sale.pagamento.valorRestante.toFixed(2).replace('.', ',')}</ThemedText>
          </View>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  date: { fontSize: 14, opacity: 0.6 },
  priceTag: { backgroundColor: '#2196F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  
  card: { 
    borderWidth: 2, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 24, 
    backgroundColor: 'rgba(150, 150, 150, 0.1)' 
  },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginBottom: 16 },
  statusText: { color: '#fff', fontWeight: 'bold' },
  
  label: { fontSize: 14, marginBottom: 8, opacity: 0.7 },
  statusButtons: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  section: { marginBottom: 24 },
  infoText: { fontSize: 16, marginTop: 4 },
  productItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
});