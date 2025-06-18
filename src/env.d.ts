declare module 'shader-park-core'

declare module '*.sp' {
  type UniformType = 'float' | 'vec2' | 'vec3' | 'vec4'

  type UniformValue =
    | number
    | { x: number; y: number }
    | { x: number; y: number; z: number }
    | { x: number; y: number; z: number; w: number }

  interface RawUniform {
    name: string
    type: UniformType
    value: UniformValue
  }

  interface ShaderParkShader {
    uniforms: RawUniform[]
    vert: string
    frag: string
  }

  const shader: ShaderParkShader
  export default shader
}
