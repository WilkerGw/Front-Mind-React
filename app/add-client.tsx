import { StyleSheet, TextInput, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useClients } from '@/context/ClientsContext';
import { MaskedTextInput } from "react-native-mask-text";
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassView } from '@/components/ui/GlassView';
import { ModernButton } from '@/components/ui/ModernButton';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AddClientScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addClient } = useClients();

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

  const theme = useColorScheme() ?? 'light';
  const inputStyle = {
    ...styles.input,
    color: Colors[theme].text,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    backgroundColor: theme === 'dark' ? 'rgba(51, 51, 51, 0.5)' : 'rgba(240, 240, 240, 0.5)'
  };
  const placeholderColor = Colors[theme].icon;

  // Preenche CPF se veio de outra tela
  useEffect(() => {
    if (params?.cpf && typeof params.cpf === 'string') {
      setCpf(params.cpf);
    }
  }, [params]);

  const handleSave = () => {
    if (!fullName || !phone) {
      alert('Nome e Telefone são obrigatórios.');
      return;
    }

    addClient({
      fullName, phone, email, birthDate, cpf, gender, cep, address, notes,
      esfericoDireito, cilindricoDireito, eixoDireito,
      esfericoEsquerdo, cilindricoEsquerdo, eixoEsquerdo,
      adicao, vencimentoReceita,
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
            icon={<IconSymbol name="chevron.left" size={20} color={Colors[theme].tint} />}
          />
          <ThemedText type="title">Novo Cliente</ThemedText>
          <View style={{ width: 42 }} />
        </View>
      </GlassView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Dados Pessoais */}
          <GlassView style={styles.section} delay={50}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="person.fill" size={20} color={Colors[theme].tint} /> Dados Pessoais
            </ThemedText>

            <ThemedText style={styles.label}>Nome Completo *</ThemedText>
            <TextInput
              style={inputStyle}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nome Completo"
              placeholderTextColor={placeholderColor}
            />

            <ThemedText style={styles.label}>Telefone *</ThemedText>
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
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              placeholder="exemplo@email.com"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
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
              </View>

              <View style={styles.halfWidth}>
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
              </View>
            </View>

            <ThemedText style={styles.label}>Gênero</ThemedText>
            <TextInput
              style={inputStyle}
              value={gender}
              onChangeText={setGender}
              placeholder="Masculino / Feminino / Outro"
              placeholderTextColor={placeholderColor}
            />
          </GlassView>

          {/* Endereço */}
          <GlassView style={styles.section} delay={75}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="house.fill" size={20} color={Colors[theme].tint} /> Endereço
            </ThemedText>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
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
              </View>
              <View style={styles.halfWidth} />
            </View>

            <ThemedText style={styles.label}>Endereço Completo</ThemedText>
            <TextInput
              style={inputStyle}
              value={address}
              onChangeText={setAddress}
              placeholder="Rua, Número, Bairro, Cidade - UF"
              placeholderTextColor={placeholderColor}
            />

            <ThemedText style={styles.label}>Observações</ThemedText>
            <TextInput
              style={{ ...inputStyle, height: 80, textAlignVertical: 'top' }}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notas sobre o cliente..."
              placeholderTextColor={placeholderColor}
              multiline
            />
          </GlassView>

          {/* Receita Oftalmológica */}
          <GlassView style={styles.section} delay={100}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="eyeglasses" size={20} color={Colors[theme].tint} /> Receita Oftalmológica
            </ThemedText>

            <ThemedText type="defaultSemiBold" style={styles.eyeTitle}>Olho Direito (OD)</ThemedText>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <ThemedText style={styles.label}>Esférico</ThemedText>
                <TextInput
                  style={inputStyle}
                  value={esfericoDireito}
                  onChangeText={setEsfericoDireito}
                  placeholder="+1.00"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.gridItem}>
                <ThemedText style={styles.label}>Cilíndrico</ThemedText>
                <TextInput
                  style={inputStyle}
                  value={cilindricoDireito}
                  onChangeText={setCilindricoDireito}
                  placeholder="-0.75"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.gridItem}>
                <ThemedText style={styles.label}>Eixo</ThemedText>
                <TextInput
                  style={inputStyle}
                  value={eixoDireito}
                  onChangeText={setEixoDireito}
                  placeholder="180"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.eyeTitle}>Olho Esquerdo (OE)</ThemedText>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <ThemedText style={styles.label}>Esférico</ThemedText>
                <TextInput
                  style={inputStyle}
                  value={esfericoEsquerdo}
                  onChangeText={setEsfericoEsquerdo}
                  placeholder="+1.00"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.gridItem}>
                <ThemedText style={styles.label}>Cilíndrico</ThemedText>
                <TextInput
                  style={inputStyle}
                  value={cilindricoEsquerdo}
                  onChangeText={setCilindricoEsquerdo}
                  placeholder="-0.75"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.gridItem}>
                <ThemedText style={styles.label}>Eixo</ThemedText>
                <TextInput
                  style={inputStyle}
                  value={eixoEsquerdo}
                  onChangeText={setEixoEsquerdo}
                  placeholder="180"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Adição (para perto)</ThemedText>
                <TextInput
                  style={inputStyle}
                  value={adicao}
                  onChangeText={setAdicao}
                  placeholder="+2.00"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numbers-and-punctuation"
                />
              </View>

              <View style={styles.halfWidth}>
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
              </View>
            </View>
          </GlassView>

          {/* Botão Salvar */}
          <ModernButton
            title="Salvar Cliente"
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
  eyeTitle: {
    marginTop: 12,
    marginBottom: 12,
    fontSize: 16,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
});