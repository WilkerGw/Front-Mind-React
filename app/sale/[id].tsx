import { StyleSheet, Alert, Button, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSales } from '@/context/SalesContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useClients } from '@/context/ClientsContext'; 
import { useProducts } from '@/context/ProductsContext'; 

const formatCurrency = (value: number) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

// Componente InfoRow (Definido localmente)
const InfoRow = ({ label, value }: { label: string; value?: string | number }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <ThemedView style={styles.infoRow}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </ThemedView>
  );
};

export default function SaleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); 
  const { getSaleById, deleteSale } = useSales();
  const { getClientById } = useClients(); 
  const { getProductById } = useProducts(); 

  const sale = getSaleById(id);
  const client = sale ? getClientById(sale.cliente) : undefined; 

  const handleDelete = () => {
    Alert.alert(
      "Cancelar Venda",
      `Tem a certeza que deseja cancelar esta venda?`,
      [
        { text: "Manter", style: "cancel" },
        {
          text: "Cancelar Venda",
          style: "destructive", 
          onPress: () => {
            deleteSale(id);
            router.back(); 
          },
        },
      ]
    );
  };

  if (!sale || !client) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Venda ou Cliente não encontrado.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Venda #${id.substring(0, 6)}...`,
        }} 
      />
      <ScrollView>
        {/* Informações do Cliente */}
        <ThemedText type="subtitle" style={styles.title}>Cliente</ThemedText>
        <ThemedText style={styles.value}>{client.fullName}</ThemedText>
        <ThemedText style={styles.label}>{client.cpf}</ThemedText>
        <ThemedText style={styles.label}>{client.phone}</ThemedText>

        {/* Itens da Venda */}
        <ThemedText type="subtitle" style={styles.title}>Itens Vendidos</ThemedText>
        {sale.produtos.map((item) => {
          const product = getProductById(item.produto); 
          return (
            <ThemedView key={item._id} style={styles.cartItem}>
              <View style={styles.itemDetails}>
                <ThemedText type="defaultSemiBold">
                  {item.quantidade}x {product ? product.nome : 'Produto não encontrado'}
                </ThemedText>
                <ThemedText style={styles.label}>
                  Cód: {product?.codigo} | {formatCurrency(item.valorUnitario)} cada
                </ThemedText>
              </View>
              <ThemedText type="defaultSemiBold">
                {formatCurrency(item.valorUnitario * item.quantidade)}
              </ThemedText>
            </ThemedView>
          );
        })}

        {/* Total */}
        <ThemedText type="title" style={styles.totalText}>
          Total: {formatCurrency(sale.valorTotal)}
        {/* AQUI ESTÁ A CORREÇÃO: */}
        </ThemedText>
        <ThemedText style={styles.dateText}>
          Vendido em: {sale.dataVenda.toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
        </ThemedText>
        
        {/* Detalhes do pagamento */}
        <ThemedText type="subtitle" style={styles.title}>Pagamento</ThemedText>
        <InfoRow label="Status" value={sale.status} />
        <InfoRow label="Método" value={sale.pagamento.metodoPagamento} />
        <InfoRow label="Condição" value={sale.pagamento.condicaoPagamento} />
        <InfoRow label="Parcelas" value={sale.pagamento.parcelas} />
        <InfoRow label="Valor de Entrada" value={formatCurrency(sale.pagamento.valorEntrada)} />
        <InfoRow label="Valor Restante" value={formatCurrency(sale.pagamento.valorRestante)} />


        {/* Botão de Cancelar */}
        <View style={styles.deleteButtonContainer}>
          <Button 
            title="Cancelar Venda" 
            color={Colors.light.icon} 
            onPress={handleDelete} 
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// ... (estilos não mudam)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { marginTop: 16, marginBottom: 8 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 18, marginBottom: 4 },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  itemDetails: { flex: 1, paddingRight: 8 },
  totalText: { textAlign: 'right', marginTop: 24 },
  dateText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginBottom: 24,
  },
  deleteButtonContainer: {
    marginTop: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    paddingTop: 16,
  },
  infoRow: { 
    marginBottom: 16,
  },
});