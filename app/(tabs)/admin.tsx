import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../constants/Api';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface User {
    _id: string;
    name: string;
    email: string;
}

export default function AdminScreen() {
    const { user, token } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const colors = Colors[theme];
    const router = useRouter();

    useEffect(() => {
        if (!user?.isAdmin) {
            Alert.alert('Acesso Negado', 'Você não tem permissão para acessar esta tela.');
            router.replace('/(tabs)');
            return;
        }
        fetchPendingUsers();
    }, [user]);

    const fetchPendingUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setPendingUsers(data);
            } else {
                Alert.alert('Erro', data.message || 'Falha ao buscar usuários pendentes');
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const approveUser = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/approve/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sucesso', `Usuário aprovado!`);
                fetchPendingUsers(); // Refresh list
            } else {
                Alert.alert('Erro', data.message || 'Falha ao aprovar usuário');
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro de conexão');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Aprovações Pendentes</Text>

            {pendingUsers.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="checkmark-circle-outline" size={64} color={colors.icon} />
                    <Text style={[styles.emptyText, { color: colors.icon }]}>Nenhum usuário pendente</Text>
                </View>
            ) : (
                <FlatList
                    data={pendingUsers}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                                <Text style={[styles.userEmail, { color: colors.icon }]}>{item.email}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.approveButton, { backgroundColor: colors.tint }]}
                                onPress={() => approveUser(item._id)}
                            >
                                <Text style={styles.approveButtonText}>Aprovar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    listContent: {
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    approveButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 12,
    },
    approveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 18,
    },
});
