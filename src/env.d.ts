declare module 'shader-park-core'

declare module '*.sp' {
  const shader: ShaderParkShader
  export default shader
}

declare type UniformType = 'float' | 'vec2' | 'vec3' | 'vec4'

declare type UniformValueMap = {
  float: number
  vec2: { x: number; y: number }
  vec3: { x: number; y: number; z: number }
  vec4: { x: number; y: number; z: number; w: number }
}

declare type UniformValue = UniformValueMap[UniformType]

declare interface RawUniform {
  name: string
  type: UniformType
  value: UniformValue
}

declare type ThreeUniformValue = number | Vector2 | Vector3 | Vector4

declare type ThreeUniform = {
  [key: string]: {
    value: ThreeUniformValue
  }
}

declare interface ShaderParkShader {
  uniforms: RawUniform[]
  vert: string
  frag: string
}
