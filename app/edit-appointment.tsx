import { StyleSheet, TextInput, ScrollView, Platform, KeyboardAvoidingView, View, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useClients } from '@/context/ClientsContext';
import { useAppointments, TipoAgendamento, TIPOS_AGENDAMENTO, StatusAgendamento, STATUS_AGENDAMENTO } from '@/context/AppointmentsContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassView } from '@/components/ui/GlassView';
import { ModernButton } from '@/components/ui/ModernButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Switch } from 'react-native';

export default function EditAppointmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAppointmentById, updateAppointment, deleteAppointment } = useAppointments();
  const { getClientById } = useClients();

  const appointmentToEdit = getAppointmentById(id);
  const client = appointmentToEdit ? getClientById(appointmentToEdit.clientId) : undefined;

  const [tipo, setTipo] = useState<TipoAgendamento>('Exame de Vista');
  const [date, setDate] = useState(new Date());
  const [observation, setObservation] = useState('');
  const [status, setStatus] = useState<StatusAgendamento>('Marcado');
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [vendaRealizada, setVendaRealizada] = useState(false);

  useEffect(() => {
    if (appointmentToEdit) {
      setTipo(appointmentToEdit.tipo);
      setDate(appointmentToEdit.date);
      setObservation(appointmentToEdit.observation || '');
      setStatus(appointmentToEdit.status);
    }
  }, [appointmentToEdit]);

  const theme = useColorScheme() ?? 'light';
  const inputStyle = {
    ...styles.input,
    color: Colors[theme].text,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    backgroundColor: theme === 'dark' ? 'rgba(51, 51, 51, 0.5)' : 'rgba(240, 240, 240, 0.5)'
  };
  const pickerStyle = {
    backgroundColor: theme === 'dark' ? 'rgba(51, 51, 51, 0.5)' : 'rgba(240, 240, 240, 0.5)',
    color: Colors[theme].text,
    borderRadius: 12,
    marginBottom: 16,
  };

  const onChangeDateTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  const handleUpdate = () => {
    updateAppointment(id, {
      tipo,
      date,
      observation,
      status,
    });
    Alert.alert('Sucesso', 'Agendamento atualizado com sucesso!');
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este agendamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteAppointment(id);
            router.back();
          }
        }
      ]
    );
  };

  const getStatusColor = (status: StatusAgendamento) => {
    switch (status) {
      case 'Concluído': return '#10B981';
      case 'Faltou': return '#EF4444';
      case 'Desmarcado': return '#6B7280';
      default: return Colors[theme].tint;
    }
  };

  const getStatusIcon = (status: StatusAgendamento) => {
    switch (status) {
      case 'Concluído': return 'checkmark.circle.fill';
      case 'Faltou': return 'xmark.circle.fill';
      case 'Desmarcado': return 'minus.circle.fill';
      default: return 'clock.fill';
    }
  };

  if (!appointmentToEdit || !client) {
    return (
      <ScreenBackground>
        <View style={styles.notFoundContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={Colors[theme].icon} />
          <ThemedText style={{ marginTop: 16 }}>Agendamento não encontrado.</ThemedText>
          <ModernButton title="Voltar" onPress={() => router.back()} style={{ marginTop: 24 }} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Data e Status */}
          <GlassView style={styles.section} delay={50}>
            <View style={styles.dateStatusContainer}>
              <View style={styles.dateRow}>
                <IconSymbol name="calendar" size={20} color={Colors[theme].tint} />
                <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                  {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(status)}20` }]}>
                <IconSymbol name={getStatusIcon(status)} size={16} color={getStatusColor(status)} />
                <ThemedText style={{ color: getStatusColor(status), fontWeight: 'bold', marginLeft: 6 }}>
                  {status}
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
              <Pressable
                style={[styles.statusButton, status === 'Concluído' && styles.statusButtonActive, { borderColor: '#10B981' }]}
                onPress={() => setStatus('Concluído')}
              >
                <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
                <ThemedText style={[styles.statusButtonText, status === 'Concluído' && { color: '#10B981' }]}>
                  Compareceu
                </ThemedText>
              </Pressable>

              <Pressable
                style={[styles.statusButton, status === 'Faltou' && styles.statusButtonActive, { borderColor: '#EF4444' }]}
                onPress={() => setStatus('Faltou')}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color="#EF4444" />
                <ThemedText style={[styles.statusButtonText, status === 'Faltou' && { color: '#EF4444' }]}>
                  Faltou
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.switchRow}>
              <IconSymbol name="cart.fill" size={18} color={Colors[theme].text} />
              <ThemedText style={{ flex: 1, marginLeft: 8 }}>Venda Realizada?</ThemedText>
              <Switch
                value={vendaRealizada}
                onValueChange={setVendaRealizada}
                trackColor={{ false: '#767577', true: '#60A5FA' }}
                thumbColor={vendaRealizada ? '#2563EB' : '#f4f3f4'}
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
                {client.fullName}
              </ThemedText>
              <ThemedText style={{ opacity: 0.7, fontSize: 14, marginTop: 4 }}>
                {client.phone}
              </ThemedText>
            </View>
          </GlassView>

          {/* Editar Detalhes */}
          <GlassView style={styles.section} delay={125}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="pencil" size={20} color={Colors[theme].tint} /> Editar Detalhes
            </ThemedText>

            <ThemedText style={styles.label}>Tipo de Agendamento</ThemedText>
            <View style={pickerStyle}>
              <Picker
                selectedValue={tipo}
                onValueChange={(itemValue) => setTipo(itemValue)}
                style={{ color: Colors[theme].text }}
              >
                {TIPOS_AGENDAMENTO.map((tipo) => (
                  <Picker.Item key={tipo} label={tipo} value={tipo} />
                ))}
              </Picker>
            </View>

            <ThemedText style={styles.label}>Data e Hora</ThemedText>
            {Platform.OS === 'android' && (
              <Pressable style={{ ...inputStyle, justifyContent: 'center' }} onPress={() => setShowDatePicker(true)}>
                <ThemedText>{date.toLocaleString('pt-BR')}</ThemedText>
              </Pressable>
            )}

            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={onChangeDateTime}
                  style={{ alignSelf: 'center' }}
                  themeVariant={theme}
                />
              </View>
            )}

            <ThemedText style={styles.label}>Observações</ThemedText>
            <TextInput
              style={{ ...inputStyle, height: 80, textAlignVertical: 'top' }}
              value={observation}
              onChangeText={setObservation}
              placeholder="Ex: Cliente pediu urgência"
              placeholderTextColor={Colors[theme].icon}
              multiline
            />
          </GlassView>

          {/* Botões de Ação */}
          <ModernButton
            title="Editar Dados"
            onPress={handleUpdate}
            style={styles.updateButton}
          />

          <ModernButton
            title="Excluir Agendamento"
            onPress={handleDelete}
            style={[styles.deleteButton, { backgroundColor: '#EF4444' }]}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
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
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 16,
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
  },
  statusButtonActive: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
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
  datePickerContainer: {
    marginBottom: 16,
  },
  updateButton: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 8,
  },
});