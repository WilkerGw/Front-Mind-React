import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';

import { Cliente } from './ClientsContext';
import { Produto } from './ProductsContext';

// ATENÇÃO AO IP
const API_URL = 'http://192.168.0.84:4000'; 

export const METODOS_PAGAMENTO = ['Dinheiro', 'Pix', 'Cartão de Débito', 'Cartão de Crédito'] as const;
export type MetodoPagamento = typeof METODOS_PAGAMENTO[number];
export const CONDICOES_PAGAMENTO = ['À vista', 'A prazo'] as const;
export type CondicaoPagamento = typeof CONDICOES_PAGAMENTO[number];

export type Pagamento = {
  _id?: string;
  valorEntrada: number;
  valorRestante: number;
  metodoPagamento: MetodoPagamento;
  condicaoPagamento: CondicaoPagamento;
  parcelas: number;
};

export type ItemVenda = {
  _id?: string;
  produto: Produto; 
  quantidade: number;
  valorUnitario: number; 
};

export type Venda = {
  _id: string; 
  cliente: Cliente; 
  produtos: ItemVenda[]; 
  valorTotal: number;
  dataVenda: Date;
  status: 'Concluído' | 'Pendente' | 'Cancelado';
  pagamento: Pagamento;
  ordemServico?: {
    status: string;
  };
};

export type ItemVendaInput = {
  produto: string; 
  quantidade: number;
  valorUnitario: number;
}

export type VendaInput = {
  cliente: string; 
  produtos: ItemVendaInput[];
  valorTotal: number;
  status: string;
  pagamento: Omit<Pagamento, '_id'>;
}

type SalesContextType = {
  sales: Venda[]; 
  addSale: (saleData: VendaInput) => void; 
  getSaleById: (id: string) => Venda | undefined; 
  deleteSale: (id: string) => void;
  // NOVA FUNÇÃO NO TIPO
  updateSaleStatus: (id: string, status: string) => Promise<void>; 
  isLoading: boolean;
};

// @ts-ignore
const SalesContext = createContext<SalesContextType>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true); 
  const [sales, setSales] = useState<Venda[]>([]); 
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true); 
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
        // Alert removido para evitar spam em dev, mas podes manter se quiseres
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, [refreshKey]); 

  const addSale = async (saleData: VendaInput) => {
    try {
      const response = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData), 
      });
      
      if (!response.ok) {
        const err = await response.json();
        Alert.alert('Erro ao salvar', err.message || 'Falha ao salvar a venda');
        return;
      }
      setRefreshKey(oldKey => oldKey + 1);
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
      setRefreshKey(oldKey => oldKey + 1);
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      Alert.alert('Erro', 'Não foi possível cancelar a venda.');
    }
  };

  // --- NOVA FUNÇÃO: Atualizar Status ---
  const updateSaleStatus = async (id: string, status: string) => {
    try {
      // 1. Atualiza no Backend
      const response = await fetch(`${API_URL}/api/sales/${id}/os-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Falha ao atualizar status na API');

      // 2. Atualiza no Estado Local (Memória) IMEDIATAMENTE
      setSales((currentSales) => 
        currentSales.map((sale) => {
          if (sale._id === id) {
            // Cria uma cópia da venda com o novo status
            return { 
              ...sale, 
              ordemServico: { ...sale.ordemServico, status } 
            };
          }
          return sale;
        })
      );

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
      throw error; // Lança o erro para o componente saber que falhou
    }
  };

  return (
    <SalesContext.Provider value={{ sales, addSale, getSaleById, deleteSale, updateSaleStatus, isLoading }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales deve ser usado dentro de um SalesProvider');
  }
  return context;
}