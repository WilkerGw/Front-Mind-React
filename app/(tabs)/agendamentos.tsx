import { StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppointments } from '@/context/AppointmentsContext';
import { AppointmentListItem } from '@/components/management/AppointmentListItem';
import { useRouter } from 'expo-router';
import { useClients } from '@/context/ClientsContext'; // 1. Importar useClients

export default function AgendamentosScreen() {
  const { appointments, isLoading: appointmentsLoading } = useAppointments();
  const { isLoading: clientsLoading } = useClients(); // 2. Obter o isLoading dos Clientes
  
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();
  
  const handleAppointmentPress = (appointmentId: string) => {
    router.push(`/appointment/${appointmentId}`);
  };

  // 3. Mostrar loading se QUALQUER UM dos contextos estiver a carregar
  if (appointmentsLoading || clientsLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id} 
        renderItem={({ item }) => (
          <AppointmentListItem
            appointment={item}
            onPress={() => handleAppointmentPress(item._id)} 
          />
        )}
      />
    </ThemedView>
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
});