import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BackSide, MathUtils, type ShaderMaterial } from 'three'

import { uniformDescriptionToThreeJSFormat } from '@/utils/shader-park'

import useEventListener from '@/hooks/react/useEventListener'
import background from '../shader-park/Background.sp'

const Scene = () => {
  const material = useRef<ShaderMaterial>(null)
  const targetMouse = useRef({ x: 0, y: 0 })
  const currentMouse = useRef({ x: 0, y: 0 })

  const uniforms = useMemo(
    () => uniformDescriptionToThreeJSFormat(background.uniforms),
    [],
  )

  useThree(({ camera }) => {
    camera.position.z = 1
  })

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.uniforms.time.value = clock.getElapsedTime()

      currentMouse.current.x = MathUtils.lerp(
        currentMouse.current.x,
        targetMouse.current.x,
        0.075,
      )
      currentMouse.current.y = MathUtils.lerp(
        currentMouse.current.y,
        targetMouse.current.y,
        0.075,
      )

      material.current.uniforms.mouse.value.x = currentMouse.current.x
      material.current.uniforms.mouse.value.y = currentMouse.current.y
    }
  })

  useEventListener(
    'mousemove',
    (e) => {
      updatePointerPosition(e.clientX * 2, e.clientY * 2)
    },
    undefined,
    { passive: true },
  )

  useEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        updatePointerPosition(touch.clientX * 2, touch.clientY * 2)
      }
    },
    undefined,
    { passive: true },
  )

  function updatePointerPosition(x: number, y: number) {
    targetMouse.current.x = x / window.innerWidth
    targetMouse.current.y = y / window.innerWidth
  }

  return (
    <mesh>
      <sphereGeometry args={[12, 12, 12]} />
      <shaderMaterial
        fragmentShader={background.frag}
        ref={material}
        transparent={true}
        side={BackSide}
        uniforms={uniforms}
        vertexShader={background.vert}
      />
    </mesh>
  )
}

const Background = () => {
  const canvas = useRef<HTMLCanvasElement>(null)

  return (
    <div className='pointer-events-none fixed inset-0 -z-1'>
      <Canvas
        camera={{ fov: 75, zoom: 1, near: 0.1, far: 100 }}
        gl={{ preserveDrawingBuffer: true }}
        ref={canvas}
        eventSource={document.documentElement}
        className='absolute inset-0 z-0 scale-105 filter-[blur(4px)_hue-rotate(175deg)_brightness(1.1)]'>
        <Scene />
      </Canvas>
      <div className='absolute inset-0 z-1'></div>
      <div className='noise absolute inset-0 z-1 opacity-60'></div>
    </div>
  )
}

export default Background
