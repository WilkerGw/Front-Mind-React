import { StyleSheet, Pressable, Alert, Button, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAppointments } from '@/context/AppointmentsContext';
import { useClients } from '@/context/ClientsContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Componente InfoRow (sem mudanças)
const InfoRow = ({ label, value }: { label: string; value?: string | number }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <ThemedView style={styles.infoRow}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </ThemedView>
  );
};

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); 
  const { getAppointmentById, deleteAppointment } = useAppointments();
  const { getClientById } = useClients();
  const theme = useColorScheme() ?? 'light';
  const tintColor = Colors[theme].tint;

  const appointment = getAppointmentById(id);
  const client = appointment ? getClientById(appointment.clientId) : undefined;

  const handleEdit = () => {
    router.push({ pathname: '/edit-appointment', params: { id: id } });
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Agendamento",
      `Tem a certeza que deseja eliminar este agendamento?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive", 
          onPress: () => {
            deleteAppointment(id);
            router.back(); 
          },
        },
      ]
    );
  };

  if (!appointment || !client) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Agendamento ou Cliente não encontrado.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: appointment.tipo,
          headerRight: () => (
            <Pressable onPress={handleEdit} style={{ paddingRight: 8 }}>
              <IconSymbol size={24} name="pencil" color={tintColor} />
            </Pressable>
          ),
        }} 
      />
      <ScrollView>
        <InfoRow label="Cliente" value={client.fullName} />
        <InfoRow label="Telefone" value={client.phone} />
        <InfoRow label="Tipo" value={appointment.tipo} />
        <InfoRow label="Status" value={appointment.status} />
        <InfoRow 
          label="Data e Hora" 
          // MUDANÇA: de data para date
          value={appointment.date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} 
        />
        {/* MUDANÇA: de notas para observation */}
        <InfoRow label="Observações" value={appointment.observation} /> 
        
        <View style={styles.deleteButtonContainer}>
          <Button 
            title="Eliminar Agendamento" 
            color={Colors.light.icon}
            onPress={handleDelete} 
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// ... (estilos não mudam)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  infoRow: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 18 },
  deleteButtonContainer: {
    marginTop: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    paddingTop: 16,
  }
});