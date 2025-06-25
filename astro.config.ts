import node from '@astrojs/node'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import compressor from 'astro-compressor'

import { defineConfig } from 'astro/config'

import shaderPark from './vite/shader-park-plugin'

export default defineConfig({
  trailingSlash: 'never',
  site: 'https://guillaumecatel.com',
  output: 'server',
  adapter: node({
    mode: 'middleware',
  }),
  devToolbar: { enabled: false },
  integrations: [playformCompress({}), compressor()],
  vite: {
    plugins: [tailwindcss(), shaderPark()],
  },
  redirects: {
    '/buy-me-a-beer': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  experimental: {
    fonts: [
      {
        provider: 'local',
        name: 'b',
        cssVariable: '--font-sans',
        fallbacks: [
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        variants: [
          // {
          //   display: 'swap',
          //   weight: 700,
          //   style: 'normal',
          //   src: ['./src/assets/fonts/basiersquare-bold-webfont.woff2'],
          // },
          // {
          //   display: 'swap',
          //   weight: 700,
          //   style: 'italic',
          //   src: ['./src/assets/fonts/basiersquare-bolditalic-webfont.woff2'],
          // },
          {
            display: 'swap',
            weight: 500,
            style: 'normal',
            src: ['./src/assets/fonts/basiersquare-medium-webfont.woff2'],
          },
          // {
          //   display: 'swap',
          //   weight: 500,
          //   style: 'italic',
          //   src: ['./src/assets/fonts/basiersquare-mediumitalic-webfont.woff2'],
          // },
          {
            display: 'swap',
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/basiersquare-regular-webfont.woff2'],
          },
          // {
          //   display: 'swap',
          //   weight: 400,
          //   style: 'italic',
          //   src: [
          //     './src/assets/fonts/basiersquare-regularitalic-webfont.woff2',
          //   ],
          // },
          // {
          //   display: 'swap',
          //   weight: 600,
          //   style: 'normal',
          //   src: ['./src/assets/fonts/basiersquare-semibold-webfont.woff2'],
          // },
          // {
          //   display: 'swap',
          //   weight: 600,
          //   style: 'italic',
          //   src: [
          //     './src/assets/fonts/basiersquare-semibolditalic-webfont.woff2',
          //   ],
          // },
        ],
      },
    ],
  },
})
