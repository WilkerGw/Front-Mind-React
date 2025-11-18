import React, { useMemo, useState } from 'react';
import { StyleSheet, ScrollView, Dimensions, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSales } from '@/context/SalesContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text as TextSVG } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

// Formata R$ 1.200,50
const formatCurrency = (value: number) => {
  const safeValue = Number(value) || 0;
  return safeValue
    .toFixed(2)
    .replace('.', ',')
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
};

// Formata R$ 1200 (sem centavos para eixos)
const formatShortCurrency = (value: number) => {
  const safeValue = Number(value) || 0;
  return `R$ ${safeValue.toFixed(0)}`;
};

export default function RelatoriosScreen() {
  const { sales, isLoading } = useSales();
  const theme = useColorScheme() ?? 'light';
  const textColor = theme === 'dark' ? '#fff' : '#333'; 
  
  const [selectedPoint, setSelectedPoint] = useState<{ value: number; day: number; yearLabel: string } | null>(null);

  const chartConfig = {
    backgroundGradientFrom: theme === 'dark' ? '#1E1E1E' : '#fff',
    backgroundGradientTo: theme === 'dark' ? '#1E1E1E' : '#fff',
    color: (opacity = 1) => theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(100, 100, 100, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0, 
    propsForLabels: { fontSize: 10 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
  };

  // --- 1. Vendas Mensais (Histórico) ---
  const dadosMensais = useMemo(() => {
    if (sales.length === 0) return null;
    const agrupado: Record<string, number> = {};
    
    const vendasOrdenadas = [...sales].sort((a, b) => {
      const dateA = new Date(a.dataVenda).getTime();
      const dateB = new Date(b.dataVenda).getTime();
      return dateA - dateB;
    });

    vendasOrdenadas.forEach(venda => {
      if (venda.status !== 'Cancelado') {
        const d = new Date(venda.dataVenda);
        const mes = (d.getMonth() + 1).toString().padStart(2, '0');
        const ano = d.getFullYear().toString().slice(-2);
        const chave = `${mes}/${ano}`;
        
        const valor = Number(venda.valorTotal) || 0;
        agrupado[chave] = (agrupado[chave] || 0) + valor;
      }
    });

    const labels = Object.keys(agrupado);
    // AJUSTE: Arredondamos para 2 casas decimais para não aparecerem números gigantes em cima da barra
    const data = Object.values(agrupado).map(v => Number(v.toFixed(2)));
    
    const startIdx = Math.max(0, labels.length - 6);

    return {
      labels: labels.slice(startIdx),
      datasets: [{ data: data.slice(startIdx) }]
    };
  }, [sales]);

  // --- 2. Comparativo Diário ---
  const dadosComparativos = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const anoAnterior = anoAtual - 1;

    const dadosAnoAtual = new Array(31).fill(0);
    const dadosAnoAnterior = new Array(31).fill(0);

    sales.forEach(venda => {
      if (venda.status === 'Cancelado') return;
      
      const d = new Date(venda.dataVenda);
      if (isNaN(d.getTime())) return;

      if (d.getMonth() === mesAtual) {
        const dia = d.getDate() - 1;
        const valor = Number(venda.valorTotal) || 0;

        if (d.getFullYear() === anoAtual) {
          dadosAnoAtual[dia] += valor;
        } else if (d.getFullYear() === anoAnterior) {
          dadosAnoAnterior[dia] += valor;
        }
      }
    });

    const labels = Array.from({ length: 31 }, (_, i) => (i + 1).toString())
                        .map((dia, index) => (index % 5 === 0 || index === 30) ? dia : '');

    return {
      labels: labels,
      datasets: [
        {
          data: dadosAnoAtual,
          color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`, 
          strokeWidth: 3,
          yearLabel: "Este Ano" 
        },
        {
          data: dadosAnoAnterior,
          color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`, 
          strokeWidth: 2,
          yearLabel: "Ano Anterior"
        }
      ],
      legend: ["Atual", "Anterior"]
    };
  }, [sales]);

  if (isLoading) {
    return (
      <ThemedView style={styles.loading}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.headerTitle}>Performance de Vendas</ThemedText>
        
        {/* GRÁFICO 1: BARRAS (COM VALORES) */}
        <View style={styles.chartContainer}>
          <ThemedText type="subtitle" style={styles.chartTitle}>Faturamento Mensal</ThemedText>
          {dadosMensais ? (
            <BarChart
              data={dadosMensais}
              width={screenWidth - 32}
              height={240}
              yAxisLabel=""
              yAxisSuffix=""
              formatYLabel={formatShortCurrency} 
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              style={styles.chart}
              
              // CORREÇÃO AQUI: Ativamos novamente os valores em cima das barras
              showValuesOnTopOfBars={true} 
            />
          ) : (
            <ThemedText style={styles.emptyText}>Nenhuma venda registrada.</ThemedText>
          )}
        </View>

        {/* GRÁFICO 2: LINHAS (Comparativo) */}
        <View style={styles.chartContainer}>
          <ThemedText type="subtitle" style={styles.chartTitle}>
            Comparativo Diário ({new Date().toLocaleString('pt-BR', { month: 'long' })})
          </ThemedText>
          
          <View style={styles.legendContainer}>
             <View style={[styles.dot, { backgroundColor: 'rgba(0, 200, 83, 1)' }]} />
             <ThemedText style={styles.legendText}>Este Ano</ThemedText>
             <View style={[styles.dot, { backgroundColor: 'rgba(255, 87, 34, 1)' }]} />
             <ThemedText style={styles.legendText}>Ano Anterior</ThemedText>
          </View>

          {selectedPoint && (
            <View style={styles.detailCard}>
              <View>
                <ThemedText style={styles.detailLabel}>Dia {selectedPoint.day}</ThemedText>
                <ThemedText style={styles.detailSub}>{selectedPoint.yearLabel}</ThemedText>
              </View>
              <ThemedText type="title" style={{ color: Colors[theme].tint }}>
                 {formatCurrency(selectedPoint.value)}
              </ThemedText>
              <TouchableOpacity onPress={() => setSelectedPoint(null)} style={styles.closeBtn}>
                <IconSymbol name="xmark.circle.fill" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}

          <LineChart
            data={dadosComparativos}
            width={screenWidth - 32}
            height={260}
            yAxisLabel=""
            yAxisSuffix=""
            formatYLabel={formatShortCurrency}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            
            renderDotContent={({ x, y, index, indexData }) => {
              if (!indexData || isNaN(indexData) || indexData === 0) return null;

              return (
                <TextSVG
                  key={index}
                  x={x}
                  y={y - 10}
                  fill={textColor}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {indexData.toFixed(0)}
                </TextSVG>
              );
            }}

            onDataPointClick={({ value, index, dataset }) => {
              const yearLabel = (dataset as any).yearLabel || (dataset.color ? "Ano Anterior" : "Este Ano");
              setSelectedPoint({
                value,
                day: index + 1,
                yearLabel
              });
            }}
          />
        </View>
        
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerTitle: { marginBottom: 20, textAlign: 'center' },
  chartContainer: {
    marginBottom: 30,
    backgroundColor: 'rgba(150, 150, 150, 0.08)', 
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  chartTitle: { marginBottom: 8, marginTop: 4, fontSize: 18 },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 0, 
  },
  emptyText: { marginVertical: 20, opacity: 0.6 },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, marginRight: 10, opacity: 0.8 },
  
  detailCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    width: '100%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailLabel: { fontSize: 16, fontWeight: 'bold' },
  detailSub: { fontSize: 12, opacity: 0.6 },
  closeBtn: { padding: 4 },
  hintText: { fontSize: 12, opacity: 0.5, fontStyle: 'italic', marginBottom: 10 }
});