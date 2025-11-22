import { StyleSheet, View, ScrollView, Alert, ActivityIndicator, Pressable, TextInput, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { useClients } from '@/context/ClientsContext';
import { useProducts, Produto } from '@/context/ProductsContext';
import { useSales, METODOS_PAGAMENTO, CONDICOES_PAGAMENTO, Pagamento } from '@/context/SalesContext';

import { Picker } from '@react-native-picker/picker';
import { MaskedTextInput } from 'react-native-mask-text';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassView } from '@/components/ui/GlassView';
import { ModernButton } from '@/components/ui/ModernButton';

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
    backgroundColor: theme === 'dark' ? 'rgba(51, 51, 51, 0.5)' : 'rgba(240, 240, 240, 0.5)',
    color: Colors[theme].text,
    borderRadius: 12,
    marginBottom: 16,
  };
  const inputStyle = {
    ...styles.input,
    color: Colors[theme].text,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    backgroundColor: theme === 'dark' ? 'rgba(51, 51, 51, 0.5)' : 'rgba(240, 240, 240, 0.5)'
  };

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
      Alert.alert(
        'Cliente não encontrado',
        `Nenhum cliente cadastrado com o CPF ${cpfInput}. Deseja cadastrar um novo cliente?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              setClienteId(null);
              setCpfInput('');
            }
          },
          {
            text: 'Cadastrar Cliente',
            onPress: () => {
              router.push({
                pathname: '/add-client',
                params: { cpf: cpfInput }
              });
            }
          }
        ]
      );
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
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[theme].tint} />
        </View>
      </ScreenBackground>
    );
  }

  const totalVenda = calcularTotal();
  const valorEntradaSeguro = isNaN(pagamento.valorEntrada) ? 0 : pagamento.valorEntrada;
  const totalRestante = totalVenda - valorEntradaSeguro;

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
          <ThemedText type="title">Nova Venda</ThemedText>
          <View style={{ width: 42 }} />
        </View>
      </GlassView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Selecionar Cliente */}
        <GlassView style={styles.section} delay={50}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <IconSymbol name="person.fill" size={20} color={Colors[theme].tint} /> Cliente
          </ThemedText>

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
        </GlassView>

        {/* Adicionar Produtos */}
        <GlassView style={styles.section} delay={75}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <IconSymbol name="cube.fill" size={20} color={Colors[theme].tint} /> Produtos
          </ThemedText>

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

          <ModernButton
            title="Adicionar ao Carrinho"
            onPress={handleAddProduto}
            disabled={!produtoId}
            style={{ opacity: !produtoId ? 0.5 : 1 }}
          />
        </GlassView>

        {/* Carrinho */}
        <GlassView style={styles.section} delay={100}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <IconSymbol name="cart.fill" size={20} color={Colors[theme].tint} /> Itens da Venda
          </ThemedText>

          {itens.length === 0 ? (
            <View style={styles.emptyCart}>
              <IconSymbol name="cart" size={48} color={Colors[theme].icon} style={{ opacity: 0.3 }} />
              <ThemedText style={{ opacity: 0.6, marginTop: 8 }}>Carrinho vazio</ThemedText>
            </View>
          ) : (
            <>
              {itens.map(item => (
                <GlassView key={item.produto._id} style={styles.itemCard} delay={0} intensity={60}>
                  <View style={styles.itemInfo}>
                    <ThemedText type="defaultSemiBold">{item.produto.nome}</ThemedText>
                    <ThemedText style={styles.itemText}>
                      {item.quantidade} x R$ {item.produto.precoVenda.toFixed(2).replace('.', ',')} = R$ {(item.quantidade * item.produto.precoVenda).toFixed(2).replace('.', ',')}
                    </ThemedText>
                  </View>
                  <Pressable onPress={() => handleRemoveItem(item.produto._id)} style={styles.deleteButton}>
                    <IconSymbol name="trash.fill" size={20} color="#EF4444" />
                  </Pressable>
                </GlassView>
              ))}

              <View style={styles.totalContainer}>
                <ThemedText type="title" style={styles.totalText}>
                  Total: R$ {totalVenda.toFixed(2).replace('.', ',')}
                </ThemedText>
              </View>
            </>
          )}
        </GlassView>

        {/* Pagamento */}
        <GlassView style={styles.section} delay={125}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <IconSymbol name="dollarsign.circle.fill" size={20} color={Colors[theme].tint} /> Pagamento
          </ThemedText>

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

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <ThemedText style={styles.label}>Valor da Entrada (R$)</ThemedText>
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
                  setPagamento(p => ({ ...p, valorEntrada: numericValue }));
                }}
                defaultValue="0,00"
                style={inputStyle}
                placeholder="R$ 0,00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.halfWidth}>
              <ThemedText style={styles.label}>Total Restante</ThemedText>
              <View style={[inputStyle, styles.totalRestanteDisplay]}>
                <ThemedText type="defaultSemiBold" style={{ color: Colors[theme].tint }}>
                  R$ {totalRestante.toFixed(2).replace('.', ',')}
                </ThemedText>
              </View>
            </View>
          </View>
        </GlassView>

        {/* Botão Finalizar */}
        <ModernButton
          title="Finalizar Venda"
          onPress={handleSave}
          style={styles.saveButton}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  totalContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(96, 165, 250, 0.2)',
  },
  totalText: {
    textAlign: 'right',
    fontSize: 20,
    color: '#10B981',
  },
  totalRestanteDisplay: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  saveButton: {
    marginTop: 8,
  },
});