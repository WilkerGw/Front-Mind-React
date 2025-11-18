import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';

// Ajuste o IP conforme sua rede
const API_URL = 'http://192.168.0.84:4000'; 

export const TIPOS_AGENDAMENTO = ['Exame de Vista', 'Retirada', 'Ajuste de Armação', 'Consulta'] as const;
export type TipoAgendamento = typeof TIPOS_AGENDAMENTO[number];

// Status disponíveis
export const STATUS_AGENDAMENTO = ['Marcado', 'Confirmado', 'Concluído', 'Cancelado'] as const;
export type StatusAgendamento = typeof STATUS_AGENDAMENTO[number];

// 1. Definição Atualizada do Agendamento
export type Agendamento = {
  _id: string; 
  clientId?: string; 
  tipo: TipoAgendamento; 
  date: Date; 
  observation?: string;
  status: StatusAgendamento;
  
  // NOVO CAMPO: Indica se o cliente comprou algo na visita
  madePurchase?: boolean;

  // Campos legados
  name?: string;
  telephone?: string;
};

type AppointmentsContextType = {
  appointments: Agendamento[];
  addAppointment: (appointmentData: Omit<Agendamento, '_id' | 'name' | 'telephone'>) => void;
  getAppointmentById: (id: string) => Agendamento | undefined; 
  // Atualizamos o tipo do update para aceitar qualquer campo parcial, incluindo madePurchase
  updateAppointment: (id: string, appointmentData: Partial<Omit<Agendamento, '_id' | 'clientId'>>) => Promise<void>; 
  deleteAppointment: (id: string) => Promise<void>; 
  isLoading: boolean;
};

// @ts-ignore
const AppointmentsContext = createContext<AppointmentsContextType>(null);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true); 
  const [appointments, setAppointments] = useState<Agendamento[]>([]); 

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/appointments`);
        if (!response.ok) throw new Error('Falha ao buscar agendamentos');
        
        let data: Agendamento[] = await response.json();
        
        data = data.map(appt => ({
          ...appt,
          date: new Date(appt.date), 
        }));
        
        setAppointments(data);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        // Não bloquear o app com alerta se for apenas erro de conexão inicial, mas logar
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const addAppointment = async (appointmentData: Omit<Agendamento, '_id' | 'name' | 'telephone'>) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) throw new Error('Falha ao salvar o agendamento');
      
      let newAppointment: Agendamento = await response.json();
      newAppointment.date = new Date(newAppointment.date); 
      
      setAppointments((current) => 
        [...current, newAppointment].sort((a, b) => a.date.getTime() - b.date.getTime())
      );
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o novo agendamento.');
    }
  };

  const getAppointmentById = (id: string): Agendamento | undefined => {
    return appointments.find((appt) => appt._id === id);
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Omit<Agendamento, '_id' | 'clientId'>>) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) throw new Error('Falha ao atualizar agendamento');
      
      let updatedAppointment: Agendamento = await response.json();
      updatedAppointment.date = new Date(updatedAppointment.date); 
      
      setAppointments((current) => 
        current.map((appt) => (appt._id === id ? updatedAppointment : appt))
               .sort((a, b) => a.date.getTime() - b.date.getTime())
      );
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o agendamento.');
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao eliminar agendamento');
      
      setAppointments((current) => 
        current.filter((appt) => appt._id !== id)
      );
    } catch (error) {
      console.error('Erro ao eliminar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível eliminar o agendamento.');
    }
  };

  return (
    <AppointmentsContext.Provider 
      value={{ appointments, addAppointment, getAppointmentById, updateAppointment, deleteAppointment, isLoading }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error('useAppointments deve ser usado dentro de um AppointmentsProvider');
  }
  return context;
}