// Sistema de colores pastel moderno para Hogar Conectado
export const COLORS = {
    // Colores principales pastel
    primary: '#a8b5ff',        // Azul lavanda suave
    primaryDark: '#8b99e8',    // Azul lavanda más intenso
    secondary: '#b8f5d1',      // Verde menta suave
    secondaryDark: '#9ae6b9',  // Verde menta más intenso
    accent: '#ffd6a8',         // Durazno suave
    accentDark: '#ffb380',     // Durazno más intenso

    // Fondos pastel
    background: '#faf8ff',     // Blanco con tinte violeta muy sutil
    surface: '#ffffff',       // Blanco puro
    cardBackground: '#f8faff', // Gris azulado muy claro

    // Textos
    text: '#4a5568',          // Gris azulado oscuro
    textSecondary: '#718096', // Gris azulado medio
    textLight: '#a0aec0',     // Gris azulado claro

    // Bordes y separadores
    border: '#e2e8f0',        // Gris azulado muy claro
    borderFocus: '#a8b5ff',   // Azul lavanda para focus

    // Estados
    success: '#b8f5d1',       // Verde menta
    warning: '#ffeaa8',       // Amarillo mantequilla
    error: '#ffb8b8',         // Rosa coral suave
    info: '#b8e6ff',          // Azul cielo suave

    // Sombras
    shadow: 'rgba(168, 181, 255, 0.15)', // Sombra azul lavanda suave
    shadowDark: 'rgba(168, 181, 255, 0.25)', // Sombra más intensa

    // Modal y overlays
    overlay: 'rgba(250, 248, 255, 0.95)', // Overlay con tinte violeta
    modalBackground: '#ffffff',
};

// Gradientes pastel
export const GRADIENTS = {
    primary: ['#a8b5ff', '#c8d0ff'],      // Azul lavanda degradado
    secondary: ['#b8f5d1', '#d0f9e0'],    // Verde menta degradado
    accent: ['#ffd6a8', '#ffe4c4'],       // Durazno degradado
    card: ['#ffffff', '#f8faff'],         // Blanco a gris azulado
    button: ['#a8b5ff', '#9bb0ff'],       // Botón principal
};

// Espaciado y radios
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

// Sombras predefinidas
export const SHADOWS = {
    sm: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 8,
    },
};
