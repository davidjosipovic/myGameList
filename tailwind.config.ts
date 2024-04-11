import type { Config } from 'tailwindcss'
import { withUt } from "uploadthing/tw";

export default withUt({
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors:{
      'green-light':'#00FFA2',
      'green-dark':'#30BF8B',
      'red':'#FF2E00',
      'grey-light':'#1F1F1F',
      'grey-dark':'#1A1A1A',
      'white':'#D9D9D9'
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
});

