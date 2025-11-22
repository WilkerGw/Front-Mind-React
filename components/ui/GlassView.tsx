import React from 'react';
import { ViewStyle, StyleProp, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassViewProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    delay?: number;
}

export function GlassView({ children, style, intensity = 20, delay = 0 }: GlassViewProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const isDark = colorScheme === 'dark';

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.95, translateY: 10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{
                type: 'timing',
                duration: 600,
                delay: delay,
            }}
            style={[
                styles.container,
                {
                    backgroundColor: theme.glass.background,
                    borderColor: theme.glass.border,
                    shadowColor: theme.glass.shadow,
                },
                style,
            ]}
        >
            <BlurView
                intensity={Platform.OS === 'ios' ? intensity : intensity * 0.5}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />
            {children}
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4, // Android shadow
    },
});
