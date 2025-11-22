import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

import { Cliente } from './ClientsContext';
import { Produto } from './ProductsContext';

import { API_URL } from '../constants/Api';

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
  ordemServico?: { status: string };
};

export type ItemVendaInput = {
  produto: string;
  quantidade: number;
  valorUnitario: number;
};

export type VendaInput = {
  cliente: string;
  produtos: ItemVendaInput[];
  valorTotal: number;
  status: string;
  pagamento: Omit<Pagamento, '_id'>;
};

type SalesContextType = {
  sales: Venda[];
  addSale: (saleData: VendaInput) => void;
  getSaleById: (id: string) => Venda | undefined;
  deleteSale: (id: string) => void;
  updateSaleStatus: (id: string, status: string) => Promise<void>;
  refreshSales: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

// @ts-ignore
const SalesContext = createContext<SalesContextType>(null as any);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState<Venda[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/sales`);
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Falha ao buscar vendas: ${msg}`);
      }
      const data: Venda[] = await response.json();
      const parsed = data.map(sale => ({
        ...sale,
        dataVenda: new Date(sale.dataVenda),
      }));
      setSales(parsed);
    } catch (err) {
      console.error('Erro ao buscar vendas:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

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
      fetchSales();
    } catch (e) {
      console.error('Erro ao adicionar venda:', e);
      Alert.alert('Erro', 'Não foi possível salvar a nova venda.');
    }
  };

  const getSaleById = (id: string): Venda | undefined => {
    return sales.find(s => s._id === id);
  };

  const deleteSale = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/sales/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao cancelar a venda');
      fetchSales();
    } catch (e) {
      console.error('Erro ao cancelar venda:', e);
      Alert.alert('Erro', 'Não foi possível cancelar a venda.');
    }
  };

  const updateSaleStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${API_URL}/api/sales/${id}/os-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Falha ao atualizar status na API');
      setSales(current =>
        current.map(sale =>
          sale._id === id ? { ...sale, ordemServico: { ...sale.ordemServico, status } } : sale
        )
      );
    } catch (e) {
      console.error('Erro ao atualizar status:', e);
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
      throw e;
    }
  };

  return (
    <SalesContext.Provider
      value={{
        sales,
        addSale,
        getSaleById,
        deleteSale,
        updateSaleStatus,
        refreshSales: fetchSales,
        isLoading,
        error,
      }}
    >
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