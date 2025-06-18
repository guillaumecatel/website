import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
} from 'react'

import CallToAction from '@/components/react/CallToAction'

export interface FooterRefs {
  footer: HTMLElement | null
}

const Footer = forwardRef<FooterRefs, HTMLAttributes<HTMLElement>>((_, ref) => {
  const footerRef = useRef<HTMLElement>(null)

  useImperativeHandle(ref, () => ({
    footer: footerRef.current,
  }))

  return (
    <footer
      ref={footerRef}
      className='fixed right-0 bottom-0 left-0'>
      <CallToAction />
    </footer>
  )
})

// const Footer = () => {
//   const $ui = useStore(animateUI)

//   const footer = useRef<HTMLElement>(null)

//   const inViewport = useInViewPort(footer, { threshold: 0.5 })

//   useLayoutEffect(() => {
//     $ui.flipLogo()
//   }, [inViewport])

//   return (
//     <footer
//       ref={footer}
//       className='relative flex min-h-[87.5lvh] snap-start flex-col'>
//       <CallToAction />
//     </footer>
//   )
// }

export default Footer
