import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useRef } from 'react'

gsap.registerPlugin(useGSAP)

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const graphicRef = useRef<HTMLDivElement>(null)

  const lastX = useRef<number>(window.innerWidth / 2)
  const lastY = useRef<number>(window.innerHeight / 2)

  useGSAP(
    (_, contextSafe) => {
      const cursor = cursorRef.current
      const graphic = graphicRef.current

      if (!contextSafe) return
      if (!cursor || !graphic) return

      gsap.set(cursor, {
        x: lastX.current,
        y: lastY.current,
        autoAlpha: 1,
      })

      const xTo = gsap.quickTo(cursor, 'x', {
        duration: 0.6,
        ease: 'power3',
      })

      const yTo = gsap.quickTo(cursor, 'y', {
        duration: 0.6,
        ease: 'power3',
      })

      const onMouseMove = contextSafe((e: MouseEvent) => {
        lastX.current = e.clientX
        lastY.current = e.clientY
        xTo(e.clientX)
        yTo(e.clientY)
      })

      const onMouseEnter = contextSafe(() => {
        graphic.classList.add('scale-50', 'bg-accent-50/100')
      })

      const onMouseLeave = contextSafe(() => {
        graphic.classList.remove('scale-50', 'bg-accent-50/100')
      })

      window.addEventListener('mousemove', onMouseMove)

      const selectors =
        'a, label, button, input, textarea, [role="button"], [role="link"]'
      const interactiveElements =
        document.querySelectorAll<HTMLElement>(selectors)

      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnter)
        el.addEventListener('mouseleave', onMouseLeave)
      })

      return () => {
        window.removeEventListener('mousemove', onMouseMove)
        interactiveElements.forEach((el) => {
          el.removeEventListener('mouseenter', onMouseEnter)
          el.removeEventListener('mouseleave', onMouseLeave)
        })
      }
    },
    { scope: cursorRef },
  )

  return (
    <div
      aria-hidden='true'
      className='pointer-events-none invisible fixed top-0 left-0 z-[9999] h-6 w-6 mix-blend-difference pointer-coarse:hidden noscript:hidden'
      ref={cursorRef}>
      <div
        className='bg-accent-50/0 ring-accent-50 absolute inset-0 -translate-1/2 rounded-full ring transition-transform'
        ref={graphicRef}
      />
    </div>
  )
}

export default Cursor
