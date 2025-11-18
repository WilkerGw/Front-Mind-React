import { Link, Tabs } from 'expo-router';
import React from 'react';
import { Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 1. Importamos o hook de insets

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  
  // 2. Obtemos as medidas da área segura do dispositivo
  const insets = useSafeAreaInsets(); 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 10, 
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarStyle: {
            // 3. CORREÇÃO CRÍTICA:
            // A altura agora é dinâmica: 60px base + a altura da barra do sistema (insets.bottom)
            height: Platform.select({
              ios: 60 + insets.bottom, // No iOS o sistema já gere bem, mas reforçamos
              android: 65 + insets.bottom, // No Android damos um pouco mais de espaço
              default: 60,
            }),
            // Adicionamos o padding inferior igual ao inset para empurrar os ícones para cima
            paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 8,
            paddingTop: 8, // Espaço extra no topo para equilíbrio
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          headerShown: false, 
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes', 
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
          headerShown: true, 
          headerRight: () => (
            <Link href="/add-client" asChild>
              <Pressable style={{ paddingRight: 16 }}>
                <IconSymbol size={26} name="plus.circle.fill" color={tintColor} />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="produtos"
        options={{
          title: 'Produtos', 
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="eyeglasses" color={color} />,
          headerShown: true, 
          headerRight: () => (
            <Link href="/add-product" asChild>
              <Pressable style={{ paddingRight: 16 }}>
                <IconSymbol size={26} name="plus.circle.fill" color={tintColor} />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="vendas"
        options={{
          title: 'Vendas', 
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="cart.fill" color={color} />,
          headerShown: true, 
          headerRight: () => (
            <Link href="/add-sale" asChild>
              <Pressable style={{ paddingRight: 16 }}>
                <IconSymbol size={26} name="cart.badge.plus" color={tintColor} />
              </Pressable>
            </Link>
          ),
        }}
      />
      
      {/* ABA DE RELATÓRIOS */}
      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios', 
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
          headerShown: true, 
        }}
      />

      <Tabs.Screen
        name="agendamentos"
        options={{
          title: 'Agenda', 
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="calendar" color={color} />,
          headerShown: true, 
          headerRight: () => (
            <Link href="/add-appointment" asChild>
              <Pressable style={{ paddingRight: 16 }}>
                <IconSymbol size={26} name="calendar.badge.plus" color={tintColor} />
              </Pressable>
            </Link>
          ),
        }}
      />
    </Tabs>
  );
}