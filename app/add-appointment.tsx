import { StyleSheet, TextInput, ScrollView, Platform, KeyboardAvoidingView, View, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useClients, Cliente } from '@/context/ClientsContext';
import { useAppointments, TipoAgendamento, TIPOS_AGENDAMENTO } from '@/context/AppointmentsContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MaskedTextInput } from "react-native-mask-text";
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassView } from '@/components/ui/GlassView';
import { ModernButton } from '@/components/ui/ModernButton';

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
  const placeholderColor = Colors[theme].icon;

  const handleSearchClient = () => {
    if (!cpfInput) return;
    const client = getClientByCPF(cpfInput);
    if (client) {
      setFoundClient(client);
    } else {
      setFoundClient(null);
      Alert.alert(
        'Cliente não encontrado',
        `Nenhum cliente cadastrado com o CPF ${cpfInput}. Deseja cadastrar um novo cliente?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Cadastrar Cliente',
            onPress: () => {
              router.push({
                pathname: '/add-client',
                params: { cpf: cpfInput }
              });
            }
          }
        ]
      );
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
    <ScreenBackground>
      {/* Header */}
      <GlassView style={styles.header} intensity={80}>
        <View style={styles.headerContent}>
          <ModernButton
            title=""
            onPress={() => router.back()}
            style={styles.backButton}
            icon={<IconSymbol name="chevron.left" size={20} color={tintColor} />}
          />
          <ThemedText type="title">Novo Agendamento</ThemedText>
          <View style={{ width: 42 }} />
        </View>
      </GlassView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Buscar Cliente */}
          <GlassView style={styles.section} delay={50}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="person.fill" size={20} color={tintColor} /> Cliente
            </ThemedText>

            <ThemedText style={styles.label}>Buscar por CPF</ThemedText>
            <View style={styles.searchContainer}>
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
                <IconSymbol name="magnifyingglass" size={20} color={tintColor} />
              </Pressable>
            </View>

            {foundClient && (
              <GlassView style={styles.foundClientCard} delay={0} intensity={60}>
                <View style={styles.clientInfo}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color="#10B981" />
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold">{foundClient.fullName}</ThemedText>
                    <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>{foundClient.phone}</ThemedText>
                  </View>
                </View>
              </GlassView>
            )}
          </GlassView>

          {/* Detalhes do Agendamento */}
          <GlassView style={styles.section} delay={75}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="calendar" size={20} color={tintColor} /> Detalhes do Agendamento
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

            <ThemedText style={styles.label}>Observações (Opcional)</ThemedText>
            <TextInput
              style={{ ...inputStyle, height: 80, textAlignVertical: 'top' }}
              value={observation}
              onChangeText={setObservation}
              placeholder="Ex: Cliente pediu urgência"
              placeholderTextColor={placeholderColor}
              multiline
            />
          </GlassView>

          {/* Botão Salvar */}
          <ModernButton
            title="Salvar Agendamento"
            onPress={handleSave}
            style={styles.saveButton}
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
    marginBottom: 6,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
  },
  foundClientCard: {
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});