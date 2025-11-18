/**
 * Uma paleta de cores moderna e profissional para Ótica.
 */
const tintColorLight = '#2563EB'; // Azul Royal moderno
const tintColorDark = '#60A5FA'; // Azul mais claro para dark mode

export const Colors = {
  light: {
    text: '#1E293B', // Cinza escuro (não preto puro) para leitura suave
    background: '#F1F5F9', // Cinza muito claro (quase branco) para o fundo da tela
    surface: '#FFFFFF', // Branco puro para cartões
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    border: '#E2E8F0', // Cor de bordas sutis
    success: '#10B981', // Verde Esmeralda
    danger: '#EF4444', // Vermelho suave
    warning: '#F59E0B', // Laranja/Amarelo
  },
  dark: {
    text: '#F8FAFC', // Branco quase puro
    background: '#0F172A', // Azul marinho muito escuro (Slate 900)
    surface: '#1E293B', // Azul acinzentado (Slate 800) para cartões
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    border: '#334155',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
  },
};