import node from '@astrojs/node'
import react from '@astrojs/react'
import playformCompress from '@playform/compress'
import playformInline from '@playform/inline'
import tailwindcss from '@tailwindcss/vite'
import compressor from 'astro-compressor'
import { defineConfig } from 'astro/config'
import glsl from 'vite-plugin-glsl'

import pkg from './package.json'
import shaderPark from './vite/shader-park-vite-plugin'

export default defineConfig({
  trailingSlash: 'never',
  site: 'https://guillaumecatel.com',
  output: 'server',
  prefetch: {
    prefetchAll: true,
  },
  adapter: node({
    mode: 'middleware',
  }),
  integrations: [playformCompress({}), compressor(), playformInline(), react()],
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss(), shaderPark(), glsl({ minify: true })],
    optimizeDeps: {
      include: Object.keys(pkg.dependencies),
    },
  },

  build: {
    inlineStylesheets: 'always',
  },
  experimental: {
    fonts: [
      {
        provider: 'local',
        name: 'c',
        cssVariable: '--font-serif',
        optimizedFallbacks: false,
        fallbacks: [
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif',
        ],
        variants: [
          // {
          //   display: 'swap',
          //   weight: 700,
          //   style: 'normal',
          //   src: ['./src/assets/fonts/calendas_plus_bold-webfont.woff2'],
          // },
          // {
          //   display: 'swap',
          //   weight: 400,
          //   style: 'italic',
          //   src: ['./src/assets/fonts/calendas_plus_italic-webfont.woff2'],
          // },
          {
            display: 'swap',
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/calendas_plus-webfont.woff2'],
            unicodeRange: ['U+26'],
          },
        ],
      },
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
          {
            display: 'swap',
            weight: 700,
            style: 'normal',
            src: ['./src/assets/fonts/basiersquare-bold-webfont.woff2'],
          },
          {
            display: 'swap',
            weight: 700,
            style: 'italic',
            src: ['./src/assets/fonts/basiersquare-bolditalic-webfont.woff2'],
          },
          {
            display: 'swap',
            weight: 500,
            style: 'normal',
            src: ['./src/assets/fonts/basiersquare-medium-webfont.woff2'],
            unicodeRange: ['U+26'],
          },
          {
            display: 'swap',
            weight: 500,
            style: 'italic',
            src: ['./src/assets/fonts/basiersquare-mediumitalic-webfont.woff2'],
          },
          {
            display: 'swap',
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/basiersquare-regular-webfont.woff2'],
            unicodeRange: ['U+26'],
          },
          {
            display: 'swap',
            weight: 400,
            style: 'italic',
            src: [
              './src/assets/fonts/basiersquare-regularitalic-webfont.woff2',
            ],
          },
          {
            display: 'swap',
            weight: 600,
            style: 'normal',
            src: ['./src/assets/fonts/basiersquare-semibold-webfont.woff2'],
          },
          {
            display: 'swap',
            weight: 600,
            style: 'italic',
            src: [
              './src/assets/fonts/basiersquare-semibolditalic-webfont.woff2',
            ],
          },
        ],
      },
    ],
  },
})
