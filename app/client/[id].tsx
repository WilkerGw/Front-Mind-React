import { StyleSheet, Pressable, Alert, Button, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useClients } from '@/context/ClientsContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Componente InfoRow (atualizado para aceitar 'number')
const InfoRow = ({ label, value }: { label: string; value?: string | number }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <ThemedView style={styles.infoRow}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </ThemedView>
  );
};

export default function ClientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); 
  const { getClientById, deleteClient } = useClients();
  const theme = useColorScheme() ?? 'light';
  const tintColor = Colors[theme].tint;

  const client = getClientById(id);

  const handleEdit = () => {
    router.push({ pathname: '/edit-client', params: { id: id } });
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Cliente",
      `Tem a certeza que deseja eliminar ${client?.fullName}? Esta ação não pode ser revertida.`, // MUDANÇA: fullName
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive", 
          onPress: () => {
            deleteClient(id);
            router.back(); 
          },
        },
      ]
    );
  };

  if (!client) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Cliente não encontrado.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: client.fullName, // MUDANÇA: fullName
          headerRight: () => (
            <Pressable onPress={handleEdit} style={{ paddingRight: 8 }}>
              <IconSymbol size={24} name="pencil" color={tintColor} />
            </Pressable>
          ),
        }} 
      />
      <ScrollView>
        {/* MUDANÇA: Campos atualizados */}
        <ThemedText type="subtitle" style={styles.title}>Dados Pessoais</ThemedText>
        <InfoRow label="Nome" value={client.fullName} />
        <InfoRow label="Telefone" value={client.phone} />
        <InfoRow label="Email" value={client.email} />
        <InfoRow label="Data de Nasc." value={client.birthDate} />
        <InfoRow label="CPF" value={client.cpf} />
        <InfoRow label="Gênero" value={client.gender} />
        <InfoRow label="CEP" value={client.cep} />
        <InfoRow label="Endereço" value={client.address} />
        <InfoRow label="Observações" value={client.notes} />

        {/* MUDANÇA: Receita atualizada (estrutura chata) */}
        <ThemedText type="subtitle" style={styles.title}>Receita</ThemedText>
        <InfoRow label="Vencimento da Receita" value={client.vencimentoReceita} />

        <ThemedText type="defaultSemiBold" style={styles.title}>Olho Direito (OD)</ThemedText>
        <View style={styles.grid}>
          <InfoRow label="Esférico" value={client.esfericoDireito} />
          <InfoRow label="Cilíndrico" value={client.cilindricoDireito} />
        </View>
        <InfoRow label="Eixo" value={client.eixoDireito} />
        
        <ThemedText type="defaultSemiBold" style={styles.title}>Olho Esquerdo (OE)</ThemedText>
        <View style={styles.grid}>
          <InfoRow label="Esférico" value={client.esfericoEsquerdo} />
          <InfoRow label="Cilíndrico" value={client.cilindricoEsquerdo} />
        </View>
        <InfoRow label="Eixo" value={client.eixoEsquerdo} />

        <ThemedText type="defaultSemiBold" style={styles.title}>Geral</ThemedText>
        <InfoRow label="Adição" value={client.adicao} />
        
        <View style={styles.deleteButtonContainer}>
          <Button 
            title="Eliminar Cliente" 
            color={Colors.light.icon}
            onPress={handleDelete} 
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { marginTop: 16, marginBottom: 8 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 18, marginBottom: 4 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  infoRow: { marginBottom: 16, flex: 1 },
  deleteButtonContainer: {
    marginTop: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    paddingTop: 16,
  }
});