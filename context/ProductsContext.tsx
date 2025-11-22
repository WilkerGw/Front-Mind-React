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
  const [products, setProducts] = useState<Produto[]>([]);

  // Função de busca recriada com useCallback
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error('Falha ao buscar produtos da API');
      const data: Produto[] = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData: Omit<Produto, '_id'>) => {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Falha ao salvar o produto na API');
      const newProduct = await response.json();
      setProducts((current) => [newProduct, ...current]);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o novo produto.');
    }
  };

  const getProductById = (id: string): Produto | undefined => {
    return products.find((product) => product._id === id);
  };

  const getProductByCodigo = (codigo: string): Produto | undefined => {
    const codigoLimpo = codigo.toLowerCase();
    return products.find((product) =>
      product?.codigo.toLowerCase() === codigoLimpo
    );
  };

  const updateProduct = async (id: string, productData: Omit<Produto, '_id'>) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Falha ao atualizar o produto na API');
      const updatedProduct = await response.json();
      setProducts((current) =>
        current.map((p) => (p._id === id ? updatedProduct : p))
      );
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o produto.');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao eliminar o produto na API');
      setProducts((current) =>
        current.filter((p) => p._id !== id)
      );
    } catch (error) {
      console.error('Erro ao eliminar produto:', error);
      Alert.alert('Erro', 'Não foi possível eliminar o produto.');
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        getProductById,
        updateProduct,
        deleteProduct,
        getProductByCodigo,
        refreshProducts: fetchProducts,
        isLoading
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts deve ser usado dentro de um ProductsProvider');
  }
  return context;
}