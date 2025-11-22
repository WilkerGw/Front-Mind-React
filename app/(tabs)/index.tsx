import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Platform,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { ScreenBackground } from '@/components/ui/ScreenBackground';

// Importação dos Contextos
import { useClients } from '@/context/ClientsContext';
import { useAppointments } from '@/context/AppointmentsContext';
import { useSales } from '@/context/SalesContext';
import { useProducts } from '@/context/ProductsContext';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { toggleTheme } = useTheme(); // Hook do tema
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dados dos Contextos
  const { clients, refreshClients } = useClients();
  const { appointments, refreshAppointments } = useAppointments();
  const { sales, refreshSales } = useSales();
  const { products, refreshProducts } = useProducts();

  // --- LÓGICA DE DADOS (KPIs) ---

  const today = new Date();

  // 1. Vendas de Hoje
  const salesToday = sales.filter(sale => {
    const saleDate = new Date(sale.dataVenda);
    return saleDate.getDate() === today.getDate() &&
      saleDate.getMonth() === today.getMonth() &&
      saleDate.getFullYear() === today.getFullYear();
  });
  const totalRevenueToday = salesToday.reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

  // 2. Vendas do Mês
  const salesMonth = sales.filter(sale => {
    const saleDate = new Date(sale.dataVenda);
    return saleDate.getMonth() === today.getMonth() &&
      saleDate.getFullYear() === today.getFullYear();
  });
  const totalRevenueMonth = salesMonth.reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

  // 3. Agendamentos Pendentes
  const pendingAppointmentsList = appointments.filter(a =>
    (a.status === 'Marcado' || a.status === 'Confirmado') && new Date(a.date) >= new Date(new Date().setHours(0, 0, 0, 0))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextAppointments = pendingAppointmentsList.slice(0, 3);
  const pendingCount = pendingAppointmentsList.length;

  // 4. Produtos com Stock Baixo
  const lowStockCount = products.filter(p => p.estoque < 3).length;

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshClients(),
        refreshAppointments(),
        refreshSales(),
        refreshProducts()
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshClients, refreshAppointments, refreshSales, refreshProducts]);

  // --- COMPONENTES INTERNOS DE UI ---

  const StatCard = ({ title, value, icon, color, subtitle, delay = 0 }: any) => (
    <GlassView style={styles.statCard} delay={delay}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <IconSymbol name={icon} size={24} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </ThemedText>
        <ThemedText style={{ color: theme.icon, fontSize: 12 }}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText style={{ color: color, fontSize: 10, marginTop: 2, fontWeight: '600' }}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </GlassView>
  );

  const ActionButton = ({ title, icon, route, color, delay = 0 }: any) => (
    <TouchableOpacity
      onPress={() => router.push(route)}
      activeOpacity={0.7}
      style={{ width: (width - 40 - 12) / 2 }}
    >
      <GlassView style={styles.actionButton} delay={delay}>
        <View style={[styles.actionIconCircle, { backgroundColor: color }]}>
          <IconSymbol name={icon} size={24} color="#FFF" />
        </View>
        <ThemedText style={styles.actionText}>{title}</ThemedText>
      </GlassView>
    </TouchableOpacity>
  );

  return (
    <ScreenBackground edges={['top']}>
      {/* Header Fixo */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 700 }}
        style={styles.header}
      >
        <View>
          <ThemedText style={styles.greeting}>Olá, Bem-vindo!</ThemedText>
          <ThemedText type="title" style={styles.title}>Minha Ótica</ThemedText>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: theme.tint + '20' }]}
            onPress={toggleTheme}
          >
            <IconSymbol
              name={colorScheme === 'dark' ? 'sun.max.fill' : 'moon.fill'}
              size={20}
              color={theme.tint}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.tint + '20' }]}>
            <IconSymbol name="person.fill" size={20} color={theme.tint} />
          </TouchableOpacity>
        </View>
      </MotiView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.tint} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Cards de Resumo (KPIs) */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Resumo Financeiro</ThemedText>

        <View style={styles.statsContainer}>
          <StatCard
            title="Vendas Hoje"
            value={`R$ ${totalRevenueToday.toFixed(2)}`}
            icon="cart.fill"
            color={theme.tint}
            subtitle={`${salesToday.length} hoje`}
            delay={100}
          />
          <StatCard
            title="Vendas Mês"
            value={`R$ ${totalRevenueMonth.toFixed(2)}`}
            icon="chart.bar.fill"
            color={theme.tint}
            subtitle="Acumulado"
            delay={200}
          />
        </View>

        <View style={[styles.statsContainer, { marginTop: 10 }]}>
          <StatCard
            title="Agendamentos"
            value={pendingCount.toString()}
            icon="calendar"
            color={theme.tint}
            subtitle="Pendentes"
            delay={300}
          />
          <StatCard
            title="Stock Baixo"
            value={lowStockCount.toString()}
            icon="exclamationmark.triangle.fill"
            color={theme.tint}
            subtitle="Reposição"
            delay={400}
          />
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Acesso Rápido</ThemedText>

        <View style={styles.actionsGrid}>
          <ActionButton
            title="Novo Cliente"
            icon="person.badge.plus"
            route="/add-client"
            color={theme.tint}
            delay={500}
          />
          <ActionButton
            title="Nova Venda"
            icon="cart.badge.plus"
            route="/add-sale"
            color={theme.tint}
            delay={600}
          />
          <ActionButton
            title="Agendar"
            icon="calendar.badge.plus"
            route="/add-appointment"
            color={theme.tint}
            delay={700}
          />
          <ActionButton
            title="Produtos"
            icon="bag.badge.plus"
            route="/add-product"
            color={theme.tint}
            delay={800}
          />
        </View>

        {/* Próximos Agendamentos */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Próximos Agendamentos</ThemedText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/agendamentos')}>
            <ThemedText style={{ color: theme.tint, fontSize: 14 }}>Ver todos</ThemedText>
          </TouchableOpacity>
        </View>

        {nextAppointments.length === 0 ? (
          <GlassView style={styles.emptyCard} delay={900}>
            <ThemedText style={{ opacity: 0.5 }}>Sem agendamentos próximos.</ThemedText>
          </GlassView>
        ) : (
          nextAppointments.map((appt, index) => {
            const clientName = appt.name || clients.find(c => c._id === appt.clientId)?.fullName || 'Cliente Desconhecido';
            return (
              <TouchableOpacity
                key={appt._id}
                onPress={() => router.push(`/appointment/${appt._id}`)}
                activeOpacity={0.8}
              >
                <GlassView style={styles.appointmentCard} delay={900 + (index * 100)}>
                  <View style={[styles.dateBadge, { backgroundColor: theme.tint + '15' }]}>
                    <ThemedText style={{ fontWeight: 'bold', color: theme.tint, fontSize: 16 }}>
                      {new Date(appt.date).getDate()}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 10, color: theme.tint }}>
                      {new Date(appt.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold">{clientName}</ThemedText>
                    <ThemedText style={{ opacity: 0.6, fontSize: 13 }}>
                      {appt.tipo} • {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={theme.icon} style={{ opacity: 0.5 }} />
                </GlassView>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  greeting: {
    fontSize: 14,
    opacity: 0.6,
  },
  title: {
    fontSize: 28, // Aumentei um pouco
    fontWeight: 'bold',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    marginTop: 24,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1.6, // Mais retangular (wider) para economizar espaço vertical
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  // Appointments
  appointmentCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 14,
  },
  dateBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.3)',
  }
});