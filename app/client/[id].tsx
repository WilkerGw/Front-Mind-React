import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, ActivityIndicator, View, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useClients } from '@/context/ClientsContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Card } from '@/components/ui/Card';
import { ModernButton } from '@/components/ui/ModernButton';

export default function ClientDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const { getClientById, deleteClient, isLoading } = useClients();

  const client = getClientById(id as string);

  const handleDelete = () => {
    Alert.alert(
      "Excluir Cliente",
      "Tem certeza? Isso não pode ser desfeito.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deleteClient(id as string);
            router.back();
          }
        }
      ]
    );
  };

  const handleCall = () => {
    if (client?.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (client?.phone) {
      const cleanPhone = client.phone.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/55${cleanPhone}`);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[theme].background }]}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[theme].background }]}>
        <ThemedText>Cliente não encontrado.</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      {/* 1. Ajuste no Stack.Screen para o ícone de voltar */}
      <Stack.Screen
        options={{
          title: '', // Título vazio para não sobrepor o nome do cliente
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <IconSymbol name="arrow.left" size={24} color={Colors[theme].icon} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: Colors[theme].background, // Cor de fundo do header
          },
          headerShadowVisible: false, // Remover sombra padrão do header
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>

        {/* Cabeçalho do Perfil */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarLarge, { backgroundColor: Colors[theme].tint }]}>
            <ThemedText style={styles.avatarInitials}>
              {client.fullName.substring(0, 1).toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText type="title" style={{ textAlign: 'center', marginTop: 12 }}>{client.fullName}</ThemedText>
          <ThemedText style={{ opacity: 0.6 }}>{client.phone}</ThemedText>

          {/* Ações Rápidas de Contato com ÍCONES */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.circleBtn, { backgroundColor: Colors[theme].tint }]} onPress={handleCall}>
              <IconSymbol name="phone.fill" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.circleBtn, { backgroundColor: '#25D366' }]} onPress={handleWhatsApp}>
              <FontAwesome name="whatsapp" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção 1: Dados Pessoais */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Dados Pessoais</ThemedText>
        <Card>
          <InfoRow label="CPF" value={client.cpf || '-'} />
          <View style={styles.divider} />
          <InfoRow
            label="Data de Nasc."
            value={client.birthDate ? new Date(client.birthDate).toLocaleDateString('pt-BR') : '-'}
          />
          <View style={styles.divider} />
          <InfoRow label="Gênero" value={client.gender || '-'} />
          <View style={styles.divider} />
          <InfoRow label="Endereço" value={client.address || '-'} />
          {client.cep && <InfoRow label="CEP" value={client.cep} />}
        </Card>

        {/* Seção 2: Dados da Receita (Se houver) */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Dados da Receita</ThemedText>
        <Card>
          {/* Olho Direito */}
          <View style={styles.eyeSection}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8, color: Colors[theme].tint }}>Olho Direito (OD)</ThemedText>
            <View style={styles.grid}>
              <GridItem label="Esférico" value={client.esfericoDireito} />
              <GridItem label="Cilíndrico" value={client.cilindricoDireito} />
              <GridItem label="Eixo" value={client.eixoDireito} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Olho Esquerdo */}
          <View style={styles.eyeSection}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8, color: Colors[theme].tint }}>Olho Esquerdo (OE)</ThemedText>
            <View style={styles.grid}>
              <GridItem label="Esférico" value={client.esfericoEsquerdo} />
              <GridItem label="Cilíndrico" value={client.cilindricoEsquerdo} />
              <GridItem label="Eixo" value={client.eixoEsquerdo} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.grid}>
            <GridItem label="Adição" value={client.adicao} />
            <GridItem label="Vencimento" value={client.vencimentoReceita} />
          </View>
        </Card>

        {/* Seção 3: Observações */}
        {client.notes && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Observações</ThemedText>
            <Card>
              <ThemedText>{client.notes}</ThemedText>
            </Card>
          </>
        )}

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <ModernButton
            title="Editar Dados"
            onPress={() => router.push(`/edit-client?id=${client._id}`)}
          />
          <ModernButton
            title="Excluir Cliente"
            onPress={handleDelete}
            variant="danger"
          />
        </View>

      </ScrollView>
    </View>
  );
}

// Componentes Auxiliares Locais
function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <ThemedText style={{ opacity: 0.6 }}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold">{value}</ThemedText>
    </View>
  );
}

function GridItem({ label, value }: { label: string, value?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <ThemedText style={{ fontSize: 12, opacity: 0.5 }}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold">{value || '-'}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },

  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  avatarInitials: { color: '#fff', fontSize: 32, fontWeight: 'bold' },

  quickActions: { flexDirection: 'row', gap: 16, marginTop: 16 },
  circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' }, // Cor padrão do botão

  sectionTitle: { marginTop: 16, marginBottom: 8, marginLeft: 4 },

  divider: { height: 1, backgroundColor: 'rgba(150,150,150,0.1)', marginVertical: 8 },

  eyeSection: { paddingVertical: 4 },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },

  actionButtons: { gap: 12, marginTop: 32, marginBottom: 40 },
});