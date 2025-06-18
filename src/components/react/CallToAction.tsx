import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useRef } from 'react'

gsap.registerPlugin(useGSAP)

const CallToAction = () => {
  const callToAction = useRef<HTMLButtonElement>(null)

  useGSAP(
    () => {
      if (!callToAction.current) return

      gsap.fromTo(
        callToAction.current,
        { y: 100, opacity: 0, autoAlpha: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          autoAlpha: 1,
          ease: 'power2.out',
          delay: 0.2,
        },
      )
    },
    { scope: callToAction },
  )

  return (
    <button
      ref={callToAction}
      className='text-md bg-accent-950 text-accent-50 invisible fixed right-4 bottom-10 left-3 mx-auto h-12 max-w-2xl overflow-hidden rounded-full font-sans font-medium noscript:visible'
      type='submit'
      form='contact-form'>
      <span className='absolute top-0 right-0 left-0'>
        <span className='flex h-12 items-center justify-center'>
          Drop me a line
        </span>
        <span
          className='flex h-12 items-center justify-center'
          aria-hidden='true'>
          Drop it like it's hot
        </span>
      </span>
    </button>
  )
}

export default CallToAction
