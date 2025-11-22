import { StyleSheet, TextInput, ScrollView, Platform, KeyboardAvoidingView, View, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useProducts, TipoProduto, TIPOS_PRODUTO } from '@/context/ProductsContext';
import { Picker } from '@react-native-picker/picker';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassView } from '@/components/ui/GlassView';
import { ModernButton } from '@/components/ui/ModernButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MaskedTextInput } from 'react-native-mask-text';

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById, updateProduct, deleteProduct } = useProducts();

  const productToEdit = getProductById(id);

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoProduto>('Armação');
  const [marca, setMarca] = useState('');
  const [precoCusto, setPrecoCusto] = useState(0);
  const [precoVenda, setPrecoVenda] = useState(0);
  const [estoque, setEstoque] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setCodigo(productToEdit.codigo);
      setNome(productToEdit.nome);
      setTipo(productToEdit.tipo);
      setMarca(productToEdit.marca);
      setPrecoCusto(productToEdit.precoCusto || 0);
      setPrecoVenda(productToEdit.precoVenda);
      setEstoque(productToEdit.estoque.toString());
    }
  }, [productToEdit]);

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

  const handleUpdate = () => {
    if (!nome || !precoVenda || !estoque || !codigo) {
      alert('Código, Nome, Preço de Venda e Estoque são obrigatórios.');
      return;
    }

    updateProduct(id, {
      codigo,
      nome,
      tipo,
      marca,
      precoCusto,
      precoVenda,
      estoque: parseInt(estoque) || 0,
    });

    Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja eliminar este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteProduct(id);
            router.back();
          }
        }
      ]
    );
  };

  const margemLucro = precoVenda > 0 && precoCusto > 0
    ? ((precoVenda - precoCusto) / precoCusto * 100).toFixed(1)
    : '0';

  if (!productToEdit) {
    return (
      <ScreenBackground>
        <View style={styles.notFoundContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={Colors[theme].icon} />
          <ThemedText style={{ marginTop: 16 }}>Produto não encontrado.</ThemedText>
          <ModernButton title="Voltar" onPress={() => router.back()} style={{ marginTop: 24 }} />
        </View>
      </ScreenBackground>
    );
  }

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
          <ThemedText type="title" numberOfLines={1} style={{ flex: 1, textAlign: 'center', marginHorizontal: 8 }}>
            {nome || 'Produto'}
          </ThemedText>
          <ModernButton
            title=""
            onPress={() => {/* Editar */ }}
            style={styles.backButton}
            icon={<IconSymbol name="pencil" size={20} color={Colors[theme].tint} />}
          />
        </View>
      </GlassView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Informações Básicas */}
          <GlassView style={styles.section} delay={50}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Código</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.infoValue}>{codigo}</ThemedText>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Tipo</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.infoValue}>{tipo}</ThemedText>
              </View>
            </View>
          </GlassView>

          {/* Detalhes do Produto */}
          <GlassView style={styles.section} delay={75}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="cube.fill" size={20} color={Colors[theme].tint} /> Detalhes do Produto
            </ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Nome</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.detailValue}>{nome}</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Marca</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.detailValue}>{marca || '-'}</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Tipo</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.detailValue}>{tipo}</ThemedText>
            </View>
          </GlassView>

          {/* Preços */}
          <GlassView style={styles.section} delay={100}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="dollarsign.circle.fill" size={20} color={Colors[theme].tint} /> Preços
            </ThemedText>

            <View style={styles.priceGrid}>
              <View style={styles.priceCard}>
                <ThemedText style={styles.priceLabel}>Preço de Custo</ThemedText>
                <ThemedText type="title" style={styles.priceValue}>
                  R$ {precoCusto.toFixed(2).replace('.', ',')}
                </ThemedText>
              </View>

              <View style={styles.priceCard}>
                <ThemedText style={styles.priceLabel}>Preço de Venda</ThemedText>
                <ThemedText type="title" style={[styles.priceValue, { color: '#10B981' }]}>
                  R$ {precoVenda.toFixed(2).replace('.', ',')}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.margemCard, { backgroundColor: parseFloat(margemLucro) > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
              <IconSymbol
                name={parseFloat(margemLucro) > 0 ? "arrow.up.right" : "arrow.down.right"}
                size={20}
                color={parseFloat(margemLucro) > 0 ? '#10B981' : '#EF4444'}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Margem de Lucro</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: parseFloat(margemLucro) > 0 ? '#10B981' : '#EF4444' }}>
                  {margemLucro}%
                </ThemedText>
              </View>
            </View>
          </GlassView>

          {/* Estoque */}
          <GlassView style={styles.section} delay={125}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="cube.box.fill" size={20} color={Colors[theme].tint} /> Estoque
            </ThemedText>

            <View style={styles.estoqueCard}>
              <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>Quantidade Disponível</ThemedText>
              <ThemedText type="title" style={{ fontSize: 32, marginTop: 8 }}>
                {estoque}
              </ThemedText>
            </View>
          </GlassView>

          {/* Editar Informações */}
          <GlassView style={styles.section} delay={150}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              <IconSymbol name="pencil" size={20} color={Colors[theme].tint} /> Editar Informações
            </ThemedText>

            <ThemedText style={styles.label}>Código do Produto</ThemedText>
            <TextInput
              style={inputStyle}
              value={codigo}
              onChangeText={setCodigo}
              placeholder="Ex: RB3025"
              placeholderTextColor={placeholderColor}
              autoCapitalize="characters"
            />

            <ThemedText style={styles.label}>Nome do Produto</ThemedText>
            <TextInput
              style={inputStyle}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Ray-Ban Aviator"
              placeholderTextColor={placeholderColor}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Tipo</ThemedText>
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
                  value={`R$ ${precoCusto.toFixed(2).replace('.', ',')}`}
                  onChangeText={(text) => {
                    const onlyNumbers = text.replace(/\D/g, "");
                    const numericValue = Number(onlyNumbers) / 100;
                    setPrecoCusto(numericValue);
                  }}
                  style={inputStyle}
                  placeholder="R$ 0,00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Preço de Venda (R$)</ThemedText>
                <MaskedTextInput
                  type="currency"
                  options={{
                    prefix: 'R$ ',
                    decimalSeparator: ',',
                    groupSeparator: '.',
                    precision: 2
                  }}
                  value={`R$ ${precoVenda.toFixed(2).replace('.', ',')}`}
                  onChangeText={(text) => {
                    const onlyNumbers = text.replace(/\D/g, "");
                    const numericValue = Number(onlyNumbers) / 100;
                    setPrecoVenda(numericValue);
                  }}
                  style={inputStyle}
                  placeholder="R$ 0,00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Estoque (Qtd)</ThemedText>
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

          {/* Botões de Ação */}
          <ModernButton
            title="Salvar Alterações"
            onPress={handleUpdate}
            style={styles.updateButton}
          />

          <ModernButton
            title="Eliminar Produto"
            onPress={handleDelete}
            style={[styles.deleteButton, { backgroundColor: 'rgba(107, 114, 128, 0.5)' }]}
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.1)',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 16,
  },
  priceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  priceCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
  },
  priceLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
  },
  margemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  estoqueCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
    alignItems: 'center',
  },
  updateButton: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 8,
  },
});