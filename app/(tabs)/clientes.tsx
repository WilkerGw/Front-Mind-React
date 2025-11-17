import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ClientListItem } from '@/components/management/ClientListItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useClients } from '@/context/ClientsContext';
import { useRouter } from 'expo-router'; 

export default function ClientesScreen() {
  const { clients, isLoading } = useClients();
  const theme = useColorScheme() ?? 'light';
  const router = useRouter(); 

  const handleClientPress = (clientId: string) => {
    router.push(`/client/${clientId}`);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item._id} // MUDANÇA: de id para _id
        renderItem={({ item }) => (
          <ClientListItem
            client={item}
            onPress={() => handleClientPress(item._id)} // MUDANÇA: de id para _id
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