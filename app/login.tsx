import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, register } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();
    const colors = Colors[theme];

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !name)) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
                router.replace('/(tabs)');
            } else {
                const message = await register(name, email, password);
                if (message) {
                    Alert.alert('Cadastro Realizado', message as string);
                    setIsLogin(true);
                }
            }
        } catch (error: any) {
            Alert.alert('Atenção', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[colors.background, colors.surface]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
                        <Ionicons name="glasses-outline" size={40} color={colors.tint} />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Minha Ótica
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {!isLogin && (
                        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Ionicons name="person-outline" size={20} color={colors.icon} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Nome"
                                placeholderTextColor={colors.icon}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    )}

                    <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="mail-outline" size={20} color={colors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Email"
                            placeholderTextColor={colors.icon}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Senha"
                            placeholderTextColor={colors.icon}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.tint }]}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {isLogin ? 'Entrar' : 'Cadastrar'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <Text style={[styles.switchText, { color: colors.icon }]}>
                            {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
                            <Text style={{ color: colors.tint, fontWeight: 'bold' }}>
                                {isLogin ? 'Cadastre-se' : 'Entre'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    switchText: {
        fontSize: 14,
    },
});
