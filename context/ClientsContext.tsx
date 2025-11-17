import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';

// O seu IP (sem mudanças)
const API_URL = 'http://192.168.0.84:4000'; 

// Tipos (sem mudanças)
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
  addClient: (clientData: Omit<Cliente, '_id'>) => void;
  getClientById: (id: string) => Cliente | undefined; 
  updateClient: (id: string, clientData: Omit<Cliente, '_id'>) => void; 
  deleteClient: (id: string) => void; 
  getClientByCPF: (cpf: string) => Cliente | undefined; 
  isLoading: boolean;
};

// @ts-ignore
const ClientsContext = createContext<ClientsContextType>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true); 
  const [clients, setClients] = useState<Cliente[]>([]); 

  // Buscar Clientes (sem mudanças)
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${API_URL}/api/clients`);
        if (!response.ok) throw new Error('Falha ao buscar dados da API');
        const data: Cliente[] = await response.json();
        setClients(data); 
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        Alert.alert('Erro de Conexão', 'Não foi possível buscar os clientes da API.');
      } finally {
        setIsLoading(false); 
      }
    };
    fetchClients();
  }, []); 

  // Adicionar Cliente (sem mudanças)
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
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      Alert.alert('Erro', 'Não foi possível salvar o novo cliente.');
    }
  };

  // Funções de busca local (sem mudanças)
  const getClientById = (id: string): Cliente | undefined => {
    return clients.find((client) => client._id === id);
  };
  const getClientByCPF = (cpf: string): Cliente | undefined => {
    const cpfLimpo = cpf.replace(/[.-]/g, '');
    return clients.find((client) => 
      client.cpf?.replace(/[.-]/g, '') === cpfLimpo
    );
  };

  // --- MUDANÇAS AQUI ---

  // 8. ATUALIZADO: updateClient (agora envia para a API)
  const updateClient = async (id: string, clientData: Omit<Cliente, '_id'>) => {
    try {
      const response = await fetch(`${API_URL}/api/clients/${id}`, { // Usa o ID na URL
        method: 'PUT', // Método PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o cliente na API');
      }
      
      const updatedClient = await response.json(); // O cliente atualizado

      // Atualiza o estado local
      setClients((currentClients) => 
        currentClients.map((client) => 
          client._id === id ? updatedClient : client // Substitui o cliente antigo pelo novo
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o cliente.');
    }
  };

  // 9. ATUALIZADO: deleteClient (agora envia para a API)
  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/clients/${id}`, { // Usa o ID na URL
        method: 'DELETE', // Método DELETE
      });

      if (!response.ok) {
        throw new Error('Falha ao eliminar o cliente na API');
      }

      // Remove o cliente do estado local
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
      value={{ clients, addClient, getClientById, updateClient, deleteClient, getClientByCPF, isLoading }}
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