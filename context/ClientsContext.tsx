import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

// ---------------------------------------------------------
// ✅ SEU IP CORRETO (Atualizado)
import { API_URL } from '../constants/Api';
// ---------------------------------------------------------

// Tipos
export type Cliente = {
  _id: string;
  fullName: string;
  phone: string;
  birthDate?: string;
  cpf?: string;
  gender?: string;
  address?: string;
  cep?: string;
  notes?: string;
  esfericoDireito?: string;
  cilindricoDireito?: string;
  eixoDireito?: string;
  esfericoEsquerdo?: string;
  cilindricoEsquerdo?: string;
  eixoEsquerdo?: string;
  adicao?: string;
  vencimentoReceita?: string;
};

type ClientsContextType = {
  clients: Cliente[];
  addClient: (clientData: Omit<Cliente, '_id'>) => Promise<void>;
  getClientById: (id: string) => Cliente | undefined;
  updateClient: (id: string, clientData: Omit<Cliente, '_id'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientByCPF: (cpf: string) => Cliente | undefined;
  refreshClients: () => Promise<void>; // Função para recarregar manual
  isLoading: boolean;
};

// @ts-ignore
const ClientsContext = createContext<ClientsContextType>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Cliente[]>([]);

  // Função useCallback para poder ser chamada externamente (refresh)
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log(`Tentando conectar a: ${API_URL}/api/clients`);
      const response = await fetch(`${API_URL}/api/clients`);

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }

      const data: Cliente[] = await response.json();
      console.log('Clientes carregados com sucesso:', data.length);
      setClients(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar Clientes ao iniciar
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Adicionar Cliente
  const addClient = async (clientData: Omit<Cliente, '_id'>) => {
    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
      if (!response.ok) throw new Error('Falha ao salvar o cliente na API');
      const newClient = await response.json();
      setClients((currentClients) => [newClient, ...currentClients]);
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      Alert.alert('Erro', 'Não foi possível salvar o novo cliente.');
      return Promise.reject(error);
    }
  };

  const getClientById = (id: string): Cliente | undefined => {
    return clients.find((client) => client._id === id);
  };

  const getClientByCPF = (cpf: string): Cliente | undefined => {
    const cpfLimpo = cpf.replace(/[.-]/g, '');
    return clients.find((client) =>
      client?.cpf?.replace(/[.-]/g, '') === cpfLimpo
    );
  };

  const updateClient = async (id: string, clientData: Omit<Cliente, '_id'>) => {
    try {
      const response = await fetch(`${API_URL}/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) throw new Error('Falha ao atualizar o cliente na API');

      const updatedClient = await response.json();

      setClients((currentClients) =>
        currentClients.map((client) =>
          client._id === id ? updatedClient : client
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o cliente.');
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao eliminar o cliente na API');

      setClients((currentClients) =>
        currentClients.filter((client) => client._id !== id)
      );
    } catch (error) {
      console.error('Erro ao eliminar cliente:', error);
      Alert.alert('Erro', 'Não foi possível eliminar o cliente.');
    }
  };

  return (
    <ClientsContext.Provider
      value={{
        clients,
        addClient,
        getClientById,
        updateClient,
        deleteClient,
        getClientByCPF,
        refreshClients: fetchClients,
        isLoading
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClients deve ser usado dentro de um ClientsProvider');
  }
  return context;
}