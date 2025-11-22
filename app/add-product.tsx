import { StyleSheet, TextInput, ScrollView, Platform, KeyboardAvoidingView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useProducts, TipoProduto, TIPOS_PRODUTO } from '@/context/ProductsContext';
import { Picker } from '@react-native-picker/picker';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassView } from '@/components/ui/GlassView';
import { ModernButton } from '@/components/ui/ModernButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MaskedTextInput } from 'react-native-mask-text';

export default function AddProductScreen() {
  const router = useRouter();
  const { addProduct } = useProducts();

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoProduto>('Armação');
  const [marca, setMarca] = useState('');
  const [precoCusto, setPrecoCusto] = useState(0);
  const [precoVenda, setPrecoVenda] = useState(0);
  const [estoque, setEstoque] = useState('');

  const theme = useColorScheme() ?? 'light';
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

  const handleSave = () => {
    if (!nome || !precoVenda || !estoque || !codigo) {
      alert('Código, Nome, Preço de Venda e Estoque são obrigatórios.');
      return;
    }

    addProduct({
      codigo,
      nome,
      tipo,
      marca,
      precoCusto,
      precoVenda,
      estoque: parseInt(estoque) || 0,
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
          <ThemedText type="title">Novo Produto</ThemedText>
          <View style={{ width: 42 }} />
        </View>
      </GlassView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Informações Básicas */}
          <GlassView style={styles.section} delay={50}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="cube.fill" size={20} color={Colors[theme].tint} /> Informações Básicas
            </ThemedText>

            <ThemedText style={styles.label}>Código do Produto *</ThemedText>
            <TextInput
              style={inputStyle}
              value={codigo}
              onChangeText={setCodigo}
              placeholder="Ex: RB3025"
              placeholderTextColor={placeholderColor}
              autoCapitalize="characters"
            />

            <ThemedText style={styles.label}>Nome do Produto *</ThemedText>
            <TextInput
              style={inputStyle}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Ray-Ban Aviator"
              placeholderTextColor={placeholderColor}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Tipo *</ThemedText>
                <View style={pickerStyle}>
                  <Picker
                    selectedValue={tipo}
                    onValueChange={(itemValue) => setTipo(itemValue)}
                    style={{ color: Colors[theme].text }}
                  >
                    {TIPOS_PRODUTO.map((tipoProduto) => (
                      <Picker.Item key={tipoProduto} label={tipoProduto} value={tipoProduto} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Marca</ThemedText>
                <TextInput
                  style={inputStyle}
                  value={marca}
                  onChangeText={setMarca}
                  placeholder="Ex: Ray-Ban"
                  placeholderTextColor={placeholderColor}
                />
              </View>
            </View>
          </GlassView>

          {/* Pricing & Estoque */}
          <GlassView style={styles.section} delay={75}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="dollarsign.circle.fill" size={20} color={Colors[theme].tint} /> Preços & Estoque
            </ThemedText>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Preço de Custo (R$)</ThemedText>
                <MaskedTextInput
                  type="currency"
                  options={{
                    prefix: 'R$ ',
                    decimalSeparator: ',',
                    groupSeparator: '.',
                    precision: 2
                  }}
                  onChangeText={(text) => {
                    const onlyNumbers = text.replace(/\D/g, "");
                    const numericValue = Number(onlyNumbers) / 100;
                    setPrecoCusto(numericValue);
                  }}
                  defaultValue="0,00"
                  style={inputStyle}
                  placeholder="R$ 0,00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Preço de Venda (R$) *</ThemedText>
                <MaskedTextInput
                  type="currency"
                  options={{
                    prefix: 'R$ ',
                    decimalSeparator: ',',
                    groupSeparator: '.',
                    precision: 2
                  }}
                  onChangeText={(text) => {
                    const onlyNumbers = text.replace(/\D/g, "");
                    const numericValue = Number(onlyNumbers) / 100;
                    setPrecoVenda(numericValue);
                  }}
                  defaultValue="0,00"
                  style={inputStyle}
                  placeholder="R$ 0,00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Estoque (Qtd) *</ThemedText>
                <TextInput
                  style={inputStyle}
                  value={estoque}
                  onChangeText={setEstoque}
                  placeholder="10"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth} />
            </View>
          </GlassView>

          {/* Botão Salvar */}
          <ModernButton
            title="Salvar Produto"
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
});