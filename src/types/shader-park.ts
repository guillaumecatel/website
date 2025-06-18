import { Vector2, Vector3, Vector4 } from 'three'

export type ThreeUniform = {
  [key: string]: {
    value: number | Vector2 | Vector3 | Vector4
  }
}

export type UniformType = 'float' | 'vec2' | 'vec3' | 'vec4'

export type UniformValue =
  | number
  | { x: number; y: number }
  | { x: number; y: number; z: number }
  | { x: number; y: number; z: number; w: number }

export interface RawUniform {
  name: string
  type: UniformType
  value: UniformValue
}

export interface ShaderParkShader {
  uniforms: RawUniform[]
  vert: string
  frag: string
}
