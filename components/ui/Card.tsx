import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Card({ children, style, ...props }: ViewProps) {
  const theme = useColorScheme() ?? 'light';
  
  return (
    <View 
      style={[
        styles.card, 
        { backgroundColor: Colors[theme].surface, shadowColor: Colors[theme].text }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    // Sombra muito suave e moderna
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150, 0.1)'
  },
});