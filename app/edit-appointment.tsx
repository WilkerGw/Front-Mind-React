import { StyleSheet, TextInput, Button, ScrollView, Platform, KeyboardAvoidingView, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useClients } from '@/context/ClientsContext';
import { useAppointments, TipoAgendamento, TIPOS_AGENDAMENTO, StatusAgendamento, STATUS_AGENDAMENTO } from '@/context/AppointmentsContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function EditAppointmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAppointmentById, updateAppointment } = useAppointments();
  const { getClientById } = useClients();

  const appointmentToEdit = getAppointmentById(id);
  const client = appointmentToEdit ? getClientById(appointmentToEdit.clientId) : undefined;

  // MUDANÇA: Renomeação de estados
  const [tipo, setTipo] = useState<TipoAgendamento>('Exame de Vista');
  const [date, setDate] = useState(new Date()); 
  const [observation, setObservation] = useState('');
  const [status, setStatus] = useState<StatusAgendamento>('Marcado');
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios'); 

  useEffect(() => {
    if (appointmentToEdit) {
      setTipo(appointmentToEdit.tipo);
      setDate(appointmentToEdit.date); // MUDANÇA
      setObservation(appointmentToEdit.observation || ''); // MUDANÇA
      setStatus(appointmentToEdit.status);
    }
  }, [appointmentToEdit]);

  const theme = useColorScheme() ?? 'light';
  const inputStyle = { ...styles.input, color: Colors[theme].text, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' };
  const pickerContainerStyle = { ...styles.pickerContainer, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' };

  const onChangeDateTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date; // MUDANÇA
    if (Platform.OS === 'android') {
      setShowDatePicker(false); 
    }
    setDate(currentDate); // MUDANÇA
  };

  const handleUpdate = () => {
    updateAppointment(id, {
      tipo,
      date, // MUDANÇA
      observation, // MUDANÇA
      status,
    });
    router.back();
  };

  if (!appointmentToEdit || !client) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Agendamento não encontrado.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView>
          
          <ThemedText style={styles.label}>Cliente</ThemedText>
          <ThemedText style={styles.clientName}>{client.fullName}</ThemedText>

          <ThemedText style={styles.label}>Tipo de Agendamento</ThemedText>
          <View style={pickerContainerStyle}>
            <Picker selectedValue={tipo} onValueChange={(itemValue) => setTipo(itemValue)} style={{ color: Colors[theme].text }}>
              {TIPOS_AGENDAMENTO.map((tipo) => (
                <Picker.Item key={tipo} label={tipo} value={tipo} />
              ))}
            </Picker>
          </View>

          <ThemedText style={styles.label}>Status do Agendamento</ThemedText>
          <View style={pickerContainerStyle}>
            <Picker selectedValue={status} onValueChange={(itemValue) => setStatus(itemValue)} style={{ color: Colors[theme].text }}>
              {STATUS_AGENDAMENTO.map((status) => (
                <Picker.Item key={status} label={status} value={status} />
              ))}
            </Picker>
          </View>

          <ThemedText style={styles.label}>Data e Hora</ThemedText>
          {Platform.OS === 'android' && (
            <Pressable style={inputStyle} onPress={() => setShowDatePicker(true)}>
              <ThemedText>{date.toLocaleString('pt-BR')}</ThemedText>
            </Pressable>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={date} // MUDANÇA
              mode="datetime" 
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onChangeDateTime}
              style={{ alignSelf: 'center' }}
            />
          )}

          <ThemedText style={styles.label}>Observações (Opcional)</ThemedText>
          {/* MUDANÇA */}
          <TextInput style={{...inputStyle, height: 80}} value={observation} onChangeText={setObservation} placeholder="Ex: Cliente pediu urgência" placeholderTextColor={Colors[theme].icon} multiline />

          <Button title="Salvar Alterações" onPress={handleUpdate} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// ... (estilos não mudam)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
    justifyContent: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  }
});