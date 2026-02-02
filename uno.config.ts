import { defineConfig, presetIcons, presetUno, presetAttributify, presetTypography } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    }),
    presetTypography()
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#0066cc',
        hover: '#0052a3',
        active: '#004080'
      }
    }
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'transition-base': 'transition-all duration-200 ease-in-out'
  }
});
