import { StyleSheet, View, ScrollView, Button, Alert, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

// NÃO precisamos mais do crypto ou uuid aqui
// import * as Crypto from 'expo-crypto';

import { useClients, Cliente } from '@/context/ClientsContext';
import { useProducts, Produto } from '@/context/ProductsContext';
import { useSales, VendaInput, METODOS_PAGAMENTO, CONDICOES_PAGAMENTO, Pagamento, MetodoPagamento, CondicaoPagamento } from '@/context/SalesContext'; 

import { Picker } from '@react-native-picker/picker';
import { MaskedTextInput } from 'react-native-mask-text';

type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
}
type PagamentoInput = Omit<Pagamento, '_id'>

export default function AddSaleScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  
  const { clients, isLoading: isLoadingClients, getClientByCPF } = useClients();
  const { products, isLoading: isLoadingProducts, getProductByCodigo } = useProducts();
  const { addSale } = useSales();

  const [clienteId, setClienteId] = useState<string | null>(null);
  const [produtoId, setProdutoId] = useState<string | null>(null);
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  
  const [cpfInput, setCpfInput] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  
  const [pagamento, setPagamento] = useState<PagamentoInput>({
    valorEntrada: 0,
    valorRestante: 0,
    metodoPagamento: 'Dinheiro',
    condicaoPagamento: 'À vista',
    parcelas: 1,
  });
  
  const pickerStyle = {
    backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
    color: Colors[theme].text,
    borderWidth: 0,
    marginBottom: 20,
  };
  const inputStyle = { ...styles.input, color: Colors[theme].text, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' };

  const handleAddProduto = () => {
    if (!produtoId) return;
    const produtoSelecionado = products.find(p => p._id === produtoId);
    if (!produtoSelecionado) return;

    const itemExistente = itens.find(item => item.produto._id === produtoId);
    if (itemExistente) {
      setItens(itens.map(item => 
        item.produto._id === produtoId ? { ...item, quantidade: item.quantidade + 1 } : item
      ));
    } else {
      setItens([...itens, { produto: produtoSelecionado, quantidade: 1 }]);
    }
    setProdutoId(null); 
    setCodigoInput(''); 
  };

  const handleRemoveItem = (prodId: string) => {
    setItens(itens.filter(item => item.produto._id !== prodId));
  };
  
  const calcularTotal = () => {
    return itens.reduce((acc, item) => acc + (item.produto.precoVenda * item.quantidade), 0);
  };
  
  const handleSave = () => {
    if (!clienteId) {
      Alert.alert('Erro', 'Selecione um cliente para a venda.');
      return;
    }
    if (itens.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um produto à venda.');
      return;
    }

    // CORREÇÃO: Não enviamos _id. O Mongo gera.
    const itensVenda = itens.map(item => ({
      produto: item.produto._id, 
      quantidade: item.quantidade,
      valorUnitario: item.produto.precoVenda,
    }));

    const valorTotal = itensVenda.reduce((acc, item) => acc + (item.valorUnitario * item.quantidade), 0);
    
    const valorRestanteCalculado = valorTotal - pagamento.valorEntrada;
    const pagamentoFinal = {
      ...pagamento,
      valorRestante: valorRestanteCalculado < 0 ? 0 : valorRestanteCalculado,
    };

    // Enviamos apenas os dados necessários
    addSale({
      cliente: clienteId!, 
      produtos: itensVenda,
      valorTotal,
      status: 'Concluído', 
      pagamento: pagamentoFinal,
    });

    router.back();
  };
  
  const handleSearchCPF = () => {
    if (!cpfInput) return;
    const clienteEncontrado = getClientByCPF(cpfInput);
    if (clienteEncontrado) {
      setClienteId(clienteEncontrado._id); 
    } else {
      Alert.alert('Não encontrado', 'Nenhum cliente encontrado com este CPF.');
      setClienteId(null);
      setCpfInput('');
    }
  };
  
  const handleSearchCodigo = () => {
    if (!codigoInput) return;
    const produtoEncontrado = getProductByCodigo(codigoInput);
    if (produtoEncontrado) {
      setProdutoId(produtoEncontrado._id);
    } else {
      Alert.alert('Não encontrado', 'Nenhum produto encontrado com este código.');
      setProdutoId(null);
      setCodigoInput('');
    }
  };

  if (isLoadingClients || isLoadingProducts) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  // Cálculos seguros
  const totalVenda = calcularTotal();
  const valorEntradaSeguro = isNaN(pagamento.valorEntrada) ? 0 : pagamento.valorEntrada;
  const totalRestante = totalVenda - valorEntradaSeguro;

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText type="subtitle" style={styles.title}>Cliente</ThemedText>
        
        <ThemedText style={styles.label}>Buscar por CPF</ThemedText>
        <MaskedTextInput
          mask="999.999.999-99"
          value={cpfInput}
          onChangeText={setCpfInput}
          style={inputStyle}
          placeholder="000.000.000-00"
          keyboardType="numeric"
          onBlur={handleSearchCPF} 
        />
        
        <ThemedText style={styles.label}>Ou selecione na lista</ThemedText>
        <View style={pickerStyle}>
          <Picker
            selectedValue={clienteId}
            onValueChange={(itemValue) => {
              setClienteId(itemValue);
              const cliente = clients.find(c => c._id === itemValue);
              setCpfInput(cliente?.cpf ?? ''); 
            }}
            prompt="Selecione um Cliente"
          >
            <Picker.Item label="Selecione um cliente..." value={null} />
            {clients.map((client) => (
              <Picker.Item key={client._id} label={client.fullName} value={client._id} />
            ))}
          </Picker>
        </View>

        <ThemedText type="subtitle" style={styles.title}>Produtos</ThemedText>
        
        <ThemedText style={styles.label}>Buscar por Código</ThemedText>
        <TextInput
          value={codigoInput}
          onChangeText={setCodigoInput}
          style={inputStyle}
          placeholder="Digite o código do produto"
          autoCapitalize="none"
          onBlur={handleSearchCodigo} 
        />
        
        <ThemedText style={styles.label}>Ou selecione na lista</ThemedText>
        <View style={pickerStyle}>
          <Picker
            selectedValue={produtoId}
            onValueChange={(itemValue) => {
              setProdutoId(itemValue);
              const produto = products.find(p => p._id === itemValue);
              setCodigoInput(produto?.codigo ?? '');
            }}
            prompt="Selecione um Produto"
          >
            <Picker.Item label="Selecione um produto..." value={null} />
            {products.map((prod) => (
              <Picker.Item key={prod._id} label={`${prod.nome} (R$ ${prod.precoVenda.toFixed(2)})`} value={prod._id} />
            ))}
          </Picker>
        </View>
        <Button title="Adicionar Produto ao Carrinho" onPress={handleAddProduto} disabled={!produtoId} />

        <ThemedText type="subtitle" style={styles.title}>Itens da Venda</ThemedText>
        {itens.length === 0 ? (
          <ThemedText style={styles.itemText}>Carrinho vazio.</ThemedText>
        ) : (
          itens.map(item => (
            <ThemedView key={item.produto._id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <ThemedText type="defaultSemiBold">{item.produto.nome}</ThemedText>
                <ThemedText style={styles.itemText}>
                  {item.quantidade} x R$ {item.produto.precoVenda.toFixed(2).replace('.', ',')} = R$ {(item.quantidade * item.produto.precoVenda).toFixed(2).replace('.', ',')}
                </ThemedText>
              </View>
              <Pressable onPress={() => handleRemoveItem(item.produto._id)}>
                <IconSymbol name="trash.fill" size={22} color={Colors.light.danger} />
              </Pressable>
            </ThemedView>
          ))
        )}
        <ThemedText type="title" style={styles.totalText}>
          Total: R$ {totalVenda.toFixed(2).replace('.', ',')}
        </ThemedText>

        <ThemedText type="subtitle" style={styles.title}>Pagamento</ThemedText>
        <ThemedText style={styles.label}>Método de Pagamento</ThemedText>
        <View style={pickerStyle}>
          <Picker
            selectedValue={pagamento.metodoPagamento}
            onValueChange={(itemValue) => setPagamento(p => ({ ...p, metodoPagamento: itemValue }))}
          >
            {METODOS_PAGAMENTO.map(metodo => (
              <Picker.Item key={metodo} label={metodo} value={metodo} />
            ))}
          </Picker>
        </View>
        
        <ThemedText style={styles.label}>Condição de Pagamento</ThemedText>
        <View style={pickerStyle}>
          <Picker
            selectedValue={pagamento.condicaoPagamento}
            onValueChange={(itemValue) => setPagamento(p => ({ ...p, condicaoPagamento: itemValue }))}
          >
            {CONDICOES_PAGAMENTO.map(cond => (
              <Picker.Item key={cond} label={cond} value={cond} />
            ))}
          </Picker>
        </View>
        
        <ThemedText style={styles.label}>Valor da Entrada (R$)</ThemedText>
         <MaskedTextInput
            type="currency"
            options={{
              prefix: 'R$ ',
              decimalSeparator: ',',
              groupSeparator: '.',
              precision: 2
            }}
            onChangeText={(text, rawText) => {
              const onlyNumbers = text.replace(/\D/g, ""); 
              const numericValue = Number(onlyNumbers) / 100;
              setPagamento(p => ({ ...p, valorEntrada: numericValue }));
            }}
            defaultValue="0,00"
            style={inputStyle}
            placeholder="R$ 0,00"
            keyboardType="numeric"
          />
        
        <ThemedText style={styles.label}>Total Restante</ThemedText>
        <ThemedText style={styles.totalText}>
          R$ {totalRestante.toFixed(2).replace('.', ',')}
        </ThemedText>
      </ScrollView>

      <Button title="Finalizar Venda" onPress={handleSave} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
  },
  totalText: {
    textAlign: 'right',
    marginTop: 10,
    marginBottom: 20,
  },
});