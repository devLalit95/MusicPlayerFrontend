/* Hex values mirror theme.css — avoids Tailwind CDN + CSS var opacity bugs */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        app: {
          base: '#0D0D1A',
          surface: '#13112B',
          card: '#1E1B35',
          elevated: '#2A1F50',
          hover: '#3B1F6A',
        },
        accent: {
          deep: '#5B21B6',
          DEFAULT: '#7C3AED',
          bright: '#9333EA',
          soft: '#C084FC',
          tint: '#E9D5FF',
        },
        cyan: {
          deep: '#0E7490',
          DEFAULT: '#06B6D4',
          light: '#67E8F9',
        },
        fg: {
          primary: '#F3EDFF',
          secondary: '#C4B5D4',
          muted: '#9B87C4',
          disabled: '#6B5F8A',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#8B5CF6',
      },
    },
  },
};
