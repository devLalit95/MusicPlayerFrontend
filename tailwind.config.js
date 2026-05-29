/* eslint-env node */
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'ping-slow': 'ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in-down': 'fade-in-down 0.8s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      }
    }
  }
}