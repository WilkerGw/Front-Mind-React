import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, ActivityIndicator, View, TouchableOpacity, Switch, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassView } from '@/components/ui/GlassView';
import { ModernButton } from '@/components/ui/ModernButton';

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

  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors[theme].tint} />
        </View>
      </ScreenBackground>
    );
  }

  if (!appointment) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#FF3B30" />
          <ThemedText type="title" style={{ marginTop: 16 }}>Agendamento não encontrado</ThemedText>
          <ModernButton title="Voltar" onPress={() => router.back()} style={{ marginTop: 24 }} />
        </View>
      </ScreenBackground>
    );
  }

  // --- LÓGICA DE ATUALIZAÇÃO ---

  const handleStatusChange = async (newStatus: StatusAgendamento) => {
    setIsUpdating(true);
    try {
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
        {
          text: "Excluir", style: "destructive", onPress: async () => {
            await deleteAppointment(appointment._id);
            router.back();
          }
        }
      ]
    );
  };

  const formattedDate = new Date(appointment.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = new Date(appointment.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return '#10B981';
      case 'Cancelado': return '#EF4444';
      case 'Faltou': return '#EF4444';
      default: return Colors[theme].tint;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluído': return 'checkmark.circle.fill';
      case 'Cancelado': return 'xmark.circle.fill';
      case 'Faltou': return 'xmark.circle.fill';
      default: return 'clock.fill';
    }
  };

  return (
    <ScreenBackground>
      <Stack.Screen options={{ title: 'Detalhes', headerShown: false }} />

      {/* Header */}
      <GlassView style={styles.header} intensity={80}>
        <View style={styles.headerContent}>
          <ModernButton
            title=""
            onPress={() => router.back()}
            style={styles.backButton}
            icon={<IconSymbol name="chevron.left" size={20} color={Colors[theme].tint} />}
          />
          <ThemedText type="title">Detalhes</ThemedText>
          <View style={{ width: 42 }} />
        </View>
      </GlassView>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Data e Status */}
        <GlassView style={styles.section} delay={50}>
          <View style={styles.dateStatusContainer}>
            <View style={styles.dateRow}>
              <IconSymbol name="calendar" size={20} color={Colors[theme].tint} />
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                {formattedDate} às {formattedTime}
              </ThemedText>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(appointment.status)}20` }]}>
              <IconSymbol name={getStatusIcon(appointment.status)} size={16} color={getStatusColor(appointment.status)} />
              <ThemedText style={{ color: getStatusColor(appointment.status), fontWeight: 'bold', marginLeft: 6 }}>
                {appointment.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        </GlassView>

        {/* Gestão do Atendimento */}
        <GlassView style={styles.section} delay={75}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Gestão do Atendimento
          </ThemedText>

          <ThemedText style={styles.label}>Alterar situação:</ThemedText>

          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                { borderColor: '#10B981' },
                appointment.status === 'Concluído' && styles.statusButtonActiveGreen
              ]}
              onPress={() => handleStatusChange('Concluído')}
              disabled={isUpdating}
            >
              <IconSymbol
                name="checkmark.circle.fill"
                size={20}
                color={appointment.status === 'Concluído' ? '#fff' : '#10B981'}
              />
              <ThemedText style={[
                styles.statusButtonText,
                appointment.status === 'Concluído' && { color: '#fff' }
              ]}>
                Compareceu
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                { borderColor: '#EF4444' },
                (appointment.status === 'Cancelado' || appointment.status === 'Faltou') && styles.statusButtonActiveRed
              ]}
              onPress={() => handleStatusChange('Cancelado')}
              disabled={isUpdating}
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={20}
                color={(appointment.status === 'Cancelado' || appointment.status === 'Faltou') ? '#fff' : '#EF4444'}
              />
              <ThemedText style={[
                styles.statusButtonText,
                (appointment.status === 'Cancelado' || appointment.status === 'Faltou') && { color: '#fff' }
              ]}>
                Faltou
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Toggle de Venda (sempre visível, mas msg diferente) */}
          <View style={styles.switchRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <IconSymbol name="cart.fill" size={18} color={Colors[theme].text} />
              <ThemedText style={{ marginLeft: 8 }}>Venda Realizada?</ThemedText>
            </View>
            <Switch
              value={appointment.madePurchase || false}
              onValueChange={handlePurchaseToggle}
              trackColor={{ false: '#767577', true: '#60A5FA' }}
              thumbColor={(appointment.madePurchase || false) ? '#2563EB' : '#f4f3f4'}
              disabled={isUpdating}
            />
          </View>
        </GlassView>

        {/* Cliente */}
        <GlassView style={styles.section} delay={100}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <IconSymbol name="person.fill" size={20} color={Colors[theme].tint} /> Cliente
          </ThemedText>

          <View style={styles.clientCard}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
              {clientName}
            </ThemedText>
            <ThemedText style={{ opacity: 0.7, fontSize: 14, marginTop: 4 }}>
              {clientPhone}
            </ThemedText>
          </View>
        </GlassView>

        {/* Botões de Ação */}
        <ModernButton
          title="Editar Dados"
          onPress={() => router.push(`/edit-appointment?id=${appointment._id}`)}
          style={styles.updateButton}
        />

        <ModernButton
          title="Excluir Agendamento"
          onPress={handleDelete}
          style={[styles.deleteButton, { backgroundColor: '#EF4444' }]}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Loading Overlay */}
      {isUpdating && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  content: {
    padding: 20
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  dateStatusContainer: {
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
  },
  statusButtonActiveGreen: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusButtonActiveRed: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  statusButtonText: {
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
  },
  clientCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
  },
  updateButton: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 8,
  },
  overlayLoading: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20
  }
});