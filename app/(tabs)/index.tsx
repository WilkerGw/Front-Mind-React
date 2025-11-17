import { StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useClients } from '@/context/ClientsContext';
import { useProducts } from '@/context/ProductsContext';
import { useAppointments } from '@/context/AppointmentsContext';
import { useSales } from '@/context/SalesContext';
import { AppointmentListItem } from '@/components/management/AppointmentListItem';
import { SaleListItem } from '@/components/management/SaleListItem';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';

// Função para formatar o preço
const formatCurrency = (value: number) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

// Componente para os cartões de estatística
const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
  <ThemedView style={styles.statCard}>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
    <ThemedText style={[styles.statTitle, { color }]}>{title}</ThemedText>
  </ThemedView>
);

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  
  // 1. Obter os dados E os estados de loading de TODOS
  const { clients, isLoading: clientsLoading } = useClients();
  const { products, isLoading: productsLoading } = useProducts();
  const { appointments, isLoading: appointmentsLoading } = useAppointments();
  const { sales, isLoading: salesLoading } = useSales(); 

  // Lógica de Cálculo (só corre quando 'sales' muda)
  const { totalVendasDia, totalVendasMes } = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let totalDia = 0;
    let totalMes = 0;
    for (const sale of sales) {
      const saleDate = sale.dataVenda; 
      if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
        totalMes += sale.valorTotal;
        if (saleDate.getDate() === currentDay) {
          totalDia += sale.valorTotal;
        }
      }
    }
    return { totalVendasDia: totalDia, totalVendasMes: totalMes };
  }, [sales]);

  // Listas (só corre quando 'appointments' ou 'sales' mudam)
  const proximosAgendamentos = useMemo(() => {
    return appointments
      .filter(a => a.date.getTime() >= new Date().getTime() && a.status !== 'Concluído' && a.status !== 'Cancelado')
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
  }, [appointments]);

  const ultimasVendas = useMemo(() => {
    return sales.slice(0, 3);
  }, [sales]);

  const tintColor = Colors[theme].tint;
  const iconColor = Colors[theme].icon;

  // 2. CORREÇÃO: Verificar o loading de TODOS os 4 contextos
  const isLoading = clientsLoading || productsLoading || appointmentsLoading || salesLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* 3. Mostrar o ScrollView ou o Loading */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContainer}
          >
            <ThemedText type="title" style={[styles.title, { marginTop: 16 }]}>Dashboard</ThemedText>
            
            <View style={styles.statsGrid}>
              <StatCard title="Vendas Hoje" value={formatCurrency(totalVendasDia)} color={tintColor} />
              <StatCard title="Vendas Mês" value={formatCurrency(totalVendasMes)} color={tintColor} />
            </View>
            
            <View style={styles.statsGrid}>
              <StatCard title="Clientes" value={clients.length} color={iconColor} />
              <StatCard title="Produtos" value={products.length} color={iconColor} />
              <StatCard title="Vendas (Qtd)" value={sales.length} color={iconColor} />
            </View>

            <ThemedText type="subtitle" style={styles.sectionTitle}>Próximos Agendamentos</ThemedText>
            {proximosAgendamentos.length > 0 ? (
              proximosAgendamentos.map(appt => (
                <AppointmentListItem 
                  key={appt._id} 
                  appointment={appt} 
                  // 4. CORREÇÃO DE SINTAXE (crases ``)
                  onPress={() => router.push(`/appointment/${appt._id}`)}
                />
              ))
            ) : (
              <ThemedText style={styles.emptyText}>Nenhum agendamento futuro.</ThemedText>
            )}

            <ThemedText type="subtitle" style={styles.sectionTitle}>Últimas Vendas</ThemedText>
            {ultimasVendas.length > 0 ? (
              ultimasVendas.map(sale => (
                <SaleListItem 
                  key={sale._id} 
                  sale={sale} 
                  // 5. CORREÇÃO DE SINTAXE (crases ``)
                  onPress={() => router.push(`/sale/${sale._id}`)}
                />
              ))
            ) : (
              <ThemedText style={styles.emptyText}>Nenhuma venda registrada.</ThemedText>
            )}
          </ScrollView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

// ... (estilos não mudam)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1, 
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  statValue: {
    fontSize: 28, 
    fontWeight: 'bold',
    lineHeight: 34,
    adjustsFontSizeToFit: true, 
    numberOfLines: 1,
  },
  statTitle: {
    fontSize: 16,
    marginTop: 4,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  }
});