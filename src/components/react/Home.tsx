import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'

import Section from './Section'

import type { Nullable } from '@/types/alias'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const heading =
  'Creative and technically versatile front-end developer with a strong background in software engineering and digital design.'
const baseline =
  'I craft engaging user experiences using modern JavaScript frameworks, creative coding, and thoughtful UI/UX design. With a strong engineering background and visual sensibility, I bring clarity, precision, and curiosity to every project.'
const socialLinks = [
  {
    name: 'Software engineering',
    url: 'https://instagram.com/guillaumecatel',
  },
  {
    name: 'UX/UI design',
    url: 'https://linkedin.com/in/guillaumecatel',
  },
  {
    name: 'Accessibility',
    url: 'https://github.com/guillaumecatel',
  },
  {
    name: 'Performances',
    url: 'https://github.com/guillaumecatel',
  },
]

const services = [
  {
    name: 'Startups',
  },
  {
    name: 'Tech companies',
  },
  {
    name: 'Design Studios',
  },
  {
    name: 'Advertising Agencies',
  },
]

const SectionWrapper = () => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<HTMLDivElement[]>([])

  useGSAP(
    () => {
      const wrapper = wrapperRef.current
      const sections = sectionRefs.current

      if (!wrapper) return
      if (!sections.length) return

      console.log(wrapper)
      console.log(sections)

      // gsap.fromTo(wrapper, { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: 0 })

      sections.forEach((section, i) => {
        gsap.to(section, {
          scrollTrigger: {
            trigger: section,
            markers: false,
            start: () =>
              section.offsetHeight < window.innerHeight
                ? `top top`
                : `bottom bottom`,
            pin: true,
            pinSpacing: false,
          },
        })
      })
    },
    { scope: wrapperRef },
  )

  const setRef = () => (el: Nullable<HTMLDivElement>) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el)
    }
  }

  return (
    <div
      className='relative'
      ref={wrapperRef}>
      <Section ref={setRef()}>
        <div className='relative flex min-h-full flex-col justify-end gap-12 px-3 pt-48 pb-36'>
          <div className='flex flex-col gap-6 font-serif text-pretty'>
            <div
              className='animate-text no-invisible font-sans text-lg font-light noscript:visible'
              data-zone='section'
              aria-hidden='true'
              data-animation='split-text-blurred'>
              {heading}
            </div>
            <p className='sr-only'>{heading}</p>
            <div
              className='text-md animate-text no-invisible pr-[8.333%] font-sans noscript:visible'
              data-zone='section'
              aria-hidden='true'
              data-animation='split-text-blurred'>
              {baseline}
            </div>
            <p className='sr-only'>{baseline}</p>
          </div>
          <hr
            className='border-accent-950/10 border-0 border-t'
            data-zone='separator'
          />
          <section className='grid grid-cols-12 gap-3'>
            <h2 className='sr-only'>Informations</h2>
            <div
              className='no-invisible col-span-6 flex flex-col gap-3 noscript:visible'
              data-zone='section'>
              <h3
                className='font-sans text-xs font-medium uppercase'
                data-animation='split-text-blurred'
                data-zone='section'>
                Specialized in
              </h3>
              <ul
                className='flex flex-col gap-1.5 font-sans text-sm'
                data-zone='section'>
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <span className='pointer-events-auto block'>
                      <span data-animation='split-text-blurred'>
                        {link.name}
                      </span>
                      <span className='sr-only'>{link.name}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className='col-span-6 flex flex-col gap-3'>
              <h3
                className='no-invisible font-sans text-xs font-medium uppercase noscript:visible'
                data-animation='split-text-blurred'
                data-zone='section'>
                Focused on
              </h3>
              <ul
                className='no-invisible flex flex-col gap-1.5 font-sans text-sm noscript:visible'
                data-zone='section'>
                {services.map((service) => (
                  <li key={service.name}>
                    <span className='pointer-events-auto block'>
                      <span data-animation='split-text-blurred'>
                        {service.name}
                      </span>
                      <span className='sr-only'>{service.name}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </Section>

      <Section ref={setRef()}>
        <div className='bg-accent-950 text-accent-50 relative mx-1.5 flex h-screen items-center justify-center rounded-t-4xl'>
          <p className='px-3'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            convallis leo dictum scelerisque fringilla. Nullam rutrum elit id
            nisl mattis scelerisque. Morbi non orci nibh. Aliquam sed elementum
            purus, vitae ultricies felis. Nullam ullamcorper gravida tortor, ut
            dictum turpis vehicula ut. Vestibulum dignissim imperdiet orci ac
            commodo. Aliquam blandit, nisi non cursus rhoncus, tortor diam
            posuere est, sed sodales mi urna vitae odio.
          </p>
        </div>
      </Section>

      <Section ref={setRef()}>
        <div className='bg-accent-950 text-accent-50 relative mx-1.5 flex min-h-screen items-center justify-center rounded-t-4xl'>
          <p className='px-3'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            convallis leo dictum scelerisque fringilla. Nullam rutrum elit id
            nisl mattis scelerisque. Morbi non orci nibh. Aliquam sed elementum
            purus, vitae ultricies felis. Nullam ullamcorper gravida tortor, ut
            dictum turpis vehicula ut. Vestibulum dignissim imperdiet orci ac
            commodo. Aliquam blandit, nisi non cursus rhoncus, tortor diam
            posuere est, sed sodales mi urna vitae odio.
          </p>
        </div>
      </Section>
      {/*
      <Section ref={setRef()}>
        <div className='bg-accent-950 text-accent-50 relative mx-1.5 flex min-h-screen items-center justify-center rounded-t-4xl'>
          <p className='px-3'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            convallis leo dictum scelerisque fringilla. Nullam rutrum elit id
            nisl mattis scelerisque. Morbi non orci nibh. Aliquam sed elementum
            purus, vitae ultricies felis. Nullam ullamcorper gravida tortor, ut
            dictum turpis vehicula ut. Vestibulum dignissim imperdiet orci ac
            commodo. Aliquam blandit, nisi non cursus rhoncus, tortor diam
            posuere est, sed sodales mi urna vitae odio.
          </p>
        </div>
      </Section>

      <Section ref={setRef()}>
        <div className='bg-accent-50/20 relative min-h-screen rounded-t-3xl shadow-2xl backdrop-blur-2xl'>
          <ContactForm actions={{ contact: '' }} />
        </div>
      </Section> */}
    </div>
  )
}

export default SectionWrapper
