import { StyleSheet, TextInput, Button, ScrollView, Platform, KeyboardAvoidingView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useProducts, TipoProduto, TIPOS_PRODUTO } from '@/context/ProductsContext';
import { Picker } from '@react-native-picker/picker';

export default function AddProductScreen() {
  const router = useRouter();
  const { addProduct } = useProducts();
  
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoProduto>('Armação');
  const [marca, setMarca] = useState('');
  const [precoCusto, setPrecoCusto] = useState(''); // NOVO CAMPO
  const [precoVenda, setPrecoVenda] = useState('');
  const [estoque, setEstoque] = useState('');

  const theme = useColorScheme() ?? 'light';
  const inputStyle = { ...styles.input, color: Colors[theme].text, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' };
  const pickerContainerStyle = { ...styles.pickerContainer, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' };
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
      precoCusto: parseFloat(precoCusto.replace(',', '.')) || 0, // Adicionado
      precoVenda: parseFloat(precoVenda.replace(',', '.')) || 0,
      estoque: parseInt(estoque) || 0,
    });

    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView>
          <ThemedText style={styles.label}>Código do Produto</ThemedText>
          <TextInput style={inputStyle} value={codigo} onChangeText={setCodigo} placeholder="Ex: RB3025" placeholderTextColor={placeholderColor} />

          <ThemedText style={styles.label}>Nome do Produto</ThemedText>
          <TextInput style={inputStyle} value={nome} onChangeText={setNome} placeholder="Ex: Ray-Ban Aviator" placeholderTextColor={placeholderColor} />

          <ThemedText style={styles.label}>Tipo</ThemedText>
          <View style={pickerContainerStyle}>
            <Picker selectedValue={tipo} onValueChange={(itemValue) => setTipo(itemValue)} style={{ color: Colors[theme].text }}>
              {TIPOS_PRODUTO.map((tipoProduto) => (
                <Picker.Item key={tipoProduto} label={tipoProduto} value={tipoProduto} />
              ))}
            </Picker>
          </View>

          <ThemedText style={styles.label}>Marca</ThemedText>
          <TextInput style={inputStyle} value={marca} onChangeText={setMarca} placeholder="Ex: Ray-Ban" placeholderTextColor={placeholderColor} />

          {/* NOVO CAMPO */}
          <ThemedText style={styles.label}>Preço de Custo (R$)</ThemedText>
          <TextInput style={inputStyle} value={precoCusto} onChangeText={setPrecoCusto} placeholder="80,00" placeholderTextColor={placeholderColor} keyboardType="numbers-and-punctuation" />

          <ThemedText style={styles.label}>Preço de Venda (R$)</ThemedText>
          <TextInput style={inputStyle} value={precoVenda} onChangeText={setPrecoVenda} placeholder="150,00" placeholderTextColor={placeholderColor} keyboardType="numbers-and-punctuation" />

          <ThemedText style={styles.label}>Estoque (Qtd)</ThemedText>
          <TextInput style={inputStyle} value={estoque} onChangeText={setEstoque} placeholder="10" placeholderTextColor={placeholderColor} keyboardType="numeric" />

          <Button title="Salvar Produto" onPress={handleSave} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

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
});