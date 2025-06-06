import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// const lenis = new Lenis({
//   wrapper: scroller, // The element that will be scrolled
// })

// // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
// lenis.on('scroll', () => {
//   console.log(window.scrollY)
//   ScrollTrigger.update()
// })

// // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
// // This ensures Lenis's smooth scroll animation updates on each GSAP tick
// gsap.ticker.add((time) => {
//   lenis.raf(time * 1000) // Convert time from seconds to milliseconds
// })

// // Disable lag smoothing in GSAP to prevent any delay in scroll animations
// gsap.ticker.lagSmoothing(0)

export { gsap, ScrollTrigger, SplitText }
