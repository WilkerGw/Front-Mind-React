import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Mapeamento de ícones
const MAPPING = {
  // Padrão
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'trash.fill': 'delete',
  'plus.circle.fill': 'add-circle',
  'xmark.circle.fill': 'close',
  
  // NOVOS ÍCONES (Adicionados para a Pesquisa)
  'magnifyingglass': 'search',
  'xmark.circle.fill': 'cancel', // Para o botão de limpar

  // App Específicos
  'person.2.fill': 'people',
  'eyeglasses': 'visibility',
  'cart.fill': 'shopping-cart',
  'cart.badge.plus': 'add-shopping-cart',
  'calendar': 'calendar-today',
  'calendar.badge.plus': 'event',
  'chart.bar.fill': 'bar-chart',
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}