import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSales } from '@/context/SalesContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Card } from '@/components/ui/Card';
import { ModernButton } from '@/components/ui/ModernButton';

function formatCurrency(value: number | string | undefined) {
  if (value === undefined || value === null) return 'R$ 0,00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'R$ 0,00';
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
  } catch (e) {
    return 'R$ ' + numValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}

export default function SaleDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const { getSaleById, deleteSale, updateSaleStatus, isLoading } = useSales();

  const sale = getSaleById(id as string);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = () => {
    Alert.alert("Cancelar Venda", "Tem certeza?", [
        { text: "Voltar", style: "cancel" },
        { text: "Confirmar", style: "destructive", onPress: async () => {
            await deleteSale(id as string);
            router.back();
        }}
    ]);
  };

  const handleChangeStatus = async () => {
      const options = ['Aguardando Laboratório', 'Disponível para Retirada', 'Entregue', 'Cancelar'];
      Alert.alert('Atualizar Status O.S.', 'Selecione:', options.map(opt => ({
          text: opt,
          style: opt === 'Cancelar' ? 'cancel' : 'default',
          onPress: async () => {
              if(opt !== 'Cancelar') {
                  setIsUpdating(true);
                  try {
                    await updateSaleStatus(id as string, opt);
                  } finally {
                    setIsUpdating(false);
                  }
              }
          }
      })));
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[theme].background }]}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </View>
    );
  }

  if (!sale) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[theme].background }]}>
        <ThemedText>Venda não encontrada.</ThemedText>
      </View>
    );
  }

  const clientName = typeof sale.cliente === 'object' && sale.cliente 
    ? sale.cliente.fullName 
    : 'Cliente não identificado';

  // CORREÇÃO AQUI: Garantir que usamos as propriedades corretas do Pagamento
  const formaPagamento = sale.pagamento ? sale.pagamento.metodoPagamento : 'N/A';
  const saleDate = new Date(sale.dataVenda).toLocaleDateString('pt-BR');

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Stack.Screen 
        options={{ 
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <IconSymbol name="arrow.left" size={24} color={Colors[theme].icon} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: Colors[theme].background },
          headerShadowVisible: false,
        }} 
      />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 1. Cabeçalho Valor Total (CORRIGIDO sale.valorTotal) */}
        <View style={styles.headerCenter}>
            <ThemedText style={{ opacity: 0.6, letterSpacing: 1, fontSize: 12 }}>VALOR TOTAL</ThemedText>
            <ThemedText type="title" style={{ fontSize: 36, color: Colors[theme].tint, marginVertical: 4 }}>
                {formatCurrency(sale.valorTotal)}
            </ThemedText>
            <View style={[styles.pill, { backgroundColor: '#E2E8F0' }]}>
                <ThemedText style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>
                    {formaPagamento} • {saleDate}
                </ThemedText>
            </View>
        </View>

        {/* 2. Status O.S. */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Ordem de Serviço</ThemedText>
        <Card style={styles.osCard}>
            <View style={styles.rowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <IconSymbol name="gear" size={24} color={Colors[theme].text} />
                    <View>
                        <ThemedText type="defaultSemiBold">Status Atual</ThemedText>
                        <ThemedText style={{ color: Colors[theme].tint, fontWeight: 'bold' }}>
                            {sale.ordemServico?.status || 'Pendente'}
                        </ThemedText>
                    </View>
                </View>
                <TouchableOpacity onPress={handleChangeStatus}>
                    <ThemedText style={{ color: Colors[theme].tint, fontWeight: '600' }}>Alterar</ThemedText>
                </TouchableOpacity>
            </View>
        </Card>

        {/* 3. Produtos (CORRIGIDO item.valorUnitario) */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Produtos</ThemedText>
        <Card>
            {sale.produtos.map((item: any, index: number) => (
                <View key={index} style={[styles.productRow, index < sale.produtos.length - 1 && styles.borderBottom]}>
                    <View style={styles.circleQty}>
                        <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>{item.quantidade}</ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ThemedText type="defaultSemiBold">
                            {item.produto ? item.produto.name : 'Produto removido'}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                            {formatCurrency(item.valorUnitario)} un.
                        </ThemedText>
                    </View>
                    <ThemedText type="defaultSemiBold">
                        {formatCurrency(item.quantidade * item.valorUnitario)}
                    </ThemedText>
                </View>
            ))}
        </Card>

        {/* 4. Cliente */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Cliente</ThemedText>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.avatar, { backgroundColor: Colors[theme].tint }]}>
                <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
                    {clientName.substring(0, 1).toUpperCase()}
                </ThemedText>
            </View>
            <View>
                <ThemedText type="defaultSemiBold">{clientName}</ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Venda vinculada</ThemedText>
            </View>
        </Card>

        <View style={styles.actions}>
            <ModernButton 
                title="Cancelar Venda" 
                variant="danger" 
                onPress={handleDelete} 
            />
        </View>

      </ScrollView>
      
      {isUpdating && (
        <View style={styles.loadingOverlay}>
           <ActivityIndicator color="#fff" size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  headerCenter: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  sectionTitle: { marginBottom: 8, marginLeft: 4, fontSize: 18 },
  osCard: { marginBottom: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  circleQty: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#94A3B8', justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  actions: { marginTop: 32 },
  loadingOverlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 999
  }
});