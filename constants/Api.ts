import * as SecureStore from 'expo-secure-store';

export const API_URL = 'http://192.168.0.84:4000';

export const getAuthHeaders = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};
