import { StyleSheet, TextInput, Button, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useClients } from '@/context/ClientsContext';
// 1. Importar o componente de Máscara
import { MaskedTextInput } from "react-native-mask-text";

export default function EditClientScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getClientById, updateClient } = useClients();

  const clientToEdit = getClientById(id);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [gender, setGender] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [esfericoDireito, setEsfericoDireito] = useState('');
  const [cilindricoDireito, setCilindricoDireito] = useState('');
  const [eixoDireito, setEixoDireito] = useState('');
  const [esfericoEsquerdo, setEsfericoEsquerdo] = useState('');
  const [cilindricoEsquerdo, setCilindricoEsquerdo] = useState('');
  const [eixoEsquerdo, setEixoEsquerdo] = useState('');
  const [adicao, setAdicao] = useState('');
  const [vencimentoReceita, setVencimentoReceita] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setFullName(clientToEdit.fullName);
      setPhone(clientToEdit.phone);
      setEmail(clientToEdit.email || '');
      setBirthDate(clientToEdit.birthDate || '');
      setCpf(clientToEdit.cpf || '');
      setGender(clientToEdit.gender || '');
      setCep(clientToEdit.cep || '');
      setAddress(clientToEdit.address || '');
      setNotes(clientToEdit.notes || '');

      setEsfericoDireito(clientToEdit.esfericoDireito || '');
      setCilindricoDireito(clientToEdit.cilindricoDireito || '');
      setEixoDireito(clientToEdit.eixoDireito || '');
      setEsfericoEsquerdo(clientToEdit.esfericoEsquerdo || '');
      setCilindricoEsquerdo(clientToEdit.cilindricoEsquerdo || '');
      setEixoEsquerdo(clientToEdit.eixoEsquerdo || '');
      setAdicao(clientToEdit.adicao || '');
      setVencimentoReceita(clientToEdit.vencimentoReceita || '');
    }
  }, [clientToEdit]);

  const theme = useColorScheme() ?? 'light';
  const inputStyle = { ...styles.input, color: Colors[theme].text, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' };
  const placeholderColor = Colors[theme].icon;

  const handleUpdate = () => {
    if (!fullName || !phone) {
      alert('Nome e Telefone são obrigatórios.');
      return;
    }
    updateClient(id, {
      fullName, phone, email, birthDate, cpf, gender, cep, address, notes,
      esfericoDireito, cilindricoDireito, eixoDireito,
      esfericoEsquerdo, cilindricoEsquerdo, eixoEsquerdo,
      adicao, vencimentoReceita,
    });
    if (router.canGoBack()) {
      router.back(); 
    }
  };

  if (!clientToEdit) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Cliente não encontrado.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView>
          <ThemedText type="subtitle" style={styles.title}>Dados Pessoais</ThemedText>
          
          <ThemedText style={styles.label}>Nome Completo</ThemedText>
          <TextInput style={inputStyle} value={fullName} onChangeText={setFullName} placeholder="Nome Completo" placeholderTextColor={placeholderColor} />

          {/* 2. APLICAR MÁSCARA (Telefone) */}
          <ThemedText style={styles.label}>Telefone</ThemedText>
          <MaskedTextInput
            mask="(99) 99999-9999"
            onChangeText={setPhone}
            value={phone}
            style={inputStyle}
            placeholder="(11) 99999-9999"
            placeholderTextColor={placeholderColor}
            keyboardType="phone-pad"
          />

          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput style={inputStyle} value={email} onChangeText={setEmail} placeholder="exemplo@email.com" placeholderTextColor={placeholderColor} keyboardType="email-address" autoCapitalize="none" />

          {/* 3. APLICAR MÁSCARA (Data) */}
          <ThemedText style={styles.label}>Data de Nascimento</ThemedText>
          <MaskedTextInput
            mask="99/99/9999"
            onChangeText={setBirthDate}
            value={birthDate}
            style={inputStyle}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={placeholderColor}
            keyboardType="numbers-and-punctuation"
          />

          {/* 4. APLICAR MÁSCARA (CPF) */}
          <ThemedText style={styles.label}>CPF</ThemedText>
          <MaskedTextInput
            mask="999.999.999-99"
            onChangeText={setCpf}
            value={cpf}
            style={inputStyle}
            placeholder="000.000.000-00"
            placeholderTextColor={placeholderColor}
            keyboardType="numbers-and-punctuation"
          />

          <ThemedText style={styles.label}>Gênero</ThemedText>
          <TextInput style={inputStyle} value={gender} onChangeText={setGender} placeholder="Masculino / Feminino / Outro" placeholderTextColor={placeholderColor} />
          
          {/* 5. APLICAR MÁSCARA (CEP) */}
          <ThemedText style={styles.label}>CEP</ThemedText>
          <MaskedTextInput
            mask="99999-999"
            onChangeText={setCep}
            value={cep}
            style={inputStyle}
            placeholder="00000-000"
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
          />

          <ThemedText style={styles.label}>Endereço</ThemedText>
          <TextInput style={inputStyle} value={address} onChangeText={setAddress} placeholder="Rua, Número, Bairro, Cidade - UF" placeholderTextColor={placeholderColor} />

          <ThemedText style={styles.label}>Observações</ThemedText>
          <TextInput style={{...inputStyle, height: 80}} value={notes} onChangeText={setNotes} placeholder="Notas sobre o cliente..." placeholderTextColor={placeholderColor} multiline />

          <ThemedText type="subtitle" style={styles.title}>Dados da Receita</ThemedText>

          {/* (Campos da receita) */}
          <ThemedText type="defaultSemiBold" style={styles.title}>Olho Direito (OD)</ThemedText>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <ThemedText style={styles.label}>Esférico</ThemedText>
              <TextInput style={inputStyle} value={esfericoDireito} onChangeText={setEsfericoDireito} placeholder="+1.00" placeholderTextColor={placeholderColor} keyboardType="numbers-and-punctuation" />
            </View>
            <View style={styles.gridItem}>
              <ThemedText style={styles.label}>Cilíndrico</ThemedText>
              <TextInput style={inputStyle} value={cilindricoDireito} onChangeText={setCilindricoDireito} placeholder="-0.75" placeholderTextColor={placeholderColor} keyboardType="numbers-and-punctuation" />
            </View>
          </View>
          <View style={styles.gridItem}>
            <ThemedText style={styles.label}>Eixo</ThemedText>
            <TextInput style={inputStyle} value={eixoDireito} onChangeText={setEixoDireito} placeholder="180" placeholderTextColor={placeholderColor} keyboardType="numeric" />
          </View>
          
          <ThemedText type="defaultSemiBold" style={styles.title}>Olho Esquerdo (OE)</ThemedText>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <ThemedText style={styles.label}>Esférico</ThemedText>
              <TextInput style={inputStyle} value={esfericoEsquerdo} onChangeText={setEsfericoEsquerdo} placeholder="+1.00" placeholderTextColor={placeholderColor} keyboardType="numbers-and-punctuation" />
            </View>
            <View style={styles.gridItem}>
              <ThemedText style={styles.label}>Cilíndrico</ThemedText>
              <TextInput style={inputStyle} value={cilindricoEsquerdo} onChangeText={setCilindricoEsquerdo} placeholder="-0.75" placeholderTextColor={placeholderColor} keyboardType="numbers-and-punctuation" />
            </View>
          </View>
          <View style={styles.gridItem}>
            <ThemedText style={styles.label}>Eixo</ThemedText>
            <TextInput style={inputStyle} value={eixoEsquerdo} onChangeText={setEixoEsquerdo} placeholder="180" placeholderTextColor={placeholderColor} keyboardType="numeric" />
          </View>
          
          <ThemedText type="defaultSemiBold" style={styles.title}>Geral</ThemedText>
          <ThemedText style={styles.label}>Adição (para perto)</ThemedText>
          <TextInput style={inputStyle} value={adicao} onChangeText={setAdicao} placeholder="+2.00" placeholderTextColor={placeholderColor} keyboardType="numbers-and-punctuation" />

          {/* 6. APLICAR MÁSCARA (Data) */}
          <ThemedText style={styles.label}>Vencimento da Receita</ThemedText>
          <MaskedTextInput
            mask="99/99/9999"
            onChangeText={setVencimentoReceita}
            value={vencimentoReceita}
            style={inputStyle}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={placeholderColor}
            keyboardType="numbers-and-punctuation"
          />

          <Button title="Salvar Alterações" onPress={handleUpdate} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// ... (estilos não mudam)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { marginBottom: 16, marginTop: 10 },
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  grid: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  gridItem: { flex: 1 },
});