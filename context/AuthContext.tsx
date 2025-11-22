import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/Api';

interface AuthContextData {
    user: {
        id: string;
        name: string;
        email: string;
        isAdmin: boolean;
    } | null;
    token: string | null;
    isLoading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signOut: () => Promise<void>;
    register: (name: string, email: string, pass: string) => Promise<string | void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    async function loadStorageData() {
        try {
            const storedToken = await SecureStore.getItemAsync('userToken');
            const storedUser = await SecureStore.getItemAsync('userData');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to load auth data', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function signIn(email: string, pass: string) {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login');
            }

            setToken(data.token);
            setUser(data.user);

            await SecureStore.setItemAsync('userToken', data.token);
            await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
        } catch (error) {
            throw error;
        }
    }

    async function register(name: string, email: string, pass: string) {
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password: pass }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao registrar');
            }

            // Registration successful but pending approval, do not auto-login
            return data.message;
        } catch (error) {
            throw error;
        }
    }

    async function signOut() {
        setUser(null);
        setToken(null);
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
