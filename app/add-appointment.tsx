import { StyleSheet, TextInput, Button, ScrollView, Platform, KeyboardAvoidingView, View, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useClients, Cliente } from '@/context/ClientsContext'; 
import { useAppointments, TipoAgendamento, TIPOS_AGENDAMENTO } from '@/context/AppointmentsContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/ui/icon-symbol';
// 1. Importar o componente de Máscara
import { MaskedTextInput } from "react-native-mask-text";

export default function AddAppointmentScreen() {
  const router = useRouter();
  const { addAppointment } = useAppointments();
  const { getClientByCPF } = useClients(); 

  const [cpfInput, setCpfInput] = useState(''); 
  const [foundClient, setFoundClient] = useState<Cliente | null>(null); 
  
  const [tipo, setTipo] = useState<TipoAgendamento>('Exame de Vista');
  const [date, setDate] = useState(new Date()); 
  const [observation, setObservation] = useState(''); 
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios'); 

  const theme = useColorScheme() ?? 'light';
  const tintColor = Colors[theme].tint;
  const inputStyle = { ...styles.input, color: Colors[theme].text, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' };
  const pickerContainerStyle = { ...styles.pickerContainer, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' };
  const placeholderColor = Colors[theme].icon;

  const handleSearchClient = () => {
    if (!cpfInput) return;
    const client = getClientByCPF(cpfInput);
    if (client) {
      setFoundClient(client);
    } else {
      setFoundClient(null);
      Alert.alert('Cliente não encontrado', 'Nenhum cliente encontrado com este CPF.');
    }
  };

  const onChangeDateTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date; 
    if (Platform.OS === 'android') {
      setShowDatePicker(false); 
    }
    setDate(currentDate); 
  };

  const handleSave = () => {
    if (!foundClient || !tipo || !date) { 
      alert('Cliente, Tipo e Data são obrigatórios.');
      return;
    }
    addAppointment({
      clientId: foundClient._id,
      tipo,
      date, 
      observation, 
      status: 'Marcado',
    });
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView>
          <ThemedText style={styles.label}>Buscar Cliente por CPF</ThemedText>
          <View style={styles.searchContainer}>
            {/* 2. APLICAR MÁSCARA (CPF) */}
            <MaskedTextInput
              mask="999.999.999-99"
              onChangeText={setCpfInput}
              value={cpfInput}
              style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
              placeholder="Digite o CPF do cliente"
              placeholderTextColor={placeholderColor}
              keyboardType="numbers-and-punctuation"
            />
            <Pressable style={styles.searchButton} onPress={handleSearchClient}>
              <IconSymbol name="magnifyingglass" size={24} color={tintColor} />
            </Pressable>
          </View>

          {foundClient && (
            <ThemedView style={styles.foundClientCard}>
              <ThemedText type="defaultSemiBold">{foundClient.fullName}</ThemedText>
              <ThemedText>{foundClient.phone}</ThemedText>
            </ThemedView>
          )}

          <ThemedText style={styles.label}>Tipo de Agendamento</ThemedText>
          <View style={pickerContainerStyle}>
            <Picker selectedValue={tipo} onValueChange={(itemValue) => setTipo(itemValue)} style={{ color: Colors[theme].text }}>
              {TIPOS_AGENDAMENTO.map((tipo) => (
                <Picker.Item key={tipo} label={tipo} value={tipo} />
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
              value={date} 
              mode="datetime"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onChangeDateTime}
              style={{ alignSelf: 'center' }}
            />
          )}

          <ThemedText style={styles.label}>Observações (Opcional)</ThemedText>
          <TextInput style={{...inputStyle, height: 80}} value={observation} onChangeText={setObservation} placeholder="Ex: Cliente pediu urgência" placeholderTextColor={Colors[theme].icon} multiline />

          <Button title="Salvar Agendamento" onPress={handleSave} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  searchButton: {
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foundClientCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'green', 
    marginBottom: 20,
  },
});