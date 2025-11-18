import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TextInput, View, Platform } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppointments } from '@/context/AppointmentsContext';
import { AppointmentListItem } from '@/components/management/AppointmentListItem';
import { useRouter } from 'expo-router';
import { useClients } from '@/context/ClientsContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ModernButton } from '@/components/ui/ModernButton'; // Botão moderno para o "+"

export default function AgendamentosScreen() {
  const { appointments, isLoading: appointmentsLoading } = useAppointments();
  const { clients, isLoading: clientsLoading } = useClients();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();
  
  const handleAppointmentPress = (appointmentId: string) => {
    router.push(`/appointment/${appointmentId}`);
  };

  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    const lowerQuery = searchQuery.toLowerCase();
    return appointments.filter((appt) => {
      let clientName = '';
      if (appt.clientId) {
        const client = clients.find((c) => c._id === appt.clientId);
        clientName = client ? client.fullName : '';
      } else if (appt.name) {
        clientName = appt.name;
      }
      return clientName.toLowerCase().includes(lowerQuery);
    });
  }, [appointments, clients, searchQuery]);

  if (appointmentsLoading || clientsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[theme].background }]}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      
      {/* Header Personalizado com Efeito de "Vidro" fake (cor sólida limpa) */}
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <View style={styles.titleRow}>
          <ThemedText type="title">Agendamentos</ThemedText>
          {/* Botão flutuante pequeno ou ação rápida */}
          <ModernButton 
            title="+" 
            onPress={() => router.push('/add-appointment')} 
            style={{ width: 40, height: 40, borderRadius: 20, paddingHorizontal: 0 }}
          />
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9' }]}>
          <IconSymbol size={20} name="magnifyingglass" color={Colors[theme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Buscar cliente..."
            placeholderTextColor={Colors[theme].icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item._id} 
        renderItem={({ item }) => (
          <AppointmentListItem
            appointment={item}
            onPress={() => handleAppointmentPress(item._id)} 
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
             <IconSymbol name="calendar" size={48} color={Colors[theme].icon} style={{ opacity: 0.3, marginBottom: 16 }} />
             <ThemedText style={{ opacity: 0.6 }}>Nenhum agendamento encontrado.</ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40, // Padding para a barra de status
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    // Sombra no header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12, // Mais arredondado
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    height: '100%',
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
    gap: 4, // Espaçamento entre itens (se suportado na sua versão React Native) ou use margin no item
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
});