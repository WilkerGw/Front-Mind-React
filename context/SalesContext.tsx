import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid'; // Ainda precisamos disto para o _id do item

const API_URL = 'http://192.168.0.84:4000'; 

// Tipos de Pagamento (sem mudanças)
export const METODOS_PAGAMENTO = ['Dinheiro', 'Pix', 'Cartão de Débito', 'Cartão de Crédito'] as const;
export type MetodoPagamento = typeof METODOS_PAGAMENTO[number];
export const CONDICOES_PAGAMENTO = ['À vista', 'A prazo'] as const;
export type CondicaoPagamento = typeof CONDICOES_PAGAMENTO[number];

// Tipo Pagamento (sem mudanças)
export type Pagamento = {
  _id: string;
  valorEntrada: number;
  valorRestante: number;
  metodoPagamento: MetodoPagamento;
  condicaoPagamento: CondicaoPagamento;
  parcelas: number;
};

// 1. Item da Venda (ATUALIZADO)
export type ItemVenda = {
  _id: string; 
  produto: string; // MUDANÇA: de 'produtoId' para 'produto' (armazenará o _id)
  quantidade: number;
  valorUnitario: number; 
};

// 2. Venda (ATUALIZADO)
export type Venda = {
  _id: string; 
  cliente: string; // MUDANÇA: de 'clientId' (string) para 'cliente' (string)
  produtos: ItemVenda[]; 
  valorTotal: number;
  dataVenda: Date;
  status: 'Concluído' | 'Pendente' | 'Cancelado';
  pagamento: Pagamento;
};

// 3. Dados Fictícios (ATUALIZADOS)
const MOCK_SALES: Venda[] = [
  {
    _id: "6917728c7e19333823e94c15",
    cliente: "691772617e19333823e94c10", // MUDANÇA: 'clientId' -> 'cliente'
    produtos: [
      { _id: "6917728c7e19333823e94c16", produto: "68fd3d37136c7ae4d23abd21", quantidade: 1, valorUnitario: 150.00 } // MUDANÇA: 'produtoId' -> 'produto'
    ],
    valorTotal: 150.00,
    dataVenda: new Date(),
    status: "Concluído",
    pagamento: {
      _id: "6917728c7e19333823e94c17",
      valorEntrada: 150.00,
      valorRestante: 0,
      metodoPagamento: "Cartão de Crédito",
      condicaoPagamento: "À vista",
      parcelas: 1,
    }
  }
];

// 4. Definição do Contexto (sem mudanças)
type SalesContextType = {
  sales: Venda[];
  addSale: (saleData: Omit<Venda, '_id' | 'dataVenda'>) => void;
  getSaleById: (id: string) => Venda | undefined; 
  deleteSale: (id: string) => void; 
  isLoading: boolean;
};

// @ts-ignore
const SalesContext = createContext<SalesContextType>(null);

// 5. Provedor
export function SalesProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true); 
  const [sales, setSales] = useState<Venda[]>([]); // Inicia vazio

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch(`${API_URL}/api/sales`);
        if (!response.ok) throw new Error('Falha ao buscar vendas');
        let data: Venda[] = await response.json();
        data = data.map(sale => ({
          ...sale,
          dataVenda: new Date(sale.dataVenda), 
        }));
        setSales(data);
      } catch (error) {
        console.error('Erro ao buscar vendas:', error);
        Alert.alert('Erro de Conexão', 'Não foi possível buscar as vendas da API.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  // (addSale, getSaleById, deleteSale estão corretos e já usam a API)
  const addSale = async (saleData: Omit<Venda, '_id' | 'dataVenda'>) => {
    try {
      const response = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });
      if (!response.ok) {
        // Log extra para depuração
        const err = await response.json();
        console.error('API Error:', err);
        throw new Error('Falha ao salvar a venda');
      }
      let newSale: Venda = await response.json();
      newSale.dataVenda = new Date(newSale.dataVenda); 
      setSales((current) => 
        [newSale, ...current].sort((a, b) => b.dataVenda.getTime() - a.dataVenda.getTime())
      );
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      Alert.alert('Erro', 'Não foi possível salvar a nova venda.');
    }
  };
  const getSaleById = (id: string): Venda | undefined => {
    return sales.find((sale) => sale._id === id);
  };
  const deleteSale = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/sales/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao cancelar a venda');
      setSales((current) => 
        current.filter((sale) => sale._id !== id)
      );
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      Alert.alert('Erro', 'Não foi possível cancelar a venda.');
    }
  };

  return (
    <SalesContext.Provider value={{ sales, addSale, getSaleById, deleteSale, isLoading }}>
      {children}
    </SalesContext.Provider>
  );
}

// 6. Hook
export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales deve ser usado dentro de um SalesProvider');
  }
  return context;
}