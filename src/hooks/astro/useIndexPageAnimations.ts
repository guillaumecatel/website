import type { TransitionBeforePreparationEvent } from 'astro:transitions/client'

import type { Nullable } from '@/types/alias'
import { queryRequiredSelectors } from '@/utils/client/dom'
import { gsap, ScrollSmoother, SplitText } from '@/utils/client/gsap'

let ctx: Nullable<gsap.Context> = null
let timeline: Nullable<gsap.core.Timeline> = null
let isInitialized = false

export function useIndexPageAnimations() {
  if (isInitialized) return
  isInitialized = true

  document.addEventListener('astro:after-swap', destroy)
  document.addEventListener('astro:before-preparation', beforeDestroy)
  document.addEventListener('astro:page-load', create)
}

function destroy() {
  if (ctx) {
    ctx.revert()
    ctx.kill()
    ctx = null
    timeline = null
  }
}

function beforeDestroy(event: TransitionBeforePreparationEvent) {
  const originalLoader = event.loader
  event.loader = async function () {
    if (!timeline || timeline.progress() === 0) {
      await originalLoader()
      return
    }

    await new Promise((resolve) => {
      timeline!.eventCallback('onReverseComplete', resolve)
      timeline!.reverse()
    })
    await originalLoader()
  }
}

function create() {
  const page = document.querySelector('[data-page="Index"]')
  if (!page) return

  try {
    const selectors = queryRequiredSelectors(
      { selector: '[data-page="Index"]', multiple: false },
      { selector: '[data-page-section="HeroInner"]', multiple: false },
      { selector: '[data-page-section="HeroHeading"]', multiple: false },
      { selector: '[data-page-section="HeroBaseline"]', multiple: false },
      { selector: '[data-page-section="HeroInfo"]', multiple: false },
      { selector: '[data-page-section="Showcase"]', multiple: false },
      { selector: '[data-page-section="ShowcaseItem"]', multiple: true },
    )

    const [
      index,
      heroInner,
      heroHeading,
      heroBaseline,
      heroInfo,
      showcase,
      showcaseItems,
    ] = selectors

    ctx = gsap.context(() => {
      ScrollSmoother.create({
        content: index,
        smooth: 1,
        effects: true,
        normalizeScroll: true,
        smoothTouch: true,
      })

      const heroHeadingSplit = SplitText.create(heroHeading)
      const heroBaselineSplit = SplitText.create(heroBaseline)

      timeline = gsap.timeline()

      timeline
        .fromTo(
          [heroHeading, heroBaseline],
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

        .from([heroHeadingSplit.words, heroBaselineSplit.lines], {
          y: '16px',
          filter: 'blur(4px)',
          opacity: 0,
          autoAlpha: 0,
          stagger: 0.05,
          duration: 0.5,
        })

        .fromTo(
          heroInfo,
          { y: 100, opacity: 0, autoAlpha: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            autoAlpha: 1,
            ease: 'power2.out',
          },
          'end',
        )

        .to(heroInner, {
          filter: 'blur(4px)',
          opacity: 0,
          scrollTrigger: {
            trigger: showcase,
            scrub: true,
            start: 'top bottom',
            end: 'center center',
          },
        })

      showcaseItems.forEach((item) => {
        gsap.to(item, {
          filter: 'blur(4px)',
          scrollTrigger: {
            trigger: item,
            scrub: true,
            start: 'top top',
          },
        })
      })
    }, index)
  } catch (e) {
    console.warn('Animation skipped:', e)
    destroy()
  }
}
