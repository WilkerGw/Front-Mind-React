import * as SecureStore from 'expo-secure-store';

export const API_URL = `http://${process.env.REACT_NATIVE_API_URL || '10.0.2.2'}:4000`;

export const getAuthHeaders = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};
