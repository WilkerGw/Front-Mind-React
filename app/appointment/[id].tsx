import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, ActivityIndicator, View, TouchableOpacity, Switch } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { useAppointments, StatusAgendamento } from '@/context/AppointmentsContext';
import { useClients } from '@/context/ClientsContext';

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';

  const { getAppointmentById, updateAppointment, deleteAppointment, isLoading: apptLoading } = useAppointments();
  const { getClientById, isLoading: clientsLoading } = useClients();

  const appointment = getAppointmentById(id as string);
  const client = appointment?.clientId ? getClientById(appointment.clientId) : null;

  const clientName = client?.fullName || appointment?.name || 'Cliente não identificado';
  const clientPhone = client?.phone || appointment?.telephone || 'Telefone não informado';

  const isLoading = apptLoading || clientsLoading;

  // Estado local para feedback visual imediato (opcional, mas melhora a UX)
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  if (!appointment) {
    return (
      <ThemedView style={styles.centered}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#FF3B30" />
        <ThemedText type="title" style={{ marginTop: 16 }}>Agendamento não encontrado</ThemedText>
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.back()}>
            <ThemedText>Voltar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // --- LÓGICA DE ATUALIZAÇÃO ---

  const handleStatusChange = async (newStatus: StatusAgendamento) => {
    setIsUpdating(true);
    try {
      // Se mudar para "Marcado" ou "Cancelado", resetamos a compra para false por segurança
      const shouldResetPurchase = newStatus !== 'Concluído';
      await updateAppointment(appointment._id, { 
        status: newStatus,
        madePurchase: shouldResetPurchase ? false : appointment.madePurchase 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePurchaseToggle = async (value: boolean) => {
    setIsUpdating(true);
    try {
      await updateAppointment(appointment._id, { madePurchase: value });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir",
      "Deseja realmente excluir?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            await deleteAppointment(appointment._id);
            router.back();
        }}
      ]
    );
  };

  const formattedDate = new Date(appointment.date).toLocaleDateString('pt-BR');
  const formattedTime = new Date(appointment.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Detalhes' }} />
      
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Cabeçalho */}
        <View style={[styles.card, { backgroundColor: Colors[theme].background }]}>
          <View style={styles.headerRow}>
             <IconSymbol name="calendar" size={24} color={Colors[theme].tint} />
             <ThemedText type="subtitle" style={{ marginLeft: 8 }}>{formattedDate} às {formattedTime}</ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <ThemedText style={styles.statusText}>{appointment.status.toUpperCase()}</ThemedText>
          </View>
        </View>

        {/* Nova Seção: GESTÃO DO ATENDIMENTO */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Gestão do Atendimento</ThemedText>
          <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#333' : '#fff' }]}>
            
            <ThemedText style={{ marginBottom: 10, color: '#888' }}>Alterar situação:</ThemedText>
            
            {/* Botões de Status Rápido */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity 
                style={[styles.actionButton, appointment.status === 'Concluído' && styles.activeGreen]} 
                onPress={() => handleStatusChange('Concluído')}
              >
                <IconSymbol name="checkmark.circle.fill" size={20} color={appointment.status === 'Concluído' ? '#fff' : '#34C759'} />
                <ThemedText style={[styles.actionText, appointment.status === 'Concluído' && { color: '#fff' }]}>Compareceu</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, appointment.status === 'Cancelado' && styles.activeRed]}
                onPress={() => handleStatusChange('Cancelado')}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color={appointment.status === 'Cancelado' ? '#fff' : '#FF3B30'} />
                <ThemedText style={[styles.actionText, appointment.status === 'Cancelado' && { color: '#fff' }]}>Faltou</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Toggle de Compra (Aparece apenas se Concluído) */}
            {appointment.status === 'Concluído' && (
              <View style={styles.purchaseRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                   <IconSymbol name="cart.fill" size={20} color={Colors[theme].text} />
                   <ThemedText type="defaultSemiBold" style={{ marginLeft: 8 }}>Venda Realizada?</ThemedText>
                </View>
                <Switch 
                  value={appointment.madePurchase || false}
                  onValueChange={handlePurchaseToggle}
                  trackColor={{ false: "#767577", true: Colors[theme].tint }}
                />
              </View>
            )}
          </View>
        </View>

        {/* Dados do Cliente */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Cliente</ThemedText>
          <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#333' : '#f9f9f9' }]}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>{clientName}</ThemedText>
            <ThemedText style={{ marginTop: 4, color: '#666' }}>{clientPhone}</ThemedText>
          </View>
        </View>

        {/* Botões Finais */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: Colors[theme].tint }]} 
            onPress={() => router.push(`/edit-appointment?id=${appointment._id}`)}
          >
            <ThemedText style={styles.buttonText}>Editar Dados</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonDestructive]} onPress={handleDelete}>
            <ThemedText style={styles.buttonText}>Excluir Agendamento</ThemedText>
          </TouchableOpacity>
        </View>

      </ScrollView>
      
      {/* Loading Overlay se estiver salvando */}
      {isUpdating && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
    </ThemedView>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Confirmado': return '#34C759';
    case 'Cancelado': return '#FF3B30';
    case 'Concluído': return '#8E8E93';
    default: return '#007AFF';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { padding: 16 },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  section: { marginTop: 20 },
  sectionTitle: { marginBottom: 8, marginLeft: 4 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  
  // Estilos novos para gestão
  quickActionsRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', gap: 8
  },
  activeGreen: { backgroundColor: '#34C759', borderColor: '#34C759' },
  activeRed: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  actionText: { fontWeight: '600', color: '#555' },
  
  purchaseRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#eee'
  },

  actionsContainer: { marginTop: 32, gap: 12 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonSecondary: { marginTop: 20, padding: 12 },
  buttonDestructive: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  
  overlayLoading: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 20
  }
});