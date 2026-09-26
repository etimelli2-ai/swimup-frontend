/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#59b3fc',
          500: '#3496f8',
          600: '#1d78ed',
          700: '#1561da',
          800: '#174fb1',
          900: '#19448b',
          950: '#142b57',
        },
        // Palette recolorée en "Action Blue" (style Apple) — remplace le bleu
        // par défaut sur TOUTES les classes sky-* déjà utilisées dans l'app,
        // sans toucher aux fichiers de pages.
        sky: {
          50:  '#eef6ff',
          100: '#dceaff',
          200: '#b3d4ff',
          300: '#7ab8ff',
          400: '#2997ff', // Sky Link Blue — utilisé pour les liens/accents en dark mode
          500: '#0066cc', // Action Blue — couleur d'accent unique de l'appli
          600: '#0071e3', // hover
          700: '#0058ab', // active
          800: '#0c2d5e',
          900: '#0c2d5e',
          950: '#071b3d',
        },
        // Neutres recalés sur les gris "ink" d'Apple pour le dark mode
        slate: {
          900: '#1d1d1f', // ink — fond dark mode
          800: '#272729', // surface-tile-1 — cards en dark mode
          700: '#3a3a3c', // bordures en dark mode
        },
      },
      fontFamily: {
        // Stack système : -apple-system résout vers San Francisco sur macOS/iOS
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      fontWeight: {
        // Échelle Apple stricte : 300 / 400 / 600 / 700 — le weight 500 n'existe pas
        // dans le système. On neutralise `font-medium` (utilisé 165x dans l'app)
        // en le faisant retomber sur 400 plutôt que de réécrire chaque fichier.
        medium: '400',
      },
      borderRadius: {
        // Échelle exacte du skill Apple : sm=8px (déjà le défaut Tailwind, utilité
        // compacte), md=11px (Pearl Button, rare), lg=18px (cards / utility-card),
        // pill/full=9999px (déjà géré par rounded-full nativement).
        md: '0.6875rem',  // 11px
        xl: '1.125rem',   // 18px — cards (product-tile / store-utility-card)
      },
      boxShadow: {
        // Apple ne pose jamais d'ombre sur les cards/boutons/texte —
        // l'ombre est réservée aux visuels produits, absents ici.
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
      },
    }
  },
  plugins: []
}
