type SelectorConfig = string | { selector: string; multiple?: boolean }

type ResolvedSelector<T extends SelectorConfig> = T extends { multiple: true }
  ? NodeListOf<Element>
  : Element

export function queryRequiredSelectors<
  const T extends readonly SelectorConfig[],
>(...configs: T): { [K in keyof T]: ResolvedSelector<T[K]> } {
  const elements = configs.map((config) => {
    const sel = typeof config === 'string' ? config : config.selector
    const isMultiple = typeof config === 'object' && config.multiple

    if (isMultiple) {
      const found = document.querySelectorAll(sel)
      return found.length > 0 ? found : null
    } else {
      return document.querySelector(sel)
    }
  })

  const missing = configs
    .map((c, i) => {
      const sel = typeof c === 'string' ? c : c.selector
      return elements[i] === null ? sel : null
    })
    .filter(Boolean)

  if (missing.length > 0) {
    throw new Error(`Missing required DOM element(s): ${missing.join(', ')}`)
  }

  return elements as { [K in keyof T]: ResolvedSelector<T[K]> }
}
