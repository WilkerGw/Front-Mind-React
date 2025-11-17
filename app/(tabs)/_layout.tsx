import { Link, Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarButton: HapticTab,
        // Ajuste para 5 abas
        tabBarLabelStyle: {
          fontSize: 12, 
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          headerShown: false, 
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes', 
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
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
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="eyeglasses" color={color} />,
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
      {/* NOVA ABA DE VENDAS */}
      <Tabs.Screen
        name="vendas"
        options={{
          title: 'Vendas', 
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
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
      <Tabs.Screen
        name="agendamentos"
        options={{
          title: 'Agenda', 
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
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