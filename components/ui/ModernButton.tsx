import { TouchableOpacity, StyleSheet, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ModernButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  style?: ViewStyle;
};

export function ModernButton({ title, onPress, variant = 'primary', isLoading, style }: ModernButtonProps) {
  const theme = useColorScheme() ?? 'light';
  const colorScheme = Colors[theme];

  let backgroundColor = colorScheme.tint;
  let textColor = '#FFFFFF';
  let borderWidth = 0;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    backgroundColor = theme === 'dark' ? '#334155' : '#E2E8F0';
    textColor = colorScheme.text;
  } else if (variant === 'danger') {
    backgroundColor = colorScheme.danger;
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    textColor = colorScheme.tint;
    borderWidth = 1;
    borderColor = colorScheme.tint;
  }

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor, borderWidth, borderColor }, style]} 
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12, // Cantos mais arredondados
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    // Sombra sutil no iOS e Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});