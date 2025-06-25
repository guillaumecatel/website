import type { TransitionBeforePreparationEvent } from 'astro:transitions/client'

import type { Nullable } from '@/types/alias'
import { queryRequiredSelectors } from '@/utils/client/dom'
import { gsap } from '@/utils/client/gsap'

let ctx: Nullable<gsap.Context> = null
let timeline: Nullable<gsap.core.Timeline> = null
let isInitialized = false

export function useWrapperComponentAnimations() {
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
  const wrapper = document.querySelector('[data-component="Wrapper"]')
  if (!wrapper) return

  try {
    const selectors = queryRequiredSelectors(
      { selector: '[data-component="Wrapper"]', multiple: false },
      { selector: '[data-component="Header"]', multiple: false },
      { selector: '[data-component="Footer"]', multiple: false },
      { selector: '[data-component="Content"]', multiple: false },
    )
    const [wrapper, header, footer] = selectors

    ctx = gsap.context(() => {
      timeline = gsap.timeline()

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
    }, wrapper)
  } catch (e) {
    console.warn('Animation skipped:', e)
    destroy()
  }
}
