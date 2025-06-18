import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { type ReactNode, useRef } from 'react'

import Footer, { type FooterRefs } from './Footer'
import Header, { type HeaderRefs } from './Header'

interface WrapperProps {
  children?: ReactNode
}

gsap.registerPlugin(useGSAP)

const Wrapper = ({ children }: WrapperProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const headerRefs = useRef<HeaderRefs>(null)
  const footerRefs = useRef<FooterRefs>(null)

  useGSAP(
    () => {
      if (headerRefs.current && footerRefs.current && mainRef.current) {
        const { header } = headerRefs.current
        const { footer } = footerRefs.current
        // const main = mainRef.current

        const timeline = gsap.timeline()
        timeline.addLabel('start')

        timeline
          .fromTo(
            header,
            { y: -100, opacity: 0, autoAlpha: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              autoAlpha: 1,
              ease: 'power2.out',
            },
            'start',
          )
          .fromTo(
            footer,
            { y: 100, opacity: 0, autoAlpha: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              autoAlpha: 1,
              ease: 'power2.out',
            },
            'start',
          )
        // .fromTo(
        //   main,
        //   { opacity: 0, y: -100 },
        //   {
        //     opacity: 1,
        //     y: 0,
        //     duration: 0.5,
        //     autoAlpha: 1,
        //     ease: 'power2.out',
        //   },
        // )
      }
    },
    { scope: wrapperRef },
  )

  return (
    <div
      ref={wrapperRef}
      className=''>
      <Header ref={headerRefs} />
      <div ref={mainRef}>{children}</div>
      {/* <div className='min-h-[87.5lvh]'>
        <ContactForm actions={{ contact: 'toto' }} />
      </div> */}
      <Footer ref={footerRefs} />
    </div>
  )
}

export default Wrapper
