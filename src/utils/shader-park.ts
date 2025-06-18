import { Vector2, Vector3, Vector4 } from 'three'
import type {
  RawUniform,
  ThreeUniform,
  UniformType,
} from '../types/shader-park'

export function uniformDescriptionToThreeJSFormat(
  rawUniforms: RawUniform[],
): ThreeUniform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vectorConstructors: Record<UniformType, (v: any) => any> = {
    float: (v: number) => v,
    vec2: (v: { x: number; y: number }) => new Vector2(v.x, v.y),
    vec3: (v: { x: number; y: number; z: number }) =>
      new Vector3(v.x, v.y, v.z),
    vec4: (v: { x: number; y: number; z: number; w: number }) =>
      new Vector4(v.x, v.y, v.z, v.w),
  }

  return rawUniforms.reduce<ThreeUniform>((acc, { name, type, value }) => {
    acc[name] = { value: vectorConstructors[type](value) }
    return acc
  }, {})
}
