/**
 * Uma paleta de cores moderna e profissional para Ótica com estilo Liquid Glass.
 */

const tintColorLight = '#2563EB';
const tintColorDark = '#60A5FA'; // Azul claro da imagem

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F1F5F9', // Slate 100
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    surface: '#FFFFFF',
    border: '#E2E8F0',
    gradient: ['#F8FAFC', '#E2E8F0'],
    glass: {
      background: 'rgba(255, 255, 255, 0.75)',
      border: 'rgba(255, 255, 255, 0.8)',
      shadow: 'rgba(37, 99, 235, 0.1)',
    },
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F172A', // Azul muito escuro (Slate 900)
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    surface: '#1E293B', // Slate 800
    border: '#334155',
    gradient: ['#0F172A', '#1E293B'], // Gradiente sutil escuro
    glass: {
      background: 'rgba(30, 41, 59, 0.7)', // Slate 800 com transparência
      border: 'rgba(148, 163, 184, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
};