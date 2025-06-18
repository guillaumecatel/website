import fs from 'fs'
import path from 'path'
import { sculptToThreeJSShaderSource } from 'shader-park-core'
import type { Plugin } from 'vite'

export default function preBuildShaderParkThreejs(): Plugin {
  return {
    name: 'prebuild-shader-park-threejs',
    resolveId(id) {
      if (id.endsWith('.sp')) {
        return id
      }
      return null
    },

    load(id) {
      if (id.endsWith('.sp')) {
        const filePath = path.resolve(id)
        const code = fs.readFileSync(filePath, 'utf-8')
        const glsl = sculptToThreeJSShaderSource(code)
        return `export default ${JSON.stringify(glsl)};`
      }
      return null
    },
  }
}
