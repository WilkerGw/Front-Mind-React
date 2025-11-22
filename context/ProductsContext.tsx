import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

// ✅ SEU IP CORRETO ATUALIZADO
import { API_URL } from '../constants/Api';

export const TIPOS_PRODUTO = ['Óculos de Grau', 'Óculos de Sol', 'Lente', 'Lente de Contato', 'Acessório', 'Outro'] as const;
export type TipoProduto = typeof TIPOS_PRODUTO[number];

export type Produto = {
  _id: string;
  codigo: string;
  nome: string;
  tipo: TipoProduto;
  marca: string;
  precoCusto?: number;
  precoVenda: number;
  estoque: number;
};

type ProductsContextType = {
  products: Produto[];
  addProduct: (productData: Omit<Produto, '_id'>) => void;
  getProductById: (id: string) => Produto | undefined;
  updateProduct: (id: string, productData: Omit<Produto, '_id'>) => void;
  deleteProduct: (id: string) => void;
  getProductByCodigo: (codigo: string) => Produto | undefined;
  refreshProducts: () => Promise<void>; // Nova função
  isLoading: boolean;
};

// @ts-ignore
const ProductsContext = createContext<ProductsContextType>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  export function useProducts() {
    const context = useContext(ProductsContext);
    if (!context) {
      throw new Error('useProducts deve ser usado dentro de um ProductsProvider');
    }
    return context;
  }