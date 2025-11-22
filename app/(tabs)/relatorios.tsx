import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Platform,
  Text,
  TouchableOpacity
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassView } from '@/components/ui/GlassView';

// Contextos
import { useSales } from '@/context/SalesContext';
import { useAppointments } from '@/context/AppointmentsContext';
import { useProducts } from '@/context/ProductsContext';
import { useClients } from '@/context/ClientsContext';

const screenWidth = Dimensions.get('window').width;

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function RelatoriosScreen() {
  const theme = useColorScheme() ?? 'light';
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estado para o mês e dia selecionado
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const { sales, refreshSales, isLoading: salesLoading } = useSales();
  const { refreshAppointments } = useAppointments();
  const { refreshProducts } = useProducts();
  const { refreshClients } = useClients();

  // --- FUNÇÃO DE ATUALIZAR ---
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshSales(),
        refreshAppointments(),
        refreshProducts(),
        refreshClients(),
      ]);
    } catch (error) {
      console.error("Erro ao atualizar relatórios", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSales, refreshAppointments, refreshProducts, refreshClients]);

  // --- CÁLCULOS (KPIs Comparativos do Mês) ---
  const kpiData = useMemo(() => {
    const currentYear = selectedYear;
    const lastYear = selectedYear - 1;
    const monthLabel = MONTH_NAMES[selectedMonth];

    // Vendas Mês Selecionado (Este Ano)
    const currentMonthTotal = sales
      .filter(s => {
        const d = new Date(s.dataVenda);
        return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

    // Vendas Mesmo Mês (Ano Passado)
    const lastYearMonthTotal = sales
      .filter(s => {
        const d = new Date(s.dataVenda);
        return d.getMonth() === selectedMonth && d.getFullYear() === lastYear;
      })
      .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

    return {
      monthLabel,
      currentYear,
      lastYear,
      currentMonthTotal,
      lastYearMonthTotal
    };
  }, [sales, selectedMonth, selectedYear]);

  // --- COMPARATIVO DO DIA ESPECÍFICO ---
  const dayComparisonData = useMemo(() => {
    const currentYear = selectedYear;
    const lastYear = selectedYear - 1;

    // Vendas do Dia Selecionado (Este Ano)
    const currentDayTotal = sales
      .filter(s => {
        const d = new Date(s.dataVenda);
        return d.getDate() === selectedDay &&
          d.getMonth() === selectedMonth &&
          d.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

    // Vendas do Mesmo Dia (Ano Passado)
    const lastYearDayTotal = sales
      .filter(s => {
        const d = new Date(s.dataVenda);
        return d.getDate() === selectedDay &&
          d.getMonth() === selectedMonth &&
          d.getFullYear() === lastYear;
      })
      .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

    const difference = currentDayTotal - lastYearDayTotal;
    const percentageChange = lastYearDayTotal > 0
      ? ((difference / lastYearDayTotal) * 100).toFixed(1)
      : (currentDayTotal > 0 ? 100 : 0);

    return {
      currentDayTotal,
      lastYearDayTotal,
      difference,
      percentageChange
    };
  }, [sales, selectedDay, selectedMonth, selectedYear]);

  // --- DADOS DOS GRÁFICOS ---

  // Comparativo Diário (Linha)
  const comparisonData = useMemo(() => {
    const currentYear = selectedYear;
    const lastYear = selectedYear - 1;
    const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const dataCurrentYear = days.map(day =>
      sales.filter(s => {
        const d = new Date(s.dataVenda);
        return d.getDate() === day && d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
      }).reduce((acc, curr) => acc + (curr.valorTotal || 0), 0)
    );

    const dataLastYear = days.map(day =>
      sales.filter(s => {
        const d = new Date(s.dataVenda);
        return d.getDate() === day && d.getMonth() === selectedMonth && d.getFullYear() === lastYear;
      }).reduce((acc, curr) => acc + (curr.valorTotal || 0), 0)
    );

    const labels = days.map(d => d % 5 === 0 || d === 1 ? String(d) : '');

    return {
      labels,
      datasets: [
        {
          data: dataCurrentYear,
          color: (opacity = 1) => theme === 'dark'
            ? `rgba(96, 165, 250, ${opacity})`
            : `rgba(37, 99, 235, ${opacity})`,
          strokeWidth: 3,
          legend: `${currentYear}`
        },
        {
          data: dataLastYear,
          color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
          strokeWidth: 2,
          legend: `${lastYear}`
        }
      ],
      legend: [`${currentYear}`, `${lastYear}`]
    };
  }, [sales, selectedMonth, selectedYear, theme]);

  // Gráfico de Pizza
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach(s => {
      const metodo = s.pagamento?.metodoPagamento || 'Outro';
      counts[metodo] = (counts[metodo] || 0) + 1;
    });

    const colors = [
      Colors[theme].tint,
      '#60A5FA',
      '#93C5FD',
      '#BFDBFE',
      '#DBEAFE'
    ];

    return Object.keys(counts).map((key, index) => ({
      name: key,
      population: counts[key],
      color: colors[index % colors.length],
      legendFontColor: Colors[theme].text,
      legendFontSize: 12
    }));
  }, [sales, theme]);

  // --- NAVEGAÇÃO DE MESES ---
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    // Ajusta o dia se o novo mês tiver menos dias
    const daysInNewMonth = new Date(
      selectedMonth === 0 ? selectedYear - 1 : selectedYear,
      selectedMonth === 0 ? 11 : selectedMonth,
      0
    ).getDate();
    if (selectedDay > daysInNewMonth) {
      setSelectedDay(daysInNewMonth);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    // Ajusta o dia se o novo mês tiver menos dias
    const daysInNewMonth = new Date(
      selectedMonth === 11 ? selectedYear + 1 : selectedYear,
      selectedMonth === 11 ? 1 : selectedMonth + 2,
      0
    ).getDate();
    if (selectedDay > daysInNewMonth) {
      setSelectedDay(daysInNewMonth);
    }
  };

  // --- NAVEGAÇÃO DE DIAS ---
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const handlePreviousDay = () => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDay < daysInSelectedMonth) {
      setSelectedDay(selectedDay + 1);
    }
  };

  // --- RENDERIZAÇÃO ---

  if (salesLoading && !isRefreshing) {
    return (
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[theme].tint} />
        </View>
      </ScreenBackground>
    );
  }

  const performanceColor = kpiData.currentMonthTotal >= kpiData.lastYearMonthTotal
    ? '#10B981'
    : Colors[theme].tint;

  const dayPerformanceColor = dayComparisonData.currentDayTotal >= dayComparisonData.lastYearDayTotal
    ? '#10B981'
    : '#EF4444';

  return (
    <ScreenBackground>

      {/* Header com Glass Effect */}
      <GlassView style={styles.header} intensity={80}>
        <ThemedText type="title">Relatórios</ThemedText>
        <View style={[styles.headerIcon, { backgroundColor: Colors[theme].tint + '20' }]}>
          <IconSymbol name="chart.bar.fill" size={24} color={Colors[theme].tint} />
        </View>
      </GlassView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors[theme].tint} />
        }
      >
        {/* Seletor de Mês */}
        <GlassView style={styles.monthSelector} delay={50}>
          <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthButton}>
            <IconSymbol name="chevron.left" size={20} color={Colors[theme].tint} />
          </TouchableOpacity>

          <View style={styles.monthLabel}>
            <ThemedText type="subtitle" style={{ fontSize: 16 }}>
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </ThemedText>
          </View>

          <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
            <IconSymbol name="chevron.right" size={20} color={Colors[theme].tint} />
          </TouchableOpacity>
        </GlassView>

        {/* Seletor de Dia */}
        <GlassView style={styles.daySelector} delay={75}>
          <TouchableOpacity
            onPress={handlePreviousDay}
            style={[styles.dayButton, selectedDay === 1 && { opacity: 0.3 }]}
            disabled={selectedDay === 1}
          >
            <IconSymbol name="chevron.left" size={18} color={Colors[theme].tint} />
          </TouchableOpacity>

          <View style={styles.dayLabel}>
            <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>DIA</ThemedText>
            <ThemedText type="title" style={{ fontSize: 24 }}>
              {selectedDay.toString().padStart(2, '0')}
            </ThemedText>
          </View>

          <TouchableOpacity
            onPress={handleNextDay}
            style={[styles.dayButton, selectedDay === daysInSelectedMonth && { opacity: 0.3 }]}
            disabled={selectedDay === daysInSelectedMonth}
          >
            <IconSymbol name="chevron.right" size={18} color={Colors[theme].tint} />
          </TouchableOpacity>
        </GlassView>

        {/* Comparativo do Dia Específico */}
        <ThemedText type="subtitle" style={[styles.sectionTitle, { marginTop: 8 }]}>
          Comparativo do Dia {selectedDay}/{selectedMonth + 1}
        </ThemedText>

        <View style={styles.statsGrid}>
          <GlassView style={styles.statCard} delay={100}>
            <ThemedText style={styles.statLabel}>{selectedYear}</ThemedText>
            <ThemedText type="title" style={{ color: dayPerformanceColor, fontSize: 22 }}>
              R$ {dayComparisonData.currentDayTotal.toFixed(2)}
            </ThemedText>
          </GlassView>

          <GlassView style={styles.statCard} delay={150}>
            <ThemedText style={styles.statLabel}>{selectedYear - 1}</ThemedText>
            <ThemedText type="title" style={{ color: Colors[theme].icon, fontSize: 22 }}>
              R$ {dayComparisonData.lastYearDayTotal.toFixed(2)}
            </ThemedText>
          </GlassView>
        </View>

        {/* Card de Diferença */}
        <GlassView style={styles.differenceCard} delay={175}>
          <View style={styles.differenceContent}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>
                DIFERENÇA
              </ThemedText>
              <ThemedText type="subtitle" style={{ color: dayPerformanceColor }}>
                R$ {dayComparisonData.difference.toFixed(2)}
              </ThemedText>
            </View>
            <View style={[styles.percentageBadge, { backgroundColor: dayPerformanceColor + '20' }]}>
              <IconSymbol
                name={dayComparisonData.difference >= 0 ? "arrow.up" : "arrow.down"}
                size={16}
                color={dayPerformanceColor}
              />
              <ThemedText style={{ color: dayPerformanceColor, fontSize: 16, fontWeight: 'bold', marginLeft: 4 }}>
                {dayComparisonData.percentageChange}%
              </ThemedText>
            </View>
          </View>
        </GlassView>

        {/* Totais do Mês */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Totais de {MONTH_NAMES[selectedMonth]}
        </ThemedText>

        <View style={styles.statsGrid}>
          <GlassView style={styles.statCard} delay={200}>
            <ThemedText style={styles.statLabel}>
              {kpiData.monthLabel}/{kpiData.currentYear}
            </ThemedText>
            <ThemedText type="title" style={{ color: performanceColor, fontSize: 22 }}>
              R$ {kpiData.currentMonthTotal.toFixed(2)}
            </ThemedText>
          </GlassView>

          <GlassView style={styles.statCard} delay={225}>
            <ThemedText style={styles.statLabel}>
              {kpiData.monthLabel}/{kpiData.lastYear}
            </ThemedText>
            <ThemedText type="title" style={{ color: Colors[theme].icon, fontSize: 22 }}>
              R$ {kpiData.lastYearMonthTotal.toFixed(2)}
            </ThemedText>
          </GlassView>
        </View>

        {/* Gráfico Comparativo */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Evolução Diária (Comparativo YoY)
        </ThemedText>

        {sales.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            <GlassView style={styles.chartWrapper} delay={250}>
              <LineChart
                data={comparisonData}
                width={Math.max(screenWidth + 20, comparisonData.labels.length * 15)}
                height={280}
                yAxisLabel="R$"
                yAxisSuffix=""
                fromZero
                chartConfig={{
                  backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                  backgroundGradientFrom: theme === 'dark' ? '#1E293B' : '#F8FAFC',
                  backgroundGradientTo: theme === 'dark' ? '#0F172A' : '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => theme === 'dark'
                    ? `rgba(96, 165, 250, ${opacity})`
                    : `rgba(37, 99, 235, ${opacity})`,
                  labelColor: (opacity = 1) => theme === 'dark'
                    ? `rgba(255, 255, 255, ${opacity * 0.8})`
                    : `rgba(0, 0, 0, ${opacity * 0.7})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "4", strokeWidth: "2" },
                  propsForBackgroundLines: {
                    stroke: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    strokeDasharray: ""
                  }
                }}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                renderDotContent={({ x, y, index, indexData }) => {
                  // Mostra valores apenas para vendas > 0
                  if (indexData === 0) return null;
                  return (
                    <Text
                      key={`dot-${index}`}
                      style={{
                        position: 'absolute',
                        top: y - 20,
                        left: x - 15,
                        fontSize: 9,
                        fontWeight: 'bold',
                        color: theme === 'dark' ? '#60A5FA' : '#2563EB',
                      }}
                    >
                      R${indexData.toFixed(0)}
                    </Text>
                  );
                }}
              />
            </GlassView>
          </ScrollView>
        ) : (
          <GlassView style={styles.emptyChart}>
            <IconSymbol name="chart.bar.fill" size={32} color={Colors[theme].icon} style={{ opacity: 0.3, marginBottom: 8 }} />
            <ThemedText style={{ opacity: 0.5 }}>Sem dados de vendas para exibir.</ThemedText>
          </GlassView>
        )}

        {/* Gráfico de Pagamentos */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Métodos de Pagamento</ThemedText>

        {pieData.length > 0 ? (
          <GlassView style={styles.chartContainer} delay={275}>
            <PieChart
              data={pieData}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                decimalPlaces: 0,
                labelColor: (opacity = 1) => Colors[theme].text,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[0, 0]}
              absolute
            />
          </GlassView>
        ) : (
          <GlassView style={styles.emptyChart}>
            <IconSymbol name="cart.fill" size={32} color={Colors[theme].icon} style={{ opacity: 0.3, marginBottom: 8 }} />
            <ThemedText style={{ opacity: 0.5 }}>Sem dados de pagamento.</ThemedText>
          </GlassView>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: {
    flex: 1,
    alignItems: 'center',
  },
  daySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabel: {
    flex: 1,
    alignItems: 'center',
  },
  differenceCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  differenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percentageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  chartWrapper: {
    borderRadius: 16,
    padding: 16,
    paddingTop: 24,
    minWidth: screenWidth - 40,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyChart: {
    height: 150,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  }
});