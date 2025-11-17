import { StyleSheet, TextInput, Button, ScrollView, Platform, KeyboardAvoidingView, View, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useMemo } from 'react'; 
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useClients, Cliente } from '@/context/ClientsContext';
import { useProducts, Produto } from '@/context/ProductsContext'; 
import { useSales, ItemVenda, Pagamento, MetodoPagamento, METODOS_PAGAMENTO, CondicaoPagamento, CONDICOES_PAGAMENTO } from '@/context/SalesContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
// 1. CORREÇÃO: Importar o Picker
import { Picker } from '@react-native-picker/picker';
import { v4 as uuidv4 } from 'uuid'; 

// Tipo temporário para o carrinho local
type CartItem = {
  _id: string;
  produtoId: string; // O ID de referência
  quantidade: number;
  valorUnitario: number;
  produto: Produto; // O objeto completo para UI
};

export default function AddSaleScreen() {
  const router = useRouter();
  const { addSale } = useSales();
  const { getClientByCPF } = useClients(); 
  const { getProductByCodigo } = useProducts(); 

  const [cpfInput, setCpfInput] = useState(''); 
  const [foundClient, setFoundClient] = useState<Cliente | null>(null); 
  const [cart, setCart] = useState<CartItem[]>([]); 
  
  const [codigoInput, setCodigoInput] = useState(''); 
  const [foundProduct, setFoundProduct] = useState<Produto | null>(null); 
  const [currentQty, setCurrentQty] = useState('1');

  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>('Dinheiro');
  const [condicaoPagamento, setCondicaoPagamento] = useState<CondicaoPagamento>('À vista');
  const [parcelas, setParcelas] = useState('1');
  const [valorEntrada, setValorEntrada] = useState('');

  const theme = useColorScheme() ?? 'light';
  const tintColor = Colors[theme].tint;
  const inputStyle = { ...styles.input, color: Colors[theme].text, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' };
  const pickerContainerStyle = { ...styles.pickerContainer, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' };
  
  const handleSearchClient = () => { /* ... (sem mudanças) ... */ 
    if (!cpfInput) return;
    const client = getClientByCPF(cpfInput);
    if (client) {
      setFoundClient(client);
    } else {
      setFoundClient(null);
      Alert.alert('Cliente não encontrado', 'Nenhum cliente encontrado com este CPF.');
    }
  };
  const handleSearchProduct = () => { /* ... (sem mudanças) ... */ 
    if (!codigoInput) return;
    const product = getProductByCodigo(codigoInput);
    if (product) {
      setFoundProduct(product);
    } else {
      setFoundProduct(null);
      Alert.alert('Produto não encontrado', 'Nenhum produto encontrado com este Código.');
    }
  };

  const handleAddProductToCart = () => {
    const product = foundProduct; 
    if (!product) { /* ... (validações) ... */ return; }
    const qty = parseInt(currentQty) || 0;
    // ... (validações de qty e estoque) ...

    const newCartItem: CartItem = {
      _id: uuidv4(), 
      produtoId: product._id, 
      quantidade: qty,
      valorUnitario: product.precoVenda,
      produto: product, 
    };
    setCart(currentCart => [...currentCart, newCartItem]);
    setCurrentQty('1'); 
    setFoundProduct(null); 
    setCodigoInput(''); 
  };
  
  const valorTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.valorUnitario * item.quantidade), 0);
  }, [cart]);
  const valorEntradaNum = useMemo(() => {
    return parseFloat(valorEntrada.replace(',', '.')) || 0;
  }, [valorEntrada]);
  const valorRestante = useMemo(() => {
    return valorTotal - valorEntradaNum;
  }, [valorTotal, valorEntradaNum]);

  // --- Lógica de Salvar ---
  const handleSaveSale = () => {
    if (!foundClient) { /* ... (validação) ... */ return; }
    if (cart.length === 0) { /* ... (validação) ... */ return; }

    const itensParaSalvar: ItemVenda[] = cart.map(item => ({
        _id: item._id,
        produto: item.produtoId, 
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
    }));
    
    const pagamento: Pagamento = {
      _id: uuidv4(),
      valorEntrada: valorEntradaNum,
      valorRestante: valorRestante,
      metodoPagamento: metodoPagamento,
      condicaoPagamento: condicaoPagamento,
      parcelas: parseInt(parcelas) || 1,
    };

    addSale({
      cliente: foundClient._id, 
      produtos: itensParaSalvar, 
      valorTotal: valorTotal,
      status: 'Concluído', 
      pagamento: pagamento,
    });
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView>
          {/* 1. SELEÇÃO DE CLIENTE */}
          <ThemedText type="subtitle" style={styles.title}>Cliente</ThemedText>
          <View style={styles.searchContainer}>
            <TextInput style={{ ...inputStyle, flex: 1, marginBottom: 0 }} value={cpfInput} onChangeText={setCpfInput} placeholder="Digite o CPF" placeholderTextColor={Colors[theme].icon} keyboardType="numbers-and-punctuation" />
            <Pressable style={styles.searchButton} onPress={handleSearchClient}>
              <IconSymbol name="magnifyingglass" size={24} color={tintColor} />
            </Pressable>
          </View>
          {foundClient && (
            <ThemedView style={styles.foundClientCard}>
              <ThemedText type="defaultSemiBold">{foundClient.fullName}</ThemedText>
            </ThemedView>
          )}

          {/* 2. ADICIONAR PRODUTOS */}
          <ThemedText type="subtitle" style={styles.title}>Adicionar Produtos</ThemedText>
          <View style={styles.searchContainer}>
            <TextInput style={{ ...inputStyle, flex: 1, marginBottom: 0 }} value={codigoInput} onChangeText={setCodigoInput} placeholder="Digite o Código do Produto" placeholderTextColor={Colors[theme].icon} autoCapitalize="characters" />
            <Pressable style={styles.searchButton} onPress={handleSearchProduct}>
              <IconSymbol name="magnifyingglass" size={24} color={tintColor} />
            </Pressable>
          </View>
          {foundProduct && (
            <ThemedView style={styles.foundProductCard}>
              <ThemedText type="defaultSemiBold">{foundProduct.nome}</ThemedText>
              <ThemedText>Estoque: {foundProduct.estoque} | Preço: R$ {foundProduct.precoVenda.toFixed(2)}</ThemedText>
            </ThemedView>
          )}
          <ThemedText style={styles.label}>Quantidade</ThemedText>
          <TextInput style={inputStyle} value={currentQty} onChangeText={setCurrentQty} keyboardType="numeric" />
          <Button title="Adicionar ao Carrinho" onPress={handleAddProductToCart} />

          {/* 3. CARRINHO */}
          <ThemedText type="subtitle" style={styles.title}>Carrinho</ThemedText>
          {cart.length === 0 ? (
            <ThemedText style={{textAlign: 'center', marginBottom: 16}}>O carrinho está vazio.</ThemedText>
          ) : (
            cart.map((item) => ( 
              <ThemedView key={item._id} style={styles.cartItem}>
                <ThemedText>{item.quantidade}x {item.produto.nome}</ThemedText>
                <ThemedText>R$ {(item.valorUnitario * item.quantidade).toFixed(2)}</ThemedText> 
              </ThemedView>
            ))
          )}
          <ThemedText type="title" style={styles.totalText}>
            Total: R$ {valorTotal.toFixed(2)}
          </ThemedText>

          {/* 4. SEÇÃO DE PAGAMENTO */}
          <ThemedText type="subtitle" style={styles.title}>Pagamento</ThemedText>

          <ThemedText style={styles.label}>Método de Pagamento</ThemedText>
          <View style={pickerContainerStyle}>
            {/* O Picker agora está importado corretamente */}
            <Picker selectedValue={metodoPagamento} onValueChange={(itemValue) => setMetodoPagamento(itemValue)} style={{ color: Colors[theme].text }}>
              {METODOS_PAGAMENTO.map((metodo) => (
                <Picker.Item key={metodo} label={metodo} value={metodo} />
              ))}
            </Picker>
          </View>

          <ThemedText style={styles.label}>Condição</ThemedText>
          <View style={pickerContainerStyle}>
            <Picker selectedValue={condicaoPagamento} onValueChange={(itemValue) => setCondicaoPagamento(itemValue)} style={{ color: Colors[theme].text }}>
              {CONDICOES_PAGAMENTO.map((cond) => (
                <Picker.Item key={cond} label={cond} value={cond} />
              ))}
            </Picker>
          </View>

          {metodoPagamento === 'Cartão de Crédito' && condicaoPagamento === 'A prazo' && (
            <>
              <ThemedText style={styles.label}>Parcelas</ThemedText>
              <TextInput style={inputStyle} value={parcelas} onChangeText={setParcelas} keyboardType="numeric" />
            </>
          )}
          <ThemedText style={styles.label}>Valor de Entrada (R$)</ThemedText>
          <TextInput style={inputStyle} value={valorEntrada} onChangeText={setValorEntrada} placeholder="0,00" placeholderTextColor={Colors[theme].icon} keyboardType="numbers-and-punctuation" />
          <ThemedText style={styles.label}>Valor Restante</ThemedText>
          <ThemedText style={styles.valorRestanteText}>R$ {valorRestante.toFixed(2)}</ThemedText>

          {/* 5. FINALIZAR */}
          <Button title="Finalizar Venda" onPress={handleSaveSale} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// ... (estilos não mudam)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: {
    marginBottom: 16,
    marginTop: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    paddingBottom: 8,
  },
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  searchButton: {
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foundClientCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'green',
    marginBottom: 20,
  },
  foundProductCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalText: {
    textAlign: 'right',
    marginTop: 16,
    marginBottom: 24,
  },
  valorRestanteText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
  }
});